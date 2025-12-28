window.NovelDetails = ({ novel, onBack, onEdit, onDelete }) => {
    const { useState } = React;
    const { title, author, cover, genre, subGenre, rating, status, review, progress, progressType, quotes, phrases, description } = novel;
    const [activeTab, setActiveTab] = useState('description');

    const renderStars = (count) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <i
                key={i}
                className={`ph-fill ph-star ${i < count ? 'text-yellow-400' : 'text-gray-600'}`}
                style={{ color: i < count ? '#fbbf24' : '#4b5563' }}
            ></i>
        ));
    };

    const getMonthName = (monthNum) => {
        if (!monthNum) return '';
        const date = new Date();
        date.setMonth(monthNum - 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    const renderQuoteCard = (item, idx, type) => {
        let text, citation, page;

        if (typeof item === 'object' && item !== null) {
            text = item.text;
            citation = item.citation;
            page = item.page;
        } else if (typeof item === 'string') {
            const parts = item.split('\n');
            text = parts[0];
            const validParts = parts.length > 1;
            citation = validParts ? parts.slice(1).join('\n') : null;
            page = null;
        } else {
            text = String(item);
            citation = null;
            page = null;
        }

        return (
            <div key={idx} className="quote-card">
                <i className={`ph-fill ${type === 'quote' ? 'ph-quotes' : 'ph-text-aa'} opacity-20 quote-icon-bg`}></i>
                <p>{text}</p>
                {citation && (
                    <p className="quote-citation" style={{ textAlign: 'center', marginTop: '1rem', fontStyle: 'normal', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        — {citation}
                    </p>
                )}
                {page && (
                    <p className="quote-page" style={{ textAlign: 'right', marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Page {page}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="novel-details-container fade-in">
            <button className="back-btn" onClick={onBack}>
                <i className="ph-bold ph-arrow-left"></i> Back to Dashboard
            </button>

            <div className="details-grid">
                {/* Left Column: Cover & Key Info */}
                <div className="details-sidebar">
                    <div className="cover-wrapper">
                        <img src={cover} alt={title} className="detail-cover" />
                        <div className="cover-glow" style={{ backgroundImage: `url(${cover})` }}></div>
                    </div>

                    <div className="sidebar-actions">
                        <button className="action-btn edit-btn" onClick={() => onEdit(novel)}>
                            <i className="ph-fill ph-pencil-simple"></i> Edit Novel
                        </button>
                        <button className="action-btn delete-btn" onClick={() => onDelete(novel.id)}>
                            <i className="ph-fill ph-trash"></i> Delete
                        </button>
                    </div>

                    <div className="detail-meta-block">
                        <div className="meta-item">
                            <span className="label">Status</span>
                            <span className={`status-pill ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                        </div>
                        {status === "Currently Reading" && (
                            <div className="meta-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span className="label">Progress</span>
                                    <span className="value">{progressType === 'percentage' ? `${progress}%` : `Page ${progress}`}</span>
                                </div>
                                <div className="progress-bar" style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${progressType === 'percentage' ? progress : (Math.min(progress, 500) / 500) * 100}%`,
                                            height: '100%',
                                            background: 'var(--primary)',
                                            borderRadius: '999px'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        <div className="meta-item">
                            <span className="label">Rating</span>
                            <div className="stars">{renderStars(rating)}</div>
                        </div>
                        {novel.goodreadsRating && (
                            <div className="meta-item">
                                <span className="label">Goodreads</span>
                                <span className="value"><span className="gr-icon">g</span> {novel.goodreadsRating}</span>
                            </div>
                        )}
                        {novel.ownership === 'lent' && novel.lentTo && (
                            <div className="meta-item">
                                <span className="label">Lent To</span>
                                <span className="value">{novel.lentTo}</span>
                            </div>
                        )}
                        {novel.readYear && (
                            <div className="meta-item">
                                <span className="label">Read Year</span>
                                <span className="value">{novel.readYear}</span>
                            </div>
                        )}
                        {novel.readMonth && (
                            <div className="meta-item">
                                <span className="label">Read Month</span>
                                <span className="value">{getMonthName(novel.readMonth)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="details-content">
                    <div className="header-section">
                        <div className="genres">
                            <span className="main-genre">{genre}</span>
                            {subGenre && <span className="sub-genre"> • {subGenre}</span>}
                        </div>
                        <h1 className="detail-title">{title}</h1>
                        <h2 className="detail-author">by {author}</h2>

                        {(novel.ownership && novel.ownership !== 'none') || novel.location ? (
                            <div className="ownership-tag-group">
                                {novel.ownership && novel.ownership !== 'none' && (
                                    <div className="ownership-tag">
                                        {novel.ownership === 'home' && <span><i className="ph-fill ph-house"></i> At Home</span>}
                                        {novel.ownership === 'lent' && <span><i className="ph-fill ph-hand-giving"></i> Lent to {novel.lentTo}</span>}
                                    </div>
                                )}
                                {novel.location && (
                                    <div className="location-tag">
                                        <i className="ph-fill ph-map-pin"></i> {novel.location}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    <style>{`
                        .ownership-tag-group {
                            display: flex;
                            gap: 1rem;
                            flex-wrap: wrap;
                        }
                        .location-tag {
                             display: inline-flex;
                             align-items: center;
                            gap: 0.5rem;
                            background: var(--bg-surface);
                            padding: 0.5rem 1rem;
                            border-radius: var(--radius-md);
                            border: 1px solid var(--border);
                            color: var(--text-secondary);
                            font-size: 0.9rem;
                        }
                        .tabs-container {
                            display: flex;
                            gap: 1.5rem;
                            border-bottom: 1px solid var(--border);
                            margin-top: 2rem;
                            margin-bottom: 2rem;
                        }
                        .tab-btn {
                            background: none;
                            border: none;
                            padding: 0.75rem 0;
                            font-size: 1rem;
                            font-weight: 600;
                            color: var(--text-muted);
                            cursor: pointer;
                            position: relative;
                            transition: color 0.2s;
                        }
                        .tab-btn:hover {
                            color: var(--text-primary);
                        }
                        .tab-btn.active {
                            color: var(--primary);
                        }
                        .tab-btn.active::after {
                            content: '';
                            position: absolute;
                            bottom: -1px;
                            left: 0;
                            width: 100%;
                            height: 2px;
                            background: var(--primary);
                        }
                    `}</style>

                    <div className="divider" style={{ marginBottom: '0' }}></div>

                    <div className="tabs-container">
                        <button
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('quotes')}
                        >
                            Quotes ({quotes ? quotes.length : 0})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'phrases' ? 'active' : ''}`}
                            onClick={() => setActiveTab('phrases')}
                        >
                            Phrases ({phrases ? phrases.length : 0})
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div className="section description-section fade-in">
                                {description ? (
                                    <div>
                                        <h3><i className="ph-fill ph-info"></i> Description</h3>
                                        <p className="review-text">{description}</p>
                                    </div>
                                ) : (
                                    <p className="no-data">No description available.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="section review-section fade-in">
                                {review ? (
                                    <div>
                                        <h3><i className="ph-fill ph-notebook"></i> Review</h3>
                                        <p className="review-text">{review}</p>
                                    </div>
                                ) : (
                                    <p className="no-data">No reviews yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'quotes' && (
                            <div className="section quotes-section fade-in">
                                {quotes && quotes.length > 0 ? (
                                    <div className="quotes-grid">
                                        {quotes.map((quote, idx) => renderQuoteCard(quote, idx, 'quote'))}
                                    </div>
                                ) : (
                                    <p className="no-data">No quotes added.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'phrases' && (
                            <div className="section phrases-section fade-in">
                                {phrases && phrases.length > 0 ? (
                                    <div className="quotes-grid">
                                        {phrases.map((phrase, idx) => renderQuoteCard(phrase, idx, 'phrase'))}
                                    </div>
                                ) : (
                                    <p className="no-data">No phrases added.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .novel-details-container {
                    padding-bottom: 4rem;
                }
                .fade-in {
                    animation: fadeIn 0.4s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .back-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    margin-bottom: 2rem;
                    padding: 0;
                    transition: color 0.2s;
                }
                .back-btn:hover {
                    color: var(--primary);
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 4rem;
                }

                /* Sidebar */
                .details-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .cover-wrapper {
                    position: relative;
                    border-radius: var(--radius-lg);
                    z-index: 1;
                }
                .detail-cover {
                    width: 100%;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    position: relative;
                    z-index: 2;
                    aspect-ratio: 2/3;
                    object-fit: cover;
                }
                .cover-glow {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    right: 20px;
                    bottom: -20px;
                    background-size: cover;
                    filter: blur(40px);
                    opacity: 0.4;
                    z-index: 1;
                    border-radius: var(--radius-lg);
                }

                .sidebar-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .action-btn {
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    background: var(--bg-surface);
                    color: var(--text-primary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .edit-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .delete-btn:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .detail-meta-block {
                    background: var(--bg-surface);
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .meta-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .meta-item .label {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .meta-item .value {
                    font-weight: 600;
                }
                
                .status-pill {
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-pill.read { color: #34d399; background: rgba(16, 185, 129, 0.1); }
                .status-pill.currently-reading { color: #60a5fa; background: rgba(59, 130, 246, 0.1); }
                .status-pill.tbr { color: #f472b6; background: rgba(236, 72, 153, 0.1); }

                /* Content */
                .details-content {
                    padding-top: 1rem;
                }
                .styles-genres {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                }
                .main-genre { 
                    color: var(--primary); 
                    background: rgba(59, 130, 246, 0.1); 
                    padding: 0.35rem 0.85rem; 
                    border-radius: 9999px; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em; 
                    font-size: 0.85rem; 
                    display: inline-block;
                }
                .sub-genre { color: var(--text-muted); }
                
                .detail-title {
                    font-size: 3rem;
                    line-height: 1.1;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fff, #aaa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .detail-author {
                    font-size: 1.5rem;
                    color: var(--text-muted);
                    font-weight: 400;
                    margin-bottom: 1.5rem;
                }
                
                .ownership-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--bg-surface);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .divider {
                    height: 1px;
                    background: var(--border);
                    margin: 2.5rem 0;
                }

                .section h3 {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-primary);
                }
                
                .review-text {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: var(--text-secondary);
                    white-space: pre-wrap;
                }

                .quotes-grid {
                    display: grid;
                    gap: 1.5rem;
                }
                .quote-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    position: relative;
                    font-size: 1.2rem;
                    font-style: italic;
                    line-height: 1.6;
                    color: var(--text-primary);
                    white-space: pre-wrap;
                }
                .quote-icon-bg {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    font-size: 3rem;
                    opacity: 0.05;
                    color: var(--primary);
                }
                .no-data {
                    color: var(--text-muted);
                    font-style: italic;
                }

                @media (max-width: 900px) {
                    .details-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    .detail-cover {
                        max-width: 300px;
                        margin: 0 auto;
                    }
                    .sidebar-actions {
                        max-width: 300px;
                        margin: 0 auto;
                        width: 100%;
                    }
                    .detail-meta-block {
                        max-width: 300px;
                        margin: 0 auto;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};
