/**
 * Poster-style India map: real geographic outline with numbered pins, and a
 * numbered legend beside it.
 *
 * Pins are clustered by city rather than one-per-place — 272 places across 50
 * cities would stack 22 pins on Hyderabad alone. Each pin is a city; the
 * legend row lists what you visited there. Numbering runs north to south so
 * the legend reads down the map.
 */
window.IndiaPosterMap = ({ states, onSelect, categories }) => {
    const { useMemo, useState } = React;
    const [active, setActive] = useState(null);
    const GEO = window.INDIA_GEO;

    const catById = useMemo(() => {
        const m = {};
        (categories || []).forEach(c => { m[c.id] = c; });
        return m;
    }, [categories]);

    // Cluster every visited place into the city it belongs to.
    const pins = useMemo(() => {
        if (!GEO || !window.resolveCityCoords) return [];

        const byKey = {};
        (states || []).forEach(region => {
            (region.placesVisited || []).forEach(place => {
                const isObj = place && typeof place === 'object';
                const name = isObj ? place.name : place;
                if (!name) return;

                const city = isObj ? (place.city || '').trim() : '';
                const coords = window.resolveCityCoords(city, region.name);
                if (!coords) return;

                // Places with no city collapse onto one marker per state.
                const label = city && city !== '-' ? city : region.name;
                const key = `${region.name}::${label.toLowerCase()}`;

                if (!byKey[key]) {
                    byKey[key] = {
                        key,
                        label,
                        region: region.name,
                        lat: coords.lat,
                        lng: coords.lng,
                        approximate: !coords.exact,
                        places: []
                    };
                }
                byKey[key].places.push({ name, category: isObj ? place.category : '', remarks: isObj ? place.remarks : '' });
            });
        });

        return Object.values(byKey)
            .sort((a, b) => b.lat - a.lat) // north first, so numbers read downward
            .map((pin, i) => ({ ...pin, number: i + 1, pos: GEO.project(pin.lat, pin.lng) }));
    }, [states, GEO]);

    if (!GEO) {
        return <div className="empty-state"><p>Map geometry failed to load.</p></div>;
    }

    const totalPlaces = pins.reduce((n, p) => n + p.places.length, 0);

    return (
        <div className="poster-map">
            <aside className="poster-legend">
                <header className="poster-legend-head">
                    <p className="poster-kicker">Places I have visited</p>
                    <h2>INDIA</h2>
                    <div className="poster-rule"><span></span><i className="ph-fill ph-compass"></i><span></span></div>
                    <p className="poster-summary">{totalPlaces} places across {pins.length} locations</p>
                </header>

                <ol className="poster-list">
                    {pins.map(pin => (
                        <li
                            key={pin.key}
                            className={`poster-row ${active === pin.key ? 'is-active' : ''}`}
                            onMouseEnter={() => setActive(pin.key)}
                            onMouseLeave={() => setActive(null)}
                        >
                            <button onClick={() => onSelect(pin.region)}>
                                <span className="poster-num">{pin.number}</span>
                                <span className="poster-row-body">
                                    <span className="poster-row-title">
                                        {pin.label}
                                        {pin.approximate && <i className="ph-bold ph-crosshair" title="Approximate — no city recorded"></i>}
                                    </span>
                                    <span className="poster-row-sub">{pin.region} · {pin.places.length} {pin.places.length === 1 ? 'place' : 'places'}</span>
                                    <span className="poster-row-cats">
                                        {[...new Set(pin.places.map(p => p.category).filter(Boolean))].slice(0, 6).map(id => {
                                            const cat = catById[id];
                                            return cat
                                                ? <i key={id} className={`ph-fill ${cat.icon}`} style={{ color: cat.color }} title={cat.label}></i>
                                                : null;
                                        })}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>
            </aside>

            <div className="poster-canvas">
                <svg viewBox={GEO.viewBox} className="poster-svg" role="img" aria-label="Map of India with visited locations">
                    <defs>
                        <linearGradient id="landFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(99,102,241,0.16)" />
                            <stop offset="100%" stopColor="rgba(99,102,241,0.06)" />
                        </linearGradient>
                    </defs>

                    {GEO.paths.map((d, i) => (
                        <path key={i} d={d} fill="url(#landFill)" stroke="rgba(148,163,184,0.5)" strokeWidth="1.4" strokeLinejoin="round" />
                    ))}

                    {pins.map(pin => {
                        const isActive = active === pin.key;
                        const r = Math.min(26, 12 + pin.places.length * 0.9);
                        return (
                            <g
                                key={pin.key}
                                className={`poster-pin ${isActive ? 'is-active' : ''}`}
                                transform={`translate(${pin.pos.x}, ${pin.pos.y})`}
                                onMouseEnter={() => setActive(pin.key)}
                                onMouseLeave={() => setActive(null)}
                                onClick={() => onSelect(pin.region)}
                            >
                                <circle className="poster-pin-halo" r={r + 8} />
                                <circle className="poster-pin-dot" r={r} />
                                <text className="poster-pin-num" textAnchor="middle" dominantBaseline="central">{pin.number}</text>
                            </g>
                        );
                    })}
                </svg>

                <div className="poster-tooltip">
                    {active ? (() => {
                        const pin = pins.find(p => p.key === active);
                        if (!pin) return null;
                        return (
                            <React.Fragment>
                                <strong>{pin.number}. {pin.label}</strong>
                                <span>{pin.region}</span>
                                <span className="poster-tooltip-places">
                                    {pin.places.slice(0, 5).map(p => p.name).join(' · ')}
                                    {pin.places.length > 5 ? ` … +${pin.places.length - 5} more` : ''}
                                </span>
                            </React.Fragment>
                        );
                    })() : <span className="poster-tooltip-hint">Hover a pin or a legend entry</span>}
                </div>

                <p className="poster-credit">
                    Outline: Natural Earth (public domain). Pin positions derived from recorded city names.
                </p>
            </div>

            <style>{`
                .poster-map {
                    display: grid;
                    grid-template-columns: minmax(260px, 320px) 1fr;
                    gap: 1.5rem;
                    align-items: start;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.02);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                }

                .poster-legend {
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    background: rgba(255,255,255,0.03);
                    padding: 1.25rem 1rem;
                    max-height: 620px;
                    display: flex;
                    flex-direction: column;
                }

                .poster-legend-head { text-align: center; margin-bottom: 1rem; }
                .poster-kicker {
                    margin: 0;
                    font-size: 0.68rem;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }
                .poster-legend-head h2 {
                    margin: 0.3rem 0 0.5rem;
                    font-size: 2.1rem;
                    letter-spacing: 0.12em;
                    color: var(--text-primary);
                    font-weight: 800;
                }
                .poster-rule { display: flex; align-items: center; gap: 0.5rem; justify-content: center; color: var(--primary); }
                .poster-rule span { height: 1px; width: 42px; background: var(--border); }
                .poster-summary { margin: 0.6rem 0 0; color: var(--text-muted); font-size: 0.75rem; }

                .poster-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    overflow-y: auto;
                    flex: 1;
                    scrollbar-width: thin;
                }

                .poster-row button {
                    width: 100%;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.7rem;
                    padding: 0.55rem 0.5rem;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-sm);
                    text-align: left;
                    font-family: inherit;
                    cursor: pointer;
                }

                .poster-row.is-active button { background: rgba(99,102,241,0.14); }

                .poster-num {
                    flex-shrink: 0;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: #fff;
                    font-size: 0.68rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-variant-numeric: tabular-nums;
                }

                .poster-row-body { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
                .poster-row-title {
                    color: var(--text-primary);
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .poster-row-title i { font-size: 0.7rem; color: var(--text-muted); }
                .poster-row-sub { color: var(--text-muted); font-size: 0.72rem; }
                .poster-row-cats { display: flex; gap: 0.25rem; margin-top: 0.15rem; font-size: 0.8rem; }

                .poster-canvas { position: relative; min-width: 0; }
                .poster-svg { width: 100%; height: auto; max-height: 620px; display: block; margin: 0 auto; }

                .poster-pin { cursor: pointer; }
                .poster-pin-halo { fill: rgba(99,102,241,0.12); opacity: 0; transition: opacity 0.15s ease; }
                .poster-pin-dot {
                    fill: rgba(99,102,241,0.85);
                    stroke: #fff;
                    stroke-width: 1.5;
                    transition: fill 0.15s ease;
                }
                .poster-pin-num { fill: #fff; font-size: 13px; font-weight: 700; pointer-events: none; }
                .poster-pin.is-active .poster-pin-halo { opacity: 1; }
                .poster-pin.is-active .poster-pin-dot { fill: #ec4899; }

                .poster-tooltip {
                    position: absolute;
                    left: 0;
                    bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                    padding: 0.7rem 0.9rem;
                    max-width: 320px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    background: rgba(17,20,28,0.92);
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }
                .poster-tooltip strong { color: var(--text-primary); }
                .poster-tooltip-places { color: var(--text-muted); font-size: 0.72rem; }
                .poster-tooltip-hint { color: var(--text-muted); }

                .poster-credit {
                    margin: 0.5rem 0 0;
                    text-align: right;
                    color: var(--text-muted);
                    font-size: 0.68rem;
                }

                @media (max-width: 900px) {
                    .poster-map { grid-template-columns: 1fr; }
                    .poster-legend { max-height: 320px; }
                    .poster-tooltip { position: static; max-width: none; margin-top: 0.75rem; }
                }
            `}</style>
        </div>
    );
};
