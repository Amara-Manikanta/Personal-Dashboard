/**
 * A plain movie list: what is still to watch, and what has been watched.
 *
 * Each movie is { id, title, year, language, status, rating, notes, addedAt }
 * with status 'watchlist' or 'watched' — the shape the home-page card and the
 * search palette already read.
 *
 * Adding is built for speed, since a list is only worth keeping if it is easy
 * to feed: type a title and press Enter, or paste a whole list, one per line.
 */

const MOVIE_STATUS = { watchlist: 'To watch', watched: 'Watched' };

const COMMON_GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family',
    'Fantasy', 'History', 'Horror', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'];

/** A movie's genres as a clean list; older entries simply have none. */
const genresOf = (m) => (Array.isArray(m && m.genres) ? m.genres.filter(Boolean) : []);

const statusOf = (m) => (m && m.status === 'watched' ? 'watched' : 'watchlist');

/** Only web addresses are kept as an image: anything else is not a picture to show. */
const cleanImageUrl = (value) => {
    const url = String(value || '').trim();
    return /^https?:\/\/\S+$/i.test(url) ? url : '';
};

/**
 * "Inception (2010)" → { title: 'Inception', year: '2010' }. The year is
 * optional, and so is a web address on the end of the line, which becomes the
 * poster: "Inception (2010) https://example.com/inception.jpg".
 */
const parseMovieLine = (line) => {
    let text = String(line || '').trim().replace(/\s+/g, ' ');
    let imageUrl = '';
    const withUrl = text.match(/^(.*?)\s+(https?:\/\/\S+)$/i);
    if (withUrl && withUrl[1]) { text = withUrl[1]; imageUrl = cleanImageUrl(withUrl[2]); }
    const m = text.match(/^(.*?)\s*\((\d{4})\)$/);
    return m && m[1]
        ? { title: m[1].trim(), year: m[2], imageUrl }
        : { title: text, year: '', imageUrl };
};

/**
 * A poster, or a film-slate placeholder when there is none or it will not
 * load. Hot-linked images break often, so a dead address must degrade to the
 * placeholder rather than a broken-image icon. No referrer is sent because
 * several image hosts refuse requests that arrive from another site.
 */
const Poster = ({ url, title, size = 'sm' }) => {
    const [failed, setFailed] = React.useState(false);
    React.useEffect(() => setFailed(false), [url]);
    return (
        <span className={`mv-poster is-${size}`}>
            {url && !failed
                ? <img src={url} alt={`${title} poster`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
                : <i className="ph-duotone ph-film-slate" aria-hidden="true"></i>}
        </span>
    );
};

const sameMovie = (a, b) =>
    String(a.title).trim().toLowerCase() === String(b.title).trim().toLowerCase()
    && String(a.year || '') === String(b.year || '');

const Stars = ({ value, onChange, label }) => (
    <span className="mv-stars" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map(n => (
            <button
                key={n}
                type="button"
                className={n <= value ? 'is-on' : ''}
                onClick={() => onChange(n === value ? 0 : n)}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                aria-pressed={n <= value}
            >
                <i className="ph-fill ph-star" aria-hidden="true"></i>
            </button>
        ))}
    </span>
);

