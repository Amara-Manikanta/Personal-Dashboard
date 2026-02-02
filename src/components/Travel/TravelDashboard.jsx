
console.log("Loading TravelDashboard.jsx (Restored)");

window.TravelDashboard = ({ onBackToHome, onNavigateToState }) => {
    const { useState, useEffect, useMemo } = React;
    const TravelData = window.TravelData || {};
    const { getStatesData, getCountriesData, getStateStats, getCountryStats, getBucketList, saveBucketList } = TravelData;
    const StateCard = window.StateCard;

    const [viewMode, setViewMode] = useState('states'); // 'states' | 'countries' | 'bucket-list'
    const [items, setItems] = useState([]);
    const [bucketList, setBucketList] = useState([]);
    const [newItemText, setNewItemText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'visited'

    useEffect(() => {
        if (!getStatesData || !getCountriesData) {
            console.error("TravelData methods missing");
            return;
        }
        if (viewMode === 'bucket-list') {
            setBucketList(getBucketList());
        } else {
            setItems(viewMode === 'states' ? getStatesData() : getCountriesData());
        }
    }, [viewMode]);

    const filteredItems = items.filter(item => {
        const searchLower = searchTerm.toLowerCase();

        // Search in name
        if (item.name.toLowerCase().includes(searchLower)) return true;
        if (!searchTerm) return true;

        // Helper to search in arrays
        const searchInArray = (arr) => arr && arr.some(i => {
            if (typeof i === 'string') return i.toLowerCase().includes(searchLower);
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

        // If no search matches, checks filter only if search term is present but didn't match anything above? 
        // actually existing logic combined search AND filter. 
        // Let's refine: item must match search AND filter.

        return false;
    }).filter(item => {
        // Apply visited filter
        return filter === 'all'
            ? true
            : (filter === 'visited' ? (item.visited || (item.placesVisited && item.placesVisited.length > 0)) : true);
    }).sort((a, b) => {
        // 1. Sort by places visited count (descending)
        const countA = (a.placesVisited && a.placesVisited.length) || 0;
        const countB = (b.placesVisited && b.placesVisited.length) || 0;
        if (countA !== countB) return countB - countA;

        // 2. Sort by visited status (visited first)
        if (a.visited !== b.visited) return a.visited ? -1 : 1;

        // 3. Sort alphabetically
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
                    <button
                        className={viewMode === 'bucket-list' ? 'active' : ''}
                        onClick={() => setViewMode('bucket-list')}
                    >
                        Bucket List
                    </button>
                </div>

                <div className="search-box">
                    <i className="ph-bold ph-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder={viewMode === 'bucket-list' ? "Search items..." : (viewMode === 'states' ? "Find a state..." : "Find a country...")}
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

            {viewMode === 'bucket-list' ? (
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
                            bucketList.filter(item => item.text.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
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
            ) : (
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
