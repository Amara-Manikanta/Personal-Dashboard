/**
 * Stamps and coins — the physical collection.
 *
 * Unlike the other trackers, here the image IS the record: a stamp or coin
 * with no picture is barely worth logging. So the picture gets the care. It is
 * scaled down in the browser before upload (a phone photo is several MB and
 * this data folder lives in git), written to uploads/collection/ rather than
 * inlined as base64, and that folder is deliberately tracked so the collection
 * survives this laptop.
 *
 * Both kinds share one file, told apart by `type`. They describe the same
 * thing — a small object with a country, a year and a face value — so
 * splitting them would mean two of every filter, stat and save path.
 */

/**
 * What kind of issue a coin is. Coins only — a circulating ₹1 and a proof
 * commemorative sit side by side in a grid looking much alike, but they are
 * completely different things to collect, and every special edition is kept
 * as its own record rather than folded into a date run.
 *
 * Stamps deliberately have no equivalent: they are left exactly as they are.
 */
const COIN_KINDS = {
    circulating: { label: 'Circulating', icon: 'ph-arrows-left-right' },
    commemorative: { label: 'Commemorative', icon: 'ph-medal' },
    special: { label: 'Special edition', icon: 'ph-crown-simple' }
};

/**
 * Whether the coin is still money.
 *
 * A separate axis from the kind above: the kind says what a coin was struck
 * for, this says whether you could still spend it. Withdrawn means no longer
 * issued but not formally cancelled; demonetised means it has ceased to be
 * legal tender, as the 25 paise did in 2011.
 *
 * Condition — whether your particular specimen is worn or mint — is a third
 * axis again, and is deliberately not modelled here.
 */
const COIN_STATUS = {
    current: { label: 'Current', icon: 'ph-check-circle' },
    withdrawn: { label: 'Withdrawn', icon: 'ph-archive-box' },
    demonetised: { label: 'Demonetised', icon: 'ph-prohibit' }
};

/** A coin's issue kind, or '' when it is unset or the item is a stamp. */
const coinKindOf = (item) => {
    if (!item || (item.type || 'stamp') !== 'coin') return '';
    return COIN_KINDS[item.coinKind] ? item.coinKind : '';
};

/** A coin's legal-tender status, or '' when unset or the item is a stamp. */
const coinStatusOf = (item) => {
    if (!item || (item.type || 'stamp') !== 'coin') return '';
    return COIN_STATUS[item.coinStatus] ? item.coinStatus : '';
};

const COLLECTION_TYPES = {
    stamp: {
        label: 'Stamp',
        plural: 'Stamps',
        icon: 'ph-stamp',
        blurb: 'Click, drop or paste a photo of the stamp'
    },
    coin: {
        label: 'Coin',
        plural: 'Coins',
        icon: 'ph-coin',
        blurb: 'Click, drop or paste a photo of the coin'
    }
};

const COLLECTION_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

/** Month + year as two selects — matches the pickers used across Travel. */
/**
 * How many copies of one item you hold.
 *
 * A duplicate is the same stamp, not a second entry — spares are what you
 * trade with. Anything missing or nonsensical counts as one, so the records
 * added before this existed need no migrating.
 */
const quantityOf = (item) => {
    const n = Math.floor(Number(item && item.quantity));
    return isFinite(n) && n > 0 ? n : 1;
};

const CollectionMonthPicker = ({ value, onChange }) => {
    const { useState, useEffect } = React;

    const parse = (v) => {
        const parts = String(v || '').trim().match(/^(\d{4})-(\d{2})/);
        return { year: parts ? parts[1] : '', month: parts ? parts[2] : '' };
    };

    // Each half is local: deriving both from the combined value would wipe a
    // half-finished choice, since picking only a month emits ''.
    const [month, setMonth] = useState(parse(value).month);
    const [year, setYear] = useState(parse(value).year);

    useEffect(() => {
        const next = parse(value);
        setMonth(next.month);
        setYear(next.year);
    }, [value]);

    const thisYear = new Date().getFullYear();
    const years = [];
    for (let y = thisYear; y >= 1950; y--) years.push(String(y));

    const emit = (nextMonth, nextYear) => {
        setMonth(nextMonth);
        setYear(nextYear);
        onChange(nextMonth && nextYear ? `${nextYear}-${nextMonth}` : '');
    };

    return (
        <div className="coll-month-picker">
            <select aria-label="Month collected" value={month} onChange={(e) => emit(e.target.value, year)}>
                <option value="">Month</option>
                {COLLECTION_MONTHS.map((label, i) => (
                    <option key={label} value={String(i + 1).padStart(2, '0')}>{label}</option>
                ))}
            </select>
            <select aria-label="Year collected" value={year} onChange={(e) => emit(month, e.target.value)}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
    );
};

const formatCollected = (value) => {
    const m = String(value || '').trim().match(/^(\d{4})-(\d{2})/);
    if (!m) return '';
    const month = COLLECTION_MONTHS[Number(m[2]) - 1];
    return month ? `${month.slice(0, 3)} ${m[1]}` : m[1];
};

/**
 * Scale an image down and return a data URL.
 *
 * The canvas is painted white first: a transparent PNG re-encoded as JPEG
 * would otherwise come out on black, which looks like a ruined scan.
 */
const compressCollectionImage = (file, maxDim = 1600, quality = 0.85) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error(`${file.name} is not a readable image`));
        img.onload = () => {
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);

            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});

/**
 * Store one image and return the path to reference it by.
 *
 * On the hosted copy there is no upload endpoint, so the data URL is kept
 * inline — the item still shows rather than turning into a broken image.
 */
const storeCollectionImage = async (file) => {
    const dataUrl = await compressCollectionImage(file);
    if (!window.IS_LOCALHOST) return dataUrl;

    const base = (file.name || 'item').replace(/\.[^.]+$/, '');
    const res = await window.api.uploadImage({ image: dataUrl, name: `${base}.jpg`, folder: 'collection' });
    return (res && res.path) ? res.path : dataUrl;
};

/**
 * Every picture of one item, cover first, as { url, kind }.
 *
 * Items carry a list — a coin needs its obverse and reverse, and a stamp is
 * often worth keeping twice: the original scan, and a cleaned-up or generated
 * version of it. Which is which is recorded rather than inferred, so the
 * original is never quietly replaced by a prettier copy of itself.
 *
 * Three shapes are read: the list of objects written now, a list of bare
 * strings, and the single `image` field that came first. Nothing needs
 * migrating.
 */
const IMAGE_KINDS = {
    original: { label: 'Original', icon: 'ph-camera' },
    generated: { label: 'Generated', icon: 'ph-sparkle' }
};

const imagesOf = (item) => {
    if (!item) return [];

    const raw = Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
    return raw
        .map(entry => {
            if (!entry) return null;
            if (typeof entry === 'string') return { url: entry, kind: 'original' };
            if (!entry.url) return null;
            return { url: entry.url, kind: IMAGE_KINDS[entry.kind] ? entry.kind : 'original' };
        })
        .filter(Boolean);
};

/**
 * The picture the card shows: simply the first one.
 *
 * Preferring an original here would quietly override the editor's own "make
 * cover" control — promote a restored version to the front and the card would
 * still show the scan. The card marks a generated cover with a badge instead,
 * so the choice stays visible rather than being second-guessed.
 */
const coverOf = (item) => imagesOf(item)[0] || null;

/**
 * Give a stamp's mount the proportions of the stamp inside it.
 *
 * Stamps are issued portrait, landscape and square, so one fixed box either
 * crops the odd ones out or floats them in dead space. The natural size is
 * only known once the image has loaded, hence doing it here rather than in
 * CSS. Written straight to the node: React never sets an inline style on the
 * mount, so there is nothing for this to fight with, and routing it through
 * state would re-render the whole album once per image.
 *
 * The ratio is applied to the border box, which includes the mount's padding,
 * so the picture can sit a few pixels off-centre of its margin on the most
 * elongated stamps. Correcting that exactly needs the rendered size, which is
 * what the ratio decides — so it is left alone: `contain` keeps the stamp
 * undistorted either way, and the slight extra edge reads as mount margin.
 */
const applyMountShape = (img) => {
    const mount = img && img.parentElement;
    if (!mount || !img.naturalWidth || !img.naturalHeight) return;
    mount.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
};

const shapeMount = (e) => applyMountShape(e.currentTarget);

/**
 * A cached image can already be decoded before React attaches onLoad, and that
 * load event is gone for good — the stamp would keep the placeholder square.
 * The ref catches that case; onLoad still covers images fetched over the wire.
 */
