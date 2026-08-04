// BookshelfView Component - 3D CSS Bookshelf for Novels Dashboard

window.BookshelfView = ({ novels, onSelect, onEdit, onDelete }) => {
    const { useState, useEffect, useRef, useMemo } = React;

    // Genre to color mapping
    const GENRE_COLORS = {
        'Fantasy':       { bg: '#2563eb', spine: '#1e40af', text: '#dbeafe' },
        'Sci-Fi':        { bg: '#0891b2', spine: '#0e7490', text: '#cffafe' },
        'Science Fiction': { bg: '#0891b2', spine: '#0e7490', text: '#cffafe' },
        'Romance':       { bg: '#e11d48', spine: '#be123c', text: '#ffe4e6' },
        'Thriller':      { bg: '#dc2626', spine: '#b91c1c', text: '#fee2e2' },
        'Mystery':       { bg: '#4f46e5', spine: '#4338ca', text: '#e0e7ff' },
        'Historical':    { bg: '#92400e', spine: '#78350f', text: '#fef3c7' },
        'Historical Fiction': { bg: '#92400e', spine: '#78350f', text: '#fef3c7' },
        'Contemporary':  { bg: '#475569', spine: '#334155', text: '#e2e8f0' },
        'Literary Fiction': { bg: '#475569', spine: '#334155', text: '#e2e8f0' },
        'Self-Help':     { bg: '#059669', spine: '#047857', text: '#d1fae5' },
        'Non-Fiction':   { bg: '#059669', spine: '#047857', text: '#d1fae5' },
        'Horror':        { bg: '#1e1b4b', spine: '#0f0a2e', text: '#c4b5fd' },
        'Mythology':     { bg: '#b45309', spine: '#92400e', text: '#fef3c7' },
        'Classic':       { bg: '#6b21a8', spine: '#581c87', text: '#f3e8ff' },
        'Philosophy':    { bg: '#0f766e', spine: '#115e59', text: '#ccfbf1' },
        'Spiritual':     { bg: '#0f766e', spine: '#115e59', text: '#ccfbf1' },
        'Psychology':    { bg: '#7c3aed', spine: '#6d28d9', text: '#ede9fe' },
        'Biography':     { bg: '#a16207', spine: '#854d0e', text: '#fef9c3' },
        'Adventure':     { bg: '#c2410c', spine: '#9a3412', text: '#ffedd5' },
        'Crime':         { bg: '#64748b', spine: '#475569', text: '#e2e8f0' },
        'Dystopian':     { bg: '#374151', spine: '#1f2937', text: '#d1d5db' },
        'Young Adult':   { bg: '#db2777', spine: '#be185d', text: '#fce7f3' },
        'Manga':         { bg: '#f97316', spine: '#ea580c', text: '#fff7ed' },
    };

    const DEFAULT_COLOR = { bg: '#7c3aed', spine: '#6d28d9', text: '#ede9fe' };

    const getGenreColor = (genre) => {
        if (!genre) return DEFAULT_COLOR;
        return GENRE_COLORS[genre] || DEFAULT_COLOR;
    };

    // Determine spine width based on page count
    const getSpineWidth = (novel) => {
        const pages = Number(novel.pages) || 250;
        if (pages <= 100) return 28;
        if (pages <= 200) return 34;
        if (pages <= 350) return 42;
        if (pages <= 500) return 50;
        if (pages <= 700) return 58;
        return 64;
    };

    // Slight random height variation per book (seeded by title for consistency)
    const getHeightVariation = (title) => {
        let hash = 0;
        for (let i = 0; i < (title || '').length; i++) {
            hash = ((hash << 5) - hash) + title.charCodeAt(i);
            hash |= 0;
        }
        return (Math.abs(hash) % 16) - 8;
    };

    // Group novels into shelf rows
    const booksPerShelf = 12;
    const shelves = useMemo(() => {
        const result = [];
        for (let i = 0; i < novels.length; i += booksPerShelf) {
            result.push(novels.slice(i, i + booksPerShelf));
        }
        if (result.length === 0) result.push([]);
        return result;
    }, [novels]);

    const getStatusInfo = (status) => {
        if (status === 'Read' || status === 'Tried') return { color: '#10b981', label: 'READ', ribbonBg: 'rgba(16,185,129,0.9)' };
        if (status === 'Currently Reading') return { color: '#3b82f6', label: 'READING', ribbonBg: 'rgba(59,130,246,0.9)' };
        return { color: '#ec4899', label: 'TBR', ribbonBg: 'rgba(236,72,153,0.9)' };
    };

    const truncateText = (text, maxLen) => {
        if (!text) return '';
        return text.length > maxLen ? text.substring(0, maxLen - 1) + '\u2026' : text;
    };

    return (
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
                                const colors = getGenreColor(novel.genre);
                                const spineWidth = getSpineWidth(novel);
                                const heightVar = getHeightVariation(novel.title);
                                const bookHeight = 220 + heightVar;
                                const statusInfo = getStatusInfo(novel.status);
                                const spineDepth = 24;

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
                                        }, truncateText(novel.title, spineWidth > 45 ? 40 : 25)),
                                        // Author
                                        React.createElement('div', {
                                            className: 'spine-author', style: { color: colors.text }
                                        }, truncateText(novel.author, 20)),
                                        // Decorative lines
                                        React.createElement('div', { className: 'spine-line-top', style: { borderColor: `${colors.text}30` } }),
                                        React.createElement('div', { className: 'spine-line-bottom', style: { borderColor: `${colors.text}30` } })
                                    ),
                                    // Book front edge
                                    React.createElement('div', {
                                        className: 'book-front',
                                        style: {
                                            width: `${spineDepth}px`,
                                            height: `${bookHeight}px`,
                                            background: `linear-gradient(to right, ${colors.spine}, ${colors.bg}88)`,
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
            ),

            // Styles
            React.createElement('style', null, `
                .bookshelf-container {
                    padding: 2rem 0;
                    perspective: 1200px;
                    max-width: 100%;
                }

                .shelf-unit {
                    margin-bottom: 1.5rem;
                    position: relative;
                }

                .shelf-books {
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    padding: 0 1.5rem;
                    min-height: 230px;
                    position: relative;
                    z-index: 2;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .empty-shelf-msg {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--text-muted);
                    font-size: 1rem;
                    padding: 2rem;
                    opacity: 0.6;
                }
                .empty-shelf-msg i {
                    font-size: 2rem;
                }

                /* Shelf Plank */
                .shelf-plank {
                    position: relative;
                    height: 18px;
                    background: linear-gradient(180deg, #5c3d2e 0%, #4a3122 40%, #3d2619 100%);
                    border-radius: 0 0 4px 4px;
                    box-shadow:
                        0 4px 12px rgba(0,0,0,0.4),
                        0 2px 4px rgba(0,0,0,0.2),
                        inset 0 1px 0 rgba(255,255,255,0.08);
                    z-index: 1;
                }
                .shelf-front-edge {
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    right: 0;
                    height: 8px;
                    background: linear-gradient(180deg, #3d2619 0%, #2c1a0f 100%);
                    border-radius: 0 0 4px 4px;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.3);
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
                    transform: translateZ(30px) translateY(-8px);
                    z-index: 20;
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
                    padding: 12px 3px;
                    overflow: hidden;
                    border-radius: 2px 0 0 2px;
                    box-shadow:
                        inset -2px 0 4px rgba(0,0,0,0.3),
                        inset 2px 0 4px rgba(255,255,255,0.05);
                    backface-visibility: hidden;
                }

                .spine-line-top, .spine-line-bottom {
                    position: absolute;
                    left: 15%;
                    right: 15%;
                    height: 0;
                    border-top: 1px solid;
                }
                .spine-line-top { top: 28px; }
                .spine-line-bottom { bottom: 28px; }

                /* Status Ribbon */
                .spine-ribbon {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 8px;
                    height: 20px;
                    border-radius: 0 0 0 2px;
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
                    gap: 1px;
                    font-size: 8px;
                    font-weight: 700;
                    margin-bottom: 4px;
                    flex-shrink: 0;
                }
                .spine-rating i { font-size: 8px; }

                /* Spine Title */
                .spine-title {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    transform: rotate(180deg);
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    line-height: 1.2;
                    text-align: center;
                    flex: 1;
                    overflow: hidden;
                    max-height: 100%;
                    word-break: break-word;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }

                /* Spine Author */
                .spine-author {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    transform: rotate(180deg);
                    font-size: 8px;
                    font-weight: 500;
                    opacity: 0.8;
                    margin-top: 4px;
                    flex-shrink: 0;
                    max-height: 60px;
                    overflow: hidden;
                    text-shadow: 0 1px 1px rgba(0,0,0,0.2);
                }

                /* Book Front Edge */
                .book-front {
                    position: absolute;
                    top: 0;
                    right: -12px;
                    transform-origin: left center;
                    transform: rotateY(90deg);
                    border-radius: 0 2px 2px 0;
                    overflow: hidden;
                }

                .pages-edge {
                    position: absolute;
                    top: 4px;
                    bottom: 4px;
                    left: 2px;
                    right: 2px;
                    background: repeating-linear-gradient(
                        to bottom,
                        #f5f0e8 0px,
                        #f5f0e8 1px,
                        #e8e0d4 1px,
                        #e8e0d4 2px
                    );
                    border-radius: 0 1px 1px 0;
                    opacity: 0.7;
                }

                /* Book Top Edge */
                .book-top {
                    position: absolute;
                    top: -12px;
                    left: 0;
                    transform-origin: bottom center;
                    transform: rotateX(90deg);
                    opacity: 0.6;
                }

                /* Hover Glow */
                .book-3d::after {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    border-radius: 4px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4), 0 8px 32px rgba(0,0,0,0.3);
                    z-index: -1;
                }
                .book-3d:hover::after {
                    opacity: 1;
                }

                /* Hover Tooltip */
                .book-tooltip {
                    position: absolute;
                    bottom: calc(100% + 16px);
                    left: 50%;
                    transform: translateX(-50%) scale(0.9);
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    z-index: 100;
                    display: flex;
                    gap: 0.75rem;
                    background: rgba(15, 18, 25, 0.95);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 0.75rem;
                    min-width: 220px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
                }
                .book-3d:hover .book-tooltip {
                    opacity: 1;
                    transform: translateX(-50%) scale(1);
                }

                .tooltip-cover {
                    width: 50px;
                    height: 70px;
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
                    gap: 2px;
                    min-width: 0;
                }
                .tooltip-title {
                    font-size: 0.85rem;
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
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.6);
                }
                .tooltip-genre {
                    font-size: 0.65rem;
                    color: var(--primary);
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    margin-top: 2px;
                }
                .tooltip-status {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-top: 2px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .shelf-books {
                        padding: 0 0.5rem;
                        gap: 3px;
                    }
                    .bookshelf-container {
                        padding: 1rem 0;
                    }
                }

                @media (max-width: 480px) {
                    .shelf-books {
                        gap: 2px;
                    }
                    .book-tooltip {
                        display: none !important;
                    }
                }
            `)
        )
    );
};

console.log("BookshelfView component registered on window");
