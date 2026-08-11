// Views that are addressable by URL. Detail views (a single state, a single
// author) carry their subject in the hash too, e.g. #/travel/Kerala.
const ROUTABLE_VIEWS = ['home', 'novels', 'travel', 'writing', 'clothes', 'sync', 'author-page', 'state-details'];

const viewToHash = (view, subject) => {
    if (view === 'home') return '#/';
    if (view === 'author-page') return `#/authors/${encodeURIComponent(subject || '')}`;
    if (view === 'state-details') return `#/travel/${encodeURIComponent(subject || '')}`;
    return `#/${view}`;
};

const hashToRoute = (hash) => {
    const parts = (hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!parts.length) return { view: 'home', subject: null };

    const [head, tail] = parts;
    if (head === 'authors' && tail) return { view: 'author-page', subject: decodeURIComponent(tail) };
    if (head === 'travel' && tail) return { view: 'state-details', subject: decodeURIComponent(tail) };
    if (ROUTABLE_VIEWS.includes(head)) return { view: head, subject: null };
    return { view: 'home', subject: null };
};

const App = () => {
    const { useState, useEffect, useMemo } = React;
    const initialRoute = hashToRoute(window.location.hash);
    const [currentView, setCurrentView] = useState(initialRoute.view);
    const [selectedStateName, setSelectedStateName] = useState(
        initialRoute.view === 'state-details' ? initialRoute.subject : null
    );
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch all data in parallel
                const [novels, statesData, writing, stories, authors, clothes] = await Promise.all([
                    window.api.getNovels(),
                    window.api.getStates(),
                    window.api.getWriting(),
                    window.api.getStories(),
                    window.api.getAuthors(),
                    window.api.getClothes()
                ]);

                window.novelsData = novels || [];
                window.writingData = writing || [];
                window.storiesList = stories || [];
                window.authorsData = authors || [];
                window.clothesData = clothes || [];
                window.rawStatesData = statesData || { states: {}, bucketList: [] };

                console.log("Data loaded successfully. States loaded:", Object.keys((window.rawStatesData && window.rawStatesData.states) || {}).length);
                window.dispatchEvent(new Event('app-data-loaded'));
            } catch (err) {
                console.error("Failed to load data:", err);
                window.rawStatesData = window.rawStatesData || { states: {}, bucketList: [] };
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const [selectedAuthorName, setSelectedAuthorName] = useState(
        initialRoute.view === 'author-page' ? initialRoute.subject : null
    );

    // Keep the URL in step with the view so refresh, bookmarks and the browser
    // back button all work.
    useEffect(() => {
        const subject = currentView === 'author-page' ? selectedAuthorName
            : currentView === 'state-details' ? selectedStateName
            : null;
        const next = viewToHash(currentView, subject);
        if (window.location.hash !== next) {
            window.history.pushState(null, '', next);
        }
    }, [currentView, selectedAuthorName, selectedStateName]);

    // Back/forward and hand-edited URLs drive the view.
    useEffect(() => {
        const onHashChange = () => {
            const route = hashToRoute(window.location.hash);
            setCurrentView(route.view);
            if (route.view === 'author-page') setSelectedAuthorName(route.subject);
            if (route.view === 'state-details') setSelectedStateName(route.subject);
        };
        window.addEventListener('hashchange', onHashChange);
        window.addEventListener('popstate', onHashChange);
        return () => {
            window.removeEventListener('hashchange', onHashChange);
            window.removeEventListener('popstate', onHashChange);
        };
    }, []);

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
    };

    // Everything the home page needs, derived once from the data already loaded.
    const homeStats = useMemo(() => {
        if (loading) return null;

        const novels = window.novelsData || [];
        const states = (window.rawStatesData && window.rawStatesData.states) || {};
        const bucketList = (window.rawStatesData && window.rawStatesData.bucketList) || [];
        const writing = window.writingData || [];
        const stories = window.storiesList || [];
        const authors = window.authorsData || [];
        const clothes = window.clothesData || [];

        const isReading = (n) => n.status === 'Currently Reading';
        const isRead = (n) => n.status === 'Read';

        // Books per year, oldest first — the novels card sparkline.
        const yearCounts = {};
        novels.forEach(n => {
            const y = parseInt(n.readYear, 10);
            if (y) yearCounts[y] = (yearCounts[y] || 0) + 1;
        });
        const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
        const readingHistory = years.map(y => ({ year: y, count: yearCounts[y] }));

        // states.json keys India states and world countries into one map, so
        // counting it directly conflates the two. TravelData owns the split.
        const totals = (window.TravelData && window.TravelData.getTravelTotals)
            ? window.TravelData.getTravelTotals()
            : null;

        const visitedStates = totals ? totals.statesVisited : Object.values(states).filter(s => s && s.visited).length;
        const totalStates = totals ? totals.statesTotal : Object.keys(states).length;
        const visitedCountries = totals ? totals.countriesVisited : 0;
        const placesLogged = totals ? totals.placesVisited : Object.values(states).reduce(
            (sum, s) => sum + ((s && s.placesVisited) || []).length, 0
        );

        return {
            novels: {
                total: novels.length,
                reading: novels.filter(isReading).length,
                read: novels.filter(isRead).length,
                authors: authors.length,
                readingHistory
            },
            currentlyReading: novels.filter(isReading).map(n => {
                // progress is a percentage unless progressType says pages;
                // both turn up as strings or numbers depending on when it was entered.
                const raw = Number(n.progress) || 0;
                const pages = Number(n.pages) || 0;
                const percent = n.progressType === 'pages' && pages > 0
                    ? Math.round((raw / pages) * 100)
                    : Math.round(raw);

                return {
                    title: n.title,
                    author: n.author,
                    cover: n.cover,
                    percent: Math.max(0, Math.min(100, percent))
                };
            }),
            travel: {
                states: visitedStates,
                totalStates,
                countries: visitedCountries,
                places: placesLogged,
                bucketList: bucketList.length
            },
            writing: { entries: writing.length, stories: stories.length },
            clothes: { items: clothes.length }
        };
    }, [loading]);

    return (
        <div className="app">
            {currentView === 'home' && (
                <window.HomePage onNavigate={handleNavigate} stats={homeStats} loading={loading} />
            )}

            {window.CommandPalette && !loading && (
                <window.CommandPalette
                    onNavigate={handleNavigate}
                    onOpenAuthor={(name) => { setSelectedAuthorName(name); setCurrentView('author-page'); }}
                    onOpenState={(name) => { setSelectedStateName(name); setCurrentView('state-details'); }}
                />
            )}

            {/* Dashboards read from the window.* globals filled by the fetch above,
                and they snapshot that data on mount. Deep-linking straight to one
                (or refreshing on it) must therefore wait for the load to finish,
                or the page renders permanently empty. */}
            {currentView !== 'home' && loading && (
                <div className="app-loading">
                    <i className="ph-bold ph-circle-notch"></i>
                    <span>Loading your data…</span>
                </div>
            )}

            {currentView === 'novels' && !loading && (
                <window.NovelsDashboard
                    onBackToHome={handleBackToHome}
                    onAuthorClick={(author) => {
                        setSelectedAuthorName(author);
                        setCurrentView('author-page');
                    }}
                />
            )}

            {currentView === 'author-page' && !loading && (
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

            {currentView === 'travel' && !loading && (
                <window.TravelDashboard
                    onBackToHome={handleBackToHome}
                    onNavigateToState={(stateName) => {
                        setSelectedStateName(stateName);
                        setCurrentView('state-details');
                    }}
                />
            )}

            {currentView === 'writing' && !loading && (
                <window.WritingDashboard onBackToHome={handleBackToHome} />
            )}

            {currentView === 'state-details' && !loading && (
                console.log("Rendering StateDetails, window.StateDetails is:", window.StateDetails) ||
                <window.StateDetails
                    stateName={selectedStateName}
                    onBack={() => setCurrentView('travel')}
                />
            )}

            {currentView === 'sync' && !loading && (
                <window.SyncDashboard onBackToHome={handleBackToHome} />
            )}

            {currentView === 'clothes' && !loading && (
                <window.ClothesDashboard onBackToHome={handleBackToHome} />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
