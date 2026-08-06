const fs = require('fs');
const path = require('path');
const os = require('os');
const { Storage } = require('/Users/manikantaamara/Desktop/Antigravity/Novels_dashboard/storage.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-test-'));
const dataDir = path.join(root, 'data');
const s = new Storage({ dataDir, backupDir: path.join(dataDir, 'backups') });

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
    if (cond) { pass++; console.log(`  ok  ${name}`); }
    else { fail++; console.log(`FAIL  ${name} ${extra}`); }
};

const novels = Array.from({ length: 100 }, (_, i) => ({ title: `Book ${i}`, rating: 4 }));

(async () => {
    console.log('\n1. first write + read');
    let r = await s.write('novels.json', novels);
    check('write ok', r.ok, JSON.stringify(r));
    check('reads back 100', s.read('novels.json').data.length === 100);

    console.log('\n2. normal edit is allowed, snapshots previous');
    r = await s.write('novels.json', [...novels, { title: 'New', rating: 5 }]);
    check('write ok', r.ok);
    check('snapshot taken', !!r.snapshot);
    check('now 101', s.read('novels.json').data.length === 101);

    console.log('\n3. destructive write refused');
    r = await s.write('novels.json', []);
    check('empty refused', !r.ok && r.code === 'DESTRUCTIVE_WRITE', JSON.stringify(r));
    check('data intact after refusal', s.read('novels.json').data.length === 101);
    r = await s.write('novels.json', novels.slice(0, 40));
    check('60% loss refused', !r.ok && r.code === 'DESTRUCTIVE_WRITE');
    r = await s.write('novels.json', novels.slice(0, 90));
    check('11% loss allowed', r.ok);

    console.log('\n4. forced destructive write goes through');
    r = await s.write('novels.json', [], { force: true });
    check('force ok', r.ok, JSON.stringify(r));
    check('file now empty', s.read('novels.json').data.length === 0);

    console.log('\n5. restore brings it back');
    const snaps = s.listBackups('novels.json');
    check('snapshots exist', snaps.length > 0);
    const target = snaps.find(b => {
        const d = JSON.parse(fs.readFileSync(path.join(dataDir, 'backups', b.name), 'utf8'));
        return d.length === 90;
    });
    const res = s.restore(target.name);
    check('restore ok', res.ok && res.records === 90, JSON.stringify(res));
    check('data back to 90', s.read('novels.json').data.length === 90);
    check('restore is undoable', !!res.undoSnapshot);

    console.log('\n6. corrupt file self-heals from snapshot');
    fs.writeFileSync(path.join(dataDir, 'novels.json'), '{"truncated": [1,2,3');
    const healed = s.read('novels.json');
    check('recovered flag', healed.recovered === true);
    check('records recovered', Array.isArray(healed.data) && healed.data.length > 0, `got ${healed.data && healed.data.length}`);
    check('corrupt quarantined', fs.readdirSync(path.join(dataDir, 'backups', 'corrupt')).length === 1);
    check('file on disk is valid again', JSON.parse(fs.readFileSync(path.join(dataDir, 'novels.json'), 'utf8')).length > 0);

    console.log('\n7. atomic write leaves no temp files');
    await s.write('novels.json', novels);
    check('no .tmp left behind', fs.readdirSync(dataDir).filter(f => f.endsWith('.tmp')).length === 0);

    console.log('\n8. concurrent writes serialise, last wins, none lost');
    await Promise.all([
        s.write('novels.json', novels.map(n => ({ ...n, tag: 'a' }))),
        s.write('novels.json', novels.map(n => ({ ...n, tag: 'b' }))),
        s.write('novels.json', novels.map(n => ({ ...n, tag: 'c' })))
    ]);
    const after = s.read('novels.json').data;
    check('100 records intact', after.length === 100);
    check('single consistent tag', new Set(after.map(n => n.tag)).size === 1, JSON.stringify([...new Set(after.map(n => n.tag))]));

    console.log('\n9. states.json shape counts records correctly');
    await s.write('states.json', { states: { AP: {}, TS: {}, KA: {} }, bucketList: ['Ladakh'] });
    check('counts 4', Storage.countRecords(s.read('states.json').data) === 4);
    r = await s.write('states.json', { states: {}, bucketList: [] });
    check('wiping states refused', !r.ok && r.code === 'DESTRUCTIVE_WRITE');

    console.log('\n10. pruning keeps recent, thins old');
    const bdir = path.join(dataDir, 'backups');
    const now = Date.now();
    for (let d = 1; d <= 40; d++) {
        for (let k = 0; k < 3; k++) {
            const name = `clothes.json.old-${d}-${k}.bak`;
            fs.writeFileSync(path.join(bdir, name), '[]');
            const t = new Date(now - d * 86400000 - k * 3600000);
            fs.utimesSync(path.join(bdir, name), t, t);
        }
    }
    const beforeCount = s.listBackups('clothes.json').length;
    fs.writeFileSync(path.join(dataDir, 'clothes.json'), JSON.stringify([{ item: 'shirt' }]));
    await s.write('clothes.json', [{ item: 'shirt' }, { item: 'jeans' }]);
    const afterCount = s.listBackups('clothes.json').length;
    check('pruned old snapshots', afterCount < beforeCount, `${beforeCount} -> ${afterCount}`);
    check('kept roughly daily+weekly', afterCount >= 30 && afterCount <= 45, `kept ${afterCount}`);

    console.log('\n11. status report');
    const st = s.status(['novels.json', 'states.json', 'clothes.json']);
    check('healthy', st.healthy === true, JSON.stringify(st.files));
    check('lastBackup present', !!st.lastBackup);

    console.log(`\n${pass} passed, ${fail} failed`);
    fs.rmSync(root, { recursive: true, force: true });
    process.exit(fail ? 1 : 0);
})();
