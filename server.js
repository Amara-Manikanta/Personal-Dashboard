const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Storage } = require('./storage');

const app = express();
const PORT = 3010;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors({ exposedHeaders: ['X-Data-Version'] }));
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit just in case
// Serve static files from root. HTML/JSX/CSS are revalidated on every request:
// they are compiled in the browser, so a cached copy means edits appear not to
// take effect until a manual hard refresh.
app.use(express.static(path.join(__dirname, '.'), {
    setHeaders: (res, filePath) => {
        if (/\.(html|jsx|js|css)$/.test(filePath)) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Helper to ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Backup Configuration
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

// Uploads Configuration
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configuration: Allow Writes?
// You can change this to false to make the server Read-Only
const ENABLE_WRITES = true;

// Snapshot retention. With pruning on, the first save of each file thins its
// history to: everything from the last 24h, one per day for 30 days, one per
// week beyond that (newest 5 always kept). Set false to keep every snapshot
// forever — the old behaviour, which had grown to 388 files / 22MB.
const PRUNE_OLD_SNAPSHOTS = true;

const storage = new Storage({ dataDir: DATA_DIR, backupDir: BACKUP_DIR, prune: PRUNE_OLD_SNAPSHOTS });

const DATA_FILES = ['novels.json', 'states.json', 'writing.json', 'stories.json', 'authors.json', 'clothes.json'];

// Read a data file, self-healing from the newest snapshot if it is corrupt.
const readData = (filename) => storage.read(filename).data;

/**
 * Shared GET: returns the data and stamps the content version on the response.
 * Clients hand that version back when saving so a write built on stale data
 * can be rejected rather than silently overwriting newer changes.
 */
const handleRead = (filename, fallback) => (req, res) => {
    const data = readData(filename);
    res.setHeader('X-Data-Version', storage.version(filename));
    res.json(data || fallback);
};

/**
 * Shared handler: snapshot, validate, atomically write.
 *
 * A write that would drop most of the records is refused with 409 rather than
 * silently applied — pass ?force=1 to override once the caller has confirmed.
 */
const handleWrite = (filename, label) => async (req, res) => {
    if (!ENABLE_WRITES) {
        return res.status(403).json({ success: false, message: 'Server is in read-only mode' });
    }

    const force = req.query.force === '1' || req.query.force === 'true';
    const expectedVersion = req.get('X-Data-Version') || null;
    const result = await storage.write(filename, req.body, { force, expectedVersion });

    if (result.ok) {
        res.setHeader('X-Data-Version', result.version);
        return res.json({ success: true, records: result.after, snapshot: result.snapshot, version: result.version });
    }

    if (result.code === 'VERSION_CONFLICT') {
        return res.status(409).json({
            success: false,
            code: result.code,
            message: `${label} changed elsewhere since this page loaded. Reload before saving, or the other change would be lost.`,
            currentVersion: result.currentVersion
        });
    }

    if (result.code === 'DESTRUCTIVE_WRITE') {
        return res.status(409).json({
            success: false,
            code: result.code,
            message: `Refused: this would leave ${result.after} of ${result.before} ${label}. Retry with ?force=1 if intended.`,
            before: result.before,
            after: result.after
        });
    }

    return res.status(500).json({ success: false, code: result.code, message: result.message || `Failed to save ${label}` });
};

// --- Novels ---
app.get('/api/novels', handleRead('novels.json', []));

app.post('/api/novels', handleWrite('novels.json', 'novels'));

// --- States ---
app.get('/api/states', handleRead('states.json', {}));

app.post('/api/states', handleWrite('states.json', 'states'));

// --- Writing ---
app.get('/api/writing', handleRead('writing.json', []));

app.post('/api/writing', handleWrite('writing.json', 'writing entries'));

// --- Stories ---
// Assuming one file for all stories metadata/list
app.get('/api/stories', handleRead('stories.json', []));

app.post('/api/stories', handleWrite('stories.json', 'stories'));

// --- Authors ---
app.get('/api/authors', handleRead('authors.json', []));

app.post('/api/authors', handleWrite('authors.json', 'authors'));

// --- Clothes ---
app.get('/api/clothes', handleRead('clothes.json', []));

app.post('/api/clothes', handleWrite('clothes.json', 'clothes'));

// --- Backups ---
// Health summary: record counts, corrupt files, snapshot coverage.
app.get('/api/backups/status', (req, res) => {
    res.json(storage.status(DATA_FILES));
});

// Snapshot list, newest first. ?file=novels.json to scope it.
app.get('/api/backups', (req, res) => {
    res.json({ backups: storage.listBackups(req.query.file || null) });
});

// Contents of one snapshot, for previewing before a restore.
app.get('/api/backups/:name', (req, res) => {
    const name = path.basename(req.params.name);
    const filePath = path.join(BACKUP_DIR, name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Snapshot not found' });

    try {
        res.json({ success: true, name, data: JSON.parse(fs.readFileSync(filePath, 'utf8')) });
    } catch (err) {
        res.status(500).json({ success: false, message: `Snapshot is unreadable: ${err.message}` });
    }
});

// Restore a snapshot. The current contents are snapshotted first, so this is
// itself undoable via the returned undoSnapshot.
app.post('/api/backups/restore', (req, res) => {
    if (!ENABLE_WRITES) return res.status(403).json({ success: false, message: 'Server is in read-only mode' });

    const { name } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: 'Missing snapshot name' });

    const result = storage.restore(name);
    if (!result.ok) return res.status(result.code === 'NOT_FOUND' ? 404 : 500).json({ success: false, ...result });
    res.json({ success: true, ...result });
});

// --- Image Upload ---
app.post('/api/upload-image', (req, res) => {
    if (!ENABLE_WRITES) return res.status(403).json({ success: false, message: 'Read-only mode' });

    try {
        const { image, name } = req.body;
        if (!image || !name) return res.status(400).json({ success: false, message: 'Missing image data' });

        // Remove header if present (e.g., "data:image/jpeg;base64,")
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const timestamp = Date.now();
        const safeName = name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${timestamp}_${safeName}`;
        const filePath = path.join(UPLOADS_DIR, filename);

        fs.writeFileSync(filePath, buffer);

        res.json({ success: true, path: `uploads/${filename}` });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
