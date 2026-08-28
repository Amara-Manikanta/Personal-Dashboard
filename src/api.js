const API_BASE = 'http://localhost:3010/api';
// Assuming the user runs this on localhost or 127.0.0.1. Any other domain is treated as hosted (GitHub Pages)
// We also treat 'file:' protocol (empty hostname) as localhost so it tries to hit the local backend server.
const IS_LOCALHOST = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';

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

    async fetchStaticFile(path) {
        try {
            const cacheBuster = `?t=${Date.now()}`;
            let res = await fetch(`data/${path}${cacheBuster}`);
            if (!res.ok) {
                res = await fetch(`./data/${path}${cacheBuster}`);
            }
            if (res.ok) {
                return await res.json();
            }
        } catch (err) {
            console.error(`Failed to fetch static file data/${path}:`, err);
        }
        return null;
    }

    async getFile(path) {
        if (!this.token) {
            // Read-only mode without token
            return await this.fetchStaticFile(path);
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
            // Content is base64 encoded with potential newlines
            const cleanBase64 = (json.content || '').replace(/\s/g, '');
            const bytes = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
            const content = new TextDecoder('utf-8').decode(bytes);
            return JSON.parse(content);
        } catch (e) {
            if (e.message.includes('401') || e.message.includes('Bad credentials')) {
                console.warn("Invalid GitHub Token detected. Clearing token and reverting to read-only mode.");
                this.token = null;
                localStorage.removeItem('GITHUB_TOKEN');
            } else {
                console.error("Failed to fetch from GitHub API:", e);
            }
            // Fallback to static if API fails
            return await this.fetchStaticFile(path);
        }
    }

    async saveFile(path, data, silent = false) {
        if (!this.token) {
            const token = prompt(
                "To save changes to GitHub, please enter your GitHub Personal Access Token.\n\n" +
                "Required Permissions:\n" +
                "• Fine-Grained Token: Repository permissions -> Contents -> Read and Write (for Personal-Dashboard repo)\n" +
                "• Classic Token: Select 'repo' scope"
            );
            if (token && token.trim()) {
                this.setToken(token.trim());
            } else {
                if (!silent) alert("Cannot save without a GitHub Token. Changes will not be persisted.");
                throw new Error("No GitHub Token provided.");
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
            const bytes = new TextEncoder().encode(contentString);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const contentBase64 = btoa(binary);

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
                throw new Error(err.message || `HTTP ${putRes.status}`);
            }

            if (!silent) alert("Saved successfully to GitHub!");
        } catch (e) {
            console.error("GitHub Save Error:", e);
            const msg = e.message || '';
            if (msg.includes('Resource not accessible') || msg.includes('401') || msg.includes('403') || msg.includes('Bad credentials')) {
                console.warn("Clearing GitHub token due to insufficient permissions or authorization error.");
                this.token = null;
                localStorage.removeItem('GITHUB_TOKEN');
                if (!silent) {
                    alert(
                        "GitHub Token Error: Resource not accessible by personal access token.\n\n" +
                        "Your saved GitHub Token lacks write permission to repository 'Personal-Dashboard'. Your saved token has been cleared.\n\n" +
                        "Next time you save, please provide a token with:\n" +
                        "• Fine-Grained Token: Repository permissions -> Contents -> Read and write\n" +
                        "• Classic Token: 'repo' scope checked"
                    );
                }
            } else if (!silent) {
                alert(`Failed to save to GitHub: ${msg}`);
            }
            throw e;
        }
    }
}

const ghStorage = new GitHubStorage();


/**
 * Version tracking for the local API.
 *
 * The whole dataset is held in memory and written back wholesale on every
 * save, so a tab that loaded hours ago will happily overwrite newer changes
 * made elsewhere. The server stamps each GET with a content version; we send
 * it back on save, and the server refuses the write if the file has moved on.
 */
const dataVersions = {};

const localGet = async (type) => {
    const res = await fetch(`${API_BASE}/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch ${type}`);
    const version = res.headers.get('X-Data-Version');
    if (version) dataVersions[type] = version;
    return await res.json();
};

