const App = () => {
    const { useState, useEffect } = React;
    const [currentView, setCurrentView] = useState('home'); // 'home', 'novels'
    const [selectedStateName, setSelectedStateName] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch all data in parallel
                const [novels, statesData, writing, stories] = await Promise.all([
                    window.api.getNovels(),
                    window.api.getStates(),
                    window.api.getWriting(),
                    window.api.getStories()
                ]);

                // Assign to global window objects for compatibility with existing components
                window.novelsData = novels;
                window.writingData = writing;
                window.storiesList = stories;

                // For states, we need to handle the structure { states: {}, bucketList: [] }
                // We'll expose this raw data to be used by statesData.js logic
                window.rawStatesData = statesData;

                console.log("Data loaded successfully");
            } catch (err) {
                console.error("Failed to load data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-surface text-text-primary">
                <div className="text-xl">Loading data...</div>
            </div>
        );
    }

    return (
        <div className="app">
            {currentView === 'home' && (
                <window.HomePage onNavigate={handleNavigate} />
            )}

            {currentView === 'novels' && (
                <window.NovelsDashboard onBackToHome={handleBackToHome} />
            )}

            {currentView === 'travel' && (
                <window.TravelDashboard
                    onBackToHome={handleBackToHome}
                    onNavigateToState={(stateName) => {
                        setSelectedStateName(stateName);
                        setCurrentView('state-details');
                    }}
                />
            )}

            {currentView === 'writing' && (
                <window.WritingDashboard onBackToHome={handleBackToHome} />
            )}

            {currentView === 'state-details' && (
                <window.StateDetails
                    stateName={selectedStateName}
                    onBack={() => setCurrentView('travel')}
                />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
