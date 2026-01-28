window.NovelDetails = ({ novel, onBack, onEdit, onDelete, onAuthorClick, onUpdate }) => {
    const { useState, useEffect } = React;
    const { title, author, cover, genre, subGenre, rating, status, review, progress, progressType, quotes, phrases, description } = novel;
    const [activeTab, setActiveTab] = useState('description');

    // ---- Edit States ----
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [tempDesc, setTempDesc] = useState(description || '');

    const [isEditingReview, setIsEditingReview] = useState(false);
    const [tempReview, setTempReview] = useState(review || '');

    // Quotes
    const [editingQuoteIdx, setEditingQuoteIdx] = useState(-1);
    const [tempQuote, setTempQuote] = useState({ text: '', citation: '', page: '' });
    const [isAddingQuote, setIsAddingQuote] = useState(false);

    // Phrases
    const [editingPhraseIdx, setEditingPhraseIdx] = useState(-1);
    const [tempPhrase, setTempPhrase] = useState({ text: '', citation: '', page: '' });
    const [isAddingPhrase, setIsAddingPhrase] = useState(false);

    // Sync state when novel changes (e.g. after update)
    useEffect(() => {
        setTempDesc(description || '');
        setTempReview(review || '');
    }, [novel]);

    // Helpers
    const renderStars = (count) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <i
                key={i}
                className={`ph-fill ph-star ${i < count ? 'text-yellow-400' : 'text-gray-600'}`}
                style={{ color: i < count ? '#fbbf24' : '#4b5563' }}
            ></i>
        ));
    };

    const getMonthName = (monthNum) => {
        if (!monthNum) return '';
        const date = new Date();
        date.setMonth(monthNum - 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    // ---- Handlers: Description & Review ----
    const saveDescription = () => {
        onUpdate({ ...novel, description: tempDesc });
        setIsEditingDesc(false);
    };

    const saveReview = () => {
        onUpdate({ ...novel, review: tempReview });
        setIsEditingReview(false);
    };

    // ---- Handlers: Quotes & Phrases ----
    const normalizeItem = (item) => {
        if (typeof item === 'object' && item !== null) return item;
        if (typeof item === 'string') {
            const parts = item.split('\n');
            const citation = parts.length > 1 ? parts.slice(1).join('\n') : '';
            return { text: parts[0], citation, page: '' };
        }
        return { text: String(item), citation: '', page: '' };
    };

    // Generic list handlers
    const handleAdd = (listKey, isAddingSetter, tempState, setTempState) => {
        const list = novel[listKey] || [];
        const newItem = { ...tempState };
        if (!newItem.text.trim()) return;

        const updatedList = [...list, newItem];
        onUpdate({ ...novel, [listKey]: updatedList });
        isAddingSetter(false);
        setTempState({ text: '', citation: '', page: '' });
    };

    const handleUpdateItem = (listKey, index, tempState, editingSetter) => {
        const list = [...(novel[listKey] || [])];
        list[index] = { ...tempState };
        onUpdate({ ...novel, [listKey]: list });
        editingSetter(-1);
    };

    const handleDeleteItem = (listKey, index) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        const list = novel[listKey] || [];
        const updatedList = list.filter((_, i) => i !== index);
        onUpdate({ ...novel, [listKey]: updatedList });
    };

    const startEditItem = (item, index, setTempState, setEditingIdx) => {
        setTempState(normalizeItem(item));
        setEditingIdx(index);
    };

    // ---- Renderers ----
    const renderEditForm = (tempState, setTempState, onSave, onCancel) => (
        <div className="edit-form-card fade-in">
            <textarea
                className="edit-textarea"
                value={tempState.text}
                onChange={e => setTempState({ ...tempState, text: e.target.value })}
                placeholder="Enter text..."
                rows={3}
            />
            <div className="edit-form-row">
                <input
                    type="text"
                    className="edit-input"
                    value={tempState.citation}
                    onChange={e => setTempState({ ...tempState, citation: e.target.value })}
                    placeholder="Citation / Source (Optional)"
                />
                <input
                    type="text"
                    className="edit-input page-input"
                    value={tempState.page}
                    onChange={e => setTempState({ ...tempState, page: e.target.value })}
                    placeholder="Page #"
                />
            </div>
            <div className="form-actions-right">
                <button onClick={onCancel} className="btn-cancel">Cancel</button>
                <button onClick={onSave} className="btn-save">Save</button>
            </div>
        </div>
    );

    const renderQuoteCard = (item, idx, type) => {
        const isQuote = type === 'quotes';
        const editingIdx = isQuote ? editingQuoteIdx : editingPhraseIdx;
        const isEditing = editingIdx === idx;

        if (isEditing) {
            return renderEditForm(
                isQuote ? tempQuote : tempPhrase,
                isQuote ? setTempQuote : setTempPhrase,
                () => handleUpdateItem(type, idx, isQuote ? tempQuote : tempPhrase, isQuote ? setEditingQuoteIdx : setEditingPhraseIdx),
                () => (isQuote ? setEditingQuoteIdx : setEditingPhraseIdx)(-1)
            );
        }

        const { text, citation, page } = normalizeItem(item);

        return (
            <div key={idx} className="quote-card group">
                <i className={`ph-fill ${isQuote ? 'ph-quotes' : 'ph-text-aa'} opacity-20 quote-icon-bg`}></i>
                <div className="card-actions">
                    <button
                        onClick={() => startEditItem(item, idx, isQuote ? setTempQuote : setTempPhrase, isQuote ? setEditingQuoteIdx : setEditingPhraseIdx)}
                        className="card-action-btn edit"
                    >
                        <i className="ph-bold ph-pencil-simple"></i>
                    </button>
                    <button
                        onClick={() => handleDeleteItem(type, idx)}
                        className="card-action-btn delete"
                    >
                        <i className="ph-bold ph-trash"></i>
                    </button>
                </div>
                <p>{text}</p>
                {citation && (
                    <p className="quote-citation" style={{ textAlign: 'center', marginTop: '1rem', fontStyle: 'normal', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        — {citation}
                    </p>
                )}
                {page && (
                    <p className="quote-page" style={{ textAlign: 'right', marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Page {page}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="novel-details-container fade-in">
            <button className="back-btn" onClick={onBack}>
                <i className="ph-bold ph-arrow-left"></i> Back to Dashboard
            </button>

            <div className="details-grid">
                {/* Left Column: Cover & Key Info */}
                <div className="details-sidebar">
                    <div className="cover-wrapper">
                        <img src={cover} alt={title} className="detail-cover" />
                        <div className="cover-glow" style={{ backgroundImage: `url(${cover})` }}></div>
                    </div>

                    <div className="sidebar-actions">
                        <button className="action-btn edit-btn" onClick={() => onEdit(novel)}>
                            <i className="ph-fill ph-pencil-simple"></i> Edit Novel
                        </button>
                        <button className="action-btn delete-btn" onClick={() => onDelete(novel.id)}>
                            <i className="ph-fill ph-trash"></i> Delete
                        </button>
                    </div>

                    <div className="detail-meta-block">
                        <div className="meta-item">
                            <span className="label">Status</span>
                            <span className={`status-pill ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                        </div>
                        {status === "Currently Reading" && (
                            <div className="meta-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span className="label">Progress</span>
                                    <span className="value">{progressType === 'percentage' ? `${progress}%` : `Page ${progress}`}</span>
                                </div>
                                <div className="progress-bar" style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${progressType === 'percentage' ? progress : (Math.min(progress, 500) / 500) * 100}%`,
                                            height: '100%',
                                            background: 'var(--primary)',
                                            borderRadius: '999px'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        <div className="meta-item">
                            <span className="label">Rating</span>
                            <div className="stars">{renderStars(rating)}</div>
                        </div>
                        {novel.goodreadsRating && (
                            <div className="meta-item">
                                <span className="label">Goodreads</span>
                                <span className="value"><span className="gr-icon">g</span> {novel.goodreadsRating}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="details-content">
                    <div className="header-section">
                        <div className="genres">
                            <span className="main-genre">{genre}</span>
                            {subGenre && <span className="sub-genre"> • {subGenre}</span>}
                        </div>
                        <h1 className="detail-title">{title}</h1>
                        <h2 className="detail-author">
                            by <span
                                onClick={() => onAuthorClick(author)}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                                onMouseOut={(e) => e.target.style.color = 'inherit'}
                            >
                                {author}
                            </span>
                        </h2>
                    </div>

                    <div className="divider" style={{ marginBottom: '0' }}></div>

                    <div className="tabs-container">
                        <button
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('quotes')}
                        >
                            Quotes ({quotes ? quotes.length : 0})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'phrases' ? 'active' : ''}`}
                            onClick={() => setActiveTab('phrases')}
                        >
                            Phrases ({phrases ? phrases.length : 0})
                        </button>
                    </div>

                    <div className="tab-content">
                        {/* Description Tab */}
                        {activeTab === 'description' && (
                            <div className="section description-section fade-in">
                                <div className="section-header-row">
                                    <h3><i className="ph-fill ph-info"></i> Description</h3>
                                    {!isEditingDesc && (
                                        <button onClick={() => setIsEditingDesc(true)} className="icon-btn" title="Edit Description">
                                            <i className="ph-bold ph-pencil-simple"></i>
                                        </button>
                                    )}
                                </div>

                                {isEditingDesc ? (
                                    <div className="edit-block fade-in">
                                        <textarea
                                            value={tempDesc}
                                            onChange={(e) => setTempDesc(e.target.value)}
                                            className="edit-textarea"
                                            rows={8}
                                        />
                                        <div className="form-actions-right">
                                            <button onClick={() => setIsEditingDesc(false)} className="btn-cancel">Cancel</button>
                                            <button onClick={saveDescription} className="btn-save">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    description ? (
                                        <p className="review-text">{description}</p>
                                    ) : (
                                        <div className="empty-placeholder" onClick={() => setIsEditingDesc(true)}>
                                            <p>No description available. Click here to add one.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="section review-section fade-in">
                                <div className="section-header-row">
                                    <h3><i className="ph-fill ph-notebook"></i> Review</h3>
                                    {!isEditingReview && (
                                        <button onClick={() => setIsEditingReview(true)} className="icon-btn" title="Edit Review">
                                            <i className="ph-bold ph-pencil-simple"></i>
                                        </button>
                                    )}
                                </div>

                                {isEditingReview ? (
                                    <div className="edit-block fade-in">
                                        <textarea
                                            value={tempReview}
                                            onChange={(e) => setTempReview(e.target.value)}
                                            className="edit-textarea"
                                            rows={12}
                                            placeholder="Write your review here..."
                                        />
                                        <div className="form-actions-right">
                                            <button onClick={() => setIsEditingReview(false)} className="btn-cancel">Cancel</button>
                                            <button onClick={saveReview} className="btn-save">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    review ? (
                                        <p className="review-text">{review}</p>
                                    ) : (
                                        <div className="empty-placeholder" onClick={() => setIsEditingReview(true)}>
                                            <p>No review written yet. Click here to add one.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* Quotes Tab */}
                        {activeTab === 'quotes' && (
                            <div className="section quotes-section fade-in">
                                <div className="section-header-row">
                                    <h3><i className="ph-fill ph-quotes"></i> Quotes</h3>
                                    {!isAddingQuote && (
                                        <button onClick={() => setIsAddingQuote(true)} className="add-item-btn">
                                            <i className="ph-bold ph-plus"></i> Add Quote
                                        </button>
                                    )}
                                </div>

                                {isAddingQuote && renderEditForm(
                                    tempQuote,
                                    setTempQuote,
                                    () => handleAdd('quotes', setIsAddingQuote, tempQuote, setTempQuote),
                                    () => setIsAddingQuote(false)
                                )}

                                {quotes && quotes.length > 0 ? (
                                    <div className="quotes-grid">
                                        {quotes.map((quote, idx) => renderQuoteCard(quote, idx, 'quotes'))}
                                    </div>
                                ) : (
                                    !isAddingQuote && <p className="no-data">No quotes added.</p>
                                )}
                            </div>
                        )}

                        {/* Phrases Tab */}
                        {activeTab === 'phrases' && (
                            <div className="section phrases-section fade-in">
                                <div className="section-header-row">
                                    <h3><i className="ph-fill ph-text-aa"></i> Phrases</h3>
                                    {!isAddingPhrase && (
                                        <button onClick={() => setIsAddingPhrase(true)} className="add-item-btn">
                                            <i className="ph-bold ph-plus"></i> Add Phrase
                                        </button>
                                    )}
                                </div>

                                {isAddingPhrase && renderEditForm(
                                    tempPhrase,
                                    setTempPhrase,
                                    () => handleAdd('phrases', setIsAddingPhrase, tempPhrase, setTempPhrase),
                                    () => setIsAddingPhrase(false)
                                )}

                                {phrases && phrases.length > 0 ? (
                                    <div className="quotes-grid">
                                        {phrases.map((phrase, idx) => renderQuoteCard(phrase, idx, 'phrases'))}
                                    </div>
                                ) : (
                                    !isAddingPhrase && <p className="no-data">No phrases added.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .novel-details-container { padding-bottom: 4rem; }
                .fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .back-btn { background: transparent; border: none; color: var(--text-muted); font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 2rem; padding: 0; transition: color 0.2s; }
                .back-btn:hover { color: var(--primary); }

                .details-grid { display: grid; grid-template-columns: 350px 1fr; gap: 4rem; }
                
                /* Sidebar & Header */
                .details-sidebar { display: flex; flex-direction: column; gap: 2rem; }
                .cover-wrapper { position: relative; border-radius: var(--radius-lg); z-index: 1; }
                .detail-cover { width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); position: relative; z-index: 2; aspect-ratio: 2/3; object-fit: cover; }
                .cover-glow { position: absolute; top: 20px; left: 20px; right: 20px; bottom: -20px; background-size: cover; filter: blur(40px); opacity: 0.4; z-index: 1; border-radius: var(--radius-lg); }
                
                .sidebar-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .action-btn { padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 500; transition: all 0.2s; }
                .edit-btn:hover { border-color: var(--primary); color: var(--primary); }
                .delete-btn:hover { border-color: #ef4444; color: #ef4444; }

                .detail-meta-block { background: var(--bg-surface); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 1.25rem; }
                .meta-item { display: flex; justify-content: space-between; align-items: center; }
                .meta-item .label { color: var(--text-muted); font-size: 0.9rem; }
                .meta-item .value { font-weight: 600; }
                
                .status-pill { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .status-pill.read { color: #34d399; background: rgba(16, 185, 129, 0.1); }
                .status-pill.currently-reading { color: #60a5fa; background: rgba(59, 130, 246, 0.1); }
                .status-pill.tbr { color: #f472b6; background: rgba(236, 72, 153, 0.1); }

                /* Main Content Styles */
                .details-content { padding-top: 1rem; }
                .main-genre { color: var(--primary); background: rgba(59, 130, 246, 0.1); padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem; display: inline-block; }
                .sub-genre { color: var(--text-muted); }
                
                .detail-title { font-size: 3rem; line-height: 1.1; margin-bottom: 0.5rem; background: linear-gradient(to right, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .detail-author { font-size: 1.5rem; color: var(--text-muted); font-weight: 400; margin-bottom: 1.5rem; }
                
                .divider { height: 1px; background: var(--border); margin: 2.5rem 0; }

                /* Tabs */
                .tabs-container { display: flex; gap: 1.5rem; border-bottom: 1px solid var(--border); margin-top: 2rem; margin-bottom: 2rem; }
                .tab-btn { background: none; border: none; padding: 0.75rem 0; font-size: 1rem; font-weight: 600; color: var(--text-muted); cursor: pointer; position: relative; transition: color 0.2s; }
                .tab-btn:hover { color: var(--text-primary); }
                .tab-btn.active { color: var(--primary); }
                .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--primary); }

                /* Section & Edit Styles */
                .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .section h3 { font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); margin: 0; }
                
                .icon-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: all 0.2s; }
                .icon-btn:hover { background: var(--bg-surface-hover); color: var(--text-primary); }

                .add-item-btn { background: var(--bg-surface); border: 1px solid var(--border); color: var(--primary); padding: 0.5rem 1rem; border-radius: var(--radius-md); cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
                .add-item-btn:hover { border-color: var(--primary); background: rgba(124, 58, 237, 0.05); }

                .review-text { font-size: 1.1rem; line-height: 1.8; color: var(--text-secondary); white-space: pre-wrap; }
                .empty-placeholder { padding: 2rem; border: 1px dashed var(--border); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
                .empty-placeholder:hover { border-color: var(--primary); color: var(--primary); background: rgba(124, 58, 237, 0.02); }

                /* Forms */
                .edit-textarea { width: 100%; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-primary); padding: 1rem; border-radius: var(--radius-md); font-family: inherit; font-size: 1rem; line-height: 1.6; resize: vertical; outline: none; transition: border-color 0.2s; display: block; margin-bottom: 1rem; }
                .edit-textarea:focus { border-color: var(--primary); }

                .edit-form-card { background: var(--bg-surface); border: 1px solid var(--primary); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem; }
                .edit-form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
                .edit-input { flex: 1; background: var(--bg-app); border: 1px solid var(--border); color: var(--text-primary); padding: 0.75rem; border-radius: var(--radius-sm); outline: none; }
                .edit-input:focus { border-color: var(--primary); }
                .page-input { flex: 0 0 100px; }

                .form-actions-right { display: flex; justify-content: flex-end; gap: 0.75rem; }
                .btn-save { background: var(--primary); color: white; border: none; padding: 0.5rem 1.5rem; border-radius: var(--radius-md); cursor: pointer; font-weight: 500; }
                .btn-cancel { background: transparent; color: var(--text-muted); border: 1px solid var(--border); padding: 0.5rem 1.5rem; border-radius: var(--radius-md); cursor: pointer; }
                .btn-cancel:hover { color: var(--text-primary); border-color: var(--text-muted); }

                /* Cards */
                .quotes-grid { display: grid; gap: 1.5rem; }
                .quote-card { background: var(--bg-surface); border: 1px solid var(--border); padding: 2rem; border-radius: var(--radius-lg); position: relative; font-size: 1.2rem; font-style: italic; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap; transition: border-color 0.2s; }
                .quote-card:hover { border-color: var(--text-muted); }
                .quote-icon-bg { position: absolute; top: 1rem; left: 1rem; font-size: 3rem; opacity: 0.05; color: var(--primary); }
                
                .card-actions { position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; }
                .quote-card:hover .card-actions { opacity: 1; }
                .card-action-btn { background: var(--bg-app); border: 1px solid var(--border); color: var(--text-muted); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .card-action-btn:hover { color: var(--text-primary); border-color: var(--text-primary); }
                .card-action-btn.delete:hover { color: #ef4444; border-color: #ef4444; }

                .no-data { color: var(--text-muted); font-style: italic; }

                @media (max-width: 900px) {
                    .details-grid { grid-template-columns: 1fr; gap: 2rem; }
                    .detail-cover { max-width: 300px; margin: 0 auto; }
                    .sidebar-actions, .detail-meta-block { max-width: 300px; margin: 0 auto; width: 100%; }
                    .edit-form-row { flex-direction: column; }
                    .page-input { flex: 1; }
                }
            `}</style>
        </div>
    );
};
