/**
 * City -> coordinates, for placing pins on the India map.
 *
 * The data has no lat/lng, only free-text city names, so this table resolves
 * them. It has to cope with what is actually in the file:
 *   - neighbourhoods standing in for their city ("Gachibowli" -> Hyderabad)
 *   - abbreviations ("VSKP" -> Visakhapatnam)
 *   - spelling variants ("Vijaywada", "Bhyander", "Alibug")
 *   - compound strings ("Indiranagar, Bangalore", "Devanahalli (near Bangalore)")
 *
 * Anything unresolved falls back to the state centroid, so every place still
 * gets a pin rather than silently disappearing.
 */
window.CITY_COORDS = {
    // Andhra Pradesh / Telangana
    'hyderabad': [17.385, 78.487],
    'warangal': [17.978, 79.594],
    'karimnagar': [18.438, 79.129],
    'ramagundam': [18.762, 79.474],
    'medaram': [18.276, 80.213],
    'kakinada': [16.989, 82.247],
    'pithapuram': [17.115, 82.254],
    'annavaram': [17.286, 82.412],
    'mamidada': [16.870, 82.100],
    'vadapalli': [17.050, 81.790],
    'tirupati': [13.628, 79.419],
    'tirumala': [13.683, 79.347],
    'kadapa': [14.468, 78.824],
    'visakhapatnam': [17.687, 83.219],
    'vizianagaram': [18.116, 83.411],
    'araku': [18.327, 82.878],
    'vanajangi': [18.150, 82.720],
    'vijayawada': [16.507, 80.648],

    // Karnataka
    'bangalore': [12.972, 77.594],
    'mysore': [12.295, 76.639],
    'hampi': [15.335, 76.460],
    'anegundi': [15.353, 76.475],
    'chikmagalur': [13.316, 75.774],
    'coorg': [12.420, 75.740],
    'bylakuppe': [12.397, 76.033],
    'udupi': [13.341, 74.746],
    'kundapura': [13.626, 74.692],
    'sagara': [14.166, 75.031],
    'gokarna': [14.549, 74.318],
    'devanahalli': [13.248, 77.712],
    'chikkaballapur': [13.435, 77.727],
    'bidadi': [12.799, 77.386],
    'doddaballapur': [13.294, 77.535],
    'bellary': [15.139, 76.921],

    // Tamil Nadu / Kerala / Puducherry
    'ooty': [11.410, 76.695],
    'chennai': [13.083, 80.271],
    'mahabalipuram': [12.627, 80.192],
    'puducherry': [11.934, 79.830],
    'sabarimala': [9.436, 77.081],

    // Maharashtra
    'mumbai': [19.076, 72.877],
    'alibag': [18.641, 72.872],
    'lonavala': [18.754, 73.409],
    'karjat': [18.911, 73.323],
    'panvel': [18.989, 73.110],
    'irshalwadi': [18.960, 73.260],

    // North / North-East / East
    'manali': [32.240, 77.189],
    'vashisht': [32.256, 77.188],
    'dharamshala': [32.219, 76.323],
    'spiti valley': [32.226, 78.071],
    'guwahati': [26.144, 91.736],
    'kaziranga': [26.577, 93.171],
    'konark': [19.887, 86.094],
    'delhi': [28.614, 77.209],
    'kolkata': [22.573, 88.364]
};

/** Variant spellings and neighbourhoods -> the key they resolve to. */
window.CITY_ALIASES = {
    // Hyderabad neighbourhoods
    'madhapur': 'hyderabad',
    'gachibowli': 'hyderabad',
    'kondapur': 'hyderabad',
    'hitech city': 'hyderabad',
    'jubilee hills': 'hyderabad',
    'jubliee hills': 'hyderabad',
    'financial district': 'hyderabad',

    // Bangalore neighbourhoods
    'hsr layout': 'bangalore',
    'jp nagar': 'bangalore',
    'indiranagar': 'bangalore',
    'kormangla': 'bangalore',
    'koramangala': 'bangalore',
    'konanakunte road': 'bangalore',
    'kanakapura road': 'bangalore',
    'bannerghatta road': 'bangalore',
    'vega city': 'bangalore',
    'mysore highway': 'bangalore',

    // Mumbai neighbourhoods
    'churchgate': 'mumbai',
    'airoli': 'mumbai',
    'borivalli': 'mumbai',
    'borivali': 'mumbai',
    'bhyandar': 'mumbai',
    'bhyander': 'mumbai',
    'vasai': 'mumbai',

    // Spellings / abbreviations
    'vskp': 'visakhapatnam',
    'vizag': 'visakhapatnam',
    'vijaywada': 'vijayawada',
    'alibug': 'alibag',
    'panvel taluka': 'panvel',
    'uttara kannada coast': 'gokarna',
    'bellary region': 'bellary',
    'sanapur lake': 'hampi',
    'alluri sitarama raju district': 'araku',
    'orissa': 'konark',
    'sikkim': 'gangtok'
};