window.MoviesDashboard = ({ onBackToHome }) => {
    const { useState, useMemo, useCallback, useRef } = React;

    const [movies, setMovies] = useState(window.moviesData || []);
    const [tab, setTab] = useState('watchlist');      // 'watchlist' | 'watched' | 'all'
    const [query, setQuery] = useState('');
    const [language, setLanguage] = useState('');
    const [genre, setGenre] = useState('');
    const [sortBy, setSortBy] = useState('added');
    const [quick, setQuick] = useState('');
    const [editing, setEditing] = useState(null);     // a movie, or {} for a new one
    const [toast, setToast] = useState(null);
    const quickRef = useRef(null);

    const say = (message, tone = 'info') => {
        setToast({ message, tone });
        window.setTimeout(() => setToast(t => (t && t.message === message ? null : t)), 4000);
    };

    // Persist, then settle the UI. A save the server refuses (a stale tab, say)
    // is rolled back so the screen never shows a change that is not on disk.
    const persist = useCallback(async (next) => {
        const previous = movies;
        setMovies(next);
        window.moviesData = next;
        try {
            await window.api.saveMovies(next);
            return true;
        } catch (err) {
            console.error('Failed to save movies:', err);
            setMovies(previous);
            window.moviesData = previous;
            if (String(err && err.message) !== 'VERSION_CONFLICT') say('Could not save — that change was undone.', 'error');
            return false;
        }
    }, [movies]);

    const counts = useMemo(() => ({
        watchlist: movies.filter(m => statusOf(m) === 'watchlist').length,
        watched: movies.filter(m => statusOf(m) === 'watched').length,
        all: movies.length
    }), [movies]);

    const languages = useMemo(
        () => Array.from(new Set(movies.map(m => m.language).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [movies]
    );

    // Every genre in use across the list, so the filter only offers real ones.
    const usedGenres = useMemo(
        () => Array.from(new Set(movies.flatMap(genresOf))).sort((a, b) => a.localeCompare(b)),
        [movies]
    );

    const directors = useMemo(
        () => Array.from(new Set(movies.map(m => m.director).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [movies]
    );

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const rows = movies.filter(m => {
            if (tab !== 'all' && statusOf(m) !== tab) return false;
            if (language && m.language !== language) return false;
            if (genre && !genresOf(m).includes(genre)) return false;
            if (!q) return true;
            return [m.title, m.year, m.language, m.director, m.notes, ...genresOf(m)].filter(Boolean).some(v => String(v).toLowerCase().includes(q));
        });
        const sorters = {
            added: (a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')),
            title: (a, b) => String(a.title).localeCompare(String(b.title)),
            year: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0),
            rating: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
        };
        return rows.slice().sort(sorters[sortBy]);
    }, [movies, tab, query, language, genre, sortBy]);

    /** Quick add: one title, or many pasted at once, one per line. */
    const addFromText = async (text) => {
        const lines = String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) return;

        const fresh = [];
        let skipped = 0;
        lines.forEach((line, i) => {
            const { title, year, imageUrl } = parseMovieLine(line);
            if (!title) return;
            const candidate = { title, year };
            if ([...movies, ...fresh].some(m => sameMovie(m, candidate))) { skipped++; return; }
            fresh.push({
                id: `${Date.now()}-${i}`,
                title, year, imageUrl, language: '', status: 'watchlist', rating: 0, notes: '',
                addedAt: new Date().toISOString()
            });
        });

        if (!fresh.length) {
            say(skipped ? 'Already on your list.' : 'Nothing to add.', 'info');
            return;
        }
        if (await persist([...fresh, ...movies])) {
            setQuick('');
            if (tab === 'watched') setTab('watchlist');
            say(
                `Added ${fresh.length} movie${fresh.length === 1 ? '' : 's'}${skipped ? ` · ${skipped} already listed` : ''}.`,
                'success'
            );
        }
    };

    const update = (id, patch) => persist(movies.map(m => (m.id === id ? { ...m, ...patch } : m)));

    const toggleWatched = (m) => update(m.id, statusOf(m) === 'watched'
        ? { status: 'watchlist' }
        : { status: 'watched' });

    const remove = async (m) => {
        if (!window.confirm(`Remove “${m.title}” from your list?`)) return;
        if (await persist(movies.filter(x => x.id !== m.id))) say('Removed.', 'success');
    };

    const saveEditor = async (form) => {
        const duplicate = movies.some(m => m.id !== form.id && sameMovie(m, form));
        if (duplicate) { say('That movie is already on your list.', 'error'); return; }
        const exists = movies.some(m => m.id === form.id);
        const next = exists ? movies.map(m => (m.id === form.id ? form : m)) : [form, ...movies];
        if (await persist(next)) { setEditing(null); say(exists ? 'Saved.' : 'Added.', 'success'); }
    };

    return (
        <div className="mv">
            <header className="mv-head">
                <div className="mv-head-left">
                    <button className="mv-back" onClick={onBackToHome} aria-label="Back to home">
                        <i className="ph-bold ph-arrow-left" aria-hidden="true"></i>
                    </button>
                    <div>
                        <h1>Movies</h1>
                        <p>{counts.watched} watched · {counts.watchlist} still to watch</p>
                    </div>
                </div>

                <form
                    className="mv-quick"
                    onSubmit={(e) => { e.preventDefault(); addFromText(quick); }}
                >
                    <i className="ph-bold ph-plus" aria-hidden="true"></i>
                    <input
                        ref={quickRef}
                        value={quick}
                        onChange={(e) => setQuick(e.target.value)}
                        onPaste={(e) => {
                            // A pasted list is added straight away rather than
                            // landing as one long line in a single-line box.
                            const text = e.clipboardData.getData('text');
                            if (/\r?\n/.test(text.trim())) { e.preventDefault(); addFromText(text); }
                        }}
                        placeholder="Add a movie — type a title and press Enter, or paste a list"
                        aria-label="Add a movie"
                    />
                    <button type="button" className="mv-ghost" onClick={() => setEditing({})}>
                        With details
                    </button>
                </form>
            </header>

            <div className="mv-tabs" role="tablist">
                {[['watchlist', 'To watch'], ['watched', 'Watched'], ['all', 'All']].map(([id, label]) => (
                    <button
                        key={id}
                        role="tab"
                        aria-selected={tab === id}
                        className={tab === id ? 'is-active' : ''}
                        onClick={() => setTab(id)}
                    >
                        {label} <span>{counts[id]}</span>
                    </button>
                ))}
            </div>

            <div className="mv-toolbar">
                <div className="mv-search">
                    <i className="ph-bold ph-magnifying-glass" aria-hidden="true"></i>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search movies"
                        aria-label="Search movies"
                    />
                </div>
                {languages.length > 0 && (
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language">
                        <option value="">All languages</option>
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                )}
                {/* Always shown, so the filter is discoverable; it simply has
                    nothing to offer until a movie has been given a genre. */}
                {movies.length > 0 && (
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        aria-label="Filter by genre"
                        disabled={usedGenres.length === 0}
                        title={usedGenres.length === 0 ? 'Give a movie a genre (Edit) to filter by it' : 'Filter by genre'}
                    >
                        <option value="">{usedGenres.length === 0 ? 'No genres yet' : 'All genres'}</option>
                        {usedGenres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                )}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort by">
                    <option value="added">Recently added</option>
                    <option value="title">Title A–Z</option>
                    <option value="year">Newest year first</option>
                    <option value="rating">Highest rated</option>
                </select>
                {(query || language || genre) && (
                    <button className="mv-clear" onClick={() => { setQuery(''); setLanguage(''); setGenre(''); }}>
                        Clear · {visible.length} shown
                    </button>
                )}
            </div>

            {movies.length === 0 ? (
                <div className="mv-empty">
                    <i className="ph-duotone ph-film-slate" aria-hidden="true"></i>
                    <h2>No movies yet</h2>
                    <p>Type a title above and press Enter. You can also paste a whole list, one movie per line — add a year in brackets, like <em>Inception (2010)</em>.</p>
                </div>
            ) : visible.length === 0 ? (
                <div className="mv-empty">
                    <i className="ph-duotone ph-magnifying-glass" aria-hidden="true"></i>
                    <h2>Nothing here</h2>
                    <p>{tab === 'watchlist' && !query && !language && !genre ? 'Everything on your list is watched.' : 'No movie matches those filters.'}</p>
                </div>
            ) : (
                <ul className="mv-list">
                    {visible.map(m => {
                        const watched = statusOf(m) === 'watched';
                        return (
                            <li key={m.id} className={`mv-row ${watched ? 'is-watched' : ''}`}>
                                <button
                                    className="mv-check"
                                    onClick={() => toggleWatched(m)}
                                    aria-label={watched ? `Mark ${m.title} as not watched` : `Mark ${m.title} as watched`}
                                    aria-pressed={watched}
                                    title={watched ? 'Watched — click to undo' : 'Mark as watched'}
                                >
                                    <i className={`ph-${watched ? 'fill ph-check-circle' : 'bold ph-circle'}`} aria-hidden="true"></i>
                                </button>

                                <Poster url={m.imageUrl} title={m.title} />

                                <div className="mv-main">
                                    <span className="mv-title">{m.title}</span>
                                    <span className="mv-meta">
                                        {[m.year, m.language, m.director && `Directed by ${m.director}`].filter(Boolean).join(' · ') || 'No year or language'}
                                    </span>
                                    {genresOf(m).length > 0 && (
                                        <span className="mv-genres" aria-label="Genres">
                                            {genresOf(m).slice(0, 4).map(g => <span key={g} className="mv-chip">{g}</span>)}
                                            {genresOf(m).length > 4 && <span className="mv-chip is-more">+{genresOf(m).length - 4}</span>}
                                        </span>
                                    )}
                                    {m.notes && <span className="mv-notes">{m.notes}</span>}
                                </div>

                                {watched && (
                                    <Stars
                                        value={Number(m.rating) || 0}
                                        onChange={(n) => update(m.id, { rating: n })}
                                        label={`Rating for ${m.title}`}
                                    />
                                )}

                                <div className="mv-actions">
                                    <button onClick={() => setEditing(m)} aria-label={`Edit ${m.title}`} title="Edit">
                                        <i className="ph-bold ph-pencil-simple" aria-hidden="true"></i>
                                    </button>
                                    <button className="is-danger" onClick={() => remove(m)} aria-label={`Remove ${m.title}`} title="Remove">
                                        <i className="ph-bold ph-trash" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {editing && (
                <MovieEditor
                    movie={editing}
                    languages={languages}
                    directors={directors}
                    knownGenres={usedGenres}
                    onCancel={() => setEditing(null)}
                    onSave={saveEditor}
                />
            )}

            {toast && <div className={`mv-toast is-${toast.tone}`} role="status">{toast.message}</div>}

            <MoviesStyles />
        </div>
    );
};

const MovieEditor = ({ movie, languages, directors, knownGenres, onCancel, onSave }) => {
    const { useState } = React;
    const isNew = !movie.id;
    const [form, setForm] = useState({
        title: movie.title || '',
        year: movie.year || '',
        language: movie.language || '',
        status: statusOf(movie),
        rating: Number(movie.rating) || 0,
        notes: movie.notes || '',
        imageUrl: movie.imageUrl || '',
        director: movie.director || '',
        genres: genresOf(movie)
    });
    const [customGenre, setCustomGenre] = useState('');
    const [addingNew, setAddingNew] = useState(false);
    const [urlError, setUrlError] = useState('');
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // Everything offered as a tag: the common set, then any of your own, then
    // whatever this movie already carries.
    const genreOptions = [...COMMON_GENRES, ...knownGenres, ...form.genres]
        .filter((g, i, all) => all.findIndex(x => x.toLowerCase() === g.toLowerCase()) === i);

    const addGenre = (g) => setForm(f => (f.genres.includes(g) ? f : { ...f, genres: [...f.genres, g] }));
    const removeGenre = (g) => setForm(f => ({ ...f, genres: f.genres.filter(x => x !== g) }));

    // The dropdown is only a way to choose: it snaps back to its prompt after
    // every pick, and a genre already chosen is no longer offered.
    const pickFromDropdown = (value) => {
        if (value === '__new__') { setAddingNew(true); return; }
        if (value) addGenre(value);
    };

    // A typed genre matches an existing one regardless of case, so "sci-fi"
    // selects "Sci-Fi" instead of creating a lookalike beside it.
    const addCustomGenre = () => {
        const typed = customGenre.trim().replace(/\s+/g, ' ').slice(0, 30);
        if (!typed) return;
        const existing = genreOptions.find(g => g.toLowerCase() === typed.toLowerCase()) || typed;
        addGenre(existing);
        setCustomGenre('');
        setAddingNew(false);
    };

    const submit = (e) => {
        e.preventDefault();
        const title = form.title.trim();
        if (!title) return;

        const typed = form.imageUrl.trim();
        const imageUrl = cleanImageUrl(typed);
        // A mistyped address should be said so, not silently thrown away.
        if (typed && !imageUrl) {
            setUrlError('That is not a web address — it should start with http:// or https://');
            return;
        }
        onSave({
            id: movie.id || `${Date.now()}`,
            title,
            year: String(form.year).trim(),
            language: form.language.trim(),
            status: form.status,
            // A rating only means something once the movie is watched.
            rating: form.status === 'watched' ? form.rating : 0,
            notes: form.notes.trim(),
            imageUrl,
            director: form.director.trim().replace(/\s+/g, ' '),
            genres: form.genres,
            addedAt: movie.addedAt || new Date().toISOString()
        });
    };

    return (
        <div className="mv-backdrop" onClick={onCancel}>
            <form className="mv-dialog" onClick={(e) => e.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label={isNew ? 'Add a movie' : 'Edit movie'}>
                <h2>{isNew ? 'Add a movie' : 'Edit movie'}</h2>

                <label htmlFor="mv-title">Title</label>
                <input id="mv-title" value={form.title} onChange={(e) => set('title', e.target.value)} autoFocus required />

                <div className="mv-two">
                    <div>
                        <label htmlFor="mv-year">Year</label>
                        <input id="mv-year" type="number" min="1888" max={new Date().getFullYear() + 3} value={form.year} onChange={(e) => set('year', e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="mv-lang">Language</label>
                        <input id="mv-lang" list="mv-lang-options" value={form.language} onChange={(e) => set('language', e.target.value)} placeholder="e.g. Telugu" />
                        <datalist id="mv-lang-options">
                            {['English', 'Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada', ...languages]
                                .filter((l, i, a) => a.indexOf(l) === i)
                                .map(l => <option key={l} value={l} />)}
                        </datalist>
                    </div>
                </div>

                <label htmlFor="mv-genre-select">Genres</label>
                <select
                    id="mv-genre-select"
                    className="mv-select"
                    value=""
                    onChange={(e) => pickFromDropdown(e.target.value)}
                >
                    <option value="">{form.genres.length ? 'Add another genre…' : 'Choose a genre…'}</option>
                    {genreOptions.filter(g => !form.genres.includes(g)).map(g => <option key={g} value={g}>{g}</option>)}
                    <option value="__new__">＋ New genre…</option>
                </select>

                {form.genres.length > 0 && (
                    <div className="mv-genre-picker" role="list" aria-label="Chosen genres">
                        {form.genres.map(g => (
                            <button
                                type="button"
                                role="listitem"
                                key={g}
                                className="mv-chip is-pick is-on"
                                onClick={() => removeGenre(g)}
                                aria-label={`Remove ${g}`}
                                title="Click to remove"
                            >
                                {g}
                                <i className="ph-bold ph-x" aria-hidden="true"></i>
                            </button>
                        ))}
                    </div>
                )}

                {addingNew && (
                    <div className="mv-genre-add">
                        <input
                            value={customGenre}
                            onChange={(e) => setCustomGenre(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomGenre(); } }}
                            placeholder="Name the new genre"
                            aria-label="New genre name"
                            autoFocus
                        />
                        <button type="button" className="mv-ghost" onClick={addCustomGenre}>Add</button>
                    </div>
                )}

                <label htmlFor="mv-director">Director</label>
                <input id="mv-director" list="mv-director-options" value={form.director} onChange={(e) => set('director', e.target.value)} placeholder="e.g. Christopher Nolan" autoComplete="off" />
                <datalist id="mv-director-options">
                    {directors.map(d => <option key={d} value={d} />)}
                </datalist>

                <label>Status</label>
                <div className="mv-seg" role="group" aria-label="Status">
                    {Object.entries(MOVIE_STATUS).map(([id, label]) => (
                        <button type="button" key={id} className={form.status === id ? 'is-on' : ''} aria-pressed={form.status === id} onClick={() => set('status', id)}>
                            {label}
                        </button>
                    ))}
                </div>

                {form.status === 'watched' && (
                    <>
                        <label>Your rating</label>
                        <Stars value={form.rating} onChange={(n) => set('rating', n)} label="Your rating" />
                    </>
                )}

                <label htmlFor="mv-image">Image URL</label>
                <div className="mv-image-field">
                    <div>
                        <input
                            id="mv-image"
                            type="url"
                            value={form.imageUrl}
                            onChange={(e) => { set('imageUrl', e.target.value); setUrlError(''); }}
                            placeholder="https://… link to the poster"
                            aria-describedby={urlError ? 'mv-image-error' : undefined}
                            aria-invalid={!!urlError}
                        />
                        {urlError && <p id="mv-image-error" className="mv-error">{urlError}</p>}
                    </div>
                    <Poster url={cleanImageUrl(form.imageUrl)} title={form.title || 'Movie'} size="md" />
                </div>

                <label htmlFor="mv-notes">Notes</label>
                <textarea id="mv-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Why you want to see it, or what you thought" />

                <div className="mv-dialog-actions">
                    <button type="button" className="mv-ghost" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="mv-primary">{isNew ? 'Add movie' : 'Save'}</button>
                </div>
            </form>
        </div>
    );
};

const MoviesStyles = () => (
    <style>{`
        .mv {
            /* The app-wide muted grey is 3.9:1 on dark cards, under the 4.5:1
               small text needs; this page uses a lighter one that measures 7:1. */
            --mv-muted: #94a3b8;
            --mv-accent: #fb7185;
            min-height: 100vh;
            background: var(--bg-app);
            color: var(--text-primary);
            padding: 2rem;
            max-width: 1000px;
            margin: 0 auto;
        }

        .mv-head { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }
        .mv-head-left { display: flex; align-items: center; gap: 1.1rem; }
        .mv-head h1 { margin: 0; font-size: 2rem; font-weight: 800; }
        .mv-head p { margin: 0.15rem 0 0; color: var(--mv-muted); font-size: 0.9rem; }

        .mv-back {
            width: 42px; height: 42px; border-radius: var(--radius-md);
            background: var(--bg-surface); border: 1px solid var(--border);
            color: var(--text-secondary); cursor: pointer; font-size: 1.1rem;
        }
        .mv-back:hover { color: var(--text-primary); border-color: var(--border-hover); }

        .mv-quick {
            display: flex; align-items: center; gap: 0.6rem;
            padding: 0.4rem 0.5rem 0.4rem 1rem;
            background: var(--bg-surface); border: 1px solid var(--border);
            border-radius: var(--radius-lg);
        }
        .mv-quick:focus-within { border-color: var(--mv-accent); }
        .mv-quick > i { color: var(--mv-accent); }
        .mv-quick input {
            flex: 1; min-width: 0; background: none; border: none; outline: none;
            color: var(--text-primary); font-family: inherit; font-size: 1rem; padding: 0.5rem 0;
        }
        .mv-quick input::placeholder { color: var(--mv-muted); }

        .mv-ghost, .mv-primary {
            font-family: inherit; font-size: 0.88rem; font-weight: 600; cursor: pointer;
            padding: 0.55rem 1rem; border-radius: var(--radius-md); white-space: nowrap;
        }
        .mv-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
        .mv-ghost:hover { color: var(--text-primary); border-color: var(--border-hover); }
        .mv-primary { background: var(--mv-accent); color: #2a0a10; border: 1px solid var(--mv-accent); }
        .mv-primary:hover { filter: brightness(1.08); }

        .mv-tabs { display: flex; gap: 0.4rem; border-bottom: 1px solid var(--border); margin-bottom: 1.25rem; }
        .mv-tabs button {
            background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px;
            color: var(--mv-muted); font-family: inherit; font-size: 0.95rem; font-weight: 600;
            padding: 0.6rem 1rem; cursor: pointer;
        }
        .mv-tabs button:hover { color: var(--text-primary); }
        .mv-tabs button.is-active { color: var(--mv-accent); border-bottom-color: var(--mv-accent); }
        .mv-tabs span {
            font-size: 0.75rem; background: rgba(255,255,255,0.07); border-radius: 99px;
            padding: 0.05rem 0.5rem; margin-left: 0.3rem; font-variant-numeric: tabular-nums;
        }

        .mv-toolbar { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; margin-bottom: 1.25rem; }
        .mv-search { position: relative; flex: 1; min-width: 200px; }
        .mv-search i { position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: var(--mv-muted); }
        .mv-search input, .mv-toolbar select {
            background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md);
            color: var(--text-primary); font-family: inherit; font-size: 0.9rem; outline: none;
        }
        .mv-search input { width: 100%; padding: 0.6rem 0.9rem 0.6rem 2.4rem; }
        .mv-toolbar select { padding: 0.6rem 0.8rem; cursor: pointer; }
        .mv-clear { background: none; border: none; color: var(--mv-muted); font-family: inherit; font-size: 0.85rem; text-decoration: underline; cursor: pointer; }

        .mv-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }

        .mv-row {
            display: flex; align-items: center; gap: 0.9rem;
            padding: 0.75rem 1rem; background: var(--bg-surface);
            border: 1px solid var(--border); border-radius: var(--radius-lg);
            transition: border-color 0.2s ease;
        }
        .mv-row:hover, .mv-row:focus-within { border-color: var(--border-hover); }

        .mv-check {
            flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%;
            background: none; border: none; cursor: pointer; font-size: 1.6rem;
            color: var(--mv-muted); display: flex; align-items: center; justify-content: center;
        }
        .mv-check:hover { color: var(--mv-accent); }
        .mv-row.is-watched .mv-check { color: #34d399; }

        .mv-poster {
            flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;
            background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--mv-muted);
        }
        .mv-poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .mv-poster.is-sm { width: 44px; height: 64px; border-radius: 6px; font-size: 1.4rem; }
        .mv-poster.is-md { width: 60px; height: 88px; border-radius: 8px; font-size: 1.8rem; }
        .mv-image-field { display: flex; gap: 0.8rem; align-items: flex-start; }
        .mv-image-field > div { flex: 1; min-width: 0; }
        .mv-error { margin: 0.4rem 0 0; font-size: 0.8rem; color: #fca5a5; }

        .mv-genres { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.25rem 0 0.1rem; }
        .mv-chip {
            font-family: inherit; font-size: 0.75rem; line-height: 1.2; color: var(--text-secondary);
            background: rgba(251,113,133,0.1); border: 1px solid rgba(251,113,133,0.25);
            border-radius: 99px; padding: 0.12rem 0.55rem; white-space: nowrap;
        }
        .mv-chip.is-more { background: rgba(255,255,255,0.05); border-color: var(--border); color: var(--mv-muted); }
        .mv-chip.is-pick {
            display: inline-flex; align-items: center; gap: 0.25rem; cursor: pointer;
            background: transparent; border-color: var(--border); color: var(--mv-muted); padding: 0.3rem 0.7rem; font-size: 0.8rem;
        }
        .mv-chip.is-pick:hover { color: var(--text-primary); border-color: var(--border-hover); }
        .mv-chip.is-pick.is-on { background: rgba(251,113,133,0.16); border-color: var(--mv-accent); color: #ffe4e8; }
        .mv-genre-picker { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .mv-genre-add { display: flex; gap: 0.5rem; margin-top: 0.3rem; }
        .mv-genre-add input { flex: 1; }
        .mv-select {
            width: 100%; background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-md);
            color: var(--text-primary); padding: 0.6rem 0.75rem; font-family: inherit; font-size: 0.95rem; outline: none; cursor: pointer;
        }
        .mv-select:focus { border-color: var(--mv-accent); }
        .mv-toolbar select:disabled { opacity: 0.55; cursor: not-allowed; }

        .mv-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
        .mv-title { font-weight: 600; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mv-meta { color: var(--mv-muted); font-size: 0.82rem; }
        .mv-notes { color: var(--text-secondary); font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .mv-stars { display: inline-flex; gap: 0.1rem; flex-shrink: 0; }
        .mv-stars button { background: none; border: none; padding: 0.15rem; cursor: pointer; color: rgba(255,255,255,0.18); font-size: 1.05rem; }
        .mv-stars button.is-on { color: #fbbf24; }
        .mv-stars button:hover { color: #fcd34d; }

        .mv-actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.2s ease; }
        .mv-row:hover .mv-actions, .mv-row:focus-within .mv-actions { opacity: 1; }
        .mv-actions button {
            width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
            background: rgba(255,255,255,0.05); color: var(--text-secondary);
        }
        .mv-actions button:hover { color: var(--text-primary); background: rgba(255,255,255,0.1); }
        .mv-actions button.is-danger:hover { color: #fca5a5; }

        .mv-empty { text-align: center; padding: 4rem 1rem; color: var(--mv-muted); }
        .mv-empty i { font-size: 3.5rem; color: var(--mv-accent); opacity: 0.7; }
        .mv-empty h2 { color: var(--text-secondary); font-size: 1.2rem; margin: 1rem 0 0.4rem; }
        .mv-empty p { max-width: 460px; margin: 0 auto; line-height: 1.6; }

        .mv-toast {
            position: fixed; bottom: 1.5rem; right: 1.5rem; max-width: 360px; z-index: 1300;
            padding: 0.75rem 1.1rem; border-radius: var(--radius-md); font-size: 0.9rem;
            border: 1px solid; background: #11141c;
        }
        .mv-toast.is-success { border-color: rgba(16,185,129,0.5); color: #6ee7b7; }
        .mv-toast.is-error { border-color: rgba(239,68,68,0.5); color: #fca5a5; }
        .mv-toast.is-info { border-color: rgba(99,102,241,0.5); color: #c7d2fe; }

        .mv-backdrop {
            position: fixed; inset: 0; z-index: 1100; padding: 1.5rem;
            background: rgba(4,5,8,0.8); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
        }
        .mv-dialog {
            width: min(480px, 100%); max-height: 90vh; overflow-y: auto;
            background: #11141c; border: 1px solid var(--border-hover);
            border-radius: var(--radius-lg); padding: 1.5rem;
            display: flex; flex-direction: column; gap: 0.4rem;
        }
        .mv-dialog h2 { margin: 0 0 0.6rem; font-size: 1.3rem; }
        .mv-dialog label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.5rem; }
        .mv-dialog input, .mv-dialog textarea {
            width: 100%; background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-md);
            color: var(--text-primary); padding: 0.6rem 0.75rem; font-family: inherit; font-size: 0.95rem; outline: none;
        }
        .mv-dialog textarea { resize: vertical; min-height: 70px; }
        .mv-dialog input:focus, .mv-dialog textarea:focus { border-color: var(--mv-accent); }
        .mv-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
        .mv-two > div { display: flex; flex-direction: column; gap: 0.4rem; }
        .mv-seg { display: inline-flex; background: var(--bg-app); border: 1px solid var(--border); border-radius: 99px; padding: 3px; width: max-content; }
        .mv-seg button { background: none; border: none; color: var(--mv-muted); font-family: inherit; font-size: 0.85rem; font-weight: 600; padding: 0.35rem 1rem; border-radius: 99px; cursor: pointer; }
        .mv-seg button.is-on { background: var(--mv-accent); color: #2a0a10; }
        .mv-dialog-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }

        .mv button:focus-visible, .mv input:focus-visible, .mv select:focus-visible, .mv textarea:focus-visible {
            outline: 2px solid #fda4af; outline-offset: 2px;
        }

        @media (pointer: coarse) {
            .mv-actions { opacity: 1; }
            .mv-actions button, .mv-check { width: 44px; height: 44px; }
            .mv-stars button { padding: 0.35rem; }
        }
        @media (max-width: 640px) {
            .mv { padding: 1.1rem; }
            .mv-row { flex-wrap: wrap; }
            .mv-two { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) { .mv * { transition: none !important; } }
    `}</style>
);
