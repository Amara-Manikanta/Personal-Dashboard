const API_BASE = 'http://localhost:3001/api';
// Assuming the user runs this on localhost or 127.0.0.1. Any other domain is treated as hosted (GitHub Pages)
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// GitHub Configuration
const GITHUB_OWNER = 'Amara-Manikanta';
const GITHUB_REPO = 'Personal-Dashboard';
const GITHUB_BRANCH = 'main';

class GitHubStorage {
    constructor() {
        this.token = localStorage.getItem('GITHUB_TOKEN');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('GITHUB_TOKEN', token);
    }

    async getFile(path) {
        // First try to load from the static URL (CDN) for speed, but fallback to API for freshness if needed
        // Ideally, we always want fresh data if we are going to edit it.
        if (!this.token) {
            // Read-only mode without token
            const res = await fetch(`data/${path}`);
            return res.ok ? await res.json() : null;
        }

        try {
            const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/${path}`;
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!res.ok) throw new Error(`GitHub API Error: ${res.status}`);
            const json = await res.json();
            // Content is base64 encoded
            const content = decodeURIComponent(escape(atob(json.content)));
            return JSON.parse(content);
        } catch (e) {
            console.error("Failed to fetch from GitHub:", e);
            // Fallback to static if API fails
            const res = await fetch(`data/${path}`);
            return res.ok ? await res.json() : null;
        }
    }

    async saveFile(path, data) {
        if (!this.token) {
            const token = prompt("To save changes to GitHub, please enter your Personal Access Token (Repo scope):");
            if (token) {
                this.setToken(token);
            } else {
                alert("Cannot save without a GitHub Token. Changes will not be persisted.");
                return;
            }
        }

        try {
            // 1. Get current SHA of the file (required for update)
            const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/${path}`;
            const getRes = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let sha = null;
            if (getRes.ok) {
                const getJson = await getRes.json();
                sha = getJson.sha;
            }

            // 2. Prepare content
            const contentString = JSON.stringify(data, null, 2);
            // safe base64 encoding for utf8
            const contentBase64 = btoa(unescape(encodeURIComponent(contentString)));

            // 3. Commit update
            const putRes = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `update ${path} via web dashboard`,
                    content: contentBase64,
                    sha: sha, // if null, it creates a new file
                    branch: GITHUB_BRANCH
                })
            });

            if (!putRes.ok) {
                const err = await putRes.json();
                throw new Error(err.message);
            }

            alert("Saved successfully to GitHub!");
        } catch (e) {
            console.error("GitHub Save Error:", e);
            alert(`Failed to save to GitHub: ${e.message}`);
        }
    }
}

const ghStorage = new GitHubStorage();

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
            return (await ghStorage.getFile('novels.json')) || [];
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
            await ghStorage.saveFile('novels.json', data);
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
            return (await ghStorage.getFile('states.json')) || { states: {}, bucketList: [] };
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
            await ghStorage.saveFile('states.json', data);
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
            return (await ghStorage.getFile('writing.json')) || [];
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
            await ghStorage.saveFile('writing.json', data);
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
            return (await ghStorage.getFile('stories.json')) || [];
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
            await ghStorage.saveFile('stories.json', data);
        }
    },

    getAuthors: async () => {
        if (IS_LOCALHOST) {
            try {
                const res = await fetch(`${API_BASE}/authors`);
                if (!res.ok) throw new Error('Failed to fetch authors');
                return await res.json();
            } catch (e) {
                console.warn("API fetch failed for authors, trying static file...");
                try {
                    const staticRes = await fetch('data/authors.json');
                    if (staticRes.ok) return await staticRes.json();
                } catch (err) {
                    console.error(err);
                }
                return [];
            }
        } else {
            return (await ghStorage.getFile('authors.json')) || [];
        }
    },
    saveAuthors: async (data) => {
        if (IS_LOCALHOST) {
            try {
                await fetch(`${API_BASE}/authors`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.error("Error saving authors:", e);
            }
        } else {
            await ghStorage.saveFile('authors.json', data);
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
