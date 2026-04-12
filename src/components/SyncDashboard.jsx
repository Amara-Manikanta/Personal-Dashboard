window.SyncDashboard = ({ onBackToHome }) => {
    const { useState, useEffect } = React;

    const [isLocalhost, setIsLocalhost] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const [tokenInput, setTokenInput] = useState('');
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const local = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '';
        setIsLocalhost(local);
        
        if (window.api && window.api.sync) {
            setHasToken(window.api.sync.hasToken());
        }
    }, []);

    const showStatus = (msg, type) => {
        setStatus({ message: msg, type: type });
        setTimeout(() => setStatus({ message: '', type: '' }), 5000);
    };

    const handleSaveToken = () => {
        if (!tokenInput.trim()) return;
        window.api.sync.setToken(tokenInput.trim());
        setHasToken(true);
        setTokenInput('');
        showStatus('Token saved successfully.', 'success');
    };

    const handleClearToken = () => {
        window.api.sync.clearToken();
        setHasToken(false);
        showStatus('Token cleared.', 'info');
    };

    const handlePull = async () => {
        setIsLoading(true);
        setStatus({ message: 'Pulling data from GitHub...', type: 'info' });
        try {
            const results = await window.api.sync.pullFromOnline();
            if (results.failed.length === 0) {
                showStatus(`Successfully pulled: ${results.success.join(', ')}`, 'success');
                // Reload window to reflect new data
                setTimeout(() => window.location.reload(), 2000);
            } else {
                showStatus(`Pulled ${results.success.length} files. Failed: ${results.failed.join(', ')}`, 'warning');
            }
        } catch (e) {
            showStatus(`Pull failed: ${e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePush = async () => {
        setIsLoading(true);
        setStatus({ message: 'Pushing data to GitHub...', type: 'info' });
        try {
            const results = await window.api.sync.pushToOnline();
            if (results.failed.length === 0) {
                showStatus(`Successfully pushed: ${results.success.join(', ')}`, 'success');
            } else {
                showStatus(`Pushed ${results.success.length} files. Failed: ${results.failed.join(', ')}`, 'warning');
            }
        } catch (e) {
            showStatus(`Push failed: ${e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLocalhost) {
        return (
            <div className="sync-page">
                 <div className="sync-header">
                    <button className="back-btn" onClick={onBackToHome}>
                        <i className="ph-bold ph-arrow-left"></i>
                        Back
                    </button>
                    <h1>Sync Data</h1>
                </div>
                <div className="sync-container">
                    <div className="sync-card shadow">
                        <div className="status-banner error">
                            <i className="ph-fill ph-warning-circle"></i>
                            Sync is only available when running on localhost. When hosted online, changes are written directly to GitHub.
                        </div>
                    </div>
                </div>
                {/* Reusing existing styles below */}
            </div>
        );
    }

    return (
        <div className="sync-page">
            <div className="sync-header">
                <button className="back-btn" onClick={onBackToHome}>
                    <i className="ph-bold ph-arrow-left"></i>
                    Back
                </button>
                <h1>Sync Data <span className="badge">Localhost</span></h1>
            </div>

            <div className="sync-container">
                <div className="sync-card">
                    <div className="card-header">
                        <h2>GitHub Connection</h2>
                    </div>
                    <div className="card-body">
                        {hasToken ? (
                            <div className="token-status success">
                                <i className="ph-fill ph-check-circle"></i>
                                <span>GitHub Token is configured.</span>
                                <button className="btn-small btn-clear" onClick={handleClearToken}>Clear Token</button>
                            </div>
                        ) : (
                            <div className="token-setup">
                                <p>To push data, you need a Personal Access Token with repo scope.</p>
                                <div className="input-group">
                                    <input 
                                        type="password" 
                                        placeholder="ghp_..." 
                                        value={tokenInput}
                                        onChange={(e) => setTokenInput(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <button className="btn-primary" onClick={handleSaveToken} disabled={isLoading}>Save</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sync-actions-grid">
                    <div className="sync-action-card">
                        <div className="action-icon">
                            <i className="ph-fill ph-download-simple"></i>
                        </div>
                        <h3>Pull from Online</h3>
                        <p>Download the latest data from GitHub to your local machine. This will overwrite local changes.</p>
                        <button className="btn-primary" onClick={handlePull} disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Pull Data'}
                        </button>
                    </div>

                    <div className="sync-action-card">
                        <div className="action-icon">
                            <i className="ph-fill ph-upload-simple"></i>
                        </div>
                        <h3>Push to Online</h3>
                        <p>Upload your local data to GitHub. This will overwrite the online data with your local copy.</p>
                        <button className="btn-primary" onClick={handlePush} disabled={isLoading || !hasToken}>
                            {isLoading ? 'Processing...' : 'Push Data'}
                        </button>
                    </div>
                </div>

                {status.message && (
                    <div className={`status-banner ${status.type}`}>
                        {status.type === 'success' && <i className="ph-fill ph-check-circle"></i>}
                        {status.type === 'error' && <i className="ph-fill ph-warning-circle"></i>}
                        {status.type === 'warning' && <i className="ph-fill ph-warning"></i>}
                        {status.type === 'info' && <i className="ph-fill ph-info"></i>}
                        {status.message}
                    </div>
                )}
            </div>

            <style>{`
                .sync-page {
                    min-height: 100vh;
                    background: var(--bg-app);
                    padding: 2rem;
                    color: var(--text-primary);
                }

                .sync-header {
                    max-width: 900px;
                    margin: 0 auto 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .back-btn:hover {
                    background: var(--bg-hover);
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .sync-header h1 {
                    margin: 0;
                    font-size: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .badge {
                    font-size: 0.9rem;
                    background: var(--primary);
                    color: white;
                    padding: 0.2rem 0.6rem;
                    border-radius: 1rem;
                    font-weight: 600;
                }

                .sync-container {
                    max-width: 900px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .sync-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                }

                .sync-card h2 {
                    margin: 0 0 1rem 0;
                    font-size: 1.3rem;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 0.5rem;
                }

                .token-status {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                }

                .token-status.success {
                    background: rgba(34, 197, 94, 0.1);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }

                .btn-small {
                    padding: 0.4rem 0.8rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.9rem;
                    cursor: pointer;
                    margin-left: auto;
                    border: none;
                }

                .btn-clear {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                }
                .btn-clear:hover {
                    background: rgba(239, 68, 68, 0.3);
                }

                .token-setup p {
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                }

                .input-group {
                    display: flex;
                    gap: 1rem;
                }

                .input-group input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    background: var(--bg-app);
                    color: var(--text-primary);
                    outline: none;
                }

                .input-group input:focus {
                    border-color: var(--primary);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .sync-actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .sync-action-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .action-icon {
                    width: 60px;
                    height: 60px;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: var(--primary);
                }

                .sync-action-card h3 {
                    margin: 0;
                }
                
                .sync-action-card p {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin: 0;
                    flex: 1;
                }

                .status-banner {
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 500;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .status-banner.success { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
                .status-banner.error { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
                .status-banner.warning { background: rgba(234, 179, 8, 0.1); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.2); }
                .status-banner.info { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }

                @media (max-width: 768px) {
                    .sync-actions-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};
