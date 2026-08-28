
console.log("Loading TravelDashboard.jsx (Restored)");

/** Flat list of entries, optionally grouped under their state/country. */
const EntryList = ({ entries, emptyIcon, emptyText, onSelect, groupByRegion }) => {
    if (!entries.length) {
        return (
            <div className="empty-state">
                <i className={`ph-duotone ${emptyIcon}`}></i>
                <p>{emptyText}</p>
            </div>
        );
    }

    if (!groupByRegion) {
        return (
            <div className="entry-grid">
                {entries.map((e, i) => (
                    <button key={`${e.region}-${e.name}-${i}`} className="entry-tile" onClick={() => onSelect(e.region)}>
                        <span className="entry-tile-name">{e.name}</span>
                        <span className="entry-tile-meta">{[e.city, e.region].filter(Boolean).join(' · ')}</span>
                    </button>
                ))}
            </div>
        );
    }

    const groups = entries.reduce((acc, e) => {
        (acc[e.region] = acc[e.region] || []).push(e);
        return acc;
    }, {});

    // Busiest regions first — that is where the planning happens.
    const ordered = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

    return (
        <div className="entry-groups">
            {ordered.map(region => (
                <section key={region} className="entry-group">
                    <header className="entry-group-head">
                        <button className="entry-group-title" onClick={() => onSelect(region)}>
                            {region}
                            <i className="ph-bold ph-arrow-right"></i>
                        </button>
                        <span className="entry-group-count">{groups[region].length}</span>
                    </header>
                    <div className="entry-chip-wrap">
                        {groups[region].map((e, i) => (
                            <button
                                key={`${e.name}-${i}`}
                                className="entry-chip"
                                onClick={() => onSelect(e.region)}
                                title={e.remarks && e.remarks !== '-' ? e.remarks : e.name}
                            >
                                {e.name}
                                {e.city && e.city !== '-' && <span className="entry-chip-city">{e.city}</span>}
                            </button>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

/** Treks carry distance/altitude/difficulty/terrain that nothing else showed. */
const TrekList = ({ treks, onSelect }) => {
    if (!treks.length) {
        return (
            <div className="empty-state">
                <i className="ph-duotone ph-mountains"></i>
                <p>No treks logged yet.</p>
            </div>
        );
    }

    const totalKm = treks.reduce((sum, t) => sum + (parseFloat((t.raw && t.raw.distance) || 0) || 0), 0);
    const done = treks.filter(t => t.raw && t.raw.isVisited).length;

    const difficultyClass = (d) => {
        const v = String(d || '').toLowerCase();
        if (v.startsWith('beg') || v === 'easy') return 'is-easy';
        if (v.startsWith('med')) return 'is-medium';
        if (v.startsWith('hard') || v.startsWith('diff') || v.startsWith('adv')) return 'is-hard';
        return '';
    };

    return (
        <div className="trek-view">
            <div className="trek-summary">
                <div><span className="trek-summary-value">{totalKm.toFixed(1).replace(/\.0$/, '')}</span> km logged</div>
                <div><span className="trek-summary-value">{done}</span> of {treks.length} completed</div>
            </div>

            <div className="trek-grid">
                {treks.map((t, i) => {
                    const d = t.raw && typeof t.raw === 'object' ? t.raw : {};
                    return (
                        <button key={`${t.region}-${t.name}-${i}`} className="trek-card" onClick={() => onSelect(t.region)}>
                            <div className="trek-card-head">
                                <span className="trek-card-name">{t.name}</span>
                                {d.isVisited && <i className="ph-fill ph-check-circle trek-done" title="Completed"></i>}
                            </div>
                            <div className="trek-card-region">{[d.city, t.region].filter(v => v && v !== '-').join(' · ')}</div>
                            <div className="trek-card-facts">
                                {d.distance && <span><i className="ph-bold ph-path"></i>{d.distance} km</span>}
                                {d.altitude && <span><i className="ph-bold ph-arrow-up-right"></i>{d.altitude} ft</span>}
                                {d.difficulty && <span className={`trek-diff ${difficultyClass(d.difficulty)}`}>{d.difficulty}</span>}
                            </div>
                            {d.terrain && d.terrain !== '-' && <div className="trek-card-terrain">{d.terrain}</div>}
                            {d.safetyAlerts && (
                                <div className="trek-card-alert"><i className="ph-fill ph-warning"></i> Safety alerts noted</div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/** Visits grouped by year, for entries that carry a visitedDate. */
const Timeline = ({ entries, onSelect }) => {
    const dated = entries.filter(e => e.visitedDate);

    if (!dated.length) {
        return (
            <div className="empty-state">
                <i className="ph-duotone ph-calendar-blank"></i>
                <p>No visit dates recorded yet.</p>
                <p className="empty-hint">
                    Open any state, edit a place, and set its visit date — dated visits will appear here grouped by year.
                </p>
            </div>
        );
    }

    const byYear = dated.reduce((acc, e) => {
        const year = String(e.visitedDate).slice(0, 4) || 'Undated';
        (acc[year] = acc[year] || []).push(e);
        return acc;
    }, {});

    const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));
    // Dates are month-precision, so show the month alone rather than
    // inventing a day for entries that never recorded one.
    const monthName = (iso) => {
        const formatted = window.formatVisitDate ? window.formatVisitDate(iso) : String(iso || '');
        return formatted.replace(/\s+\d{4}$/, '');
    };

    return (
        <div className="timeline-view">
            {years.map(year => (
                <section key={year} className="timeline-year">
                    <header className="timeline-year-head">
                        <h2>{year}</h2>
                        <span>{byYear[year].length} {byYear[year].length === 1 ? 'visit' : 'visits'}</span>
                    </header>
                    <div className="timeline-items">
                        {byYear[year]
                            .sort((a, b) => String(b.visitedDate).localeCompare(String(a.visitedDate)))
                            .map((e, i) => (
                                <button key={`${e.name}-${i}`} className="timeline-item" onClick={() => onSelect(e.region)}>
                                    <span className="timeline-date">{monthName(e.visitedDate)}</span>
                                    <span className="timeline-name">{e.name}</span>
                                    <span className="timeline-region">{[e.city, e.region].filter(v => v && v !== '-').join(' · ')}</span>
                                </button>
                            ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

window.TravelDashboard = ({ onBackToHome, onNavigateToState }) => {
    const { useState, useEffect, useMemo } = React;
    const TravelData = window.TravelData || {};
    const { getStatesData, getCountriesData, getStateStats, getCountryStats, getBucketList, saveBucketList, getTrips, saveTrips } = TravelData;
    const StateCard = window.StateCard;
    const TravelBadges = window.TravelBadges;
    const TripPlanner = window.TripPlanner;

    // 'states' | 'map' | 'countries' | 'wishlist' | 'treks' | 'timeline' | 'bucket-list' | 'trips'
    const [viewMode, setViewMode] = useState('states');
    const [items, setItems] = useState([]);
    const [bucketList, setBucketList] = useState([]);
    const [trips, setTrips] = useState([]);
    const [newItemText, setNewItemText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'visited'
    const [sortBy, setSortBy] = useState('places'); // 'places' | 'name' | 'wishlist'
    const [mapStyle, setMapStyle] = useState('poster'); // 'poster' | 'tiles'
    const [openCategory, setOpenCategory] = useState(null);
    const PLACE_CATEGORIES = window.PLACE_CATEGORIES || [];

    const REGION_VIEWS = ['states', 'map', 'countries'];

    const refreshCurrentViewData = () => {
        if (!getStatesData || !getCountriesData) return;
        if (viewMode === 'bucket-list') {
            setBucketList(getBucketList ? getBucketList() : []);
        } else if (viewMode === 'trips') {
            setTrips(getTrips ? getTrips() : []);
        } else {
            setItems(viewMode === 'countries' ? getCountriesData() : getStatesData());
        }
    };

    useEffect(() => {
        refreshCurrentViewData();
        window.addEventListener('app-data-loaded', refreshCurrentViewData);
        return () => window.removeEventListener('app-data-loaded', refreshCurrentViewData);
    }, [viewMode]);

    const totals = useMemo(
        () => (window.TravelData && window.TravelData.getTravelTotals ? window.TravelData.getTravelTotals() : null),
        [items]
    );

    const handleSaveTrips = (updatedTrips) => {
        setTrips(updatedTrips);
        if (saveTrips) {
            saveTrips(updatedTrips);
        }
    };

    const allStatesForBadges = useMemo(() => getStatesData ? getStatesData() : [], [items, viewMode]);
    const allCountriesForBadges = useMemo(() => getCountriesData ? getCountriesData() : [], [items, viewMode]);

    /**
     * Every individual entry across every state, flattened once so the
     * dashboard can search, list and sort them without reopening each state.
     */
    const allEntries = useMemo(() => {
        const source = getStatesData ? [...getStatesData(), ...(getCountriesData ? getCountriesData() : [])] : [];
        const kinds = [
            ['placesVisited', 'Place', 'ph-map-pin'],
            ['placesToVisit', 'Wishlist', 'ph-binoculars'],
            ['restaurants', 'Restaurant', 'ph-fork-knife'],
            ['food', 'Food', 'ph-bowl-food'],
            ['treks', 'Trek', 'ph-mountains'],
            ['stays', 'Stay', 'ph-bed']
        ];

        const out = [];
        source.forEach(region => {
            kinds.forEach(([field, kind, icon]) => {
                (region[field] || []).forEach(entry => {
                    const isObj = entry && typeof entry === 'object';
                    const name = isObj ? entry.name : entry;
                    if (!name) return;
                    out.push({
                        name,
                        kind,
                        icon,
                        field,
                        region: region.name,
                        city: isObj ? (entry.city || '') : '',
                        remarks: isObj ? (entry.remarks || '') : '',
                        category: isObj ? (entry.category || '') : '',
                        visitedDate: isObj ? (entry.visitedDate || '') : '',
                        raw: entry
                    });
                });
            });
        });
        return out;
    }, [items]);

    /** How many visited places carry each category, plus the uncategorised rest. */
    const categoryTotals = useMemo(() => {
        const places = allEntries.filter(e => e.field === 'placesVisited');
        const counts = {};
        let uncategorised = 0;

        places.forEach(p => {
            if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
            else uncategorised++;
        });

        const rows = (window.PLACE_CATEGORIES || [])
            .map(cat => ({ ...cat, count: counts[cat.id] || 0 }))
            .filter(row => row.count > 0)
            .sort((a, b) => b.count - a.count);

        return { rows, uncategorised, categorised: places.length - uncategorised, total: places.length };
    }, [allEntries]);

    const searchLower = searchTerm.trim().toLowerCase();

    // Individual entries matching the search — shown alongside region cards so
    // a hit like "Golconda" tells you what matched, not just which state.
    const entryMatches = useMemo(() => {
        if (!searchLower) return [];
        return allEntries
            .filter(e =>
                e.name.toLowerCase().includes(searchLower) ||
                e.city.toLowerCase().includes(searchLower) ||
                e.remarks.toLowerCase().includes(searchLower) ||
                e.category.toLowerCase().includes(searchLower))
            .slice(0, 60);
    }, [searchLower, allEntries]);

    const filteredItems = items.filter(item => {
        const searchLower = searchTerm.toLowerCase();

        // Search in name
        if ((item.name || '').toLowerCase().includes(searchLower)) return true;
        if (!searchTerm) return true;

        // Helper to search in arrays
        const searchInArray = (arr) => arr && arr.some(i => {
            if (typeof i === 'string') return String(i).toLowerCase().includes(searchLower);
            if (typeof i === 'object' && i !== null) {
                return (i.name || '').toLowerCase().includes(searchLower) ||
                    (i.city || '').toLowerCase().includes(searchLower) ||
                    (i.remarks || '').toLowerCase().includes(searchLower);
            }
            return false;
        });

        // Deep search in all lists
        const matchesDeepSearch =
            searchInArray(item.placesVisited) ||
            searchInArray(item.placesToVisit) ||
            searchInArray(item.restaurants) ||
            searchInArray(item.food) ||
            searchInArray(item.treks) ||
            searchInArray(item.stays);

        if (matchesDeepSearch) return true;

        return false;
    }).filter(item => {
        // Apply visited filter
        return filter === 'all'
            ? true
            : (filter === 'visited' ? (item.visited || (item.placesVisited && item.placesVisited.length > 0)) : true);
    }).sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);

        const key = sortBy === 'wishlist' ? 'placesToVisit' : 'placesVisited';
        const countA = (a[key] && a[key].length) || 0;
        const countB = (b[key] && b[key].length) || 0;
        if (countA !== countB) return countB - countA;

        if (a.visited !== b.visited) return a.visited ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    const stats = useMemo(() => {
        if (!getStateStats || !getCountryStats) return { visitedStates: 0, totalStates: 0 };
        return viewMode === 'states' ? getStateStats() : getCountryStats();
    }, [items, viewMode]);

    return (
        <div className="travel-dashboard fade-in">
            <header className="dashboard-header">
                <div className="header-left">
                    <button className="btn-icon" onClick={onBackToHome}>
                        <i className="ph-bold ph-arrow-left"></i>
                    </button>
                    <h1>Travel Tracker</h1>
                </div>

                <div className="header-stats">
                    <div className="stat-pill">
                        <span className="label">{viewMode === 'countries' ? 'Countries Visited' : 'States Visited'}</span>
                        <span className="value">
                            {viewMode === 'trips' ? `${trips.length} Trips` : (viewMode === 'countries'
                                ? (totals ? totals.countriesVisited : stats.visitedCountries)
                                : `${totals ? totals.statesVisited : stats.visitedStates} / ${totals ? totals.statesTotal : stats.totalStates}`)}
                        </span>
                    </div>
                </div>
            </header>

            {/* Feature 5: Achievement Badges */}
            {TravelBadges && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <TravelBadges statesData={allStatesForBadges} countriesData={allCountriesForBadges} />
                </div>
            )}

            {/* Everything logged, across every state and country */}
            {totals && (
                <div className="travel-totals">
                    {[
                        ['ph-map-pin', totals.placesVisited, 'place visited', 'places visited', 'states'],
                        ['ph-binoculars', totals.placesToVisit, 'to visit', 'to visit', 'wishlist'],
                        ['ph-fork-knife', totals.restaurants, 'restaurant', 'restaurants', null],
                        ['ph-bowl-food', totals.food, 'food to try', 'foods to try', null],
                        ['ph-mountains', totals.treks, 'trek', 'treks', 'treks'],
                        ['ph-bed', totals.stays, 'stay', 'stays', null],
                        ['ph-globe-hemisphere-east', totals.countriesVisited, 'country', 'countries', 'countries']
                    ].map(([icon, value, one, many, target]) => (
                        <button
                            key={many}
                            className={`travel-total ${target ? 'is-clickable' : ''}`}
                            onClick={() => target && setViewMode(target)}
                            disabled={!target}
                        >
                            <i className={`ph-fill ${icon}`}></i>
                            <span className="travel-total-value">{value}</span>
                            <span className="travel-total-label">{value === 1 ? one : many}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Category counts up front — the answer to "how many temples?"
                without needing to find the Categories tab. */}
            {categoryTotals.rows.length > 0 && (
                <div className="travel-cats">
                    <span className="travel-cats-label">By category</span>
                    {categoryTotals.rows.slice(0, 10).map(row => (
                        <button
                            key={row.id}
                            className="travel-cat-chip"
                            style={{ '--cat-color': row.color }}
                            onClick={() => { setOpenCategory(row.id); setViewMode('categories'); }}
                            title={`${row.count} ${row.label}`}
                        >
                            <window.CategoryIcon category={row} size={16} />
                            <strong>{row.count}</strong>
                            <span>{row.label}</span>
                        </button>
                    ))}
                    <button className="travel-cat-more" onClick={() => setViewMode('categories')}>
                        All {categoryTotals.rows.length} categories <i className="ph-bold ph-arrow-right"></i>
                    </button>
                </div>
            )}

            {/* Data keyed under a name that matches neither list is invisible
                everywhere else in the UI — say so rather than losing it. */}
            {totals && totals.orphans && totals.orphans.length > 0 && (
                <div className="travel-orphans">
                    <i className="ph-fill ph-warning"></i>
                    <span>
                        {totals.orphans.map(o => `“${o.name}” (${o.items} ${o.items === 1 ? 'entry' : 'entries'})`).join(', ')}
                        {' '}{totals.orphans.length === 1 ? 'is' : 'are'} stored under a name that is not a known state or country, so
                        {totals.orphans.length === 1 ? ' it does' : ' they do'} not appear in any list.
                    </span>
                </div>
            )}

            <div className="controls-bar">
                <div className="view-toggles">
                    {[
                        ['states', 'India'],
                        ['map', 'Map'],
                        ['countries', 'World'],
                        ['wishlist', 'To Visit'],
                        ['treks', 'Treks'],
                        ['categories', 'Categories'],
                        ['timeline', 'Timeline'],
                        ['bucket-list', 'Bucket List'],
                        ['trips', '✈️ Trips']
                    ].map(([mode, label]) => (
                        <button
                            key={mode}
                            className={viewMode === mode ? 'active' : ''}
                            onClick={() => setViewMode(mode)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="search-box">
                    <i className="ph-bold ph-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder={{
                            'bucket-list': 'Search items...',
                            countries: 'Find a country...',
                            wishlist: 'Search places to visit...',
                            treks: 'Search treks...',
                            timeline: 'Search visits...',
                            map: 'Find a state...',
                            trips: 'Search trips...',
                            states: 'Search states, places, food, treks...'
                        }[viewMode] || 'Search...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {REGION_VIEWS.includes(viewMode) && (
                    <React.Fragment>
                        <div className="filter-tabs">
                            <button
                                className={filter === 'all' ? 'active' : ''}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={filter === 'visited' ? 'active' : ''}
                                onClick={() => setFilter('visited')}
                            >
                                Visited
                            </button>
                        </div>

                        {viewMode !== 'map' && (
                            <div className="sort-select">
                                <label htmlFor="travel-sort">Sort</label>
                                <select id="travel-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="places">Most places</option>
                                    <option value="wishlist">Most to visit</option>
                                    <option value="name">A–Z</option>
                                </select>
                            </div>
                        )}
                    </React.Fragment>
                )}
            </div>

            {/* Search hits on individual entries, not just region names */}
            {searchLower && entryMatches.length > 0 && (
                <div className="entry-matches">
                    <div className="entry-matches-head">
                        <h2>{entryMatches.length} {entryMatches.length === 1 ? 'match' : 'matches'} for “{searchTerm}”</h2>
                    </div>
                    <div className="entry-matches-list">
                        {entryMatches.map((e, i) => (
                            <button
                                key={`${e.region}-${e.field}-${e.name}-${i}`}
                                className="entry-match"
                                onClick={() => onNavigateToState(e.region)}
                            >
                                <i className={`ph-fill ${e.icon}`}></i>
                                <span className="entry-match-name">{e.name}</span>
                                {e.city && <span className="entry-match-city">{e.city}</span>}
                                <span className="entry-match-region">{e.region}</span>
                                <span className="entry-match-kind">{e.kind}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {viewMode === 'trips' && TripPlanner ? (
                <TripPlanner trips={trips} onSaveTrips={handleSaveTrips} statesData={allStatesForBadges} />
            ) : viewMode === 'map' ? (
                <React.Fragment>
                    <div className="map-style-toggle">
                        <button className={mapStyle === 'poster' ? 'active' : ''} onClick={() => setMapStyle('poster')}>
                            <i className="ph-bold ph-map-pin-line"></i> Poster
                        </button>
                        <button className={mapStyle === 'tiles' ? 'active' : ''} onClick={() => setMapStyle('tiles')}>
                            <i className="ph-bold ph-squares-four"></i> Density
                        </button>
                    </div>

                    {mapStyle === 'poster' && window.IndiaPosterMap ? (
                        <window.IndiaPosterMap
                            states={items}
                            onSelect={onNavigateToState}
                            categories={PLACE_CATEGORIES}
                        />
                    ) : (
                        <window.IndiaTileMap
                            states={items}
                            onSelect={onNavigateToState}
                            filter={filter}
                        />
                    )}
                </React.Fragment>
            ) : viewMode === 'wishlist' ? (
                <EntryList
                    entries={allEntries.filter(e => e.field === 'placesToVisit' && (!searchLower || e.name.toLowerCase().includes(searchLower)))}
                    emptyIcon="ph-binoculars"
                    emptyText="Nothing on the list yet. Add places to visit from any state page."
                    onSelect={onNavigateToState}
                    groupByRegion
                />
            ) : viewMode === 'treks' ? (
                <TrekList
                    treks={allEntries.filter(e => e.field === 'treks' && (!searchLower || e.name.toLowerCase().includes(searchLower)))}
                    onSelect={onNavigateToState}
                />
            ) : viewMode === 'categories' ? (
                <div className="cat-view">
                    <div className="cat-summary">
                        <span><strong>{categoryTotals.categorised}</strong> of {categoryTotals.total} places categorised</span>
                        {categoryTotals.uncategorised > 0 && (
                            <button className="cat-uncat" onClick={() => setOpenCategory('__none')}>
                                {categoryTotals.uncategorised} still uncategorised
                            </button>
                        )}
                    </div>

                    <div className="cat-grid">
                        {categoryTotals.rows.map(row => {
                            const share = categoryTotals.categorised
                                ? Math.round((row.count / categoryTotals.categorised) * 100)
                                : 0;
                            const isOpen = openCategory === row.id;
                            return (
                                <button
                                    key={row.id}
                                    className={`cat-card ${isOpen ? 'is-open' : ''}`}
                                    style={{ '--cat-color': row.color }}
                                    onClick={() => setOpenCategory(isOpen ? null : row.id)}
                                >
                                    <window.CategoryIcon category={row} size={20} />
                                    <span className="cat-count">{row.count}</span>
                                    <span className="cat-label">{row.label}</span>
                                    <span className="cat-bar"><span style={{ width: `${share}%` }}></span></span>
                                    <span className="cat-share">{share}%</span>
                                </button>
                            );
                        })}
                    </div>

                    {openCategory && (() => {
                        const cat = categoryTotals.rows.find(r => r.id === openCategory);
                        const label = openCategory === '__none' ? 'Uncategorised' : (cat ? cat.label : openCategory);
                        const matching = allEntries.filter(e =>
                            e.field === 'placesVisited' &&
                            (openCategory === '__none' ? !e.category : e.category === openCategory));

                        return (
                            <section className="cat-drill">
                                <header className="cat-drill-head">
                                    <h2>
                                        {cat && <window.CategoryIcon category={cat} size={22} />}
                                        {label}
                                        <span className="cat-drill-count">{matching.length}</span>
                                    </h2>
                                    <button onClick={() => setOpenCategory(null)}>
                                        <i className="ph-bold ph-x"></i> Close
                                    </button>
                                </header>
                                <EntryList
                                    entries={matching}
                                    emptyIcon="ph-map-pin"
                                    emptyText="Nothing here yet."
                                    onSelect={onNavigateToState}
                                    groupByRegion
                                />
                            </section>
                        );
                    })()}
                </div>
            ) : viewMode === 'timeline' ? (
                <Timeline
                    entries={allEntries.filter(e => e.field === 'placesVisited')}
                    onSelect={onNavigateToState}
                />
            ) : viewMode === 'bucket-list' ? (
                <div className="bucket-list-container">
                    <div className="add-item-form">
                        <input
                            type="text"
                            placeholder="I want to..."
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newItemText.trim()) {
                                    const newList = [...bucketList, { id: Date.now(), text: newItemText.trim(), completed: false }];
                                    setBucketList(newList);
                                    saveBucketList(newList);
                                    setNewItemText('');
                                }
                            }}
                        />
                        <button
                            className="add-btn"
                            disabled={!newItemText.trim()}
                            onClick={() => {
                                if (newItemText.trim()) {
                                    const newList = [...bucketList, { id: Date.now(), text: newItemText.trim(), completed: false }];
                                    setBucketList(newList);
                                    saveBucketList(newList);
                                    setNewItemText('');
                                }
                            }}
                        >
                            <i className="ph-bold ph-plus"></i>
                        </button>
                    </div>

                    <div className="bucket-list-items">
                        {bucketList.length === 0 ? (
                            <div className="empty-state">
                                <i className="ph-duotone ph-list-checks"></i>
                                <p>Your bucket list is empty. Add something you dream of doing!</p>
                            </div>
                        ) : (
                            bucketList.filter(item => (item.text || '').toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                                <div key={item.id} className={`bucket-item ${item.completed ? 'completed' : ''}`}>
                                    <button
                                        className="check-btn"
                                        onClick={() => {
                                            const newList = bucketList.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i);
                                            setBucketList(newList);
                                            saveBucketList(newList);
                                        }}
                                    >
                                        <i className={`ph-bold ${item.completed ? 'ph-check-square' : 'ph-square'}`}></i>
                                    </button>
                                    <span className="item-text">{item.text}</span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => {
                                            const newList = bucketList.filter(i => i.id !== item.id);
                                            setBucketList(newList);
                                            saveBucketList(newList);
                                        }}
                                    >
                                        <i className="ph-bold ph-trash"></i>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (viewMode === 'states' || viewMode === 'countries') && (
                <div className="states-grid">
                    {filteredItems.map(item => (
                        <StateCard
                            key={item.name}
                            state={item}
                            onClick={onNavigateToState}
                        />
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="empty-state">
                            <i className="ph-duotone ph-map-trifold"></i>
                            <p>No {viewMode === 'states' ? 'states' : 'countries'} found matching your search</p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .travel-dashboard {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    min-height: 100vh;
                }

                .dashboard-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-left h1 {
                    font-size: 2rem;
                    margin: 0;
                    background: linear-gradient(to right, #fff, var(--primary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .btn-icon {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1.25rem;
                }

                .btn-icon:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .stat-pill {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    padding: 0.5rem 1rem;
                    border-radius: 100px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .stat-pill .value {
                    font-weight: 700;
                    color: var(--primary);
                }

                .controls-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .search-box {
                    flex: 1;
                    min-width: 200px;
                    position: relative;
                }

                .search-box i {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .search-box input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 1rem;
                }

                .search-box input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
                }
                
                .filter-tabs, .view-toggles {
                    display: flex;
                    background: var(--bg-surface);
                    padding: 0.25rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                }
                
                .filter-tabs button, .view-toggles button {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                }
                
                .filter-tabs button.active, .view-toggles button.active {
                    background: var(--primary);
                    color: white;
                }

                .states-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                    align-items: stretch;
                }

                .map-style-toggle {
                    display: inline-flex;
                    gap: 0.25rem;
                    padding: 0.25rem;
                    margin-bottom: 1rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                }

                .map-style-toggle button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.4rem 0.85rem;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-sm);
                    color: var(--text-muted);
                    font-family: inherit;
                    font-size: 0.82rem;
                    cursor: pointer;
                }

                .map-style-toggle button.active { background: var(--primary); color: #fff; }

                /* ---- Totals strip ---- */
                .travel-totals {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .travel-total {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.15rem;
                    padding: 0.85rem 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    font-family: inherit;
                    text-align: left;
                }

                .travel-total i { font-size: 1rem; color: var(--primary); margin-bottom: 0.15rem; }
                .travel-total-value { font-size: 1.35rem; font-weight: 700; color: var(--text-primary); font-variant-numeric: tabular-nums; line-height: 1; }
                .travel-total-label { font-size: 0.72rem; color: var(--text-muted); }

                .travel-total.is-clickable { cursor: pointer; transition: all 0.2s ease; }
                .travel-total.is-clickable:hover { border-color: var(--primary); transform: translateY(-2px); }

                .travel-orphans {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.6rem;
                    padding: 0.75rem 1rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(251,191,36,0.3);
                    background: rgba(251,191,36,0.07);
                    border-radius: var(--radius-md);
                    color: #fcd34d;
                    font-size: 0.82rem;
                    line-height: 1.5;
                }

                .travel-orphans i { flex-shrink: 0; margin-top: 0.1rem; }

                .sort-select {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0 0.75rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                }

                .sort-select label { color: var(--text-muted); font-size: 0.8rem; }

                .sort-select select {
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 0.85rem;
                    padding: 0.5rem 0;
                    cursor: pointer;
                    outline: none;
                }

                /* ---- Search hits on individual entries ---- */
                .entry-matches {
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.02);
                    border-radius: var(--radius-lg);
                    padding: 1rem 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .entry-matches-head h2 {
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    margin: 0 0 0.75rem;
                }

                .entry-matches-list { display: flex; flex-direction: column; gap: 0.25rem; max-height: 320px; overflow-y: auto; }

                .entry-match {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    padding: 0.5rem 0.6rem;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-sm);
                    color: var(--text-secondary);
                    font-family: inherit;
                    font-size: 0.88rem;
                    text-align: left;
                    cursor: pointer;
                }

                .entry-match:hover { background: rgba(99,102,241,0.12); color: #fff; }
                .entry-match i { color: var(--primary); flex-shrink: 0; }
                .entry-match-name { font-weight: 500; }
                .entry-match-city, .entry-match-region { color: var(--text-muted); font-size: 0.78rem; }
                .entry-match-region::before { content: '· '; }
                .entry-match-kind {
                    margin-left: auto;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-muted);
                    flex-shrink: 0;
                }

                /* ---- Grouped entry lists (wishlist) ---- */
                .entry-groups { display: flex; flex-direction: column; gap: 1.5rem; }

                .entry-group {
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.02);
                    border-radius: var(--radius-lg);
                    padding: 1rem 1.25rem 1.25rem;
                }

                .entry-group-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.85rem;
                }

                .entry-group-title {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    padding: 0;
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .entry-group-title:hover { color: var(--primary); }
                .entry-group-title i { font-size: 0.85rem; opacity: 0.6; }

                .entry-group-count {
                    background: rgba(255,255,255,0.07);
                    border-radius: 99px;
                    padding: 0.1rem 0.6rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-variant-numeric: tabular-nums;
                }

                .entry-chip-wrap { display: flex; flex-wrap: wrap; gap: 0.4rem; }

                .entry-chip {
                    display: inline-flex;
                    align-items: baseline;
                    gap: 0.4rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 99px;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    color: var(--text-secondary);
                    font-family: inherit;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .entry-chip:hover { border-color: var(--primary); color: #fff; transform: translateY(-1px); }
                .entry-chip-city { color: var(--text-muted); font-size: 0.7rem; }

                .entry-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 0.75rem;
                }

                .entry-tile {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    padding: 0.85rem 1rem;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    border-radius: var(--radius-md);
                    text-align: left;
                    font-family: inherit;
                    cursor: pointer;
                }

                .entry-tile-name { color: var(--text-primary); font-weight: 500; font-size: 0.9rem; }
                .entry-tile-meta { color: var(--text-muted); font-size: 0.75rem; }

                /* ---- Treks ---- */
                .trek-summary {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                    padding: 1rem 1.25rem;
                    margin-bottom: 1.25rem;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    border-radius: var(--radius-lg);
                    color: var(--text-muted);
                    font-size: 0.88rem;
                }

                .trek-summary-value { color: var(--text-primary); font-weight: 700; font-size: 1.15rem; font-variant-numeric: tabular-nums; }

                .trek-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 1rem;
                }

                .trek-card {
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                    padding: 1.1rem;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    border-radius: var(--radius-lg);
                    text-align: left;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .trek-card:hover { border-color: var(--primary); transform: translateY(-3px); }

                .trek-card-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
                .trek-card-name { color: var(--text-primary); font-weight: 600; }
                .trek-done { color: #10b981; }
                .trek-card-region { color: var(--text-muted); font-size: 0.78rem; }

                .trek-card-facts { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.15rem; }

                .trek-card-facts span {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.2rem 0.55rem;
                    border-radius: 99px;
                    background: rgba(255,255,255,0.06);
                    color: var(--text-secondary);
                    font-size: 0.72rem;
                    font-variant-numeric: tabular-nums;
                }

                .trek-diff.is-easy { background: rgba(16,185,129,0.18); color: #6ee7b7; }
                .trek-diff.is-medium { background: rgba(245,158,11,0.18); color: #fcd34d; }
                .trek-diff.is-hard { background: rgba(239,68,68,0.18); color: #fca5a5; }

                .trek-card-terrain { color: var(--text-muted); font-size: 0.75rem; }
                .trek-card-alert { color: #fcd34d; font-size: 0.72rem; display: flex; align-items: center; gap: 0.3rem; }

                .travel-cats {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.45rem;
                    margin-bottom: 1.5rem;
                }

                .travel-cats-label {
                    font-size: 0.68rem;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    margin-right: 0.35rem;
                }

                .travel-cat-chip {
                    --cat-color: var(--primary);
                    display: inline-flex;
                    align-items: baseline;
                    gap: 0.35rem;
                    padding: 0.35rem 0.7rem;
                    border-radius: 99px;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    color: var(--text-secondary);
                    font-family: inherit;
                    font-size: 0.78rem;
                    cursor: pointer;
                    transition: all 0.18s ease;
                }

                .travel-cat-chip i { color: var(--cat-color); font-size: 0.85rem; align-self: center; }
                .travel-cat-chip strong { color: var(--text-primary); font-variant-numeric: tabular-nums; }
                .travel-cat-chip:hover { border-color: var(--cat-color); transform: translateY(-1px); }

                .travel-cat-more {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-family: inherit;
                    font-size: 0.75rem;
                    cursor: pointer;
                }

                .travel-cat-more:hover { color: var(--primary); }

                /* ---- Category breakdown ---- */
                .cat-summary {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                    padding: 0.85rem 1.1rem;
                    margin-bottom: 1.25rem;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    border-radius: var(--radius-lg);
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }

                .cat-summary strong { color: var(--text-primary); font-size: 1.05rem; font-variant-numeric: tabular-nums; }

                .cat-uncat {
                    margin-left: auto;
                    background: none;
                    border: 1px solid rgba(251,191,36,0.35);
                    color: #fcd34d;
                    border-radius: 99px;
                    padding: 0.25rem 0.75rem;
                    font-family: inherit;
                    font-size: 0.78rem;
                    cursor: pointer;
                }

                .cat-uncat:hover { background: rgba(251,191,36,0.12); }

                .cat-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 0.85rem;
                }

                .cat-card {
                    --cat-color: var(--primary);
                    display: grid;
                    grid-template-columns: auto 1fr;
                    grid-template-areas:
                        "icon count"
                        "label label"
                        "bar share";
                    align-items: center;
                    gap: 0.25rem 0.6rem;
                    padding: 0.9rem 1rem;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    border-radius: var(--radius-lg);
                    font-family: inherit;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .cat-card:hover, .cat-card.is-open {
                    border-color: var(--cat-color);
                    transform: translateY(-2px);
                }

                .cat-card i, .cat-card .category-icon { grid-area: icon; font-size: 1.15rem; color: var(--cat-color); }
                .cat-count {
                    grid-area: count;
                    justify-self: end;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1;
                    font-variant-numeric: tabular-nums;
                }
                .cat-label { grid-area: label; color: var(--text-secondary); font-size: 0.8rem; }
                .cat-bar {
                    grid-area: bar;
                    height: 4px;
                    border-radius: 2px;
                    background: rgba(255,255,255,0.08);
                    overflow: hidden;
                    margin-top: 0.35rem;
                }
                .cat-bar span { display: block; height: 100%; background: var(--cat-color); border-radius: 2px; }
                .cat-share {
                    grid-area: share;
                    justify-self: end;
                    color: var(--text-muted);
                    font-size: 0.68rem;
                    font-variant-numeric: tabular-nums;
                    margin-top: 0.35rem;
                }

                .cat-drill { margin-top: 1.75rem; }

                .cat-drill-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.6rem;
                    border-bottom: 1px solid var(--border);
                }

                .cat-drill-head h2 {
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    font-size: 1.15rem;
                    color: var(--text-primary);
                }

                .cat-drill-count {
                    background: rgba(255,255,255,0.08);
                    border-radius: 99px;
                    padding: 0.1rem 0.6rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-variant-numeric: tabular-nums;
                }

                .cat-drill-head button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-family: inherit;
                    font-size: 0.82rem;
                    cursor: pointer;
                }

                .cat-drill-head button:hover { color: var(--text-primary); }

                /* ---- Timeline ---- */
                .timeline-view { display: flex; flex-direction: column; gap: 2rem; }

                .timeline-year-head {
                    display: flex;
                    align-items: baseline;
                    gap: 0.75rem;
                    padding-bottom: 0.5rem;
                    margin-bottom: 0.75rem;
                    border-bottom: 1px solid var(--border);
                }

                .timeline-year-head h2 { margin: 0; font-size: 1.5rem; color: var(--text-primary); }
                .timeline-year-head span { color: var(--text-muted); font-size: 0.82rem; }

                .timeline-items { display: flex; flex-direction: column; gap: 0.3rem; }

                .timeline-item {
                    display: grid;
                    grid-template-columns: 84px 1fr auto;
                    gap: 1rem;
                    align-items: baseline;
                    padding: 0.55rem 0.75rem;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-sm);
                    color: var(--text-secondary);
                    font-family: inherit;
                    text-align: left;
                    cursor: pointer;
                }

                .timeline-item:hover { background: rgba(99,102,241,0.1); }
                .timeline-date { color: var(--text-muted); font-size: 0.78rem; font-variant-numeric: tabular-nums; }
                .timeline-name { color: var(--text-primary); font-weight: 500; }
                .timeline-region { color: var(--text-muted); font-size: 0.78rem; }

                .empty-hint { font-size: 0.85rem; opacity: 0.75; max-width: 420px; margin: 0.5rem auto 0; }

                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem;
                    color: var(--text-muted);
                }
                
                .empty-state i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                /* Bucket List Styles */
                .bucket-list-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .add-item-form {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .add-item-form input {
                    flex: 1;
                    padding: 1rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 1.1rem;
                }
                
                .add-item-form .add-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    width: 50px;
                    border-radius: var(--radius-md);
                    font-size: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .add-item-form .add-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .bucket-list-items {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .bucket-item {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.2s;
                }
                
                .bucket-item.completed {
                    opacity: 0.6;
                }
                
                .bucket-item.completed .item-text {
                    text-decoration: line-through;
                    color: var(--text-muted);
                }

                .item-text {
                    flex: 1;
                    font-size: 1.1rem;
                }

                .check-btn, .delete-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    color: var(--text-muted);
                    padding: 0.5rem;
                    border-radius: 50%;
                }
                
                .check-btn:hover { color: var(--success, #10b981); background: rgba(16, 185, 129, 0.1); }
                .bucket-item.completed .check-btn { color: var(--success, #10b981); }
                
                .delete-btn:hover { color: var(--danger, #ef4444); background: rgba(239, 68, 68, 0.1); }
            `}</style>
        </div>
    );
};
console.log("TravelDashboard.jsx (Table Layout) Defined:", window.TravelDashboard);
