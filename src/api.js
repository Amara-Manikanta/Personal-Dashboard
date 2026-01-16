const API_BASE = 'http://localhost:3001/api';

const api = {
    getNovels: async () => {
        try {
            const res = await fetch(`${API_BASE}/novels`);
            if (!res.ok) throw new Error('Failed to fetch novels');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    },
    saveNovels: async (data) => {
        try {
            await fetch(`${API_BASE}/novels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("Error saving novels:", e);
        }
    },

    getStates: async () => {
        try {
            const res = await fetch(`${API_BASE}/states`);
            if (!res.ok) throw new Error('Failed to fetch states');
            return await res.json();
        } catch (e) {
            console.error(e);
            return { states: {}, bucketList: [] };
        }
    },
    saveStates: async (data) => {
        try {
            await fetch(`${API_BASE}/states`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("Error saving states:", e);
        }
    },

    getWriting: async () => {
        try {
            const res = await fetch(`${API_BASE}/writing`);
            if (!res.ok) throw new Error('Failed to fetch writing data');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    },
    saveWriting: async (data) => {
        try {
            await fetch(`${API_BASE}/writing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("Error saving writing data:", e);
        }
    },

    getStories: async () => {
        try {
            const res = await fetch(`${API_BASE}/stories`);
            if (!res.ok) throw new Error('Failed to fetch stories');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    },
    saveStories: async (data) => {
        try {
            await fetch(`${API_BASE}/stories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("Error saving stories:", e);
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
