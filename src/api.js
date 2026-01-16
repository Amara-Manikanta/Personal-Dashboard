const API_BASE = 'http://localhost:3001/api';
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Helper for local storage with static file fallback
const getFromStorageOrStatic = async (key, staticPath) => {
    // 1. Try LocalStorage first (user edits on hosted site)
    const local = localStorage.getItem(key);
    if (local) return JSON.parse(local);

    // 2. Fallback to static JSON file (initial data from repo)
    try {
        const response = await fetch(staticPath);
        if (response.ok) {
            const data = await response.json();
            // Seed localStorage so future writes work
            localStorage.setItem(key, JSON.stringify(data));
            return data;
        }
    } catch (e) {
        console.warn(`Could not load static data for ${key}:`, e);
    }

    // 3. Fallback to empty default
    return null;
};

const api = {
    getNovels: async () => {
        if (IS_LOCALHOST) {
            try {
                const res = await fetch(`${API_BASE}/novels`);
                if (!res.ok) throw new Error('Failed to fetch novels');
                return await res.json();
            } catch (e) {
                console.error(e);
                return [];
            }
        } else {
            // Hosted Mode
            return (await getFromStorageOrStatic('novels_data', 'data/novels.json')) || [];
        }
    },
    saveNovels: async (data) => {
        if (IS_LOCALHOST) {
            try {
                await fetch(`${API_BASE}/novels`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.error("Error saving novels:", e);
            }
        } else {
            // Hosted Mode - Save to LocalStorage
            localStorage.setItem('novels_data', JSON.stringify(data));
            console.log("Saved novels to LocalStorage");
        }
    },

    getStates: async () => {
        if (IS_LOCALHOST) {
            try {
                const res = await fetch(`${API_BASE}/states`);
                if (!res.ok) throw new Error('Failed to fetch states');
                return await res.json();
            } catch (e) {
                console.error(e);
                return { states: {}, bucketList: [] };
            }
        } else {
            return (await getFromStorageOrStatic('states_data', 'data/states.json')) || { states: {}, bucketList: [] };
        }
    },
    saveStates: async (data) => {
        if (IS_LOCALHOST) {
            try {
                await fetch(`${API_BASE}/states`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.error("Error saving states:", e);
            }
        } else {
            localStorage.setItem('states_data', JSON.stringify(data));
        }
    },

    getWriting: async () => {
        if (IS_LOCALHOST) {
            try {
                const res = await fetch(`${API_BASE}/writing`);
                if (!res.ok) throw new Error('Failed to fetch writing data');
                return await res.json();
            } catch (e) {
                console.error(e);
                return [];
            }
        } else {
            return (await getFromStorageOrStatic('writing_data', 'data/writing.json')) || [];
        }
    },
    saveWriting: async (data) => {
        if (IS_LOCALHOST) {
            try {
                await fetch(`${API_BASE}/writing`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.error("Error saving writing data:", e);
            }
        } else {
            localStorage.setItem('writing_data', JSON.stringify(data));
        }
    },

    getStories: async () => {
        if (IS_LOCALHOST) {
            try {
                const res = await fetch(`${API_BASE}/stories`);
                if (!res.ok) throw new Error('Failed to fetch stories');
                return await res.json();
            } catch (e) {
                console.error(e);
                return [];
            }
        } else {
            return (await getFromStorageOrStatic('stories_data', 'data/stories.json')) || [];
        }
    },
    saveStories: async (data) => {
        if (IS_LOCALHOST) {
            try {
                await fetch(`${API_BASE}/stories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.error("Error saving stories:", e);
            }
        } else {
            localStorage.setItem('stories_data', JSON.stringify(data));
        }
    }
};

window.api = api;

// Global Constants
window.GENRES = [
    "All",
    "Adventure",
    "Children’s Adventure",
    "Comics",
    "Contemporary",
    "Contemporary Fiction",
    "Contemporary Romance",
    "Crime Thriller",
    "Domestic Suspense",
    "Erotic Thriller",
    "Fantasy",
    "Feminist Fiction",
    "General Fiction",
    "Historical Fiction",
    "Humor",
    "Knowledge Magazine",
    "Long Distance Romance",
    "Motivational",
    "Mystery",
    "Philosophical Fiction",
    "Political Commentary",
    "Psychological Drama",
    "Psychological Thriller",
    "Romance",
    "Romantic Drama",
    "Romantic Fiction",
    "Romantic Suspense",
    "Romantic Thriller",
    "Satirical Fiction",
    "Sci-Fi",
    "Spiritual Fiction",
    "Spiritual Romance",
    "Sports Fiction",
    "Thriller",
    "Young Adult Fantasy"
];

window.STATUSES = ["All", "TBR", "Currently Reading", "Read", "Tried"];
