
console.log("Loading StateDetails.jsx");

console.log("Loading StateDetails.jsx");
window.StateDetails = ({ stateName, onBack }) => {
    const { useState, useEffect } = React;

    const TravelData = window.TravelData || {};
    const { getStatesData, getCountriesData, saveStateData } = TravelData;

    if (!getStatesData) {
        return (
            <div style={{ padding: '2rem', color: '#ff6b6b', textAlign: 'center' }}>
                <h3>Error: Travel Data Module Not Loaded</h3>
                <p>Please check if statesData.js is loaded correctly in index.html</p>
                <button className="btn-icon" onClick={onBack}>
                    <i className="ph-bold ph-arrow-left"></i> Go Back
                </button>
            </div>
        );
    }

    // Helper to standardize item to object
    const normalizeItem = (item) => {
        if (typeof item === 'string') {
            return { name: item, city: '-', remarks: '-' };
        }
        return {
            name: item.name || '',
            city: item.city || '-',
            remarks: item.remarks || '-'
        };
    };

    // Table Component
    const TableSection = ({ title, icon, items, onItemAdd, onItemUpdate, onItemDelete, placeholder }) => {
        const [newItem, setNewItem] = useState({ name: '', city: '', remarks: '' });
        const [isFormVisible, setIsFormVisible] = useState(false);
        const [editingIndex, setEditingIndex] = useState(-1);
        const [editItem, setEditItem] = useState({ name: '', city: '', remarks: '' });

        const handleAdd = (e) => {
            e.preventDefault();
            if (newItem.name.trim()) {
                onItemAdd({
                    ...newItem,
                    name: newItem.name.trim(),
                    city: newItem.city.trim() || '-',
                    remarks: newItem.remarks.trim() || '-'
                });
                setNewItem({ name: '', city: '', remarks: '' });
                setIsFormVisible(false);
            }
        };

        const startEdit = (index, item) => {
            setEditingIndex(index);
            setEditItem({ ...item });
        };

        const cancelEdit = () => {
            setEditingIndex(-1);
            setEditItem({ name: '', city: '', remarks: '' });
        };

        const saveEdit = (index) => {
            if (editItem.name.trim()) {
                onItemUpdate(index, {
                    ...editItem,
                    name: editItem.name.trim(),
                    city: editItem.city.trim() || '-',
                    remarks: editItem.remarks.trim() || '-'
                });
                setEditingIndex(-1);
            }
        };

        return (
            <div className="detail-section">
                <div className="section-header">
                    <div className="section-title">
                        <i className={`ph-fill ${icon}`}></i>
                        <h3>{title}</h3>
                    </div>
                    <div className="header-actions">
                        <span className="count-badge">{items.length}</span>
                        <button
                            className={`btn-icon-small ${isFormVisible ? 'active' : ''}`}
                            onClick={() => setIsFormVisible(!isFormVisible)}
                            title="Add Item"
                        >
                            <i className={`ph-bold ${isFormVisible ? 'ph-minus' : 'ph-plus'}`}></i>
                        </button>
                    </div>
                </div>

                {/* Add Form */}
                {isFormVisible && (
                    <form onSubmit={handleAdd} className="add-form-table">
                        <div className="form-row">
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                placeholder="Name (Required)"
                                autoFocus
                            />
                            <input
                                type="text"
                                value={newItem.city}
                                onChange={(e) => setNewItem({ ...newItem, city: e.target.value })}
                                placeholder="City"
                            />
                            <input
                                type="text"
                                value={newItem.remarks}
                                onChange={(e) => setNewItem({ ...newItem, remarks: e.target.value })}
                                placeholder="Remarks"
                            />
                            <button type="submit" disabled={!newItem.name.trim()} className="btn-save">
                                <i className="ph-bold ph-check"></i>
                            </button>
                        </div>
                    </form>
                )}

                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Place / Item</th>
                                <th>City</th>
                                <th>Remarks</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? (
                                items.map((rawItem, idx) => {
                                    const item = normalizeItem(rawItem);
                                    const isEditing = editingIndex === idx;

                                    return (
                                        <tr key={idx}>
                                            {isEditing ? (
                                                <>
                                                    <td>
                                                        <input
                                                            className="edit-input"
                                                            value={editItem.name}
                                                            onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="edit-input"
                                                            value={editItem.city}
                                                            onChange={e => setEditItem({ ...editItem, city: e.target.value })}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="edit-input"
                                                            value={editItem.remarks}
                                                            onChange={e => setEditItem({ ...editItem, remarks: e.target.value })}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons-row">
                                                            <button className="btn-icon-tiny success" onClick={() => saveEdit(idx)}>
                                                                <i className="ph-bold ph-check"></i>
                                                            </button>
                                                            <button className="btn-icon-tiny danger" onClick={cancelEdit}>
                                                                <i className="ph-bold ph-x"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="fw-500">{item.name}</td>
                                                    <td>{item.city}</td>
                                                    <td className="text-muted-small">{item.remarks}</td>
                                                    <td>
                                                        <div className="action-buttons-row">
                                                            <button className="btn-icon-tiny" onClick={() => startEdit(idx, item)}>
                                                                <i className="ph-bold ph-pencil-simple"></i>
                                                            </button>
                                                            <button
                                                                className="btn-icon-tiny danger-hover"
                                                                onClick={() => {
                                                                    if (confirm('Delete this item?')) onItemDelete(idx);
                                                                }}
                                                            >
                                                                <i className="ph-bold ph-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-cell">Nothing added yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const [stateData, setStateData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('highlights');
    const [cityFilter, setCityFilter] = useState('All');

    useEffect(() => {
        const stateData = getStatesData().find(s => s.name === stateName);
        const countryData = stateData ? null : getCountriesData().find(c => c.name === stateName);
        setStateData(stateData || countryData);
    }, [stateName]);

    const handleUpdate = (field, newItem) => {
        if (!stateData) return;

        const updatedList = [...(stateData[field] || []), newItem];

        const updatedObject = {
            [field]: updatedList,
            visited: field === 'placesVisited' ? true : stateData.visited
        };

        const success = saveStateData(stateName, updatedObject);

        if (success) {
            setStateData(prev => ({
                ...prev,
                ...updatedObject
            }));
        }
    };

    const handleEditItem = (field, index, updatedItem) => {
        if (!stateData) return;

        const currentList = [...(stateData[field] || [])];
        if (index >= 0 && index < currentList.length) {
            currentList[index] = updatedItem;

            const updatedObject = {
                [field]: currentList
            };

            const success = saveStateData(stateName, updatedObject);
            if (success) {
                setStateData(prev => ({
                    ...prev,
                    ...updatedObject
                }));
            }
        }
    };

    const handleDeleteItem = (field, index) => {
        if (!stateData) return;

        const currentList = [...(stateData[field] || [])];
        if (index >= 0 && index < currentList.length) {
            currentList.splice(index, 1);

            const updatedObject = {
                [field]: currentList,
            };

            const success = saveStateData(stateName, updatedObject);
            if (success) {
                setStateData(prev => ({
                    ...prev,
                    ...updatedObject
                }));
            }
        }
    };

    const filterItems = (items) => {
        if (!items) return [];
        let filtered = items;

        if (cityFilter !== 'All') {
            filtered = filtered.filter(item => normalizeItem(item).city === cityFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(item => {
                const norm = normalizeItem(item);
                return norm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    norm.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    norm.remarks.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        return filtered;
    };

    // Calculate unique cities for the current tab
    const currentTabItems = stateData ? (stateData[activeTab] || []) : [];
    const uniqueCities = [...new Set(currentTabItems.map(item => normalizeItem(item).city))]
        .filter(city => city !== '-')
        .sort();

    if (!stateData) return <div>Loading...</div>;

    const tabs = [
        { id: 'highlights', label: 'Highlights', icon: 'ph-star' },
        { id: 'placesVisited', label: 'Places Visited', icon: 'ph-map-pin' },
        { id: 'placesToVisit', label: 'Bucket List', icon: 'ph-binoculars' },
        { id: 'restaurants', label: 'Restaurants Tried', icon: 'ph-storefront' },
        { id: 'food', label: 'Food Loved', icon: 'ph-pizza' },
        { id: 'treks', label: 'Treks & Adventures', icon: 'ph-mountains' },
        { id: 'stays', label: 'Stays & Hotels', icon: 'ph-bed' },
    ];

    return (
        <div className="state-details fade-in">
            <header className="details-header">
                <div className="header-top">
                    <div className="header-left-group">
                        <button className="btn-icon" onClick={onBack}>
                            <i className="ph-bold ph-arrow-left"></i>
                        </button>
                        <div className="header-title">
                            <h1>{stateData.name}</h1>
                            <span className="subtitle">Travel Journal</span>
                        </div>
                    </div>

                    <div className="filters-group">
                        <select
                            className="glass-select"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                        >
                            <option value="All">All Cities</option>
                            {uniqueCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        <div className="search-box glass-search">
                            <i className="ph-bold ph-magnifying-glass"></i>
                            <input
                                type="text"
                                placeholder="Search in current tab..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="tabs-container">
                    <div className="tabs-scroll-area">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setCityFilter('All'); }}
                            >
                                <i className={`ph-fill ${tab.icon}`}></i>
                                <span>{tab.label}</span>
                                {stateData[tab.id] && stateData[tab.id].length > 0 && (
                                    <span className="tab-count">{stateData[tab.id].length}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="tab-content">
                {tabs.map(tab => (
                    activeTab === tab.id && (
                        <TableSection
                            key={tab.id}
                            title={tab.label}
                            icon={tab.icon}
                            items={filterItems(stateData[tab.id])}
                            onItemAdd={(item) => handleUpdate(tab.id, item)}
                            onItemUpdate={(idx, item) => handleEditItem(tab.id, idx, item)}
                            onItemDelete={(idx) => handleDeleteItem(tab.id, idx)}
                        />
                    )
                ))}
            </div>

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
                    margin-bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .header-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .header-left-group {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .filters-group {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .glass-select {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border);
                    backdrop-filter: blur(10px);
                    color: var(--text-primary);
                    padding: 0.6rem 2rem 0.6rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.7rem top 50%;
                    background-size: 0.65rem auto;
                    min-width: 150px;
                }

                .glass-select:focus {
                    outline: none;
                    border-color: var(--primary);
                    background-color: var(--bg-surface);
                }
                
                .glass-select option {
                    background: var(--bg-surface);
                    color: var(--text-primary);
                }

                .glass-search.search-box {
                    min-width: 250px;
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
                
                /* Tabs Styles */
                .tabs-container {
                    border-bottom: 1px solid var(--border);
                    margin-bottom: 1rem;
                }
                
                .tabs-scroll-area {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }
                
                .tabs-scroll-area::-webkit-scrollbar {
                    height: 4px;
                }
                
                .tabs-scroll-area::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 2px;
                }

                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: transparent;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                    color: var(--text-muted);
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    position: relative;
                    transition: all 0.2s;
                }
                
                .tab-btn:hover {
                    color: var(--text-primary);
                    background: rgba(255, 255, 255, 0.03);
                }
                
                .tab-btn.active {
                    color: var(--primary);
                    background: var(--bg-surface);
                    border-bottom: 2px solid var(--primary);
                }
                
                .tab-btn i {
                    font-size: 1.1rem;
                }
                
                .tab-count {
                    background: var(--bg-app);
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    padding: 0.1rem 0.4rem;
                    border-radius: 10px;
                    min-width: 1.2em;
                    text-align: center;
                }
                
                .tab-btn.active .tab-count {
                    background: var(--primary-soft);
                    color: var(--primary);
                }
                
                /* Content Area */
                .tab-content {
                    min-height: 400px;
                }

                .detail-section {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    max-width: 1000px; 
                    margin: 0 auto; 
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
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

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .count-badge {
                    background: var(--bg-app);
                    color: var(--text-muted);
                    padding: 0.2rem 0.6rem;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                
                .btn-icon-small {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-icon-small:hover, .btn-icon-small.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                /* Table Styles */
                .table-wrapper {
                    overflow-x: auto;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                }

                .custom-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 600px;
                }

                .custom-table th, .custom-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--border);
                }

                .custom-table th {
                    background: rgba(255, 255, 255, 0.03);
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.9rem;
                    white-space: nowrap;
                }

                .custom-table tr:last-child td {
                    border-bottom: none;
                }

                .custom-table tr:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                
                .fw-500 { font-weight: 500; color: var(--text-primary); }
                .text-muted-small { color: var(--text-muted); font-size: 0.9rem; }
                .empty-cell { text-align: center; color: var(--text-muted); font-style: italic; padding: 2rem; }

                /* Add Form */
                .add-form-table {
                    background: var(--bg-app);
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--border);
                    animation: slideDown 0.2s ease;
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 2fr 1.5fr 3fr auto;
                    gap: 0.75rem;
                    align-items: center;
                }

                .form-row input {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    padding: 0.6rem 0.8rem;
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }

                .form-row input:focus {
                    outline: none;
                    border-color: var(--primary);
                }
                
                .edit-input {
                    background: var(--bg-surface);
                    border: 1px solid var(--primary);
                    padding: 0.4rem;
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    width: 100%;
                }
                .edit-input:focus {
                    outline: 2px solid var(--primary);
                }

                .btn-save {
                    background: var(--primary);
                    color: white;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .action-buttons-row {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .btn-icon-tiny {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.2rem;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .btn-icon-tiny:hover {
                    color: var(--text-primary);
                    background: rgba(255,255,255,0.05);
                }
                
                .btn-icon-tiny.danger-hover:hover, .btn-icon-tiny.danger {
                    color: #ef4444;
                }
                .btn-icon-tiny.danger-hover:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                
                .btn-icon-tiny.success {
                    color: #10b981;
                }
                
                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    .btn-save {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};
console.log("StateDetails.jsx loaded. window.StateDetails:", window.StateDetails);
