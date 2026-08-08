#!/usr/bin/env node
/**
 * One-off migration for data/states.json.
 *
 *   1. Legacy entries are bare strings ("Watch Tower") rather than objects, so
 *      they carry no city, category or notes and are invisible to the category
 *      filter. Convert them to objects, preserving the name verbatim.
 *   2. Some regions are keyed under a name that matches neither STATES_LIST nor
 *      COUNTRIES_LIST ("Gujrat" vs "Gujarat"), which hides their data from
 *      every screen. Merge those into the canonical key.
 *
 * Dry run by default; pass --apply to write. The server's storage layer is not
 * involved, so a timestamped backup is taken next to the file first.
 *
 *   node scripts/migrate-travel-data.js
 *   node scripts/migrate-travel-data.js --apply
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'states.json');
const APPLY = process.argv.includes('--apply');

// name in file -> canonical name
const KEY_FIXES = {
    'Gujrat': 'Gujarat',
    'Chattisgarh': 'Chhattisgarh'
};

const LIST_FIELDS = ['placesVisited', 'placesToVisit', 'restaurants', 'food', 'treks', 'stays', 'highlights'];

const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const states = raw.states || {};

const report = { converted: [], merged: [], removedEmpty: [] };

// ---- 1. strings -> objects -------------------------------------------------
for (const [region, data] of Object.entries(states)) {
    for (const field of LIST_FIELDS) {
        const list = data[field];
        if (!Array.isArray(list)) continue;

        data[field] = list.map(entry => {
            if (typeof entry !== 'string') return entry;
            const name = entry.trim();
            if (!name) return entry;

            report.converted.push(`${region}/${field}: "${name}"`);
            // Same shape the add form produces, so both paths agree.
            return { name, city: '-', remarks: '-', image: '' };
        });
    }
}

// ---- 2. merge misspelled region keys --------------------------------------
for (const [wrong, right] of Object.entries(KEY_FIXES)) {
    if (!states[wrong]) continue;

    const source = states[wrong];
    const itemCount = LIST_FIELDS.reduce((n, f) => n + ((source[f] || []).length), 0);

    if (itemCount === 0) {
        delete states[wrong];
        report.removedEmpty.push(wrong);
        continue;
    }

    const target = states[right] || {};
    LIST_FIELDS.forEach(field => {
        const incoming = source[field] || [];
        if (!incoming.length) return;

        const existing = target[field] || [];
        const seen = new Set(existing.map(e => String(e && e.name ? e.name : e).toLowerCase()));
        const added = incoming.filter(e => !seen.has(String(e && e.name ? e.name : e).toLowerCase()));

        target[field] = [...existing, ...added];
        if (added.length) report.merged.push(`${wrong} -> ${right} / ${field}: ${added.length}`);
    });

    target.visited = target.visited || source.visited;
    states[right] = target;
    delete states[wrong];
}

// ---- report ----------------------------------------------------------------
console.log(`\nString entries converted to objects: ${report.converted.length}`);
report.converted.slice(0, 10).forEach(l => console.log(`  ${l}`));
if (report.converted.length > 10) console.log(`  … and ${report.converted.length - 10} more`);

console.log(`\nMerged from misspelled keys: ${report.merged.length}`);
report.merged.forEach(l => console.log(`  ${l}`));

console.log(`\nEmpty stray keys removed: ${report.removedEmpty.length ? report.removedEmpty.join(', ') : 'none'}`);

if (!APPLY) {
    console.log('\nDry run — nothing written. Re-run with --apply to save.\n');
    process.exit(0);
}

const backup = `${DATA_FILE}.pre-migration.${new Date().toISOString().replace(/:/g, '-')}.bak`;
fs.copyFileSync(DATA_FILE, backup);

// Write atomically, same approach as the server's storage layer.
const tmp = `${DATA_FILE}.migrate.tmp`;
const fd = fs.openSync(tmp, 'w');
try {
    fs.writeFileSync(fd, JSON.stringify(raw, null, 2), 'utf8');
    fs.fsyncSync(fd);
} finally {
    fs.closeSync(fd);
}
fs.renameSync(tmp, DATA_FILE);

console.log(`\nWritten. Backup: ${path.basename(backup)}\n`);
