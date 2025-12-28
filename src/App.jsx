const App = () => {
    const { useState } = React;
    const [currentView, setCurrentView] = useState('home'); // 'home', 'novels'
    const [selectedStateName, setSelectedStateName] = useState(null);

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
    };

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
