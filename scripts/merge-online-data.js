#!/usr/bin/env node
/**
 * Two-way merge of data/states.json against the copy committed on origin/main.
 *
 * The local file and the online one diverged: entries were added locally
 * (and regions reshuffled by "move to another state") while the hosted app
 * added entries of its own. A one-way push either way loses something, so
 * this unions them:
 *
 *   1. Entries present online but not locally are appended to the region
 *      they sit in online.
 *   2. For entries present in both, fields the online copy has and the local
 *      one lacks (or has empty) are filled in — so a visitedDate, rating or
 *      review added through the hosted app is not dropped.
 *
 * Local always wins on a genuine conflict: it is the copy with the most
 * recent editing. Matching is by normalised name within a region+field.
 *
 * Dry run by default; pass --apply to write.
 *
 *   node scripts/merge-online-data.js
 *   node scripts/merge-online-data.js --apply
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_FILE = path.join(__dirname, '..', 'data', 'states.json');
const REMOTE_REF = process.env.REMOTE_REF || 'origin/main:data/states.json';
const APPLY = process.argv.includes('--apply');

const FIELDS = ['placesVisited', 'placesToVisit', 'restaurants', 'food', 'treks', 'stays', 'highlights'];

const local = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const remote = JSON.parse(execSync(`git show ${REMOTE_REF}`).toString());

const rawName = (entry) => String(entry && typeof entry === 'object' ? entry.name : entry || '');
const norm = (entry) => rawName(entry).trim().toLowerCase().replace(/\s+/g, ' ');

// Secondary key with spacing and punctuation stripped, so an entry renamed
// locally ("Bakthangfalls" -> "Bakthang Falls") is recognised as the same
// entry rather than re-added from online as a duplicate.
const squash = (entry) => norm(entry).replace(/[^a-z0-9]/g, '');

const added = [];
const enriched = [];

// Index every local entry by name, across all regions, so an entry that was
// MOVED to another region locally is not re-added from its old region.
const localIndex = new Map();
for (const region of Object.keys(local.states || {})) {
    for (const field of FIELDS) {
        for (const entry of (local.states[region][field] || [])) {
            const n = norm(entry);
            if (!n) continue;
            const record = { region, field, entry };
            for (const key of [`${field}::${n}`, `${field}::~${squash(entry)}`]) {
                if (!localIndex.has(key)) localIndex.set(key, []);
                localIndex.get(key).push(record);
            }
        }
    }
}

for (const region of Object.keys(remote.states || {})) {
    for (const field of FIELDS) {
        for (const remoteEntry of (remote.states[region][field] || [])) {
            const name = norm(remoteEntry);
            if (!name) continue;

            const matches = localIndex.get(`${field}::${name}`)
                || localIndex.get(`${field}::~${squash(remoteEntry)}`);

            if (!matches || matches.length === 0) {
                // Entry exists online and nowhere locally — bring it across.
                if (!local.states[region]) {
                    local.states[region] = { visited: false, ...Object.fromEntries(FIELDS.map(f => [f, []])) };
                }
                local.states[region][field] = local.states[region][field] || [];
                local.states[region][field].push(remoteEntry);
                if (field === 'placesVisited') local.states[region].visited = true;
                added.push(`${region} / ${field} / ${remoteEntry && remoteEntry.name ? remoteEntry.name : remoteEntry}`);
                continue;
            }

            // Present in both: fill fields the local copy is missing.
            if (remoteEntry && typeof remoteEntry === 'object') {
                for (const target of matches) {
                    if (!target.entry || typeof target.entry !== 'object') continue;
                    for (const [k, v] of Object.entries(remoteEntry)) {
                        const localVal = target.entry[k];
                        const localEmpty = localVal === undefined || localVal === null || localVal === '' ||
                            (Array.isArray(localVal) && localVal.length === 0);
                        const remoteHas = v !== undefined && v !== null && v !== '' && v !== '-' &&
                            !(Array.isArray(v) && v.length === 0) && v !== 0 && v !== false;
                        if (localEmpty && remoteHas) {
                            target.entry[k] = v;
                            enriched.push(`${target.region} / ${target.field} / ${target.entry.name} · ${k}`);
                        }
                    }
                }
            }
        }
    }
}

const count = (obj) => Object.keys(obj.states || {})
    .reduce((n, r) => n + FIELDS.reduce((m, f) => m + ((obj.states[r][f] || []).length), 0), 0);

console.log(`\nEntries added from online: ${added.length}`);
added.forEach(a => console.log(`  + ${a}`));

console.log(`\nFields filled in on existing entries: ${enriched.length}`);
enriched.slice(0, 20).forEach(e => console.log(`  ~ ${e}`));
if (enriched.length > 20) console.log(`  … and ${enriched.length - 20} more`);

console.log(`\nTotal items — online: ${count(remote)} · local before merge: ${count(local) - added.length} · local after: ${count(local)}`);

if (!APPLY) {
    console.log('\nDry run — nothing written. Re-run with --apply to save.\n');
    process.exit(0);
}

const backup = `${DATA_FILE}.pre-merge.${new Date().toISOString().replace(/:/g, '-')}.bak`;
fs.copyFileSync(DATA_FILE, backup);

const tmp = `${DATA_FILE}.merge.tmp`;
const fd = fs.openSync(tmp, 'w');
try {
    fs.writeFileSync(fd, JSON.stringify(local, null, 2), 'utf8');
    fs.fsyncSync(fd);
} finally {
    fs.closeSync(fd);
}
fs.renameSync(tmp, DATA_FILE);

console.log(`\nWritten. Backup: ${path.basename(backup)}\n`);
