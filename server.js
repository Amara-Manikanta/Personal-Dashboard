const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit just in case
app.use(express.static(path.join(__dirname, '.'))); // Serve static files from root

// Helper to ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Helper to read JSON file
const readData = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${filename}:`, err);
        return null;
    }
};

// Helper to write JSON file
const writeData = (filename, data) => {
    const filePath = path.join(DATA_DIR, filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${filename}:`, err);
        return false;
    }
};

// --- Novels ---
app.get('/api/novels', (req, res) => {
    const data = readData('novels.json');
    res.json(data || []);
});

app.post('/api/novels', (req, res) => {
    const success = writeData('novels.json', req.body);
    if (success) res.json({ success: true });
    else res.status(500).json({ success: false, message: 'Failed to save novels' });
});

// --- States ---
app.get('/api/states', (req, res) => {
    const data = readData('states.json');
    res.json(data || {});
});

app.post('/api/states', (req, res) => {
    const success = writeData('states.json', req.body);
    if (success) res.json({ success: true });
    else res.status(500).json({ success: false, message: 'Failed to save states' });
});

// --- Writing ---
app.get('/api/writing', (req, res) => {
    const data = readData('writing.json');
    res.json(data || []);
});

app.post('/api/writing', (req, res) => {
    const success = writeData('writing.json', req.body);
    if (success) res.json({ success: true });
    else res.status(500).json({ success: false, message: 'Failed to save writing data' });
});

// --- Stories ---
// Assuming one file for all stories metadata/list
app.get('/api/stories', (req, res) => {
    const data = readData('stories.json');
    res.json(data || []);
});

app.post('/api/stories', (req, res) => {
    const success = writeData('stories.json', req.body);
    if (success) res.json({ success: true });
    else res.status(500).json({ success: false, message: 'Failed to save stories' });
});

// --- Authors ---
app.get('/api/authors', (req, res) => {
    const data = readData('authors.json');
    res.json(data || []);
});

app.post('/api/authors', (req, res) => {
    const success = writeData('authors.json', req.body);
    if (success) res.json({ success: true });
    else res.status(500).json({ success: false, message: 'Failed to save authors' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