const localSave = async (type, data) => {
    const headers = { 'Content-Type': 'application/json' };
    if (dataVersions[type]) headers['X-Data-Version'] = dataVersions[type];

    const res = await fetch(`${API_BASE}/${type}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });

    if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        if (body.code === 'VERSION_CONFLICT') {
            // Do NOT retry: this page's copy is stale and saving it would
            // delete whatever changed underneath. Reloading is the safe path.
            const reload = window.confirm(
                `${body.message}\n\nYour unsaved change was not applied. Reload now to get the latest data?`
            );
            if (reload) window.location.reload();
            throw new Error('VERSION_CONFLICT');
        }
        alert(body.message || 'Save refused by the server.');
        throw new Error(body.code || 'SAVE_REFUSED');
    }

    if (!res.ok) throw new Error(`Failed to save ${type}`);

    const version = res.headers.get('X-Data-Version');
    if (version) dataVersions[type] = version;
    return await res.json().catch(() => ({}));
};

/** Re-read everything the app holds — used when a stale tab regains focus. */
const refreshVersions = async () => {
    if (!IS_LOCALHOST) return null;
    const stale = [];
    for (const type of ['novels', 'states', 'writing', 'stories', 'authors', 'clothes']) {
        try {
            const res = await fetch(`${API_BASE}/${type}`, { method: 'HEAD' }).catch(() => null);
            const version = res && res.headers.get('X-Data-Version');
            if (version && dataVersions[type] && version !== dataVersions[type]) stale.push(type);
        } catch (e) { /* offline is fine */ }
    }
    return stale;
};

const api = {
    getNovels: async () => {
        if (IS_LOCALHOST) {
            try {
                return await localGet('novels');
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
                await localSave('novels', data);
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
                return await localGet('states');
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
                await localSave('states', data);
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
                return await localGet('writing');
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
                await localSave('writing', data);
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
                return await localGet('stories');
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
                await localSave('stories', data);
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
                return await localGet('authors');
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
                await localSave('authors', data);
            } catch (e) {
                console.error("Error saving authors:", e);
            }
        } else {
            await ghStorage.saveFile('authors.json', data);
        }
    },

    getClothes: async () => {
        if (IS_LOCALHOST) {
            try {
                return await localGet('clothes');
            } catch (e) {
                console.error(e);
                return [];
            }
        } else {
            return (await ghStorage.getFile('clothes.json')) || [];
        }
    },
    saveClothes: async (data) => {
        if (IS_LOCALHOST) {
            try {
                await localSave('clothes', data);
            } catch (e) {
                console.error("Error saving clothes:", e);
            }
        } else {
            await ghStorage.saveFile('clothes.json', data);
        }
    },

    uploadImage: async (fileData) => {
        if (!IS_LOCALHOST) return null;
        try {
            const res = await fetch(`${API_BASE}/upload-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fileData)
            });
            if (!res.ok) throw new Error('Upload failed');
            return await res.json();
        } catch (e) {
            console.error("Error uploading image:", e);
            return null;
        }
    },

    sync: {
        pullFromOnline: async () => {
            if (!IS_LOCALHOST) throw new Error('Can only sync when running locally.');
            const files = ['novels.json', 'states.json', 'writing.json', 'stories.json', 'authors.json', 'clothes.json'];
            const results = { success: [], failed: [] };
            
            for (const file of files) {
                try {
                    const data = await ghStorage.getFile(file);
                    if (data) {
                        const type = file.replace('.json', '');
                        await fetch(`${API_BASE}/${type}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        results.success.push(file);
                    } else {
                        results.failed.push(file);
                    }
                } catch (e) {
                    console.error(`Error pulling ${file}:`, e);
                    results.failed.push(file);
                }
            }
            return results;
        },
        pushToOnline: async () => {
            if (!IS_LOCALHOST) throw new Error('Can only sync when running locally.');
            if (!ghStorage.token) {
                throw new Error("GitHub token is required to push data. Please set it first.");
            }
            const files = ['novels.json', 'states.json', 'writing.json', 'stories.json', 'authors.json', 'clothes.json'];
            const results = { success: [], failed: [] };
            
            for (const file of files) {
                try {
                    const type = file.replace('.json', '');
                    const res = await fetch(`${API_BASE}/${type}`);
                    if (!res.ok) throw new Error(`Local fetch failed for ${file}`);
                    const localData = await res.json();
                    
                    await ghStorage.saveFile(file, localData, true);
                    results.success.push(file);
                } catch (e) {
                    console.error(`Error pushing ${file}:`, e);
                    results.failed.push(file);
                }
            }
            return results;
        },
        hasToken: () => !!ghStorage.token,
        setToken: (token) => ghStorage.setToken(token),
        clearToken: () => {
            ghStorage.token = null;
            localStorage.removeItem('GITHUB_TOKEN');
        }
    }
};

window.api = api;
// Single source of truth for the local server's address — components that talk
// to endpoints outside the api object (e.g. backup status) should use this
// rather than hardcoding the port again.
window.API_BASE = API_BASE;
window.refreshVersions = refreshVersions;
window.IS_LOCALHOST = IS_LOCALHOST;

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