const shapeMountRef = (img) => {
    if (img && img.complete) applyMountShape(img);
};

/** A filename is a reasonable first guess: "india_1975_tiger" → "India 1975 Tiger". */
const nameFromFile = (file) => (file.name || 'Untitled')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, c => c.toUpperCase());

window.CollectionDashboard = ({ onBackToHome }) => {
    const { useState, useEffect, useMemo, useRef, useCallback } = React;

    const [items, setItems] = useState(window.collectiblesData || []);
    const [tab, setTab] = useState('stamp');          // 'stamp' | 'coin' | 'all'
    const [query, setQuery] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [sortBy, setSortBy] = useState('added-newest');
    // 'none' | 'country' | 'kind' — one setting, so the two grouping controls
    // cannot both be on and disagree about how the album is split.
    const [groupBy, setGroupBy] = useState('none');
    const [kindFilter, setKindFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [onlyIncomplete, setOnlyIncomplete] = useState(false);

    const [editing, setEditing] = useState(null);     // item being edited, or a {type} seed
    const [lightboxId, setLightboxId] = useState(null);
    const [photoIndex, setPhotoIndex] = useState(0);   // which photo of that item
    const [busy, setBusy] = useState('');
    const [toast, setToast] = useState(null);

    const bulkInputRef = useRef(null);

    const say = (message, tone = 'info') => {
        setToast({ message, tone });
        window.setTimeout(() => setToast(t => (t && t.message === message ? null : t)), 4000);
    };

    /**
     * Persist and keep the in-memory copy in step.
     *
     * The save is awaited before the UI settles: a rejected write (the server
     * refuses one built on stale data) must not leave the screen showing a
     * change that never reached disk.
     */
    const persist = useCallback(async (next, { successMessage } = {}) => {
        const previous = items;
        setItems(next);
        window.collectiblesData = next;
        try {
            await window.api.saveCollectibles(next);
            if (successMessage) say(successMessage, 'success');
            return true;
        } catch (err) {
            console.error('Failed to save collection:', err);
            setItems(previous);
            window.collectiblesData = previous;
            if (String(err && err.message) !== 'VERSION_CONFLICT') {
                say('Could not save — your change was rolled back.', 'error');
            }
            return false;
        }
    }, [items]);

    // Legacy records predate coins and are stamps by definition.
    const typeOf = (item) => item.type || 'stamp';
    const inTab = useCallback((item) => tab === 'all' || typeOf(item) === tab, [tab]);
    const isIncomplete = (item) => !item.country || !item.year;

    const scoped = useMemo(() => items.filter(inTab), [items, inTab]);

    const countries = useMemo(() => {
        const set = new Set();
        scoped.forEach(s => { if (s.country) set.add(s.country); });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [scoped]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();

        const matches = scoped.filter(s => {
            if (countryFilter && s.country !== countryFilter) return false;
            if (kindFilter && coinKindOf(s) !== kindFilter) return false;
            if (statusFilter && coinStatusOf(s) !== statusFilter) return false;
            if (onlyIncomplete && !isIncomplete(s)) return false;
            if (!q) return true;
            const kindLabel = coinKindOf(s) ? COIN_KINDS[coinKindOf(s)].label : '';
            const statusLabel = coinStatusOf(s) ? COIN_STATUS[coinStatusOf(s)].label : '';
            return [s.name, s.country, s.year, s.denomination, s.material, s.notes, kindLabel, statusLabel]
                .filter(Boolean)
                .some(v => String(v).toLowerCase().includes(q));
        });

        const byYear = (a, b) => (Number(a.year) || 0) - (Number(b.year) || 0);
        const sorters = {
            'added-newest': (a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')),
            'added-oldest': (a, b) => String(a.addedAt || '').localeCompare(String(b.addedAt || '')),
            'year-oldest': byYear,
            'year-newest': (a, b) => byYear(b, a),
            'country': (a, b) => (a.country || 'zzz').localeCompare(b.country || 'zzz') || byYear(a, b),
            'name': (a, b) => (a.name || '').localeCompare(b.name || '')
        };

        return matches.slice().sort(sorters[sortBy] || sorters['added-newest']);
    }, [scoped, query, countryFilter, kindFilter, statusFilter, sortBy, onlyIncomplete]);

    // One flat grid, or split by country or coin kind — always the same shape
    // out, so the renderer stays simple.
    const groups = useMemo(() => {
        if (groupBy === 'none') return [{ key: '__all__', label: null, items: visible }];

        // Whatever has no value sorts last under a named heading rather than
        // vanishing into an unlabelled block.
        const spare = groupBy === 'kind' ? 'Unspecified' : 'Unattributed';
        const labelFor = (s) => (groupBy === 'kind'
            ? (coinKindOf(s) ? COIN_KINDS[coinKindOf(s)].label : spare)
            : (s.country || spare));

        // Kinds read best in their own order — everyday coins, then the ones
        // struck for a reason — rather than alphabetically.
        const kindOrder = Object.values(COIN_KINDS).map(k => k.label);
        const rank = (label) => {
            if (label === spare) return Infinity;
            const at = groupBy === 'kind' ? kindOrder.indexOf(label) : -1;
            return at === -1 ? 0 : at;
        };

        const map = new Map();
        visible.forEach(s => {
            const key = labelFor(s);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(s);
        });

        return Array.from(map.entries())
            .sort((a, b) => (rank(a[0]) - rank(b[0])) || a[0].localeCompare(b[0]))
            .map(([label, list]) => ({ key: label, label, items: list }));
    }, [visible, groupBy]);

    const stats = useMemo(() => {
        const years = scoped.map(s => Number(s.year)).filter(y => y > 0);
        // Distinct entries is the headline — "how many different stamps do I
        // have" — with the copy count alongside only when the two differ.
        const copies = scoped.reduce((sum, item) => sum + quantityOf(item), 0);
        return {
            total: scoped.length,
            copies,
            spares: copies - scoped.length,
            stamps: items.filter(i => typeOf(i) === 'stamp').length,
            coins: items.filter(i => typeOf(i) === 'coin').length,
            countries: countries.length,
            oldest: years.length ? Math.min(...years) : null,
            newest: years.length ? Math.max(...years) : null,
            incomplete: scoped.filter(isIncomplete).length
        };
    }, [items, scoped, countries]);

    /** Several files at once — one item per file, details filled in later. */
    const handleBulkFiles = async (fileList, type) => {
        const files = Array.from(fileList || []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;

        const created = [];
        const failed = [];
        for (let i = 0; i < files.length; i++) {
            setBusy(`Adding ${COLLECTION_TYPES[type].label.toLowerCase()} ${i + 1} of ${files.length}…`);
            try {
                const image = await storeCollectionImage(files[i]);
                created.push({
                    id: `${Date.now()}-${i}`,
                    type,
                    name: nameFromFile(files[i]),
                    country: '', year: '', denomination: '', material: '', dateCollected: '', notes: '',
                    images: [{ url: image, kind: 'original' }],
                    addedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error(err);
                failed.push(files[i].name);
            }
        }
        setBusy('');

        if (!created.length) {
            say('None of those files could be read as images.', 'error');
            return;
        }

        const saved = await persist([...created, ...items]);
        if (saved) {
            const noun = created.length === 1
                ? COLLECTION_TYPES[type].label.toLowerCase()
                : COLLECTION_TYPES[type].plural.toLowerCase();
            say(
                failed.length
                    ? `Added ${created.length} ${noun}. ${failed.length} could not be read.`
                    : `Added ${created.length} ${noun} — add their country and year next.`,
                failed.length ? 'warn' : 'success'
            );
            setOnlyIncomplete(true);
        }
    };

    const handleDelete = async (item) => {
        const kind = COLLECTION_TYPES[typeOf(item)].label.toLowerCase();
        if (!window.confirm(`Remove “${item.name || `this ${kind}`}” from the collection?`)) return;
        // The uploaded file is left on disk on purpose: deleting a record is a
        // one-click action, and an orphaned image is far cheaper to clean up
        // later than a photo that cannot be got back.
        await persist(items.filter(s => s.id !== item.id), { successMessage: `${COLLECTION_TYPES[typeOf(item)].label} removed.` });
    };

    /**
     * Lightbox keys, on two axes: left/right steps through the album, up/down
     * through the photos of the item you are looking at. Keeping them apart
     * means browsing the collection never lands you on the back of a coin
     * wondering which one it belongs to.
     */
    useEffect(() => {
        if (lightboxId === null) return;

        const onKey = (e) => {
            if (e.key === 'Escape') { setLightboxId(null); return; }

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                const pics = imagesOf(items.find(s => s.id === lightboxId));
                if (pics.length < 2) return;
                e.preventDefault();
                setPhotoIndex(i => (e.key === 'ArrowDown' ? (i + 1) % pics.length : (i - 1 + pics.length) % pics.length));
                return;
            }

            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const order = visible.map(s => s.id);
            const at = order.indexOf(lightboxId);
            if (at === -1) return;
            const next = e.key === 'ArrowRight' ? at + 1 : at - 1;
            if (next >= 0 && next < order.length) {
                setLightboxId(order[next]);
                setPhotoIndex(0);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxId, visible, items]);

    /**
     * Make sure a just-saved item is actually on screen.
     *
     * The filters are sticky — the "needs details" one switches itself on after
     * a bulk upload — so saving a fully-filled item could drop it straight out
     * of view and leave "Nothing matches" as the only feedback.
     */
    const revealItem = (item) => {
        const kind = typeOf(item);
        if (tab !== 'all' && tab !== kind) setTab(kind);
        if (onlyIncomplete && !isIncomplete(item)) setOnlyIncomplete(false);
        if (countryFilter && item.country !== countryFilter) setCountryFilter('');
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            const hit = [item.name, item.country, item.year, item.denomination, item.material, item.notes]
                .filter(Boolean)
                .some(v => String(v).toLowerCase().includes(q));
            if (!hit) setQuery('');
        }
    };

    const lightboxItem = lightboxId !== null ? items.find(s => s.id === lightboxId) : null;
    const activeType = tab === 'all' ? null : COLLECTION_TYPES[tab];

    // The kind controls only make sense where coins are on screen, so on the
    // Stamps tab the toolbar is exactly what it was.
    const showCoinControls = tab === 'coin' || (tab === 'all' && stats.coins > 0);

    return (
        <div className="coll-dashboard">
            <header className="coll-header">
                <div className="coll-header-left">
                    <button className="coll-back" onClick={onBackToHome} aria-label="Back to home">
                        <i className="ph-bold ph-arrow-left"></i>
                    </button>
                    <div>
                        <h1>My <span className="coll-accent">Collection</span></h1>
                        <p>Stamps and coins, catalogued and backed up</p>
                    </div>
                </div>

                <div className="coll-header-actions">
                    <div className="coll-search">
                        <i className="ph-bold ph-magnifying-glass"></i>
                        <input
                            type="text"
                            placeholder="Search name, country, notes…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    {activeType && (
                        <button className="coll-btn-ghost" onClick={() => bulkInputRef.current && bulkInputRef.current.click()}>
                            <i className="ph-bold ph-upload-simple"></i> Upload many
                        </button>
                    )}

                    {tab === 'all' ? (
                        <>
                            <button className="coll-btn-ghost" onClick={() => setEditing({ type: 'stamp' })}>
                                <i className="ph-bold ph-stamp"></i> Add Stamp
                            </button>
                            <button className="coll-btn" onClick={() => setEditing({ type: 'coin' })}>
                                <i className="ph-bold ph-coin"></i> Add Coin
                            </button>
                        </>
                    ) : (
                        <button className="coll-btn" onClick={() => setEditing({ type: tab })}>
                            <i className="ph-bold ph-plus"></i> Add {activeType.label}
                        </button>
                    )}

                    <input
                        ref={bulkInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => {
                            if (tab !== 'all') handleBulkFiles(e.target.files, tab);
                            e.target.value = '';
                        }}
                    />
                </div>
            </header>

            <div className="coll-tabs" role="tablist">
                {[
                    ['stamp', 'ph-stamp', 'Stamps', stats.stamps],
                    ['coin', 'ph-coin', 'Coins', stats.coins],
                    ['all', 'ph-squares-four', 'Everything', items.length]
                ].map(([id, icon, label, count]) => (
                    <button
                        key={id}
                        role="tab"
                        aria-selected={tab === id}
                        className={`coll-tab ${tab === id ? 'is-active' : ''}`}
                        onClick={() => {
                            setTab(id);
                            setCountryFilter('');
                            // Coin-only state would otherwise keep filtering a
                            // tab whose controls are no longer shown.
                            if (id === 'stamp') {
                                setKindFilter('');
                                setStatusFilter('');
                                setGroupBy(g => (g === 'kind' ? 'none' : g));
                            }
                        }}
                    >
                        <i className={`ph-fill ${icon}`}></i>
                        {label}
                        <span>{count}</span>
                    </button>
                ))}
            </div>

            <div className="coll-stats">
                <div className="coll-stat">
                    <div className="coll-stat-icon total">
                        <i className={`ph-fill ${activeType ? activeType.icon : 'ph-archive'}`}></i>
                    </div>
                    <div>
                        <span className="coll-stat-label">{activeType ? activeType.plural : 'Items'}</span>
                        <span className="coll-stat-value">{stats.total}</span>
                        {stats.spares > 0 && (
                            <span className="coll-stat-note">
                                {stats.copies} counting {stats.spares} spare{stats.spares === 1 ? '' : 's'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="coll-stat">
                    <div className="coll-stat-icon countries"><i className="ph-fill ph-globe-hemisphere-east"></i></div>
                    <div>
                        <span className="coll-stat-label">Countries</span>
                        <span className="coll-stat-value">{stats.countries}</span>
                    </div>
                </div>
                <div className="coll-stat">
                    <div className="coll-stat-icon years"><i className="ph-fill ph-calendar-blank"></i></div>
                    <div>
                        <span className="coll-stat-label">Years covered</span>
                        <span className="coll-stat-value">
                            {stats.oldest ? (stats.oldest === stats.newest ? stats.oldest : `${stats.oldest}–${stats.newest}`) : '—'}
                        </span>
                    </div>
                </div>
                <button
                    className={`coll-stat is-clickable ${onlyIncomplete ? 'is-on' : ''}`}
                    onClick={() => setOnlyIncomplete(v => !v)}
                    title="Items missing a country or year"
                >
                    <div className="coll-stat-icon todo"><i className="ph-fill ph-pencil-simple-line"></i></div>
                    <div>
                        <span className="coll-stat-label">Need details</span>
                        <span className="coll-stat-value">{stats.incomplete}</span>
                    </div>
                </button>
            </div>

            <div className="coll-toolbar">
                <select className="coll-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                    <option value="">All countries</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select className="coll-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="added-newest">Recently added</option>
                    <option value="added-oldest">Oldest added</option>
                    <option value="year-oldest">Year: old → new</option>
                    <option value="year-newest">Year: new → old</option>
                    <option value="country">Country A–Z</option>
                    <option value="name">Name A–Z</option>
                </select>

                {/* Coins only — stamps keep exactly the toolbar they had. */}
                {showCoinControls && (
                    <select className="coll-select" value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
                        <option value="">Any kind</option>
                        {Object.entries(COIN_KINDS).map(([id, k]) => (
                            <option key={id} value={id}>{k.label}</option>
                        ))}
                    </select>
                )}

                {showCoinControls && (
                    <select className="coll-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Any status</option>
                        {Object.entries(COIN_STATUS).map(([id, s]) => (
                            <option key={id} value={id}>{s.label}</option>
                        ))}
                    </select>
                )}

                <button
                    className={`coll-toggle ${groupBy === 'country' ? 'is-on' : ''}`}
                    onClick={() => setGroupBy(g => (g === 'country' ? 'none' : 'country'))}
                >
                    <i className="ph-bold ph-stack"></i> Group by country
                </button>

                {showCoinControls && (
                    <button
                        className={`coll-toggle ${groupBy === 'kind' ? 'is-on' : ''}`}
                        onClick={() => setGroupBy(g => (g === 'kind' ? 'none' : 'kind'))}
                    >
                        <i className="ph-bold ph-medal"></i> Group by kind
                    </button>
                )}

                {(query || countryFilter || kindFilter || statusFilter || onlyIncomplete) && (
                    <button
                        className="coll-clear"
                        onClick={() => {
                            setQuery(''); setCountryFilter(''); setKindFilter('');
                            setStatusFilter(''); setOnlyIncomplete(false);
                        }}
                    >
                        Clear filters · showing {visible.length} of {scoped.length}
                    </button>
                )}
            </div>

            <main className="coll-album">
                {scoped.length === 0 && (
                    <div className="coll-empty">
                        <i className={`ph-duotone ${activeType ? activeType.icon : 'ph-archive'}`}></i>
                        <h2>Nothing here yet</h2>
                        <p>
                            Upload a photo or scan to start the album. You can add several at once
                            and fill in the details afterwards.
                        </p>
                        <div className="coll-empty-actions">
                            <button className="coll-btn" onClick={() => setEditing({ type: tab === 'all' ? 'stamp' : tab })}>
                                <i className="ph-bold ph-plus"></i> Add {activeType ? `a ${activeType.label.toLowerCase()}` : 'an item'}
                            </button>
                            {activeType && (
                                <button className="coll-btn-ghost" onClick={() => bulkInputRef.current && bulkInputRef.current.click()}>
                                    <i className="ph-bold ph-upload-simple"></i> Upload many
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {scoped.length > 0 && visible.length === 0 && (
                    <div className="coll-empty">
                        <i className="ph-duotone ph-magnifying-glass"></i>
                        <h2>Nothing matches</h2>
                        <p>No item in the album fits those filters.</p>
                    </div>
                )}

                {groups.map(group => (
                    <section key={group.key} className="coll-group">
                        {group.label && (
                            <h2 className="coll-group-title">
                                {group.label}
                                <span>{group.items.length}</span>
                            </h2>
                        )}
                        <div className="coll-grid">
                            {group.items.map(item => {
                                const kind = typeOf(item);
                                const pics = imagesOf(item);
                                const cover = coverOf(item);
                                return (
                                    <article key={item.id} className={`coll-card is-${kind}`}>
                                        <button
                                            className="coll-frame"
                                            onClick={() => { setLightboxId(item.id); setPhotoIndex(0); }}
                                            aria-label={`View ${item.name || kind} full size`}
                                        >
                                            {/* The mount, not the cell, carries the perforated edge, so
                                                it hugs a wide stamp and a tall one alike while every
                                                card stays the same size. */}
                                            <span className="coll-mount">
                                                {cover
                                                    ? <img
                                                        src={cover.url}
                                                        alt={item.name || COLLECTION_TYPES[kind].label}
                                                        loading="lazy"
                                                        ref={shapeMountRef}
                                                        onLoad={shapeMount}
                                                    />
                                                    : <span className="coll-noimage"><i className={`ph-fill ${COLLECTION_TYPES[kind].icon}`}></i></span>}
                                            </span>
                                            {pics.length > 1 && (
                                                <span className="coll-count" title={`${pics.length} images`}>
                                                    <i className="ph-fill ph-images"></i>{pics.length}
                                                </span>
                                            )}
                                            {cover && cover.kind === 'generated' && (
                                                <span className="coll-genmark" title="Generated image — no original uploaded yet">
                                                    <i className="ph-fill ph-sparkle"></i>
                                                </span>
                                            )}
                                            {quantityOf(item) > 1 && (
                                                <span className="coll-qty" title={`${quantityOf(item)} copies of this one`}>
                                                    ×{quantityOf(item)}
                                                </span>
                                            )}
                                            {item.denomination && <span className="coll-denom">{item.denomination}</span>}
                                        </button>

                                        <div className="coll-body">
                                            <h3 title={item.name}>{item.name || `Untitled ${COLLECTION_TYPES[kind].label.toLowerCase()}`}</h3>
                                            <div className="coll-meta">
                                                {item.country && <span><i className="ph-fill ph-map-pin"></i>{item.country}</span>}
                                                {item.year && <span><i className="ph-fill ph-calendar-blank"></i>{item.year}</span>}
                                                {coinKindOf(item) && (
                                                    <span className="coll-kindtag" title="Issue kind">
                                                        <i className={`ph-fill ${COIN_KINDS[coinKindOf(item)].icon}`}></i>
                                                        {COIN_KINDS[coinKindOf(item)].label}
                                                    </span>
                                                )}
                                                {/* Only the noteworthy states earn a badge — a coin
                                                    still in use is the unremarkable case. */}
                                                {coinStatusOf(item) && coinStatusOf(item) !== 'current' && (
                                                    <span className={`coll-status is-${coinStatusOf(item)}`} title="No longer in ordinary use">
                                                        <i className={`ph-fill ${COIN_STATUS[coinStatusOf(item)].icon}`}></i>
                                                        {COIN_STATUS[coinStatusOf(item)].label}
                                                    </span>
                                                )}
                                                {item.material && <span><i className="ph-fill ph-circle-half"></i>{item.material}</span>}
                                                {item.dateCollected && (
                                                    <span title="Date collected">
                                                        <i className="ph-fill ph-tray-arrow-down"></i>{formatCollected(item.dateCollected)}
                                                    </span>
                                                )}
                                            </div>
                                            {isIncomplete(item) && <span className="coll-flag">Needs details</span>}
                                        </div>

                                        {tab === 'all' && (
                                            <span className="coll-kind" title={COLLECTION_TYPES[kind].label}>
                                                <i className={`ph-fill ${COLLECTION_TYPES[kind].icon}`}></i>
                                            </span>
                                        )}

                                        <div className="coll-actions">
                                            <button onClick={() => setEditing(item)} title="Edit">
                                                <i className="ph-bold ph-pencil-simple"></i>
                                            </button>
                                            <button className="is-danger" onClick={() => handleDelete(item)} title="Remove">
                                                <i className="ph-bold ph-trash"></i>
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </main>

            {editing && (
                <CollectionEditor
                    item={editing}
                    knownCountries={countries}
                    onCancel={() => setEditing(null)}
                    onSave={async (next) => {
                        const exists = items.some(s => s.id === next.id);
                        const updated = exists
                            ? items.map(s => (s.id === next.id ? next : s))
                            : [next, ...items];
                        const label = COLLECTION_TYPES[next.type].label;
                        const ok = await persist(updated, { successMessage: exists ? `${label} updated.` : `${label} added.` });
                        if (ok) {
                            revealItem(next);
                            setEditing(null);
                        }
                    }}
                />
            )}

            {lightboxItem && (() => {
                const pics = imagesOf(lightboxItem);
                const at = Math.min(photoIndex, Math.max(0, pics.length - 1));
                const photo = pics[at];

                return (
                <div className="coll-lightbox" onClick={() => setLightboxId(null)}>
                    <button className="coll-lightbox-close" aria-label="Close"><i className="ph-bold ph-x"></i></button>
                    <figure onClick={(e) => e.stopPropagation()}>
                        <div className="coll-lightbox-stage">
                            {photo
                                ? <img className={`is-${typeOf(lightboxItem)}`} src={photo.url} alt={lightboxItem.name || 'Collection item'} />
                                : <div className="coll-lightbox-noimage"><i className={`ph-fill ${COLLECTION_TYPES[typeOf(lightboxItem)].icon}`}></i></div>}

                            {photo && pics.length > 1 && (
                                <span className={`coll-photo-kind is-${photo.kind}`}>
                                    <i className={`ph-fill ${IMAGE_KINDS[photo.kind].icon}`}></i>
                                    {IMAGE_KINDS[photo.kind].label} · {at + 1} of {pics.length}
                                </span>
                            )}

                            {pics.length > 1 && (
                                <div className="coll-photo-strip">
                                    {pics.map((p, i) => (
                                        <button
                                            key={`${p.url}-${i}`}
                                            className={`coll-photo-thumb is-${p.kind} ${i === at ? 'is-active' : ''}`}
                                            onClick={() => setPhotoIndex(i)}
                                            title={IMAGE_KINDS[p.kind].label}
                                            aria-label={`Show ${IMAGE_KINDS[p.kind].label.toLowerCase()} image ${i + 1}`}
                                        >
                                            <img src={p.url} alt="" loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <figcaption>
                            <span className="coll-lightbox-kind">{COLLECTION_TYPES[typeOf(lightboxItem)].label}</span>
                            <h3>{lightboxItem.name || 'Untitled'}</h3>
                            <p>
                                {[
                                    lightboxItem.country,
                                    lightboxItem.year,
                                    lightboxItem.denomination,
                                    lightboxItem.material,
                                    lightboxItem.dateCollected ? `Collected ${formatCollected(lightboxItem.dateCollected)}` : null
                                ].filter(Boolean).join(' · ') || 'No details recorded yet'}
                            </p>
                            {lightboxItem.notes && <p className="coll-lightbox-notes">{lightboxItem.notes}</p>}
                            <span className="coll-lightbox-hint">
                                ← → between items{pics.length > 1 ? ' · ↑ ↓ between images' : ''} · Esc to close
                            </span>
                        </figcaption>
                    </figure>
                </div>
                );
            })()}

            {busy && (
                <div className="coll-busy">
                    <i className="ph-bold ph-circle-notch"></i> {busy}
                </div>
            )}

            {toast && <div className={`coll-toast is-${toast.tone}`}>{toast.message}</div>}

            <style>{`
                .coll-dashboard {
                    min-height: 100vh;
                    background: var(--bg-app);
                    color: var(--text-primary);
                    padding: 2rem;
                }

                /* Header */
                .coll-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                    margin-bottom: 1.75rem;
                }

                .coll-header-left { display: flex; align-items: center; gap: 1.25rem; }

                .coll-back {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    width: 42px;
                    height: 42px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 1.1rem;
                    transition: all 0.2s ease;
                }

                .coll-back:hover { color: var(--text-primary); border-color: var(--border-hover); }

                .coll-header-left h1 { font-size: 2.25rem; margin: 0; font-weight: 800; }
                .coll-accent { color: #f59e0b; }
                .coll-header-left p { margin: 0.2rem 0 0; color: var(--text-muted); font-size: 0.95rem; }

                .coll-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .coll-search { position: relative; }

                .coll-search i {
                    position: absolute;
                    left: 0.9rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .coll-search input {
                    width: 240px;
                    padding: 0.65rem 1rem 0.65rem 2.6rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 0.9rem;
                    outline: none;
                }

                .coll-search input:focus { border-color: #f59e0b; }

                .coll-btn, .coll-btn-ghost {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.65rem 1.15rem;
                    border-radius: var(--radius-md);
                    font-family: inherit;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .coll-btn { background: #f59e0b; color: #1a1206; border: 1px solid #f59e0b; }
                .coll-btn:hover { background: #fbbf24; border-color: #fbbf24; }

                .coll-btn-ghost {
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    border: 1px solid var(--border);
                }

                .coll-btn-ghost:hover { color: var(--text-primary); border-color: var(--border-hover); }
                .coll-btn:disabled, .coll-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Type tabs */
                .coll-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.75rem;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 0.75rem;
                    flex-wrap: wrap;
                }

                .coll-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.55rem 1rem;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: var(--radius-md);
                    color: var(--text-muted);
                    font-family: inherit;
                    font-size: 0.92rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .coll-tab:hover { color: var(--text-secondary); background: var(--bg-surface); }

                .coll-tab.is-active {
                    color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                    border-color: rgba(245, 158, 11, 0.35);
                }

                .coll-tab span {
                    font-size: 0.72rem;
                    background: rgba(255,255,255,0.07);
                    border-radius: 99px;
                    padding: 0.05rem 0.5rem;
                    font-variant-numeric: tabular-nums;
                }

                /* Stats */
                .coll-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 1.75rem;
                }

                .coll-stat {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.1rem 1.25rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    text-align: left;
                    font-family: inherit;
                }

                .coll-stat.is-clickable { cursor: pointer; transition: border-color 0.2s ease; }
                .coll-stat.is-clickable:hover { border-color: var(--border-hover); }
                .coll-stat.is-on { border-color: #f59e0b; box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.3); }

                .coll-stat-icon {
                    width: 48px;
                    height: 48px;
                    flex-shrink: 0;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                }

                .coll-stat-icon.total { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
                .coll-stat-icon.countries { background: rgba(6, 182, 212, 0.12); color: var(--info); }
                .coll-stat-icon.years { background: rgba(99, 102, 241, 0.12); color: var(--primary); }
                .coll-stat-icon.todo { background: rgba(236, 72, 153, 0.12); color: var(--secondary); }

                .coll-stat-label {
                    display: block;
                    font-size: 0.75rem;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }

                .coll-stat-value {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    font-variant-numeric: tabular-nums;
                }

                /* Toolbar */
                .coll-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    margin-bottom: 1.75rem;
                }

                .coll-select {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    padding: 0.55rem 0.9rem;
                    font-family: inherit;
                    font-size: 0.88rem;
                    cursor: pointer;
                    outline: none;
                }

                .coll-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    padding: 0.55rem 0.9rem;
                    font-family: inherit;
                    font-size: 0.88rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .coll-toggle.is-on { border-color: #f59e0b; color: #f59e0b; }

                .coll-clear {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-family: inherit;
                    font-size: 0.85rem;
                    cursor: pointer;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }

                .coll-clear:hover { color: var(--text-primary); }

                /* Album */
                .coll-group { margin-bottom: 2.5rem; }

                .coll-group-title {
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                    font-size: 1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-secondary);
                    margin: 0 0 1rem;
                }

                .coll-group-title span {
                    font-size: 0.75rem;
                    background: var(--bg-accent);
                    color: var(--text-muted);
                    border-radius: 99px;
                    padding: 0.1rem 0.6rem;
                    letter-spacing: 0;
                }

                .coll-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 1.75rem;
                }

                .coll-card {
                    position: relative;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1rem;
                    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
                }

                .coll-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(245, 158, 11, 0.35);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
                }

                /* The cell is a fixed square on every card, so the grid stays
                   even. The stamp inside keeps its own proportions — stamps
                   are issued portrait, landscape and square, and a fixed 3:4
                   box cropped the wide ones down the middle. */
                .coll-frame {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    padding: 0;
                    border: none;
                    background: transparent;
                    cursor: zoom-in;
                    position: relative;
                    overflow: hidden;
                }

                /* The mount is what looks like a stamp, and it takes the shape
                   of the image it holds — so the perforations hug a long stamp
                   just as tightly as a tall one instead of ringing the whole
                   cell. Its aspect-ratio is set from the image's natural size
                   on load; until then this square is a reasonable stand-in.
                   Both maximums resolve because the cell has a definite size,
                   which is why the ratio lives here and not on the image. */
                .coll-mount {
                    display: block;
                    box-sizing: border-box;
                    aspect-ratio: 1 / 1;
                    max-width: 100%;
                    max-height: 100%;
                    padding: 9px;
                    background-color: #fdfaf3;
                    line-height: 0;
                }

                /* Perforated edge — the one cue that says "stamp" without a label. */
                .coll-card.is-stamp .coll-mount {
                    border-radius: 4px;
                    background-image: radial-gradient(circle at 9px 9px, var(--bg-surface) 5px, transparent 5.5px);
                    background-size: 18px 18px;
                    background-position: -9px -9px;
                }

                /* Coins get a milled rim instead, and are round. */
                .coll-card.is-coin .coll-mount {
                    border-radius: 50%;
                    padding: 7px;
                    background-image: repeating-conic-gradient(#d9cba8 0deg 2deg, #f5ecd6 2deg 4deg);
                    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
                }

                /* The mount already carries the right shape, so the image just
                   fills it — no cropping, because the box matches the picture. */
                .coll-mount img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    border-radius: 1px;
                }

                /* Coins are round whatever the photo is, so this one does crop. */
                .coll-card.is-coin .coll-mount {
                    aspect-ratio: 1 / 1 !important;
                }

                .coll-card.is-coin .coll-mount img {
                    border-radius: 50%;
                    object-fit: cover;
                }

                .coll-noimage {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    color: #d6cdb8;
                    background: #f3ede1;
                }

                .coll-card.is-coin .coll-noimage { border-radius: 50%; }

                .coll-denom {
                    position: absolute;
                    left: 50%;
                    bottom: 12px;
                    transform: translateX(-50%);
                    background: rgba(12, 10, 6, 0.82);
                    color: #fbbf24;
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                    letter-spacing: 0.02em;
                    white-space: nowrap;
                }

                .coll-card.is-stamp .coll-denom { left: 14px; transform: none; }

                .coll-body { padding: 0.9rem 0.15rem 0.1rem; }

                .coll-body h3 {
                    margin: 0 0 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .coll-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem 0.75rem;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .coll-meta span { display: inline-flex; align-items: center; gap: 0.3rem; }
                .coll-meta i { color: #f59e0b; font-size: 0.85rem; }

                .coll-flag {
                    display: inline-block;
                    margin-top: 0.6rem;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--secondary);
                    background: rgba(236, 72, 153, 0.1);
                    border: 1px solid rgba(236, 72, 153, 0.25);
                    border-radius: 99px;
                    padding: 0.12rem 0.55rem;
                }

                .coll-kind {
                    position: absolute;
                    top: 1.35rem;
                    left: 1.35rem;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: rgba(8, 9, 13, 0.8);
                    color: #fbbf24;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.78rem;
                    backdrop-filter: blur(4px);
                }

                .coll-count, .coll-genmark {
                    position: absolute;
                    top: 12px;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.2rem;
                    background: rgba(12, 10, 6, 0.82);
                    color: #f5ecd6;
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.12rem 0.42rem;
                    border-radius: 99px;
                }

                .coll-count { left: 12px; }

                /* Sits under the image-count chip when both are showing, so
                   neither covers the stamp. */
                .coll-qty {
                    position: absolute;
                    left: 12px;
                    bottom: 12px;
                    background: rgba(12, 10, 6, 0.82);
                    color: #fbbf24;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.12rem 0.45rem;
                    border-radius: 99px;
                    letter-spacing: 0.02em;
                }

                /* The denomination already owns the bottom-left of a stamp, so
                   move it clear rather than stacking the two. */
                .coll-card.is-stamp .coll-denom ~ .coll-qty,
                .coll-card.is-stamp .coll-qty { bottom: auto; top: 12px; left: 12px; }
                .coll-card.is-stamp .coll-count ~ .coll-qty { left: 58px; }
                .coll-genmark { right: 12px; color: #c4b5fd; }

                /* The card's own hover controls sit top-right, so shift the
                   generated marker aside while they are showing. */
                .coll-card:hover .coll-genmark { opacity: 0; }

                .coll-actions {
                    position: absolute;
                    top: 1.35rem;
                    right: 1.35rem;
                    display: flex;
                    gap: 0.35rem;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .coll-card:hover .coll-actions,
                .coll-card:focus-within .coll-actions { opacity: 1; }

                .coll-actions button {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(8, 9, 13, 0.85);
                    color: #e2e8f0;
                    cursor: pointer;
                    font-size: 0.85rem;
                    backdrop-filter: blur(4px);
                }

                .coll-actions button:hover { background: rgba(8, 9, 13, 0.95); color: #fff; }
                .coll-actions button.is-danger:hover { color: #fca5a5; }

                /* Empty states */
                .coll-empty { padding: 5rem 2rem; text-align: center; color: var(--text-muted); }
                .coll-empty i { font-size: 4.5rem; color: rgba(245, 158, 11, 0.5); }
                .coll-empty h2 { margin: 1.25rem 0 0.5rem; color: var(--text-secondary); font-size: 1.3rem; }
                .coll-empty p { max-width: 460px; margin: 0 auto; line-height: 1.6; }

                .coll-empty-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                    margin-top: 1.75rem;
                    flex-wrap: wrap;
                }

                /* Lightbox */
                .coll-lightbox {
                    position: fixed;
                    inset: 0;
                    background: rgba(4, 5, 8, 0.92);
                    backdrop-filter: blur(6px);
                    z-index: 1200;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 1.5rem;
                }

                .coll-lightbox figure {
                    margin: 0;
                    max-width: 900px;
                    width: 100%;
                    display: grid;
                    grid-template-columns: minmax(0, 1.3fr) minmax(240px, 1fr);
                    gap: 2rem;
                    align-items: center;
                }

                .coll-lightbox img {
                    width: 100%;
                    max-height: 72vh;
                    object-fit: contain;
                    background: #fdfaf3;
                    padding: 12px;
                    border-radius: 6px;
                }

                .coll-lightbox img.is-coin { border-radius: 50%; }

                .coll-lightbox-noimage {
                    aspect-ratio: 3 / 4;
                    background: #f3ede1;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                    color: #d6cdb8;
                }

                .coll-lightbox-stage { position: relative; min-width: 0; }

                .coll-photo-kind {
                    position: absolute;
                    top: 0.75rem;
                    left: 0.75rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: rgba(8, 9, 13, 0.82);
                    border-radius: 99px;
                    padding: 0.2rem 0.7rem;
                    font-size: 0.72rem;
                    font-weight: 600;
                    backdrop-filter: blur(4px);
                }

                .coll-photo-kind.is-original { color: #7dd3fc; }
                .coll-photo-kind.is-generated { color: #c4b5fd; }

                .coll-photo-strip {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                    flex-wrap: wrap;
                }

                .coll-photo-thumb {
                    width: 54px;
                    height: 54px;
                    padding: 0;
                    border-radius: 6px;
                    overflow: hidden;
                    cursor: pointer;
                    background: #f3ede1;
                    border: 2px solid transparent;
                    opacity: 0.55;
                    transition: opacity 0.2s ease, border-color 0.2s ease;
                }

                .coll-photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
                .coll-photo-thumb:hover { opacity: 0.85; }
                .coll-photo-thumb.is-active { opacity: 1; }
                .coll-photo-thumb.is-active.is-original { border-color: #7dd3fc; }
                .coll-photo-thumb.is-active.is-generated { border-color: #c4b5fd; }

                .coll-lightbox figcaption { color: var(--text-secondary); }

                .coll-lightbox-kind {
                    display: inline-block;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #f59e0b;
                    margin-bottom: 0.5rem;
                }

                .coll-lightbox figcaption h3 { margin: 0 0 0.6rem; font-size: 1.5rem; color: var(--text-primary); }
                .coll-lightbox figcaption p { margin: 0 0 0.9rem; line-height: 1.6; }
                .coll-lightbox-notes { color: var(--text-muted); font-size: 0.92rem; white-space: pre-wrap; }

                .coll-lightbox-hint {
                    display: block;
                    margin-top: 1.5rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    letter-spacing: 0.04em;
                }

                .coll-lightbox-close {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.75rem;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.06);
                    color: #e2e8f0;
                    font-size: 1.1rem;
                    cursor: pointer;
                }

                .coll-lightbox-close:hover { background: rgba(255,255,255,0.12); }

                /* Busy + toast */
                .coll-busy {
                    position: fixed;
                    bottom: 1.75rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(17, 20, 28, 0.96);
                    border: 1px solid var(--border-hover);
                    border-radius: 99px;
                    padding: 0.7rem 1.4rem;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    z-index: 1300;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.45);
                }

                .coll-busy i { animation: coll-spin 1s linear infinite; color: #f59e0b; }

                @keyframes coll-spin { to { transform: rotate(360deg); } }

                .coll-toast {
                    position: fixed;
                    bottom: 1.75rem;
                    right: 1.75rem;
                    max-width: 380px;
                    padding: 0.8rem 1.2rem;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    z-index: 1300;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.45);
                    border: 1px solid;
                }

                .coll-toast.is-success { background: rgba(16, 185, 129, 0.14); border-color: rgba(16,185,129,0.4); color: #6ee7b7; }
                .coll-toast.is-error { background: rgba(239, 68, 68, 0.14); border-color: rgba(239,68,68,0.4); color: #fca5a5; }
                .coll-toast.is-warn { background: rgba(245, 158, 11, 0.14); border-color: rgba(245,158,11,0.4); color: #fcd34d; }
                .coll-toast.is-info { background: rgba(99, 102, 241, 0.14); border-color: rgba(99,102,241,0.4); color: #c7d2fe; }

                /* Editor dialog */
                .coll-editor-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(4, 5, 8, 0.8);
                    backdrop-filter: blur(4px);
                    z-index: 1100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                }

                .coll-editor {
                    background: #11141c;
                    border: 1px solid var(--border-hover);
                    border-radius: var(--radius-lg);
                    width: min(720px, 100%);
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 1.75rem;
                }

                .coll-editor-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .coll-editor-head h2 { margin: 0; font-size: 1.35rem; display: flex; align-items: center; gap: 0.6rem; }
                .coll-editor-head h2 i { color: #f59e0b; }

                .coll-editor-close {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1.2rem;
                    cursor: pointer;
                }

                .coll-editor-close:hover { color: var(--text-primary); }

                .coll-editor-body {
                    display: grid;
                    grid-template-columns: 220px minmax(0, 1fr);
                    gap: 1.75rem;
                }

                .coll-drop {
                    aspect-ratio: 3 / 4;
                    border: 2px dashed var(--border-hover);
                    border-radius: var(--radius-md);
                    background: rgba(255,255,255,0.02);
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    text-align: center;
                    padding: 1rem;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.82rem;
                    line-height: 1.45;
                    transition: all 0.2s ease;
                    overflow: hidden;
                    position: relative;
                    width: 100%;
                }

                .coll-drop.is-coin { aspect-ratio: 1 / 1; border-radius: 50%; }
                .coll-drop:hover, .coll-drop.is-over { border-color: #f59e0b; color: #fbbf24; }
                .coll-drop i { font-size: 1.8rem; }
                .coll-drop img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
                .coll-drop.is-coin img { border-radius: 50%; }

                .coll-drop-replace {
                    position: absolute;
                    inset: auto 0 0 0;
                    background: rgba(8, 9, 13, 0.85);
                    color: #e2e8f0;
                    padding: 0.4rem;
                    font-size: 0.75rem;
                }

                /* A full-width bar would sit outside a circular frame, so on
                   coins the hint becomes a pill tucked inside the rim. */
                .coll-drop.is-coin .coll-drop-replace {
                    inset: auto auto 14% 50%;
                    transform: translateX(-50%);
                    white-space: nowrap;
                    padding: 0.25rem 0.7rem;
                    border-radius: 99px;
                }

                .coll-drop-error { color: #fca5a5; font-size: 0.8rem; margin: 0.6rem 0 0; }

                .coll-fields { display: flex; flex-direction: column; gap: 1rem; }

                .coll-field label {
                    display: block;
                    margin-bottom: 0.35rem;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .coll-field input,
                .coll-field textarea,
                .coll-kind-select,
                .coll-month-picker select {
                    width: 100%;
                    background: var(--bg-app);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    padding: 0.6rem 0.75rem;
                    font-family: inherit;
                    font-size: 0.9rem;
                    outline: none;
                }

                .coll-field input:focus,
                .coll-field textarea:focus,
                .coll-kind-select:focus,
                .coll-month-picker select:focus { border-color: #f59e0b; }

                .coll-kind-select { cursor: pointer; }

                .coll-kindtag { color: #fcd34d !important; }
                .coll-kindtag i { color: #fcd34d !important; }

                /* Withdrawn is a quiet fact; demonetised is the harder stop, so
                   it reads warmer without shouting. */
                .coll-status.is-withdrawn, .coll-status.is-withdrawn i { color: #94a3b8 !important; }
                .coll-status.is-demonetised, .coll-status.is-demonetised i { color: #f0abfc !important; }

                .coll-field textarea { resize: vertical; min-height: 74px; line-height: 1.5; }

                .coll-field-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .coll-month-picker { display: flex; gap: 0.6rem; }
                .coll-month-picker select { cursor: pointer; }

                /* Image gallery in the editor */
                .coll-shots { display: flex; flex-direction: column; gap: 0.75rem; }

                .coll-shot-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
                    gap: 0.5rem;
                }

                .coll-shot-pic-wrap { position: relative; }

                .coll-shot {
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                    overflow: hidden;
                    background: rgba(255,255,255,0.02);
                }

                .coll-shot.is-active { border-color: #f59e0b; }

                .coll-shot-pic {
                    display: block;
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    padding: 0;
                    border: none;
                    background: #f3ede1;
                    cursor: pointer;
                    position: relative;
                }

                .coll-shot-pic img { width: 100%; height: 100%; object-fit: cover; display: block; }

                .coll-shot-cover {
                    position: absolute;
                    inset: auto 0 0 0;
                    background: rgba(8, 9, 13, 0.8);
                    color: #fbbf24;
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 1px 0;
                }

                .coll-shot-tools {
                    display: flex;
                    align-items: stretch;
                    justify-content: center;
                    gap: 0.1rem;
                    border-top: 1px solid var(--border);
                }

                .coll-shot-tools button {
                    flex: 1 1 0;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.3rem 0.2rem;
                    font-family: inherit;
                    font-size: 0.68rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .coll-shot-tools button:hover { color: var(--text-primary); }
                .coll-shot-tools button.is-danger:hover { color: #fca5a5; }

                /* Icon-only, over the image: the written label does not fit
                   beside the other controls at thumbnail width and was
                   clipping to "Origir". */
                .coll-shot-kind {
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    width: 20px;
                    height: 20px;
                    padding: 0;
                    border: none;
                    border-radius: 50%;
                    background: rgba(8, 9, 13, 0.85);
                    cursor: pointer;
                    font-size: 0.65rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .coll-shot-kind.is-original { color: #7dd3fc; }
                .coll-shot-kind.is-generated { color: #c4b5fd; }
                .coll-shot-kind:hover { background: rgba(8, 9, 13, 0.98); }

                .coll-shot-add { display: flex; flex-direction: column; gap: 0.4rem; }

                .coll-shot-add button {
                    white-space: nowrap;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.35rem;
                    background: var(--bg-app);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    padding: 0.45rem 0.4rem;
                    font-family: inherit;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .coll-shot-add button:hover { border-color: #f59e0b; color: #fbbf24; }

                .coll-editor-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    margin-top: 1.75rem;
                    padding-top: 1.25rem;
                    border-top: 1px solid var(--border);
                }

                @media (max-width: 860px) {
                    .coll-editor-body { grid-template-columns: 1fr; }
                    .coll-drop, .coll-drop.is-coin { aspect-ratio: 16 / 9; border-radius: var(--radius-md); }
                    .coll-lightbox figure { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .coll-dashboard { padding: 1.25rem; }
                    .coll-header, .coll-header-actions { flex-direction: column; align-items: stretch; }
                    .coll-search input { width: 100%; }
                }
            `}</style>
        </div>
    );
};

/**
 * Add / edit one item. Held apart from the dashboard so the form state resets
 * cleanly each time it opens, rather than needing to be synced back from props.
 */
const CollectionEditor = ({ item, knownCountries, onCancel, onSave }) => {
    const { useState, useEffect, useRef } = React;
    const isNew = !item.id;
    const type = item.type || 'stamp';
    const config = COLLECTION_TYPES[type];

    const [form, setForm] = useState({
        name: item.name || '',
        country: item.country || '',
        year: item.year || '',
        denomination: item.denomination || '',
        material: item.material || '',
        coinKind: coinKindOf(item),
        coinStatus: coinStatusOf(item),
        quantity: quantityOf(item),
        dateCollected: item.dateCollected || '',
        notes: item.notes || '',
        images: imagesOf(item)
    });
    const [dragOver, setDragOver] = useState(false);
    const [working, setWorking] = useState('');
    const [error, setError] = useState('');
    const [activeShot, setActiveShot] = useState(0);
    const fileRef = useRef(null);
    // Which kind the file picker is currently collecting. A ref, not state:
    // it is set immediately before the input is clicked and read back in the
    // change handler, which would otherwise close over a stale value.
    // Drops and pastes do not consult it — they always file as originals, so
    // the result never depends on which button was pressed last. Any image's
    // badge can be flipped in one click afterwards.
    const pendingKind = useRef('original');

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    /** Add one or more files to the gallery under the given kind. */
    const takeFiles = async (fileList, kind) => {
        const files = Array.from(fileList || []).filter(f => f && f.type.startsWith('image/'));
        if (!files.length) {
            setError('That file is not an image.');
            return;
        }

        setError('');
        const added = [];
        for (let i = 0; i < files.length; i++) {
            setWorking(files.length > 1 ? `Processing ${i + 1} of ${files.length}…` : 'Processing…');
            try {
                added.push({ url: await storeCollectionImage(files[i]), kind });
            } catch (err) {
                console.error(err);
            }
        }
        setWorking('');

        if (!added.length) {
            setError('Could not read those images.');
            return;
        }
        if (added.length < files.length) {
            setError(`${files.length - added.length} of ${files.length} could not be read.`);
        }

        setForm(f => ({
            ...f,
            images: [...f.images, ...added],
            name: f.name || nameFromFile(files[0])
        }));
        setActiveShot(form.images.length);
    };

    const pickFiles = (kind) => {
        pendingKind.current = kind;
        if (fileRef.current) fileRef.current.click();
    };

    const removeShot = (index) => {
        setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
        setActiveShot(i => (i >= index && i > 0 ? i - 1 : i));
    };

    const setShotKind = (index, kind) => {
        setForm(f => ({ ...f, images: f.images.map((p, i) => (i === index ? { ...p, kind } : p)) }));
    };

    /** Promote a picture to the front, which is what the album card shows. */
    const makeCover = (index) => {
        setForm(f => {
            const next = f.images.slice();
            const [pic] = next.splice(index, 1);
            return { ...f, images: [pic, ...next] };
        });
        setActiveShot(0);
    };

    // Pasting a screenshot straight in is the fastest route for something you
    // just photographed, so the dialog listens for it while open.
    useEffect(() => {
        const onPaste = (e) => {
            const entry = Array.from((e.clipboardData && e.clipboardData.items) || [])
                .find(i => i.type.startsWith('image/'));
            if (entry) takeFiles([entry.getAsFile()], 'original');
        };
        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (working) return;

        onSave({
            id: item.id || String(Date.now()),
            type,
            name: form.name.trim() || `Untitled ${config.label.toLowerCase()}`,
            country: form.country.trim(),
            year: String(form.year).trim(),
            denomination: form.denomination.trim(),
            material: form.material.trim(),
            // Only coins carry these; a stamp must never acquire one.
            coinKind: type === 'coin' ? form.coinKind : '',
            coinStatus: type === 'coin' ? form.coinStatus : '',
            quantity: quantityOf({ quantity: form.quantity }),
            dateCollected: form.dateCollected,
            notes: form.notes.trim(),
            images: form.images,
            addedAt: item.addedAt || new Date().toISOString()
        });
    };

    return (
        <div className="coll-editor-backdrop" onClick={onCancel}>
            <div className="coll-editor" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="coll-editor-head">
                    <h2>
                        <i className={`ph-fill ${config.icon}`}></i>
                        {isNew ? `Add a ${config.label.toLowerCase()}` : `Edit ${config.label.toLowerCase()}`}
                    </h2>
                    <button className="coll-editor-close" onClick={onCancel} aria-label="Close">
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="coll-editor-body">
                        <div className="coll-shots">
                            <button
                                type="button"
                                className={`coll-drop is-${type} ${dragOver ? 'is-over' : ''}`}
                                onClick={() => pickFiles('original')}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                    takeFiles(e.dataTransfer.files, 'original');
                                }}
                            >
                                {working && <><i className="ph-bold ph-circle-notch"></i><span>{working}</span></>}
                                {!working && form.images[activeShot] && (
                                    <>
                                        <img src={form.images[activeShot].url} alt="" />
                                        <span className="coll-drop-replace">Click or drop to add more</span>
                                    </>
                                )}
                                {!working && !form.images.length && (
                                    <>
                                        <i className="ph-bold ph-image-square"></i>
                                        <span>{config.blurb}</span>
                                    </>
                                )}
                            </button>

                            {form.images.length > 0 && (
                                <div className="coll-shot-list">
                                    {form.images.map((pic, i) => (
                                        <div
                                            key={`${pic.url}-${i}`}
                                            className={`coll-shot ${i === activeShot ? 'is-active' : ''}`}
                                        >
                                            <div className="coll-shot-pic-wrap">
                                                <button
                                                    type="button"
                                                    className="coll-shot-pic"
                                                    onClick={() => setActiveShot(i)}
                                                    title={i === 0 ? 'Shown on the card' : 'Preview'}
                                                >
                                                    <img src={pic.url} alt="" />
                                                </button>
                                                {/* Sibling, not nested: a button inside a button is invalid
                                                    and the inner one would not reliably receive the click. */}
                                                <button
                                                    type="button"
                                                    className={`coll-shot-kind is-${pic.kind}`}
                                                    onClick={() => setShotKind(i, pic.kind === 'original' ? 'generated' : 'original')}
                                                    title={`${IMAGE_KINDS[pic.kind].label} — click to switch`}
                                                    aria-label={`${IMAGE_KINDS[pic.kind].label}. Click to switch.`}
                                                >
                                                    <i className={`ph-fill ${IMAGE_KINDS[pic.kind].icon}`}></i>
                                                </button>
                                                {i === 0 && <span className="coll-shot-cover">Cover</span>}
                                            </div>

                                            <div className="coll-shot-tools">
                                                {i !== 0 && (
                                                    <button type="button" onClick={() => makeCover(i)} title="Use as the card image">
                                                        <i className="ph-bold ph-arrow-up"></i>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="is-danger"
                                                    onClick={() => removeShot(i)}
                                                    title="Remove this image"
                                                >
                                                    <i className="ph-bold ph-x"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="coll-shot-add">
                                <button type="button" onClick={() => pickFiles('original')}>
                                    <i className="ph-bold ph-camera"></i> Add original
                                </button>
                                <button type="button" onClick={() => pickFiles('generated')}>
                                    <i className="ph-bold ph-sparkle"></i> Add generated
                                </button>
                            </div>

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={(e) => { takeFiles(e.target.files, pendingKind.current); e.target.value = ''; }}
                            />
                            {error && <p className="coll-drop-error">{error}</p>}
                        </div>

                        <div className="coll-fields">
                            <div className="coll-field">
                                <label htmlFor="coll-name">Name</label>
                                <input
                                    id="coll-name"
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
                                    placeholder={type === 'coin' ? 'e.g. One rupee, Ashoka pillar' : 'e.g. Mahatma Gandhi centenary'}
                                    autoFocus
                                />
                            </div>

                            <div className="coll-field-row">
                                <div className="coll-field">
                                    <label htmlFor="coll-country">Country</label>
                                    <input
                                        id="coll-country"
                                        list="coll-country-options"
                                        value={form.country}
                                        onChange={(e) => set('country', e.target.value)}
                                        placeholder="e.g. India"
                                    />
                                    <datalist id="coll-country-options">
                                        {(knownCountries || []).map(c => <option key={c} value={c} />)}
                                        {(window.TravelData ? window.TravelData.COUNTRIES_LIST : []).map(c => <option key={`w-${c}`} value={c} />)}
                                    </datalist>
                                </div>
                                <div className="coll-field">
                                    <label htmlFor="coll-year">Year {type === 'coin' ? 'minted' : 'of issue'}</label>
                                    <input
                                        id="coll-year"
                                        type="number"
                                        min="1700"
                                        max={new Date().getFullYear()}
                                        value={form.year}
                                        onChange={(e) => set('year', e.target.value)}
                                        placeholder={type === 'coin' ? 'e.g. 1985' : 'e.g. 1969'}
                                    />
                                </div>
                            </div>

                            <div className="coll-field-row">
                                <div className="coll-field">
                                    <label htmlFor="coll-denom">Denomination</label>
                                    <input
                                        id="coll-denom"
                                        value={form.denomination}
                                        onChange={(e) => set('denomination', e.target.value)}
                                        placeholder={type === 'coin' ? 'e.g. ₹2 / 50 paise' : 'e.g. ₹5 / 20p'}
                                    />
                                </div>
                                <div className="coll-field">
                                    <label htmlFor="coll-qty">How many</label>
                                    <input
                                        id="coll-qty"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={form.quantity}
                                        onChange={(e) => set('quantity', e.target.value)}
                                        placeholder="1"
                                    />
                                    <p className="coll-field-hint">Copies of this same one — spares and swaps.</p>
                                </div>
                            </div>

                            {type === 'coin' && (
                                <div className="coll-field-row">
                                    <div className="coll-field">
                                        <label htmlFor="coll-kind">Kind of issue</label>
                                        <select
                                            id="coll-kind"
                                            className="coll-kind-select"
                                            value={form.coinKind}
                                            onChange={(e) => set('coinKind', e.target.value)}
                                        >
                                            <option value="">Not set</option>
                                            {Object.entries(COIN_KINDS).map(([id, k]) => (
                                                <option key={id} value={id}>{k.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="coll-field">
                                        <label htmlFor="coll-status">Still legal tender?</label>
                                        <select
                                            id="coll-status"
                                            className="coll-kind-select"
                                            value={form.coinStatus}
                                            onChange={(e) => set('coinStatus', e.target.value)}
                                        >
                                            <option value="">Not set</option>
                                            {Object.entries(COIN_STATUS).map(([id, s]) => (
                                                <option key={id} value={id}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {type === 'coin' ? (
                                <div className="coll-field-row">
                                    <div className="coll-field">
                                        <label htmlFor="coll-material">Metal</label>
                                        <input
                                            id="coll-material"
                                            value={form.material}
                                            onChange={(e) => set('material', e.target.value)}
                                            placeholder="e.g. Copper-nickel, Brass"
                                        />
                                    </div>
                                    <div className="coll-field">
                                        <label>Date collected</label>
                                        <CollectionMonthPicker value={form.dateCollected} onChange={(v) => set('dateCollected', v)} />
                                    </div>
                                </div>
                            ) : (
                                <div className="coll-field">
                                    <label>Date collected</label>
                                    <CollectionMonthPicker value={form.dateCollected} onChange={(v) => set('dateCollected', v)} />
                                </div>
                            )}

                            <div className="coll-field">
                                <label htmlFor="coll-notes">Notes</label>
                                <textarea
                                    id="coll-notes"
                                    value={form.notes}
                                    onChange={(e) => set('notes', e.target.value)}
                                    placeholder="Where it came from, condition, why you kept it…"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="coll-editor-actions">
                        <button type="button" className="coll-btn-ghost" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="coll-btn" disabled={working}>
                            {isNew ? 'Add to collection' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
