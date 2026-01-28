console.log("WritingDashboard.jsx: Script starting...");
window.WritingDashboard = ({ onBackToHome }) => {
    console.log("WritingDashboard: Component rendering");
    const { useMemo, useState, useEffect } = React;
    const [activeTab, setActiveTab] = useState('quotes');
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [selectedStory, setSelectedStory] = useState(null);
    const [stories, setStories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState(null);

    // Calculate stats from window.writingData
    // We don't use useMemo with [] because window.writingData is populated asynchronously
    // and we want to ensure we pick up the data when the parent re-renders after loading.
    // Verify data structure matches expected format (Array of genres or Object with genres key)
    const rawData = window.writingData || [];
    const genres = Array.isArray(rawData) ? rawData : (rawData.genres || []);
    let totalQuotes = 0;
    let totalEdited = 0;
    let totalUnedited = 0;

    const genreStats = genres.map(genre => {
        const gQuotes = genre.quotes || [];
        const gTotal = gQuotes.length;
        const gEdited = gQuotes.filter(q => q.modified).length;
        const gUnedited = gTotal - gEdited;

        totalQuotes += gTotal;
        totalEdited += gEdited;
        totalUnedited += gUnedited;

        return {
            ...genre,
            total: gTotal,
            edited: gEdited,
            unedited: gUnedited
        };
    });

    const stats = {
        totalQuotes,
        totalEdited,
        totalUnedited,
        genres: genreStats
    };

    // Initialize stories from window object
    React.useEffect(() => {
        setStories(window.storiesList || []);
    }, []);

    const handleSaveStories = (updatedStories) => {
        setStories(updatedStories);
        window.storiesList = updatedStories; // Update global
        if (window.api && window.api.saveStories) {
            window.api.saveStories(updatedStories);
        }
    };

    const handleAddStory = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newStory = {
            id: Date.now(),
            title: formData.get('title'),
            genre: formData.get('genre'),
            status: formData.get('status') || 'Draft',
            description: formData.get('description'),
            lastEdited: new Date().toISOString().split('T')[0],
            totalParts: 0,
            parts: []
        };

        handleSaveStories([...stories, newStory]);
        setIsModalOpen(false);
    };

    const handleUpdateStoryMetadata = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const updatedStories = stories.map(s => {
            if (s.id === editingStory.id) {
                return {
                    ...s,
                    title: formData.get('title'),
                    genre: formData.get('genre'),
                    status: formData.get('status'),
                    description: formData.get('description'),
                    lastEdited: new Date().toISOString().split('T')[0]
                };
            }
            return s;
        });

        handleSaveStories(updatedStories);
        setIsModalOpen(false);
        setEditingStory(null);
    };

    const handleUpdateStoryParts = (updatedStory) => {
        const updatedStories = stories.map(s => s.id === updatedStory.id ? updatedStory : s);

        // Also update the selected story view
        setSelectedStory(updatedStory);

        handleSaveStories(updatedStories);
    };

    const openEditModal = (story, e) => {
        e.stopPropagation();
        setEditingStory(story);
        setIsModalOpen(true);
    };

    const renderContent = () => {
        console.log("Rendering content. State:", { selectedStory, activeTab, selectedGenre });

        // 1. Story Detail View
        if (selectedStory) {
            const StoryDetailsComponent = window.StoryDetails;
            if (!StoryDetailsComponent) {
                console.error("window.StoryDetails is undefined!");
                return <div className="p-4 text-red-500">Error: StoryDetails component not loaded. Please refresh.</div>;
            }
            return (
                <StoryDetailsComponent
                    story={selectedStory}
                    onBack={() => setSelectedStory(null)}
                    onUpdate={handleUpdateStoryParts}
                />
            );
        }

        // 2. Stories List View
        if (activeTab === 'stories') {
            return (
                <div className="stories-view-container">
                    <div className="view-header">
                        <h2>All Stories</h2>
                        <button className="add-btn" onClick={() => { setEditingStory(null); setIsModalOpen(true); }}>
                            <i className="ph-bold ph-plus"></i> New Story
                        </button>
                    </div>

                    <div className="stories-list">
                        {stories.map(story => (
                            <div key={story.id} className="story-card" onClick={() => setSelectedStory(story)}>
                                <div className="story-header">
                                    <h3>{story.title}</h3>
                                    <span className={`story-status ${story.status ? story.status.toLowerCase().replace(' ', '-') : ''}`}>
                                        {story.status}
                                    </span>
                                </div>
                                <div className="story-meta">
                                    <span><i className="ph-fill ph-tag"></i> {story.genre}</span>
                                    <span><i className="ph-fill ph-files"></i> {story.parts ? story.parts.length : 0} Parts</span>
                                    <span><i className="ph-fill ph-calendar"></i> {story.lastEdited}</span>
                                </div>
                                <p className="story-snippet">{story.description}</p>
                                <div className="story-actions">
                                    <button className="story-btn" onClick={(e) => openEditModal(story, e)}>
                                        <i className="ph-bold ph-pencil-simple"></i> Edit Info
                                    </button>
                                    <button className="story-btn primary">
                                        <i className="ph-bold ph-book-open"></i> Open
                                    </button>
                                </div>
                            </div>
                        ))}
                        {stories.length === 0 && (
                            <div className="empty-stories">
                                <i className="ph-duotone ph-book-open-text"></i>
                                <p>No stories yet. Start writing!</p>
                                <button className="add-btn-small" onClick={() => setIsModalOpen(true)}>Create First Story</button>
                            </div>
                        )}
                    </div>
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
        <div className="app-layout">
            {/* Header */}
            <header className="app-header">
                <div className="container header-container">
                    <div className="header-row-top">
                        <div className="logo">
                            <button className="home-btn" onClick={onBackToHome} title="Back to Home">
                                <i className="ph-bold ph-house"></i>
                            </button>
                            <i className="ph-fill ph-pencil-circle logo-icon"></i>
                            <h1>Writing<span className="text-primary">Dash</span></h1>
                        </div>
                    </div>

                    <div className="header-row-bottom">
                        {/* Tab Navigation */}
                        <div className="nav-tabs">
                            <button
                                className={`nav-tab ${activeTab === 'quotes' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('quotes'); setSelectedGenre(null); setSelectedStory(null); }}
                            >
                                <i className="ph-bold ph-quotes"></i>
                                Quotes
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'stories' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('stories'); setSelectedGenre(null); setSelectedStory(null); }}
                            >
                                <i className="ph-bold ph-book-open"></i>
                                Stories
                            </button>
                        </div>

                        {/* Actions (context sensitive) */}
                        <div className="header-actions-group">
                            {activeTab === 'stories' && !selectedStory && (
                                <button className="add-btn" onClick={() => { setEditingStory(null); setIsModalOpen(true); }}>
                                    <i className="ph-bold ph-plus"></i>
                                    <span>New Story</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content container">
                {renderContent()}
            </main>

            {/* Modal for Add/Edit Story */}
            {isModalOpen && (
                <div className="modal-overlay fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingStory ? 'Edit Story' : 'New Story'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <i className="ph-bold ph-x"></i>
                            </button>
                        </div>
                        <form onSubmit={editingStory ? handleUpdateStoryMetadata : handleAddStory}>
                            <div className="form-group">
                                <label>Title</label>
                                <input name="title" type="text" defaultValue={editingStory ? editingStory.title : ''} required autoFocus />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Genre</label>
                                    <select name="genre" defaultValue={(editingStory && editingStory.genre) || 'Love'}>
                                        <option value="Love">Love</option>
                                        <option value="Sci-Fi">Sci-Fi</option>
                                        <option value="Thriller">Thriller</option>
                                        <option value="Fantasy">Fantasy</option>
                                        <option value="Drama">Drama</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" defaultValue={(editingStory && editingStory.status) || 'Draft'}>
                                        <option value="Draft">Draft</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Published">Published</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" rows="3" defaultValue={editingStory ? editingStory.description : ''}></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Story</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                /* Shared Layout Styles (Copied/Adapted from NovelsDashboard) */
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
                    justify-content: center;
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
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }
                .nav-tab.active {
                    background: var(--primary);
                    color: #fff;
                }
                .nav-tab:hover:not(.active) {
                    color: var(--text-primary);
                }

                .home-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    cursor: pointer;
                    padding: 0.25rem;
                    transition: color 0.2s;
                }
                .home-btn:hover { color: var(--primary); }

                .add-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }
                .add-btn:hover { background: var(--primary-hover); }

                .main-content {
                    padding-top: 2rem;
                    padding-bottom: 4rem;
                }

                /* Dashboard Stats Specifics */
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
                .stat-label { color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
                .stat-value { font-size: 2.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem; }
                .stat-sub { font-size: 0.85rem; color: var(--text-secondary); }

                .section-title { font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary); }
                
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
                .genre-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .genre-header h3 { margin: 0; font-size: 1.25rem; }
                .genre-total { font-size: 0.9rem; color: var(--text-muted); background: var(--bg-app); padding: 0.25rem 0.75rem; border-radius: 1rem; }
                
                .progress-container { margin-bottom: 1.25rem; }
                .progress-bar { height: 8px; background: var(--bg-app); border-radius: 4px; overflow: hidden; }
                .progress-fill { height: 100%; background: linear-gradient(90deg, var(--success), #34d399); border-radius: 4px; transition: width 0.5s ease-out; }
                .genre-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .genre-stat-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
                .genre-stat-item.success { color: var(--success); }
                .genre-stat-item.warning { color: var(--warning); }

                /* Quotes List */
                .quotes-list { display: grid; gap: 1.5rem; }
                .genre-detail-header { margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; }
                .genre-detail-header h2 { font-size: 2rem; margin: 0; }
                .back-button-inline { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: var(--primary); font-size: 1rem; cursor: pointer; padding: 0.5rem; font-weight: 600; }
                .quote-card-item { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .quote-content { position: relative; }
                .quote-content.modified { border-left: 1px solid var(--border); padding-left: 2rem; }
                .quote-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem; }
                .quote-content p { font-size: 1.1rem; line-height: 1.6; color: var(--text-primary); margin: 0; font-style: italic; }
                .quote-content.modified p { color: var(--success); }
                .empty-state { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem; font-style: italic; }

                /* Stories View */
                .stories-view-container { }
                .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; } /* Reuse or override */
                .stories-list { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); }
                .story-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; transition: transform 0.2s; cursor: pointer; display: flex; flex-direction: column; }
                .story-card:hover { transform: translateY(-4px); border-color: var(--primary); }
                .story-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
                .story-header h3 { margin: 0; font-size: 1.25rem; line-height: 1.4; }
                .story-status { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 1rem; font-weight: 600; text-transform: uppercase; }
                .story-status.draft { background: var(--bg-app); color: var(--text-muted); }
                .story-status.published { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .story-status.in-progress { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .story-meta { display: flex; gap: 1rem; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; }
                .story-meta span { display: flex; align-items: center; gap: 0.35rem; }
                .story-snippet { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
                .story-actions { display: flex; gap: 0.75rem; margin-top: auto; }
                .story-btn { flex: 1; padding: 0.5rem; border: 1px solid var(--border); background: transparent; color: var(--text-primary); border-radius: var(--radius-md); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.9rem; transition: all 0.2s; }
                .story-btn:hover { background: var(--bg-app); border-color: var(--text-secondary); }
                .story-btn.primary { background: rgba(124, 58, 237, 0.1); color: var(--primary); border-color: rgba(124, 58, 237, 0.3); }
                .story-btn.primary:hover { background: rgba(124, 58, 237, 0.2); border-color: var(--primary); }
                .empty-stories { text-align: center; padding: 4rem; color: var(--text-muted); grid-column: 1 / -1; }
                .empty-stories i { font-size: 3rem; margin-bottom: 1rem; }
                .add-btn-small { background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: var(--radius-md); font-weight: 500; cursor: pointer; margin-top: 1rem; }
                
                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; }
                .modal-content { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 500px; padding: 1.5rem; box-shadow: var(--shadow-xl); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
                .modal-header h2 { margin: 0; font-size: 1.5rem; }
                .close-btn { background: none; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer; }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); }
                .form-group input, .form-group select, .form-group textarea { width: 100%; background: var(--bg-app); border: 1px solid var(--border); color: var(--text-primary); padding: 0.75rem; border-radius: var(--radius-md); font-size: 1rem; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); }
                .form-row { display: flex; gap: 1rem; }
                .form-row .form-group { flex: 1; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .btn-primary { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); cursor: pointer; font-weight: 500; }
                .btn-secondary { background: transparent; color: var(--text-muted); border: 1px solid var(--border); padding: 0.75rem 1.5rem; border-radius: var(--radius-md); cursor: pointer; }

                @media (max-width: 768px) {
                    .quote-card-item { grid-template-columns: 1fr; gap: 1.5rem; }
                    .quote-content.modified { border-left: none; border-top: 1px solid var(--border); padding-left: 0; padding-top: 1.5rem; }
                    .genre-stats { display: flex; flex-direction: column; gap: 0.5rem; }
                }
            `}</style>
        </div>
    );
};
