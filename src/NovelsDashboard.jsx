
window.NovelsDashboard = ({ onBackToHome, onAuthorClick }) => {
    const { useState, useEffect } = React;
    // ---- State: Data ----
    const [novels, setNovels] = useState(() => {
        return window.novelsData || [];
    });

    // Check for pending selected novel (deep link from Author Page)
    useEffect(() => {
        if (window.pendingSelectedNovel) {
            // Find the full novel object in case the passed one is incomplete or stale
            const found = novels.find(n => n.id === window.pendingSelectedNovel.id);
            if (found) {
                setSelectedNovel(found);
            }
            window.pendingSelectedNovel = null;
        }
    }, [novels]);

    // ---- State: UI ----
    const [filters, setFilters] = useState({
        status: "All",
        genre: "All",
        author: "All",
        minRating: 0,
        year: "All"
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNovel, setEditingNovel] = useState(null);
    const [duplicateDraft, setDuplicateDraft] = useState(null);
    const [duplicateCount, setDuplicateCount] = useState(0);
    const [deletingNovelId, setDeletingNovelId] = useState(null); // New state for delete confirmation

    // Multi-select. Ids rather than objects, so a selection survives edits.
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [confirmingBulk, setConfirmingBulk] = useState(false);
    const [bulkBusy, setBulkBusy] = useState(false);

    // ---- View State ----
    const [selectedNovel, setSelectedNovel] = useState(null);
    const [activeTab, setActiveTab] = useState('novels'); // 'novels' or 'stats'
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'shelf'

    // ---- Effects ----
    // Save to local storage whenever novels change
    useEffect(() => {
        // localStorage.setItem('novelsCache_v5', JSON.stringify(novels));
        // Disabled saving to localStorage as per user request. 
        // Changes in UI will not persist on reload.

        // Update global window object so AuthorPage gets the latest novels
        window.novelsData = novels;
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
        const readCount = novels.filter(n => n.status === 'Read' || n.status === 'Tried').length;
        const ownedCount = novels.filter(n => n.ownership === 'home' || n.ownership === 'lent').length;
        const havingCount = novels.filter(n => n.ownership === 'home').length;
        return { readCount, ownedCount, havingCount };
    }, [novels]);

    // ---- Actions ----
    // Takes one entry, or an array when several issues are added at once.
    // Ids are offset per entry: Date.now() alone would give a whole batch the
    // same id, and editing or deleting one would then hit all of them.
    const handleAddNovel = (newNovelData) => {
        const batch = Array.isArray(newNovelData) ? newNovelData : [newNovelData];
        const base = Date.now();
        const newNovels = batch.map((data, i) => ({ ...data, id: base + i }));
        const updatedList = [...newNovels, ...novels];
        setNovels(updatedList);
        window.api.saveNovels(updatedList); // Save to API
        setIsModalOpen(false);
    };

    const handleUpdateNovel = (updatedData) => {
        const updatedList = novels.map(n => n.id === editingNovel.id ? { ...updatedData, id: n.id } : n);
        setNovels(updatedList);
        window.api.saveNovels(updatedList); // Save to API

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
            const updatedList = novels.filter(n => n.id !== deletingNovelId);
            setNovels(updatedList);
            window.api.saveNovels(updatedList); // Save to API

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

    const toggleSelected = (novel) => setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(novel.id) ? next.delete(novel.id) : next.add(novel.id);
        return next;
    });

    const exitSelectMode = () => {
        setSelectMode(false);
        setSelectedIds(new Set());
        setConfirmingBulk(false);
    };

    /**
     * Delete every selected entry in one save.
     *
     * The save is awaited and undone on failure, so the screen never shows
     * books as gone when they are still on disk. It passes force because the
     * server otherwise refuses any save losing over 30% of entries — a guard
     * against accidental wipes, which a counted, confirmed delete is not.
     */
    const confirmBulkDelete = async () => {
        const previous = novels;
        const updatedList = novels.filter(n => !selectedIds.has(n.id));
        setBulkBusy(true);
        setNovels(updatedList);
        try {
            await window.api.saveNovels(updatedList, { strict: true, force: true });
            exitSelectMode();
        } catch (e) {
            setNovels(previous);
            setConfirmingBulk(false);
            if (String(e && e.message) !== 'VERSION_CONFLICT') {
                alert('Could not delete — nothing was removed. Please try again.');
            }
        } finally {
            setBulkBusy(false);
        }
    };


    const openAddModal = () => {
        setDuplicateDraft(null);
        setEditingNovel(null);
        setIsModalOpen(true);
    };

    const openEditModal = (novel) => {
        setDuplicateDraft(null);
        setEditingNovel(novel);
        setIsModalOpen(true);
    };

    // A copy of an entry, opened as a new one. A comic or manga is read in
    // runs of chapters, and every run shares the author, genre, cover and
    // format — only the title's number changes — so the form opens already
    // filled in. What belongs to one particular read is left behind: the
    // review, quotes and phrases describe the chapters read last time, not
    // these, and copying them would put a wrong review on the new entry.
    const openDuplicateModal = (novel) => {
        const { id, quotes, phrases, review, ...shared } = novel;
        setEditingNovel(null);
        setDuplicateDraft({ ...shared, quotes: [], phrases: [], review: '' });
        setDuplicateCount(n => n + 1);
        setIsModalOpen(true);
    };

    // ---- Filtering Logic ----
    // ---- Filtering Logic ----
    const getFilteredNovels = () => {
        let result = novels.filter(novel => {
            const matchesStatus = filters.status === 'All' || novel.status === filters.status;
            const matchesGenre = filters.genre === 'All' || novel.genre === filters.genre;
            const matchesAuthor = filters.author === 'All' || (novel.author && novel.author.split(',').map(a => a.trim()).includes(filters.author));
            const matchesRating = novel.rating >= filters.minRating;

            let matchesYear = true;
            if (filters.year && filters.year !== 'All') {
                const novelYear = novel.completedDate 
                    ? new Date(novel.completedDate).getFullYear().toString() 
                    : (novel.readYear ? novel.readYear.toString() : null);
                matchesYear = novelYear === filters.year;
            }

            let matchesOwnership = true;
            if (filters.ownership === 'owned') matchesOwnership = novel.ownership && novel.ownership !== 'none';
            if (filters.ownership === 'home') matchesOwnership = novel.ownership === 'home';
            if (filters.ownership === 'lent') matchesOwnership = novel.ownership === 'lent';

            if (searchTerm) {
                const lowerTerm = searchTerm.toLowerCase();
                const matchesValid = (novel.title || '').toLowerCase().includes(lowerTerm) ||
                    (novel.author || '').toLowerCase().includes(lowerTerm) ||
                    (novel.genre || '').toLowerCase().includes(lowerTerm);
                if (!matchesValid) return false;
            }

            return matchesStatus && matchesGenre && matchesAuthor && matchesRating && matchesYear && matchesOwnership;
        });

        return result.sort((a, b) => {
            if (filters.sort === 'rating') return b.rating - a.rating;
            if (filters.sort === 'goodreads') return (Number(b.goodreadsRating) || 0) - (Number(a.goodreadsRating) || 0);
            if (filters.sort === 'dateRead') {
                const getSortDate = (n) => {
                    if (n.completedDate) return new Date(n.completedDate).getTime();
                    if (n.readYear) return new Date(n.readYear, (n.readMonth || 1) - 1, 1).getTime();
                    return 0;
                };
                return getSortDate(b) - getSortDate(a);
            }
            return a.title.localeCompare(b.title); // Default Title A-Z
        });
    };

    const handleDirectUpdate = (updatedNovel) => {
        const updatedList = novels.map(n => n.id === updatedNovel.id ? updatedNovel : n);
        setNovels(updatedList);
        window.api.saveNovels(updatedList);
        setSelectedNovel(updatedNovel);
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
                                {/* View Toggle: Grid / Shelf */}
                                <div className="view-toggle-bookshelf">
                                    <button
                                        className={`toggle-btn-bs ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                        title="Grid View"
                                    >
                                        <i className="ph-bold ph-squares-four"></i>
                                    </button>
                                    <button
                                        className={`toggle-btn-bs ${viewMode === 'shelf' ? 'active' : ''}`}
                                        onClick={() => setViewMode('shelf')}
                                        title="Bookshelf View"
                                    >
                                        <i className="ph-bold ph-bookmarks-simple"></i>
                                    </button>
                                </div>

                                <button
                                    className={`export-btn ${isFilterVisible ? 'active' : ''}`}
                                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                                    title="Toggle Filters"
                                    style={isFilterVisible ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                                >
                                    <i className={`ph-bold ${isFilterVisible ? 'ph-funnel-x' : 'ph-funnel'}`}></i>
                                    <span className="btn-text">{isFilterVisible ? 'Hide Filters' : 'Filter'}</span>
                                </button>

                                <button
                                    className={`export-btn ${selectMode ? 'active' : ''}`}
                                    onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
                                    title="Select several to delete"
                                    style={selectMode ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                                >
                                    <i className={`ph-bold ${selectMode ? 'ph-x' : 'ph-check-square'}`}></i>
                                    <span className="btn-text">{selectMode ? 'Done' : 'Select'}</span>
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
                        onDuplicate={openDuplicateModal}
                        onDelete={initiateDelete}
                        onAuthorClick={onAuthorClick}
                        onUpdate={handleDirectUpdate}
                    />
                ) : activeTab === 'stats' ? (
                    <window.NovelStats novels={novels} onAuthorClick={onAuthorClick} />
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

                            {selectMode && (() => {
                                const shownIds = filteredNovels.map(n => n.id);
                                const allShownSelected = shownIds.length > 0 && shownIds.every(id => selectedIds.has(id));
                                return (
                                    <div className="bulk-bar" role="region" aria-label="Selection">
                                        <span className="bulk-count">
                                            {selectedIds.size === 0 ? 'Click books to select them' : `${selectedIds.size} selected`}
                                        </span>
                                        <button
                                            className="bulk-link"
                                            onClick={() => setSelectedIds(prev => {
                                                const next = new Set(prev);
                                                shownIds.forEach(id => (allShownSelected ? next.delete(id) : next.add(id)));
                                                return next;
                                            })}
                                        >
                                            {allShownSelected ? 'Unselect all shown' : `Select all ${shownIds.length} shown`}
                                        </button>
                                        {selectedIds.size > 0 && (
                                            <button className="bulk-link" onClick={() => setSelectedIds(new Set())}>Clear</button>
                                        )}
                                        <button
                                            className="bulk-delete"
                                            disabled={selectedIds.size === 0}
                                            onClick={() => setConfirmingBulk(true)}
                                        >
                                            <i className="ph-bold ph-trash"></i> Delete {selectedIds.size || ''}
                                        </button>
                                    </div>
                                );
                            })()}

                            {filteredNovels.length > 0 ? (
                                // The shelf has no room for tick boxes, so selecting
                                // always shows the grid.
                                viewMode === 'shelf' && !selectMode ? (
                                    <window.BookshelfView
                                        novels={filteredNovels}
                                        onSelect={setSelectedNovel}
                                        onEdit={openEditModal}
                                        onDelete={initiateDelete}
                                    />
                                ) : (
                                    <div className="novels-grid" style={{
                                        gridTemplateColumns: isFilterVisible ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)'
                                    }}>
                                        {filteredNovels.map(novel => (
                                            <window.NovelCard
                                                key={novel.id}
                                                novel={novel}
                                                onEdit={openEditModal}
                                                onDuplicate={openDuplicateModal}
                                                onDelete={initiateDelete}
                                                onSelect={setSelectedNovel}
                                                selectable={selectMode}
                                                selected={selectedIds.has(novel.id)}
                                                onToggleSelect={toggleSelected}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="empty-state">
                                    <i className="ph ph-mask-sad"></i>
                                    <p>No novels found matching your filters.</p>
                                    <button
                                        className="reset-btn"
                                        onClick={() => {
                                            setFilters({ status: "All", genre: "All", author: "All", minRating: 0, year: "All" });
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
                title={editingNovel ? "Edit Novel" : duplicateDraft ? "Duplicate Novel" : "Add New Novel"}
            >
                <window.NovelForm
                    key={editingNovel ? editingNovel.id : duplicateDraft ? `copy-${duplicateCount}` : 'new'} // Reset form state when switching
                    initialData={editingNovel || duplicateDraft}
                    isDuplicate={!editingNovel && !!duplicateDraft}
                    onSubmit={editingNovel ? handleUpdateNovel : handleAddNovel}
                    onCancel={() => setIsModalOpen(false)}
                    allGenres={allGenres}
                />
            </window.Modal>

            {/* Modal - Bulk delete confirmation */}
            <window.Modal
                isOpen={confirmingBulk}
                onClose={() => !bulkBusy && setConfirmingBulk(false)}
                title={`Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'book' : 'books'}?`}
            >
                <div className="delete-modal-content">
                    <p>These will be removed. This can't be undone from here, though the automatic snapshots keep earlier copies.</p>
                    <ul className="bulk-list">
                        {novels.filter(n => selectedIds.has(n.id)).slice(0, 8).map(n => <li key={n.id}>{n.title}</li>)}
                        {selectedIds.size > 8 && <li className="bulk-more">and {selectedIds.size - 8} more</li>}
                    </ul>
                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button className="btn-secondary" onClick={() => setConfirmingBulk(false)} disabled={bulkBusy}>Cancel</button>
                        <button className="btn-primary" onClick={confirmBulkDelete} disabled={bulkBusy} style={{ backgroundColor: '#ef4444' }}>
                            {bulkBusy ? 'Deleting…' : `Delete ${selectedIds.size}`}
                        </button>
                    </div>
                </div>
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
                .app-layout {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                .app-header {
                    background: rgba(13, 16, 23, 0.65);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--border);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    padding: 0.75rem 0;
                }

                .header-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .header-row-top {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.5rem;
                }

                .logo h1 {
                    font-size: 1.5rem;
                    font-weight: 800;
                }

                .logo-icon {
                    color: var(--primary);
                    font-size: 1.75rem;
                }

                .header-row-bottom {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .nav-tabs {
                    display: flex;
                    gap: 0.25rem;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 0.25rem;
                    border-radius: 9999px;
                    border: 1px solid var(--border);
                }

                .nav-tab {
                    background: transparent;
                    border: none;
                    padding: 0.5rem 1.25rem;
                    border-radius: 9999px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .nav-tab:hover {
                    color: var(--text-secondary);
                }

                .nav-tab.active {
                    background: var(--primary);
                    color: #ffffff;
                    box-shadow: var(--glow-primary);
                }

                .header-actions-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .search-bar {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-bar i {
                    position: absolute;
                    left: 1rem;
                    color: var(--text-muted);
                    pointer-events: none;
                }

                .search-bar input {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    border-radius: 9999px;
                    padding: 0.5rem 1rem 0.5rem 2.5rem;
                    outline: none;
                    width: 180px;
                    font-family: inherit;
                    transition: all var(--transition-fast);
                }

                .search-bar input:focus {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.05);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
                    width: 220px;
                }

                .stats-pills {
                    display: flex;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    border: 1px solid var(--border);
                }

                .stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .stat-pill i {
                    color: var(--primary);
                }

                .stat-pill span:first-of-type {
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .stat-pill .stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .bulk-bar {
                    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
                    padding: 0.7rem 1rem; margin-bottom: 1.25rem;
                    background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: var(--radius-md);
                    position: sticky; top: 0.75rem; z-index: 20; backdrop-filter: blur(8px);
                }
                .bulk-count { font-weight: 600; color: var(--text-primary); }
                .bulk-link {
                    background: none; border: none; padding: 0.3rem 0; cursor: pointer; font-family: inherit;
                    color: #a5b4fc; font-size: 0.9rem; text-decoration: underline; text-underline-offset: 3px;
                }
                .bulk-delete {
                    margin-left: auto; display: inline-flex; align-items: center; gap: 0.4rem;
                    padding: 0.5rem 1rem; border-radius: var(--radius-md); border: 1px solid #ef4444;
                    background: #ef4444; color: #fff; font-family: inherit; font-weight: 600; cursor: pointer;
                }
                .bulk-delete:disabled { opacity: 0.45; cursor: not-allowed; }
                .bulk-list { margin: 1rem 0 0; padding-left: 1.2rem; color: var(--text-secondary); line-height: 1.7; max-height: 220px; overflow-y: auto; }
                .bulk-more { color: var(--text-muted); list-style: none; margin-left: -1.2rem; }

                .add-btn {
                    background: linear-gradient(135deg, var(--primary), #4f46e5);
                    color: #ffffff;
                    border: none;
                    border-radius: var(--radius-md);
                    padding: 0.5rem 1rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-family: inherit;
                }

                .add-btn:hover {
                    box-shadow: var(--glow-primary);
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }

                .export-btn {
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
    align-items: center;
}

                .view-toggle-bookshelf {
    display: flex;
    background: var(--bg-surface);
    padding: 0.2rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
}
                .toggle-btn-bs {
    background: transparent;
    border: none;
    padding: 0.4rem 0.6rem;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}
                .toggle-btn-bs.active {
    background: var(--primary);
    color: white;
    box-shadow: 0 1px 4px rgba(99, 102, 241, 0.4);
}
                .toggle-btn-bs:hover:not(.active) {
    color: var(--text-primary);
    background: rgba(255,255,255,0.05);
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
