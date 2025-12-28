


window.NovelForm = ({ initialData, onSubmit, onCancel, allGenres = [] }) => {
    const defaultData = {
        title: '',
        author: '',
        genre: '',
        subGenre: '',
        status: 'TBR',
        progress: '',
        progressType: 'pages',
        rating: 0,
        goodreadsRating: '',
        ownership: 'none', // 'none', 'home', 'lent'
        location: '', // Physical location
        lentTo: '',
        readYear: '',
        readMonth: '',
        cover: '',
        review: '',
        quotes: []
    };

    const [formData, setFormData] = React.useState(initialData || defaultData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.title || !formData.author) {
            alert('Title and Author are required!');
            return;
        }

        // Default genre if empty
        const dataToSubmit = {
            ...formData,
            genre: formData.genre || 'Uncategorized',
            cover: formData.cover.trim() || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=2000'
        };

        onSubmit(dataToSubmit);
    };

    return (
        <form className="novel-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter novel title"
                />
            </div>

            <div className="form-group">
                <label>Author</label>
                <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Author name"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Genre</label>
                    <input
                        list="genre-options"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        placeholder="Select or type new schema"
                        autoComplete="off"
                    />
                    <datalist id="genre-options">
                        {allGenres.map(g => (
                            <option key={g} value={g} />
                        ))}
                    </datalist>
                </div>

                <div className="form-group">
                    <label>Sub-genre</label>
                    <input
                        type="text"
                        name="subGenre"
                        value={formData.subGenre || ''}
                        onChange={handleChange}
                        placeholder="e.g. Space Opera, Urban"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                    {window.STATUSES.filter(s => s !== 'All').map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Location <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Shelf 1, Bedside, etc.)</small></label>
                <input
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    placeholder="e.g. Living Room Shelf"
                />
            </div>

            {formData.status === "Currently Reading" && (
                <div className="form-group">
                    <label>
                        Progress
                        <div className="progress-type-toggle">
                            <label className={`toggle-btn ${formData.progressType === 'pages' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="progressType"
                                    value="pages"
                                    checked={formData.progressType === 'pages'}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />
                                Pages
                            </label>
                            <label className={`toggle-btn ${formData.progressType === 'percentage' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="progressType"
                                    value="percentage"
                                    checked={formData.progressType === 'percentage'}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />
                                %
                            </label>
                        </div>
                    </label>
                    <input
                        type="number"
                        name="progress"
                        value={formData.progress || ''}
                        onChange={handleChange}
                        placeholder={formData.progressType === 'pages' ? "e.g. 125" : "e.g. 45"}
                        min="0"
                        max={formData.progressType === 'percentage' ? "100" : undefined}
                    />
                </div>
            )}

            <div className="form-group">
                <label>Rating (0-5)</label>
                <div className="rating-row">
                    <div className="rating-input">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                className={`star-select-btn ${formData.rating >= star ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, rating: star })}
                            >
                                <i className={`ph-fill ph-star`}></i>
                            </button>
                        ))}
                    </div>
                    <div className="gr-input-group">
                        <span className="gr-label"><span className="gr-icon">g</span> Rating:</span>
                        <input
                            type="number"
                            name="goodreadsRating"
                            value={formData.goodreadsRating || ''}
                            onChange={handleChange}
                            placeholder="4.5"
                            step="0.01"
                            min="0"
                            max="5"
                            className="gr-input"
                        />
                    </div>
                </div>
            </div>

            <style>{`
                .rating-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .gr-input-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--bg-app);
                    padding: 0.25rem 0.75rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                }
                .gr-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .gr-icon {
                    font-family: serif;
                    font-weight: bold;
                }
                .gr-input {
                    background: transparent !important;
                    border: none !important;
                    width: 60px !important;
                    padding: 0 !important;
                    font-weight: 600;
                    text-align: right;
                }
                .gr-input:focus {
                    outline: none;
                }
            `}</style>

            <div className="form-group">
                <label>Review / Notes</label>
                <textarea
                    name="review"
                    value={formData.review || ''}
                    onChange={handleChange}
                    placeholder="What did you think? Use - or * for bullet points."
                    rows="5"
                ></textarea>
            </div>

            {/* Quotes Section */}
            <div className="form-group">
                <label>Favorite Quotes</label>
                <div className="quotes-list">
                    {(formData.quotes || []).map((quote, index) => (
                        <div key={index} className="quote-input-group">
                            <textarea
                                value={typeof quote === 'object' && quote !== null ? quote.text : quote}
                                onChange={(e) => {
                                    const newQuotes = [...(formData.quotes || [])];
                                    if (typeof newQuotes[index] === 'object' && newQuotes[index] !== null) {
                                        newQuotes[index] = { ...newQuotes[index], text: e.target.value };
                                    } else {
                                        newQuotes[index] = e.target.value;
                                    }
                                    setFormData({ ...formData, quotes: newQuotes });
                                }}
                                placeholder="Enter a memorable quote..."
                                rows="2"
                            />
                            <button
                                type="button"
                                className="remove-quote-btn"
                                onClick={() => {
                                    const newQuotes = formData.quotes.filter((_, i) => i !== index);
                                    setFormData({ ...formData, quotes: newQuotes });
                                }}
                            >
                                <i className="ph-bold ph-x"></i>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="add-quote-btn"
                        onClick={() => setFormData({ ...formData, quotes: [...(formData.quotes || []), ''] })}
                    >
                        <i className="ph-bold ph-plus"></i> Add Quote
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label>Cover Image URL <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Use direct image link, ending in .jpg/png)</small></label>
                <input
                    type="text"
                    name="cover"
                    value={formData.cover}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <style>{`
                .quotes-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .quote-input-group {
                    display: flex;
                    gap: 0.5rem;
                    align-items: flex-start;
                }
                .quote-input-group textarea {
                    flex: 1;
                    resize: vertical;
                }
                .remove-quote-btn {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .remove-quote-btn:hover {
                    color: #ef4444;
                    border-color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }
                .add-quote-btn {
                    align-self: flex-start;
                    background: none;
                    border: 1px dashed var(--border);
                    color: var(--primary);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }
                .add-quote-btn:hover {
                    border-color: var(--primary);
                    background: rgba(var(--primary-rgb), 0.05); /* Assuming primary-rgb exists, else falls back often */
                }
            `}</style>


            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-primary">Save Novel</button>
            </div>

            <style>{`
                .novel - form {
                    display: flex;
                flex-direction: column;
                gap: 1.25rem;
                }
                .form-group {
                    display: flex;
                flex-direction: column;
                gap: 0.5rem;
                }
                .form-row {
                    display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                }
                .novel-form label {
                    font - size: 0.875rem;
                font-weight: 600;
                color: var(--text-secondary);
                display: flex;
                justify-content: space-between;
                align-items: center;
                }
                .novel-form input, .novel-form select, .novel-form textarea {
                    background: var(--bg-app);
                border: 1px solid var(--border);
                padding: 0.75rem;
                border-radius: var(--radius-md);
                color: var(--text-primary);
                outline: none;
                font-family: inherit;
                }
                .novel-form input:focus, .novel-form select:focus, .novel-form textarea:focus {
                    border - color: var(--primary);
                }

                .rating-input {
                    display: flex;
                gap: 0.5rem;
                }
                .star-select-btn {
                    background: none;
                border: none;
                color: var(--text-muted);
                font-size: 1.5rem;
                cursor: pointer;
                transition: transform 0.2s;
                }
                .star-select-btn.active {
                    color: #fbbf24;
                }
                .star-select-btn:hover {
                    transform: scale(1.2);
                }

                .form-actions {
                    display: flex;
                justify-content: flex-end;
                gap: 1rem;
                margin-top: 1rem;
                }
                .btn-primary, .btn-secondary {
                    padding: 0.75rem 1.5rem;
                border-radius: var(--radius-md);
                font-weight: 600;
                cursor: pointer;
                border: none;
                }

                .btn-primary {
                    background: var(--primary);
                color: white;
                }
                .btn-primary:hover {
                    background: var(--primary-hover);
                }

                .progress-type-toggle {
                    display: flex;
                gap: 0.5rem;
                }
                .toggle-btn {
                    font - size: 0.75rem;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                border: 1px solid var(--border);
                cursor: pointer;
                color: var(--text-muted);
                background: var(--bg-app);
                transition: all 0.2s;
                }
                .toggle-btn:hover {
                    color: var(--text-primary);
                border-color: var(--text-muted);
                }
                .toggle-btn.active {
                    background: var(--primary);
                border-color: var(--primary);
                color: white;
                }

                .btn-secondary {
                    background: var(--bg-accent);
                color: var(--text-primary);
                }
                .btn-secondary:hover {
                    background: var(--bg-surface-hover);
                }
            `}</style>
        </form>
    );
};

