/**
 * Motivation tab: one saved quote or phrase at a time, picked at random,
 * with the book and author it came from.
 *
 * Quotes and phrases are stored either as plain strings or as
 * { text, citation, page }, so both shapes are read.
 *
 * "Another" deals from a shuffled deck rather than picking independently
 * each time, so nothing repeats until every line has been shown once.
 */

const cleanLine = (text) => String(text || '').replace(/\s+/g, ' ').trim();

const collectLines = (novels) => {
    const lines = [];
    // The same line saved twice on one book would show twice per round; it
    // is shown once here. The saved data is left as it is.
    const seen = new Set();
    novels.forEach(n => {
        [['quote', n.quotes], ['phrase', n.phrases]].forEach(([kind, list]) => {
            (Array.isArray(list) ? list : []).forEach((entry, i) => {
                const isObj = entry && typeof entry === 'object';
                const text = cleanLine(isObj ? entry.text : entry);
                if (!text) return;
                const dupKey = `${n.id}|${kind}|${text.toLowerCase()}`;
                if (seen.has(dupKey)) return;
                seen.add(dupKey);
                lines.push({
                    key: `${n.id}-${kind}-${i}`,
                    kind,
                    text,
                    page: isObj ? String(entry.page || '').trim() : '',
                    novel: n
                });
            });
        });
    });
    return lines;
};

const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

