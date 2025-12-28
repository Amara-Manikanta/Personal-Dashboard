

window.FilterSidebar = ({ filters, setFilters, novels }) => {

    // Extract unique authors from data for the dropdown
    // Use the passed 'novels' prop instead of window.novelsData to get real-time updates
    const authors = ["All", ...new Set((novels || []).map(n => n.author))].sort();

    // Extract unique genres from data + standard genres
    // This allows custom genres entered by users to appear in the filter
    const standardGenres = window.GENRES || ["Fantasy", "Sci-Fi", "Contemporary", "Thriller"];
    const usedGenres = (novels || []).map(n => n.genre);
    const uniqueGenres = ["All", ...new Set([...standardGenres.filter(g => g !== "All"), ...usedGenres])].sort();

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <aside className="filter-sidebar">
            <div className="filter-header">
                <h2><i className="ph ph-sliders-horizontal"></i> Filters</h2>
            </div>

            <div className="filter-group">
                <label>Status</label>
                <div className="status-toggles">
                    {window.STATUSES.map(status => (
                        <button
                            key={status}
                            className={`filter-chip ${filters.status === status ? 'active' : ''}`}
                            onClick={() => handleFilterChange('status', status)}
                        >
                            {status === 'TBR' ? 'To Read' : status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-group">
                <label>Genre</label>
                <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="filter-select"
                >
                    {uniqueGenres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Author</label>
                <select
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                    className="filter-select"
                >
                    {authors.map(author => (
                        <option key={author} value={author}>{author}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Min Rating</label>
                <div className="rating-filter">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            className={`star-btn ${filters.minRating >= star ? 'active' : ''}`}
                            onClick={() => handleFilterChange('minRating', star)}
                        >
                            <i className={`ph-fill ph-star`}></i>
                        </button>
                    ))}
                    <span className="rating-label">{filters.minRating}+ Stars</span>
                </div>
            </div>

            <div className="filter-group">
                <label>Ownership</label>
                <select
                    value={filters.ownership || 'all'}
                    onChange={(e) => handleFilterChange('ownership', e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Books</option>
                    <option value="owned">All Owned</option>
                    <option value="home">Having</option>
                    <option value="lent">Lent To</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Sort By</label>
                <select
                    value={filters.sort || 'title'}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="filter-select"
                >
                    <option value="title">Title (A-Z)</option>
                    <option value="rating">My Rating (High-Low)</option>
                    <option value="goodreads">Goodreads Rating (High-Low)</option>
                    <option value="dateRead">Date Read (Newest)</option>
                </select>
            </div>

            <style>{`
                .filter-sidebar {
                    background-color: var(--bg-surface);
                    border-right: 1px solid var(--border);
                    width: 280px;
                    padding: 1.5rem;
                    height: calc(100vh - 80px); /* Adjust based on header */
                    position: sticky;
                    top: 80px;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .filter-header h2 {
                    font-size: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-primary);
                }
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .filter-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .status-toggles {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .filter-chip {
                    background: var(--bg-app);
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-chip:hover {
                    color: var(--text-primary);
                    border-color: var(--text-muted);
                }
                .filter-chip.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                }
                
                .filter-select {
                    background: var(--bg-app);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    width: 100%;
                    cursor: pointer;
                    outline: none;
                }
                .filter-select:focus {
                    border-color: var(--primary);
                }
                
                .rating-filter {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .star-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    transition: transform 0.1s;
                }
                .star-btn:hover {
                    transform: scale(1.2);
                }
                .star-btn.active {
                    color: #fbbf24;
                }
                .rating-label {
                    margin-left: 0.5rem;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }
                
                @media (max-width: 768px) {
                    .filter-sidebar {
                        width: 100%;
                        height: auto;
                        position: relative;
                        top: 0;
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                        padding-bottom: 2rem;
                    }
                }
            `}</style>
        </aside>
    );
};

