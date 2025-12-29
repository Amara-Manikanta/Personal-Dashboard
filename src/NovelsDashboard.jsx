
window.NovelsDashboard = ({ onBackToHome }) => {
    const { useState, useEffect } = React;
    // ---- State: Data ----
    const [novels, setNovels] = useState(() => {
        // User requested to disable localStorage reading.
        // We load directly from the static data file.
        console.log("Loading novels from static data.js");
        return window.novelsData || [];
    });

    // ---- State: UI ----
    const [filters, setFilters] = useState({
        status: "All",
        genre: "All",
        author: "All",
        minRating: 0
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNovel, setEditingNovel] = useState(null);
    const [deletingNovelId, setDeletingNovelId] = useState(null); // New state for delete confirmation

    // ---- Sub-components ----
    const StatsBoard = ({ novels }) => {
        const [viewMode, setViewMode] = useState('authors'); // 'authors', 'genres', 'years', 'my_rating', 'goodreads_rating'
        const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

        const stats = React.useMemo(() => {
            const counts = {};

            // Helper to increment counts
            const increment = (key) => {
                if (key !== undefined && key !== null && key !== '') {
                    counts[key] = (counts[key] || 0) + 1;
                }
            };

            novels.forEach(novel => {
                if (novel.status === 'Read') {
                    if (viewMode === 'authors') increment(novel.author);
                    else if (viewMode === 'genres') increment(novel.genre);
                    else if (viewMode === 'years') increment(novel.readYear);
                    else if (viewMode === 'my_rating') increment(novel.rating);
                    else if (viewMode === 'goodreads_rating') increment(novel.goodreadsRating);
                    else if (viewMode === 'pages_year') {
                        const year = novel.readYear;
                        if (year) {
                            counts[year] = (counts[year] || 0) + (novel.pages || 0);
                        }
                    }
                }
            });

            const statsArray = Object.entries(counts).map(([label, count]) => ({
                label,
                count
            }));

            // Custom sort for ratings to handle numeric values correctly if needed
            return statsArray.sort((a, b) => {
                // If sorting by label (e.g. Years or Ratings), we might want numeric sort
                // But user requested "read more books" style, so sticking to Count sort first.
                // Secondary sort could be label.

                let diff = 0;
                if (sortOrder === 'asc') diff = a.count - b.count;
                else diff = b.count - a.count;

                // Secondary sort by label if counts are equal (optional, but good for UI)
                if (diff === 0) {
                    // For ratings and years, numeric sort on label makes sense
                    if (viewMode === 'years' || viewMode === 'my_rating' || viewMode === 'goodreads_rating' || viewMode === 'pages_year') {
                        return Number(b.label) - Number(a.label); // Descending label by default (newest/highest first)
                    }
                    return a.label.localeCompare(b.label);
                }
                return diff;
            });

        }, [novels, sortOrder, viewMode]);

        const getTitle = () => {
            switch (viewMode) {
                case 'authors': return 'Authors Statistics';
                case 'genres': return 'Genre Statistics';
                case 'years': return 'Yearly Statistics';
                case 'my_rating': return 'My Ratings Distribution';
                case 'goodreads_rating': return 'Goodreads Ratings Distribution';
                case 'pages_year': return 'Pages Read Per Year';
                default: return 'Statistics';
            }
        };

        const getColumnLabel = () => {
            switch (viewMode) {
                case 'authors': return 'Author';
                case 'genres': return 'Genre';
                case 'years': return 'Year';
                case 'my_rating': return 'My Rating';
                case 'goodreads_rating': return 'Goodreads Rating';
                case 'pages_year': return 'Year';
                default: return 'Item';
            }
        }

        return (
            <div className="authors-stats-container">
                <div className="stats-header">
                    <h2>{getTitle()} <span className="count">({stats.length})</span></h2>

                    <div className="stats-controls">
                        {/* View Mode Toggle */}
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'authors' ? 'active' : ''}`}
                                onClick={() => setViewMode('authors')}
                            >
                                Authors
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'genres' ? 'active' : ''}`}
                                onClick={() => setViewMode('genres')}
                            >
                                Genres
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'years' ? 'active' : ''}`}
                                onClick={() => setViewMode('years')}
                            >
                                Years
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'my_rating' ? 'active' : ''}`}
                                onClick={() => setViewMode('my_rating')}
                            >
                                My Rating
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'goodreads_rating' ? 'active' : ''}`}
                                onClick={() => setViewMode('goodreads_rating')}
                            >
                                Goodreads
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'pages_year' ? 'active' : ''}`}
                                onClick={() => setViewMode('pages_year')}
                            >
                                Pages/Year
                            </button>
                        </div>

                        <div className="sort-controls">
                            <span>Sort:</span>
                            <button
                                className={`sort-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                                onClick={() => setSortOrder('asc')}
                            >
                                Asc <i className="ph-bold ph-arrow-up"></i>
                            </button>
                            <button
                                className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                                onClick={() => setSortOrder('desc')}
                            >
                                Desc <i className="ph-bold ph-arrow-down"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {stats.length > 0 ? (
                    <div className="stats-table-wrapper">
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>{getColumnLabel()}</th>
                                    <th className="text-right">{viewMode === 'pages_year' ? 'Pages Read' : 'Books Read'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            {item.label}
                                            {(viewMode === 'my_rating' || viewMode === 'goodreads_rating') && <i className="ph-fill ph-star text-warning" style={{ marginLeft: '4px', fontSize: '0.9em' }}></i>}
                                        </td>
                                        <td className="text-right">
                                            <span className="count-badge">{item.count}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="ph ph-mask-sad"></i>
                        <p>No read books found to calculate stats.</p>
                    </div>
                )}
            </div>
        );
    };

    // ---- View State ----
    const [selectedNovel, setSelectedNovel] = useState(null);
    const [activeTab, setActiveTab] = useState('novels'); // 'novels' or 'stats'
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // ---- Effects ----
    // Save to local storage whenever novels change
    useEffect(() => {
        // localStorage.setItem('novelsCache_v5', JSON.stringify(novels));
        // Disabled saving to localStorage as per user request. 
        // Changes in UI will not persist on reload.

        // Update global filters list dynamically if new authors/genres are added
        // Simple hack: reload window globals if needed, but for now we just rely on component re-renders
    }, [novels]);

    // ---- Derived State ----
    // Calculate all unique genres (static + used) for the form suggestion list
    const allGenres = React.useMemo(() => {
        const standardGenres = window.GENRES || ["Fantasy", "Sci-Fi", "Contemporary", "Thriller"];
        const usedGenres = novels.map(n => n.genre);
        return [...new Set([...standardGenres.filter(g => g !== "All"), ...usedGenres])].sort();
    }, [novels]);

    // Calculate Stats
    const stats = React.useMemo(() => {
        const readCount = novels.filter(n => n.status === 'Read').length;
        const ownedCount = novels.filter(n => n.ownership === 'home' || n.ownership === 'lent').length;
        const havingCount = novels.filter(n => n.ownership === 'home').length;
        return { readCount, ownedCount, havingCount };
    }, [novels]);

    // ---- Actions ----
    const handleAddNovel = (newNovelData) => {
        const newNovel = {
            ...newNovelData,
            id: Date.now(), // Simple ID generation
        };
        setNovels([newNovel, ...novels]);
        setIsModalOpen(false);
    };

    const handleUpdateNovel = (updatedData) => {
        const updatedList = novels.map(n => n.id === editingNovel.id ? { ...updatedData, id: n.id } : n);
        setNovels(updatedList);

        // If we are viewing this novel, update the selectedNovel state too so the view refreshes
        if (selectedNovel && selectedNovel.id === editingNovel.id) {
            setSelectedNovel({ ...updatedData, id: editingNovel.id });
        }

        setIsModalOpen(false);
        setEditingNovel(null);
    };

    // Initiate delete flow (open modal)
    const initiateDelete = (id) => {
        setDeletingNovelId(id);
    };

    // Actual delete action
    const confirmDelete = () => {
        if (deletingNovelId) {
            setNovels(novels.filter(n => n.id !== deletingNovelId));

            // If we are viewing the deleted novel, go back to dashboard
            if (selectedNovel && selectedNovel.id === deletingNovelId) {
                setSelectedNovel(null);
            }

            setDeletingNovelId(null);
        }
    };

    const cancelDelete = () => {
        setDeletingNovelId(null);
    };

    const handleExportData = () => {
        const dataStr = JSON.stringify(novels, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `my - novels - data - ${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openAddModal = () => {
        setEditingNovel(null);
        setIsModalOpen(true);
    };

    const openEditModal = (novel) => {
        setEditingNovel(novel);
        setIsModalOpen(true);
    };

    // ---- Filtering Logic ----
    // ---- Filtering Logic ----
    const getFilteredNovels = () => {
        let result = novels.filter(novel => {
            const matchesStatus = filters.status === 'All' || novel.status === filters.status;
            const matchesGenre = filters.genre === 'All' || novel.genre === filters.genre;
            const matchesAuthor = filters.author === 'All' || novel.author === filters.author;
            const matchesRating = novel.rating >= filters.minRating;

            let matchesOwnership = true;
            if (filters.ownership === 'owned') matchesOwnership = novel.ownership && novel.ownership !== 'none';
            if (filters.ownership === 'home') matchesOwnership = novel.ownership === 'home';
            if (filters.ownership === 'lent') matchesOwnership = novel.ownership === 'lent';

            if (searchTerm) {
                const lowerTerm = searchTerm.toLowerCase();
                const matchesValid = novel.title.toLowerCase().includes(lowerTerm) ||
                    novel.author.toLowerCase().includes(lowerTerm) ||
                    novel.genre.toLowerCase().includes(lowerTerm);
                if (!matchesValid) return false;
            }

            return matchesStatus && matchesGenre && matchesAuthor && matchesRating && matchesOwnership;
        });

        return result.sort((a, b) => {
            if (filters.sort === 'rating') return b.rating - a.rating;
            if (filters.sort === 'goodreads') return (Number(b.goodreadsRating) || 0) - (Number(a.goodreadsRating) || 0);
            if (filters.sort === 'dateRead') {
                // Basic sort by year then month (descending)
                if (b.readYear !== a.readYear) return (b.readYear || 0) - (a.readYear || 0);
                return (b.readMonth || 0) - (a.readMonth || 0);
            }
            return a.title.localeCompare(b.title); // Default Title A-Z
        });
    };

    const filteredNovels = getFilteredNovels();

    return (
        <div className="app-layout">
            {/* Header */}
            <header className="app-header">
                <div className="container header-container">
                    <div className="header-row-top">
                        <div className="logo">
                            <button className="home-btn" onClick={onBackToHome} title="Back to Home">
                                <i className="ph-bold ph-house"></i>
                            </button>
                            <i className="ph-fill ph-books logo-icon"></i>
                            <h1>Novels<span className="text-primary">Dash</span></h1>
                        </div>
                    </div>

                    <div className="header-row-bottom">
                        {/* Tab Navigation */}
                        <div className="nav-tabs">
                            <button
                                className={`nav-tab ${activeTab === 'novels' ? 'active' : ''}`}
                                onClick={() => setActiveTab('novels')}
                            >
                                Novels
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
                                onClick={() => setActiveTab('stats')}
                            >
                                Stats
                            </button>
                        </div>

                        <div className="header-actions-group">
                            <div className="search-bar">
                                <i className="ph ph-magnifying-glass"></i>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="stats-pills">
                                <div className="stat-pill" title="Books Read">
                                    <i className="ph-fill ph-book-open-text"></i>
                                    <span>{stats.readCount}</span>
                                    <span className="stat-label">Read</span>
                                </div>
                                <div className="stat-pill" title="Books At Home">
                                    <i className="ph-fill ph-house-line"></i>
                                    <span>{stats.havingCount}</span>
                                    <span className="stat-label">Having</span>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button
                                    className={`export-btn ${isFilterVisible ? 'active' : ''}`}
                                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                                    title="Toggle Filters"
                                    style={isFilterVisible ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                                >
                                    <i className={`ph-bold ${isFilterVisible ? 'ph-funnel-x' : 'ph-funnel'}`}></i>
                                    <span className="btn-text">{isFilterVisible ? 'Hide Filters' : 'Filter'}</span>
                                </button>
                                <button className="export-btn" onClick={handleExportData} title="Export Data">
                                    <i className="ph-bold ph-download-simple"></i>
                                    <span className="btn-text">Export</span>
                                </button>
                                <button className="add-btn" onClick={openAddModal}>
                                    <i className="ph-bold ph-plus"></i>
                                    <span>Add Novel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content container">
                {selectedNovel ? (
                    <window.NovelDetails
                        novel={selectedNovel}
                        onBack={() => setSelectedNovel(null)}
                        onEdit={openEditModal}
                        onDelete={initiateDelete}
                    />
                ) : activeTab === 'stats' ? (
                    <StatsBoard novels={novels} />
                ) : (
                    <div className="content-grid" style={{ gridTemplateColumns: isFilterVisible ? '280px 1fr' : '1fr' }}>
                        {/* Pass current novels to sidebar to update author lists dynamically */}
                        {isFilterVisible && (
                            <window.FilterSidebar
                                filters={filters}
                                setFilters={setFilters}
                                novels={novels}
                            />
                        )}

                        <div className="gallery-section">
                            <div className="gallery-header">
                                <h2>All Novels <span className="count">({filteredNovels.length})</span></h2>
                            </div>

                            {filteredNovels.length > 0 ? (
                                <div className="novels-grid" style={{
                                    gridTemplateColumns: isFilterVisible ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))'
                                }}>
                                    {filteredNovels.map(novel => (
                                        <window.NovelCard
                                            key={novel.id}
                                            novel={novel}
                                            onEdit={openEditModal}
                                            onDelete={initiateDelete}
                                            onSelect={setSelectedNovel}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <i className="ph ph-mask-sad"></i>
                                    <p>No novels found matching your filters.</p>
                                    <button
                                        className="reset-btn"
                                        onClick={() => {
                                            setFilters({ status: "All", genre: "All", author: "All", minRating: 0 });
                                            setSearchTerm("");
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal - Add/Edit */}
            <window.Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingNovel ? "Edit Novel" : "Add New Novel"}
            >
                <window.NovelForm
                    key={editingNovel ? editingNovel.id : 'new'} // Reset form state when switching
                    initialData={editingNovel}
                    onSubmit={editingNovel ? handleUpdateNovel : handleAddNovel}
                    onCancel={() => setIsModalOpen(false)}
                    allGenres={allGenres}
                />
            </window.Modal>

            {/* Modal - Delete Confirmation */}
            <window.Modal
                isOpen={!!deletingNovelId}
                onClose={cancelDelete}
                title="Confirm Delete"
            >
                <div className="delete-modal-content">
                    <p>Are you sure you want to delete this novel? This action cannot be undone.</p>
                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button className="btn-secondary" onClick={cancelDelete}>Cancel</button>
                        <button className="btn-primary" onClick={confirmDelete} style={{ backgroundColor: '#ef4444' }}>Delete</button>
                    </div>
                </div>
            </window.Modal>

            <style>{`
    .app-header {
    background-color: rgba(15, 17, 21, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
    height: auto;
    padding: 0.25rem 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
                .header-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
}
                .header-row-top {
    width: 100%;
    display: flex;
    justify-content: center; /* Center the title/logo */
}
                .header-row-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
}
                .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    min-width: 150px;
}
                .text-primary { color: var(--primary); }
                .logo-icon { color: var(--primary); font-size: 1.5rem; }
                
                .nav-tabs {
                    display: flex;
                    gap: 0.5rem;
                    background: var(--bg-surface);
                    padding: 0.25rem;
                    border-radius: 9999px;
                    border: 1px solid var(--border);
                    margin-right: auto;
                    margin-left: 1rem;
                }
                .nav-tab {
                    background: transparent;
                    border: none;
                    padding: 0.4rem 1rem;
                    border-radius: 9999px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .nav-tab.active {
                    background: var(--primary);
                    color: white;
                    color: var(--bg-body); /* Invert text for contrast if needed, or white */
                    color: #fff;
                }
                .nav-tab:hover:not(.active) {
                    color: var(--text-primary);
                }

                .search-bar {
    position: relative;
    width: 100%;
    max-width: 400px;
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
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 9999px;
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s;
}
                .search-bar input:focus {
    border-color: var(--primary);
}
                
                .add-btn, .export-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
}
                .add-btn {
    background: var(--primary);
    color: white;
}
                .add-btn:hover {
    background: var(--primary-hover);
}
                .export-btn {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
}
                .export-btn:hover {
    background: var(--bg-surface-hover);
    border-color: var(--text-muted);
}

/* Authors Stats Styles */
.authors-stats-container {
    padding-top: 2rem;
    max-width: 900px;
    margin: 0 auto;
}
.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}
.stats-controls {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}
.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.9rem;
}
.stats-select {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 0.4rem 1.5rem 0.4rem 0.8rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.85rem;
    outline: none;
    min-width: 140px;
}
.stats-select:focus {
    border-color: var(--primary);
}
.sort-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-muted);
    font-size: 0.9rem;
}
.sort-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 0.4rem 0.8rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}
.sort-btn:hover {
    border-color: var(--primary);
}
.sort-btn.active {
    background: var(--primary-soft);
    color: var(--primary);
    border-color: var(--primary);
}

.view-toggle {
    display: flex;
    background: var(--bg-surface);
    padding: 0.25rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
}
.toggle-btn {
    background: transparent;
    border: none;
    padding: 0.35rem 0.8rem;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}
.toggle-btn.active {
    background: var(--bg-body);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.toggle-btn:hover:not(.active) {
    color: var(--text-primary);
}

.stats-table-wrapper {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}
.stats-table {
    width: 100%;
    border-collapse: collapse;
}
.stats-table th, .stats-table td {
    padding: 1rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
}
.stats-table th {
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-muted);
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
}
.stats-table tr:last-child td {
    border-bottom: none;
}
.stats-table tr:hover {
    background: rgba(255, 255, 255, 0.02);
}
.text-right {
    text-align: right;
}
.count-badge {
    display: inline-block;
    background: var(--primary-soft);
    color: var(--primary);
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 0.9rem;
}

/* Hide text on small screens for buttons */
@media(max-width: 600px) {
                    .btn-text, .add-btn span {
        display: none;
    }
                    .add-btn, .export-btn {
        padding: 0.75rem;
    }
                    .nav-tabs {
                        margin-left: 1rem;
                        gap: 0.5rem;
                    }
                    .nav-tab {
                        padding: 0.4rem 0.8rem;
                        font-size: 0.8rem;
                    }
                    .logo-icon { display: none; }
}
                
                .content-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    padding-top: 2rem;
}
                
                .gallery-section {
    flex: 1;
}
                .gallery-header {
    margin-bottom: 1.5rem;
}
                .count {
    color: var(--text-muted);
    font-size: 1rem;
    font-weight: 400;
}
                
                .novels-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr); /* Enforce 4 columns on desktop */
                    gap: 1.5rem; /* Increased gap slightly for better breathing room */
                }

                @media (max-width: 1200px) {
                    .novels-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                
                @media (max-width: 768px) {
                    .novels-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 480px) {
                    .novels-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
    border: 2px dashed var(--border);
    border-radius: var(--radius-lg);
    padding: 4rem;
    text-align: center;
    color: var(--text-muted);
}
                .empty-state i { font-size: 3rem; margin-bottom: 1rem; }
                .reset-btn {
    margin-top: 1rem;
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: var(--radius-md);
    cursor: pointer;
}

/* Layout Shift for Mobile */
@media(max-width: 900px) {
                    .content-grid {
        grid-template-columns: 1fr;
    }
                    .header-container {
        gap: 1rem;
        flex-wrap: wrap;
        height: auto;
        padding: 1rem 0;
    }
                    .logo span { display: none; }
                    .header-actions-group {
        width: 100%;
        justify-content: space-between;
        flex-wrap: wrap;
        margin-top: 0.5rem;
    }
                    .search-bar { max-width: 100%; order: 3; margin-top: 1rem; }
                     .stats-pills { order: 1; }
                    .action-buttons { order: 2; }
                    
                    /* Adjust tabs for mobile */
                    .nav-tabs {
                        width: 100%;
                        margin: 0.5rem 0;
                        justify-content: center;
                        order: 0; 
                    }
}

                .header-actions-group {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    justify-content: flex-end;
}
                
                .stats-pills {
    display: flex;
    gap: 0.75rem;
    padding: 0 1rem;
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
}
                .stat-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
}
                .stat-pill i { color: var(--primary); }
                .stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

                .action-buttons {
    display: flex;
    gap: 0.75rem;
}

                .home-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
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
                .home-btn:hover {
    background: var(--bg-surface);
    border-color: var(--primary);
    color: var(--primary);
}
`}</style>
        </div>
    );
};
