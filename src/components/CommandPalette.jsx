/**
 * Cmd/Ctrl-K search across every dataset the app has already loaded.
 * Nothing is fetched here — it reads the same window.* globals App.jsx fills.
 */
window.CommandPalette = ({ onNavigate, onOpenAuthor, onOpenState }) => {
    const { useState, useEffect, useMemo, useRef } = React;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        const onKeyDown = (e) => {
            const isToggle = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
            if (isToggle) {
                e.preventDefault();
                setOpen(v => !v);
                return;
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        // Also openable from UI affordances (the home page search button).
        window.openCommandPalette = () => setOpen(true);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            delete window.openCommandPalette;
        };
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIndex(0);
            // focus after the dialog paints
            requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
        }
    }, [open]);

    // Flatten everything once; re-derived only when the palette opens.
    const index = useMemo(() => {
        if (!open) return [];

        const items = [];
        const push = (kind, label, sublabel, icon, action) => items.push({ kind, label, sublabel, icon, action });

        [
            ['Novels Dashboard', 'ph-books', 'novels'],
            ['Travel Tracker', 'ph-airplane-tilt', 'travel'],
            ['Writing Dashboard', 'ph-pen-nib', 'writing'],
            ['Clothes Tracker', 'ph-t-shirt', 'clothes'],
            ['Sync & Backup', 'ph-arrows-clockwise', 'sync']
        ].forEach(([label, icon, view]) => push('Page', label, 'Dashboard', icon, () => onNavigate(view)));

        (window.novelsData || []).forEach(n => {
            if (!n.title) return;
            push('Book', n.title, [n.author, n.status].filter(Boolean).join(' · '), 'ph-book-open', () => onNavigate('novels'));
        });

        (window.authorsData || []).forEach(a => {
            const name = typeof a === 'string' ? a : a.name;
            if (!name) return;
            push('Author', name, 'Author', 'ph-user', () => onOpenAuthor(name));
        });

        const states = (window.rawStatesData && window.rawStatesData.states) || {};
        Object.keys(states).forEach(name => {
            const s = states[name] || {};
            push('State', name, s.visited ? 'Visited' : 'Not visited yet', 'ph-map-pin', () => onOpenState(name));
        });

        (window.writingData || []).forEach(w => {
            const title = w.title || w.name;
            if (!title) return;
            push('Writing', title, w.type || 'Entry', 'ph-note-pencil', () => onNavigate('writing'));
        });

        (window.storiesList || []).forEach(s => {
            const title = s.title || s.name;
            if (!title) return;
            push('Story', title, 'Story', 'ph-scroll', () => onNavigate('writing'));
        });

        return items;
    }, [open, onNavigate, onOpenAuthor, onOpenState]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return index.filter(i => i.kind === 'Page');

        // Prefix matches rank above substring matches, so typing "th" surfaces
        // titles starting with "The ..." before ones merely containing "th".
        const scored = [];
        for (const item of index) {
            const label = item.label.toLowerCase();
            const pos = label.indexOf(q);
            if (pos === 0) scored.push({ item, score: 0 });
            else if (pos > 0) scored.push({ item, score: 1 + pos / 100 });
            else if ((item.sublabel || '').toLowerCase().includes(q)) scored.push({ item, score: 3 });
            if (scored.length > 400) break;
        }
        return scored.sort((a, b) => a.score - b.score).slice(0, 30).map(s => s.item);
    }, [query, index]);

    useEffect(() => setActiveIndex(0), [query]);

    const run = (item) => {
        if (!item) return;
        setOpen(false);
        item.action();
    };

    const onInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            run(results[activeIndex]);
        }
    };

    // Keep the highlighted row in view while arrowing through results.
    useEffect(() => {
        if (!listRef.current) return;
        const row = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
        if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (!open) return null;

    return (
        <div className="cmdk-backdrop" onClick={() => setOpen(false)}>
            <div className="cmdk" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search">
                <div className="cmdk-input-row">
                    <i className="ph-bold ph-magnifying-glass"></i>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onInputKeyDown}
                        placeholder="Search books, authors, states, writing…"
                        aria-label="Search everything"
                    />
                    <kbd>esc</kbd>
                </div>

                <div className="cmdk-results" ref={listRef}>
                    {results.length === 0 && <div className="cmdk-empty">No matches for “{query}”</div>}
                    {results.map((item, i) => (
                        <button
                            key={`${item.kind}-${item.label}-${i}`}
                            data-index={i}
                            className={`cmdk-row ${i === activeIndex ? 'is-active' : ''}`}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => run(item)}
                        >
                            <i className={`ph-fill ${item.icon}`}></i>
                            <span className="cmdk-label">{item.label}</span>
                            {item.sublabel && <span className="cmdk-sub">{item.sublabel}</span>}
                            <span className="cmdk-kind">{item.kind}</span>
                        </button>
                    ))}
                </div>

                <div className="cmdk-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                    <span><kbd>↵</kbd> open</span>
                    <span><kbd>⌘</kbd><kbd>K</kbd> toggle</span>
                </div>
            </div>

            <style>{`
                .cmdk-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(5, 7, 12, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 9999;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding: 12vh 1rem 1rem;
                }

                .cmdk {
                    width: min(640px, 100%);
                    background: rgba(17, 20, 28, 0.97);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: var(--radius-lg, 14px);
                    box-shadow: 0 24px 70px rgba(0,0,0,0.6);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    max-height: 70vh;
                }

                .cmdk-input-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.15rem;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }

                .cmdk-input-row i { color: var(--text-muted); font-size: 1.1rem; }

                .cmdk-input-row input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text-primary);
                    font-size: 1rem;
                    font-family: inherit;
                }

                .cmdk-results { overflow-y: auto; padding: 0.4rem; }

                .cmdk-row {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.6rem 0.75rem;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    text-align: left;
                    font-family: inherit;
                    font-size: 0.9rem;
                }

                .cmdk-row.is-active { background: rgba(99, 102, 241, 0.16); color: #fff; }
                .cmdk-row i { color: var(--primary); font-size: 1rem; flex-shrink: 0; }

                .cmdk-label { flex-shrink: 0; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .cmdk-sub { color: var(--text-muted); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .cmdk-kind { margin-left: auto; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); flex-shrink: 0; }

                .cmdk-empty { padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem; }

                .cmdk-footer {
                    display: flex;
                    gap: 1.25rem;
                    padding: 0.6rem 1.15rem;
                    border-top: 1px solid rgba(255,255,255,0.07);
                    color: var(--text-muted);
                    font-size: 0.75rem;
                }

                .cmdk kbd {
                    background: rgba(255,255,255,0.08);
                    border-radius: 4px;
                    padding: 1px 5px;
                    font-family: inherit;
                    font-size: 0.7rem;
                    margin-right: 2px;
                }
            `}</style>
        </div>
    );
};