/** Fallback when the city cannot be resolved — roughly the state's centre. */
window.STATE_CENTROIDS = {
    'Andhra Pradesh': [16.50, 80.00],
    'Arunachal Pradesh': [28.20, 94.70],
    'Assam': [26.20, 92.90],
    'Bihar': [25.60, 85.40],
    'Chhattisgarh': [21.30, 82.00],
    'Goa': [15.35, 74.05],
    'Gujarat': [22.60, 71.80],
    'Haryana': [29.20, 76.30],
    'Himachal Pradesh': [31.90, 77.20],
    'Jharkhand': [23.60, 85.30],
    'Karnataka': [14.80, 76.10],
    'Kerala': [10.50, 76.30],
    'Ladakh': [34.20, 77.60],
    'Jammu and Kashmir': [33.60, 75.10],
    'Madhya Pradesh': [23.50, 78.30],
    'Maharashtra': [19.50, 75.70],
    'Manipur': [24.70, 93.90],
    'Meghalaya': [25.50, 91.30],
    'Mizoram': [23.30, 92.80],
    'Nagaland': [26.10, 94.50],
    'New Delhi': [28.61, 77.21],
    'Odisha': [20.50, 84.80],
    'Puducherry': [11.93, 79.83],
    'Punjab': [31.10, 75.40],
    'Rajasthan': [26.60, 73.80],
    'Sikkim': [27.55, 88.50],
    'Tamil Nadu': [11.10, 78.30],
    'Telangana': [17.90, 79.00],
    'Tripura': [23.80, 91.70],
    'Uttar Pradesh': [26.80, 80.90],
    'Uttarakhand': [30.10, 79.20],
    'West Bengal': [23.60, 87.90],
    'Chandigarh': [30.73, 76.78],
    'Andaman and Nicobar Islands': [11.70, 92.70],
    'Lakshadweep': [10.57, 72.64],
    'Dadra and Nagar Haveli and Daman and Diu': [20.30, 73.00]
};

// A couple of places referenced only by state name.
window.CITY_COORDS['gangtok'] = [27.339, 88.606];

/**
 * Resolve a free-text city (and its state) to coordinates.
 * Returns { lat, lng, exact } — exact:false means the state centroid was used.
 */
window.resolveCityCoords = (city, stateName) => {
    const centroid = window.STATE_CENTROIDS[stateName];
    const fallback = centroid ? { lat: centroid[0], lng: centroid[1], exact: false } : null;

    const raw = String(city || '').trim().toLowerCase();
    if (!raw || raw === '-') return fallback;

    // Try progressively looser forms: whole string, then each comma/paren part.
    const candidates = [raw];

    // "Devanahalli (near Bangalore)" -> both "devanahalli" and "bangalore"
    const paren = raw.match(/^(.*?)\s*\((?:near\s+)?(.*?)\)\s*$/);
    if (paren) { candidates.push(paren[1].trim(), paren[2].trim()); }

    // "Indiranagar, Bangalore" / "Hampi / Sanapur Lake"
    raw.split(/[,/]/).forEach(part => {
        const p = part.trim();
        if (p) candidates.push(p);
    });

    for (const c of candidates) {
        const key = window.CITY_ALIASES[c] || c;
        const hit = window.CITY_COORDS[key];
        if (hit) return { lat: hit[0], lng: hit[1], exact: true };
    }

    return fallback;
};
