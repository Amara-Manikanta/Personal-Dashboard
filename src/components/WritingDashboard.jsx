window.WritingDashboard = ({ onBackToHome }) => {
    const { useMemo, useState } = React;
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [selectedStory, setSelectedStory] = useState(null); // Comparison view for stories
    const [activeTab, setActiveTab] = useState('quotes'); // 'quotes' or 'stories'

    const stats = useMemo(() => {
        // Ensure window.writingData exists and is an array
        const genresData = window.writingData || [];

        // Calculate totals
        let totalQuotes = 0;
        let totalEdited = 0;

        genresData.forEach(genreItem => {
            if (!genreItem.quotes || !Array.isArray(genreItem.quotes)) return;

            genreItem.total = genreItem.quotes.length;
            genreItem.edited = 0;
            genreItem.unedited = 0;

            genreItem.quotes.forEach(quote => {
                // If modified exists and is not empty/null, it's edited.
                if (quote.modified) {
                    genreItem.edited++;
                } else {
                    genreItem.unedited++;
                }
            });

            totalQuotes += genreItem.total;
            totalEdited += genreItem.edited;
        });

        // Sort genres by total quotes count descending
        return {
            genres: genresData.sort((a, b) => (b.total || 0) - (a.total || 0)),
            totalQuotes,
            totalEdited,
            totalUnedited: totalQuotes - totalEdited
        };
    }, []);

    // Get the list of stories from the index file
    const storiesList = window.storiesList || [];

    // Helper to load specific story data dynamically
    const handleStoryClick = (story) => {
        const fullStoryData = window[`story_` + story.id];
        if (fullStoryData) {
            setSelectedStory(fullStoryData);
        } else {
            console.error(`Story data for ID ${story.id} not found.`);
        }
    };

    // Render logic
    const renderContent = () => {
        // 1. Story Detail View
        if (selectedStory) {
            return (
                <div className="story-detail-view">
                    <div className="genre-detail-header">
                        <button className="back-button-inline" onClick={() => setSelectedStory(null)}>
                            <i className="ph-bold ph-arrow-left"></i>
                            Back to Stories
                        </button>
                        <h2>{selectedStory.title}</h2>
                    </div>
                    <div className="quotes-list"> {/* Reuse quotes-list grid for parts */}
                        {selectedStory.parts && selectedStory.parts.map((part, index) => (
                            <div key={index} className="quote-card-item">
                                <div className="quote-content original">
                                    <div className="quote-label">Original (Part {part.partNumber})</div>
                                    <p>"{part.original}"</p>
                                </div>
                                <div className={`quote-content modified ${part.modified ? 'has-content' : 'empty'}`}>
                                    <div className="quote-label">Modified</div>
                                    {part.modified ? (
                                        <p>"{part.modified}"</p>
                                    ) : (
                                        <div className="empty-state">
                                            <i className="ph-fill ph-pencil-simple-slash"></i>
                                            <span>Not yet edited</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 2. Stories List View
        if (activeTab === 'stories') {
            return (
                <div className="stories-list">
                    {storiesList.map(story => (
                        <div key={story.id} className="story-card" onClick={() => handleStoryClick(story)}>
                            <div className="story-header">
                                <h3>{story.title}</h3>
                                <span className={`story-status ${story.status ? story.status.toLowerCase().replace(' ', '-') : ''}`}>
                                    {story.status}
                                </span>
                            </div>
                            <div className="story-meta">
                                <span><i className="ph-fill ph-tag"></i> {story.genre}</span>
                                <span><i className="ph-fill ph-files"></i> {story.totalParts} Parts</span>
                                <span><i className="ph-fill ph-calendar"></i> {story.lastEdited}</span>
                            </div>
                            <p className="story-snippet">{story.description}</p>
                            <div className="story-actions">
                                <button className="story-btn"><i className="ph-bold ph-pencil-simple"></i> Edit</button>
                                <button className="story-btn"><i className="ph-bold ph-eye"></i> View</button>
                            </div>
                        </div>
                    ))}
                    {storiesList.length === 0 && (
                        <div className="empty-stories">
                            <i className="ph-duotone ph-book-open-text"></i>
                            <p>No stories yet. Start writing!</p>
                        </div>
                    )}
                </div>
            );
        }

        // 3. Genre Detail View (Quotes)
        if (selectedGenre) {
            return (
                <div className="quotes-list">
                    <div className="genre-detail-header">
                        <button className="back-button-inline" onClick={() => setSelectedGenre(null)}>
                            <i className="ph-bold ph-arrow-left"></i>
                            Back to Genres
                        </button>
                        <h2>{selectedGenre.genre} Quotes</h2>
                    </div>
                    {selectedGenre.quotes.map((quote, index) => (
                        <div key={index} className="quote-card-item">
                            <div className="quote-content original">
                                <div className="quote-label">Original</div>
                                <p>"{quote.original}"</p>
                            </div>
                            <div className={`quote-content modified ${quote.modified ? 'has-content' : 'empty'}`}>
                                <div className="quote-label">Modified</div>
                                {quote.modified ? (
                                    <p>"{quote.modified}"</p>
                                ) : (
                                    <div className="empty-state">
                                        <i className="ph-fill ph-pencil-simple-slash"></i>
                                        <span>Not yet edited</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // 4. Dashboard Overview (Default)
        return (
            <div className="dashboard-overview">
                <div className="stats-overview">
                    <div className="stat-card total">
                        <div className="stat-label">Total Quotes</div>
                        <div className="stat-value">{stats.totalQuotes}</div>
                    </div>
                    <div className="stat-card edited">
                        <div className="stat-label">Edited</div>
                        <div className="stat-value">{stats.totalEdited}</div>
                        <div className="stat-sub">Refined & Ready</div>
                    </div>
                    <div className="stat-card unedited">
                        <div className="stat-label">To Edit</div>
                        <div className="stat-value">{stats.totalUnedited}</div>
                        <div className="stat-sub">Needs Formatting</div>
                    </div>
                </div>

                <h2 className="section-title">Quotes by Genre</h2>

                <div className="genre-grid">
                    {stats.genres.map((genre) => (
                        <div key={genre.genre} className="genre-card" onClick={() => setSelectedGenre(genre)}>
                            <div className="genre-header">
                                <h3>{genre.genre}</h3>
                                <span className="genre-total">{genre.total || 0} Quotes</span>
                            </div>

                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${genre.total ? (genre.edited / genre.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="genre-stats">
                                <div className="genre-stat-item success">
                                    <i className="ph-fill ph-check-circle"></i>
                                    <span>{genre.edited || 0} Edited</span>
                                </div>
                                <div className="genre-stat-item warning">
                                    <i className="ph-fill ph-pencil-simple"></i>
                                    <span>{genre.unedited || 0} To Edit</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="writing-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <button className="back-button" onClick={onBackToHome}>
                        <i className="ph-bold ph-arrow-left"></i>
                        Back to Home
                    </button>
                    <h1>Writing Dashboard</h1>

                    <div className="dashboard-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('quotes'); setSelectedGenre(null); setSelectedStory(null); }}
                        >
                            <i className="ph-bold ph-quotes"></i>
                            Quotes
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('stories'); setSelectedGenre(null); setSelectedStory(null); }}
                        >
                            <i className="ph-bold ph-book-open"></i>
                            Stories
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-content">
                {renderContent()}
            </main>

            <style>{`
                .writing-dashboard {
                    min-height: 100vh;
                    background: var(--bg-app);
                    color: var(--text-primary);
                }

                .dashboard-header {
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border);
                    padding: 1rem 2rem;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .dashboard-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-left: auto;
                }

                .tab-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1rem;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .tab-btn:hover {
                    color: var(--primary);
                }

                .tab-btn.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                }

                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1rem;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    transition: all 0.2s;
                }

                .back-button:hover {
                    background: var(--bg-app);
                    color: var(--text-primary);
                }
                
                .back-button-inline {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-size: 0.95rem;
                    cursor: pointer;
                    padding: 0;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }

                .header-content h1 {
                    font-size: 1.5rem;
                    margin: 0;
                }

                .dashboard-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                /* Stats & Grid Styles */
                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .stat-card {
                    background: var(--bg-surface);
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                }

                .stat-card.total { border-left: 4px solid var(--primary); }
                .stat-card.edited { border-left: 4px solid var(--success); }
                .stat-card.unedited { border-left: 4px solid var(--warning); }

                .stat-label {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .stat-sub {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .section-title {
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                }

                .genre-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .genre-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                }

                .genre-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--border-hover);
                }

                .genre-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .genre-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                }

                .genre-total {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    background: var(--bg-app);
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                }

                .progress-container {
                    margin-bottom: 1.25rem;
                }

                .progress-bar {
                    height: 8px;
                    background: var(--bg-app);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--success), #34d399);
                    border-radius: 4px;
                    transition: width 0.5s ease-out;
                }

                .genre-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .genre-stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .genre-stat-item.success { color: var(--success); }
                .genre-stat-item.warning { color: var(--warning); }
                
                /* Quotes List */
                .quotes-list {
                    display: grid;
                    gap: 1.5rem;
                }
                
                .genre-detail-header {
                    margin-bottom: 1rem;
                }
                
                .genre-detail-header h2 {
                    font-size: 2rem;
                    margin: 0;
                }

                .quote-card-item {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .quote-content {
                    position: relative;
                }

                .quote-content.modified {
                    border-left: 1px solid var(--border);
                    padding-left: 2rem;
                }

                .quote-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }

                .quote-content p {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: var(--text-primary);
                    margin: 0;
                    font-style: italic;
                }

                .quote-content.modified p {
                    color: var(--success);
                }

                .empty-state {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-style: italic;
                }

                /* Stories Styles */
                .stories-list {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                }

                .story-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    transition: transform 0.2s;
                    cursor: pointer;
                }

                .story-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--primary);
                }

                .story-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .story-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    line-height: 1.4;
                }

                .story-status {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .story-status.draft { background: var(--bg-app); color: var(--text-muted); }
                .story-status.published { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .story-status.in-progress { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

                .story-meta {
                    display: flex;
                    gap: 1rem;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    margin-bottom: 1rem;
                }

                .story-meta span {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .story-snippet {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 1.5rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .story-actions {
                    display: flex;
                    gap: 0.75rem;
                }

                .story-btn {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid var(--border);
                    background: transparent;
                    color: var(--text-primary);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .story-btn:hover {
                    background: var(--bg-app);
                    border-color: var(--text-secondary);
                }

                .empty-stories {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem;
                    color: var(--text-muted);
                }

                .empty-stories i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                @media (max-width: 768px) {
                    .dashboard-content {
                        padding: 1rem;
                    }
                    .header-content {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                    }
                    .dashboard-tabs {
                        margin-left: 0;
                        justify-content: space-between;
                        border-top: 1px solid var(--border);
                        padding-top: 1rem;
                        width: 100%;
                    }
                    .tab-btn {
                        flex: 1;
                        justify-content: center;
                    }
                    .quote-card-item {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    .quote-content.modified {
                        border-left: none;
                        border-top: 1px solid var(--border);
                        padding-left: 0;
                        padding-top: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};
