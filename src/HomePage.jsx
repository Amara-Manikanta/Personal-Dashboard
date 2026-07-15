window.HomePage = ({ onNavigate }) => {
    const { useState, useEffect } = React;
    const PhysicsTitle = window.PhysicsTitle;

    return (
        <div className="home-page">
            <div className="home-container">
                <div className="home-header" style={{ marginBottom: '2rem' }}>
                    <i className="ph-fill ph-compass logo-icon"></i>
                    {PhysicsTitle ? <PhysicsTitle text="My Life Tracker" /> : <h1>My Life <span className="text-accent">Tracker</span></h1>}
                    <p className="subtitle" style={{ marginTop: '-2rem' }}>Your personal space for books, travel, writing, and style</p>
                </div>

                <div className="dashboard-cards">
                    <div className="dashboard-card novels-card" onClick={() => onNavigate('novels')}>
                        <div className="card-glow"></div>
                        <div className="card-icon">
                            <i className="ph-fill ph-books"></i>
                        </div>
                        <h2>Novels Dashboard</h2>
                        <p className="card-description">Track your reading list, favorite books, and authors</p>
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
                    margin-bottom: 5rem;
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
