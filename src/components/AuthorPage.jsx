
window.AuthorPage = ({ authorName, novels, onBack, onNavigateToNovel }) => {
    const { useState, useEffect } = React;
    const [authorPhoto, setAuthorPhoto] = useState(null);

    useEffect(() => {
        // Fetch author photo from authors data
        // For now, we assume window.authorsData is available or we find it from the list
        // Since we didn't pass authorsData as a prop yet, we might need to rely on the global loaded in App.jsx
        // or pass it in. Let's assume passed in or global.
        // For this implementation, I'll access the global window.authorsData if available, 
        // effectively treating it as a store.
        const authors = window.authorsData || [];
        const authorEntry = authors.find(a => a.name === authorName);
        if (authorEntry && authorEntry.photo) {
            setAuthorPhoto(authorEntry.photo);
        }
    }, [authorName]);

    // Filter novels by this author
    const authorNovels = novels.filter(n => n.author === authorName);

    // Calculate stats
    const stats = React.useMemo(() => {
        const read = authorNovels.filter(n => n.status === 'Read').length;
        const total = authorNovels.length;
        return { read, total };
    }, [authorNovels]);

    const handleEditPhoto = async () => {
        const url = prompt("Enter the Image URL for this author:");
        if (url) {
            setAuthorPhoto(url);

            // Update global data
            const authors = window.authorsData || [];
            const existingIndex = authors.findIndex(a => a.name === authorName);

            let updatedAuthors;
            if (existingIndex >= 0) {
                updatedAuthors = [...authors];
                updatedAuthors[existingIndex] = { ...updatedAuthors[existingIndex], photo: url };
            } else {
                updatedAuthors = [...authors, { name: authorName, photo: url }];
            }

            window.authorsData = updatedAuthors;
            await window.api.saveAuthors(updatedAuthors);
        }
    };

    return (
        <div className="author-page-container fade-in">
            <button className="back-btn" onClick={onBack}>
                <i className="ph-bold ph-arrow-left"></i> Back
            </button>

            <div className="author-header">
                <div className="author-profile">
                    <div className="author-photo-wrapper group">
                        {authorPhoto ? (
                            <img src={authorPhoto} alt={authorName} className="author-photo" />
                        ) : (
                            <div className="author-photo-placeholder">
                                <span className="initials">{authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                            </div>
                        )}

                        {/* Edit Overlay */}
                        <div className="photo-edit-overlay" onClick={handleEditPhoto} title="Change Photo">
                            <i className="ph-fill ph-pencil-simple"></i>
                        </div>
                    </div>
                    <div className="author-info">
                        <h1 className="author-name">{authorName}</h1>
                        <div className="author-stats">
                            <span className="stat-badge">
                                <i className="ph-fill ph-books"></i> {stats.total} Books
                            </span>
                            <span className="stat-badge">
                                <i className="ph-fill ph-check-circle"></i> {stats.read} Read
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="author-books-section">
                <h2>Books by {authorName}</h2>
                <div className="novels-grid">
                    {authorNovels.length > 0 ? (
                        authorNovels.map(novel => (
                            <div key={novel.id} className="novel-card-mini" onClick={() => onNavigateToNovel(novel)}>
                                <div className="card-cover-wrapper">
                                    <img src={novel.cover} alt={novel.title} className="card-cover" loading="lazy" />
                                    {novel.status === 'Read' && <div className="read-badge"><i className="ph-fill ph-check"></i></div>}
                                </div>
                                <div className="card-info">
                                    <h3 className="card-title" title={novel.title}>{novel.title}</h3>
                                    <div className="card-rating">
                                        {novel.rating > 0 && Array.from({ length: Math.round(novel.rating) }).map((_, i) => (
                                            <i key={i} className="ph-fill ph-star text-warning" style={{ fontSize: '0.8rem', color: '#fbbf24' }}></i>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">No books found for this author.</p>
                    )}
                </div>
            </div>

            <style>{`
                .author-page-container {
                    padding-bottom: 4rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .author-header {
                    margin: 2rem 0 4rem;
                    display: flex;
                    justify-content: center;
                }
                .author-profile {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    text-align: center;
                }
                .author-photo-wrapper {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 4px solid var(--bg-surface);
                    box-shadow: var(--shadow-xl);
                    background: var(--bg-surface);
                    position: relative; /* For overlay */
                }
                
                .photo-edit-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                    cursor: pointer;
                    color: white;
                    font-size: 2rem;
                }
                .author-photo-wrapper:hover .photo-edit-overlay {
                    opacity: 1;
                }

                .author-photo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .author-photo-placeholder {
                    width: 100%;
                    height: 100%;
                    background: var(--primary-soft);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    font-size: 3rem;
                    font-weight: 700;
                }
                .author-name {
                    font-size: 2.5rem;
                    margin: 0;
                    background: linear-gradient(to right, #fff, #bbb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .author-stats {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }
                .stat-badge {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    padding: 0.4rem 1rem;
                    border-radius: 9999px;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                }
                
                .author-books-section h2 {
                    margin-bottom: 2rem;
                    font-size: 1.5rem;
                    color: var(--text-primary);
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 0.5rem;
                }

                .novels-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                }
                @media (max-width: 900px) {
                    .novels-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (max-width: 600px) {
                    .novels-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                .novel-card-mini {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .novel-card-mini:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--primary);
                }
                .card-cover-wrapper {
                    position: relative;
                    aspect-ratio: 2/3;
                }
                .card-cover {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .read-badge {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: rgba(16, 185, 129, 0.9);
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                }
                .card-info {
                    padding: 1rem;
                }
                .card-title {
                    font-size: 1rem;
                    margin: 0 0 0.5rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--text-primary);
                }
                .card-rating {
                    display: flex;
                    gap: 2px;
                    min-height: 1rem;
                }
            `}</style>
        </div>
    );
};
