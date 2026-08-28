
const STATES_LIST = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep", "New Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

const COUNTRIES_LIST = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Holy See", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
    "Vanuatu", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
];

const INITIAL_STATE_DATA = {
    visited: false,
    placesVisited: [],
    placesToVisit: [],
    restaurants: [],
    food: [],
    treks: [],
    stays: [],
    highlights: []
};

// Helper to access raw data fetched by App.jsx
// structure: { states: { "StateName": { ... } }, bucketList: [ ... ] }
const getRawData = () => window.rawStatesData || { states: {}, bucketList: [] };

const getStatesData = () => {
    const { states } = getRawData();
    return STATES_LIST.map(name => ({
        name,
        ...INITIAL_STATE_DATA,
        ...(states[name] || {})
    }));
};

const saveStateData = (stateName, updates) => {
    const raw = getRawData();
    // Ensure states object exists
    if (!raw.states) raw.states = {};

    // Merge updates
    raw.states[stateName] = {
        ...INITIAL_STATE_DATA,
        ...(raw.states[stateName] || {}),
        ...updates
    };

    // Update global and Save to API
    window.rawStatesData = raw;
    if (window.api && window.api.saveStates) {
        window.api.saveStates(raw);
    }
    return true;
};

const getStateStats = () => {
    const data = getStatesData();
    const visitedCount = data.filter(s => s.visited || s.placesVisited.length > 0).length;
    const totalTreks = data.reduce((acc, curr) => acc + (curr.treks ? curr.treks.length : 0), 0);
    return {
        totalStates: STATES_LIST.length,
        visitedStates: visitedCount,
        totalTreks,
        progress: (visitedCount / STATES_LIST.length) * 100
    };
};

const getCountriesData = () => {
    const { states } = getRawData(); // Using same storage object 'states' for countries
    return COUNTRIES_LIST.map(name => ({
        name,
        ...INITIAL_STATE_DATA,
        ...(states[name] || {})
    }));
};

const saveCountryData = (countryName, updates) => {
    return saveStateData(countryName, updates);
};

const getCountryStats = () => {
    const data = getCountriesData();
    const visitedCount = data.filter(c => c.visited || c.placesVisited.length > 0).length;
    const totalTreks = data.reduce((acc, curr) => acc + (curr.treks ? curr.treks.length : 0), 0);
    return {
        totalCountries: COUNTRIES_LIST.length,
        visitedCountries: visitedCount,
        totalTreks,
        progress: (visitedCount / COUNTRIES_LIST.length) * 100
    };
};

const getBucketList = () => {
    return getRawData().bucketList || [];
};

const saveBucketList = (items) => {
    const raw = getRawData();
    raw.bucketList = items;
    window.rawStatesData = raw;
    if (window.api && window.api.saveStates) {
        window.api.saveStates(raw);
    }
    return true;
};

/**
 * Everything the raw states object holds, split by what it actually is.
 * states.json keys India states and world countries into one map, so any
 * screen counting Object.keys() gets a meaningless total — it mixes the two
 * and picks up stray keys that belong to neither list.
 */
const getTravelTotals = () => {
    const { states } = getRawData();
    const entries = Object.entries(states || {});

    const isVisited = (v) => !!(v && (v.visited || (v.placesVisited && v.placesVisited.length)));
    const countIn = (list) => entries.filter(([name, v]) => list.includes(name) && isVisited(v)).length;

    const sum = (field) => entries.reduce((acc, [, v]) => acc + (((v && v[field]) || []).length), 0);

    // Keys in neither list are invisible in the UI — surface them so typos
    // like "Gujrat" vs "Gujarat" do not silently hide their data.
    const orphans = entries
        .filter(([name]) => !STATES_LIST.includes(name) && !COUNTRIES_LIST.includes(name))
        .map(([name, v]) => ({
            name,
            items: ['placesVisited', 'placesToVisit', 'restaurants', 'food', 'treks', 'stays', 'highlights']
                .reduce((acc, f) => acc + (((v && v[f]) || []).length), 0)
        }))
        .filter(o => o.items > 0);

    return {
        statesVisited: countIn(STATES_LIST),
        statesTotal: STATES_LIST.length,
        countriesVisited: countIn(COUNTRIES_LIST),
        placesVisited: sum('placesVisited'),
        placesToVisit: sum('placesToVisit'),
        restaurants: sum('restaurants'),
        food: sum('food'),
        treks: sum('treks'),
        stays: sum('stays'),
        highlights: sum('highlights'),
        orphans
    };
};

/**
 * Move one entry from a region's list into the same list on another region.
 *
 * Both sides are mutated on a single raw object and saved once — saving twice
 * would leave the data with the item duplicated (or missing) if the second
 * write failed.
 *
 * Returns { ok, message } so the caller can report a refusal.
 */
const moveItemBetweenRegions = (fromRegion, toRegion, field, index) => {
    if (fromRegion === toRegion) return { ok: false, message: 'Source and destination are the same.' };

    const raw = getRawData();
    if (!raw.states) raw.states = {};

    const source = raw.states[fromRegion];
    const list = (source && source[field]) || [];
    if (index < 0 || index >= list.length) return { ok: false, message: 'That item no longer exists.' };

    const [item] = list.splice(index, 1);

    const target = raw.states[toRegion] = {
        ...INITIAL_STATE_DATA,
        ...(raw.states[toRegion] || {})
    };
    target[field] = [...(target[field] || []), item];

    // Arriving somewhere new implies you have been there.
    if (field === 'placesVisited') target.visited = true;

    raw.states[fromRegion] = { ...source, [field]: list };

    window.rawStatesData = raw;
    if (window.api && window.api.saveStates) {
        window.api.saveStates(raw);
    }

    const label = (item && typeof item === 'object' ? item.name : item) || 'Item';
    return { ok: true, message: `${label} moved to ${toRegion}.` };
};

const getTrips = () => {
    return getRawData().trips || [];
};

const saveTrips = (trips) => {
    const raw = getRawData();
    raw.trips = trips;
    window.rawStatesData = raw;
    if (window.api && window.api.saveStates) {
        window.api.saveStates(raw);
    }
    return true;
};

window.TravelData = {
    STATES_LIST,
    COUNTRIES_LIST,
    getStatesData,
    saveStateData,
    getStateStats,
    getCountriesData,
    saveCountryData,
    getCountryStats,
    getBucketList,
    saveBucketList,
    getTravelTotals,
    moveItemBetweenRegions,
    getTrips,
    saveTrips
};

