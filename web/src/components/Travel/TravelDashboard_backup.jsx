

console.log("Loading TravelDashboard.jsx");

window.TravelDashboard = ({ onBackToHome, onNavigateToState }) => {
    const { useState, useEffect, useMemo } = React;
    const { getStatesData, getCountriesData, getStateStats, getCountryStats } = window.TravelData;

    const [viewMode, setViewMode] = useState('states'); // 'states' | 'countries'
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'visited'

    useEffect(() => {
        setItems(viewMode === 'states' ? getStatesData() : getCountriesData());
    }, [viewMode]);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all'
            ? true
            : (filter === 'visited' ? (item.visited || (item.placesVisited && item.placesVisited.length > 0)) : true);

        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        // 1. Sort by places visited count (descending)
        const countA = a.placesVisited?.length || 0;
        const countB = b.placesVisited?.length || 0;
        if (countA !== countB) return countB - countA;

        // 2. Sort by visited status (visited first)
        // If counts are equal (e.g. both 0), visited=true comes before visited=false
        if (a.visited !== b.visited) return a.visited ? -1 : 1;

        // 3. Sort alphabetically
        return a.name.localeCompare(b.name);
    });

    const stats = useMemo(() => {
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
                        <span className="label">{viewMode === 'states' ? 'States Visited' : 'Countries Visited'}</span>
                        <span className="value">{stats.visitedStates || stats.visitedCountries} / {stats.totalStates || stats.totalCountries}</span>
                    </div>
                </div>
            </header>

            <div className="controls-bar">
                <div className="view-toggles">
                    <button
                        className={viewMode === 'states' ? 'active' : ''}
                        onClick={() => setViewMode('states')}
                    >
                        India
                    </button>
                    <button
                        className={viewMode === 'countries' ? 'active' : ''}
                        onClick={() => setViewMode('countries')}
                    >
                        World
                    </button>
                </div>

                <div className="search-box">
                    <i className="ph-bold ph-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder={viewMode === 'states' ? "Find a state..." : "Find a country..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

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
            </div>

            <div className="states-grid">
                {filteredItems.map(item => (
                    <window.StateCard
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
                    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
                }
                
                .filter-tabs {
                    display: flex;
                    background: var(--bg-surface);
                    padding: 0.25rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                }
                
                .filter-tabs button {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                }
                
                .filter-tabs button.active {
                    background: var(--primary);
                    color: white;
                }

                .view-toggles {
                    display: flex;
                    background: var(--bg-surface);
                    padding: 0.25rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                }

                .view-toggles button {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                }

                .view-toggles button.active {
                    background: var(--primary);
                    color: white;
                }

                .states-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                
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
            `}</style>
        </div>
    );
};
