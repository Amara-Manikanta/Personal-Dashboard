// Books-per-year bars for the novels card.
const ReadingSparkline = ({ history }) => {
    if (!history || history.length < 2) return null;

    const max = Math.max(...history.map(h => h.count));
    const recent = history.slice(-16);

    return (
        <div className="sparkline" aria-label="Books finished per year">
            {recent.map(({ year, count }) => (
                <div
                    key={year}
                    className="sparkline-bar"
                    style={{ height: `${Math.max(8, (count / max) * 100)}%` }}
                    title={`${year}: ${count} book${count === 1 ? '' : 's'}`}
                ></div>
            ))}
            <span className="sparkline-range">{recent[0].year}–{recent[recent.length - 1].year}</span>
        </div>
    );
};

window.HomePage = ({ onNavigate, stats, loading }) => {
    const { useState, useEffect } = React;
    const PhysicsTitle = window.PhysicsTitle;
    const [backup, setBackup] = useState(null);

    // Backup health for the sync card — local server only, fails quietly.
    useEffect(() => {
        if (!window.IS_LOCALHOST) {
            setBackup({ unavailable: true });
            return;
        }

        let cancelled = false;
        fetch(`${window.API_BASE}/backups/status`)
            .then(r => (r.ok ? r.json() : null))
            .then(d => { if (!cancelled) setBackup(d); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const relativeTime = (iso) => {
        if (!iso) return null;
        const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.round(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.round(hours / 24);
        return `${days}d ago`;
    };

    const cardStat = (text) => (
        <div className="card-stat">{loading ? <span className="card-stat-loading" /> : text}</div>
    );

    const reading = (stats && stats.currentlyReading) || [];

    return (
        <div className="home-page">
            <div className="home-container">
                <div className="home-header">
                    <i className="ph-fill ph-compass logo-icon"></i>
                    {PhysicsTitle ? <PhysicsTitle text="My Life Tracker" /> : <h1>My Life <span className="text-accent">Tracker</span></h1>}
                    <p className="subtitle">Your personal space for books, travel, writing, and style</p>
                    <button className="home-search-hint" onClick={() => window.openCommandPalette && window.openCommandPalette()}>
                        <i className="ph-bold ph-magnifying-glass"></i>
                        Search everything
                        <kbd>⌘K</kbd>
                    </button>
                </div>

                {reading.length > 0 && (
                    <div className="reading-now">
                        <div className="reading-now-head">
                            <h2>Currently reading</h2>
                            <button onClick={() => onNavigate('novels')}>
                                All {stats.novels.total} books <i className="ph-bold ph-arrow-right"></i>
                            </button>
                        </div>
                        <div className="reading-now-strip">
                            {reading.map((book, i) => (
                                <button key={`${book.title}-${i}`} className="reading-card" onClick={() => onNavigate('novels')}>
                                    <div className="reading-cover">
                                        {book.cover
                                            ? <img src={book.cover} alt="" loading="lazy" />
                                            : <i className="ph-fill ph-book-open"></i>}
                                    </div>
                                    <div className="reading-meta">
                                        <span className="reading-title">{book.title}</span>
                                        {book.author && <span className="reading-author">{book.author}</span>}
                                        {book.percent > 0 && (
                                            <div className="reading-progress" title={`${book.percent}% read`}>
                                                <div className="reading-progress-bar" style={{ width: `${book.percent}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="dashboard-cards">
                    <div className="dashboard-card novels-card" onClick={() => onNavigate('novels')}>
                        <div className="card-glow"></div>
                        <div className="card-icon">
                            <i className="ph-fill ph-books"></i>
                        </div>
                        <h2>Novels Dashboard</h2>
                        <p className="card-description">Track your reading list, favorite books, and authors</p>
                        {cardStat(stats && `${stats.novels.total} books · ${stats.novels.read} read · ${stats.novels.reading} in progress`)}
                        {stats && <ReadingSparkline history={stats.novels.readingHistory} />}
                        <div className="card-action">
                            <span>Open Dashboard</span>
                            <i className="ph-bold ph-arrow-right"></i>
                        </div>
                    </div>

                    <div className="dashboard-card travel-card" onClick={() => onNavigate('travel')}>
                        <div className="card-glow"></div>
                        <div className="card-icon">
                            <i className="ph-fill ph-airplane-tilt"></i>
                        </div>
                        <h2>Travel Tracker</h2>
                        <p className="card-description">Map your visited states, treks, and restaurant adventures</p>
                        {cardStat(stats && [
                            `${stats.travel.states} of ${stats.travel.totalStates} states`,
                            stats.travel.countries ? `${stats.travel.countries} countries` : null,
                            `${stats.travel.places} places logged`
                        ].filter(Boolean).join(' · '))}
                        <div className="card-action">
                            <span>Open Dashboard</span>
                            <i className="ph-bold ph-arrow-right"></i>
                        </div>
                    </div>

                    <div className="dashboard-card writing-card" onClick={() => onNavigate('writing')}>
                        <div className="card-glow"></div>
                        <div className="card-icon">
                            <i className="ph-fill ph-pen-nib"></i>
                        </div>
                        <h2>Writing Dashboard</h2>
                        <p className="card-description">Jot down quotes, poems, thoughts, and story ideas</p>
                        {cardStat(stats && `${stats.writing.entries} entries · ${stats.writing.stories} stories`)}
                        <div className="card-action">
                            <span>Open Dashboard</span>
                            <i className="ph-bold ph-arrow-right"></i>
                        </div>
                    </div>

                    <div className="dashboard-card clothes-card" onClick={() => onNavigate('clothes')}>
                        <div className="card-glow"></div>
                        <div className="card-icon">
                            <i className="ph-fill ph-t-shirt"></i>
                        </div>
                        <h2>Clothes Tracker</h2>
                        <p className="card-description">Organize your wardrobe, outfits, and sizes</p>
                        {cardStat(stats && `${stats.clothes.items} ${stats.clothes.items === 1 ? 'item' : 'items'} catalogued`)}
                        <div className="card-action">
                            <span>Open Dashboard</span>
                            <i className="ph-bold ph-arrow-right"></i>
                        </div>
                    </div>

                    <div className="dashboard-card sync-card" onClick={() => onNavigate('sync')}>
                        <div className="card-glow"></div>
                        <div className="card-icon">
                            <i className="ph-fill ph-arrows-clockwise"></i>
                        </div>
                        <h2>Sync & Backup</h2>
                        <p className="card-description">Backup your personal data to your remote GitHub repo</p>
                        <div className={`card-stat ${backup && backup.healthy === false ? 'is-warning' : ''}`}>
                            {!backup && <span className="card-stat-loading" />}
                            {backup && backup.unavailable && 'Push and pull with your GitHub repo'}
                            {backup && backup.healthy === true &&
                                `Last snapshot ${relativeTime(backup.lastBackup) || 'never'} · ${backup.totalSnapshots} kept`}
                            {backup && backup.healthy === false && 'A data file needs attention'}
                        </div>
                        <div className="card-action">
                            <span>Open Dashboard</span>
                            <i className="ph-bold ph-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .home-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                }

                .home-container {
                    max-width: 1200px;
                    width: 100%;
                }

                .home-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .home-header .logo-icon {
                    font-size: 4.5rem;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                    display: inline-block;
                    animation: float 4s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-12px) rotate(5deg); }
                }

                .home-header h1 {
                    font-size: 3.75rem;
                    font-weight: 800;
                    margin-bottom: 0.75rem;
                    background: linear-gradient(to right, #ffffff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .home-header h1 .text-accent {
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .subtitle {
                    font-size: 1.25rem;
                    color: var(--text-secondary);
                    max-width: 600px;
                    margin: 0 auto;
                    font-weight: 300;
                }

                .home-search-hint {
                    margin-top: 1.25rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 99px;
                    color: var(--text-muted);
                    font-family: inherit;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .home-search-hint:hover {
                    background: rgba(255,255,255,0.07);
                    border-color: rgba(255,255,255,0.16);
                    color: var(--text-primary);
                }

                .home-search-hint kbd {
                    background: rgba(255,255,255,0.08);
                    border-radius: 4px;
                    padding: 1px 6px;
                    font-family: inherit;
                    font-size: 0.72rem;
                }

                /* Currently reading strip */
                .reading-now { margin-bottom: 3rem; }

                .reading-now-head {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .reading-now-head h2 {
                    font-size: 1.05rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                }

                .reading-now-head button {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-family: inherit;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .reading-now-head button:hover { color: var(--text-primary); }

                .reading-now-strip {
                    display: flex;
                    gap: 1rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    scrollbar-width: thin;
                }

                .reading-card {
                    flex: 0 0 auto;
                    width: 220px;
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    padding: 0.7rem;
                    background: rgba(17, 20, 28, 0.45);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: var(--radius-lg, 12px);
                    cursor: pointer;
                    text-align: left;
                    font-family: inherit;
                    transition: all 0.3s ease;
                }

                .reading-card:hover {
                    border-color: rgba(129, 140, 248, 0.3);
                    transform: translateY(-3px);
                }

                .reading-cover {
                    width: 40px;
                    height: 58px;
                    flex-shrink: 0;
                    border-radius: 4px;
                    overflow: hidden;
                    background: rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                }

                .reading-cover img { width: 100%; height: 100%; object-fit: cover; }

                .reading-meta { min-width: 0; flex: 1; }

                .reading-title {
                    display: block;
                    color: var(--text-primary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .reading-author {
                    display: block;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 0.4rem;
                }

                .reading-progress {
                    height: 3px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .reading-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                    border-radius: 2px;
                }

                /* Per-card stats */
                .card-stat {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    font-variant-numeric: tabular-nums;
                    margin-bottom: 1rem;
                    min-height: 1.1em;
                }

                .card-stat.is-warning { color: #fbbf24; }

                .card-stat-loading {
                    display: inline-block;
                    width: 120px;
                    height: 0.7em;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.07);
                }

                .sparkline {
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    height: 34px;
                    margin-bottom: 1.25rem;
                    position: relative;
                }

                .sparkline-bar {
                    flex: 1;
                    min-width: 3px;
                    background: linear-gradient(to top, rgba(129, 140, 248, 0.55), rgba(129, 140, 248, 0.15));
                    border-radius: 2px 2px 0 0;
                    transition: background 0.3s ease;
                }

                .novels-card:hover .sparkline-bar {
                    background: linear-gradient(to top, rgba(129, 140, 248, 0.9), rgba(129, 140, 248, 0.3));
                }

                .sparkline-range {
                    position: absolute;
                    right: 0;
                    bottom: -14px;
                    font-size: 0.65rem;
                    color: var(--text-muted);
                }

                .dashboard-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 2rem;
                    margin: 0 auto;
                }

                .dashboard-card {
                    background: rgba(17, 20, 28, 0.45);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-xl);
                    padding: 2.5rem 2rem;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 280px;
                }

                .card-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle 120px at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.03), transparent);
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    pointer-events: none;
                }

                .dashboard-card:hover .card-glow {
                    opacity: 1;
                }

                .dashboard-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
                }

                .card-icon {
                    font-size: 2.75rem;
                    margin-bottom: 1.5rem;
                    width: 64px;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-lg);
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.4s ease;
                }

                .novels-card .card-icon i { color: #818cf8; }
                .travel-card .card-icon i { color: #22d3ee; }
                .writing-card .card-icon i { color: #f472b6; }
                .clothes-card .card-icon i { color: #34d399; }
                .sync-card .card-icon i { color: #fbbf24; }

                .dashboard-card:hover .card-icon {
                    background: rgba(255, 255, 255, 0.08);
                    transform: scale(1.05);
                }

                .novels-card:hover { border-color: rgba(129, 140, 248, 0.3); box-shadow: 0 8px 30px rgba(129, 140, 248, 0.1); }
                .travel-card:hover { border-color: rgba(34, 211, 238, 0.3); box-shadow: 0 8px 30px rgba(34, 211, 238, 0.1); }
                .writing-card:hover { border-color: rgba(244, 114, 182, 0.3); box-shadow: 0 8px 30px rgba(244, 114, 182, 0.1); }
                .clothes-card:hover { border-color: rgba(52, 211, 153, 0.3); box-shadow: 0 8px 30px rgba(52, 211, 153, 0.1); }
                .sync-card:hover { border-color: rgba(251, 191, 36, 0.3); box-shadow: 0 8px 30px rgba(251, 191, 36, 0.1); }

                .dashboard-card h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .card-description {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 2rem;
                    flex-grow: 1;
                }

                .card-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 1rem;
                    transition: all 0.3s ease;
                }

                .dashboard-card:hover .card-action {
                    color: #ffffff;
                }

                .card-action i {
                    transition: transform 0.3s ease;
                }

                .dashboard-card:hover .card-action i {
                    transform: translateX(6px);
                }

                @media (max-width: 768px) {
                    .home-header h1 {
                        font-size: 2.75rem;
                    }
                    .dashboard-cards {
                        grid-template-columns: 1fr;
                    }
                    .home-page {
                        padding: 2rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
};
