/**
 * Reading stats for the novels dashboard.
 *
 * Built only on fields that carry real data. Two that look tempting are left
 * out on purpose: readMonth is 5 for most books and the Goodreads rating is
 * 4.5 for most — both read as form defaults rather than anything recorded,
 * and a chart of a default is a chart of nothing.
 */

const isReadNovel = (n) => n.status === 'Read' || n.status === 'Tried';

// Year from the completion date when there is one, else the readYear field.
// Sliced from the string rather than parsed: new Date('2024-01-01') is the
// previous evening west of UTC, which would move the book a year back.
const readYearOf = (n) => {
    const fromDate = String(n.completedDate || '').match(/^(\d{4})/);
    if (fromDate) return Number(fromDate[1]);
    const y = parseInt(n.readYear, 10);
    return y > 1900 ? y : null;
};

const pagesOf = (n) => {
    const p = Number(n.pages);
    if (p > 0) return p;
    if (n.progressType === 'pages' && Number(n.progress) > 0) return Number(n.progress);
    return 0;
};

const authorsOf = (n) => String(n.author || '').split(',').map(a => a.trim()).filter(Boolean);

const formatNumber = (n) => Math.round(n).toLocaleString('en-IN');

window.NovelStats = ({ novels, onAuthorClick }) => {
    const { useState, useMemo } = React;
    const [yearMetric, setYearMetric] = useState('books');   // 'books' | 'pages'
    const [showAllAuthors, setShowAllAuthors] = useState(false);
    const [authorQuery, setAuthorQuery] = useState('');
    const [showAllGenres, setShowAllGenres] = useState(false);

    const data = useMemo(() => {
        const read = novels.filter(isReadNovel);

        // ---- per year, with empty years filled so gaps show as gaps ----
        const byYear = {};
        read.forEach(n => {
            const y = readYearOf(n);
            if (!y) return;
            if (!byYear[y]) byYear[y] = { books: 0, pages: 0 };
            byYear[y].books += 1;
            byYear[y].pages += pagesOf(n);
        });
        const yearKeys = Object.keys(byYear).map(Number);
        const years = [];
        if (yearKeys.length) {
            for (let y = Math.min(...yearKeys); y <= Math.max(...yearKeys); y++) {
                years.push({ year: y, ...(byYear[y] || { books: 0, pages: 0 }) });
            }
        }

        // ---- authors: read vs everything on the list ----
        const authorMap = {};
        novels.forEach(n => authorsOf(n).forEach(a => {
            if (!authorMap[a]) authorMap[a] = { name: a, read: 0, total: 0 };
            authorMap[a].total += 1;
            if (isReadNovel(n)) authorMap[a].read += 1;
        }));
        const authors = Object.values(authorMap)
            .filter(a => a.read > 0)
            .sort((a, b) => b.read - a.read || b.total - a.total || a.name.localeCompare(b.name));

        // ---- genres ----
        const genreMap = {};
        novels.forEach(n => {
            const g = n.genre || 'Uncategorized';
            if (!genreMap[g]) genreMap[g] = { name: g, read: 0, total: 0 };
            genreMap[g].total += 1;
            if (isReadNovel(n)) genreMap[g].read += 1;
        });
        const genres = Object.values(genreMap).sort((a, b) => b.read - a.read || b.total - a.total);

        // ---- my ratings, half stars folded down to the star below ----
        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const rated = read.filter(n => Number(n.rating) > 0);
        rated.forEach(n => {
            const r = Math.max(1, Math.min(5, Math.floor(Number(n.rating))));
            ratingCounts[r] += 1;
        });
        const avgRating = rated.length
            ? rated.reduce((s, n) => s + Number(n.rating), 0) / rated.length
            : 0;

        // ---- headline numbers ----
        const totalPages = read.reduce((s, n) => s + pagesOf(n), 0);
        const withPages = read.filter(n => pagesOf(n) > 0);
        const longest = withPages.slice().sort((a, b) => pagesOf(b) - pagesOf(a))[0];
        const bestYear = years.slice().sort((a, b) => b.books - a.books)[0];
        const thisYear = new Date().getFullYear();
        const completedAuthors = authors.filter(a => a.read === a.total && a.total > 1);
        const favourites = read.filter(n => Number(n.rating) >= 5);

        return {
            read,
            years,
            authors,
            genres,
            ratingCounts,
            ratedCount: rated.length,
            avgRating,
            totalPages,
            avgPages: withPages.length ? totalPages / withPages.length : 0,
            longest,
            bestYear,
            thisYearCount: (byYear[thisYear] || { books: 0 }).books,
            lastYearCount: (byYear[thisYear - 1] || { books: 0 }).books,
            avgPerYear: years.length ? read.filter(n => readYearOf(n)).length / years.length : 0,
            thisYear,
            reading: novels.filter(n => n.status === 'Currently Reading').length,
            toRead: novels.filter(n => ['TBR', 'To Be Read', 'Having'].includes(n.status)).length,
            onShelf: novels.filter(n => n.ownership === 'home').length,
            lent: novels.filter(n => n.ownership === 'lent').length,
            completedAuthors,
            favourites
        };
    }, [novels]);

    if (!data.read.length) {
        return (
            <div className="nst">
                <div className="nst-empty">
                    <i className="ph-duotone ph-books"></i>
                    <p>Mark a book as read and your stats will start here.</p>
                </div>
                <NovelStatsStyles />
            </div>
        );
    }

    const yearMax = Math.max(1, ...data.years.map(y => y[yearMetric]));
    const q = authorQuery.trim().toLowerCase();
    const authorList = data.authors.filter(a => !q || a.name.toLowerCase().includes(q));
    const visibleAuthors = (showAllAuthors || q) ? authorList : authorList.slice(0, 10);
    const authorMax = Math.max(1, ...data.authors.map(a => a.total));
    const genreMax = Math.max(1, ...data.genres.map(g => g.total));
    const ratingMax = Math.max(1, ...Object.values(data.ratingCounts));

    const tiles = [
        { icon: 'ph-book-open-text', label: 'Books read', value: formatNumber(data.read.length), sub: `${data.thisYearCount} in ${data.thisYear}`, tone: 'indigo' },
        { icon: 'ph-files', label: 'Pages read', value: formatNumber(data.totalPages), sub: `~${formatNumber(data.avgPages)} per book`, tone: 'pink' },
        { icon: 'ph-users-three', label: 'Authors', value: formatNumber(data.authors.length), sub: `${data.completedAuthors.length} fully read`, tone: 'cyan' },
        { icon: 'ph-star', label: 'Average rating', value: data.avgRating ? data.avgRating.toFixed(1) : '—', sub: `${data.favourites.length} five-star reads`, tone: 'amber' },
        { icon: 'ph-bookmark-simple', label: 'Reading now', value: data.reading, sub: `${data.toRead} waiting`, tone: 'green' },
        { icon: 'ph-house-line', label: 'On your shelf', value: data.onShelf, sub: data.lent ? `${data.lent} lent out` : 'none lent out', tone: 'violet' }
    ];

    return (
        <div className="nst">
            <div className="nst-tiles">
                {tiles.map(t => (
                    <div key={t.label} className={`nst-tile is-${t.tone}`}>
                        <i className={`ph-fill ${t.icon}`} aria-hidden="true"></i>
                        <span className="nst-tile-value">{t.value}</span>
                        <span className="nst-tile-label">{t.label}</span>
                        <span className="nst-tile-sub">{t.sub}</span>
                    </div>
                ))}
            </div>

            {/* ---- Reading over the years ---- */}
            <section className="nst-card nst-years">
                <header className="nst-card-head">
                    <div>
                        <h3>Reading over the years</h3>
                        {/* The written summary is the chart's text equivalent:
                            it states what the bars show for anyone not reading them. */}
                        {data.bestYear && (
                            <p>
                                Best year <strong>{data.bestYear.year}</strong> with {data.bestYear.books} books ·
                                about {data.avgPerYear.toFixed(1)} a year across {data.years.length} years ·
                                {' '}{data.thisYearCount} so far in {data.thisYear}
                                {data.lastYearCount ? ` (${data.lastYearCount} in ${data.thisYear - 1})` : ''}
                            </p>
                        )}
                    </div>
                    <div className="nst-seg" role="group" aria-label="Measure">
                        {[['books', 'Books'], ['pages', 'Pages']].map(([id, label]) => (
                            <button
                                key={id}
                                className={yearMetric === id ? 'is-on' : ''}
                                onClick={() => setYearMetric(id)}
                                aria-pressed={yearMetric === id}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="nst-yearchart" role="list" aria-label={`${yearMetric === 'books' ? 'Books' : 'Pages'} read per year`}>
                    {data.years.map(y => {
                        const v = y[yearMetric];
                        const isBest = data.bestYear && y.year === data.bestYear.year;
                        const summary = `${y.year}: ${y.books} book${y.books === 1 ? '' : 's'}, ${formatNumber(y.pages)} pages${isBest ? ', best year' : ''}`;
                        return (
                            <div
                                key={y.year}
                                role="listitem"
                                tabIndex={0}
                                aria-label={summary}
                                className={`nst-yearcol ${isBest ? 'is-best' : ''} ${v === 0 ? 'is-empty' : ''}`}
                                title={summary}
                            >
                                <span className="nst-yearval">
                                    {isBest && <i className="ph-fill ph-crown-simple" aria-hidden="true"></i>}
                                    {v ? (yearMetric === 'pages' && v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v) : ''}
                                </span>
                                <div className="nst-yearbar" style={{ height: `${Math.max(v ? 3 : 0, (v / yearMax) * 100)}%` }}></div>
                                <span className="nst-yearlabel">{String(y.year).slice(2)}</span>
                            </div>
                        );
                    })}
                </div>

                <details className="nst-table">
                    <summary>View as a table</summary>
                    <table>
                        <thead>
                            <tr><th scope="col">Year</th><th scope="col">Books</th><th scope="col">Pages</th></tr>
                        </thead>
                        <tbody>
                            {data.years.slice().reverse().filter(y => y.books).map(y => (
                                <tr key={y.year}>
                                    <th scope="row">{y.year}{data.bestYear && y.year === data.bestYear.year ? ' (best)' : ''}</th>
                                    <td>{y.books}</td>
                                    <td>{formatNumber(y.pages)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </details>
            </section>

            <div className="nst-grid">
                {/* ---- Authors ---- */}
                <section className="nst-card">
                    <header className="nst-card-head">
                        <div>
                            <h3>Authors</h3>
                            <p>Read out of everything of theirs on your list</p>
                        </div>
                        <div className="nst-search">
                            <i className="ph-bold ph-magnifying-glass"></i>
                            <input
                                value={authorQuery}
                                onChange={(e) => setAuthorQuery(e.target.value)}
                                placeholder="Find author"
                                aria-label="Find author"
                            />
                        </div>
                    </header>

                    <ol className="nst-rank">
                        {visibleAuthors.map((a, i) => {
                            const complete = a.read === a.total;
                            return (
                                <li key={a.name}>
                                    <button
                                        className="nst-rank-row"
                                        onClick={() => onAuthorClick && onAuthorClick(a.name)}
                                        title={`Open ${a.name}`}
                                    >
                                        <span className="nst-rank-pos">{q ? '' : i + 1}</span>
                                        <span className="nst-rank-name">
                                            {a.name}
                                            {complete && a.total > 1 && (
                                                <i className="ph-fill ph-check-circle nst-done" title="Everything on your list read"></i>
                                            )}
                                        </span>
                                        <span className="nst-rank-bar">
                                            <span className="nst-rank-total" style={{ width: `${(a.total / authorMax) * 100}%` }}></span>
                                            <span className="nst-rank-read" style={{ width: `${(a.read / authorMax) * 100}%` }}></span>
                                        </span>
                                        <span className="nst-rank-count">{a.read}<em>/{a.total}</em></span>
                                    </button>
                                </li>
                            );
                        })}
                        {visibleAuthors.length === 0 && <li className="nst-none">No author matches “{authorQuery}”.</li>}
                    </ol>

                    {!q && authorList.length > 10 && (
                        <button className="nst-more" onClick={() => setShowAllAuthors(v => !v)}>
                            {showAllAuthors ? 'Show top 10' : `Show all ${authorList.length} authors`}
                            <i className={`ph-bold ${showAllAuthors ? 'ph-caret-up' : 'ph-caret-down'}`}></i>
                        </button>
                    )}
                </section>

                {/* ---- Genres ---- */}
                <section className="nst-card">
                    <header className="nst-card-head">
                        <div>
                            <h3>Genres</h3>
                            <p>{data.genres.length} genres across your list</p>
                        </div>
                        <div className="nst-legend">
                            <span><i className="is-read"></i>Read</span>
                            <span><i className="is-total"></i>On list</span>
                        </div>
                    </header>

                    <ul className="nst-bars">
                        {(showAllGenres ? data.genres : data.genres.slice(0, 10)).map(g => (
                            <li key={g.name} title={`${g.name}: ${g.read} read of ${g.total}`}>
                                <span className="nst-bars-name">{g.name}</span>
                                <span className="nst-bars-track">
                                    <span className="nst-rank-total" style={{ width: `${(g.total / genreMax) * 100}%` }}></span>
                                    <span className="nst-rank-read is-pink" style={{ width: `${(g.read / genreMax) * 100}%` }}></span>
                                </span>
                                <span className="nst-rank-count">{g.read}<em>/{g.total}</em></span>
                            </li>
                        ))}
                    </ul>

                    {data.genres.length > 10 && (
                        <button className="nst-more" onClick={() => setShowAllGenres(v => !v)}>
                            {showAllGenres ? 'Show top 10' : `Show all ${data.genres.length} genres`}
                            <i className={`ph-bold ${showAllGenres ? 'ph-caret-up' : 'ph-caret-down'}`}></i>
                        </button>
                    )}
                </section>

                {/* ---- My ratings ---- */}
                <section className="nst-card">
                    <header className="nst-card-head">
                        <div>
                            <h3>How you rate</h3>
                            <p>{data.ratedCount} rated · average {data.avgRating.toFixed(2)}</p>
                        </div>
                    </header>

                    <ul className="nst-ratings">
                        {[5, 4, 3, 2, 1].map(star => (
                            <li key={star}>
                                <span className="nst-stars">
                                    {star}<i className="ph-fill ph-star"></i>
                                </span>
                                <span className="nst-bars-track">
                                    <span
                                        className="nst-rank-read is-amber"
                                        style={{ width: `${(data.ratingCounts[star] / ratingMax) * 100}%` }}
                                    ></span>
                                </span>
                                <span className="nst-rank-count">{data.ratingCounts[star]}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* ---- Highlights ---- */}
                <section className="nst-card">
                    <header className="nst-card-head">
                        <div>
                            <h3>Highlights</h3>
                            <p>A few things worth knowing</p>
                        </div>
                    </header>

                    <ul className="nst-facts">
                        {data.longest && (
                            <li>
                                <i className="ph-fill ph-ruler"></i>
                                <div>
                                    <span>Longest book read</span>
                                    <strong>{data.longest.title}</strong>
                                    <em>{formatNumber(pagesOf(data.longest))} pages</em>
                                </div>
                            </li>
                        )}
                        {data.authors[0] && (
                            <li>
                                <i className="ph-fill ph-crown-simple"></i>
                                <div>
                                    <span>Most-read author</span>
                                    <strong>{data.authors[0].name}</strong>
                                    <em>{data.authors[0].read} books</em>
                                </div>
                            </li>
                        )}
                        {data.genres[0] && (
                            <li>
                                <i className="ph-fill ph-tag"></i>
                                <div>
                                    <span>Favourite genre</span>
                                    <strong>{data.genres[0].name}</strong>
                                    <em>{data.genres[0].read} read</em>
                                </div>
                            </li>
                        )}
                        {data.completedAuthors.length > 0 && (
                            <li>
                                <i className="ph-fill ph-seal-check"></i>
                                <div>
                                    <span>Authors you have read everything by</span>
                                    <strong>{data.completedAuthors.slice(0, 3).map(a => a.name).join(', ')}</strong>
                                    <em>
                                        {data.completedAuthors.length > 3
                                            ? `and ${data.completedAuthors.length - 3} more`
                                            : 'of the books on your list'}
                                    </em>
                                </div>
                            </li>
                        )}
                    </ul>
                </section>
            </div>

            <NovelStatsStyles />
        </div>
    );
};

const NovelStatsStyles = () => (
    <style>{`
        .nst {
            /* The app-wide muted grey is 3.9:1 on these cards, under the
               4.5:1 small text needs. Lifted here rather than globally so the
               rest of the app is untouched; #94a3b8 measures 7.2:1. */
            --text-muted: #94a3b8;
            max-width: 1180px;
            margin: 0 auto;
            padding: 1.5rem 1.5rem 4rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .nst-empty { text-align: center; padding: 5rem 1rem; color: var(--text-muted); }
        .nst-empty i { font-size: 4rem; color: var(--primary); opacity: 0.6; }

        /* Tiles */
        .nst-tiles {
            display: grid;
            /* Fixed counts rather than auto-fit: six tiles auto-fitting at
               this width wrapped five and one, stranding a tile on its own. */
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 1rem;
        }

        @media (max-width: 1100px) { .nst-tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .nst-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

        .nst-tile {
            --tone: 99, 102, 241;
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
            padding: 1.1rem 1.2rem;
            background: rgba(17, 20, 28, 0.72);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            overflow: hidden;
        }

        .nst-tile::before {
            content: '';
            position: absolute;
            inset: 0 0 auto 0;
            height: 2px;
            background: rgb(var(--tone));
            opacity: 0.8;
        }

        .nst-tile > i { font-size: 1.25rem; color: rgb(var(--tone)); margin-bottom: 0.35rem; }
        .nst-tile-value { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); font-variant-numeric: tabular-nums; line-height: 1.1; }
        .nst-tile-label { font-size: 0.78rem; color: var(--text-secondary); font-weight: 600; }
        .nst-tile-sub { font-size: 0.75rem; color: var(--text-muted); }

        .nst-tile.is-indigo { --tone: 129, 140, 248; }
        .nst-tile.is-pink { --tone: 244, 114, 182; }
        .nst-tile.is-cyan { --tone: 34, 211, 238; }
        .nst-tile.is-amber { --tone: 251, 191, 36; }
        .nst-tile.is-green { --tone: 52, 211, 153; }
        .nst-tile.is-violet { --tone: 192, 132, 252; }

        /* Cards */
        .nst-card {
            background: rgba(17, 20, 28, 0.72);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 1.25rem 1.35rem;
            min-width: 0;
        }

        .nst-card-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.1rem;
        }

        .nst-card-head h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
        .nst-card-head p { margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--text-muted); }
        .nst-card-head p strong { color: var(--text-secondary); }

        .nst-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.5rem;
            align-items: start;
        }

        /* Segmented control */
        .nst-seg {
            display: inline-flex;
            background: rgba(255,255,255,0.04);
            border: 1px solid var(--border);
            border-radius: 99px;
            padding: 3px;
        }

        .nst-seg button {
            background: none;
            border: none;
            color: var(--text-muted);
            font-family: inherit;
            font-size: 0.8rem;
            font-weight: 600;
            padding: 0.3rem 0.85rem;
            border-radius: 99px;
            cursor: pointer;
        }

        .nst-seg button.is-on { background: var(--primary); color: #fff; }

        /* Year chart */
        .nst-yearchart {
            display: flex;
            align-items: flex-end;
            gap: 6px;
            height: 220px;
            padding-top: 1.25rem;
        }

        .nst-yearcol {
            flex: 1;
            min-width: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            gap: 4px;
        }

        .nst-yearbar {
            width: 100%;
            max-width: 42px;
            border-radius: 5px 5px 2px 2px;
            background: linear-gradient(to top, rgba(99, 102, 241, 0.55), rgba(129, 140, 248, 0.9));
            transition: height 0.35s ease, filter 0.2s ease;
        }

        .nst-yearcol:hover .nst-yearbar { filter: brightness(1.25); }
        .nst-yearcol.is-best .nst-yearbar { background: linear-gradient(to top, rgba(236, 72, 153, 0.6), rgba(244, 114, 182, 1)); }

        .nst-yearval { display: inline-flex; align-items: center; gap: 2px; font-size: 0.75rem; color: var(--text-secondary); font-variant-numeric: tabular-nums; min-height: 1em; }
        .nst-yearlabel { font-size: 0.75rem; color: var(--text-muted); }
        .nst-yearlabel::before { content: "'"; }
        .nst-yearcol.is-empty .nst-yearlabel { opacity: 0.45; }

        /* Ranked bars (authors, genres, ratings share the pieces) */
        .nst-rank, .nst-bars, .nst-ratings, .nst-facts { list-style: none; margin: 0; padding: 0; }

        .nst-rank-row {
            width: 100%;
            display: grid;
            grid-template-columns: 1.6rem minmax(0, 1.2fr) minmax(0, 1fr) 3.2rem;
            align-items: center;
            gap: 0.75rem;
            padding: 0.45rem 0.4rem;
            background: none;
            border: none;
            border-radius: 8px;
            color: var(--text-secondary);
            font-family: inherit;
            font-size: 0.86rem;
            text-align: left;
            cursor: pointer;
        }

        .nst-rank-row:hover { background: rgba(255,255,255,0.04); color: var(--text-primary); }
        .nst-rank-pos { color: var(--text-muted); font-size: 0.75rem; font-variant-numeric: tabular-nums; text-align: right; }

        .nst-rank-name {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .nst-done { color: #34d399; flex-shrink: 0; }

        .nst-rank-bar, .nst-bars-track {
            position: relative;
            height: 8px;
            border-radius: 99px;
            background: rgba(255,255,255,0.04);
            overflow: hidden;
        }

        .nst-rank-total, .nst-rank-read {
            position: absolute;
            inset: 0 auto 0 0;
            border-radius: 99px;
        }

        .nst-rank-total { background: rgba(129, 140, 248, 0.18); }
        .nst-rank-read { background: linear-gradient(90deg, #6366f1, #818cf8); }
        .nst-rank-read.is-pink { background: linear-gradient(90deg, #db2777, #f472b6); }
        .nst-rank-read.is-amber { background: linear-gradient(90deg, #d97706, #fbbf24); }

        .nst-rank-count {
            text-align: right;
            font-variant-numeric: tabular-nums;
            color: var(--text-primary);
            font-weight: 600;
            font-size: 0.85rem;
        }

        .nst-rank-count em { font-style: normal; color: var(--text-muted); font-weight: 400; }

        .nst-bars li, .nst-ratings li {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr) 3.2rem;
            align-items: center;
            gap: 0.75rem;
            padding: 0.4rem 0.4rem;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .nst-ratings li { grid-template-columns: 2.6rem minmax(0, 1fr) 2.6rem; }

        .nst-bars-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .nst-stars { display: inline-flex; align-items: center; gap: 0.25rem; color: var(--text-primary); font-weight: 600; }
        .nst-stars i { color: #fbbf24; font-size: 0.8rem; }

        .nst-legend { display: flex; gap: 0.9rem; font-size: 0.75rem; color: var(--text-muted); }
        .nst-legend span { display: inline-flex; align-items: center; gap: 0.35rem; }
        .nst-legend i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
        .nst-legend i.is-read { background: #f472b6; }
        .nst-legend i.is-total { background: rgba(129, 140, 248, 0.3); }

        .nst-search { position: relative; }
        .nst-search i { position: absolute; left: 0.6rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.8rem; }
        .nst-search input {
            width: 150px;
            padding: 0.4rem 0.6rem 0.4rem 1.8rem;
            background: rgba(255,255,255,0.04);
            border: 1px solid var(--border);
            border-radius: 99px;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 0.8rem;
            outline: none;
        }
        .nst-search input:focus { border-color: var(--primary); }

        .nst-more {
            margin-top: 0.75rem;
            width: 100%;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: 0.4rem;
            padding: 0.55rem;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-secondary);
            font-family: inherit;
            font-size: 0.82rem;
            cursor: pointer;
        }
        .nst-more:hover { color: var(--text-primary); border-color: var(--border-hover); }

        .nst-none { padding: 1rem 0.4rem; color: var(--text-muted); font-size: 0.85rem; }

        /* Highlights */
        .nst-facts { display: flex; flex-direction: column; gap: 0.9rem; }

        .nst-facts li { display: flex; gap: 0.85rem; align-items: flex-start; }

        .nst-facts li > i {
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(99, 102, 241, 0.12);
            color: #a5b4fc;
            font-size: 1.05rem;
        }

        .nst-facts li div { display: flex; flex-direction: column; min-width: 0; }
        .nst-facts span { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .nst-facts strong { font-size: 0.95rem; color: var(--text-primary); font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
        .nst-facts em { font-style: normal; font-size: 0.78rem; color: var(--text-secondary); }


        .nst-yearval i { color: #f472b6; font-size: 0.75rem; }

        /* Keyboard: every interactive part shows where focus is, and a
           focused year reveals its value the way hover does. */
        .nst button:focus-visible,
        .nst input:focus-visible,
        .nst summary:focus-visible,
        .nst-yearcol:focus-visible {
            outline: 2px solid #a5b4fc;
            outline-offset: 2px;
            border-radius: 6px;
        }
        .nst-yearcol:focus-visible .nst-yearbar { filter: brightness(1.25); }

        /* Data fallback */
        .nst-table { margin-top: 1rem; }
        .nst-table summary {
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 0.82rem;
            width: max-content;
            padding: 0.3rem 0.1rem;
        }
        .nst-table table { width: 100%; max-width: 420px; margin-top: 0.6rem; border-collapse: collapse; font-size: 0.85rem; }
        .nst-table th, .nst-table td { padding: 0.4rem 0.6rem; text-align: right; border-bottom: 1px solid var(--border); font-variant-numeric: tabular-nums; }
        .nst-table th[scope="row"], .nst-table thead th:first-child { text-align: left; }
        .nst-table thead th { color: var(--text-muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .nst-table td, .nst-table th[scope="row"] { color: var(--text-secondary); }

        /* Touch: 44px targets where the pointer is a finger. */
        @media (pointer: coarse) {
            .nst-rank-row, .nst-more, .nst-table summary { min-height: 44px; }
            .nst-seg button { min-height: 40px; padding: 0 1rem; }
            .nst-search input { min-height: 40px; }
        }

        @media (prefers-reduced-motion: reduce) {
            .nst *, .nst *::before { transition: none !important; animation: none !important; }
        }

        @media (max-width: 860px) {
            .nst { padding: 1rem 1rem 3rem; }
            .nst-grid { grid-template-columns: 1fr; }
            .nst-yearchart { gap: 3px; height: 180px; }
            .nst-yearval { display: none; }
            .nst-card-head { flex-wrap: wrap; }
        }
    `}</style>
);
