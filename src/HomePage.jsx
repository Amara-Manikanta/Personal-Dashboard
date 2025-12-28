window.HomePage = ({ onNavigate }) => {
    const { useState, useEffect } = React;

    // Calculate stats from localStorage
    const [stats, setStats] = useState({ novels: 0 });

    useEffect(() => {
        try {
            const novelsData = JSON.parse(localStorage.getItem('novelsData') || '[]');

            // Get travel stats safely
            let travelStats = { visitedStates: 0 };
            if (window.TravelData && window.TravelData.getStateStats) {
                travelStats = window.TravelData.getStateStats();
            }

            setStats({
                novels: novelsData.length,
                visitedStates: travelStats.visitedStates
            });
        } catch (e) {
            console.error('Error loading stats:', e);
        }
    }, []);

    return (
        <div className="home-page">
            <div className="home-container">
                <div className="home-header">
                    <i className="ph-fill ph-compass logo-icon"></i>
                    <h1>My Life<span className="text-primary">Tracker</span></h1>
                    <p className="subtitle">Track your books and reading journey</p>
                </div>

                <div className="dashboard-cards">
                    <div className="dashboard-card novels-card" onClick={() => onNavigate('novels')}>
                        <div className="card-icon">
                            <i className="ph-fill ph-books"></i>
                        </div>
                        <h2>Novels Dashboard</h2>
                        <p className="card-description">Track your reading journey</p>
                        <div className="card-stats">
                            <span className="stat-number">{stats.novels}</span>
                            <span className="stat-label">Books</span>
                        </div>
                        <div className="card-action">
                            <span>Open Dashboard</span>
                            <i className="ph-bold ph-arrow-right"></i>
                        </div>
                    </div>

                    <div className="dashboard-card travel-card" onClick={() => onNavigate('travel')}>
                        <div className="card-icon">
                            <i className="ph-fill ph-airplane-tilt"></i>
                        </div>
                        <h2>Travel Tracker</h2>
                        <p className="card-description">Map your adventures</p>
                        <div className="card-stats">
                            <span className="stat-number">{stats.visitedStates || 0}</span>
                            <span className="stat-label">States</span>
                        </div>
                        <div className="card-action">
                            <span>Open Dashboard</span>
                            <i className="ph-bold ph-arrow-right"></i>
                        </div>
                    </div>

                    <div className="dashboard-card writing-card" onClick={() => onNavigate('writing')}>
                        <div className="card-icon">
                            <i className="ph-fill ph-pen-nib"></i>
                        </div>
                        <h2>Writing Dashboard</h2>
                        <p className="card-description">Organize your quotes & ideas</p>
                        <div className="card-stats">
                            <span className="stat-number">
                                {window.writingData ? window.writingData.reduce((acc, item) => acc + (item.quotes ? item.quotes.length : 0), 0) : 0}
                            </span>
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
                    background: var(--bg-app);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .home-container {
                    max-width: 1200px;
                    width: 100%;
                }

                .home-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .home-header .logo-icon {
                    font-size: 4rem;
                    color: var(--primary);
                    margin-bottom: 1rem;
                    display: inline-block;
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .home-header h1 {
                    font-size: 3.5rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fff, var(--primary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .subtitle {
                    font-size: 1.25rem;
                    color: var(--text-muted);
                }

                .dashboard-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .dashboard-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 3rem 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .dashboard-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--primary);
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                }

                .dashboard-card:hover::before {
                    transform: scaleX(1);
                }

                .dashboard-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-xl);
                    border-color: var(--primary);
                }

                .card-icon {
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                    color: var(--primary);
                }

                .dashboard-card h2 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .card-description {
                    color: var(--text-muted);
                    margin-bottom: 2rem;
                    font-size: 1rem;
                }

                .card-stats {
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: var(--bg-app);
                    border-radius: var(--radius-md);
                }

                .stat-number {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .card-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: var(--text-secondary);
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .dashboard-card:hover .card-action {
                    color: var(--primary);
                }

                .card-action i {
                    transition: transform 0.2s;
                }

                .dashboard-card:hover .card-action i {
                    transform: translateX(5px);
                }

                @media (max-width: 768px) {
                    .home-header h1 {
                        font-size: 2.5rem;
                    }
                    .dashboard-cards {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};
