(function () {
    console.log("Loading StateDetails.jsx v6 (Edit & Fixes)...");

    const { useState, useEffect } = React;

    const SECTIONS = [
        { id: 'highlights', label: 'Highlights', icon: 'ph-star' },
        { id: 'placesVisited', label: 'Places Visited', icon: 'ph-map-pin' },
        { id: 'placesToVisit', label: 'Bucket List', icon: 'ph-binoculars' },
        { id: 'restaurants', label: 'Restaurants', icon: 'ph-fork-knife' },
        { id: 'food', label: 'Food to Try', icon: 'ph-pizza' },
        { id: 'treks', label: 'Treks', icon: 'ph-mountains' },
        { id: 'stays', label: 'Stays', icon: 'ph-bed' }
    ];

    const StateDetails = ({ stateName, onBack }) => {
        const [data, setData] = useState(null);
        const [activeTab, setActiveTab] = useState('highlights');
        const [newItem, setNewItem] = useState('');
        const [searchTerm, setSearchTerm] = useState('');

        // Edit State
        const [editingIndex, setEditingIndex] = useState(-1);
        const [editItem, setEditItem] = useState({ name: '', city: '', remarks: '' });

        useEffect(() => {
            if (stateName) {
                loadData();
            }
        }, [stateName]);

        const loadData = () => {
            const allStates = window.TravelData.getStatesData();
            const countryData = window.TravelData.getCountriesData();

            let current = allStates.find(s => s.name === stateName);
            if (!current) {
                current = countryData.find(s => s.name === stateName);
            }
            setData(current || null);
        };

        const handleSave = (updatedData) => {
            window.TravelData.saveStateData(stateName, updatedData);
            setData(prev => ({ ...prev, ...updatedData }));
        };

        const toggleVisited = () => {
            if (!data) return;
            handleSave({ visited: !data.visited });
        };

        const addItem = (e) => {
            e.preventDefault();
            if (!newItem.trim() || !data) return;

            const list = data[activeTab] || [];
            // Object structure for future extensibility (e.g. remarks, city)
            // Currently assuming simple string or object. Let's standardize on save if needed, but keeping it simple for now.
            // If the user wants specific "Cities" column, we might need to parse input or have more fields.
            // For now, single input "Name" is consistent with previous quick-add.
            // Actually, for "nice layout of tables", we probably want at least City/Remarks. 
            // Let's stick to simple string for now but display it nicely, or maybe allow comma separated?
            // "Name, City, Remarks" parsing? Or just simple Text. 
            // The previous backup had a form for Name/City/Remarks.
            // The current implementation (Step 592) had: `const name = isObj ? item.name : item;`
            // Let's support object if we can, but a single input makes it hard.
            // I'll keep the single input for ADDING to keep it consistent with "Bucket List" style for speed, 
            // but styling will handle both.

            const updatedList = [...list, newItem.trim()];
            handleSave({ [activeTab]: updatedList });
            setNewItem('');
        };

        const removeItem = (index) => {
            if (!data) return;
            const list = data[activeTab] || [];
            const updatedList = list.filter((_, i) => i !== index);
            handleSave({ [activeTab]: updatedList });

            // If we deleted the item being edited, cancel edit
            if (editingIndex === index) {
                cancelEdit();
            }
        };

        const startEdit = (index, item) => {
            setEditingIndex(index);
            if (typeof item === 'object' && item !== null) {
                setEditItem({
                    name: item.name || '',
                    city: item.city || '',
                    remarks: item.remarks || ''
                });
            } else {
                setEditItem({ name: item, city: '', remarks: '' });
            }
        };

        const cancelEdit = () => {
            setEditingIndex(-1);
            setEditItem({ name: '', city: '', remarks: '' });
        };

        const saveEdit = (index) => {
            if (!editItem.name.trim()) return;

            const list = [...(data[activeTab] || [])];
            list[index] = {
                name: editItem.name.trim(),
                city: editItem.city.trim() || '-',
                remarks: editItem.remarks.trim() || '-'
            };

            handleSave({ [activeTab]: list });
            setEditingIndex(-1);
            setEditItem({ name: '', city: '', remarks: '' });
        };

        if (!data) return <div className="p-8 text-center text-text-muted">Loading...</div>;

        const activeSection = SECTIONS.find(s => s.id === activeTab);
        const currentList = data[activeTab] || [];

        // Map to include original index, then filter
        const filteredList = currentList
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const text = typeof item === 'object' ? (item.name + (item.city || '') + (item.remarks || '')) : item;
                return text.toLowerCase().includes(searchTerm.toLowerCase());
            });

        return (
            <div className="state-details-container fade-in">
                {/* Hero Header */}
                <div className="details-hero">
                    <div className="hero-content">
                        <button onClick={onBack} className="back-btn group">
                            <div className="icon-circle bg-white/10 group-hover:bg-primary group-hover:text-white transition-colors">
                                <i className="ph-bold ph-arrow-left"></i>
                            </div>
                            <span>Back to Dashboard</span>
                        </button>

                        <div className="title-row">
                            <h1 className="state-title">{stateName}</h1>
                            <button
                                onClick={toggleVisited}
                                className={`visited-toggle ${data.visited ? 'is-visited' : ''}`}
                            >
                                <i className={data.visited ? "ph-fill ph-check-circle" : "ph-bold ph-circle"}></i>
                                {data.visited ? "Visited" : "Mark Visited"}
                            </button>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="hero-bg-gradient"></div>
                </div>

                {/* Tabs Bar - Sticky */}
                <div className="tabs-sticky-wrapper">
                    <div className="tabs-container">
                        {SECTIONS.map(section => {
                            const count = (data[section.id] || []).length;
                            const isActive = activeTab === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => { setActiveTab(section.id); cancelEdit(); }}
                                    className={`tab-item ${isActive ? 'active' : ''}`}
                                >
                                    <i className={`ph ${isActive ? 'ph-fill' : 'ph-bold'} ${section.icon}`}></i>
                                    <span>{section.label}</span>
                                    {count > 0 && <span className="tab-badge">{count}</span>}
                                    {isActive && <div className="active-indicator"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="content-area container mx-auto">

                    {/* Toolbar: Search + Add */}
                    <div className="toolbar-row">
                        <div className="search-wrapper">
                            <i className="ph-bold ph-magnifying-glass"></i>
                            <input
                                type="text"
                                placeholder={`Search in ${activeSection.label}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <form onSubmit={addItem} className="add-input-wrapper">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder={`Add new ${activeSection.label.toLowerCase()}...`}
                            />
                            <button type="submit" disabled={!newItem.trim()} className="add-btn">
                                <i className="ph-bold ph-plus"></i>
                            </button>
                        </form>
                    </div>

                    {/* Table View */}
                    <div className="table-card">
                        <table className="details-table">
                            <thead>
                                <tr>
                                    <th className="col-name">Name / Item</th>
                                    <th className="col-city">Location</th>
                                    <th className="col-remarks">Notes</th>
                                    <th className="col-actions text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan="4">
                                            <div className="empty-table-state">
                                                <i className={`ph-duotone ${activeSection.icon}`}></i>
                                                <p>No items added yet. Start exploring!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map(({ item, index }) => {
                                        const isEditing = editingIndex === index;

                                        if (isEditing) {
                                            return (
                                                <tr key={index} className="edit-row">
                                                    <td className="col-name">
                                                        <input
                                                            type="text"
                                                            className="edit-input"
                                                            value={editItem.name}
                                                            onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                                                            placeholder="Name"
                                                            autoFocus
                                                        />
                                                    </td>
                                                    <td className="col-city">
                                                        <input
                                                            type="text"
                                                            className="edit-input"
                                                            value={editItem.city}
                                                            onChange={(e) => setEditItem({ ...editItem, city: e.target.value })}
                                                            placeholder="City/Location"
                                                        />
                                                    </td>
                                                    <td className="col-remarks">
                                                        <input
                                                            type="text"
                                                            className="edit-input"
                                                            value={editItem.remarks}
                                                            onChange={(e) => setEditItem({ ...editItem, remarks: e.target.value })}
                                                            placeholder="Notes"
                                                        />
                                                    </td>
                                                    <td className="text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => saveEdit(index)} className="action-btn success" title="Save">
                                                                <i className="ph-bold ph-check"></i>
                                                            </button>
                                                            <button onClick={cancelEdit} className="action-btn cancel" title="Cancel">
                                                                <i className="ph-bold ph-x"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        const isObj = typeof item === 'object' && item !== null;
                                        const name = isObj ? item.name : item;
                                        const city = isObj ? item.city : '-';
                                        const remarks = isObj ? item.remarks : '-';

                                        return (
                                            <tr key={index} className="fade-in-up">
                                                <td className="col-name">
                                                    <span className="font-medium text-lg">{name}</span>
                                                </td>
                                                <td className="col-city">
                                                    <div className="cell-wrapper">
                                                        {city !== '-' && <i className="ph-fill ph-map-pin text-primary/60"></i>}
                                                        <span className={city === '-' ? 'text-disabled' : ''}>{city}</span>
                                                    </div>
                                                </td>
                                                <td className="col-remarks">
                                                    <span className={remarks === '-' ? 'text-disabled' : 'text-secondary'}>{remarks}</span>
                                                </td>
                                                <td className="text-right">
                                                    <div className="action-group">
                                                        <button
                                                            onClick={() => startEdit(index, item)}
                                                            className="action-btn edit"
                                                            title="Edit Item"
                                                        >
                                                            <i className="ph-bold ph-pencil-simple"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="action-btn delete"
                                                            title="Delete Item"
                                                        >
                                                            <i className="ph-bold ph-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <style>{`
                    .state-details-container {
                        min-height: 100vh;
                        background: var(--bg-app);
                        display: flex;
                        flex-direction: column;
                    }

                    /* Hero Section */
                    .details-hero {
                        position: relative;
                        padding: 2rem 2rem 1rem;
                        background: var(--bg-surface);
                        border-bottom: 1px solid var(--border);
                        overflow: hidden;
                    }

                    .hero-content {
                        position: relative;
                        z-index: 2;
                        max-width: 1200px;
                        margin: 0 auto;
                    }

                    .hero-bg-gradient {
                        position: absolute;
                        top: -50%;
                        right: -10%;
                        width: 600px;
                        height: 600px;
                        background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(0,0,0,0) 70%);
                        z-index: 1;
                        pointer-events: none;
                    }

                    .back-btn {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        background: none;
                        border: none;
                        color: var(--text-muted);
                        cursor: pointer;
                        font-family: inherit;
                        font-size: 0.9rem;
                        margin-bottom: 1.5rem;
                        transition: color 0.2s;
                    }

                    .back-btn:hover {
                        color: var(--text-primary);
                    }

                    .icon-circle {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }

                    .title-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        margin-bottom: 1rem;
                    }

                    .state-title {
                        font-size: 3rem;
                        font-weight: 800;
                        letter-spacing: -0.05em;
                        background: linear-gradient(to right, #fff, #bfdbfe);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 0;
                    }

                    .visited-toggle {
                        background: var(--bg-surface-hover);
                        border: 1px solid var(--border);
                        color: var(--text-secondary);
                        padding: 0.6rem 1.25rem;
                        border-radius: 100px;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-weight: 500;
                    }

                    .visited-toggle:hover {
                        background: var(--bg-accent);
                        color: var(--text-primary);
                    }

                    .visited-toggle.is-visited {
                        background: rgba(16, 185, 129, 0.15);
                        border-color: rgba(16, 185, 129, 0.3);
                        color: #10b981;
                    }

                    /* Sticky Tabs */
                    .tabs-sticky-wrapper {
                        position: sticky;
                        top: 0;
                        z-index: 50;
                        background: rgba(24, 27, 33, 0.8);
                        backdrop-filter: blur(12px);
                        border-bottom: 1px solid var(--border);
                        padding: 0 1rem;
                    }

                    .tabs-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        display: flex;
                        gap: 0.5rem;
                        overflow-x: auto;
                        scrollbar-width: none; /* Hide scrollbar Firefox */
                        -ms-overflow-style: none;  /* Hide scrollbar IE */
                    }
                    .tabs-container::-webkit-scrollbar { 
                        display: none; 
                    }

                    .tab-item {
                        background: none;
                        border: none;
                        padding: 1.25rem 1rem;
                        color: var(--text-muted);
                        font-weight: 500;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 0.6rem;
                        position: relative;
                        white-space: nowrap;
                        transition: color 0.2s;
                    }

                    .tab-item:hover {
                        color: var(--text-primary);
                    }

                    .tab-item.active {
                        color: var(--primary);
                    }

                    .active-indicator {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        height: 3px;
                        background: var(--primary);
                        border-radius: 3px 3px 0 0;
                        box-shadow: 0 -2px 10px rgba(124, 58, 237, 0.5);
                    }

                    .tab-badge {
                        background: var(--bg-surface-hover);
                        color: var(--text-primary);
                        font-size: 0.75rem;
                        padding: 0.15rem 0.5rem;
                        border-radius: 10px;
                        min-width: 1.5em;
                        text-align: center;
                    }
                    .tab-item.active .tab-badge {
                        background: var(--primary);
                        color: white;
                    }

                    /* Content */
                    .content-area {
                        padding: 2rem;
                        max-width: 1200px;
                        margin: 0 auto;
                        width: 100%;
                    }

                    .toolbar-row {
                        display: flex;
                        gap: 1rem;
                        margin-bottom: 2rem;
                        flex-wrap: wrap;
                    }

                    .search-wrapper {
                        flex: 1;
                        min-width: 250px;
                        position: relative;
                    }

                    .search-wrapper i {
                        position: absolute;
                        left: 1rem;
                        top: 50%;
                        transform: translateY(-50%);
                        color: var(--text-muted);
                    }

                    .search-wrapper input {
                        width: 100%;
                        padding: 0.8rem 1rem 0.8rem 2.8rem;
                        background: var(--bg-surface);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-lg);
                        color: var(--text-primary);
                        transition: all 0.2s;
                    }
                    .search-wrapper input:focus {
                        outline: none;
                        border-color: var(--primary);
                        background: var(--bg-app);
                        box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
                    }

                    .add-input-wrapper {
                        flex: 1.5;
                        display: flex;
                        gap: 0.5rem;
                        background: var(--bg-surface);
                        padding: 0.35rem;
                        border: 1px solid var(--border);
                        border-radius: var(--radius-lg);
                        min-width: 300px;
                    }

                    .add-input-wrapper input {
                        flex: 1;
                        background: transparent;
                        border: none;
                        padding: 0 1rem;
                        color: var(--text-primary);
                    }
                    .add-input-wrapper input:focus { outline: none; }

                    .add-btn {
                        background: var(--primary);
                        color: white;
                        border: none;
                        border-radius: var(--radius-md);
                        width: 42px;
                        height: 42px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        font-size: 1.2rem;
                        transition: background 0.2s;
                    }
                    .add-btn:hover { background: var(--primary-hover); }
                    .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                    /* Table Card */
                    .table-card {
                        background: var(--bg-surface);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-xl);
                        overflow: hidden;
                        box-shadow: var(--shadow-lg);
                    }

                    .details-table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    .details-table th {
                        text-align: left;
                        padding: 1.25rem 1.5rem;
                        background: rgba(255, 255, 255, 0.02);
                        color: var(--text-secondary);
                        font-size: 0.75rem;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        font-weight: 700;
                        border-bottom: 1px solid var(--border);
                    }

                    .details-table td {
                        padding: 1.25rem 1.5rem;
                        border-bottom: 1px solid var(--border);
                        color: var(--text-primary);
                        vertical-align: middle;
                        transition: background 0.15s;
                    }

                    .details-table tr:hover td {
                        background: rgba(255, 255, 255, 0.03);
                    }
                    .details-table tr:last-child td { border-bottom: none; }

                    .col-name { width: 40%; }
                    .col-city { width: 25%; }
                    .col-remarks { width: 25%; }
                    .col-actions { width: 10%; }

                    .cell-wrapper {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .text-disabled { color: var(--text-muted); opacity: 0.5; font-style: italic; }
                    .text-secondary { color: var(--text-secondary); }

                    /* Action Buttons */
                    .action-group {
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                        gap: 0.5rem;
                        opacity: 0;
                        transform: translateX(10px);
                        transition: all 0.2s;
                    }
                    
                    .details-table tr:hover .action-group {
                        opacity: 1;
                        transform: translateX(0);
                    }

                    .action-btn {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        border: none;
                        background: transparent;
                        color: var(--text-muted);
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }

                    .action-btn:hover {
                        background: rgba(255,255,255,0.05);
                        color: var(--text-primary);
                    }

                    .action-btn.delete:hover {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                    }
                    
                    .action-btn.edit:hover {
                        background: rgba(59, 130, 246, 0.1);
                        color: #3b82f6;
                    }
                    
                    .action-btn.success {
                        color: #10b981;
                    }
                    .action-btn.success:hover {
                        background: rgba(16, 185, 129, 0.1);
                    }
                    
                    .action-btn.cancel {
                        color: #94a3b8;
                    }
                    .action-btn.cancel:hover {
                        background: rgba(255,255,255,0.1);
                    }

                    /* Edit Inputs */
                    .edit-row {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    
                    .edit-input {
                        width: 100%;
                        background: var(--bg-app);
                        border: 1px solid var(--primary);
                        padding: 0.5rem;
                        border-radius: var(--radius-sm);
                        color: var(--text-primary);
                        font-family: inherit;
                        font-size: 1rem;
                    }
                    .edit-input:focus {
                        outline: none;
                        box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
                    }

                    .empty-table-state {
                        padding: 6rem 2rem;
                        text-align: center;
                        color: var(--text-muted);
                    }
                    .empty-table-state i {
                        font-size: 3.5rem;
                        margin-bottom: 1.5rem;
                        opacity: 0.3;
                    }
                    .empty-table-state p {
                        font-size: 1.1rem;
                    }

                    /* Utility */
                    .text-right { text-align: right; }
                    .text-primary { color: var(--primary); }
                    .flex { display: flex; }
                    .gap-2 { gap: 0.5rem; }
                    .justify-end { justify-content: flex-end; }
                    
                    .fade-in { animation: fadeIn 0.4s ease-out; }
                    .fade-in-up { animation: fadeInUp 0.4s ease-out backwards; }

                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                    @media (max-width: 768px) {
                        .title-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
                        .state-title { font-size: 2.2rem; }
                        .toolbar-row { flex-direction: column; }
                        .col-city, .col-remarks { display: none; } /* Simplified mobile view */
                        .col-name { width: 80%; }
                        
                        /* Fix table logic for mobile if needed, or just let it scroll */
                        .table-card { overflow-x: auto; }
                    }
                `}</style>
            </div>
        );
    };

    window.StateDetails = StateDetails;
    console.log("StateDetails component registered on window (v6 - Edit & Fixes)");
})();
