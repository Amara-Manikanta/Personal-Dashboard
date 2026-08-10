window.TravelBadges = ({ statesData = [], countriesData = [] }) => {
    const { useMemo } = React;

    const badges = useMemo(() => {
        const getVisitedCount = (data = []) => data.filter(d => d.visited || (d.placesVisited && d.placesVisited.length > 0)).length;
        const visitedStatesCount = getVisitedCount(statesData);
        const visitedCountriesCount = getVisitedCount(countriesData);
        
        const allPlaces = statesData.flatMap(d => d.placesVisited || []);
        const countCategory = (cat) => allPlaces.filter(p => p.category === cat).length;
        
        const countTemples = countCategory('Temple');
        const countWaterfalls = countCategory('Waterfall');
        const countMountains = countCategory('Viewpoint');
        const countBeaches = countCategory('Beach');
        const countCritic = allPlaces.filter(p => p.rating > 0).length;
        const countPhotographer = allPlaces.filter(p => p.photos && p.photos.length > 0).length;
        
        const countRestaurants = statesData.reduce((acc, state) => acc + (state.restaurants?.length || 0), 0);
        const countTreks = statesData.reduce((acc, state) => acc + (state.treks?.filter(t => t.isVisited)?.length || 0), 0);
        
        const hasCompletionist = statesData.some(state => {
            const visited = state.placesVisited?.length || 0;
            const toVisit = state.placesToVisit?.length || 0;
            return visited > 0 && toVisit === 0 && (visited + toVisit) >= 5;
        });

        return [
            { id: 'explorer', name: 'Explorer', icon: 'ph-compass', current: visitedStatesCount, target: 5, color: '#3b82f6', unit: 'states' },
            { id: 'veteran', name: 'Veteran Explorer', icon: 'ph-trophy', current: visitedStatesCount, target: 15, color: '#f59e0b', unit: 'states' },
            { id: 'globetrotter', name: 'Globetrotter', icon: 'ph-globe-hemisphere-west', current: visitedCountriesCount, target: 3, color: '#06b6d4', unit: 'countries' },
            { id: 'temple_run', name: 'Temple Run', icon: 'ph-church', current: countTemples, target: 10, color: '#f97316', unit: 'places' },
            { id: 'waterfall', name: 'Waterfall Hunter', icon: 'ph-drop', current: countWaterfalls, target: 5, color: '#0ea5e9', unit: 'places' },
            { id: 'mountain', name: 'Mountain Lover', icon: 'ph-mountains', current: countMountains, target: 5, color: '#10b981', unit: 'places' },
            { id: 'beach', name: 'Beach Bum', icon: 'ph-waves', current: countBeaches, target: 5, color: '#06b6d4', unit: 'places' },
            { id: 'trail', name: 'Trail Blazer', icon: 'ph-boot', current: countTreks, target: 5, color: '#84cc16', unit: 'treks' },
            { id: 'foodie', name: 'Foodie', icon: 'ph-fork-knife', current: countRestaurants, target: 10, color: '#ef4444', unit: 'places' },
            { id: 'critic', name: 'Critic', icon: 'ph-star', current: countCritic, target: 10, color: '#eab308', unit: 'places' },
            { id: 'photographer', name: 'Photographer', icon: 'ph-camera', current: countPhotographer, target: 10, color: '#a855f7', unit: 'places' },
            { id: 'completionist', name: 'Completionist', icon: 'ph-check-circle', current: hasCompletionist ? 1 : 0, target: 1, color: '#22c55e', unit: 'states' },
        ].map(badge => ({
            ...badge,
            unlocked: badge.current >= badge.target
        }));
    }, [statesData, countriesData]);

    const unlockedCount = badges.filter(b => b.unlocked).length;

    return (
        <div className="travel-badges-container">
            <style>
                {`
                .travel-badges-container {
                    background: var(--bg-surface, rgba(30, 41, 59, 0.7));
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
                    border-radius: var(--radius-lg, 16px);
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                }

                .tb-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .tb-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary, #f8fafc);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .tb-progress-text {
                    font-size: 0.875rem;
                    color: var(--text-secondary, #94a3b8);
                    font-weight: 500;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                }

                .tb-shelf {
                    display: flex;
                    gap: 1.25rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    padding-top: 0.5rem;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
                }

                .tb-shelf::-webkit-scrollbar {
                    height: 6px;
                }
                .tb-shelf::-webkit-scrollbar-track {
                    background: transparent;
                }
                .tb-shelf::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }

                .tb-badge-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 90px;
                    gap: 0.5rem;
                }

                .tb-badge-medallion {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
                    background: rgba(0, 0, 0, 0.4);
                }

                .tb-badge-item.unlocked .tb-badge-medallion {
                    border: 2px solid #fbbf24; /* gold ring */
                    cursor: pointer;
                }

                .tb-badge-item.unlocked:hover .tb-badge-medallion {
                    transform: scale(1.1);
                    box-shadow: 0 0 15px currentColor;
                }

                .tb-badge-item.locked .tb-badge-medallion {
                    border: 2px solid #4b5563;
                    filter: grayscale(100%);
                    opacity: 0.7;
                }

                .tb-badge-icon {
                    font-size: 2rem;
                }

                .tb-badge-lock {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    background: #1e293b;
                    color: #94a3b8;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    border: 2px solid var(--bg-surface, #1e293b);
                }

                .tb-badge-info {
                    text-align: center;
                }

                .tb-badge-name {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-primary, #f8fafc);
                    margin-bottom: 0.125rem;
                    white-space: nowrap;
                }

                .tb-badge-status {
                    font-size: 0.7rem;
                    color: var(--text-secondary, #94a3b8);
                }

                .tb-badge-item.unlocked .tb-badge-status {
                    color: #fbbf24;
                }
                `}
            </style>
            
            <div className="tb-header">
                <div className="tb-title">
                    <span>🏅 Achievement Badges</span>
                </div>
                <div className="tb-progress-text">
                    {unlockedCount}/{badges.length} Unlocked
                </div>
            </div>

            <div className="tb-shelf">
                {badges.map(badge => (
                    <div key={badge.id} className={`tb-badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                        <div 
                            className="tb-badge-medallion"
                            style={{ 
                                color: badge.unlocked ? badge.color : '#4b5563',
                                boxShadow: badge.unlocked ? `inset 0 0 20px ${badge.color}40` : 'none'
                            }}
                        >
                            <i className={`ph-fill ${badge.icon} tb-badge-icon`}></i>
                            {!badge.unlocked && (
                                <div className="tb-badge-lock">
                                    <i className="ph-fill ph-lock"></i>
                                </div>
                            )}
                        </div>
                        <div className="tb-badge-info">
                            <div className="tb-badge-name">{badge.name}</div>
                            <div className="tb-badge-status">
                                {badge.unlocked 
                                    ? 'Unlocked'
                                    : `${Math.min(badge.current, badge.target)}/${badge.target} ${badge.unit}`
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
