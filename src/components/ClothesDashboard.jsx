window.ClothesDashboard = ({ onBackToHome }) => {
    const { useState, useEffect, useMemo } = React;
    const [clothes, setClothes] = useState(window.clothesData || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const CATEGORIES = ['Topwear', 'Bottomwear', 'Footwear', 'Outerwear'];
    const OCCASIONS = ['Formal / Office', 'Casual Daily', 'Gym / Activewear', 'Ethnic / Party'];

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedOccasion, setSelectedOccasion] = useState('');
    const [sortBy, setSortBy] = useState('date-newest'); // date-newest, price-high, price-low

    // Sync local state with global window.clothesData if it changes elsewhere
    useEffect(() => {
        setClothes(window.clothesData || []);
    }, [window.clothesData]);

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newItem = {
            id: editingItem ? editingItem.id : Date.now(),
            modelName: formData.get('modelName'),
            price: parseFloat(formData.get('price')) || 0,
            datePurchased: formData.get('datePurchased'),
            imageUrl: formData.get('imageUrl'),
            productLink: formData.get('productLink'),
            colour: formData.get('colour'),
            brand: formData.get('brand') || '',
            size: formData.get('size') || '',
            categories: formData.getAll('categories'),
            occasions: formData.getAll('occasions'),
        };

        let updatedClothes;
        if (editingItem) {
            updatedClothes = clothes.map(item => item.id === editingItem.id ? newItem : item);
        } else {
            updatedClothes = [newItem, ...clothes];
        }

        setClothes(updatedClothes);
        window.clothesData = updatedClothes;
        
        try {
            await window.api.saveClothes(updatedClothes);
        } catch (err) {
            console.error("Failed to save clothes:", err);
        }

        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        
        const updatedClothes = clothes.filter(item => item.id !== id);
        setClothes(updatedClothes);
        window.clothesData = updatedClothes;

        try {
            await window.api.saveClothes(updatedClothes);
        } catch (err) {
            console.error("Failed to delete item:", err);
        }
    };

    const filteredAndSortedClothes = useMemo(() => {
        let result = clothes.filter(item => {
            const matchesSearch = item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.colour && item.colour.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCategory = selectedCategory ? (item.categories && item.categories.includes(selectedCategory)) : true;
            const matchesOccasion = selectedOccasion ? (item.occasions && item.occasions.includes(selectedOccasion)) : true;

            return matchesSearch && matchesCategory && matchesOccasion;
        });

        if (sortBy === 'date-newest') {
            result.sort((a, b) => new Date(b.datePurchased) - new Date(a.datePurchased));
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'price-low') {
            result.sort((a, b) => a.price - b.price);
        }

        return result;
    }, [clothes, searchQuery, sortBy]);

    const totalSpent = clothes.reduce((sum, item) => sum + (item.price || 0), 0);

    return (
        <div className="clothes-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <button className="back-btn" onClick={onBackToHome}>
                        <i className="ph-bold ph-arrow-left"></i>
                    </button>
                    <div className="header-title">
                        <h1>Clothes<span className="text-primary">Tracker</span></h1>
                        <p>Manage your wardrobe and spending</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <i className="ph-bold ph-magnifying-glass"></i>
                        <input 
                            type="text" 
                            placeholder="Search by model, color, brand..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select className="filter-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select className="filter-select" value={selectedOccasion} onChange={e => setSelectedOccasion(e.target.value)}>
                        <option value="">All Occasions</option>
                        {OCCASIONS.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                    </select>
                    <button className="btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                        <i className="ph-bold ph-plus"></i> Add Item
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon items">
                            <i className="ph-fill ph-t-shirt"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total Items</span>
                            <span className="stat-value">{clothes.length}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon price">
                            <i className="ph-fill ph-currency-dollar"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total Spent</span>
                            <span className="stat-value">₹{totalSpent.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon calendar">
                            <i className="ph-fill ph-calendar"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Sort By</span>
                            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="date-newest">Recently Purchased</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="price-low">Price: Low to High</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="items-grid">
                    {filteredAndSortedClothes.map(item => (
                        <div key={item.id} className="item-card">
                            <div className="item-image">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.modelName} />
                                ) : (
                                    <div className="no-image">
                                        <i className="ph-fill ph-image"></i>
                                    </div>
                                )}
                                <div className="item-price-tag">₹{item.price.toLocaleString()}</div>
                            </div>
                            <div className="item-details">
                                <div className="item-header">
                                    <h3>{item.modelName}</h3>
                                    <div className="item-actions">
                                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="action-btn edit">
                                            <i className="ph-bold ph-pencil-simple"></i>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="action-btn delete">
                                            <i className="ph-bold ph-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="item-meta">
                                    {item.brand && (
                                        <span className="meta-badge brand">
                                            <i className="ph-fill ph-storefront"></i> {item.brand}
                                        </span>
                                    )}
                                    {item.size && (
                                        <span className="meta-badge size">
                                            <i className="ph-fill ph-ruler"></i> Size: {item.size}
                                        </span>
                                    )}
                                    <span className="meta-badge color">
                                        <i className="ph-fill ph-palette"></i> {item.colour || 'N/A'}
                                    </span>
                                    <span className="meta-badge date">
                                        <i className="ph-fill ph-calendar-blank"></i> {item.datePurchased || 'Unknown Date'}
                                    </span>
                                </div>
                                {((item.categories && item.categories.length > 0) || (item.occasions && item.occasions.length > 0)) && (
                                    <div className="item-tags">
                                        {item.categories && item.categories.map(cat => <span key={cat} className="tag category">{cat}</span>)}
                                        {item.occasions && item.occasions.map(occ => <span key={occ} className="tag occasion">{occ}</span>)}
                                    </div>
                                )}
                                {item.productLink && (
                                    <a href={item.productLink} target="_blank" rel="noopener noreferrer" className="item-link">
                                        View Product <i className="ph-bold ph-arrow-square-out"></i>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredAndSortedClothes.length === 0 && (
                        <div className="empty-state">
                            <i className="ph-duotone ph-package"></i>
                            <p>No items found. Time to go shopping?</p>
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <i className="ph-bold ph-x"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Model Name</label>
                                <input name="modelName" type="text" defaultValue={editingItem ? editingItem.modelName : ''} required placeholder="e.g. Levi's 511 Slim Fit" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input name="price" type="number" defaultValue={editingItem ? editingItem.price : ''} required placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label>Colour</label>
                                    <input name="colour" type="text" defaultValue={editingItem ? editingItem.colour : ''} placeholder="e.g. Navy Blue" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Brand / Store</label>
                                    <input name="brand" type="text" defaultValue={editingItem ? editingItem.brand : ''} placeholder="e.g. Zara, Zudio" />
                                </div>
                                <div className="form-group">
                                    <label>Size</label>
                                    <input name="size" type="text" defaultValue={editingItem ? editingItem.size : ''} placeholder="e.g. M, 32" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category Tags</label>
                                <div className="checkbox-group">
                                    {CATEGORIES.map(cat => (
                                        <label key={cat} className="checkbox-label">
                                            <input type="checkbox" name="categories" value={cat} defaultChecked={editingItem && editingItem.categories && editingItem.categories.includes(cat)} /> {cat}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Occasion Tags</label>
                                <div className="checkbox-group">
                                    {OCCASIONS.map(occ => (
                                        <label key={occ} className="checkbox-label">
                                            <input type="checkbox" name="occasions" value={occ} defaultChecked={editingItem && editingItem.occasions && editingItem.occasions.includes(occ)} /> {occ}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date Purchased</label>
                                <input name="datePurchased" type="date" defaultValue={(editingItem && editingItem.datePurchased) || new Date().toISOString().split('T')[0]} required />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input name="imageUrl" type="url" defaultValue={editingItem ? editingItem.imageUrl : ''} placeholder="https://example.com/image.jpg" />
                            </div>
                            <div className="form-group">
                                <label>Product Link</label>
                                <input name="productLink" type="url" defaultValue={editingItem ? editingItem.productLink : ''} placeholder="https://amazon.in/p/..." />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .clothes-dashboard {
                    min-height: 100vh;
                    background: var(--bg-app);
                    color: var(--text-primary);
                    padding: 2rem;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                    gap: 2rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .header-title h1 {
                    font-size: 2.5rem;
                    margin: 0;
                }

                .header-title p {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 1rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    flex: 1;
                    justify-content: flex-end;
                }

                .search-bar {
                    position: relative;
                    max-width: 400px;
                    width: 100%;
                }

                .search-bar i {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .search-bar input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 3rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    outline: none;
                    transition: border-color 0.2s;
                }

                .search-bar input:focus {
                    border-color: var(--primary);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .stat-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .stat-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                }

                .stat-icon.items { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
                .stat-icon.price { background: rgba(34, 197, 94, 0.1); color: var(--success); }
                .stat-icon.calendar { background: rgba(245, 158, 11, 0.1); color: var(--warning); }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                }

                .sort-select, .filter-select {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    outline: none;
                }
                .filter-select {
                    min-width: 150px;
                }

                .items-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .item-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .item-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-xl);
                    border-color: var(--primary);
                }

                .item-image {
                    height: 250px;
                    position: relative;
                    background: var(--bg-app);
                }

                .item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .no-image {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                    color: var(--border);
                }

                .item-price-tag {
                    position: absolute;
                    bottom: 1rem;
                    right: 1rem;
                    background: var(--primary);
                    color: white;
                    padding: 0.4rem 0.8rem;
                    border-radius: 2rem;
                    font-weight: 700;
                    font-size: 1rem;
                    box-shadow: var(--shadow-lg);
                }

                .item-details {
                    padding: 1.5rem;
                }

                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .item-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    flex: 1;
                }

                .item-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .action-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.4rem;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                }

                .action-btn.edit:hover { color: var(--primary); background: rgba(99, 102, 241, 0.1); }
                .action-btn.delete:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

                .item-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .meta-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    background: var(--bg-app);
                    padding: 0.3rem 0.75rem;
                    border-radius: 2rem;
                }

                .meta-badge i { color: var(--primary); }

                .item-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: opacity 0.2s;
                }

                .item-link:hover {
                    opacity: 0.8;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 2rem;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    cursor: pointer;
                }

                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .form-group input, .form-group select {
                    width: 100%;
                    background: var(--bg-app);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                }

                .form-group input:focus, .form-group select:focus {
                    outline: none;
                    border-color: var(--primary);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .checkbox-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--bg-app);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    transition: border-color 0.2s;
                }
                
                .checkbox-label:hover {
                    border-color: var(--primary);
                }

                .checkbox-label input {
                    width: auto;
                    margin: 0;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: background 0.2s;
                }

                .btn-primary:hover {
                    background: var(--primary-hover);
                }

                .btn-secondary {
                    background: transparent;
                    color: var(--text-secondary);
                    border: 1px solid var(--border);
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .btn-secondary:hover {
                    background: var(--bg-app);
                    color: var(--text-primary);
                }

                .item-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                .tag {
                    font-size: 0.75rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .tag.category {
                    background: rgba(124, 58, 237, 0.1);
                    color: var(--primary);
                    border: 1px solid rgba(124, 58, 237, 0.3);
                }

                .tag.occasion {
                    background: rgba(34, 197, 94, 0.1);
                    color: var(--success);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }

                .empty-state {
                    grid-column: 1 / -1;
                    padding: 5rem 2rem;
                    text-align: center;
                    color: var(--text-muted);
                }

                .empty-state i {
                    font-size: 5rem;
                    margin-bottom: 1.5rem;
                }

                @media (max-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .header-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .search-bar {
                        max-width: none;
                    }
                }
            `}</style>
        </div>
    );
};
