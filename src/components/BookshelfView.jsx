// BookshelfView Component - 3D CSS Bookshelf for Novels Dashboard

window.BookshelfView = ({ novels, onSelect, onEdit, onDelete }) => {
    const { useState, useEffect, useRef, useMemo } = React;

    const [isShuffled, setIsShuffled] = useState(false);
    const [shuffleSeed, setShuffleSeed] = useState(0);

    // Rich, vibrant color palette list for maximum color variety
    const PALETTES = [
        { bg: '#2563eb', spine: '#1e40af', text: '#dbeafe' }, // Royal Blue
        { bg: '#0891b2', spine: '#0e7490', text: '#cffafe' }, // Cyan
        { bg: '#e11d48', spine: '#be123c', text: '#ffe4e6' }, // Rose Crimson
        { bg: '#dc2626', spine: '#b91c1c', text: '#fee2e2' }, // Bright Red
        { bg: '#4f46e5', spine: '#4338ca', text: '#e0e7ff' }, // Indigo
        { bg: '#92400e', spine: '#78350f', text: '#fef3c7' }, // Leather Brown
        { bg: '#059669', spine: '#047857', text: '#d1fae5' }, // Emerald Green
        { bg: '#1e1b4b', spine: '#0f0a2e', text: '#c4b5fd' }, // Dark Midnight
        { bg: '#b45309', spine: '#92400e', text: '#fef3c7' }, // Amber Gold
        { bg: '#6b21a8', spine: '#581c87', text: '#f3e8ff' }, // Purple
        { bg: '#0f766e', spine: '#115e59', text: '#ccfbf1' }, // Teal
        { bg: '#7c3aed', spine: '#6d28d9', text: '#ede9fe' }, // Violet
        { bg: '#a16207', spine: '#854d0e', text: '#fef9c3' }, // Bronze
        { bg: '#c2410c', spine: '#9a3412', text: '#ffedd5' }, // Rust Orange
        { bg: '#64748b', spine: '#475569', text: '#e2e8f0' }, // Slate Blue
        { bg: '#db2777', spine: '#be185d', text: '#fce7f3' }, // Magenta
        { bg: '#f97316', spine: '#ea580c', text: '#fff7ed' }, // Warm Orange
        { bg: '#15803d', spine: '#166534', text: '#dcfce7' }, // Deep Forest
    ];

    const GENRE_COLORS = {
        'Fantasy':       PALETTES[0],
        'Sci-Fi':        PALETTES[1],
        'Science Fiction': PALETTES[1],
        'Romance':       PALETTES[2],
        'Thriller':      PALETTES[3],
        'Mystery':       PALETTES[4],
        'Historical':    PALETTES[5],
        'Historical Fiction': PALETTES[5],
        'Contemporary':  PALETTES[6],
        'Literary Fiction': PALETTES[6],
        'Self-Help':     PALETTES[7],
        'Non-Fiction':   PALETTES[8],
        'Horror':        PALETTES[9],
        'Mythology':     PALETTES[10],
        'Classic':       PALETTES[11],
        'Philosophy':    PALETTES[12],
        'Spiritual':     PALETTES[13],
        'Psychology':    PALETTES[14],
        'Biography':     PALETTES[15],
        'Adventure':     PALETTES[16],
        'Crime':         PALETTES[17],
    };

    const getBookColor = (novel, index) => {
        if (isShuffled) {
            return PALETTES[(index * 7 + shuffleSeed) % PALETTES.length];
        }
        if (novel.genre && GENRE_COLORS[novel.genre]) {
            return GENRE_COLORS[novel.genre];
        }
        // Fallback to pseudo-random palette based on title
        let hash = 0;
        for (let i = 0; i < (novel.title || '').length; i++) {
            hash = ((hash << 5) - hash) + novel.title.charCodeAt(i);
            hash |= 0;
        }
        return PALETTES[Math.abs(hash) % PALETTES.length];
    };

    // Determine spine width based on page count (scaled up for dynamic display)
    const getSpineWidth = (novel) => {
        const pages = Number(novel.pages) || 280;
        if (pages <= 100) return 38;
        if (pages <= 200) return 46;
        if (pages <= 350) return 56;
        if (pages <= 500) return 68;
        if (pages <= 700) return 78;
        return 88;
    };

    // Height variation per book (scaled up for impressive 3D look)
    const getHeightVariation = (title) => {
        let hash = 0;
        for (let i = 0; i < (title || '').length; i++) {
            hash = ((hash << 5) - hash) + title.charCodeAt(i);
            hash |= 0;
        }
        return (Math.abs(hash) % 24) - 12; // -12 to +12 px
    };

    // Process & optionally shuffle novels list
    const processedNovels = useMemo(() => {
        if (!isShuffled) return novels;
        const list = [...novels];
        // Fisher-Yates shuffle seeded
        let m = list.length, t, i;
        const seed = shuffleSeed;
        const pseudoRandom = (idx) => {
            const x = Math.sin(seed + idx) * 10000;
            return x - Math.floor(x);
        };
        for (let idx = m - 1; idx > 0; idx--) {
            i = Math.floor(pseudoRandom(idx) * (idx + 1));
            t = list[idx];
            list[idx] = list[i];
            list[i] = t;
        }
        return list;
    }, [novels, isShuffled, shuffleSeed]);

    // Group novels into shelf rows (14 books per shelf for dynamic full-width display)
    const booksPerShelf = 14;
    const shelves = useMemo(() => {
        const result = [];
        for (let i = 0; i < processedNovels.length; i += booksPerShelf) {
            result.push(processedNovels.slice(i, i + booksPerShelf));
        }
        if (result.length === 0) result.push([]);
        return result;
    }, [processedNovels]);

    const getStatusInfo = (status) => {
        if (status === 'Read' || status === 'Tried') return { color: '#10b981', label: 'READ', ribbonBg: 'rgba(16,185,129,0.9)' };
        if (status === 'Currently Reading') return { color: '#3b82f6', label: 'READING', ribbonBg: 'rgba(59,130,246,0.9)' };
        return { color: '#ec4899', label: 'TBR', ribbonBg: 'rgba(236,72,153,0.9)' };
    };

    const truncateText = (text, maxLen) => {
        if (!text) return '';
        return text.length > maxLen ? text.substring(0, maxLen - 1) + '\u2026' : text;
    };

    const triggerShuffle = () => {
        setIsShuffled(true);
        setShuffleSeed(prev => prev + 1);
    };

    return (
        React.createElement('div', { className: 'bookshelf-wrapper' },
            // Controls toolbar
            React.createElement('div', { className: 'bookshelf-toolbar' },
                React.createElement('div', { className: 'toolbar-title' },
                    React.createElement('i', { className: 'ph-fill ph-books' }),
                    React.createElement('span', null, `3D Library Shelf (${processedNovels.length} Books)`)
                ),
                React.createElement('div', { className: 'toolbar-actions' },
                    React.createElement('button', {
                        className: `shelf-action-btn ${isShuffled ? 'active' : ''}`,
                        onClick: triggerShuffle,
                        title: 'Shuffle books to randomize colors & layout'
                    },
                        React.createElement('i', { className: 'ph-bold ph-shuffle' }),
                        React.createElement('span', null, 'Shuffle Colors')
                    ),
                    isShuffled && React.createElement('button', {
                        className: 'shelf-action-btn reset',
                        onClick: () => setIsShuffled(false),
                        title: 'Reset to default order'
                    },
                        React.createElement('i', { className: 'ph-bold ph-arrow-counter-clockwise' }),
                        React.createElement('span', null, 'Reset')
                    )
                )
            ),

            // Shelves container
            React.createElement('div', { className: 'bookshelf-container' },
                shelves.map((shelfBooks, shelfIdx) =>
                    React.createElement('div', { key: shelfIdx, className: 'shelf-unit' },
                        React.createElement('div', { className: 'shelf-books' },
                            shelfBooks.length === 0 ?
                                React.createElement('div', { className: 'empty-shelf-msg' },
                                    React.createElement('i', { className: 'ph-duotone ph-books' }),
                                    React.createElement('span', null, 'Your bookshelf is empty. Add some novels!')
                                )
                            :
                                shelfBooks.map((novel, bookIdx) => {
                                    const globalIdx = shelfIdx * booksPerShelf + bookIdx;
                                    const colors = getBookColor(novel, globalIdx);
                                    const spineWidth = getSpineWidth(novel);
                                    const heightVar = getHeightVariation(novel.title);
                                    const bookHeight = 280 + heightVar; // Scaled up height (280px)
                                    const statusInfo = getStatusInfo(novel.status);
                                    const spineDepth = 30;

                                    return React.createElement('div', {
                                        key: novel.id || bookIdx,
                                        className: 'book-3d',
                                        style: { width: `${spineWidth}px`, height: `${bookHeight}px` },
                                        onClick: () => onSelect(novel),
                                        title: `${novel.title} by ${novel.author}`
                                    },
                                        // Book spine
                                        React.createElement('div', {
                                            className: 'book-spine',
                                            style: {
                                                width: `${spineWidth}px`,
                                                height: `${bookHeight}px`,
                                                background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.spine} 100%)`,
                                            }
                                        },
                                            // Status ribbon
                                            React.createElement('div', {
                                                className: `spine-ribbon ${novel.status === 'Currently Reading' ? 'reading-pulse' : ''}`,
                                                style: { backgroundColor: statusInfo.ribbonBg }
                                            }),
                                            // Rating
                                            novel.rating > 0 && React.createElement('div', {
                                                className: 'spine-rating', style: { color: '#fbbf24' }
                                            },
                                                React.createElement('i', { className: 'ph-fill ph-star' }),
                                                React.createElement('span', null, novel.rating)
                                            ),
                                            // Title
                                            React.createElement('div', {
                                                className: 'spine-title', style: { color: colors.text }
                                            }, truncateText(novel.title, spineWidth > 55 ? 45 : 32)),
                                            // Author
                                            React.createElement('div', {
                                                className: 'spine-author', style: { color: colors.text }
                                            }, truncateText(novel.author, 24)),
                                            // Gold/silver decorative lines
                                            React.createElement('div', { className: 'spine-line-top', style: { borderColor: `${colors.text}40` } }),
                                            React.createElement('div', { className: 'spine-line-bottom', style: { borderColor: `${colors.text}40` } })
                                        ),
                                        // Book front edge
                                        React.createElement('div', {
                                            className: 'book-front',
                                            style: {
                                                width: `${spineDepth}px`,
                                                height: `${bookHeight}px`,
                                                background: `linear-gradient(to right, ${colors.spine}, ${colors.bg}aa)`,
                                            }
                                        },
                                            React.createElement('div', { className: 'pages-edge' })
                                        ),
                                        // Book top edge
                                        React.createElement('div', {
                                            className: 'book-top',
                                            style: {
                                                width: `${spineWidth}px`,
                                                height: `${spineDepth}px`,
                                                background: `linear-gradient(to bottom, ${colors.bg}, ${colors.spine})`,
                                            }
                                        }),
                                        // Hover tooltip
                                        React.createElement('div', { className: 'book-tooltip' },
                                            React.createElement('div', { className: 'tooltip-cover' },
                                                novel.cover && React.createElement('img', {
                                                    src: novel.cover,
                                                    alt: novel.title,
                                                    onError: (e) => { e.target.style.display = 'none'; }
                                                })
                                            ),
                                            React.createElement('div', { className: 'tooltip-info' },
                                                React.createElement('div', { className: 'tooltip-title' }, novel.title),
                                                React.createElement('div', { className: 'tooltip-author' }, `by ${novel.author}`),
                                                novel.genre && React.createElement('div', { className: 'tooltip-genre' }, novel.genre),
                                                React.createElement('div', { className: 'tooltip-status', style: { color: statusInfo.color } }, statusInfo.label)
                                            )
                                        )
                                    );
                                })
                        ),
                        // Shelf plank
                        React.createElement('div', { className: 'shelf-plank' },
                            React.createElement('div', { className: 'shelf-front-edge' })
                        )
                    )
                )
            ),

            // Styles
            React.createElement('style', null, `
                .bookshelf-wrapper {
                    width: 100%;
                    max-width: 100%;
                }

                .bookshelf-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1.25rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    margin-bottom: 1.5rem;
                }

                .toolbar-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    font-size: 1rem;
                    color: var(--text-primary);
                }
                .toolbar-title i {
                    color: var(--primary);
                    font-size: 1.25rem;
                }

                .toolbar-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .shelf-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    padding: 0.4rem 0.85rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .shelf-action-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    transform: translateY(-1px);
                }
                .shelf-action-btn.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
                }
                .shelf-action-btn.reset:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .bookshelf-container {
                    padding: 1rem 0;
                    perspective: 1400px;
                    width: 100%;
                }

                .shelf-unit {
                    margin-bottom: 2.5rem;
                    position: relative;
                    width: 100%;
                }

                .shelf-books {
                    display: flex;
                    align-items: flex-end;
                    gap: 6px;
                    padding: 0 1.5rem;
                    min-height: 295px;
                    position: relative;
                    z-index: 2;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                    width: 100%;
                }

                .empty-shelf-msg {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--text-muted);
                    font-size: 1rem;
                    padding: 3rem;
                    opacity: 0.6;
                    width: 100%;
                    justify-content: center;
                }
                .empty-shelf-msg i {
                    font-size: 2.5rem;
                }

                /* Shelf Plank - Rich Wood Finish */
                .shelf-plank {
                    position: relative;
                    height: 24px;
                    background: linear-gradient(180deg, #6e473b 0%, #523328 40%, #3d241c 100%);
                    border-radius: 0 0 6px 6px;
                    box-shadow:
                        0 8px 24px rgba(0,0,0,0.5),
                        0 2px 6px rgba(0,0,0,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.12);
                    z-index: 1;
                    width: 100%;
                }
                .shelf-front-edge {
                    position: absolute;
                    bottom: -10px;
                    left: 0;
                    right: 0;
                    height: 10px;
                    background: linear-gradient(180deg, #3d241c 0%, #291712 100%);
                    border-radius: 0 0 6px 6px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                }

                /* 3D Book */
                .book-3d {
                    position: relative;
                    cursor: pointer;
                    transform-style: preserve-3d;
                    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
                    flex-shrink: 0;
                }

                .book-3d:hover {
                    transform: translateZ(40px) translateY(-12px);
                    z-index: 30;
                }

                /* Book Spine */
                .book-spine {
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 16px 4px;
                    overflow: hidden;
                    border-radius: 3px 0 0 3px;
                    box-shadow:
                        inset -3px 0 6px rgba(0,0,0,0.35),
                        inset 3px 0 6px rgba(255,255,255,0.08);
                    backface-visibility: hidden;
                }

                .spine-line-top, .spine-line-bottom {
                    position: absolute;
                    left: 12%;
                    right: 12%;
                    height: 0;
                    border-top: 1px dashed;
                }
                .spine-line-top { top: 34px; }
                .spine-line-bottom { bottom: 34px; }

                /* Status Ribbon */
                .spine-ribbon {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 10px;
                    height: 26px;
                    border-radius: 0 0 0 3px;
                    z-index: 3;
                }
                .reading-pulse {
                    animation: ribbonPulse 2s ease-in-out infinite;
                }
                @keyframes ribbonPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* Spine Rating */
                .spine-rating {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    font-size: 10px;
                    font-weight: 700;
                    margin-bottom: 6px;
                    flex-shrink: 0;
                }
                .spine-rating i { font-size: 10px; }

                /* Spine Title (Scaled Up) */
                .spine-title {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    transform: rotate(180deg);
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    line-height: 1.25;
                    text-align: center;
                    flex: 1;
                    overflow: hidden;
                    max-height: 100%;
                    word-break: break-word;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                }

                /* Spine Author (Scaled Up) */
                .spine-author {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    transform: rotate(180deg);
                    font-size: 10px;
                    font-weight: 500;
                    opacity: 0.85;
                    margin-top: 6px;
                    flex-shrink: 0;
                    max-height: 80px;
                    overflow: hidden;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }

                /* Book Front Edge */
                .book-front {
                    position: absolute;
                    top: 0;
                    right: -15px;
                    transform-origin: left center;
                    transform: rotateY(90deg);
                    border-radius: 0 3px 3px 0;
                    overflow: hidden;
                }

                .pages-edge {
                    position: absolute;
                    top: 5px;
                    bottom: 5px;
                    left: 2px;
                    right: 2px;
                    background: repeating-linear-gradient(
                        to bottom,
                        #f5f0e8 0px,
                        #f5f0e8 1px,
                        #e8e0d4 1px,
                        #e8e0d4 2px
                    );
                    border-radius: 0 2px 2px 0;
                    opacity: 0.75;
                }

                /* Book Top Edge */
                .book-top {
                    position: absolute;
                    top: -15px;
                    left: 0;
                    transform-origin: bottom center;
                    transform: rotateX(90deg);
                    opacity: 0.7;
                }

                /* Hover Glow */
                .book-3d::after {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    border-radius: 6px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                    box-shadow: 0 0 25px rgba(124, 58, 237, 0.5), 0 10px 40px rgba(0,0,0,0.4);
                    z-index: -1;
                }
                .book-3d:hover::after {
                    opacity: 1;
                }

                /* Hover Tooltip */
                .book-tooltip {
                    position: absolute;
                    bottom: calc(100% + 20px);
                    left: 50%;
                    transform: translateX(-50%) scale(0.9);
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    z-index: 100;
                    display: flex;
                    gap: 0.85rem;
                    background: rgba(15, 18, 25, 0.95);
                    backdrop-filter: blur(14px);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 12px;
                    padding: 0.85rem;
                    min-width: 240px;
                    box-shadow: 0 16px 48px rgba(0,0,0,0.6);
                }
                .book-3d:hover .book-tooltip {
                    opacity: 1;
                    transform: translateX(-50%) scale(1);
                }

                .tooltip-cover {
                    width: 55px;
                    height: 78px;
                    border-radius: 4px;
                    overflow: hidden;
                    flex-shrink: 0;
                    background: rgba(255,255,255,0.05);
                }
                .tooltip-cover img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .tooltip-info {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    min-width: 0;
                }
                .tooltip-title {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                .tooltip-author {
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.65);
                }
                .tooltip-genre {
                    font-size: 0.7rem;
                    color: var(--primary);
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    margin-top: 2px;
                }
                .tooltip-status {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-top: 2px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .shelf-books {
                        padding: 0 0.75rem;
                        gap: 4px;
                    }
                    .bookshelf-toolbar {
                        flex-direction: column;
                        gap: 0.75rem;
                        align-items: flex-start;
                    }
                }

                @media (max-width: 480px) {
                    .shelf-books {
                        gap: 3px;
                    }
                    .book-tooltip {
                        display: none !important;
                    }
                }
            `)
        )
    );
};

console.log("BookshelfView v2 (Scaled & Colorful) registered on window");
