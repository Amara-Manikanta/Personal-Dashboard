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
                const [novels, statesData, writing, stories, authors] = await Promise.all([
                    window.api.getNovels(),
                    window.api.getStates(),
                    window.api.getWriting(),
                    window.api.getStories(),
                    window.api.getAuthors()
                ]);

                // Assign to global window objects for compatibility with existing components
                window.novelsData = novels;
                window.writingData = writing;
                window.storiesList = stories;
                window.authorsData = authors;

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

    const [selectedAuthorName, setSelectedAuthorName] = useState(null);

    return (
        <div className="app">
            {currentView === 'home' && (
                <window.HomePage onNavigate={handleNavigate} />
            )}

            {currentView === 'novels' && (
                <window.NovelsDashboard
                    onBackToHome={handleBackToHome}
                    onAuthorClick={(author) => {
                        setSelectedAuthorName(author);
                        setCurrentView('author-page');
                    }}
                />
            )}

            {currentView === 'author-page' && (
                <window.AuthorPage
                    authorName={selectedAuthorName}
                    novels={window.novelsData || []}
                    onBack={() => setCurrentView('novels')}
                    onNavigateToNovel={(novel) => {
                        // This might be tricky if NovelsDashboard manages its own state
                        // The user asked to go to author page from book page
                        // If they click a book here, they probably expect to go to that book's details
                        // But NovelDetails is inside NovelsDashboard.
                        // Ideally we should switch view to 'novels' and tell it to open a specific novel.
                        // For now, let's just go back to novels dashboard.
                        // I'll need to pass a "initialSelectedNovel" prop to NovelsDashboard to support deep linking.
                        setCurrentView('novels');
                        // We will need to store this intent
                        window.pendingSelectedNovel = novel;
                    }}
                />
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
                console.log("Rendering StateDetails, window.StateDetails is:", window.StateDetails) ||
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