window.NovelMotivation = ({ novels, onOpenNovel }) => {
    const { useState, useMemo, useEffect, useCallback } = React;
    const [kind, setKind] = useState('all');           // 'all' | 'quote' | 'phrase'
    const [deck, setDeck] = useState([]);
    const [pos, setPos] = useState(0);
    const [history, setHistory] = useState([]);       // keys shown, for Back

    const all = useMemo(() => collectLines(novels), [novels]);
    const pool = useMemo(() => all.filter(l => kind === 'all' || l.kind === kind), [all, kind]);
    const counts = useMemo(() => ({
        all: all.length,
        quote: all.filter(l => l.kind === 'quote').length,
        phrase: all.filter(l => l.kind === 'phrase').length
    }), [all]);

    // A fresh shuffle whenever the pool changes (filter switch or edits).
    useEffect(() => { setDeck(shuffle(pool)); setPos(0); setHistory([]); }, [pool]);

    const current = deck[pos];

    const next = useCallback(() => {
        if (!deck.length) return;
        if (current) setHistory(h => [...h, pos]);
        if (pos + 1 < deck.length) setPos(pos + 1);
        else {
            // Every line has been shown: reshuffle, without opening the new
            // round on the line that just closed the last one.
            let fresh = shuffle(pool);
            if (fresh.length > 1 && current && fresh[0].key === current.key) fresh.push(fresh.shift());
            setDeck(fresh); setPos(0); setHistory([]);
        }
    }, [deck, pos, pool, current]);

    const back = () => {
        if (!history.length) return;
        setPos(history[history.length - 1]);
        setHistory(h => h.slice(0, -1));
    };

    // Space or → for another, ← to go back; ignored while typing anywhere.
    useEffect(() => {
        const onKey = (e) => {
            const tag = (e.target && e.target.tagName) || '';
            if (/INPUT|TEXTAREA|SELECT/.test(tag) || e.target.isContentEditable) return;
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    return (
        <div className="mot">
            <div className="mot-filter" role="group" aria-label="Show">
                {[['all', 'All'], ['quote', 'Quotes'], ['phrase', 'Phrases']].map(([id, label]) => (
                    <button key={id} className={kind === id ? 'is-on' : ''} aria-pressed={kind === id} onClick={() => setKind(id)}>
                        {label} <span>{counts[id]}</span>
                    </button>
                ))}
            </div>

            {!current ? (
                <div className="mot-empty">
                    <i className="ph-duotone ph-quotes" aria-hidden="true"></i>
                    <h2>Nothing saved yet</h2>
                    <p>Open a book and add quotes or phrases to it — they'll show up here.</p>
                </div>
            ) : (
                <>
                    <figure className="mot-card" key={current.key} aria-live="polite">
                        <span className={`mot-kind is-${current.kind}`}>{current.kind === 'quote' ? 'Quote' : 'Phrase'}</span>
                        <i className="ph-fill ph-quotes mot-mark" aria-hidden="true"></i>
                        <blockquote className={current.text.length > 260 ? 'is-long' : ''}>{current.text}</blockquote>
                        <figcaption>
                            {current.novel.cover && <img src={current.novel.cover} alt="" loading="lazy" />}
                            <div>
                                <button className="mot-book" onClick={() => onOpenNovel && onOpenNovel(current.novel)} title="Open this book">
                                    {current.novel.title}
                                </button>
                                <span className="mot-author">
                                    {current.novel.author ? `by ${current.novel.author}` : 'Unknown author'}
                                    {current.page && ` · page ${current.page}`}
                                </span>
                            </div>
                        </figcaption>
                    </figure>

                    <div className="mot-controls">
                        <button className="mot-ghost" onClick={back} disabled={!history.length} aria-label="Previous">
                            <i className="ph-bold ph-arrow-left" aria-hidden="true"></i>
                        </button>
                        <button className="mot-next" onClick={next}>
                            <i className="ph-bold ph-shuffle" aria-hidden="true"></i> Another one
                        </button>
                        <span className="mot-progress">{pos + 1} of {deck.length}</span>
                    </div>
                    <p className="mot-hint">Press space or → for another, ← to go back.</p>
                </>
            )}

            <style>{`
                .mot { max-width: 820px; margin: 0 auto; padding: 1.5rem 1.5rem 4rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }

                .mot-filter { display: inline-flex; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 99px; padding: 4px; }
                .mot-filter button { background: none; border: none; color: #94a3b8; font-family: inherit; font-size: 0.9rem; font-weight: 600; padding: 0.45rem 1.1rem; border-radius: 99px; cursor: pointer; }
                .mot-filter button.is-on { background: var(--primary); color: #fff; }
                .mot-filter span { font-size: 0.75rem; opacity: 0.8; margin-left: 0.25rem; }

                .mot-card {
                    position: relative; width: 100%; margin: 0; padding: 3rem 3rem 2rem;
                    background: linear-gradient(160deg, rgba(99,102,241,0.12), rgba(236,72,153,0.08)), rgba(17,20,28,0.85);
                    border: 1px solid rgba(129,140,248,0.25); border-radius: var(--radius-xl, 1rem);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.35); animation: mot-in 0.35s ease;
                }
                @keyframes mot-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
                .mot-mark { position: absolute; top: 1.3rem; left: 1.6rem; font-size: 2.6rem; color: rgba(165,180,252,0.35); }
                .mot-kind { position: absolute; top: 1.2rem; right: 1.4rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.2rem 0.7rem; border-radius: 99px; }
                .mot-kind.is-quote { background: rgba(99,102,241,0.18); color: #c7d2fe; }
                .mot-kind.is-phrase { background: rgba(236,72,153,0.16); color: #f9a8d4; }

                .mot-card blockquote {
                    margin: 1rem 0 2rem; font-size: 1.55rem; line-height: 1.55; color: var(--text-primary);
                    font-family: Georgia, 'Times New Roman', serif; white-space: pre-wrap; overflow-wrap: anywhere;
                }
                .mot-card blockquote.is-long { font-size: 1.15rem; }

                .mot-card figcaption { display: flex; align-items: center; gap: 0.9rem; padding-top: 1.2rem; border-top: 1px solid rgba(255,255,255,0.08); }
                .mot-card figcaption img { width: 40px; height: 60px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
                .mot-card figcaption div { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
                .mot-book { background: none; border: none; padding: 0; text-align: left; cursor: pointer; font-family: inherit; font-size: 1rem; font-weight: 700; color: var(--text-primary); }
                .mot-book:hover { color: #a5b4fc; text-decoration: underline; text-underline-offset: 3px; }
                .mot-author { font-size: 0.88rem; color: #94a3b8; }

                .mot-controls { display: flex; align-items: center; gap: 0.8rem; }
                .mot-next { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 99px; border: none; background: var(--primary); color: #fff; font-family: inherit; font-size: 1rem; font-weight: 600; cursor: pointer; }
                .mot-next:hover { filter: brightness(1.1); }
                .mot-ghost { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--border); background: rgba(255,255,255,0.04); color: var(--text-secondary); cursor: pointer; }
                .mot-ghost:disabled { opacity: 0.35; cursor: default; }
                .mot-progress { font-size: 0.85rem; color: #94a3b8; font-variant-numeric: tabular-nums; }
                .mot-hint { margin: 0; font-size: 0.8rem; color: #94a3b8; }

                .mot-empty { text-align: center; padding: 4rem 1rem; color: #94a3b8; }
                .mot-empty i { font-size: 3.5rem; color: var(--primary); }
                .mot-empty h2 { color: var(--text-secondary); margin: 1rem 0 0.4rem; }

                .mot button:focus-visible { outline: 2px solid #a5b4fc; outline-offset: 2px; }
                @media (max-width: 640px) { .mot-card { padding: 2.6rem 1.3rem 1.5rem; } .mot-card blockquote { font-size: 1.25rem; } }
                @media (prefers-reduced-motion: reduce) { .mot-card { animation: none; } }
            `}</style>
        </div>
    );
};
