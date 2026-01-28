(function () {
    console.log("Loading StoryDetails.jsx... v2 (Fixed Syntax)");

    const { useState, useEffect } = React;

    const StoryDetails = ({ story, onBack, onUpdate }) => {
        const [parts, setParts] = useState([]);
        const [isAddingPart, setIsAddingPart] = useState(false);
        const [newPartText, setNewPartText] = useState("");

        // Editing state
        const [editingIndex, setEditingIndex] = useState(-1);
        const [editData, setEditData] = useState({ original: "", modified: "" });

        useEffect(() => {
            if (story && story.parts) {
                setParts(story.parts);
            } else {
                setParts([]);
            }
        }, [story]);

        const handleAddPart = () => {
            if (!newPartText.trim()) return;

            const nextPartNumber = parts.length > 0 ? Math.max(...parts.map(p => p.partNumber || 0)) + 1 : 1;

            const newPart = {
                partNumber: nextPartNumber,
                original: newPartText.trim(),
                modified: null // Initially null
            };

            const updatedParts = [...parts, newPart];
            setParts(updatedParts);
            onUpdate({ ...story, parts: updatedParts }); // Persist

            setNewPartText("");
            setIsAddingPart(false);
        };

        const initiateEdit = (index, part) => {
            setEditingIndex(index);
            setEditData({
                original: part.original || "",
                modified: part.modified || ""
            });
        };

        const handleSaveEdit = (index) => {
            const updatedParts = [...parts];
            updatedParts[index] = {
                ...updatedParts[index],
                original: editData.original,
                modified: editData.modified || null // Ensure null if empty string? Or keep empty string? Legacy seems to use null/empty check.
            };

            // Re-normalize part numbers if needed? No, keeping them stable is better usually.

            setParts(updatedParts);
            onUpdate({ ...story, parts: updatedParts });
            setEditingIndex(-1);
        };

        const handleDeletePart = (index) => {
            if (!confirm("Are you sure you want to delete this part?")) return;
            const updatedParts = parts.filter((_, i) => i !== index);

            // Optional: Renumber parts? 
            // For now, let's keep original part numbers or re-index them?
            // Let's re-index logic to keep "Part 1, Part 2" clean
            const reindexedParts = updatedParts.map((p, i) => ({ ...p, partNumber: i + 1 }));

            setParts(reindexedParts);
            onUpdate({ ...story, parts: reindexedParts });
        };

        const cancelEdit = () => {
            setEditingIndex(-1);
            setEditData({ original: "", modified: "" });
        };

        return (
            <div className="story-details-container fade-in">
                {/* Header */}
                <div className="details-header">
                    <button className="back-btn" onClick={onBack}>
                        <i className="ph-bold ph-arrow-left"></i> Back to Stories
                    </button>

                    <div className="story-title-block">
                        <h1>{story.title}</h1>
                        <div className="meta-badges">
                            <span className="badge genre">{story.genre}</span>
                            <span className={`badge status ${story.status ? story.status.toLowerCase().replace(" ", "-") : ''}`}>{story.status}</span>
                            <span className="badge parts">{parts.length} Parts</span>
                        </div>
                    </div>
                </div>

                {/* Parts List */}
                <div className="parts-list">
                    {parts.map((part, index) => {
                        const isEditing = editingIndex === index;

                        if (isEditing) {
                            return (
                                <div key={index} className="part-card editing fade-in">
                                    <div className="edit-header">
                                        <h3>Editing Part {part.partNumber}</h3>
                                    </div>

                                    <div className="edit-grid">
                                        <div className="edit-col">
                                            <label>Original Text</label>
                                            <textarea
                                                className="edit-textarea"
                                                value={editData.original}
                                                onChange={(e) => setEditData({ ...editData, original: e.target.value })}
                                                rows={5}
                                            />
                                        </div>
                                        <div className="edit-col">
                                            <label>Modified / Final Text</label>
                                            <textarea
                                                className="edit-textarea"
                                                value={editData.modified}
                                                onChange={(e) => setEditData({ ...editData, modified: e.target.value })}
                                                rows={5}
                                                placeholder="Enter polished version here..."
                                            />
                                        </div>
                                    </div>

                                    <div className="edit-actions">
                                        <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                                        <button className="btn-save" onClick={() => handleSaveEdit(index)}>Save Changes</button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={index} className="part-card group">
                                <div className="part-header">
                                    <span className="part-label">Part {part.partNumber}</span>
                                    <div className="part-actions">
                                        <button className="icon-btn edit" onClick={() => initiateEdit(index, part)} title="Edit Part">
                                            <i className="ph-bold ph-pencil-simple"></i>
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDeletePart(index)} title="Delete Part">
                                            <i className="ph-bold ph-trash"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="part-content-grid">
                                    <div className="content-block original">
                                        <div className="block-label">Original</div>
                                        <p>{part.original}</p>
                                    </div>

                                    <div className={`content-block modified ${part.modified ? '' : 'empty'}`}>
                                        <div className="block-label">Modified</div>
                                        {part.modified ? (
                                            <p>{part.modified}</p>
                                        ) : (
                                            <div className="empty-placeholder" onClick={() => initiateEdit(index, part)}>
                                                <i className="ph-fill ph-pencil-simple-slash"></i>
                                                <span>Not yet edited. Click to add.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Part Section */}
                    {isAddingPart ? (
                        <div className="add-part-form fade-in">
                            <h3>Add New Part</h3>
                            <textarea
                                value={newPartText}
                                onChange={(e) => setNewPartText(e.target.value)}
                                placeholder="Paste your story draft here..."
                                className="add-textarea"
                                rows={6}
                                autoFocus
                            />
                            <div className="form-actions-right">
                                <button className="btn-cancel" onClick={() => setIsAddingPart(false)}>Cancel</button>
                                <button className="btn-save" onClick={handleAddPart}>Add Part</button>
                            </div>
                        </div>
                    ) : (
                        <button className="add-part-btn-large" onClick={() => setIsAddingPart(true)}>
                            <i className="ph-bold ph-plus-circle"></i>
                            <span>Add New Part</span>
                        </button>
                    )}
                </div>

                <style>{`
                    .story-details-container {
                        max-width: 1000px;
                        margin: 0 auto;
                        padding-bottom: 4rem;
                    }
                    
                    .details-header {
                        margin-bottom: 3rem;
                    }
                    
                    .back-btn {
                        background: none;
                        border: none;
                        color: var(--text-muted);
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                        font-size: 1rem;
                        margin-bottom: 1.5rem;
                        padding: 0;
                        transition: color 0.2s;
                    }
                    .back-btn:hover { color: var(--primary); }

                    .story-title-block h1 {
                        font-size: 2.5rem;
                        margin: 0 0 1rem 0;
                        background: linear-gradient(to right, #fff, var(--text-muted));
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }

                    .meta-badges {
                        display: flex;
                        gap: 0.75rem;
                    }
                    
                    .badge {
                        padding: 0.25rem 0.75rem;
                        border-radius: 999px;
                        font-size: 0.85rem;
                        font-weight: 500;
                        border: 1px solid var(--border);
                        background: var(--bg-surface);
                    }
                    .badge.status.published { color: var(--success); border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.1); }
                    .badge.status.in-progress { color: #60a5fa; border-color: rgba(96, 165, 250, 0.3); background: rgba(96, 165, 250, 0.1); }
                    .badge.status.draft { color: var(--text-muted); }

                    /* Parts List */
                    .parts-list {
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                    }

                    .part-card {
                        background: var(--bg-surface);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-lg);
                        overflow: hidden;
                        transition: border-color 0.2s;
                    }
                    .part-card:hover {
                        border-color: var(--text-primary);
                    }
                    .part-card.editing {
                        border-color: var(--primary);
                        box-shadow: 0 0 0 1px var(--primary);
                    }

                    .part-header {
                        background: rgba(255, 255, 255, 0.02);
                        border-bottom: 1px solid var(--border);
                        padding: 0.75rem 1.5rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .part-label {
                        font-weight: 600;
                        color: var(--text-muted);
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        font-size: 0.9rem;
                    }

                    .part-actions {
                        display: flex;
                        gap: 0.5rem;
                        opacity: 0; 
                        transition: opacity 0.2s;
                    }
                    .part-card:hover .part-actions, .part-card:focus-within .part-actions {
                        opacity: 1;
                    }

                    .icon-btn {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid transparent;
                        background: transparent;
                        color: var(--text-muted);
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .icon-btn:hover {
                        color: var(--text-primary);
                        background: var(--bg-app);
                        border-color: var(--border);
                    }
                    .icon-btn.delete:hover {
                        color: #ef4444;
                        border-color: rgba(239, 68, 68, 0.3);
                        background: rgba(239, 68, 68, 0.1);
                    }

                    .part-content-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                    }
                    @media (max-width: 768px) {
                        .part-content-grid { grid-template-columns: 1fr; }
                    }

                    .content-block {
                        padding: 1.5rem;
                        position: relative;
                    }
                    .content-block.original {
                        border-right: 1px solid var(--border);
                    }
                    @media (max-width: 768px) {
                        .content-block.original { border-right: none; border-bottom: 1px solid var(--border); }
                    }

                    .block-label {
                        position: absolute;
                        top: 0.5rem;
                        left: 1.5rem;
                        font-size: 0.7rem;
                        text-transform: uppercase;
                        color: var(--text-muted);
                        opacity: 0.5;
                    }

                    .content-block p {
                        margin: 0.5rem 0 0;
                        line-height: 1.6;
                        color: var(--text-primary);
                        white-space: pre-wrap;
                    }
                    .content-block.original p {
                        color: var(--text-secondary);
                        font-style: italic;
                    }
                    .content-block.modified p {
                        color: var(--success);
                    }

                    .empty-placeholder {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        padding: 2rem;
                        color: var(--text-muted);
                        opacity: 0.6;
                        cursor: pointer;
                        transition: opacity 0.2s;
                        text-align: center;
                    }
                    .empty-placeholder:hover { opacity: 1; color: var(--primary); }
                    .empty-placeholder i { font-size: 1.5rem; }

                    /* Add Form */
                    .add-part-form {
                        background: var(--bg-surface);
                        border: 1px solid var(--primary);
                        padding: 1.5rem;
                        border-radius: var(--radius-lg);
                    }
                    .add-part-form h3 { margin-top: 0; margin-bottom: 1rem; }

                    .add-textarea {
                        width: 100%;
                        background: var(--bg-app);
                        border: 1px solid var(--border);
                        color: var(--text-primary);
                        padding: 1rem;
                        border-radius: var(--radius-md);
                        font-family: inherit;
                        font-size: 1rem;
                        resize: vertical;
                        margin-bottom: 1rem;
                    }
                    .add-textarea:focus { outline: none; border-color: var(--primary); }

                    .form-actions-right {
                        display: flex;
                        justify-content: flex-end;
                        gap: 1rem;
                    }

                    .add-part-btn-large {
                        width: 100%;
                        padding: 1.5rem;
                        background: transparent;
                        border: 2px dashed var(--border);
                        border-radius: var(--radius-lg);
                        color: var(--text-muted);
                        font-size: 1.1rem;
                        font-weight: 500;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.75rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .add-part-btn-large:hover {
                        border-color: var(--primary);
                        color: var(--primary);
                        background: rgba(124, 58, 237, 0.05);
                    }

                    /* Editing Styles */
                    .edit-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1.5rem;
                        padding: 1.5rem;
                    }
                    .edit-col label {
                        display: block;
                        margin-bottom: 0.5rem;
                        color: var(--text-muted);
                        font-size: 0.9rem;
                    }
                    .edit-textarea {
                        width: 100%;
                        background: var(--bg-app);
                        border: 1px solid var(--border);
                        color: var(--text-primary);
                        padding: 0.75rem;
                        border-radius: var(--radius-md);
                        font-family: inherit;
                        resize: vertical;
                    }
                    .edit-header {
                        padding: 1rem 1.5rem;
                        background: rgba(255,255,255,0.02);
                        border-bottom: 1px solid var(--border);
                    }
                    .edit-header h3 { margin: 0; font-size: 1rem; color: var(--primary); }

                    .edit-actions {
                        padding: 1rem 1.5rem;
                        display: flex;
                        justify-content: flex-end;
                        gap: 1rem;
                        border-top: 1px solid var(--border);
                        background: rgba(255,255,255,0.02);
                    }

                    .btn-save { background: var(--primary); color: white; border: none; padding: 0.5rem 1.5rem; border-radius: var(--radius-md); font-weight: 500; cursor: pointer; }
                    .btn-cancel { background: transparent; color: var(--text-muted); border: 1px solid var(--border); padding: 0.5rem 1.5rem; border-radius: var(--radius-md); cursor: pointer; }
                    
                    @media (max-width: 768px) {
                        .edit-grid { grid-template-columns: 1fr; }
                    }
                `}</style>
            </div>
        );
    };

    window.StoryDetails = StoryDetails;
    console.log("StoryDetails component registered");
})();
