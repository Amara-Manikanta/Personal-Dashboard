// NovelCard Component

window.NovelCard = ({ novel, onEdit, onDelete, onSelect }) => {
    // Destructure for easier access
    const { title, author, cover, genre, subGenre, rating, status, review, progress, progressType } = novel;

    // Helper to render stars
    const renderStars = (count) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <i
                key={i}
                className={`ph-fill ph-star ${i < count ? 'text-yellow-400' : 'text-gray-600'}`}
                style={{ color: i < count ? '#fbbf24' : '#4b5563' }}
            ></i>
        ));
    };

    const getStatusClass = (s) => {
        if (s === 'Read') return 'status-read';
        if (s === 'Currently Reading') return 'status-reading';
        return 'status-tbr';
    };

    const getStatusLabel = (s) => {
        if (s === 'TBR') return 'To Be Read';
        if (s === 'Currently Reading') return 'Reading';
        return s;
    };

    return (
        <div className="novel-card group" onClick={() => onSelect(novel)}>
            <div className="card-image-wrapper">
                <img
                    src={cover}
                    alt={title}
                    className="card-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=2000';
                    }}
                />
                <div className="card-overlay">
                    <span className={`status-badge ${getStatusClass(status)}`}>
                        {getStatusLabel(status)}
                    </span>

                    <div className="card-actions">
                        <button className="action-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(novel); }} title="Edit">
                            <i className="ph-fill ph-pencil-simple"></i>
                        </button>
                        <button className="action-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(novel.id); }} title="Delete">
                            <i className="ph-fill ph-trash"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-content">
                {/* Genre Removed */}

                <h3 className="card-title">{title}</h3>
                <p className="card-author">by {author}</p>

                {/* Progress Removed */}

                {/* Ownership Badge Removed */}

                {/* Read Date Removed */}

                {/* Review Removed */}

                <div className="card-footer">
                    <div className="ratings-container">
                        <div className="rating-group" title="My Rating">
                            {renderStars(rating)}
                        </div>
                        {novel.goodreadsRating && (
                            <div className="rating-group gr-rating" title="Goodreads Rating">
                                <span className="gr-icon">g</span> {novel.goodreadsRating}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quotes Section Removed - Moved to Detail View */}
            </div>

            <style>{`
                .novel-card {
                    background-color: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    position: relative;
                    cursor: pointer; /* Add pointer cursor */
                }
                .novel-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--primary);
                }
                .card-image-wrapper {
                    position: relative;
                    padding-top: 150%;
                    overflow: hidden;
                }
                .card-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .novel-card:hover .card-image {
                    transform: scale(1.05);
                }
                .card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    pointer-events: none; /* Let clicks pass through generally */
                }
                
                .status-badge {
                    align-self: flex-end;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    backdrop-filter: blur(4px);
                    z-index: 10;
                }
                .status-read {
                    background-color: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                .status-tbr {
                    background-color: rgba(236, 72, 153, 0.2);
                    color: #f472b6;
                    border: 1px solid rgba(236, 72, 153, 0.2);
                }
                .status-reading {
                    background-color: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                }
                
                .reading-progress {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #60a5fa;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    background: rgba(59, 130, 246, 0.1);
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-md);
                    width: fit-content;
                }
                
                .card-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.2s ease;
                    pointer-events: auto; /* Enable clicks */
                }
                .novel-card:hover .card-actions {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .action-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1.125rem;
                    backdrop-filter: blur(4px);
                    transition: transform 0.2s;
                    background-color: rgba(0,0,0,0.6);
                    color: white;
                }
                .action-btn:hover {
                    transform: scale(1.1);
                    background-color: var(--primary);
                }
                .delete-btn:hover {
                    background-color: #ef4444; /* Red */
                }

                .card-content {
                    padding: 1.25rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .card-genre {
                    font-size: 0.75rem;
                    color: var(--primary);
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                .card-title {
                    font-size: 1.125rem;
                    line-height: 1.4;
                    margin-bottom: 0.25rem;
                }
                .card-author {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }
                .card-review {
                    margin-top: 1rem;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    white-space: pre-wrap; /* Preserve newlines */
                    line-height: 1.6;
                }
                
                .card-quotes {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px dashed var(--border);
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .quote-item {
                    font-size: 0.85rem;
                    font-style: italic;
                    color: var(--text-primary);
                    background: var(--bg-accent); 
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-md);
                    border-left: 3px solid var(--primary);
                    line-height: 1.5;
                    position: relative;
                }
                
                .card-footer {
                    margin-top: auto;
                    padding-top: 1rem;
                    display: flex;
                    align-items: center;
                }
                .ratings-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                }
                .rating-group {
                    display: flex;
                    gap: 2px;
                }
                .gr-rating {
                    margin-left: auto;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    background: var(--bg-app);
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                }
                .gr-icon {
                    font-family: serif;
                    font-weight: bold;
                    margin-right: 0.25rem;
                }
                
                .ownership-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    background: var(--bg-app);
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 0.5rem;
                    width: fit-content;
                    border: 1px solid var(--border);
                }
                .read-date {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
};
