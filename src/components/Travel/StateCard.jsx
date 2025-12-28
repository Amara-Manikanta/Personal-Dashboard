
window.StateCard = ({ state, onClick }) => {
    // Determine card style based on state
    const isVisited = state.visited || (state.placesVisited && state.placesVisited.length > 0);

    // Count items
    const placesVisitedCount = state.placesVisited ? state.placesVisited.length : 0;
    const placesToVisitCount = state.placesToVisit ? state.placesToVisit.length : 0;
    const restaurantsCount = state.restaurants ? state.restaurants.length : 0;

    return (
        <div
            className={`state-card ${isVisited ? 'visited' : ''}`}
            onClick={() => onClick(state.name)}
        >
            <div className="state-card-content">
                <div className="state-header">
                    <h3>{state.name}</h3>
                    {isVisited && <i className="ph-fill ph-check-circle badge-visited"></i>}
                </div>

                <div className="state-stats">
                    <div className="stat">
                        <i className="ph-fill ph-map-pin"></i>
                        <span>{placesVisitedCount} visited</span>
                    </div>
                    {placesToVisitCount > 0 && (
                        <div className="stat">
                            <i className="ph-fill ph-binoculars"></i>
                            <span>{placesToVisitCount} to see</span>
                        </div>
                    )}
                    {restaurantsCount > 0 && (
                        <div className="stat">
                            <i className="ph-fill ph-fork-knife"></i>
                            <span>{restaurantsCount} eats</span>
                        </div>
                    )}
                    {state.treks && state.treks.length > 0 && (
                        <div className="stat">
                            <i className="ph-fill ph-mountains"></i>
                            <span>{state.treks.length} treks</span>
                        </div>
                    )}
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
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    background: var(--bg-app);
                    padding: 0.3rem 0.6rem;
                    border-radius: var(--radius-sm);
                }
                
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
