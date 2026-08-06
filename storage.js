/**
 * Durable JSON storage for the dashboard's data files.
 *
 * The rules that keep data alive:
 *   1. Writes are atomic — a crash can never leave a half-written file.
 *   2. Every write snapshots the previous contents first.
 *   3. A write that would destroy most of a file is refused unless forced.
 *   4. A corrupt file self-heals from the newest valid snapshot on read,
 *      so the app never loads empty and then saves that emptiness back.
 *   5. Snapshots are pruned on a tiered schedule instead of growing forever.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Retention: everything from the last 24h, then one per day for 30 days,
// then one per week forever. The newest few are always kept regardless.
const KEEP_ALL_WITHIN = DAY;
const KEEP_DAILY_WITHIN = 30 * DAY;
const ALWAYS_KEEP_NEWEST = 5;

// A write removing more than this fraction of records looks like a bug or a
// cleared-state race rather than an intentional edit.
const DESTRUCTIVE_LOSS_RATIO = 0.3;

class Storage {
    constructor({ dataDir, backupDir, quarantineDir, prune = true }) {
        this.dataDir = dataDir;
        this.backupDir = backupDir || path.join(dataDir, 'backups');
        this.quarantineDir = quarantineDir || path.join(this.backupDir, 'corrupt');
        this.pruneEnabled = prune;
        this.writeQueues = new Map(); // filename -> promise chain, serialises writes

        for (const dir of [this.dataDir, this.backupDir, this.quarantineDir]) {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        }
    }

    filePath(filename) {
        return path.join(this.dataDir, filename);
    }

    /** Number of records in a payload, for loss detection. */
    static countRecords(data) {
        if (data === null || data === undefined) return 0;
        if (Array.isArray(data)) return data.length;
        if (typeof data === 'object') {
            // states.json is { states: {...}, bucketList: [...] }
            if (data.states && typeof data.states === 'object') {
                return Object.keys(data.states).length + (data.bucketList || []).length;
            }
            return Object.keys(data).length;
        }
        return 1;
    }

    static checksum(text) {
        return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
    }

    // ---------------------------------------------------------------- reads

    /**
     * Read a data file. If it is missing or corrupt, recover from the newest
     * valid snapshot rather than returning nothing — returning nothing is what
     * lets the UI overwrite good data with an empty payload.
     */
    read(filename) {
        const filePath = this.filePath(filename);

        if (fs.existsSync(filePath)) {
            try {
                return { data: JSON.parse(fs.readFileSync(filePath, 'utf8')), recovered: false };
            } catch (err) {
                console.error(`[storage] ${filename} is corrupt: ${err.message}`);
                this.quarantine(filename);
            }
        }

        const recovered = this.readNewestValidBackup(filename);
        if (recovered) {
            console.warn(`[storage] recovered ${filename} from snapshot ${recovered.name}`);
            // Put the recovered contents back so the next write has a sane base.
            this.atomicWrite(filePath, recovered.text);
            return { data: recovered.data, recovered: true, from: recovered.name };
        }

        return { data: null, recovered: false };
    }

    /** Move an unparseable file aside so it is never silently overwritten. */
    quarantine(filename) {
        const src = this.filePath(filename);
        const dest = path.join(this.quarantineDir, `${filename}.${this.constructor.stamp()}.corrupt`);
        try {
            fs.copyFileSync(src, dest);
            console.warn(`[storage] quarantined corrupt ${filename} -> ${path.basename(dest)}`);
        } catch (err) {
            console.error(`[storage] could not quarantine ${filename}:`, err.message);
        }
    }

    /**
     * Newest snapshot that still holds records. An empty-but-valid snapshot is
     * only used as a last resort — healing a corrupt file into an empty one
     * would lose exactly the data this is meant to protect.
     */
    readNewestValidBackup(filename) {
        let emptyFallback = null;

        for (const entry of this.listBackups(filename)) {
            let text, data;
            try {
                text = fs.readFileSync(path.join(this.backupDir, entry.name), 'utf8');
                data = JSON.parse(text);
            } catch (err) {
                console.warn(`[storage] snapshot ${entry.name} is unreadable, trying older`);
                continue;
            }

            const candidate = { name: entry.name, text, data };
            if (Storage.countRecords(data) > 0) return candidate;
            if (!emptyFallback) emptyFallback = candidate;
        }

        return emptyFallback;
    }

    // --------------------------------------------------------------- writes

    /**
     * Serialise writes per file so two in-flight saves cannot interleave.
     */
    write(filename, data, { force = false } = {}) {
        const previous = this.writeQueues.get(filename) || Promise.resolve();
        const next = previous
            .catch(() => {})
            .then(() => this.writeNow(filename, data, { force }));
        this.writeQueues.set(filename, next);
        return next;
    }

    writeNow(filename, data, { force = false } = {}) {
        if (data === null || data === undefined) {
            return { ok: false, code: 'EMPTY_PAYLOAD', message: 'Refusing to write null/undefined' };
        }

        let text;
        try {
            text = JSON.stringify(data, null, 2);
        } catch (err) {
            return { ok: false, code: 'UNSERIALIZABLE', message: err.message };
        }

        const filePath = this.filePath(filename);
        const existing = fs.existsSync(filePath) ? this.read(filename).data : null;
        const before = Storage.countRecords(existing);
        const after = Storage.countRecords(data);

        // Guard: refuse writes that wipe out most of an existing file.
        if (!force && before > 0) {
            const lost = before - after;
            if (after === 0 || lost / before > DESTRUCTIVE_LOSS_RATIO) {
                return {
                    ok: false,
                    code: 'DESTRUCTIVE_WRITE',
                    message: `Write would drop ${lost} of ${before} records`,
                    before,
                    after
                };
            }
        }

        const snapshot = this.snapshot(filename);
        this.atomicWrite(filePath, text);
        const pruned = this.prune(filename);

        return {
            ok: true,
            before,
            after,
            snapshot,
            pruned,
            checksum: Storage.checksum(text)
        };
    }

    /**
     * Write via a temp file in the same directory, flush it to disk, then
     * rename over the target. Rename is atomic, so readers see either the old
     * file or the new one — never a truncated one.
     */
    atomicWrite(filePath, text) {
        const tmpPath = `${filePath}.${process.pid}.tmp`;
        const fd = fs.openSync(tmpPath, 'w');
        try {
            fs.writeFileSync(fd, text, 'utf8');
            fs.fsyncSync(fd); // durable before the rename
        } finally {
            fs.closeSync(fd);
        }
        fs.renameSync(tmpPath, filePath);
    }

    // -------------------------------------------------------------- backups

    static stamp(date = new Date()) {
        return date.toISOString().replace(/:/g, '-');
    }

    /** Copy the current contents aside before they are replaced. */
    snapshot(filename) {
        const src = this.filePath(filename);
        if (!fs.existsSync(src)) return null;

        const name = `${filename}.${Storage.stamp()}.bak`;
        try {
            fs.copyFileSync(src, path.join(this.backupDir, name));
            return name;
        } catch (err) {
            console.error(`[storage] snapshot failed for ${filename}:`, err.message);
            return null;
        }
    }

    /** Snapshots for one file (or all), newest first. */
    listBackups(filename = null) {
        let names;
        try {
            names = fs.readdirSync(this.backupDir);
        } catch (err) {
            return [];
        }

        return names
            .filter(n => n.endsWith('.bak') && (!filename || n.startsWith(`${filename}.`)))
            .map(n => {
                const full = path.join(this.backupDir, n);
                let stat;
                try {
                    stat = fs.statSync(full);
                } catch (err) {
                    return null;
                }
                return {
                    name: n,
                    file: n.split('.json.')[0] + '.json',
                    size: stat.size,
                    createdAt: stat.mtime.toISOString(),
                    createdMs: stat.mtimeMs
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.createdMs - a.createdMs);
    }

    /**
     * Tiered pruning: keep everything recent, thin older snapshots to one per
     * day, then one per week. Returns the names removed.
     */
    prune(filename) {
        if (!this.pruneEnabled) return [];

        const all = this.listBackups(filename);
        const now = Date.now();
        const keep = new Set();
        const seenBuckets = new Set();

        all.forEach((entry, index) => {
            const age = now - entry.createdMs;

            if (index < ALWAYS_KEEP_NEWEST || age <= KEEP_ALL_WITHIN) {
                keep.add(entry.name);
                return;
            }

            const bucket = age <= KEEP_DAILY_WITHIN
                ? `d:${Math.floor(entry.createdMs / DAY)}`
                : `w:${Math.floor(entry.createdMs / (7 * DAY))}`;

            if (!seenBuckets.has(bucket)) {
                seenBuckets.add(bucket);
                keep.add(entry.name);
            }
        });

        const removed = [];
        for (const entry of all) {
            if (keep.has(entry.name)) continue;
            try {
                fs.unlinkSync(path.join(this.backupDir, entry.name));
                removed.push(entry.name);
            } catch (err) {
                console.error(`[storage] could not prune ${entry.name}:`, err.message);
            }
        }
        return removed;
    }

    /** Restore a snapshot, taking a snapshot of the current state first. */
    restore(backupName) {
        const src = path.join(this.backupDir, path.basename(backupName));
        if (!fs.existsSync(src)) {
            return { ok: false, code: 'NOT_FOUND', message: `No snapshot named ${backupName}` };
        }

        const text = fs.readFileSync(src, 'utf8');
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            return { ok: false, code: 'CORRUPT_SNAPSHOT', message: err.message };
        }

        const filename = path.basename(backupName).split('.json.')[0] + '.json';
        const undo = this.snapshot(filename); // so a restore is itself undoable
        this.atomicWrite(this.filePath(filename), text);

        return {
            ok: true,
            file: filename,
            records: Storage.countRecords(data),
            undoSnapshot: undo
        };
    }

    /** Health summary for the dashboard. */
    status(files) {
        const backups = this.listBackups();
        const perFile = files.map(filename => {
            const filePath = this.filePath(filename);
            const exists = fs.existsSync(filePath);
            let records = 0;
            let healthy = false;

            if (exists) {
                try {
                    records = Storage.countRecords(JSON.parse(fs.readFileSync(filePath, 'utf8')));
                    healthy = true;
                } catch (err) {
                    healthy = false;
                }
            }

            const snaps = backups.filter(b => b.file === filename);
            return {
                file: filename,
                exists,
                healthy,
                records,
                snapshots: snaps.length,
                lastBackup: snaps.length ? snaps[0].createdAt : null,
                modifiedAt: exists ? fs.statSync(filePath).mtime.toISOString() : null
            };
        });

        return {
            files: perFile,
            totalSnapshots: backups.length,
            totalSnapshotBytes: backups.reduce((sum, b) => sum + b.size, 0),
            lastBackup: backups.length ? backups[0].createdAt : null,
            healthy: perFile.every(f => f.healthy)
        };
    }
}

module.exports = { Storage };
