
window.StateCard = ({ state, onClick }) => {
    // Determine card style based on state
    const isVisited = state.visited || (state.placesVisited && state.placesVisited.length > 0);

    // Count items
    const placesVisitedCount = state.placesVisited ? state.placesVisited.length : 0;
    const placesToVisitCount = state.placesToVisit ? state.placesToVisit.length : 0;
    const restaurantsCount = state.restaurants ? state.restaurants.length : 0;
    const treksCount = state.treks ? state.treks.length : 0;

    // Completion calculation
    const totalKnown = placesVisitedCount + placesToVisitCount;
    const completionPct = totalKnown > 0 ? Math.round((placesVisitedCount / totalKnown) * 100) : 0;
    const hasData = totalKnown > 0 || restaurantsCount > 0 || treksCount > 0;

    // Progress ring SVG params
    const ringSize = 52;
    const strokeWidth = 5;
    const radius = (ringSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (completionPct / 100) * circumference;

    // Color based on percentage
    const getRingColor = (pct) => {
        if (pct >= 80) return '#22c55e';
        if (pct >= 50) return '#eab308';
        if (pct >= 20) return '#f97316';
        return '#ef4444';
    };
    const ringColor = getRingColor(completionPct);

    return (
        <div
            className={`state-card ${isVisited ? 'visited' : ''}`}
            onClick={() => onClick(state.name)}
        >
            <div className="state-card-content">
                <div className="state-header">
                    <div className="state-name-group">
                        <h3>{state.name}</h3>
                        {isVisited && <i className="ph-fill ph-check-circle badge-visited"></i>}
                    </div>

                    {/* Progress Ring */}
                    {hasData && (
                        <div className="completion-ring" title={`${completionPct}% explored`}>
                            <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
                                <circle
                                    className="ring-bg"
                                    cx={ringSize / 2}
                                    cy={ringSize / 2}
                                    r={radius}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.06)"
                                    strokeWidth={strokeWidth}
                                />
                                {completionPct > 0 && (
                                    <circle
                                        className="ring-progress"
                                        cx={ringSize / 2}
                                        cy={ringSize / 2}
                                        r={radius}
                                        fill="none"
                                        stroke={ringColor}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={dashOffset}
                                        strokeLinecap="round"
                                        transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                                    />
                                )}
                            </svg>
                            <span className="ring-text" style={{ color: totalKnown > 0 ? ringColor : 'var(--text-muted)' }}>
                                {totalKnown > 0 ? `${completionPct}%` : '—'}
                            </span>
                        </div>
                    )}
                </div>

                {/* A fixed set of counters in a fixed order, so every card is
                    the same shape and the numbers line up down the grid.
                    Zeroes are dimmed rather than dropped — a missing chip
                    reads as "unknown", a dimmed 0 reads as "none yet". */}
                <div className="state-stats">
                    {[
                        ['ph-map-pin', placesVisitedCount, 'visited'],
                        ['ph-binoculars', placesToVisitCount, 'to see'],
                        ['ph-fork-knife', restaurantsCount, 'eats'],
                        ['ph-mountains', (state.treks || []).length, 'treks'],
                        ['ph-bed', (state.stays || []).length, 'stays']
                    ].map(([icon, count, label]) => (
                        <div key={label} className={`stat ${count ? '' : 'is-zero'}`}>
                            <i className={`ph-fill ${icon}`}></i>
                            <span>{count} {label}</span>
                        </div>
                    ))}
                </div>

                <div className="card-overlay">
                    <span>View Details</span>
                    <i className="ph-bold ph-arrow-right"></i>
                </div>
            </div>

            <style>{`
                .state-card {
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-height: 180px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .state-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--primary);
                }
                
                .state-card.visited {
                    border-left: 4px solid var(--success);
                }

                .state-card-content {
                    padding: 1.5rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .state-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                    gap: 0.75rem;
                }

                .state-name-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                    min-width: 0;
                }

                .state-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .badge-visited {
                    color: var(--success);
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                /* Completion Ring */
                .completion-ring {
                    position: relative;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .ring-progress {
                    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .ring-text {
                    position: absolute;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }

                .state-stats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-top: auto;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    background: var(--bg-app);
                    padding: 0.3rem 0.6rem;
                    border-radius: var(--radius-sm);
                    font-variant-numeric: tabular-nums;
                }

                .stat.is-zero { opacity: 0.35; }
                .stat i { font-size: 0.85rem; }
                
                .card-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(var(--primary-rgb), 0.1), transparent);
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--primary);
                }
                
                .state-card:hover .card-overlay {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

