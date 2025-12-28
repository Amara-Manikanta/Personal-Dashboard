

window.StateDetails = ({ stateName, onBack }) => {
    const { useState, useEffect } = React;
    const { getStatesData, getCountriesData, saveStateData } = window.TravelData;

    // Helper component for list management
    const ListSection = ({ title, icon, items, onItemAdd, placeholder }) => {
        const [newItem, setNewItem] = useState('');

        const handleAdd = (e) => {
            e.preventDefault();
            if (newItem.trim()) {
                onItemAdd(newItem.trim());
                setNewItem('');
            }
        };

        return (
            <div className="detail-section">
                <div className="section-header">
                    <div className="section-title">
                        <i className={`ph-fill ${icon}`}></i>
                        <h3>{title}</h3>
                    </div>
                    <span className="count-badge">{items.length}</span>
                </div>

                <ul className="items-list">
                    {items.map((item, idx) => (
                        <li key={idx}>
                            <i className="ph-bold ph-check-circle"></i>
                            <span>{item}</span>
                        </li>
                    ))}
                    {items.length === 0 && (
                        <li className="empty-item">Nothing added yet</li>
                    )}
                </ul>

                <form onSubmit={handleAdd} className="add-form">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={placeholder}
                    />
                    <button type="submit" disabled={!newItem.trim()}>
                        <i className="ph-bold ph-plus"></i>
                    </button>
                </form>
            </div>
        );
    };

    const [stateData, setStateData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const stateData = getStatesData().find(s => s.name === stateName);
        const countryData = stateData ? null : getCountriesData().find(c => c.name === stateName);
        setStateData(stateData || countryData);
    }, [stateName]);

    const handleUpdate = (field, newItem) => {
        if (!stateData) return;

        const updatedList = [...stateData[field], newItem];
        const success = saveStateData(stateName, {
            [field]: updatedList,
            // If adding a visited place, mark state as visited
            visited: field === 'placesVisited' ? true : stateData.visited
        });

        if (success) {
            setStateData(prev => ({
                ...prev,
                [field]: updatedList,
                visited: field === 'placesVisited' ? true : prev.visited
            }));
        }
    };

    const filterItems = (items) => {
        if (!searchTerm) return items;
        return items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    if (!stateData) return <div>Loading...</div>;

    return (
        <div className="state-details fade-in">
            <header className="details-header">
                <div className="header-left-group">
                    <button className="btn-icon" onClick={onBack}>
                        <i className="ph-bold ph-arrow-left"></i>
                    </button>
                    <div className="header-title">
                        <h1>{stateData.name}</h1>
                        <span className="subtitle">Travel Journal</span>
                    </div>
                </div>

                <div className="search-box glass-search">
                    <i className="ph-bold ph-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="Search places, food..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="details-grid">
                <ListSection
                    title="Highlights"
                    icon="ph-star"
                    items={filterItems(stateData.highlights || [])}
                    onItemAdd={(item) => handleUpdate('highlights', item)}
                    placeholder="Add a key highlight..."
                />

                <ListSection
                    title="Places Visited"
                    icon="ph-map-pin"
                    items={filterItems(stateData.placesVisited)}
                    onItemAdd={(item) => handleUpdate('placesVisited', item)}
                    placeholder="Add a place you've been..."
                />

                <ListSection
                    title="Bucket List"
                    icon="ph-binoculars"
                    items={filterItems(stateData.placesToVisit)}
                    onItemAdd={(item) => handleUpdate('placesToVisit', item)}
                    placeholder="Add a place to visit..."
                />

                <ListSection
                    title="Restaurants Tried"
                    icon="ph-storefront"
                    items={filterItems(stateData.restaurants)}
                    onItemAdd={(item) => handleUpdate('restaurants', item)}
                    placeholder="Add a restaurant..."
                />

                <ListSection
                    title="Food Loved"
                    icon="ph-pizza"
                    items={filterItems(stateData.food)}
                    onItemAdd={(item) => handleUpdate('food', item)}
                    placeholder="Add a dish you loved..."
                />

                <ListSection
                    title="Treks & Adventures"
                    icon="ph-mountains"
                    items={filterItems(stateData.treks)}
                    onItemAdd={(item) => handleUpdate('treks', item)}
                    placeholder="Add a trek or activity..."
                />

                <ListSection
                    title="Stays & Hotels"
                    icon="ph-bed"
                    items={filterItems(stateData.stays || [])}
                    onItemAdd={(item) => handleUpdate('stays', item)}
                    placeholder="Add a hotel or stay..."
                />
            </div>

            <style>{`
                .header-left-group {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .glass-search.search-box {
                    margin-left: auto;
                    min-width: 300px;
                }

                .glass-search input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border);
                    backdrop-filter: blur(10px);
                }

                .glass-search input:focus {
                    background: var(--bg-surface);
                    border-color: var(--primary);
                }
            `}</style>

            <style>{`
                .state-details {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    min-height: 100vh;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .details-header {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .header-title h1 {
                    font-size: 2.5rem;
                    margin: 0;
                    color: var(--text-primary);
                }

                .header-title .subtitle {
                    color: var(--text-muted);
                    font-size: 1rem;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2rem;
                }

                .detail-section {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--primary);
                }

                .section-title i {
                    font-size: 1.5rem;
                }

                .section-title h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: var(--text-primary);
                }

                .count-badge {
                    background: var(--bg-app);
                    color: var(--text-muted);
                    padding: 0.2rem 0.6rem;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .items-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 1.5rem 0;
                    flex: 1;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .items-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--bg-app);
                    color: var(--text-secondary);
                }

                .items-list li:last-child {
                    border-bottom: none;
                }

                .items-list li i {
                    color: var(--primary);
                    margin-top: 0.2rem;
                }

                .empty-item {
                    color: var(--text-muted);
                    font-style: italic;
                    font-size: 0.9rem;
                }

                .add-form {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: auto;
                }

                .add-form input {
                    flex: 1;
                    background: var(--bg-app);
                    border: 1px solid var(--border);
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    transition: border-color 0.2s;
                }

                .add-form input:focus {
                    outline: none;
                    border-color: var(--primary);
                }

                .add-form button {
                    background: var(--primary);
                    color: white;
                    border: none;
                    width: 40px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    transition: opacity 0.2s;
                }

                .add-form button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .add-form button:not(:disabled):hover {
                    opacity: 0.9;
                }
            `}</style>
        </div>
    );
};
