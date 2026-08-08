/**
 * India as a tile-grid cartogram: one equal-sized tile per state/UT, placed at
 * its approximate position on a 9x11 grid.
 *
 * Deliberately not a geographic outline — real boundary paths would need a
 * licensed SVG asset, and an eyeballed approximation of India's borders would
 * be worse than honestly abstract. A tile grid keeps relative position
 * (north/south/east/west, neighbours) truthful while giving every state the
 * same clickable area, so small UTs are not invisible.
 *
 * col/row are 1-indexed grid cells; short is the tile label.
 */
window.INDIA_TILES = [
    // Far north
    { name: 'Jammu and Kashmir', short: 'JK', col: 3, row: 1 },
    { name: 'Ladakh', short: 'LA', col: 4, row: 1 },
    { name: 'Himachal Pradesh', short: 'HP', col: 4, row: 2 },
    { name: 'Punjab', short: 'PB', col: 3, row: 2 },
    { name: 'Chandigarh', short: 'CH', col: 3, row: 3 },
    { name: 'Uttarakhand', short: 'UK', col: 5, row: 2 },
    { name: 'Haryana', short: 'HR', col: 4, row: 3 },
    { name: 'New Delhi', short: 'DL', col: 5, row: 3 },

    // North / central
    { name: 'Rajasthan', short: 'RJ', col: 2, row: 4 },
    { name: 'Uttar Pradesh', short: 'UP', col: 5, row: 4 },
    { name: 'Bihar', short: 'BR', col: 6, row: 4 },
    { name: 'Sikkim', short: 'SK', col: 7, row: 3 },
    { name: 'Arunachal Pradesh', short: 'AR', col: 9, row: 3 },

    { name: 'Gujarat', short: 'GJ', col: 2, row: 5 },
    { name: 'Madhya Pradesh', short: 'MP', col: 4, row: 5 },
    { name: 'Jharkhand', short: 'JH', col: 6, row: 5 },
    { name: 'West Bengal', short: 'WB', col: 7, row: 5 },
    { name: 'Assam', short: 'AS', col: 8, row: 4 },
    { name: 'Meghalaya', short: 'ML', col: 8, row: 5 },
    { name: 'Nagaland', short: 'NL', col: 9, row: 4 },
    { name: 'Manipur', short: 'MN', col: 9, row: 5 },

    // Centre / west
    { name: 'Dadra and Nagar Haveli and Daman and Diu', short: 'DD', col: 2, row: 6 },
    { name: 'Maharashtra', short: 'MH', col: 3, row: 6 },
    { name: 'Chhattisgarh', short: 'CG', col: 5, row: 6 },
    { name: 'Odisha', short: 'OD', col: 6, row: 6 },
    { name: 'Tripura', short: 'TR', col: 8, row: 6 },
    { name: 'Mizoram', short: 'MZ', col: 9, row: 6 },

    // South
    { name: 'Goa', short: 'GA', col: 3, row: 7 },
    { name: 'Telangana', short: 'TG', col: 4, row: 7 },
    { name: 'Andhra Pradesh', short: 'AP', col: 5, row: 7 },
    { name: 'Karnataka', short: 'KA', col: 3, row: 8 },
    { name: 'Tamil Nadu', short: 'TN', col: 4, row: 9 },
    { name: 'Puducherry', short: 'PY', col: 5, row: 9 },
    { name: 'Kerala', short: 'KL', col: 3, row: 9 },

    // Island territories
    { name: 'Lakshadweep', short: 'LD', col: 1, row: 9 },
    { name: 'Andaman and Nicobar Islands', short: 'AN', col: 7, row: 9 }
];

