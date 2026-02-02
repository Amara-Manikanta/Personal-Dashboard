(function () {
    console.log("Loading StateDetails.jsx v10 (Generalized Add Form)...");

    const { useState, useEffect, useRef } = React;

    const SECTIONS = [
        { id: 'highlights', label: 'Highlights', icon: 'ph-star' },
        { id: 'placesVisited', label: 'Places Visited', icon: 'ph-map-pin' },
        { id: 'placesToVisit', label: 'Bucket List', icon: 'ph-binoculars' },
        { id: 'restaurants', label: 'Restaurants', icon: 'ph-fork-knife' },
        { id: 'food', label: 'Food to Try', icon: 'ph-pizza' },
        { id: 'treks', label: 'Treks', icon: 'ph-mountains' },
        { id: 'stays', label: 'Stays', icon: 'ph-bed' }
    ];

    // Check for localhost
    const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '';

    const StateDetails = ({ stateName, onBack }) => {
        const [data, setData] = useState(null);
        const [activeTab, setActiveTab] = useState('highlights');

        // Add Item Form State
        const [newItem, setNewItem] = useState('');
        const [newCity, setNewCity] = useState('');
        const [newRemarks, setNewRemarks] = useState(''); // Unified: Remarks/Notes/Restaurant

        // Image Upload State (Global for Add)
        const [uploading, setUploading] = useState(false);
        const [uploadedImagePath, setUploadedImagePath] = useState('');

        const [searchTerm, setSearchTerm] = useState('');

        // Edit State
        const [editingIndex, setEditingIndex] = useState(-1);
        const [editItem, setEditItem] = useState({ name: '', city: '', remarks: '', image: '' });
        const [editUploading, setEditUploading] = useState(false);

        useEffect(() => {
            if (stateName) {
                loadData();
            }
        }, [stateName]);

        // Clear inputs when tab changes
        useEffect(() => {
            setNewItem('');
            setNewCity('');
            setNewRemarks('');
            setUploadedImagePath('');
            cancelEdit();
        }, [activeTab]);

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

        const uploadFile = async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Data = reader.result;
                    const result = await window.api.uploadImage({
                        image: base64Data,
                        name: file.name
                    });
                    resolve(result);
                };
                reader.readAsDataURL(file);
            });
        };

        const handleAddFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);
            const result = await uploadFile(file);

            if (result && result.success) {
                setUploadedImagePath(result.path);
            } else {
                alert("Image upload failed.");
            }
            setUploading(false);
        };

        const handleEditFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setEditUploading(true);
            const result = await uploadFile(file);

            if (result && result.success) {
                setEditItem(prev => ({ ...prev, image: result.path }));
            } else {
                alert("Image upload failed during edit.");
            }
            setEditUploading(false);
        };

        const addItem = (e) => {
            e.preventDefault();
            if (!newItem.trim() || !data) return;

            const list = data[activeTab] || [];

            // Should current view support full objects?
            // Yes, user wants City/Notes for all.

            // For backward compatibility:
            // Existing data might be strings.
            // We will push new items as objects.

            const isGridView = activeTab === 'food' && isLocalhost;

            const itemToAdd = {
                name: newItem.trim(),
                city: newCity.trim() || '-',
                remarks: newRemarks.trim() || '-',
                image: isGridView ? uploadedImagePath : undefined
            };

            const updatedList = [...list, itemToAdd];
            handleSave({ [activeTab]: updatedList });

            // Reset fields
            setNewItem('');
            setNewCity('');
            setNewRemarks('');

            if (isGridView) {
                setUploadedImagePath('');
                const fileInput = document.getElementById('add-image-upload');
                if (fileInput) fileInput.value = '';
            }
        };

        const removeItem = (e, index) => {
            // e might be undefined if called from table view which passed index only previously?
            // check signature used in button
            if (e && e.stopPropagation) e.stopPropagation();

            if (!window.confirm("Are you sure you want to delete this item?")) return;

            if (!data) return;
            const list = data[activeTab] || [];
            const updatedList = list.filter((_, i) => i !== index);
            handleSave({ [activeTab]: updatedList });

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
                    remarks: item.remarks || '',
                    image: item.image || ''
                });
            } else {
                setEditItem({ name: item, city: '', remarks: '', image: '' });
            }
        };

        const cancelEdit = () => {
            setEditingIndex(-1);
            setEditItem({ name: '', city: '', remarks: '', image: '' });
        };

        const saveEdit = (index) => {
            if (!editItem.name.trim()) return;

            const list = [...(data[activeTab] || [])];

            list[index] = {
                name: editItem.name.trim(),
                city: editItem.city.trim() || '-',
                remarks: editItem.remarks.trim() || '-',
                image: editItem.image
            };

            handleSave({ [activeTab]: list });
            cancelEdit();
        };

        if (!data) return <div className="p-8 text-center text-text-muted">Loading...</div>;

        const activeSection = SECTIONS.find(s => s.id === activeTab);
        const currentList = data[activeTab] || [];

        const filteredList = currentList
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const text = typeof item === 'object' ? (item.name + (item.city || '') + (item.remarks || '')) : item;
                return text.toLowerCase().includes(searchTerm.toLowerCase());
            });

        const isGridView = activeTab === 'food' && isLocalhost;

        // Dynamic placeholder logic
        const getPlaceholder = () => {
            // e.g. "Add place name...", "Add restaurant name..."
            const base = activeSection.label;
            // simple heuristic: remove 's' or specific tweaks
            if (activeTab === 'placesVisited') return 'Place Name...';
            if (activeTab === 'food') return 'Dish Name...';
            if (activeTab === 'restaurants') return 'Restaurant Name...';
            return `Add ${base.toLowerCase().replace(/s$/, '')} name...`;
        };

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
                    <div className="hero-bg-gradient"></div>
                </div>

                {/* Tabs Bar */}
                <div className="tabs-sticky-wrapper">
                    <div className="tabs-container">
                        {SECTIONS.map(section => {
                            const count = (data[section.id] || []).length;
                            const isActive = activeTab === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => { setActiveTab(section.id); }}
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

                {/* Main Content */}
                <div className="content-area container mx-auto">

                    {/* Toolbar */}
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

                        {/* Enhanced Add Form (Universal) */}
                        <form onSubmit={addItem} className={`add-input-wrapper ${isGridView ? 'grid-mode-extended' : 'universal-extended'}`}>
                            <div className="inputs-group">
                                <input
                                    type="text"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder={getPlaceholder()}
                                    className="main-input"
                                />
                                <React.Fragment>
                                    <input
                                        type="text"
                                        value={newRemarks}
                                        onChange={(e) => setNewRemarks(e.target.value)}
                                        placeholder={activeTab === 'food' ? "Restaurant..." : "Notes..."}
                                        className="sub-input"
                                    />
                                    <input
                                        type="text"
                                        value={newCity}
                                        onChange={(e) => setNewCity(e.target.value)}
                                        placeholder="City..."
                                        className="sub-input"
                                    />
                                </React.Fragment>
                            </div>

                            {/* File Upload for Grid Mode */}
                            {isGridView && (
                                <div className="file-upload-container">
                                    <label htmlFor="add-image-upload" className={`upload-label ${uploadedImagePath ? 'uploaded' : ''}`}>
                                        <i className={`ph-bold ${uploading ? 'ph-spinner ph-spin' : uploadedImagePath ? 'ph-check' : 'ph-image'}`}></i>
                                    </label>
                                    <input
                                        type="file"
                                        id="add-image-upload"
                                        accept="image/*"
                                        onChange={handleAddFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            )}

                            <button type="submit" disabled={!newItem.trim() || uploading} className="add-btn">
                                <i className="ph-bold ph-plus"></i>
                            </button>
                        </form>
                    </div>

                    {/* Content View */}
                    {isGridView ? (
                        <div className="food-grid-view">
                            {filteredList.length === 0 ? (
                                <div className="empty-state-card">
                                    <i className="ph-duotone ph-pizza"></i>
                                    <p>No food items to try yet.</p>
                                </div>
                            ) : (
                                <div className="food-grid">
                                    {filteredList.map(({ item, index }) => {
                                        const isEditing = editingIndex === index;
                                        const isObj = typeof item === 'object';
                                        const name = isObj ? item.name : item;
                                        const image = (isObj && item.image) ? item.image : null;
                                        const city = (isObj && item.city) ? item.city : '-';
                                        const restaurant = (isObj && item.remarks) ? item.remarks : '-';

                                        if (isEditing) {
                                            return (
                                                <div key={index} className="food-card editing fade-in">
                                                    <div className="card-image-area edit-mode">
                                                        {/* Edit Image Upload */}
                                                        {editItem.image ? (
                                                            <img src={editItem.image} alt="Preview" />
                                                        ) : (
                                                            <div className="placeholder-icon"><i className="ph-duotone ph-image"></i></div>
                                                        )}
                                                        <label htmlFor={`edit-upload-${index}`} className="edit-image-overlay">
                                                            <i className={`ph-bold ${editUploading ? 'ph-spinner ph-spin' : 'ph-camera'}`}></i>
                                                            <span>Change</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            id={`edit-upload-${index}`}
                                                            accept="image/*"
                                                            onChange={handleEditFileChange}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </div>
                                                    <div className="card-info edit-form">
                                                        <input
                                                            value={editItem.name}
                                                            onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                                            placeholder="Dish Name"
                                                            className="edit-field name"
                                                            autoFocus
                                                        />
                                                        <input
                                                            value={editItem.remarks}
                                                            onChange={e => setEditItem({ ...editItem, remarks: e.target.value })}
                                                            placeholder="Restaurant"
                                                            className="edit-field"
                                                        />
                                                        <input
                                                            value={editItem.city}
                                                            onChange={e => setEditItem({ ...editItem, city: e.target.value })}
                                                            placeholder="City"
                                                            className="edit-field"
                                                        />
                                                        <div className="edit-actions">
                                                            <button onClick={() => saveEdit(index)} className="save-btn"><i className="ph-bold ph-check"></i> Save</button>
                                                            <button onClick={cancelEdit} className="cancel-btn"><i className="ph-bold ph-x"></i></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div key={index} className="food-card fade-in-up" style={{ animationDelay: index * 0.05 + 's' }}>
                                                <div className="card-image-area">
                                                    {image ? (
                                                        <img src={image} alt={name} onError={(e) => e.target.style.display = 'none'} />
                                                    ) : (
                                                        <div className="placeholder-icon">
                                                            <i className="ph-duotone ph-fork-knife"></i>
                                                        </div>
                                                    )}
                                                    <div className="card-overlay">
                                                        <button onClick={() => startEdit(index, item)} className="icon-btn-overlay" title="Edit">
                                                            <i className="ph-bold ph-pencil-simple"></i>
                                                        </button>
                                                        <button onClick={(e) => removeItem(e, index)} className="icon-btn-overlay delete" title="Remove">
                                                            <i className="ph-bold ph-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="card-info">
                                                    <h3>{name}</h3>
                                                    {(restaurant !== '-' || city !== '-') && (
                                                        <div className="card-details">
                                                            {restaurant !== '-' && <div className="detail-row"><i className="ph-fill ph-storefront"></i> <span>{restaurant}</span></div>}
                                                            {city !== '-' && <div className="detail-row"><i className="ph-fill ph-map-pin"></i> <span>{city}</span></div>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Table View (Default) */
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
                                                                onClick={(e) => removeItem(e, index)}
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
                    )}
                </div>

                <style>{`
                    .state-details-container {
                        min-height: 100vh;
                        background: var(--bg-app);
                        display: flex;
                        flex-direction: column;
                    }
                    /* ... (Styles omitted for brevity, keeping same styles) ... */
                    /* Reincluding previous styles to ensure consistency if file overwrite happened */
                    
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
                        width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                    }

                    .title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }

                    .state-title {
                        font-size: 3rem; font-weight: 800; letter-spacing: -0.05em;
                        background: linear-gradient(to right, #fff, #bfdbfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;
                    }

                    .visited-toggle {
                        background: var(--bg-surface-hover); border: 1px solid var(--border); color: var(--text-secondary); padding: 0.6rem 1.25rem;
                        border-radius: 100px; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; font-weight: 500;
                    }
                    .visited-toggle:hover { background: var(--bg-accent); color: var(--text-primary); }
                    .visited-toggle.is-visited { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }

                    /* Sticky Tabs */
                    .tabs-sticky-wrapper {
                        position: sticky; top: 0; z-index: 50; background: rgba(24, 27, 33, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 1rem;
                    }
                    .tabs-container { max-width: 1200px; margin: 0 auto; display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none; }
                    .tabs-container::-webkit-scrollbar { display: none; }

                    .tab-item {
                        background: none; border: none; padding: 1.25rem 1rem; color: var(--text-muted); font-weight: 500; cursor: pointer;
                        display: flex; align-items: center; gap: 0.6rem; position: relative; white-space: nowrap; transition: color 0.2s;
                    }
                    .tab-item:hover { color: var(--text-primary); }
                    .tab-item.active { color: var(--primary); }
                    .active-indicator { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: var(--primary); border-radius: 3px 3px 0 0; box-shadow: 0 -2px 10px rgba(124, 58, 237, 0.5); }
                    .tab-badge { background: var(--bg-surface-hover); color: var(--text-primary); font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 10px; min-width: 1.5em; text-align: center; }
                    .tab-item.active .tab-badge { background: var(--primary); color: white; }

                    /* Content */
                    .content-area { padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
                    .toolbar-row { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
                    
                    .search-wrapper { flex: 1; min-width: 250px; position: relative; }
                    .search-wrapper i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                    .search-wrapper input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); color: var(--text-primary); transition: all 0.2s; }
                    .search-wrapper input:focus { outline: none; border-color: var(--primary); background: var(--bg-app); box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1); }

                    /* Layout for Add Form */
                    .add-input-wrapper {
                        display: flex; gap: 0.5rem; background: var(--bg-surface); padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius-lg);
                        align-items: center;
                        min-width: 400px;
                    }
                    .add-input-wrapper.grid-mode-extended { flex: 2; }
                    .add-input-wrapper.universal-extended { flex: 2; } /* Make wider normally too */

                    .inputs-group { display: flex; gap: 0.5rem; flex: 1; }
                    .add-input-wrapper input { background: transparent; border: none; color: var(--text-primary); }
                    .add-input-wrapper .main-input { flex: 2; font-weight: 500; font-size: 1rem; }
                    .add-input-wrapper .sub-input { flex: 1.5; font-size: 0.9rem; border-left: 1px solid var(--border); padding-left: 0.5rem; color: var(--text-secondary); }
                    .add-input-wrapper input:focus { outline: none; }

                    .file-upload-container { padding: 0 0.5rem; border-left: 1px solid var(--border); }
                    .upload-label { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-surface-hover); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
                    .upload-label:hover { background: var(--bg-accent); color: var(--text-primary); }
                    .upload-label.uploaded { background: rgba(16, 185, 129, 0.15); color: #10b981; }

                    .add-btn { background: var(--primary); color: white; border: none; border-radius: var(--radius-md); width: 42px; height: 42px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: background 0.2s; }
                    .add-btn:hover { background: var(--primary-hover); }
                    .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                    /* Table Styles */
                    .table-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-lg); }
                    .details-table { width: 100%; border-collapse: collapse; }
                    .details-table th, .details-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); text-align: left; }
                    .details-table th { background: rgba(255,255,255,0.02); color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
                    .details-table tr:hover td { background: rgba(255,255,255,0.03); }
                    .details-table input { background: var(--bg-app); border: 1px solid var(--border); color: var(--text-primary); padding: 0.4rem; border-radius: 4px; width: 100%; }
                    .text-right { text-align: right; }
                    .col-name { width: 40%; } .col-city { width: 25%; } .col-remarks { width: 25%; } .col-actions { width: 10%; }
                    .cell-wrapper { display: flex; align-items: center; gap: 0.5rem; }
                    .text-disabled { color: var(--text-muted); opacity: 0.5; font-style: italic; }
                    .text-secondary { color: var(--text-secondary); }

                    /* Action Buttons */
                    .action-group { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; opacity: 0; transform: translateX(10px); transition: all 0.2s; }
                    .details-table tr:hover .action-group { opacity: 1; transform: translateX(0); }
                    .action-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
                    .action-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
                    .action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                    .action-btn.edit:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                    .action-btn.success { color: #10b981; } .action-btn.success:hover { background: rgba(16, 185, 129, 0.1); }
                    .action-btn.cancel { color: #94a3b8; } .action-btn.cancel:hover { background: rgba(255,255,255,0.1); }

                    .edit-row { background: rgba(255, 255, 255, 0.02); }
                    .edit-input { width: 100%; background: var(--bg-app); border: 1px solid var(--primary); padding: 0.5rem; border-radius: var(--radius-sm); color: var(--text-primary); font-family: inherit; font-size: 1rem; }
                    .edit-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); }
                    
                    .empty-table-state { padding: 6rem 2rem; text-align: center; color: var(--text-muted); }
                    .empty-table-state i { font-size: 3.5rem; margin-bottom: 1.5rem; opacity: 0.3; }
                    .empty-table-state p { font-size: 1.1rem; }

                    /* Grid View Styles */
                    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                    .food-card { background: var(--bg-surface); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
                    .food-card:not(.editing):hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
                    
                    .card-image-area { aspect-ratio: 4/3; background: #1e1e24; position: relative; overflow: hidden; }
                    .card-image-area img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
                    .food-card:hover .card-image-area img { transform: scale(1.05); }
                    .placeholder-icon { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem; color: var(--text-muted); opacity: 0.3; }
                    
                    .card-overlay { position: absolute; top: 0; right: 0; padding: 0.5rem; display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; z-index: 2; }
                    .food-card:hover .card-overlay { opacity: 1; }
                    .icon-btn-overlay { background: rgba(0,0,0,0.6); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: 0.2s; }
                    .icon-btn-overlay:hover { background: var(--primary); } .icon-btn-overlay.delete:hover { background: #ef4444; }
                    
                    .card-info { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
                    .card-info h3 { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
                    .card-details { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; color: var(--text-secondary); }
                    .detail-row { display: flex; align-items: center; gap: 0.5rem; }
                    .detail-row i { color: var(--primary); opacity: 0.8; }
                    
                    .food-card.editing { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); }
                    .card-image-area.edit-mode .edit-image-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
                    .card-image-area.edit-mode:hover .edit-image-overlay { opacity: 1; }
                    
                    .edit-form { gap: 0.5rem; }
                    .edit-field { background: var(--bg-app); border: 1px solid var(--border); color: var(--text-primary); padding: 0.5rem; border-radius: 4px; width: 100%; }
                    .edit-field:focus { outline: none; border-color: var(--primary); }
                    .edit-field.name { font-weight: 600; }
                    .edit-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
                    .save-btn, .cancel-btn { flex: 1; padding: 0.5rem; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; }
                    .save-btn { background: var(--primary); color: white; } .cancel-btn { background: var(--bg-surface-hover); color: var(--text-muted); }

                    .empty-state-card { grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
                    .empty-state-card i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; display: block; }
                    
                    /* Utility */
                    .fade-in { animation: fadeIn 0.4s ease-out; }
                    .fade-in-up { animation: fadeInUp 0.4s ease-out backwards; }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                    @media (max-width: 768px) {
                        .toolbar-row { flex-direction: column; }
                        .inputs-group { flex-direction: column; }
                        .add-input-wrapper { width: 100%; min-width: 0; }
                        .sub-input { border-left: none !important; border-top: 1px solid var(--border); }
                        .col-city, .col-remarks { display: none; } .col-name { width: 80%; }
                        .table-card { overflow-x: auto; }
                    }
                `}</style>
            </div>
        );
    };

    window.StateDetails = StateDetails;
    console.log("StateDetails component registered on window (v10 - Generalized Add)");
})();
