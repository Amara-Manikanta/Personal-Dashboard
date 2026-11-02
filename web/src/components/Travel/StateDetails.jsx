(function () {
    console.log("Loading StateDetails.jsx v10 (Generalized Add Form)...");

    const { useState, useEffect, useRef } = React;

    const SECTIONS = [
        { id: 'highlights', label: 'Highlights', icon: 'ph-star' },
        { id: 'placesVisited', label: 'Places Visited', icon: 'ph-map-pin' },
        // Tab id and storage key differ here: the entries live in placesToVisit.
        { id: 'bucketList', label: 'Bucket List', icon: 'ph-binoculars', field: 'placesToVisit' },
        { id: 'restaurants', label: 'Restaurants', icon: 'ph-fork-knife' },
        { id: 'food', label: 'Food to Try', icon: 'ph-pizza' },
        { id: 'treks', label: 'Treks', icon: 'ph-mountains' },
        { id: 'adventures', label: 'Adventure', icon: 'ph-person-simple-hike' },
        { id: 'stays', label: 'Stays', icon: 'ph-bed' }
    ];

    /**
     * Sections whose entries record something you actually did, so a visit
     * date makes sense. Bucket list / places to visit are deliberately absent:
     * those are plans, and a date there would mean something different and
     * would pollute the timeline of real visits.
     */
    const DATEABLE_TABS = ['placesVisited', 'restaurants', 'food', 'treks', 'adventures', 'stays', 'highlights'];

    const CUISINE_OPTIONS = ['Snacks', 'Local Meals', 'Curries', 'Western', 'Mixed', 'Asian', 'Pizza & Pasta', 'Coffee & Tea', 'Sweets', 'Chats'];
    const AMBIENCE_OPTIONS = ['Casual', 'Posh', 'Grab & Go', 'Family', 'Romantic', 'Rooftop', 'Bar', 'Late Night'];
    
    const TRIP_TYPE_OPTIONS = ['Nature & Lakes', 'High Peaks', 'Wildlife', 'Heritage Sites', 'Beaches', 'Waterfalls', 'City Tour'];
    const SEASON_OPTIONS = ['Monsoon', 'Winter', 'Post-Monsoon', 'Summer', 'All Year'];
    const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

    const STAY_TYPE_OPTIONS = ['Hotel', 'Resort', 'Service Apartment', 'Villa', 'Transit Stay', 'Hostel', 'Homestay'];
    const AMENITY_OPTIONS = ['🏊 Pool', '📶 Wi-Fi', '🍳 Kitchen', '🅿️ Parking', '❄️ AC', '☕ Breakfast'];

    const PLACE_CATEGORIES = [
        { id: 'Temple', label: 'Temple', icon: 'ph-buildings', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', svg: 'temple' },
        { id: 'Adventure', label: 'Adventure', icon: 'ph-person-simple-hike', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', svg: 'adventure' },
        { id: 'Waterfall', label: 'Waterfall', icon: 'ph-drop', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', svg: 'waterfall' },
        { id: 'Viewpoint', label: 'Viewpoint', icon: 'ph-binoculars', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', svg: 'viewpoint' },
        { id: 'Beach', label: 'Beach', icon: 'ph-sun-horizon', color: '#eab308', bg: 'rgba(234,179,8,0.15)', svg: 'beach' },
        { id: 'Museum', label: 'Museum', icon: 'ph-bank', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
        { id: 'Nature & Park', label: 'Nature & Park', icon: 'ph-tree', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
        { id: 'Fort & Heritage', label: 'Fort & Heritage', icon: 'ph-castle-turret', color: '#78716c', bg: 'rgba(120,113,108,0.15)' },
        { id: 'Shopping', label: 'Shopping', icon: 'ph-shopping-bag', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
        { id: 'Amusement & Theme Park', label: 'Amusement & Theme Park', icon: 'ph-confetti', color: '#f97316', bg: 'rgba(249,115,22,0.15)', svg: 'amusement' },
        { id: 'Street Food Spot', label: 'Street Food Spot', icon: 'ph-cooking-pot', color: '#fb7185', bg: 'rgba(251,113,133,0.15)' },
        { id: 'Church', label: 'Church', icon: 'ph-church', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', svg: 'church' },
        { id: 'Trekking', label: 'Trekking', icon: 'ph-person-simple-hike', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', svg: 'trekking' },
        { id: 'Religious & Spiritual', label: 'Religious & Spiritual', icon: 'ph-hands-praying', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)' },
        { id: 'Lake & Dam', label: 'Lake & Dam', icon: 'ph-waves', color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', svg: 'lake' },
        { id: 'Hill Station', label: 'Hill Station', icon: 'ph-mountains', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
        { id: 'Camping', label: 'Camping', icon: 'ph-tent', color: '#84cc16', bg: 'rgba(132,204,22,0.15)' },
        { id: 'Cultural & Events', label: 'Cultural & Events', icon: 'ph-mask-happy', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
        { id: 'Wellness & Spa', label: 'Wellness & Spa', icon: 'ph-flower-lotus', color: '#d946ef', bg: 'rgba(217,70,239,0.15)' },
        { id: 'Other', label: 'Other', icon: 'ph-map-pin', color: '#64748b', bg: 'rgba(100,116,139,0.15)' }
    ];


    /**
     * Restaurants and stays get one simple tag each rather than a taxonomy —
     * enough for the entry to carry an icon and be counted, without asking
     * you to classify every meal.
     */
    const FOOD_CATEGORIES = [
        { id: 'Restaurant', label: 'Restaurant', icon: 'ph-fork-knife', color: '#f97316', bg: 'rgba(249,115,22,0.15)' }
    ];

    /** Food to Try holds dishes, so it needs dish types, not venue types. */
    const DISH_CATEGORIES = [
        { id: 'Sweet', label: 'Sweet', icon: 'ph-ice-cream', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
        { id: 'Snack', label: 'Snack', icon: 'ph-hamburger', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
        { id: 'Main', label: 'Main', icon: 'ph-bowl-food', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
        { id: 'Beverage', label: 'Beverage', icon: 'ph-coffee', color: '#b45309', bg: 'rgba(180,83,9,0.15)' },
        { id: 'Street Food', label: 'Street Food', icon: 'ph-cooking-pot', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
    ];

    const ADVENTURE_CATEGORIES = [
        { id: 'Parasailing', label: 'Parasailing', icon: 'ph-parachute', color: '#ec4899', bg: 'rgba(236,72,153,0.15)', svg: 'parasailing' },
        { id: 'River Rafting', label: 'River Rafting', icon: 'ph-boat', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', svg: 'rafting' },
        { id: 'Bungee Jumping', label: 'Bungee Jumping', icon: 'ph-arrow-line-down', color: '#f97316', bg: 'rgba(249,115,22,0.15)', svg: 'bungee' },
        { id: 'Skiing', label: 'Skiing', icon: 'ph-snowflake', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
        { id: 'Paragliding', label: 'Paragliding', icon: 'ph-wind', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', svg: 'paragliding' },
        { id: 'Cliff Jumping', label: 'Cliff Jumping', icon: 'ph-person-simple-swim', color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', svg: 'cliffjump' },
        // Catch-all so an activity not listed above can still be tagged.
        { id: 'Adventure', label: 'Other Adventure', icon: 'ph-person-simple-hike', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', svg: 'adventure' }
    ];

    /** Treks are their own thing, distinct from adventure activities. */
    const TREK_CATEGORIES = [
        { id: 'Trek', label: 'Trek', icon: 'ph-person-simple-hike', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', svg: 'trekking' }
    ];

    const STAY_CATEGORIES = [
        { id: 'Hotel', label: 'Hotel', icon: 'ph-buildings', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
        { id: 'Resort', label: 'Resort', icon: 'ph-umbrella', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
        { id: 'Stay', label: 'Stay', icon: 'ph-bed', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' }
    ];

    /** Which set of tags a section offers. */
    const categoriesFor = (tab) => {
        if (tab === 'food') return DISH_CATEGORIES;
        if (tab === 'restaurants') return FOOD_CATEGORIES;
        if (tab === 'stays') return STAY_CATEGORIES;
        if (tab === 'adventures') return ADVENTURE_CATEGORIES;
        if (tab === 'treks') return TREK_CATEGORIES;
        return PLACE_CATEGORIES;
    };

    // Lookup across every set, so a badge still renders if an entry was tagged
    // before its section had its own list.
    // De-duplicated by id: the place list and the adventure list both define
    // an 'Adventure' entry (labelled "Adventure" and "Other Adventure"), and
    // leaving both in produced two cards counting the same records twice.
    const ALL_CATEGORIES = [
        ...PLACE_CATEGORIES, ...FOOD_CATEGORIES, ...DISH_CATEGORIES, ...STAY_CATEGORIES,
        ...ADVENTURE_CATEGORIES, ...TREK_CATEGORIES
    ].filter((cat, i, list) => list.findIndex(c => c.id === cat.id) === i);

    // Shared with the travel dashboard's poster map legend.
    window.PLACE_CATEGORIES = PLACE_CATEGORIES;
    window.ALL_CATEGORIES = ALL_CATEGORIES;
    window.categoriesFor = categoriesFor;

    /**
     * Visit dates are stored at month precision ("2026-08") because that is
     * what people actually remember about a trip. Older entries hold a full
     * "2026-08-26"; both render the same way, and neither is parsed through
     * Date() with a bare string, which would shift across timezones.
     */
    window.formatVisitDate = (value) => {
        const raw = String(value || '').trim();
        const m = raw.match(/^(\d{4})-(\d{2})/);
        if (!m) return raw;
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${MONTHS[Number(m[2]) - 1] || m[2]} ${m[1]}`;
    };

    /**
     * A place can be visited more than once, so dates are stored as a list
     * under `visitDates`. Older entries hold a single `visitedDate` string;
     * these helpers read both so nothing needs migrating.
     */
    window.getVisitDates = (entry) => {
        if (!entry || typeof entry !== 'object') return [];
        const list = Array.isArray(entry.visitDates) ? entry.visitDates.slice() : [];
        if (entry.visitedDate && !list.includes(entry.visitedDate)) list.push(entry.visitedDate);
        // Newest first, and compare as strings since all are YYYY-MM[-DD]
        return list.filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)));
    };

    /** Entry with one more visit date, de-duplicated by month. */
    window.withVisitDate = (entry, date) => {
        if (!date) return entry;
        const obj = (entry && typeof entry === 'object')
            ? { ...entry }
            : { name: String(entry || ''), city: '-', remarks: '-', image: '' };

        const existing = window.getVisitDates(obj);
        // A full legacy date and a month value for the same month are one visit
        const sameMonth = existing.some(d => String(d).slice(0, 7) === String(date).slice(0, 7));
        const next = sameMonth ? existing : [...existing, date];

        delete obj.visitedDate; // folded into the list
        obj.visitDates = next.sort((a, b) => String(b).localeCompare(String(a)));
        return obj;
    };

    /** Entry with one visit date removed. */
    window.withoutVisitDate = (entry, date) => {
        const obj = { ...(entry || {}) };
        const next = window.getVisitDates(obj).filter(d => d !== date);
        delete obj.visitedDate;
        if (next.length) obj.visitDates = next; else delete obj.visitDates;
        return obj;
    };

    /**
     * Month + year as two selects.
     *
     * <input type="month"> renders as an empty box in this app's dark theme —
     * the native segments give no visible affordance, so there is nothing to
     * tell you what to type. Two dropdowns are unambiguous, match the rest of
     * the UI, and behave the same in every browser.
     *
     * Emits "YYYY-MM", or "" until both halves are chosen.
     */
    window.MonthYearPicker = ({ value, onChange, className = '' }) => {
        const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const parse = (v) => {
            const parts = String(v || '').trim().match(/^(\d{4})-(\d{2})/);
            return { year: parts ? parts[1] : '', month: parts ? parts[2] : '' };
        };

        // Each half is held locally. Deriving both from the combined value
        // loses a half-finished choice: picking a month emits '' (no year
        // yet), which would immediately wipe the month back out of the UI.
        const [month, setMonth] = useState(parse(value).month);
        const [year, setYear] = useState(parse(value).year);

        useEffect(() => {
            const next = parse(value);
            setMonth(next.month);
            setYear(next.year);
        }, [value]);

        const thisYear = new Date().getFullYear();
        const years = [];
        for (let y = thisYear; y >= 1980; y--) years.push(String(y));

        const emit = (nextMonth, nextYear) => {
            setMonth(nextMonth);
            setYear(nextYear);
            onChange(nextMonth && nextYear ? `${nextYear}-${nextMonth}` : '');
        };

        return (
            <span className={`month-year-picker ${className}`}>
                <select
                    aria-label="Month"
                    value={month}
                    onChange={(e) => emit(e.target.value, year)}
                >
                    <option value="">Month</option>
                    {MONTHS.map((label, i) => (
                        <option key={label} value={String(i + 1).padStart(2, '0')}>{label}</option>
                    ))}
                </select>
                <select
                    aria-label="Year"
                    value={year}
                    onChange={(e) => emit(month, e.target.value)}
                >
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </span>
        );
    };

    /** A stored date trimmed to what <input type="month"> expects. */
    window.toMonthInput = (value) => String(value || '').trim().slice(0, 7);

    /**
     * Destination chooser, rendered as a centred dialog.
     *
     * It deliberately does NOT live inside the row's action group: that group
     * is opacity:0 until `tr:hover`, so a popover anchored there vanished the
     * moment the pointer left the row to reach it. A dialog also copes better
     * with ~230 destinations than a native select.
     */
    const MovePicker = ({ itemName, currentRegion, sections, onPick, onPickSection, onCancel }) => {
        const [query, setQuery] = useState('');
        const inputRef = useRef(null);

        useEffect(() => {
            const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
            window.addEventListener('keydown', onKey);
            requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
            return () => window.removeEventListener('keydown', onKey);
        }, [onCancel]);

        const TD = window.TravelData || {};
        const q = query.trim().toLowerCase();
        const match = (list) => (list || [])
            .filter(n => n !== currentRegion && (!q || n.toLowerCase().includes(q)));

        const states = match(TD.STATES_LIST);
        const countries = match(TD.COUNTRIES_LIST);
        // Sections of the state you are already in — a place that turns out
        // to be a trek should not require picking the same state again.
        const sectionHits = (sections || []).filter(sec => !q || sec.label.toLowerCase().includes(q));

        const group = (label, names) => names.length > 0 && (
            <div className="move-group" key={label}>
                <div className="move-group-label">{label}</div>
                <div className="move-options">
                    {names.map(n => (
                        <button key={n} type="button" className="move-option" onClick={() => onPick(n)}>{n}</button>
                    ))}
                </div>
            </div>
        );

        return (
            <div className="move-backdrop" onClick={onCancel}>
                <div className="move-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                    <header className="move-dialog-head">
                        <div>
                            <span className="move-dialog-kicker">Move to another state</span>
                            <h3>{itemName}</h3>
                        </div>
                        <button type="button" className="move-close" onClick={onCancel} aria-label="Cancel">
                            <i className="ph-bold ph-x"></i>
                        </button>
                    </header>

                    <div className="move-search">
                        <i className="ph-bold ph-magnifying-glass"></i>
                        <input
                            ref={inputRef}
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Filter destinations…"
                        />
                    </div>

                    <div className="move-body">
                        {states.length === 0 && countries.length === 0 && sectionHits.length === 0 && (
                            <p className="move-empty">No destination matches “{query}”.</p>
                        )}

                        {sectionHits.length > 0 && (
                            <div className="move-group">
                                <div className="move-group-label">Sections in {currentRegion}</div>
                                <div className="move-options">
                                    {sectionHits.map(sec => (
                                        <button
                                            key={sec.field}
                                            type="button"
                                            className="move-option is-section"
                                            onClick={() => onPickSection(sec.field)}
                                        >
                                            <i className={`ph-bold ${sec.icon}`}></i> {sec.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {group('States & union territories', states)}
                        {group('Countries', countries)}
                    </div>
                </div>
            </div>
        );
    };

    // Check for localhost
    const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '';

    const StateDetails = ({ stateName, onBack }) => {
        const [data, setData] = useState(null);
        const [activeTab, setActiveTab] = useState('highlights');

        // Add Item Form State
        const [newItem, setNewItem] = useState('');
        const [newCity, setNewCity] = useState('');
        const [newRemarks, setNewRemarks] = useState(''); // Unified: Remarks/Notes/Restaurant

        // Image Upload State (Global for Add)
        const [uploading, setUploading] = useState(false);
        const [uploadedImagePath, setUploadedImagePath] = useState('');

        const [searchTerm, setSearchTerm] = useState('');
        const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

        // Edit State
        const [editingIndex, setEditingIndex] = useState(-1);
        const [editItem, setEditItem] = useState({ name: '', city: '', remarks: '', category: '', image: '', mapLink: '', dishes: [] });
        const [editUploading, setEditUploading] = useState(false);
        const [newDishName, setNewDishName] = useState('');
        const [newDishRating, setNewDishRating] = useState('good');

        // Add Form Extended State
        const [newCategory, setNewCategory] = useState('');
        const [newDishes, setNewDishes] = useState([]);
        const [newAddDishName, setNewAddDishName] = useState('');
        const [newAddDishRating, setNewAddDishRating] = useState('good');
        const [newMapLink, setNewMapLink] = useState('');
        const [newCuisines, setNewCuisines] = useState([]);
        const [newAmbiences, setNewAmbiences] = useState([]);
        const [newTripTypes, setNewTripTypes] = useState([]);
        const [newSeason, setNewSeason] = useState('All Year');
        const [newTravelDuration, setNewTravelDuration] = useState('');
        const [newPriority, setNewPriority] = useState('Medium');
        const [newDistance, setNewDistance] = useState('');
        const [newAltitude, setNewAltitude] = useState('');
        const [newDifficulty, setNewDifficulty] = useState('Beginner');
        const [newBestTime, setNewBestTime] = useState('');
        const [newPermit, setNewPermit] = useState('No');
        const [newTimeTaken, setNewTimeTaken] = useState('');
        const [newHeight, setNewHeight] = useState('');
        const [newOperator, setNewOperator] = useState('');
        const [newCost, setNewCost] = useState('');
        const [newTerrain, setNewTerrain] = useState('');
        const [newSafetyAlerts, setNewSafetyAlerts] = useState(false);
        const [newIsVisited, setNewIsVisited] = useState(false);
        const [newVisitedDate, setNewVisitedDate] = useState('');
        const [movingIndex, setMovingIndex] = useState(null);
        const [dateMode, setDateMode] = useState(false);
        const [selectedRows, setSelectedRows] = useState([]);
        const [bulkDate, setBulkDate] = useState('');
        const [newStayType, setNewStayType] = useState('Hotel');
        const [newCheckIn, setNewCheckIn] = useState('');
        const [newCheckOut, setNewCheckOut] = useState('');
        const [newAmenities, setNewAmenities] = useState([]);

        // Feature 14: Place Ratings & Reviews
        const [newRating, setNewRating] = useState(0);
        const [newReview, setNewReview] = useState('');

        // Feature 3: Photo Gallery
        const [newPhotos, setNewPhotos] = useState([]);
        const [photoUploading, setPhotoUploading] = useState(false);

        // Lightbox state
        const [lightboxPhotos, setLightboxPhotos] = useState([]);
        const [lightboxIndex, setLightboxIndex] = useState(0);
        const [lightboxOpen, setLightboxOpen] = useState(false);

        useEffect(() => {
            if (stateName) {
                loadData();
            }
            const onDataLoaded = () => { if (stateName) loadData(); };
            window.addEventListener('app-data-loaded', onDataLoaded);
            return () => window.removeEventListener('app-data-loaded', onDataLoaded);
        }, [stateName]);

        // Clear inputs when tab changes
        useEffect(() => {
            setNewItem('');
            setNewCity('');
            setNewVisitedDate('');
            setNewHeight(''); setNewOperator(''); setNewCost('');
            setNewRemarks('');
            setNewCategory('');
            setSelectedCategoryFilter('all');
            setUploadedImagePath('');
            setNewDishName('');
            setNewDishRating('good');
            setNewDishes([]);
            setNewAddDishName('');
            setNewAddDishRating('good');
            setNewMapLink('');
            setNewDistance('');
            setNewAltitude('');
            setNewDifficulty('Beginner');
            setNewBestTime('');
            setNewPermit('No');
            setNewTimeTaken('');
            setNewTerrain('');
            setNewSafetyAlerts(false);
            setNewIsVisited(false);
            setNewCuisines([]);
            setNewAmbiences([]);
            setNewTripTypes([]);
            setNewSeason('All Year');
            setNewTravelDuration('');
            setNewPriority('Medium');
            setNewRating(0);
            setNewReview('');
            setNewPhotos([]);
            cancelEdit();
            setDateMode(false);
            setSelectedRows([]);
            setBulkDate('');
        }, [activeTab]);

        const loadData = () => {
            const allStates = window.TravelData.getStatesData();
            const countryData = window.TravelData.getCountriesData();

            let current = allStates.find(s => s.name === stateName);
            if (!current) {
                current = countryData.find(s => s.name === stateName);
            }
            setData(current || null);
        };

        /**
         * Starring an item copies it into `highlights` rather than linking to
         * it, so editing the original used to leave a stale duplicate behind —
         * change a trek's category and the highlight still showed the old one.
         *
         * Any save that rewrites a list therefore refreshes the highlight
         * copies of the items in it, matched by name.
         */
        const syncHighlights = (updatedData, current) => {
            const changedField = Object.keys(updatedData).find(
                k => k !== 'highlights' && Array.isArray(updatedData[k])
            );
            if (!changedField) return updatedData;

            const highlights = (current && current.highlights) || [];
            if (!highlights.length) return updatedData;

            const nameOf = (x) => String(x && typeof x === 'object' ? x.name : x || '').trim().toLowerCase();
            const byName = new Map();
            updatedData[changedField].forEach(item => {
                const n = nameOf(item);
                if (n) byName.set(n, item);
            });

            let touched = false;
            const nextHighlights = highlights.map(h => {
                const fresh = byName.get(nameOf(h));
                if (!fresh || typeof fresh !== 'object') return h;
                touched = true;
                return { ...fresh };
            });

            return touched ? { ...updatedData, highlights: nextHighlights } : updatedData;
        };

        const handleSave = (updatedData) => {
            const payload = syncHighlights(updatedData, data);
            window.TravelData.saveStateData(stateName, payload);
            setData(prev => ({ ...prev, ...payload }));
        };

        const toggleVisited = () => {
            if (!data) return;
            handleSave({ visited: !data.visited });
        };

        const uploadFile = async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Data = reader.result;
                    const result = await window.api.uploadImage({
                        image: base64Data,
                        name: file.name
                    });
                    resolve(result);
                };
                reader.readAsDataURL(file);
            });
        };

        const handleAddFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);
            const result = await uploadFile(file);

            if (result && result.success) {
                setUploadedImagePath(result.path);
            } else {
                alert("Image upload failed.");
            }
            setUploading(false);
        };

        const handleEditFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setEditUploading(true);
            const result = await uploadFile(file);

            if (result && result.success) {
                setEditItem(prev => ({ ...prev, image: result.path }));
            } else {
                alert("Image upload failed during edit.");
            }
            setEditUploading(false);
        };

        const addItem = (e) => {
            e.preventDefault();
            if (!newItem.trim() || !data) return;

            const list = data[dataField] || [];

            // Should current view support full objects?
            // Yes, user wants City/Notes for all.

            // For backward compatibility:
            // Existing data might be strings.
            // We will push new items as objects.

            const isGridView = activeTab === 'food' && isLocalhost;

            const itemToAdd = {
                name: newItem.trim(),
                city: newCity.trim() || '-',
                remarks: newRemarks.trim() || '-',
                category: newCategory || undefined,
                visitDates: (DATEABLE_TABS.includes(activeTab) && newVisitedDate) ? [newVisitedDate] : undefined,
                image: isGridView ? uploadedImagePath : undefined,
                mapLink: (activeTab === 'restaurants' || activeTab === 'treks' || activeTab === 'adventures') ? newMapLink.trim() : undefined,
                dishes: activeTab === 'restaurants' ? [...newDishes] : undefined,
                cuisines: activeTab === 'restaurants' ? [...newCuisines] : undefined,
                ambiences: activeTab === 'restaurants' ? [...newAmbiences] : undefined,
                tripTypes: activeTab === 'bucketList' ? [...newTripTypes] : undefined,
                season: activeTab === 'bucketList' ? newSeason : undefined,
                travelDuration: activeTab === 'bucketList' ? newTravelDuration.trim() : undefined,
                priority: activeTab === 'bucketList' ? newPriority : undefined,
                distance: activeTab === 'treks' ? newDistance.trim() : undefined,
                altitude: activeTab === 'treks' ? newAltitude.trim() : undefined,
                difficulty: (activeTab === 'treks' || activeTab === 'adventures') ? newDifficulty : undefined,
                bestTime: activeTab === 'treks' ? newBestTime.trim() : undefined,
                permit: activeTab === 'treks' ? newPermit : undefined,
                timeTaken: (activeTab === 'treks' || activeTab === 'adventures') ? newTimeTaken.trim() : undefined,
                height: activeTab === 'adventures' ? newHeight.trim() : undefined,
                operator: activeTab === 'adventures' ? newOperator.trim() : undefined,
                cost: activeTab === 'adventures' ? newCost.trim() : undefined,
                terrain: activeTab === 'treks' ? newTerrain.trim() : undefined,
                safetyAlerts: activeTab === 'treks' ? newSafetyAlerts : undefined,
                isVisited: activeTab === 'treks' ? newIsVisited : undefined,
                stayType: activeTab === 'stays' ? newStayType : undefined,
                checkIn: activeTab === 'stays' ? newCheckIn : undefined,
                checkOut: activeTab === 'stays' ? newCheckOut : undefined,
                amenities: activeTab === 'stays' ? [...newAmenities] : undefined,
                rating: (activeTab === 'placesVisited' || activeTab === 'restaurants') ? newRating : undefined,
                review: (activeTab === 'placesVisited' || activeTab === 'restaurants') ? newReview.trim() : undefined,
                photos: (activeTab === 'placesVisited' || activeTab === 'bucketList') ? (newPhotos.length > 0 ? [...newPhotos] : undefined) : undefined
            };

            const updatedList = [...list, itemToAdd];
            handleSave({ [dataField]: updatedList });

            // Reset fields
            setNewItem('');
            setNewCity('');
            setNewVisitedDate('');
            setNewRemarks('');
            setNewCategory('');
            setNewDishes([]);
            setNewAddDishName('');
            setNewAddDishRating('good');
            setNewMapLink('');
            setNewDistance('');
            setNewAltitude('');
            setNewDifficulty('Beginner');
            setNewBestTime('');
            setNewPermit('No');
            setNewTimeTaken('');
            setNewTerrain('');
            setNewSafetyAlerts(false);
            setNewIsVisited(false);
            setNewCuisines([]);
            setNewAmbiences([]);
            setNewTripTypes([]);
            setNewSeason('All Year');
            setNewTravelDuration('');
            setNewPriority('Medium');
            setNewStayType('Hotel');
            setNewCheckIn('');
            setNewCheckOut('');
            setNewAmenities([]);
            setNewRating(0);
            setNewReview('');
            setNewPhotos([]);

            if (isGridView) {
                setUploadedImagePath('');
                const fileInput = document.getElementById('add-image-upload');
                if (fileInput) fileInput.value = '';
            }
        };

        const removeItem = (e, index) => {
            if (e && e.stopPropagation) e.stopPropagation();

            if (!window.confirm("Are you sure you want to delete this item?")) return;

            if (!data) return;
            const list = data[dataField] || [];
            const updatedList = list.filter((_, i) => i !== index);
            handleSave({ [dataField]: updatedList });

            if (editingIndex === index) {
                cancelEdit();
            }
        };

        /**
         * Move this entry into the same list on another state/country.
         * Both sides are written in one save by the data layer.
         */
        const moveItemTo = (index, destination) => {
            setMovingIndex(null);
            if (!destination || !data) return;

            const result = window.TravelData.moveItemBetweenRegions(stateName, destination, dataField, index);
            if (!result.ok) {
                alert(result.message);
                return;
            }

            if (editingIndex === index) cancelEdit();
            loadData(); // both regions changed, so re-read rather than patching state
        };

        const toggleRowSelected = (index) => {
            setSelectedRows(prev => prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]);
        };

        /** Stamp one month onto every selected place, in a single save. */
        const applyBulkDate = () => {
            if (!data || !bulkDate || selectedRows.length === 0) return;

            const list = data[dataField] || [];
            const chosen = new Set(selectedRows);
            const updated = list.map((item, i) => {
                if (!chosen.has(i)) return item;
                // Legacy entries are plain strings; give them a shape first.
                // Append: applying a date must not erase an earlier visit.
                return window.withVisitDate(item, bulkDate);
            });

            handleSave({ [dataField]: updated });
            setSelectedRows([]);
            setBulkDate('');
            setDateMode(false);
        };

        /** Move this entry into a different section of the same state. */
        const moveItemToSection = (index, targetField) => {
            setMovingIndex(null);
            if (!targetField || !data) return;

            const result = window.TravelData.moveItemBetweenFields(stateName, dataField, targetField, index);
            if (!result.ok) { alert(result.message); return; }

            if (editingIndex === index) cancelEdit();
            loadData();
        };

        const toggleHighlight = (e, item) => {
            if (e && e.stopPropagation) e.stopPropagation();
            if (!data) return;

            const highlightsList = [...(data.highlights || [])];
            const itemName = typeof item === 'object' ? item.name : item;
            const isObj = typeof item === 'object' && item !== null;
            
            const existingIndex = highlightsList.findIndex(h => (typeof h === 'object' ? h.name : h) === itemName);
            
            if (existingIndex >= 0) {
                highlightsList.splice(existingIndex, 1);
            } else {
                highlightsList.push(isObj ? { ...item } : { name: itemName });
            }
            
            handleSave({ highlights: highlightsList });
        };

        const moveToVisited = (e, index, targetTab) => {
            if (e && e.stopPropagation) e.stopPropagation();
            if (!data) return;
            
            const bucketList = data.bucketList || [];
            const itemToMove = bucketList[index];
            if (!itemToMove) return;

            // Make sure we carry over name and city natively, and mark as visited for Treks
            const transferredItem = { ...itemToMove };
            if (targetTab === 'treks') {
                transferredItem.isVisited = true;
            }

            const updatedBucketList = bucketList.filter((_, i) => i !== index);
            const targetList = data[targetTab] || [];
            const updatedTargetList = [...targetList, transferredItem];

            handleSave({ 
                bucketList: updatedBucketList,
                [targetTab]: updatedTargetList 
            });
        };

        const startEdit = (index, item) => {
            setEditingIndex(index);
            if (typeof item === 'object' && item !== null) {
                setEditItem({
                    ...item,
                    name: item.name || '',
                    city: item.city || '',
                    remarks: item.remarks || '',
                    category: item.category || '',
                    image: item.image || '',
                    mapLink: item.mapLink || '',
                    dishes: item.dishes || [],
                    cuisines: item.cuisines || [],
                    ambiences: item.ambiences || [],
                    tripTypes: item.tripTypes || [],
                    season: item.season || 'All Year',
                    travelDuration: item.travelDuration || '',
                    priority: item.priority || 'Medium',
                    distance: item.distance || '',
                    altitude: item.altitude || '',
                    difficulty: item.difficulty || 'Beginner',
                    bestTime: item.bestTime || '',
                    permit: item.permit || 'No',
                    timeTaken: item.timeTaken || '',
                    terrain: item.terrain || '',
                    safetyAlerts: item.safetyAlerts || false,
                    isVisited: item.isVisited || false
                });
            } else {
                setEditItem({ name: item, city: '', remarks: '', category: '', image: '', mapLink: '', dishes: [], cuisines: [], ambiences: [], tripTypes: [], season: 'All Year', travelDuration: '', priority: 'Medium', distance: '', altitude: '', difficulty: 'Beginner', bestTime: '', permit: 'No', timeTaken: '', terrain: '', safetyAlerts: false, isVisited: false });
            }
            setNewDishName('');
            setNewDishRating('good');
        };

        const cancelEdit = () => {
            setEditingIndex(-1);
            setEditItem({ name: '', city: '', remarks: '', category: '', image: '', mapLink: '', dishes: [], cuisines: [], ambiences: [], tripTypes: [], season: 'All Year', travelDuration: '', priority: 'Medium', distance: '', altitude: '', difficulty: 'Beginner', bestTime: '', permit: 'No', timeTaken: '', terrain: '', safetyAlerts: false, isVisited: false });
            setNewDishName('');
            setNewDishRating('good');
        };

        const saveEdit = (index) => {
            if (!editItem.name.trim()) return;

            const list = [...(data[dataField] || [])];

            const updatedItem = {
                name: editItem.name.trim(),
                city: editItem.city.trim() || '-',
                remarks: editItem.remarks.trim() || '-',
                category: editItem.category || undefined,
                visitDates: (editItem.visitDates && editItem.visitDates.length) ? editItem.visitDates : undefined,
                visitedDate: undefined,
                image: editItem.image
            };
            
            if (activeTab === 'restaurants') {
                if (editItem.mapLink) {
                    updatedItem.mapLink = editItem.mapLink.trim();
                }
                if (editItem.dishes && editItem.dishes.length > 0) {
                    updatedItem.dishes = editItem.dishes;
                }
                if (editItem.cuisines && editItem.cuisines.length > 0) {
                    updatedItem.cuisines = editItem.cuisines;
                }
                if (editItem.ambiences && editItem.ambiences.length > 0) {
                    updatedItem.ambiences = editItem.ambiences;
                }
            }
            if (activeTab === 'bucketList') {
                if (editItem.tripTypes && editItem.tripTypes.length > 0) {
                    updatedItem.tripTypes = editItem.tripTypes;
                }
                if (editItem.season) updatedItem.season = editItem.season;
                if (editItem.travelDuration) updatedItem.travelDuration = editItem.travelDuration.trim();
                if (editItem.priority) updatedItem.priority = editItem.priority;
            }
            if (activeTab === 'treks') {
                if (editItem.distance) updatedItem.distance = editItem.distance.trim();
                if (editItem.altitude) updatedItem.altitude = editItem.altitude.trim();
                if (editItem.difficulty) updatedItem.difficulty = editItem.difficulty;
                if (editItem.bestTime) updatedItem.bestTime = editItem.bestTime.trim();
                updatedItem.permit = editItem.permit;
                if (editItem.timeTaken) updatedItem.timeTaken = editItem.timeTaken.trim();
                if (editItem.terrain) updatedItem.terrain = editItem.terrain.trim();
                updatedItem.safetyAlerts = editItem.safetyAlerts;
                updatedItem.isVisited = editItem.isVisited;
                if (editItem.mapLink) updatedItem.mapLink = editItem.mapLink.trim();
            }
            if (activeTab === 'adventures') {
                if (editItem.height) updatedItem.height = editItem.height.trim();
                if (editItem.timeTaken) updatedItem.timeTaken = editItem.timeTaken.trim();
                if (editItem.difficulty) updatedItem.difficulty = editItem.difficulty;
                if (editItem.operator) updatedItem.operator = editItem.operator.trim();
                if (editItem.cost) updatedItem.cost = String(editItem.cost).trim();
                if (editItem.mapLink) updatedItem.mapLink = editItem.mapLink.trim();
            }
            if (activeTab === 'stays') {
                if (editItem.stayType) updatedItem.stayType = editItem.stayType;
                if (editItem.checkIn) updatedItem.checkIn = editItem.checkIn;
                if (editItem.checkOut) updatedItem.checkOut = editItem.checkOut;
                if (editItem.amenities && editItem.amenities.length > 0) {
                    updatedItem.amenities = editItem.amenities;
                }
            }

            list[index] = updatedItem;

            handleSave({ [dataField]: list });
            cancelEdit();
        };

        const addDishToEdit = (e) => {
            e.preventDefault();
            if (!newDishName.trim()) return;
            setEditItem(prev => ({
                ...prev,
                dishes: [...(prev.dishes || []), { name: newDishName.trim(), rating: newDishRating }]
            }));
            setNewDishName('');
            setNewDishRating('good');
        };

        const removeDishFromEdit = (dishIndex) => {
            setEditItem(prev => ({
                ...prev,
                dishes: (prev.dishes || []).filter((_, i) => i !== dishIndex)
            }));
        };

        if (!data) return <div className="p-8 text-center text-text-muted">Loading...</div>;

        const activeSection = SECTIONS.find(s => s.id === activeTab);
        // A section's tab id is usually its storage key, but Bucket List reads
        // placesToVisit. Everything that touches the stored list goes through
        // this, so the two can differ without the list silently coming back
        // empty.
        const dataField = (SECTIONS.find(sec => sec.id === activeTab) || {}).field || activeTab;
        const currentList = data[dataField] || [];

        // How many items sit in each category, so the filter bar can show counts
        // and hide chips for categories nothing uses.
        const categoryCounts = {};
        let uncategorisedCount = 0;
        currentList.forEach(item => {
            const cat = (item && typeof item === 'object' && item.category) || '';
            if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            else uncategorisedCount++;
        });

        const filteredList = currentList
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const isObj = typeof item === 'object' && item !== null;
                const category = isObj ? (item.category || '') : '';

                // Category Filter
                if (selectedCategoryFilter === '__none') {
                    if (category) return false;
                } else if (selectedCategoryFilter !== 'all') {
                    if (category !== selectedCategoryFilter) return false;
                }

                // Search Filter
                const text = isObj ? ((item.name || '') + ' ' + (item.city || '') + ' ' + (item.remarks || '') + ' ' + category) : (item || '');
                return String(text).toLowerCase().includes(String(searchTerm).toLowerCase());
            });

        const renderCategoryBadge = (catId) => {
            if (!catId) return null;
            const cat = ALL_CATEGORIES.find(c => c.id === catId);
            if (!cat) return null;
            return (
                <span className="dish-badge" style={{ backgroundColor: cat.bg, color: cat.color, border: `1px solid ${cat.color}40` }} title={cat.label}>
                    <window.CategoryIcon category={cat} size={14} /> {cat.label}
                </span>
            );
        };

        const isGridView = activeTab === 'food' && isLocalhost;

        // Dynamic placeholder logic
        const getPlaceholder = () => {
            // e.g. "Add place name...", "Add restaurant name..."
            const base = activeSection.label;
            // simple heuristic: remove 's' or specific tweaks
            if (activeTab === 'adventures') return 'Adventure...';
            if (activeTab === 'placesVisited') return 'Place Name...';
            if (activeTab === 'food') return 'Dish Name...';
            if (activeTab === 'restaurants') return 'Restaurant Name...';
            return `Add ${base.toLowerCase().replace(/s$/, '')} name...`;
        };

        // Calculate Total Kms for visited treks
        let totalTrekKms = 0;
        if (activeTab === 'treks' && currentList.length > 0) {
            totalTrekKms = currentList.reduce((sum, item) => {
                if (item && typeof item === 'object' && item.isVisited && item.distance) {
                    const match = item.distance.match(/[\d.]+/);
                    if (match) return sum + parseFloat(match[0]);
                }
                return sum;
            }, 0);
        }

        return (
            <div className="state-details-container fade-in">
                {/* Hero Header */}
                <div className="details-hero">
                    <div className="hero-content">
                        <button onClick={onBack} className="back-btn group">
                            <div className="icon-circle bg-white/10 group-hover:bg-primary group-hover:text-white transition-colors">
                                <i className="ph-bold ph-arrow-left"></i>
                            </div>
                            <span>Back to Dashboard</span>
                        </button>

                        <div className="title-row">
                            <h1 className="state-title">{stateName}</h1>
                            <button
                                onClick={toggleVisited}
                                className={`visited-toggle ${data.visited ? 'is-visited' : ''}`}
                            >
                                <i className={data.visited ? "ph-fill ph-check-circle" : "ph-bold ph-circle"}></i>
                                {data.visited ? "Visited" : "Mark Visited"}
                            </button>
                        </div>
                    </div>
                    <div className="hero-bg-gradient"></div>
                </div>

                {/* Tabs Bar */}
                <div className="tabs-sticky-wrapper">
                    <div className="tabs-container">
                        {SECTIONS.map(section => {
                            const count = (data[section.field || section.id] || []).length;
                            const isActive = activeTab === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => { setActiveTab(section.id); }}
                                    className={`tab-item ${isActive ? 'active' : ''}`}
                                >
                                    <i className={`ph ${isActive ? 'ph-fill' : 'ph-bold'} ${section.icon}`}></i>
                                    <span>{section.label}</span>
                                    {count > 0 && <span className="tab-badge">{count}</span>}
                                    {isActive && <div className="active-indicator"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="content-area container mx-auto">

                    {/* Treks Global Stats */}
                    {activeTab === 'treks' && (
                        <div className="trek-stat-bar">
                            <i className="ph-fill ph-mountains"></i>
                            <span className="trek-stat-value">{totalTrekKms.toFixed(1).replace(/\.0$/, '')} km</span>
                            <span className="trek-stat-label">
                                covered across {currentList.filter(i => i && typeof i === 'object' && i.isVisited).length} visited treks
                            </span>
                        </div>
                    )}

                    {/* Category Filter Bar — only categories present in this list are shown */}
                    <div className="cat-filter">
                        <button
                            onClick={() => setSelectedCategoryFilter('all')}
                            className={`cat-chip ${selectedCategoryFilter === 'all' ? 'is-active' : ''}`}
                        >
                            <i className="ph-bold ph-squares-four"></i>
                            <span>All</span>
                            <span className="cat-chip-count">{currentList.length}</span>
                        </button>

                        {categoriesFor(activeTab).map(cat => {
                            const count = categoryCounts[cat.id] || 0;
                            if (!count) return null;

                            const isActive = selectedCategoryFilter === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategoryFilter(isActive ? 'all' : cat.id)}
                                    className={`cat-chip ${isActive ? 'is-active' : ''}`}
                                    style={isActive
                                        ? { background: cat.color, borderColor: cat.color, boxShadow: `0 4px 14px ${cat.bg}` }
                                        : { '--chip-accent': cat.color }}
                                >
                                    {isActive
                                        ? <i className={`ph-bold ${cat.icon}`}></i>
                                        : <window.CategoryIcon category={cat} size={15} />}
                                    <span>{cat.label}</span>
                                    <span className="cat-chip-count">{count}</span>
                                </button>
                            );
                        })}

                        {uncategorisedCount > 0 && (
                            <button
                                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === '__none' ? 'all' : '__none')}
                                className={`cat-chip is-muted ${selectedCategoryFilter === '__none' ? 'is-active' : ''}`}
                            >
                                <i className="ph-bold ph-tag-simple"></i>
                                <span>Uncategorised</span>
                                <span className="cat-chip-count">{uncategorisedCount}</span>
                            </button>
                        )}
                    </div>

                    {/* Toolbar */}
                    <div className="toolbar-row">
                        <div className="search-wrapper">
                            <i className="ph-bold ph-magnifying-glass"></i>
                            <input
                                type="text"
                                placeholder={`Search in ${activeSection.label}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Enhanced Add Form (Universal) */}
                        <form onSubmit={addItem} className={`add-input-wrapper ${isGridView ? 'grid-mode-extended' : 'universal-extended'} ${(activeTab === 'restaurants' || activeTab === 'treks' || activeTab === 'bucketList') ? 'column-extended' : ''}`}>
                            <div className="form-main-row">
                                <div className="inputs-group">
                                    <input
                                        type="text"
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        placeholder={getPlaceholder()}
                                        className="main-input"
                                    />
                                    <React.Fragment>
                                        <input
                                            type="text"
                                            value={newRemarks}
                                            onChange={(e) => setNewRemarks(e.target.value)}
                                            placeholder={activeTab === 'food' ? "Restaurant..." : "Notes..."}
                                            className="sub-input"
                                        />
                                        <input
                                            type="text"
                                            value={newCity}
                                            onChange={(e) => setNewCity(e.target.value)}
                                            placeholder="City..."
                                            className="sub-input"
                                        />
                                        {DATEABLE_TABS.includes(activeTab) && (
                                            <window.MonthYearPicker
                                                value={newVisitedDate}
                                                onChange={setNewVisitedDate}
                                                className="in-add-form"
                                            />
                                        )}
                                        {activeTab === 'restaurants' && (
                                            <input
                                                type="text"
                                                value={newMapLink}
                                                onChange={(e) => setNewMapLink(e.target.value)}
                                                placeholder="Maps Link (URL)..."
                                                className="sub-input"
                                            />
                                        )}
                                        {activeTab === 'treks' && (
                                            <div className="flex items-center ml-2">
                                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-muted hover:text-text">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={newIsVisited}
                                                        onChange={(e) => setNewIsVisited(e.target.checked)}
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                                                    />
                                                    Visited?
                                                </label>
                                            </div>
                                        )}
                                    </React.Fragment>
                                </div>

                                {/* File Upload for Grid Mode */}
                                {isGridView && (
                                    <div className="file-upload-container">
                                        <label htmlFor="add-image-upload" className={`upload-label ${uploadedImagePath ? 'uploaded' : ''}`}>
                                            <i className={`ph-bold ${uploading ? 'ph-spinner ph-spin' : uploadedImagePath ? 'ph-check' : 'ph-image'}`}></i>
                                        </label>
                                        <input
                                            type="file"
                                            id="add-image-upload"
                                            accept="image/*"
                                            onChange={handleAddFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}

                                <button type="submit" disabled={!newItem.trim() || uploading} className="add-btn">
                                    <i className="ph-bold ph-plus"></i>
                                </button>
                            </div>

                            {/* Category picker — the only category control in this form */}
                            <div className="cat-picker">
                                <span className="cat-picker-label">
                                    Category
                                    {newCategory && (
                                        <button type="button" className="cat-picker-clear" onClick={() => setNewCategory('')}>
                                            clear
                                        </button>
                                    )}
                                </span>
                                <div className="cat-picker-options">
                                    {categoriesFor(activeTab).map(cat => {
                                        const isPicked = newCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                title={cat.label}
                                                onClick={(e) => { e.preventDefault(); setNewCategory(prev => prev === cat.id ? '' : cat.id); }}
                                                className={`cat-chip cat-chip-sm ${isPicked ? 'is-active' : ''}`}
                                                style={isPicked
                                                    ? { background: cat.color, borderColor: cat.color }
                                                    : { '--chip-accent': cat.color }}
                                            >
                                                {isPicked
                                                    ? <i className={`ph-bold ${cat.icon}`}></i>
                                                    : <window.CategoryIcon category={cat} size={14} />}
                                                <span>{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Feature 14: Rating & Review (placesVisited & restaurants) */}
                            {(activeTab === 'placesVisited' || activeTab === 'restaurants') && (
                                <div className="rating-review-section">
                                    <div className="rating-input-row">
                                        <span className="rating-label">Rating</span>
                                        <div className="star-selector">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${star <= newRating ? 'active' : ''}`}
                                                    onClick={(e) => { e.preventDefault(); setNewRating(prev => prev === star ? 0 : star); }}
                                                    title={`${star} star${star > 1 ? 's' : ''}`}
                                                >
                                                    <i className={`ph-fill ph-star`}></i>
                                                </button>
                                            ))}
                                            {newRating > 0 && <span className="rating-value">{newRating}/5</span>}
                                        </div>
                                    </div>
                                    <textarea
                                        className="review-input"
                                        placeholder="Write a short review (optional)..."
                                        value={newReview}
                                        onChange={(e) => setNewReview(e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            )}

                            {/* Feature 3: Photo Upload (placesVisited & bucketList) */}
                            {(activeTab === 'placesVisited' || activeTab === 'bucketList') && isLocalhost && (
                                <div className="photos-upload-section">
                                    <div className="photos-header">
                                        <span className="photos-label"><i className="ph-bold ph-camera"></i> Photos</span>
                                        <label className={`photo-upload-btn ${photoUploading ? 'uploading' : ''}`}>
                                            <i className={`ph-bold ${photoUploading ? 'ph-spinner ph-spin' : 'ph-plus'}`}></i>
                                            Add Photo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    setPhotoUploading(true);
                                                    try {
                                                        const reader = new FileReader();
                                                        reader.onload = async () => {
                                                            try {
                                                                const result = await window.api.uploadImage(reader.result);
                                                                if (result && result.path) {
                                                                    setNewPhotos(prev => [...prev, result.path]);
                                                                }
                                                            } catch (err) {
                                                                console.error('Photo upload failed:', err);
                                                            }
                                                            setPhotoUploading(false);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    } catch (err) {
                                                        console.error('Photo read failed:', err);
                                                        setPhotoUploading(false);
                                                    }
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {newPhotos.length > 0 && (
                                        <div className="photos-preview-grid">
                                            {newPhotos.map((photo, idx) => (
                                                <div key={idx} className="photo-preview-thumb">
                                                    <img src={photo} alt={`Photo ${idx + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="photo-remove-btn"
                                                        onClick={(e) => { e.preventDefault(); setNewPhotos(prev => prev.filter((_, i) => i !== idx)); }}
                                                    >
                                                        <i className="ph-bold ph-x"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dish Manager inside Add Form */}
                            {activeTab === 'restaurants' && (
                                <div className="dish-manager-container">
                                    <div className="dish-manager-label">Add Dishes (Optional)</div>
                                    <div className="dish-inputs">
                                        <input 
                                            type="text" 
                                            className="edit-input" 
                                            placeholder="Dish Name" 
                                            value={newAddDishName} 
                                            onChange={(e) => setNewAddDishName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newAddDishName.trim()) {
                                                        setNewDishes(prev => [...prev, { name: newAddDishName.trim(), rating: newAddDishRating }]);
                                                        setNewAddDishName('');
                                                    }
                                                }
                                            }}
                                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.9rem' }}
                                        />
                                        <select 
                                            className="edit-input"
                                            value={newAddDishRating}
                                            onChange={(e) => setNewAddDishRating(e.target.value)}
                                            style={{ width: '120px', padding: '0.6rem', fontSize: '0.9rem' }}
                                        >
                                            <option value="good">Good</option>
                                            <option value="avg">Avg</option>
                                            <option value="bad">Bad</option>
                                            <option value="others">Others</option>
                                        </select>
                                        <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (newAddDishName.trim()) {
                                                    setNewDishes(prev => [...prev, { name: newAddDishName.trim(), rating: newAddDishRating }]);
                                                    setNewAddDishName('');
                                                }
                                            }} 
                                            className="action-btn success"
                                            style={{ 
                                                width: 'auto', 
                                                height: 'auto', 
                                                padding: '0.5rem 1rem', 
                                                borderRadius: '4px',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                display: 'flex',
                                                gap: '0.3rem'
                                            }}
                                        >
                                            <i className="ph-bold ph-plus"></i> <span>Add</span>
                                        </button>
                                    </div>
                                    {newDishes.length > 0 && (
                                        <div className="dish-list" style={{ marginTop: '0.5rem' }}>
                                            {newDishes.map((dish, i) => (
                                                <div key={i} className={`dish-badge rating-${dish.rating}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <span>{dish.name}</span>
                                                    <i className="ph-bold ph-x" style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setNewDishes(prev => prev.filter((_, idx) => idx !== i))}></i>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Cuisines & Ambience Multi-select */}
                                    <div className="mt-4 border-t border-dashed border-border pt-3">
                                        <div className="mb-3">
                                            <div className="dish-manager-label mb-2">Cuisine</div>
                                            <div className="flex flex-wrap gap-2">
                                                {CUISINE_OPTIONS.map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); setNewCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]) }}
                                                        className={`tag-select-btn ${newCuisines.includes(c) ? 'active' : ''}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="dish-manager-label mb-2">Ambience</div>
                                            <div className="flex flex-wrap gap-2">
                                                {AMBIENCE_OPTIONS.map(a => (
                                                    <button
                                                        key={a}
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); setNewAmbiences(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]) }}
                                                        className={`tag-select-btn ${newAmbiences.includes(a) ? 'active' : ''}`}
                                                    >
                                                        {a}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trek Extra Details inside Add Form */}
                            {activeTab === 'adventures' && (
                                <div className="spec-panel">
                                    <div className="spec-panel-label">Adventure details</div>
                                    <div className="trek-specs-grid">
                                        <input
                                            type="text"
                                            value={newHeight}
                                            onChange={(e) => setNewHeight(e.target.value)}
                                            placeholder="Height (e.g. 83 m)"
                                            className="edit-input"
                                        />
                                        <input
                                            type="text"
                                            value={newTimeTaken}
                                            onChange={(e) => setNewTimeTaken(e.target.value)}
                                            placeholder="Duration (e.g. 15 min)"
                                            className="edit-input"
                                        />
                                        <input
                                            type="text"
                                            value={newOperator}
                                            onChange={(e) => setNewOperator(e.target.value)}
                                            placeholder="Operator"
                                            className="edit-input"
                                        />
                                        <input
                                            type="text"
                                            value={newCost}
                                            onChange={(e) => setNewCost(e.target.value)}
                                            placeholder="Cost"
                                            className="edit-input"
                                        />
                                        <select
                                            value={newDifficulty}
                                            onChange={(e) => setNewDifficulty(e.target.value)}
                                            className="edit-input"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={newMapLink}
                                            onChange={(e) => setNewMapLink(e.target.value)}
                                            placeholder="Maps link (URL)"
                                            className="edit-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'treks' && (
                                <div className="dish-manager-container mt-3 p-4 bg-background-alt rounded-lg border border-border/50">
                                    <div className="dish-manager-label text-sm font-semibold mb-3 flex justify-between items-center">
                                        <span>Trek Specifications</span>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-red-400 hover:text-red-500">
                                            <input 
                                                type="checkbox" 
                                                checked={newSafetyAlerts}
                                                onChange={(e) => setNewSafetyAlerts(e.target.checked)}
                                                className="w-4 h-4 rounded border-border text-red-500 focus:ring-red-500 bg-background"
                                            />
                                            ⚠️ Leech/Safety Alert
                                        </label>
                                    </div>
                                    <div className="trek-specs-grid">
                                        <input
                                            type="text"
                                            value={newDistance}
                                            onChange={(e) => setNewDistance(e.target.value)}
                                            placeholder="Distance (km)"
                                            className="edit-input"
                                        />
                                        <input
                                            type="text"
                                            value={newAltitude}
                                            onChange={(e) => setNewAltitude(e.target.value)}
                                            placeholder="Altitude (ft)"
                                            className="edit-input"
                                        />
                                        <input
                                            type="text"
                                            value={newTimeTaken}
                                            onChange={(e) => setNewTimeTaken(e.target.value)}
                                            placeholder="Time (e.g. 4 hrs)"
                                            className="edit-input"
                                        />
                                        <select
                                            value={newDifficulty}
                                            onChange={(e) => setNewDifficulty(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        
                                        <select
                                            value={newTerrain}
                                            onChange={(e) => setNewTerrain(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            <option value="">Select Terrain</option>
                                            <option value="Forest & Mud Paths">Forest & Mud Paths</option>
                                            <option value="Rocky Paths & Big Stones">Rocky Paths & Big Stones</option>
                                            <option value="Steep Climbs">Steep Climbs</option>
                                            <option value="Stone Steps">Stone Steps</option>
                                            <option value="Snow & Ice Trails">Snow & Ice Trails</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={newBestTime}
                                            onChange={(e) => setNewBestTime(e.target.value)}
                                            placeholder="Best Time (e.g. Sep-Feb)"
                                            className="edit-input"
                                        />
                                        <select
                                            value={newPermit}
                                            onChange={(e) => setNewPermit(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            <option value="No">No Permit Required</option>
                                            <option value="Yes">Permit Required</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={newMapLink}
                                            onChange={(e) => setNewMapLink(e.target.value)}
                                            placeholder="Maps Link (URL)"
                                            className="edit-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Bucket List Details inside Add Form */}
                            {activeTab === 'bucketList' && (
                                <div className="dish-manager-container mt-3 p-4 bg-background-alt rounded-lg border border-border/50">
                                    <div className="dish-manager-label text-sm font-semibold mb-3">Bucket List Specifications</div>
                                    <div className="trek-specs-grid mb-4">
                                        <input
                                            type="text"
                                            value={newTravelDuration}
                                            onChange={(e) => setNewTravelDuration(e.target.value)}
                                            placeholder="Travel Duration (e.g. 2 hrs)"
                                            className="edit-input"
                                        />
                                        <select
                                            value={newSeason}
                                            onChange={(e) => setNewSeason(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <select
                                            value={newPriority}
                                            onChange={(e) => setNewPriority(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <div className="dish-manager-label mb-2">Trip Type / Category</div>
                                        <div className="flex flex-wrap gap-2">
                                            {TRIP_TYPE_OPTIONS.map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setNewTripTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]) }}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${newTripTypes.includes(t) ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary hover:border-primary/50'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stays Details inside Add Form */}
                            {activeTab === 'stays' && (
                                <div className="dish-manager-container mt-3 p-4 bg-background-alt rounded-lg border border-border/50">
                                    <div className="dish-manager-label text-sm font-semibold mb-3">Stay Details</div>
                                    <div className="trek-specs-grid mb-4">
                                        <select
                                            value={newStayType}
                                            onChange={(e) => setNewStayType(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            {STAY_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-muted">In:</span>
                                            <input
                                                type="date"
                                                value={newCheckIn}
                                                onChange={(e) => setNewCheckIn(e.target.value)}
                                                className="edit-input w-full"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-muted">Out:</span>
                                            <input
                                                type="date"
                                                value={newCheckOut}
                                                onChange={(e) => setNewCheckOut(e.target.value)}
                                                className="edit-input w-full"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="dish-manager-label mb-2">Amenities</div>
                                        <div className="flex flex-wrap gap-2">
                                            {AMENITY_OPTIONS.map(a => (
                                                <button
                                                    key={a}
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setNewAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]) }}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${newAmenities.includes(a) ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary hover:border-primary/50'}`}
                                                >
                                                    {a}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Content View */}
                    {isGridView ? (
                        <div className="food-grid-view">
                            {filteredList.length === 0 ? (
                                <div className="empty-state-card">
                                    <i className="ph-duotone ph-pizza"></i>
                                    <p>No food items to try yet.</p>
                                </div>
                            ) : (
                                <div className="food-grid">
                                    {filteredList.map(({ item, index }) => {
                                        const isEditing = editingIndex === index;
                                        const isObj = typeof item === 'object';
                                        const name = isObj ? item.name : item;
                                        const image = (isObj && item.image) ? item.image : null;
                                        const city = (isObj && item.city) ? item.city : '-';
                                        const restaurant = (isObj && item.remarks) ? item.remarks : '-';

                                        if (isEditing) {
                                            return (
                                                <div key={index} className="food-card editing fade-in">
                                                    <div className="card-image-area edit-mode">
                                                        {/* Edit Image Upload */}
                                                        {editItem.image ? (
                                                            <img src={editItem.image} alt="Preview" />
                                                        ) : (
                                                            <div className="placeholder-icon"><i className="ph-duotone ph-image"></i></div>
                                                        )}
                                                        <label htmlFor={`edit-upload-${index}`} className="edit-image-overlay">
                                                            <i className={`ph-bold ${editUploading ? 'ph-spinner ph-spin' : 'ph-camera'}`}></i>
                                                            <span>Change</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            id={`edit-upload-${index}`}
                                                            accept="image/*"
                                                            onChange={handleEditFileChange}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </div>
                                                    <div className="card-info edit-form">
                                                        <input
                                                            value={editItem.name}
                                                            onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                                            placeholder="Dish Name"
                                                            className="edit-field name"
                                                            autoFocus
                                                        />
                                                        <input
                                                            value={editItem.remarks}
                                                            onChange={e => setEditItem({ ...editItem, remarks: e.target.value })}
                                                            placeholder="Restaurant"
                                                            className="edit-field"
                                                        />
                                                        <input
                                                            value={editItem.city}
                                                            onChange={e => setEditItem({ ...editItem, city: e.target.value })}
                                                            placeholder="City"
                                                            className="edit-field"
                                                        />
                                                        {/* The card editor had no category or date control at all,
                                                            so a dish could never be tagged from this view. */}
                                                        <select
                                                            className="edit-field"
                                                            value={editItem.category || ''}
                                                            onChange={e => setEditItem({ ...editItem, category: e.target.value })}
                                                        >
                                                            <option value="">Category (None)</option>
                                                            {categoriesFor(activeTab).map(cat => (
                                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                            ))}
                                                        </select>

                                                        {DATEABLE_TABS.includes(activeTab) && (
                                                            <div className="card-visits">
                                                                <div className="visit-chip-row">
                                                                    {window.getVisitDates(editItem).map(d => (
                                                                        <span key={d} className="visit-chip">
                                                                            {window.formatVisitDate(d)}
                                                                            <button type="button" title="Remove this visit" onClick={() => setEditItem(window.withoutVisitDate(editItem, d))}>
                                                                                <i className="ph-bold ph-x"></i>
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <window.MonthYearPicker
                                                                    value=""
                                                                    onChange={(v) => v && setEditItem(window.withVisitDate(editItem, v))}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="edit-actions">
                                                            <button onClick={() => saveEdit(index)} className="save-btn"><i className="ph-bold ph-check"></i> Save</button>
                                                            <button onClick={cancelEdit} className="cancel-btn"><i className="ph-bold ph-x"></i></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div key={index} className="food-card fade-in-up" style={{ animationDelay: index * 0.05 + 's' }}>
                                                <div className="card-image-area">
                                                    {image ? (
                                                        <img src={image} alt={name} onError={(e) => e.target.style.display = 'none'} />
                                                    ) : (
                                                        <div className="placeholder-icon">
                                                            <i className="ph-duotone ph-fork-knife"></i>
                                                        </div>
                                                    )}
                                                    <div className="card-overlay">
                                                        <button onClick={() => startEdit(index, item)} className="icon-btn-overlay" title="Edit">
                                                            <i className="ph-bold ph-pencil-simple"></i>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setMovingIndex(movingIndex === index ? null : index); }}
                                                            className="icon-btn-overlay"
                                                            title="Move to another state"
                                                        >
                                                            <i className="ph-bold ph-arrows-left-right"></i>
                                                        </button>
                                                        <button onClick={(e) => removeItem(e, index)} className="icon-btn-overlay delete" title="Remove">
                                                            <i className="ph-bold ph-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="card-info">
                                                     <div className="name-cell name-cell-spread">
                                                         <h3>{name}</h3>
                                                         {isObj && item.category && renderCategoryBadge(item.category)}
                                                     </div>
                                                    {(restaurant !== '-' || city !== '-') && (
                                                        <div className="card-details">
                                                            {restaurant !== '-' && <div className="detail-row"><i className="ph-fill ph-storefront"></i> <span>{restaurant}</span></div>}
                                                            {city !== '-' && <div className="detail-row"><i className="ph-fill ph-map-pin"></i> <span>{city}</span></div>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Table View (Default) */
                        <React.Fragment>
                        {DATEABLE_TABS.includes(activeTab) && (
                            <div className={`bulk-date-bar ${dateMode ? 'is-open' : ''}`}>
                                {!dateMode ? (
                                    <button className="bulk-date-start" onClick={() => setDateMode(true)}>
                                        <i className="ph-bold ph-calendar-plus"></i> Set visit dates for several places
                                    </button>
                                ) : (
                                    <React.Fragment>
                                        <span className="bulk-date-count">
                                            {selectedRows.length} selected
                                        </span>
                                        <button
                                            className="bulk-date-all"
                                            onClick={() => setSelectedRows(
                                                selectedRows.length === filteredList.length
                                                    ? []
                                                    : filteredList.map(f => f.index)
                                            )}
                                        >
                                            {selectedRows.length === filteredList.length ? 'Clear all' : `Select all ${filteredList.length}`}
                                        </button>
                                        <window.MonthYearPicker
                                            value={bulkDate}
                                            onChange={setBulkDate}
                                            className="bulk-date-input"
                                        />
                                        <button
                                            className="bulk-date-apply"
                                            disabled={!bulkDate || selectedRows.length === 0}
                                            onClick={applyBulkDate}
                                        >
                                            Apply to {selectedRows.length || 'selected'}
                                        </button>
                                        <button className="bulk-date-cancel" onClick={() => { setDateMode(false); setSelectedRows([]); setBulkDate(''); }}>
                                            Cancel
                                        </button>
                                    </React.Fragment>
                                )}
                            </div>
                        )}

                        <div className="table-card">
                            <table className="details-table">
                                <thead>
                                    <tr>
                                        {dateMode && DATEABLE_TABS.includes(activeTab) && (
                                            <th className="col-pick">
                                                <input
                                                    type="checkbox"
                                                    title="Select all"
                                                    aria-label="Select all places"
                                                    checked={filteredList.length > 0 && selectedRows.length === filteredList.length}
                                                    ref={el => { if (el) el.indeterminate = selectedRows.length > 0 && selectedRows.length < filteredList.length; }}
                                                    onChange={() => setSelectedRows(
                                                        selectedRows.length === filteredList.length ? [] : filteredList.map(f => f.index)
                                                    )}
                                                />
                                            </th>
                                        )}
                                        <th className="col-name">Name / Item</th>
                                        <th className="col-city">Location</th>
                                        <th className="col-remarks">Notes</th>
                                        {activeTab === 'restaurants' && <th className="col-dishes">Dishes</th>}
                                        {activeTab === 'treks' && <th className="col-trek-details">Trek Details</th>}
                                        {activeTab === 'adventures' && <th className="col-adventure-details">Details</th>}
                                        {activeTab === 'bucketList' && <th className="col-bucket-details">Bucket Details</th>}
                                        {activeTab === 'stays' && <th className="col-stay-details">Stay Details</th>}
                                        <th className="col-actions text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan={(activeTab === 'restaurants' || activeTab === 'treks') ? 5 : 4}>
                                                <div className="empty-table-state">
                                                    <i className={`ph-duotone ${activeSection.icon}`}></i>
                                                    <p>No items added yet. Start exploring!</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredList.map(({ item, index }) => {
                                            const isEditing = editingIndex === index;

                                            if (isEditing) {
                                                return (
                                                    <tr key={index} className="edit-row">
                                                        <td className="col-name">
                                                            <input
                                                                type="text"
                                                                className="edit-input mb-2"
                                                                value={editItem.name}
                                                                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                                                                placeholder="Name"
                                                                autoFocus
                                                            />
                                                            <select
                                                                value={editItem.category || ''}
                                                                onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                                                                className="edit-input text-xs mb-2 bg-background"
                                                            >
                                                                <option value="">Category (None)</option>
                                                                {categoriesFor(activeTab).map(cat => (
                                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                                ))}
                                                            </select>
                                                            {DATEABLE_TABS.includes(activeTab) && (
                                                                <div className="visit-editor">
                                                                    <div className="visit-editor-label">Visits</div>
                                                                    <div className="visit-chip-row">
                                                                        {window.getVisitDates(editItem).map(d => (
                                                                            <span key={d} className="visit-chip">
                                                                                {window.formatVisitDate(d)}
                                                                                <button
                                                                                    type="button"
                                                                                    title="Remove this visit"
                                                                                    onClick={() => setEditItem(window.withoutVisitDate(editItem, d))}
                                                                                >
                                                                                    <i className="ph-bold ph-x"></i>
                                                                                </button>
                                                                            </span>
                                                                        ))}
                                                                        {window.getVisitDates(editItem).length === 0 && (
                                                                            <span className="visit-none">None recorded</span>
                                                                        )}
                                                                    </div>
                                                                    <window.MonthYearPicker
                                                                        value=""
                                                                        onChange={(v) => v && setEditItem(window.withVisitDate(editItem, v))}
                                                                        className="in-edit-form"
                                                                    />
                                                                </div>
                                                            )}
                                                            {(activeTab === 'restaurants' || activeTab === 'treks') && (
                                                                <input
                                                                    type="text"
                                                                    className="edit-input text-sm"
                                                                    value={editItem.mapLink || ''}
                                                                    onChange={(e) => setEditItem({ ...editItem, mapLink: e.target.value })}
                                                                    placeholder="Google Maps Link"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="col-city">
                                                            <input
                                                                type="text"
                                                                className="edit-input"
                                                                value={editItem.city}
                                                                onChange={(e) => setEditItem({ ...editItem, city: e.target.value })}
                                                                placeholder="City/Location"
                                                            />
                                                        </td>
                                                        <td className="col-remarks">
                                                            <input
                                                                type="text"
                                                                className="edit-input"
                                                                value={editItem.remarks}
                                                                onChange={(e) => setEditItem({ ...editItem, remarks: e.target.value })}
                                                                placeholder="Notes/Remarks"
                                                            />
                                                        </td>
                                                        {activeTab === 'adventures' && (
                                                            <td className="col-adventure-details">
                                                                <div className="detail-grid">
                                                                    <input className="edit-input detail-input" placeholder="Height" value={editItem.height || ''} onChange={(e) => setEditItem({ ...editItem, height: e.target.value })} />
                                                                    <input className="edit-input detail-input" placeholder="Duration" value={editItem.timeTaken || ''} onChange={(e) => setEditItem({ ...editItem, timeTaken: e.target.value })} />
                                                                    <select className="edit-input detail-input" value={editItem.difficulty || 'Beginner'} onChange={(e) => setEditItem({ ...editItem, difficulty: e.target.value })}>
                                                                        <option value="Beginner">Beginner</option>
                                                                        <option value="Medium">Medium</option>
                                                                        <option value="Hard">Hard</option>
                                                                    </select>
                                                                    <input className="edit-input detail-input" placeholder="Operator" value={editItem.operator || ''} onChange={(e) => setEditItem({ ...editItem, operator: e.target.value })} />
                                                                    <input className="edit-input detail-input" placeholder="Cost" value={editItem.cost || ''} onChange={(e) => setEditItem({ ...editItem, cost: e.target.value })} />
                                                                    <input className="edit-input detail-input" placeholder="Maps link" value={editItem.mapLink || ''} onChange={(e) => setEditItem({ ...editItem, mapLink: e.target.value })} />
                                                                </div>
                                                            </td>
                                                        )}
                                                        {activeTab === 'treks' && (
                                                            <td className="col-trek-details">
                                                                <div className="detail-grid">
                                                                    <input type="text" className="edit-input detail-input" value={editItem.distance || ''} onChange={(e) => setEditItem({ ...editItem, distance: e.target.value })} placeholder="Dist (km)" />
                                                                    <input type="text" className="edit-input detail-input" value={editItem.altitude || ''} onChange={(e) => setEditItem({ ...editItem, altitude: e.target.value })} placeholder="Alt (ft)" />
                                                                    <select className="edit-input detail-input" value={editItem.difficulty || 'Beginner'} onChange={(e) => setEditItem({ ...editItem, difficulty: e.target.value })}>
                                                                        <option value="Beginner">Beg</option>
                                                                        <option value="Medium">Med</option>
                                                                        <option value="Hard">Hard</option>
                                                                    </select>
                                                                    <input type="text" className="edit-input detail-input" value={editItem.timeTaken || ''} onChange={(e) => setEditItem({ ...editItem, timeTaken: e.target.value })} placeholder="Time" />
                                                                    <select className="edit-input detail-input" value={editItem.terrain || ''} onChange={(e) => setEditItem({ ...editItem, terrain: e.target.value })}>
                                                                        <option value="">Select Terrain</option>
                                                                        <option value="Forest & Mud Paths">Forest & Mud Paths</option>
                                                                        <option value="Rocky Paths & Big Stones">Rocky Paths & Big Stones</option>
                                                                        <option value="Steep Climbs">Steep Climbs</option>
                                                                        <option value="Stone Steps">Stone Steps</option>
                                                                        <option value="Snow & Ice Trails">Snow & Ice Trails</option>
                                                                    </select>
                                                                    <input type="text" className="edit-input detail-input" value={editItem.bestTime || ''} onChange={(e) => setEditItem({ ...editItem, bestTime: e.target.value })} placeholder="Season" />
                                                                    <select className="edit-input detail-input" value={editItem.permit || 'No'} onChange={(e) => setEditItem({ ...editItem, permit: e.target.value })}>
                                                                        <option value="No">No Permit</option>
                                                                        <option value="Yes">Permit Reqd</option>
                                                                    </select>
                                                                    <label className="flex items-center gap-1 text-xs text-red-500 whitespace-nowrap overflow-hidden">
                                                                        <input type="checkbox" checked={editItem.safetyAlerts || false} onChange={(e) => setEditItem({ ...editItem, safetyAlerts: e.target.checked })} />
                                                                        Alert
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        )}
                                                        {activeTab === 'restaurants' && (
                                                            <td className="col-dishes">
                                                                <div className="dish-manager mb-2">
                                                                    <div className="dish-inputs flex gap-1 mb-2">
                                                                        <input 
                                                                            type="text" 
                                                                            className="edit-input flex-1 p-1 text-sm" 
                                                                            placeholder="Dish" 
                                                                            value={newDishName} 
                                                                            onChange={(e) => setNewDishName(e.target.value)}
                                                                            onKeyDown={(e) => e.key === 'Enter' && addDishToEdit(e)}
                                                                        />
                                                                        <select 
                                                                            className="edit-input w-20 p-1 text-sm bg-transparent"
                                                                            value={newDishRating}
                                                                            onChange={(e) => setNewDishRating(e.target.value)}
                                                                        >
                                                                            <option value="good">Good</option>
                                                                            <option value="avg">Avg</option>
                                                                            <option value="bad">Bad</option>
                                                                            <option value="others">Others</option>
                                                                        </select>
                                                                        <button type="button" onClick={addDishToEdit} className="action-btn success w-8 h-8"><i className="ph-bold ph-plus"></i></button>
                                                                    </div>
                                                                    <div className="dish-list flex flex-wrap gap-1">
                                                                        {(editItem.dishes || []).map((dish, i) => (
                                                                            <div key={i} className={`dish-badge rating-${dish.rating} flex items-center gap-1`}>
                                                                                <span>{dish.name}</span>
                                                                                <i className="ph-bold ph-x cursor-pointer opacity-70 hover:opacity-100" onClick={() => removeDishFromEdit(i)}></i>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="border-t border-border/50 pt-2 mb-2">
                                                                    <div className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Cuisines</div>
                                                                    <div className="detail-chips">
                                                                        {CUISINE_OPTIONS.map(c => (
                                                                            <button
                                                                                key={c}
                                                                                type="button"
                                                                                onClick={(e) => { e.preventDefault(); setEditItem(prev => ({ ...prev, cuisines: (prev.cuisines || []).includes(c) ? (prev.cuisines || []).filter(x => x !== c) : [...(prev.cuisines || []), c] })) }}
                                                                                className={`tag-select-btn ${(editItem.cuisines || []).includes(c) ? 'active' : ''}`}
                                                                            >
                                                                                {c}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="border-t border-border/50 pt-2">
                                                                    <div className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Ambiences</div>
                                                                    <div className="detail-chips">
                                                                        {AMBIENCE_OPTIONS.map(a => (
                                                                            <button
                                                                                key={a}
                                                                                type="button"
                                                                                onClick={(e) => { e.preventDefault(); setEditItem(prev => ({ ...prev, ambiences: (prev.ambiences || []).includes(a) ? (prev.ambiences || []).filter(x => x !== a) : [...(prev.ambiences || []), a] })) }}
                                                                                className={`tag-select-btn ${(editItem.ambiences || []).includes(a) ? 'active' : ''}`}
                                                                            >
                                                                                {a}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}
                                                        {activeTab === 'bucketList' && (
                                                            <td className="col-bucket-details">
                                                                <div className="detail-grid">
                                                                    <input type="text" className="edit-input detail-input" value={editItem.travelDuration || ''} onChange={(e) => setEditItem({ ...editItem, travelDuration: e.target.value })} placeholder="Duration (e.g. 2 hrs)" />
                                                                    <select className="edit-input detail-input" value={editItem.season || 'All Year'} onChange={(e) => setEditItem({ ...editItem, season: e.target.value })}>
                                                                        {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                                    </select>
                                                                    <select className="edit-input detail-input" value={editItem.priority || 'Medium'} onChange={(e) => setEditItem({ ...editItem, priority: e.target.value })}>
                                                                        {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="detail-chips">
                                                                    {TRIP_TYPE_OPTIONS.map(t => (
                                                                        <button
                                                                            key={t}
                                                                            type="button"
                                                                            onClick={(e) => { e.preventDefault(); setEditItem(prev => ({...prev, tripTypes: (prev.tripTypes || []).includes(t) ? prev.tripTypes.filter(x => x !== t) : [...(prev.tripTypes||[]), t]})) }}
                                                                            className={`detail-chip ${(editItem.tripTypes||[]).includes(t) ? 'is-on' : ''}`}
                                                                        >
                                                                            {t}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        )}
                                                        {activeTab === 'stays' && (
                                                            <td className="col-stay-details">
                                                                <div className="detail-grid">
                                                                    <select className="edit-input detail-input" value={editItem.stayType || 'Hotel'} onChange={(e) => setEditItem({ ...editItem, stayType: e.target.value })}>
                                                                        {STAY_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                                    </select>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="detail-label">In:</span>
                                                                        <input type="date" className="edit-input detail-input" value={editItem.checkIn || ''} onChange={(e) => setEditItem({ ...editItem, checkIn: e.target.value })} />
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="detail-label">Out:</span>
                                                                        <input type="date" className="edit-input detail-input" value={editItem.checkOut || ''} onChange={(e) => setEditItem({ ...editItem, checkOut: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                                <div className="detail-chips">
                                                                    {AMENITY_OPTIONS.map(a => (
                                                                        <button
                                                                            key={a}
                                                                            type="button"
                                                                            onClick={(e) => { e.preventDefault(); setEditItem(prev => ({...prev, amenities: (prev.amenities || []).includes(a) ? prev.amenities.filter(x => x !== a) : [...(prev.amenities||[]), a]})) }}
                                                                            className={`detail-chip ${(editItem.amenities||[]).includes(a) ? 'is-on' : ''}`}
                                                                        >
                                                                            {a}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        )}
                                                        <td className="text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <button onClick={() => saveEdit(index)} className="action-btn success" title="Save">
                                                                    <i className="ph-bold ph-check"></i>
                                                                </button>
                                                                <button onClick={cancelEdit} className="action-btn cancel" title="Cancel">
                                                                    <i className="ph-bold ph-x"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            const isObj = typeof item === 'object' && item !== null;
                                            const name = isObj ? item.name : item;
                                            const city = isObj ? item.city : '-';
                                            const remarks = isObj ? item.remarks : '-';
                                            const dishes = (isObj && item.dishes) ? item.dishes : [];
                                            const distance = isObj ? item.distance : '';
                                            const altitude = isObj ? item.altitude : '';
                                            const difficulty = isObj ? item.difficulty : 'Beginner';
                                            const bestTime = isObj ? item.bestTime : '';
                                            const timeTaken = isObj ? item.timeTaken : '';
                                            const terrain = isObj ? item.terrain : '';
                                            const permit = isObj ? item.permit : 'No';
                                            const safetyAlerts = isObj ? item.safetyAlerts : false;
                                            const isVisited = isObj ? item.isVisited : false;

                                            return (
                                                <tr key={index} className={`fade-in-up ${dateMode && selectedRows.includes(index) ? 'is-picked' : ''}`}>
                                                    {dateMode && DATEABLE_TABS.includes(activeTab) && (
                                                        <td className="col-pick">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.includes(index)}
                                                                onChange={() => toggleRowSelected(index)}
                                                                aria-label={`Select ${name}`}
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="col-name">
                                                        <div className="name-cell">
                                                            <span className="name-cell-title">{name}</span>
                                                            {isObj && window.getVisitDates(item).length > 0 && (() => {
                                                                const visits = window.getVisitDates(item);
                                                                return (
                                                                    <span
                                                                        className="visit-date"
                                                                        title={`Visited ${visits.map(window.formatVisitDate).join(', ')}`}
                                                                    >
                                                                        <i className="ph-bold ph-calendar-blank"></i>
                                                                        {window.formatVisitDate(visits[0])}
                                                                        {visits.length > 1 && <em className="visit-count">×{visits.length}</em>}
                                                                    </span>
                                                                );
                                                            })()}
                                                            {isObj && item.category && renderCategoryBadge(item.category)}
                                                            {isObj && item.mapLink && (
                                                                <a href={item.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center p-1 rounded-full hover:bg-blue-500/10" title="View on Google Maps">
                                                                    <i className="ph-fill ph-map-pin text-xl"></i>
                                                                </a>
                                                            )}
                                                            {activeTab === 'treks' && (
                                                                <div className="flex items-center">
                                                                    <i className={`ph-fill ${isVisited ? 'ph-check-circle text-green-500' : 'ph-circle text-text-muted/50'} text-xl cursor-pointer hover:opacity-80 transition-opacity`} 
                                                                       onClick={() => {
                                                                           const list = [...(data[dataField] || [])];
                                                                           const currentItem = list[index];
                                                                           if (typeof currentItem === 'string') {
                                                                               list[index] = { name: currentItem, isVisited: true };
                                                                           } else {
                                                                               list[index] = { ...currentItem, isVisited: !currentItem.isVisited };
                                                                           }
                                                                           handleSave({ [dataField]: list });
                                                                       }} 
                                                                       title={isVisited ? "Mark as Not Visited" : "Mark as Visited"}></i>
                                                                </div>
                                                            )}
                                                            {/* Feature 14: Star Rating Display */}
                                                            {isObj && item.rating > 0 && (
                                                                <div className="star-display">
                                                                    {[1, 2, 3, 4, 5].map(s => (
                                                                        <i key={s} className={`ph-fill ph-star ${s <= item.rating ? 'star-filled' : 'star-empty'}`}></i>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {/* Feature 14: Review indicator */}
                                                            {isObj && item.review && item.review.trim() && (
                                                                <span className="review-indicator" title={item.review}>
                                                                    <i className="ph-fill ph-chat-dots"></i>
                                                                </span>
                                                            )}
                                                            {/* Feature 3: Photo count badge */}
                                                            {isObj && item.photos && item.photos.length > 0 && (
                                                                <button
                                                                    type="button"
                                                                    className="photo-count-badge"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setLightboxPhotos(item.photos);
                                                                        setLightboxIndex(0);
                                                                        setLightboxOpen(true);
                                                                    }}
                                                                    title={`View ${item.photos.length} photo${item.photos.length > 1 ? 's' : ''}`}
                                                                >
                                                                    <i className="ph-fill ph-camera"></i> {item.photos.length}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="col-city">
                                                        <div className="cell-wrapper">
                                                            {city !== '-' && <i className="ph-fill ph-map-pin text-primary/60"></i>}
                                                            <span className={city === '-' ? 'text-disabled' : ''}>{city}</span>
                                                        </div>
                                                    </td>
                                                    <td className="col-remarks">
                                                        <span className={remarks === '-' ? 'text-disabled' : 'text-secondary'}>{remarks}</span>
                                                    </td>
                                                    {activeTab === 'restaurants' && (
                                                        <td className="col-dishes">
                                                            <div className="dish-list flex flex-wrap gap-1 mb-1">
                                                                {dishes.map((dish, i) => (
                                                                    <span key={i} className={`dish-badge rating-${dish.rating}`}>
                                                                        {dish.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="dish-list flex flex-wrap gap-1">
                                                                {(isObj && item.cuisines ? item.cuisines : []).map((c, i) => (
                                                                    <span key={'c'+i} className="dish-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                                                        <i className="ph-bold ph-bowl-food"></i> {c}
                                                                    </span>
                                                                ))}
                                                                {(isObj && item.ambiences ? item.ambiences : []).map((a, i) => (
                                                                    <span key={'a'+i} className="dish-badge" style={{ backgroundColor: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>
                                                                        <i className="ph-bold ph-sparkle"></i> {a}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {activeTab === 'adventures' && (
                                                        <td className="col-adventure-details">
                                                            <div className="detail-chips">
                                                                {isObj && item.height && <span className="fact-badge"><i className="ph-bold ph-arrows-vertical"></i>{item.height}</span>}
                                                                {isObj && item.timeTaken && <span className="fact-badge"><i className="ph-bold ph-clock"></i>{item.timeTaken}</span>}
                                                                {isObj && item.difficulty && <span className="fact-badge"><i className="ph-bold ph-gauge"></i>{item.difficulty}</span>}
                                                                {isObj && item.cost && <span className="fact-badge"><i className="ph-bold ph-currency-inr"></i>{item.cost}</span>}
                                                                {isObj && item.operator && <span className="fact-badge"><i className="ph-bold ph-storefront"></i>{item.operator}</span>}
                                                                {isObj && item.mapLink && (
                                                                    <a href={item.mapLink} target="_blank" rel="noopener noreferrer" className="fact-badge is-link" title="Open in Maps">
                                                                        <i className="ph-fill ph-map-pin"></i> Map
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {activeTab === 'treks' && (
                                                        <td className="col-trek-details">
                                                            <div className="dish-list flex flex-wrap gap-1">
                                                                <span className="dish-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                                                    <i className="ph-bold ph-ruler"></i> {distance ? (String(distance).toLowerCase().includes('km') ? distance : `${distance} km`) : '-'}
                                                                </span>
                                                                <span className="dish-badge" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                                                    <i className="ph-bold ph-mountains"></i> {altitude ? (String(altitude).toLowerCase().includes('ft') ? altitude : `${altitude} ft`) : '-'}
                                                                </span>
                                                                {timeTaken && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                                                        <i className="ph-bold ph-clock"></i> {timeTaken}
                                                                    </span>
                                                                )}
                                                                <span className="dish-badge" style={{
                                                                    backgroundColor: difficulty === 'Hard' ? 'rgba(239,68,68,0.2)' : difficulty === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                                                                    color: difficulty === 'Hard' ? '#ef4444' : difficulty === 'Medium' ? '#f59e0b' : '#10b981'
                                                                }}>
                                                                    <i className="ph-bold ph-barbell"></i> {difficulty}
                                                                </span>
                                                                {bestTime && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                                        <i className="ph-bold ph-calendar"></i> {bestTime}
                                                                    </span>
                                                                )}
                                                                {terrain && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(168,162,158,0.2)', color: '#78716c' }}>
                                                                        <i className="ph-bold ph-tree"></i> {terrain}
                                                                    </span>
                                                                )}
                                                                {permit === 'Yes' && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(217,119,6,0.15)', color: '#d97706' }}>
                                                                        <i className="ph-bold ph-ticket"></i> Permit Reqd
                                                                    </span>
                                                                )}
                                                                {safetyAlerts && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', animation: 'pulse 2s infinite' }}>
                                                                        <i className="ph-fill ph-warning"></i> Alert
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {activeTab === 'bucketList' && (
                                                        <td className="col-bucket-details">
                                                            <div className="dish-list flex flex-wrap gap-1">
                                                                {isObj && item.priority && (
                                                                    <span className="dish-badge" style={{
                                                                        backgroundColor: item.priority === 'High' ? 'rgba(239,68,68,0.2)' : item.priority === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                                                                        color: item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#10b981'
                                                                    }}>
                                                                        <i className="ph-bold ph-flag"></i> {item.priority}
                                                                    </span>
                                                                )}
                                                                {isObj && item.travelDuration && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                                                        <i className="ph-bold ph-car"></i> {item.travelDuration}
                                                                    </span>
                                                                )}
                                                                {isObj && item.season && item.season !== 'All Year' && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                                        <i className="ph-bold ph-cloud-sun"></i> {item.season}
                                                                    </span>
                                                                )}
                                                                {(isObj && item.tripTypes ? item.tripTypes : []).map((t, i) => (
                                                                    <span key={'t'+i} className="dish-badge" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                                                        <i className="ph-bold ph-tag"></i> {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {activeTab === 'stays' && (
                                                        <td className="col-stay-details">
                                                            <div className="dish-list flex flex-wrap gap-1">
                                                                {isObj && item.stayType && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                                                        <i className="ph-bold ph-bed"></i> {item.stayType}
                                                                    </span>
                                                                )}
                                                                {isObj && item.checkIn && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                                        <i className="ph-bold ph-calendar-plus"></i> {item.checkIn}
                                                                    </span>
                                                                )}
                                                                {isObj && item.checkOut && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                                                                        <i className="ph-bold ph-calendar-minus"></i> {item.checkOut}
                                                                    </span>
                                                                )}
                                                                {(isObj && item.amenities ? item.amenities : []).map((a, i) => (
                                                                    <span key={'a'+i} className="dish-badge" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                                                        {a}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="text-right">
                                                        <div className="action-group">
                                                            {activeTab === 'bucketList' && (
                                                                <React.Fragment>
                                                                    <button
                                                                        onClick={(e) => moveToVisited(e, index, 'placesVisited')}
                                                                        className="action-btn"
                                                                        style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}
                                                                        title="Move to Places Visited"
                                                                    >
                                                                        <i className="ph-bold ph-map-pin"></i>
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => moveToVisited(e, index, 'treks')}
                                                                        className="action-btn"
                                                                        style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}
                                                                        title="Move to Treks"
                                                                    >
                                                                        <i className="ph-bold ph-mountains"></i>
                                                                    </button>
                                                                </React.Fragment>
                                                            )}
                                                            <button
                                                                onClick={(e) => toggleHighlight(e, item)}
                                                                className="action-btn"
                                                                style={{ 
                                                                    color: (data.highlights || []).some(h => (typeof h === 'object' ? h.name : h) === name) ? '#eab308' : 'var(--text-muted)', 
                                                                    background: (data.highlights || []).some(h => (typeof h === 'object' ? h.name : h) === name) ? 'rgba(234,179,8,0.1)' : 'var(--background-alt)' 
                                                                }}
                                                                title={(data.highlights || []).some(h => (typeof h === 'object' ? h.name : h) === name) ? "Remove from Highlights" : "Add to Highlights"}
                                                            >
                                                                <i className={(data.highlights || []).some(h => (typeof h === 'object' ? h.name : h) === name) ? "ph-fill ph-star" : "ph-bold ph-star"}></i>
                                                            </button>
                                                            <button
                                                                onClick={() => startEdit(index, item)}
                                                                className="action-btn edit"
                                                                title="Edit Item"
                                                            >
                                                                <i className="ph-bold ph-pencil-simple"></i>
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setMovingIndex(movingIndex === index ? null : index); }}
                                                                className={`action-btn move ${movingIndex === index ? 'is-open' : ''}`}
                                                                title="Move to another state"
                                                            >
                                                                <i className="ph-bold ph-arrows-left-right"></i>
                                                            </button>
                                                            <button
                                                                onClick={(e) => removeItem(e, index)}
                                                                className="action-btn delete"
                                                                title="Delete Item"
                                                            >
                                                                <i className="ph-bold ph-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        </React.Fragment>
                    )}
                </div>

                {/* Feature 3: Photo Lightbox Modal */}
                {lightboxOpen && lightboxPhotos.length > 0 && (
                    <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
                        <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
                                <i className="ph-bold ph-x"></i>
                            </button>
                            <div className="lightbox-image-wrapper">
                                <img src={lightboxPhotos[lightboxIndex]} alt={`Photo ${lightboxIndex + 1}`} className="lightbox-image" />
                            </div>
                            <div className="lightbox-controls">
                                <button
                                    className="lightbox-nav"
                                    disabled={lightboxIndex === 0}
                                    onClick={() => setLightboxIndex(prev => Math.max(0, prev - 1))}
                                >
                                    <i className="ph-bold ph-caret-left"></i>
                                </button>
                                <span className="lightbox-counter">{lightboxIndex + 1} of {lightboxPhotos.length}</span>
                                <button
                                    className="lightbox-nav"
                                    disabled={lightboxIndex === lightboxPhotos.length - 1}
                                    onClick={() => setLightboxIndex(prev => Math.min(lightboxPhotos.length - 1, prev + 1))}
                                >
                                    <i className="ph-bold ph-caret-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {movingIndex !== null && (() => {
                    const list = (data && data[dataField]) || [];
                    const target = list[movingIndex];
                    if (!target) return null;
                    const label = (typeof target === 'object' && target ? target.name : target) || 'this item';
                    return (
                        <MovePicker
                            itemName={label}
                            currentRegion={stateName}
                            sections={SECTIONS
                                .map(sec => ({ ...sec, field: sec.field || sec.id }))
                                .filter(sec => sec.field !== dataField)}
                            onPick={(dest) => moveItemTo(movingIndex, dest)}
                            onPickSection={(field) => moveItemToSection(movingIndex, field)}
                            onCancel={() => setMovingIndex(null)}
                        />
                    );
                })()}

                <style>{`
                    .state-details-container {
                        min-height: 100vh;
                        background: var(--bg-app);
                        display: flex;
                        flex-direction: column;
                    }
                    /* ... (Styles omitted for brevity, keeping same styles) ... */
                    /* Reincluding previous styles to ensure consistency if file overwrite happened */
                    
                    /* Hero Section */
                    .details-hero {
                        position: relative;
                        padding: 2rem 2rem 1rem;
                        background: var(--bg-surface);
                        border-bottom: 1px solid var(--border);
                        overflow: hidden;
                    }

                    .hero-content {
                        position: relative;
                        z-index: 2;
                        max-width: 1200px;
                        margin: 0 auto;
                    }

                    .hero-bg-gradient {
                        position: absolute;
                        top: -50%;
                        right: -10%;
                        width: 600px;
                        height: 600px;
                        background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(0,0,0,0) 70%);
                        z-index: 1;
                        pointer-events: none;
                    }

                    .back-btn {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        background: none;
                        border: none;
                        color: var(--text-muted);
                        cursor: pointer;
                        font-family: inherit;
                        font-size: 0.9rem;
                        margin-bottom: 1.5rem;
                        transition: color 0.2s;
                    }

                    .back-btn:hover {
                        color: var(--text-primary);
                    }

                    .icon-circle {
                        width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                    }

                    .title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }

                    .state-title {
                        font-size: 3rem; font-weight: 800; letter-spacing: -0.05em;
                        background: linear-gradient(to right, #fff, #bfdbfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;
                    }

                    .visited-toggle {
                        background: var(--bg-surface-hover); border: 1px solid var(--border); color: var(--text-secondary); padding: 0.6rem 1.25rem;
                        border-radius: 100px; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; font-weight: 500;
                    }
                    .visited-toggle:hover { background: var(--bg-accent); color: var(--text-primary); }
                    .visited-toggle.is-visited { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }

                    /* Sticky Tabs */
                    .tabs-sticky-wrapper {
                        position: sticky; top: 0; z-index: 50; background: rgba(24, 27, 33, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 1rem;
                    }
                    .tabs-container { max-width: 1200px; margin: 0 auto; display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none; }
                    .tabs-container::-webkit-scrollbar { display: none; }

                    .tab-item {
                        background: none; border: none; padding: 1.25rem 1rem; color: var(--text-muted); font-weight: 500; cursor: pointer;
                        display: flex; align-items: center; gap: 0.6rem; position: relative; white-space: nowrap; transition: color 0.2s;
                    }
                    .tab-item:hover { color: var(--text-primary); }
                    .tab-item.active { color: var(--primary); }
                    .active-indicator { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: var(--primary); border-radius: 3px 3px 0 0; box-shadow: 0 -2px 10px rgba(124, 58, 237, 0.5); }
                    .tab-badge { background: var(--bg-surface-hover); color: var(--text-primary); font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 10px; min-width: 1.5em; text-align: center; }
                    .tab-item.active .tab-badge { background: var(--primary); color: white; }

                    /* Content */
                    .content-area { padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
                    .toolbar-row { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
                    
                    .search-wrapper { flex: 1; min-width: 250px; position: relative; }
                    .search-wrapper i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                    .search-wrapper input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); color: var(--text-primary); transition: all 0.2s; }
                    .search-wrapper input:focus { outline: none; border-color: var(--primary); background: var(--bg-app); box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1); }

                    /* Layout for Add Form */
                    .add-input-wrapper {
                        display: flex; gap: 0.5rem; background: var(--bg-surface); padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius-lg);
                        align-items: center;
                        min-width: 400px;
                    }
                    .add-input-wrapper.grid-mode-extended { flex: 2; }
                    .add-input-wrapper.universal-extended { flex: 2; } /* Make wider normally too */
                    .add-input-wrapper.column-extended {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 1.25rem;
                        gap: 1rem;
                    }

                    .form-main-row { display: flex; width: 100%; gap: 0.5rem; align-items: center; }

                    .dish-manager-container {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        border-top: 1px dashed var(--border);
                        padding-top: 1rem;
                    }
                    .dish-manager-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 0.25rem; }
                    .dish-inputs { display: flex; gap: 0.5rem; }
                    
                    .trek-specs-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                        gap: 0.75rem;
                    }

                    .inputs-group { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; flex: 1; }
                    .add-input-wrapper input { background: transparent; border: none; color: var(--text-primary); }
                    .add-input-wrapper .main-input { width: 100%; font-weight: 500; font-size: 1rem; border-bottom: 1px dashed var(--border); padding-bottom: 0.5rem; }
                    .add-input-wrapper .sub-input { flex: 1; min-width: 120px; font-size: 0.9rem; padding-top: 0.2rem; color: var(--text-secondary); }
                    .add-input-wrapper input:focus { outline: none; }

                    .file-upload-container { padding: 0 0.5rem; border-left: 1px solid var(--border); }
                    .upload-label { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-surface-hover); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
                    .upload-label:hover { background: var(--bg-accent); color: var(--text-primary); }
                    .upload-label.uploaded { background: rgba(16, 185, 129, 0.15); color: #10b981; }

                    .add-btn { background: var(--primary); color: white; border: none; border-radius: var(--radius-md); width: 42px; height: 42px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: background 0.2s; }
                    .add-btn:hover { background: var(--primary-hover); }
                    .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                    /* Table Styles */
                    .table-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-lg); }
                    .details-table { width: 100%; border-collapse: collapse; }
                    .details-table th, .details-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); text-align: left; }
                    .details-table th { background: rgba(255,255,255,0.02); color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
                    .details-table tr:hover td { background: rgba(255,255,255,0.03); }
                    .details-table input { background: var(--bg-app); border: 1px solid var(--border); color: var(--text-primary); padding: 0.4rem; border-radius: 4px; width: 100%; }
                    .text-right { text-align: right; }
                    .col-name { width: 26%; } .col-city { width: 12%; } .col-remarks { width: 16%; } .col-dishes { width: 24%; } .col-actions { width: 10%; }
                    .col-bucket-details, .col-stay-details, .col-trek-details { width: 26%; min-width: 220px; }
                    .cell-wrapper { display: flex; align-items: center; gap: 0.5rem; }
                    
                    .dish-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.35rem;
                    }
                    .dish-badge {
                        font-size: 0.75rem;
                        padding: 0.2rem 0.5rem;
                        border-radius: 12px;
                        white-space: nowrap;
                        color: #fff;
                        font-weight: 500;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.25rem;
                    }
                    .rating-good { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
                    .rating-avg { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
                    .rating-bad { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
                    .rating-others { background: rgba(148, 163, 184, 0.2); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }
                    
                    .dish-manager select option {
                        background: var(--bg-surface);
                        color: var(--text-primary);
                    }
                    .text-disabled { color: var(--text-muted); opacity: 0.5; font-style: italic; }
                    .text-secondary { color: var(--text-secondary); }

                    /* Action Buttons */
                    .action-group { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; opacity: 0; transform: translateX(10px); transition: all 0.2s; }
                    .details-table tr:hover .action-group { opacity: 1; transform: translateX(0); }
                    .action-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
                    .action-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
                    .action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                    .action-btn.edit:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                    .action-btn.success { color: #10b981; } .action-btn.success:hover { background: rgba(16, 185, 129, 0.1); }
                    .action-btn.cancel { color: #94a3b8; } .action-btn.cancel:hover { background: rgba(255,255,255,0.1); }

                    .edit-row { background: rgba(255, 255, 255, 0.02); }
                    .edit-input { width: 100%; background: var(--bg-app); border: 1px solid var(--primary); padding: 0.5rem; border-radius: var(--radius-sm); color: var(--text-primary); font-family: inherit; font-size: 1rem; }
                    .edit-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); }
                    
                    .empty-table-state { padding: 6rem 2rem; text-align: center; color: var(--text-muted); }
                    .empty-table-state i { font-size: 3.5rem; margin-bottom: 1.5rem; opacity: 0.3; }
                    .empty-table-state p { font-size: 1.1rem; }

                    /* Grid View Styles */
                    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                    .food-card { background: var(--bg-surface); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
                    .food-card:not(.editing):hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
                    
                    .card-image-area { aspect-ratio: 4/3; background: #1e1e24; position: relative; overflow: hidden; }
                    .card-image-area img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
                    .food-card:hover .card-image-area img { transform: scale(1.05); }
                    .placeholder-icon { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem; color: var(--text-muted); opacity: 0.3; }
                    
                    .card-overlay { position: absolute; top: 0; right: 0; padding: 0.5rem; display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; z-index: 2; }
                    .food-card:hover .card-overlay { opacity: 1; }
                    .icon-btn-overlay { background: rgba(0,0,0,0.6); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: 0.2s; }
                    .icon-btn-overlay:hover { background: var(--primary); } .icon-btn-overlay.delete:hover { background: #ef4444; }
                    
                    .card-info { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
                    .card-info h3 { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
                    .card-details { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; color: var(--text-secondary); }
                    .detail-row { display: flex; align-items: center; gap: 0.5rem; }
                    .detail-row i { color: var(--primary); opacity: 0.8; }
                    
                    .food-card.editing { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); }
                    .card-image-area.edit-mode .edit-image-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
                    .card-image-area.edit-mode:hover .edit-image-overlay { opacity: 1; }
                    
                    .edit-form { gap: 0.5rem; }
                    .edit-field { background: var(--bg-app); border: 1px solid var(--border); color: var(--text-primary); padding: 0.5rem; border-radius: 4px; width: 100%; }
                    .edit-field:focus { outline: none; border-color: var(--primary); }
                    .edit-field.name { font-weight: 600; }
                    .edit-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
                    .save-btn, .cancel-btn { flex: 1; padding: 0.5rem; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; }
                    .save-btn { background: var(--primary); color: white; } .cancel-btn { background: var(--bg-surface-hover); color: var(--text-muted); }

                    .empty-state-card { grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
                    .empty-state-card i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; display: block; }
                    
                    /* Utility */
                    .fade-in { animation: fadeIn 0.4s ease-out; }
                    .fade-in-up { animation: fadeInUp 0.4s ease-out backwards; }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                    /* ----- Category chips (filter bar + add-form picker) -----
                       This file was written with Tailwind utility classes, but no
                       Tailwind build is loaded, so those classes rendered as bare
                       browser buttons. These are real styles for the same UI. */
                    .cat-filter {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        margin-bottom: 1.25rem;
                        padding-bottom: 0.35rem;
                        overflow-x: auto;
                        scrollbar-width: thin;
                        scrollbar-color: rgba(255,255,255,0.12) transparent;
                    }

                    .cat-filter::-webkit-scrollbar { height: 4px; }
                    .cat-filter::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }

                    .cat-chip {
                        --chip-accent: var(--primary);
                        flex: 0 0 auto;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.4rem;
                        padding: 0.4rem 0.85rem;
                        border-radius: 99px;
                        border: 1px solid var(--border);
                        background: rgba(255, 255, 255, 0.035);
                        color: var(--text-secondary);
                        font-family: inherit;
                        font-size: 0.78rem;
                        font-weight: 500;
                        white-space: nowrap;
                        cursor: pointer;
                        transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, transform 0.2s ease;
                    }

                    .cat-chip i { font-size: 0.9rem; line-height: 1; }

                    .cat-chip:hover {
                        border-color: var(--chip-accent);
                        background: rgba(255, 255, 255, 0.06);
                        color: var(--text-primary);
                        transform: translateY(-1px);
                    }

                    .cat-chip.is-active {
                        color: #fff;
                        font-weight: 600;
                        border-color: transparent;
                        background: var(--primary);
                    }

                    .cat-chip.is-active i { color: #fff !important; }
                    .cat-chip.is-muted i { color: var(--text-muted); }

                    .cat-chip-count {
                        min-width: 1.15rem;
                        padding: 0 0.3rem;
                        border-radius: 99px;
                        background: rgba(255, 255, 255, 0.08);
                        font-size: 0.68rem;
                        font-variant-numeric: tabular-nums;
                        text-align: center;
                    }

                    .cat-chip.is-active .cat-chip-count { background: rgba(0, 0, 0, 0.22); }

                    /* Compact variant used inside the add form */
                    .cat-chip-sm { padding: 0.25rem 0.6rem; font-size: 0.72rem; gap: 0.3rem; }
                    .cat-chip-sm i { font-size: 0.8rem; }

                    .cat-picker {
                        display: flex;
                        align-items: flex-start;
                        gap: 0.75rem;
                        padding-top: 0.75rem;
                        margin-top: 0.25rem;
                        border-top: 1px dashed var(--border);
                    }

                    .cat-picker-label {
                        flex: 0 0 auto;
                        display: flex;
                        align-items: center;
                        gap: 0.4rem;
                        padding-top: 0.3rem;
                        color: var(--text-muted);
                        font-size: 0.72rem;
                        font-weight: 600;
                        letter-spacing: 0.04em;
                        text-transform: uppercase;
                    }

                    .cat-picker-clear {
                        background: none;
                        border: none;
                        padding: 0;
                        color: var(--primary);
                        font-family: inherit;
                        font-size: 0.68rem;
                        text-transform: none;
                        letter-spacing: 0;
                        cursor: pointer;
                    }

                    .cat-picker-clear:hover { text-decoration: underline; }

                    .cat-picker-options {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.35rem;
                    }

                    /* Leave room for the magnifier icon sitting inside the field */
                    #root .search-wrapper { position: relative; display: flex; align-items: center; flex: 1; }
                    #root .search-wrapper > i {
                        position: absolute;
                        left: 1rem;
                        color: var(--text-muted);
                        pointer-events: none;
                        font-size: 0.95rem;
                        z-index: 1;
                    }
                    #root .search-wrapper input { padding-left: 2.6rem !important; width: 100%; }

                    /* Name + category badge, so the badge never crowds the title */
                    .name-cell {
                        display: flex;
                        align-items: center;
                        gap: 0.6rem;
                        flex-wrap: wrap;
                    }

                    .name-cell-spread { justify-content: space-between; }

                    .name-cell-title {
                        font-size: 1.05rem;
                        font-weight: 500;
                        color: var(--text-primary);
                    }

                    /* Move-to-another-state dialog */
                    .action-btn.move.is-open { color: var(--primary); }

                    .move-backdrop {
                        position: fixed;
                        inset: 0;
                        z-index: 9998;
                        background: rgba(5, 7, 12, 0.65);
                        backdrop-filter: blur(3px);
                        display: flex;
                        align-items: flex-start;
                        justify-content: center;
                        padding: 10vh 1rem 1rem;
                    }

                    .move-dialog {
                        width: min(560px, 100%);
                        max-height: 70vh;
                        display: flex;
                        flex-direction: column;
                        background: rgba(17, 20, 28, 0.98);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: var(--radius-lg);
                        box-shadow: 0 24px 70px rgba(0,0,0,0.6);
                        overflow: hidden;
                    }

                    .move-dialog-head {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 1rem;
                        padding: 1.1rem 1.25rem 0.85rem;
                        border-bottom: 1px solid rgba(255,255,255,0.07);
                    }

                    .move-dialog-kicker {
                        display: block;
                        font-size: 0.68rem;
                        letter-spacing: 0.08em;
                        text-transform: uppercase;
                        color: var(--text-muted);
                    }

                    .move-dialog-head h3 {
                        margin: 0.2rem 0 0;
                        font-size: 1.05rem;
                        color: var(--text-primary);
                    }

                    .move-close {
                        background: none;
                        border: none;
                        color: var(--text-muted);
                        font-size: 1.1rem;
                        cursor: pointer;
                        padding: 0.2rem;
                    }

                    .move-close:hover { color: var(--text-primary); }

                    .move-search {
                        display: flex;
                        align-items: center;
                        gap: 0.6rem;
                        padding: 0.75rem 1.25rem;
                        border-bottom: 1px solid rgba(255,255,255,0.07);
                    }

                    .move-search i { color: var(--text-muted); }

                    #root .move-search input {
                        flex: 1;
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0.2rem 0 !important;
                        color: var(--text-primary);
                        font-size: 0.95rem;
                    }

                    .move-body { overflow-y: auto; padding: 0.75rem 1rem 1rem; }

                    .move-group + .move-group { margin-top: 1rem; }

                    .move-group-label {
                        font-size: 0.68rem;
                        letter-spacing: 0.07em;
                        text-transform: uppercase;
                        color: var(--text-muted);
                        margin-bottom: 0.5rem;
                    }

                    .move-options { display: flex; flex-wrap: wrap; gap: 0.4rem; }

                    .move-option {
                        padding: 0.4rem 0.8rem;
                        border-radius: 99px;
                        border: 1px solid var(--border);
                        background: rgba(255,255,255,0.03);
                        color: var(--text-secondary);
                        font-family: inherit;
                        font-size: 0.82rem;
                        cursor: pointer;
                        transition: all 0.15s ease;
                    }

                    .move-option.is-section {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.4rem;
                        border-color: rgba(99,102,241,0.4);
                        background: rgba(99,102,241,0.1);
                        color: var(--text-primary);
                    }

                    .move-option:hover {
                        border-color: var(--primary);
                        background: rgba(99,102,241,0.16);
                        color: #fff;
                    }

                    .move-empty { color: var(--text-muted); font-size: 0.88rem; text-align: center; padding: 1.5rem 0; }

                    /* Month + year selects, used everywhere a visit date is set */
                    .month-year-picker { display: inline-flex; gap: 0.35rem; align-items: center; }

                    #root .month-year-picker select {
                        padding: 0.4rem 0.6rem !important;
                        font-size: 0.85rem;
                        cursor: pointer;
                        min-width: 0;
                    }

                    #root .month-year-picker select:first-child { min-width: 108px; }
                    #root .month-year-picker select:last-child { min-width: 84px; }

                    .month-year-picker.in-add-form { margin-left: 0.25rem; }

                    .month-year-picker.in-edit-form { display: flex; margin-bottom: 0.5rem; }
                    #root .month-year-picker.in-edit-form select { flex: 1; }

                    .visit-count {
                        font-style: normal;
                        margin-left: 0.3rem;
                        padding: 0 0.28rem;
                        border-radius: 99px;
                        background: rgba(99,102,241,0.35);
                        color: #fff;
                        font-size: 0.62rem;
                    }

                    .visit-editor { margin-bottom: 0.6rem; }

                    .visit-editor-label {
                        font-size: 0.66rem;
                        letter-spacing: 0.06em;
                        text-transform: uppercase;
                        color: var(--text-muted);
                        margin-bottom: 0.3rem;
                    }

                    .visit-chip-row { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.4rem; }

                    .visit-chip {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.25rem;
                        padding: 0.15rem 0.3rem 0.15rem 0.55rem;
                        border-radius: 99px;
                        background: rgba(99,102,241,0.16);
                        border: 1px solid rgba(99,102,241,0.3);
                        color: var(--text-primary);
                        font-size: 0.72rem;
                        white-space: nowrap;
                    }

                    .visit-chip button {
                        background: none;
                        border: none;
                        color: var(--text-muted);
                        cursor: pointer;
                        padding: 0 0.1rem;
                        font-size: 0.68rem;
                        display: inline-flex;
                    }

                    .visit-chip button:hover { color: #ef4444; }
                    .visit-none { color: var(--text-muted); font-size: 0.72rem; }

                    /* Detail panels in the bucket-list / stay / trek editors.
                       These were Tailwind utility classes with no Tailwind
                       loaded: the grid never gridded, so three controls
                       stacked in a narrow column, and the toggle chips
                       rendered as bare browser buttons. */
                    .detail-grid {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 0.4rem;
                        padding: 0.5rem;
                        margin-bottom: 0.5rem;
                        background: rgba(255,255,255,0.03);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-sm);
                    }

                    #root .detail-grid .detail-input,
                    #root .detail-input {
                        width: 100%;
                        min-width: 0;
                        padding: 0.3rem 0.5rem !important;
                        font-size: 0.75rem;
                    }

                    .detail-label {
                        font-size: 0.65rem;
                        color: var(--text-muted);
                        white-space: nowrap;
                    }

                    /* The first control is a free-text field (Duration, Stay type)
                       and needs the whole row; the paired selects sit below it. */
                    .detail-grid > *:first-child { grid-column: 1 / -1; }

                    .detail-grid > div {
                        display: flex;
                        align-items: center;
                        gap: 0.3rem;
                        min-width: 0;
                    }

                    .detail-chips { display: flex; flex-wrap: wrap; gap: 0.25rem; }

                    .detail-chip {
                        padding: 0.15rem 0.55rem;
                        border-radius: 99px;
                        border: 1px solid var(--border);
                        background: rgba(255,255,255,0.04);
                        color: var(--text-secondary);
                        font-family: inherit;
                        font-size: 0.68rem;
                        white-space: nowrap;
                        cursor: pointer;
                        transition: all 0.15s ease;
                    }

                    .detail-chip:hover { border-color: var(--primary); color: var(--text-primary); }
                    .detail-chip.is-on { background: var(--primary); border-color: var(--primary); color: #fff; }

                    .card-visits { display: flex; flex-direction: column; gap: 0.35rem; }
                    #root .card-info.edit-form select.edit-field { cursor: pointer; }

                    .fact-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.3rem;
                        padding: 0.15rem 0.55rem;
                        border-radius: 99px;
                        background: rgba(255,255,255,0.06);
                        color: var(--text-secondary);
                        font-size: 0.7rem;
                        white-space: nowrap;
                    }

                    .fact-badge.is-link { color: var(--primary); text-decoration: none; }
                    .fact-badge.is-link:hover { background: rgba(99,102,241,0.18); }

                    .col-adventure-details { width: 26%; min-width: 220px; }

                    .spec-panel {
                        margin-top: 0.75rem;
                        padding: 0.9rem 1rem;
                        background: rgba(255,255,255,0.03);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-md);
                    }

                    .spec-panel-label {
                        font-size: 0.7rem;
                        letter-spacing: 0.06em;
                        text-transform: uppercase;
                        color: var(--text-muted);
                        margin-bottom: 0.6rem;
                    }

                    /* Bulk visit-date tagging */
                    .bulk-date-bar {
                        display: flex;
                        align-items: center;
                        gap: 0.6rem;
                        flex-wrap: wrap;
                        margin-bottom: 0.9rem;
                    }

                    .bulk-date-bar.is-open {
                        padding: 0.7rem 0.9rem;
                        border: 1px solid rgba(99,102,241,0.35);
                        background: rgba(99,102,241,0.08);
                        border-radius: var(--radius-md);
                    }

                    .bulk-date-start {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.45rem;
                        padding: 0.4rem 0.85rem;
                        border-radius: 99px;
                        border: 1px solid var(--border);
                        background: rgba(255,255,255,0.03);
                        color: var(--text-secondary);
                        font-family: inherit;
                        font-size: 0.8rem;
                        cursor: pointer;
                    }

                    .bulk-date-start:hover { border-color: var(--primary); color: var(--text-primary); }

                    .bulk-date-count { color: var(--text-primary); font-size: 0.85rem; font-weight: 600; }

                    .bulk-date-all, .bulk-date-cancel {
                        background: none;
                        border: none;
                        color: var(--text-muted);
                        font-family: inherit;
                        font-size: 0.78rem;
                        cursor: pointer;
                        text-decoration: underline;
                    }

                    .bulk-date-all:hover, .bulk-date-cancel:hover { color: var(--text-primary); }



                    .bulk-date-apply {
                        margin-left: auto;
                        padding: 0.4rem 0.9rem;
                        border-radius: var(--radius-sm);
                        border: none;
                        background: var(--primary);
                        color: #fff;
                        font-family: inherit;
                        font-size: 0.82rem;
                        font-weight: 600;
                        cursor: pointer;
                    }

                    .bulk-date-apply:disabled { opacity: 0.4; cursor: not-allowed; }

                    .col-pick { width: 38px; text-align: center; }
                    .col-pick input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); }
                    .details-table tr.is-picked td { background: rgba(99,102,241,0.12); }

                    .visit-date {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.3rem;
                        padding: 0.15rem 0.5rem;
                        border-radius: 99px;
                        background: rgba(255,255,255,0.05);
                        color: var(--text-muted);
                        font-size: 0.7rem;
                        font-variant-numeric: tabular-nums;
                        white-space: nowrap;
                    }

                    .visit-date i { font-size: 0.72rem; }

                    #root .date-input {
                        color-scheme: dark;
                        min-width: 140px;
                    }

                    /* Treks summary bar */
                    .trek-stat-bar {
                        display: flex;
                        align-items: center;
                        gap: 0.6rem;
                        padding: 0.85rem 1.1rem;
                        margin-bottom: 1rem;
                        border: 1px solid var(--border);
                        border-radius: var(--radius-lg);
                        background: rgba(255, 255, 255, 0.03);
                    }

                    .trek-stat-bar i { font-size: 1.25rem; color: var(--primary); }
                    .trek-stat-value { font-weight: 700; color: var(--text-primary); font-variant-numeric: tabular-nums; }
                    .trek-stat-label { color: var(--text-muted); font-size: 0.85rem; }

                    @media (max-width: 768px) {
                        .toolbar-row { flex-direction: column; }
                        .inputs-group { flex-direction: column; }
                        .add-input-wrapper { width: 100%; min-width: 0; }
                        .sub-input { border-left: none !important; border-top: 1px solid var(--border); }
                        .col-city, .col-remarks { display: none; } .col-name { width: 80%; }
                        .table-card { overflow-x: auto; }
                        .cat-picker { flex-direction: column; gap: 0.5rem; }
                        .cat-picker-options { max-height: 5.5rem; overflow-y: auto; }
                    }

                    /* Feature 14: Rating & Review Styles */
                    .rating-review-section {
                        background: var(--bg-app);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-md);
                        padding: 0.75rem 1rem;
                        margin-top: 0.75rem;
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .rating-input-row {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }
                    .rating-label {
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: var(--text-secondary);
                    }
                    .star-selector {
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                    }
                    .star-btn {
                        background: none;
                        border: none;
                        font-size: 1.25rem;
                        color: var(--text-muted);
                        cursor: pointer;
                        padding: 0.1rem;
                        transition: transform 0.15s, color 0.15s;
                    }
                    .star-btn:hover {
                        transform: scale(1.2);
                        color: #f59e0b;
                    }
                    .star-btn.active {
                        color: #f59e0b;
                    }
                    .rating-value {
                        font-size: 0.85rem;
                        font-weight: 700;
                        color: #f59e0b;
                        margin-left: 0.5rem;
                    }
                    .review-input {
                        width: 100%;
                        background: var(--bg-surface);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-sm);
                        color: var(--text-primary);
                        padding: 0.5rem 0.75rem;
                        font-size: 0.85rem;
                        resize: vertical;
                        outline: none;
                    }
                    .review-input:focus {
                        border-color: var(--primary);
                    }
                    .star-display {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.1rem;
                        font-size: 0.85rem;
                        margin-left: 0.4rem;
                    }
                    .star-filled { color: #f59e0b; }
                    .star-empty { color: rgba(255,255,255,0.15); }
                    .review-indicator {
                        color: var(--primary);
                        font-size: 1rem;
                        margin-left: 0.4rem;
                        cursor: help;
                    }

                    /* Feature 3: Photo Gallery Styles */
                    .photos-upload-section {
                        background: var(--bg-app);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-md);
                        padding: 0.75rem 1rem;
                        margin-top: 0.75rem;
                    }
                    .photos-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .photos-label {
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: var(--text-secondary);
                        display: flex;
                        align-items: center;
                        gap: 0.4rem;
                    }
                    .photo-upload-btn {
                        background: rgba(99,102,241,0.15);
                        color: var(--primary);
                        border: 1px solid rgba(99,102,241,0.3);
                        padding: 0.3rem 0.75rem;
                        border-radius: var(--radius-sm);
                        font-size: 0.8rem;
                        font-weight: 600;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.3rem;
                        transition: all 0.2s;
                    }
                    .photo-upload-btn:hover {
                        background: var(--primary);
                        color: white;
                    }
                    .photos-preview-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                        margin-top: 0.75rem;
                    }
                    .photo-preview-thumb {
                        position: relative;
                        width: 54px;
                        height: 54px;
                        border-radius: var(--radius-sm);
                        overflow: hidden;
                        border: 1px solid var(--border);
                    }
                    .photo-preview-thumb img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .photo-remove-btn {
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        background: rgba(0,0,0,0.7);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 18px;
                        height: 18px;
                        font-size: 0.65rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                    }
                    .photo-count-badge {
                        background: rgba(168,85,247,0.15);
                        color: #a855f7;
                        border: 1px solid rgba(168,85,247,0.3);
                        padding: 0.15rem 0.5rem;
                        border-radius: 1rem;
                        font-size: 0.75rem;
                        font-weight: 700;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.3rem;
                        margin-left: 0.4rem;
                        transition: all 0.2s;
                    }
                    .photo-count-badge:hover {
                        background: #a855f7;
                        color: white;
                    }

                    /* Lightbox Modal */
                    .lightbox-overlay {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0, 0, 0, 0.9);
                        backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        padding: 2rem;
                    }
                    .lightbox-content {
                        position: relative;
                        max-width: 90vw;
                        max-height: 90vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .lightbox-close {
                        position: absolute;
                        top: -2.5rem;
                        right: 0;
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.75rem;
                        cursor: pointer;
                    }
                    .lightbox-image-wrapper {
                        max-width: 80vw;
                        max-height: 75vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        border-radius: var(--radius-md);
                    }
                    .lightbox-image {
                        max-width: 100%;
                        max-height: 75vh;
                        object-fit: contain;
                    }
                    .lightbox-controls {
                        display: flex;
                        align-items: center;
                        gap: 1.5rem;
                        margin-top: 1rem;
                        color: white;
                    }
                    .lightbox-nav {
                        background: rgba(255,255,255,0.15);
                        border: none;
                        color: white;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        font-size: 1.25rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .lightbox-nav:hover:not(:disabled) {
                        background: rgba(255,255,255,0.3);
                    }
                    .lightbox-nav:disabled {
                        opacity: 0.3;
                        cursor: not-allowed;
                    }
                    .lightbox-counter {
                        font-weight: 600;
                        font-size: 0.95rem;
                    }
                `}</style>
            </div>
        );
    };

    window.StateDetails = StateDetails;
    console.log("StateDetails component registered on window (v10 - Generalized Add)");
})();