window.IndiaTileMap = ({ states, onSelect, filter }) => {
    const { useMemo, useState } = React;
    const [hovered, setHovered] = useState(null);

    const byName = useMemo(() => {
        const map = {};
        (states || []).forEach(s => { map[s.name] = s; });
        return map;
    }, [states]);

    const tiles = window.INDIA_TILES.map(tile => {
        const data = byName[tile.name] || {};
        const places = (data.placesVisited || []).length;
        const wishlist = (data.placesToVisit || []).length;
        const visited = !!(data.visited || places > 0);
        return { ...tile, data, places, wishlist, visited };
    });

    const max = Math.max(1, ...tiles.map(t => t.places));
    const shown = filter === 'visited' ? tiles.filter(t => t.visited) : tiles;
    const visitedCount = tiles.filter(t => t.visited).length;

    // Four bands of colour so density reads at a glance without a legend lookup.
    const intensity = (t) => {
        if (!t.visited) return 0;
        const ratio = t.places / max;
        if (ratio > 0.6) return 4;
        if (ratio > 0.3) return 3;
        if (ratio > 0.1) return 2;
        return 1;
    };

    const active = hovered ? tiles.find(t => t.name === hovered) : null;

    return (
        <div className="tile-map">
            <div className="tile-map-head">
                <div className="tile-map-legend">
                    <span>Fewer places</span>
                    {[0, 1, 2, 3, 4].map(level => (
                        <span key={level} className={`legend-swatch level-${level}`}></span>
                    ))}
                    <span>More</span>
                </div>
                <div className="tile-map-caption">
                    {visitedCount} of {window.INDIA_TILES.length} states &amp; union territories
                </div>
            </div>

            <div className="tile-grid" role="list">
                {shown.map(tile => (
                    <button
                        key={tile.name}
                        role="listitem"
                        className={`tile level-${intensity(tile)} ${tile.visited ? 'is-visited' : ''}`}
                        style={{ gridColumn: tile.col, gridRow: tile.row }}
                        onClick={() => onSelect(tile.name)}
                        onMouseEnter={() => setHovered(tile.name)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(tile.name)}
                        onBlur={() => setHovered(null)}
                        title={`${tile.name} — ${tile.places} visited, ${tile.wishlist} to visit`}
                        aria-label={`${tile.name}, ${tile.places} places visited, ${tile.wishlist} to visit`}
                    >
                        <span className="tile-short">{tile.short}</span>
                        {tile.places > 0 && <span className="tile-count">{tile.places}</span>}
                    </button>
                ))}
            </div>

            <div className={`tile-readout ${active ? 'is-active' : ''}`}>
                {active ? (
                    <React.Fragment>
                        <span className="tile-readout-name">{active.name}</span>
                        <span className="tile-readout-stats">
                            {active.places} visited · {active.wishlist} to visit
                            {(active.data.treks || []).length ? ` · ${(active.data.treks || []).length} treks` : ''}
                        </span>
                    </React.Fragment>
                ) : (
                    <span className="tile-readout-hint">Hover a tile for detail, click to open the state</span>
                )}
            </div>

            <p className="tile-map-note">
                Tiles are positioned by approximate geography, not drawn to shape — every state gets equal space.
            </p>

            <style>{`
                .tile-map {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                }

                .tile-map-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }

                .tile-map-legend {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                }

                .legend-swatch {
                    width: 16px;
                    height: 10px;
                    border-radius: 2px;
                    border: 1px solid var(--border);
                }

                .tile-map-caption { color: var(--text-secondary); font-size: 0.85rem; }

                .tile-grid {
                    display: grid;
                    grid-template-columns: repeat(9, minmax(0, 1fr));
                    grid-auto-rows: minmax(46px, auto);
                    gap: 6px;
                    max-width: 620px;
                    margin: 0 auto;
                }

                .tile {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1px;
                    border-radius: 6px;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    color: var(--text-muted);
                    font-family: inherit;
                    cursor: pointer;
                    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
                }

                .tile:hover, .tile:focus-visible {
                    transform: translateY(-2px);
                    border-color: var(--primary);
                    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
                    outline: none;
                }

                .tile-short { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.03em; }
                .tile-count { font-size: 0.62rem; opacity: 0.85; font-variant-numeric: tabular-nums; }

                /* Density bands — same hue, increasing presence */
                .level-0 { background: rgba(255,255,255,0.03); }
                .level-1 { background: rgba(99,102,241,0.18); color: #c7d2fe; border-color: rgba(99,102,241,0.25); }
                .level-2 { background: rgba(99,102,241,0.34); color: #e0e7ff; border-color: rgba(99,102,241,0.4); }
                .level-3 { background: rgba(99,102,241,0.55); color: #fff; border-color: rgba(99,102,241,0.6); }
                .level-4 { background: rgba(99,102,241,0.8); color: #fff; border-color: rgba(129,140,248,0.9); }

                .tile-readout {
                    margin-top: 1.25rem;
                    min-height: 2.4rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.15rem;
                    padding: 0.5rem;
                    border-radius: var(--radius-md);
                    background: rgba(255,255,255,0.02);
                    text-align: center;
                }

                .tile-readout-name { font-weight: 600; color: var(--text-primary); }
                .tile-readout-stats { color: var(--text-secondary); font-size: 0.85rem; font-variant-numeric: tabular-nums; }
                .tile-readout-hint { color: var(--text-muted); font-size: 0.85rem; }

                .tile-map-note {
                    margin: 1rem 0 0;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                }

                @media (max-width: 640px) {
                    .tile-map { padding: 1rem; }
                    .tile-grid { gap: 4px; grid-auto-rows: minmax(38px, auto); }
                    .tile-short { font-size: 0.62rem; }
                    .tile-count { font-size: 0.55rem; }
                }
            `}</style>
        </div>
    );
};
