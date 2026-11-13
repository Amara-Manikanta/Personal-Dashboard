window.ScrapbookDashboard = ({ onBackToHome }) => {
    const { useState, useEffect, useMemo, useRef } = React;

    // Detect if running in macOS app
    const isMacApp = !!(
        (window.desktopAPI && window.desktopAPI.isMac) ||
        (window.desktopAPI && window.desktopAPI.platform === 'darwin') ||
        (typeof document !== 'undefined' && document.body.classList.contains('is-mac')) ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    );

    const [scrapbook, setScrapbook] = useState(window.scrapbookData || []);
    const [selectedPage, setSelectedPage] = useState('All');
    const [paperTheme, setPaperTheme] = useState('kraft'); // 'kraft', 'parchment', 'grid', 'dark'
    
    // Modals
    const [isPuncherOpen, setIsPuncherOpen] = useState(false);
    const [isPinCollectionOpen, setIsPinCollectionOpen] = useState(false);
    const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false);
    const [selectedStamp, setSelectedStamp] = useState(null); // for detail modal

    // Puncher Studio State
    const [sourceImage, setSourceImage] = useState(null);
    const [aspectRatio, setAspectRatio] = useState('3:4'); // '3:4', '4:3', '1:1', '2:3'
    const [zoom, setZoom] = useState(1.1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [countryText, setCountryText] = useState('INDIA');
    const [denomText, setDenomText] = useState('₹ 25');
    const [yearText, setYearText] = useState(new Date().getFullYear().toString());
    const [cancellation, setCancellation] = useState('circular'); // 'circular', 'wavy', 'airmail', 'none'
    const [filterTone, setFilterTone] = useState('vintage'); // 'natural', 'vintage', 'golden', 'monochrome'
    const [tapeStyle, setTapeStyle] = useState('vintage-kraft'); // 'vintage-kraft', 'postage-blue', 'floral-rose', 'gold-foil', 'sage-green', 'none'
    const [stampTitle, setStampTitle] = useState('');
    const [stampCaption, setStampCaption] = useState('');
    const [stampLocation, setStampLocation] = useState('');
    const [targetPage, setTargetPage] = useState('Travel & Memories');
    const [isPunching, setIsPunching] = useState(false);
    const [punchSuccess, setPunchSuccess] = useState(false);

    // Collection Picker Search
    const [collectionSearch, setCollectionSearch] = useState('');

    const previewCanvasRef = useRef(null);

    // Sync with global window.scrapbookData
    useEffect(() => {
        if (window.scrapbookData && window.scrapbookData.length > 0) {
            setScrapbook(window.scrapbookData);
        }
    }, [window.scrapbookData]);

    // Unique page names
    const allPages = useMemo(() => {
        const pages = new Set();
        scrapbook.forEach(item => {
            if (item.page && item.page.trim()) pages.add(item.page.trim());
        });
        if (pages.size === 0) {
            pages.add('Travel & Memories');
            pages.add('Wildlife & Nature');
        }
        return Array.from(pages);
    }, [scrapbook]);

    // Filtered stamps by page
    const displayedStamps = useMemo(() => {
        if (selectedPage === 'All') return scrapbook;
        return scrapbook.filter(s => (s.page || 'Travel & Memories') === selectedPage);
    }, [scrapbook, selectedPage]);

    // Draw preview in real-time when puncher parameters change
    useEffect(() => {
        if (!isPuncherOpen || !sourceImage || !previewCanvasRef.current) return;
        renderStampToCanvas(previewCanvasRef.current, {
            imageSrc: sourceImage,
            aspectRatio,
            zoom,
            panX,
            panY,
            countryText,
            denomText,
            yearText,
            cancellation,
            filterTone
        });
    }, [isPuncherOpen, sourceImage, aspectRatio, zoom, panX, panY, countryText, denomText, yearText, cancellation, filterTone]);

    // Handles photo upload (with automatic HEIC to JPEG conversion)
    const handlePhotoUpload = async (e) => {
        let file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
            if (window.normalizeImageFile) {
                file = await window.normalizeImageFile(file);
            }
        } catch (err) {
            alert(err.message || 'Error processing image');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setSourceImage(img);
                if (!stampTitle) {
                    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                    setStampTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Mathematical perforation & stamp rendering engine
    const renderStampToCanvas = (canvas, options, callback) => {
        const {
            imageSrc,
            aspectRatio = '3:4',
            zoom = 1,
            panX = 0,
            panY = 0,
            countryText = 'INDIA',
            denomText = '₹ 25',
            yearText = '2026',
            cancellation = 'circular',
            filterTone = 'vintage'
        } = options;

        let w = 480;
        let h = 640;
        if (aspectRatio === '4:3') { w = 640; h = 480; }
        else if (aspectRatio === '1:1') { w = 540; h = 540; }
        else if (aspectRatio === '2:3') { w = 440; h = 660; }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, w, h);

        // 1. Draw base stamp paper background
        ctx.fillStyle = '#faf7ee';
        ctx.fillRect(0, 0, w, h);

        // Subtle paper texture grain
        ctx.fillStyle = 'rgba(180, 150, 110, 0.04)';
        for (let i = 0; i < 600; i++) {
            const gx = Math.random() * w;
            const gy = Math.random() * h;
            ctx.fillRect(gx, gy, 1.5, 1.5);
        }

        // Inner margin for photo
        const padX = Math.round(w * 0.08);
        const padTop = Math.round(w * 0.08);
        const padBottom = Math.round(h * 0.16);
        const innerW = w - padX * 2;
        const innerH = h - padTop - padBottom;

        // 2. Draw cropped photo with tone filter
        ctx.save();
        ctx.beginPath();
        ctx.rect(padX, padTop, innerW, innerH);
        ctx.clip();

        // Apply tone filters
        if (filterTone === 'vintage') {
            ctx.filter = 'sepia(0.28) contrast(1.1) brightness(0.96) saturate(1.15)';
        } else if (filterTone === 'golden') {
            ctx.filter = 'sepia(0.4) saturate(1.3) brightness(1.02)';
        } else if (filterTone === 'monochrome') {
            ctx.filter = 'grayscale(1) contrast(1.2) brightness(0.95)';
        } else {
            ctx.filter = 'none';
        }

        if (imageSrc && imageSrc.width) {
            const imgAspect = imageSrc.width / imageSrc.height;
            const targetAspect = innerW / innerH;
            let drawW, drawH;

            if (imgAspect > targetAspect) {
                drawH = innerH * zoom;
                drawW = drawH * imgAspect;
            } else {
                drawW = innerW * zoom;
                drawH = drawW / imgAspect;
            }

            const centerX = padX + innerW / 2 + (panX * innerW) / 200;
            const centerY = padTop + innerH / 2 + (panY * innerH) / 200;

            ctx.drawImage(imageSrc, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
        }
        ctx.restore();

        // 3. Inner fine philatelic frame border around photo
        ctx.strokeStyle = 'rgba(70, 50, 30, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(padX - 2, padTop - 2, innerW + 4, innerH + 4);

        ctx.strokeStyle = 'rgba(70, 50, 30, 0.18)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(padX - 5, padTop - 5, innerW + 10, innerH + 10);

        // 4. Philatelic Text (Country, Denomination, Year)
        const textBaselineY = h - Math.round(padBottom * 0.42);

        // Country name
        ctx.font = 'bold 16px "Cinzel", "Georgia", "Times New Roman", serif';
        ctx.fillStyle = '#2d241e';
        ctx.textAlign = 'left';
        ctx.fillText(countryText.toUpperCase(), padX + 2, textBaselineY);

        // Year
        ctx.font = '13px "Georgia", serif';
        ctx.fillStyle = '#7a6857';
        ctx.fillText(`· ${yearText}`, padX + ctx.measureText(countryText.toUpperCase()).width + 8, textBaselineY - 1);

        // Denomination
        ctx.font = 'bold 20px "Cinzel", "Georgia", serif';
        ctx.fillStyle = '#8b261d';
        ctx.textAlign = 'right';
        ctx.fillText(denomText, w - padX - 2, textBaselineY);

        // 5. Postal Cancellation Stamp / Postmark
        if (cancellation !== 'none') {
            ctx.save();
            ctx.translate(w * 0.68, h * 0.45);
            ctx.rotate(-0.18); // organic slight tilt

            if (cancellation === 'circular' || cancellation === 'airmail') {
                // Postmark ink
                const inkColor = cancellation === 'airmail' ? 'rgba(180, 40, 40, 0.65)' : 'rgba(30, 35, 45, 0.62)';
                ctx.strokeStyle = inkColor;
                ctx.fillStyle = inkColor;

                // Outer circle
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 68, 0, Math.PI * 2);
                ctx.stroke();

                // Inner circle
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, 58, 0, Math.PI * 2);
                ctx.stroke();

                // Town & Postmark text
                ctx.font = 'bold 10px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('POSTAL SERVICE', 0, -42);
                ctx.font = 'bold 13px "Courier New", monospace';
                ctx.fillText(yearText, 0, 5);
                ctx.font = 'bold 9px "Courier New", monospace';
                ctx.fillText('VERIFIED · AIRMAIL', 0, 45);

                // Wavy cancellation bars extending out
                ctx.lineWidth = 1.8;
                for (let k = -28; k <= 28; k += 14) {
                    ctx.beginPath();
                    ctx.moveTo(70, k);
                    ctx.bezierCurveTo(90, k - 7, 110, k + 7, 135, k);
                    ctx.stroke();
                }
            } else if (cancellation === 'wavy') {
                ctx.strokeStyle = 'rgba(25, 30, 40, 0.68)';
                ctx.lineWidth = 2.2;
                for (let line = -45; line <= 45; line += 15) {
                    ctx.beginPath();
                    for (let x = -120; x <= 120; x += 30) {
                        const y = line + Math.sin(x * 0.08) * 6;
                        if (x === -120) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        // 6. Cut Authentic Perforations using destination-out!
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000000';

        const holeRadius = 6.5;
        const targetSpacing = 18;

        const numHolesW = Math.round(w / targetSpacing);
        const spacingW = w / numHolesW;

        const numHolesH = Math.round(h / targetSpacing);
        const spacingH = h / numHolesH;

        // Top & Bottom Edge Holes
        for (let i = 0; i < numHolesW; i++) {
            const x = (i + 0.5) * spacingW;
            // Top
            ctx.beginPath();
            ctx.arc(x, 0, holeRadius, 0, Math.PI * 2);
            ctx.fill();
            // Bottom
            ctx.beginPath();
            ctx.arc(x, h, holeRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Left & Right Edge Holes
        for (let j = 0; j < numHolesH; j++) {
            const y = (j + 0.5) * spacingH;
            // Left
            ctx.beginPath();
            ctx.arc(0, y, holeRadius, 0, Math.PI * 2);
            ctx.fill();
            // Right
            ctx.beginPath();
            ctx.arc(w, y, holeRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Corner cut notches
        ctx.beginPath();
        ctx.arc(0, 0, holeRadius * 0.75, 0, Math.PI * 2);
        ctx.arc(w, 0, holeRadius * 0.75, 0, Math.PI * 2);
        ctx.arc(0, h, holeRadius * 0.75, 0, Math.PI * 2);
        ctx.arc(w, h, holeRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (callback) callback();
    };

    // Execute Stamp Punch & Save to Scrapbook
    const handlePunchStamp = async () => {
        if (!sourceImage) return;
        setIsPunching(true);

        try {
            // High-resolution canvas for crystal clear punch quality
            const exportCanvas = document.createElement('canvas');
            renderStampToCanvas(exportCanvas, {
                imageSrc: sourceImage,
                aspectRatio,
                zoom,
                panX,
                panY,
                countryText,
                denomText,
                yearText,
                cancellation,
                filterTone
            });

            const dataUrl = exportCanvas.toDataURL('image/png');
            let savedPath = dataUrl;

            // Save to server uploads if running locally
            if (window.api && window.api.uploadImage) {
                const uploadRes = await window.api.uploadImage({
                    name: `punch_stamp_${Date.now()}.png`,
                    image: dataUrl,
                    folder: 'scrapbook'
                });
                if (uploadRes && uploadRes.path) {
                    savedPath = uploadRes.path;
                }
            }

            // Organic subtle random tilt between -2.5 and +2.5 degrees
            const randomTilt = parseFloat(((Math.random() * 4) - 2).toFixed(1));

            const newStampItem = {
                id: `scrap_${Date.now()}`,
                title: stampTitle || 'Punched Stamp Memory',
                caption: stampCaption || 'A moment turned into a timeless postage stamp.',
                date: new Date().toISOString().split('T')[0],
                location: stampLocation || 'Scrapbook Studio',
                stampImage: savedPath,
                country: countryText,
                denomination: denomText,
                year: yearText,
                cancellationType: cancellation,
                aspectRatio,
                washiTape: tapeStyle,
                page: targetPage || 'Travel & Memories',
                tilt: randomTilt,
                isFromCollection: false,
                createdAt: new Date().toISOString()
            };

            const updatedScrapbook = [newStampItem, ...scrapbook];
            setScrapbook(updatedScrapbook);
            window.scrapbookData = updatedScrapbook;

            if (window.api && window.api.saveScrapbook) {
                await window.api.saveScrapbook(updatedScrapbook);
            }

            setPunchSuccess(true);
            setTimeout(() => {
                setPunchSuccess(false);
                setIsPuncherOpen(false);
                // Reset fields
                setSourceImage(null);
                setStampTitle('');
                setStampCaption('');
                setStampLocation('');
            }, 1200);

        } catch (err) {
            console.error("Failed to punch stamp:", err);
            alert("Error punching stamp: " + err.message);
        } finally {
            setIsPunching(false);
        }
    };

    // Pin a stamp from the Collection
    const handlePinCollectible = async (collectible) => {
        const imageUrl = collectible.images && collectible.images[0] ? collectible.images[0].url : '';
        if (!imageUrl) return;

        const randomTilt = parseFloat(((Math.random() * 4) - 2).toFixed(1));

        const newStampItem = {
            id: `scrap_${Date.now()}`,
            title: collectible.name,
            caption: collectible.notes || 'Archival stamp mounted into personal digital scrapbook journal.',
            date: collectible.year ? `${collectible.year}-01-01` : new Date().toISOString().split('T')[0],
            location: collectible.country || 'India',
            stampImage: imageUrl,
            country: collectible.country || 'India',
            denomination: collectible.denomination || '',
            year: collectible.year || '',
            cancellationType: 'circular',
            aspectRatio: '4:3',
            washiTape: tapeStyle,
            page: targetPage || 'Travel & Memories',
            tilt: randomTilt,
            isFromCollection: true,
            createdAt: new Date().toISOString()
        };

        const updated = [newStampItem, ...scrapbook];
        setScrapbook(updated);
        window.scrapbookData = updated;

        if (window.api && window.api.saveScrapbook) {
            await window.api.saveScrapbook(updated);
        }

        setIsPinCollectionOpen(false);
    };

    // Delete a stamp from the scrapbook
    const handleDeleteStamp = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Remove this stamp from your scrapbook?")) return;

        const updated = scrapbook.filter(s => s.id !== id);
        setScrapbook(updated);
        window.scrapbookData = updated;

        if (window.api && window.api.saveScrapbook) {
            await window.api.saveScrapbook(updated);
        }
        if (selectedStamp && selectedStamp.id === id) {
            setSelectedStamp(null);
        }
    };

    // Download high-res transparent PNG
    const downloadStampPng = (item, e) => {
        if (e) e.stopPropagation();
        const link = document.createElement('a');
        link.href = item.stampImage;
        link.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stamp.png`;
        link.click();
    };

    return (
        <div className={`scrapbook-page theme-${paperTheme}`}>
            {/* Scrapbook Header */}
            <div className="scrapbook-header">
                <div className="header-left">
                    <button className="back-btn" onClick={onBackToHome}>
                        <i className="ph-bold ph-arrow-left"></i>
                        Home
                    </button>
                    <div className="title-group">
                        <div className="header-badge">
                            <i className="ph-fill ph-sparkle"></i> Trending Stamp Craft & Scrapbook
                        </div>
                        <h1>Digital Stamp Scrapbook</h1>
                        <p className="subtitle">
                            Crop any photo into scalloped postage stamps and mount them into your vintage aesthetic journal.
                        </p>
                    </div>
                </div>

                <div className="header-actions">
                    {/* ONLY SHOW UPLOAD / PUNCH BUTTON IN MACOS APP */}
                    {isMacApp ? (
                        <button className="btn-primary punch-btn" onClick={() => setIsPuncherOpen(true)}>
                            <i className="ph-fill ph-stamp"></i>
                            Punch New Stamp
                        </button>
                    ) : (
                        <div className="macos-only-badge" title="Launch LifeStudio macOS desktop app to crop & punch photos into stamps">
                            <i className="ph-fill ph-desktop"></i>
                            Photo Upload active in macOS app
                        </div>
                    )}

                    <button className="btn-secondary" onClick={() => setIsPinCollectionOpen(true)}>
                        <i className="ph-bold ph-push-pin"></i>
                        Pin from Collection
                    </button>

                    <button className="btn-secondary" onClick={() => setIsPrintSheetOpen(true)} title="Generate printable sheet for craft puncher">
                        <i className="ph-bold ph-printer"></i>
                        Print & Punch Sheet
                    </button>
                </div>
            </div>

            {/* Toolbar: Paper Style & Page Navigation */}
            <div className="scrapbook-toolbar">
                <div className="page-tabs">
                    <button
                        className={`page-tab ${selectedPage === 'All' ? 'is-active' : ''}`}
                        onClick={() => setSelectedPage('All')}
                    >
                        <i className="ph-fill ph-bookmarks"></i> All Pages ({scrapbook.length})
                    </button>
                    {allPages.map(p => (
                        <button
                            key={p}
                            className={`page-tab ${selectedPage === p ? 'is-active' : ''}`}
                            onClick={() => setSelectedPage(p)}
                        >
                            <i className="ph-bold ph-book-open"></i> {p} ({scrapbook.filter(s => (s.page || 'Travel & Memories') === p).length})
                        </button>
                    ))}
                </div>

                <div className="toolbar-right">
                    <div className="paper-theme-picker">
                        <span className="picker-label"><i className="ph-bold ph-paint-brush"></i> Paper:</span>
                        <button
                            className={`theme-dot theme-kraft ${paperTheme === 'kraft' ? 'is-active' : ''}`}
                            onClick={() => setPaperTheme('kraft')}
                            title="Vintage Kraft Paper"
                        ></button>
                        <button
                            className={`theme-dot theme-parchment ${paperTheme === 'parchment' ? 'is-active' : ''}`}
                            onClick={() => setPaperTheme('parchment')}
                            title="Ivory Parchment"
                        ></button>
                        <button
                            className={`theme-dot theme-grid ${paperTheme === 'grid' ? 'is-active' : ''}`}
                            onClick={() => setPaperTheme('grid')}
                            title="Japanese Grid Journal"
                        ></button>
                        <button
                            className={`theme-dot theme-dark ${paperTheme === 'dark' ? 'is-active' : ''}`}
                            onClick={() => setPaperTheme('dark')}
                            title="Midnight Velvet"
                        ></button>
                    </div>
                </div>
            </div>

            {/* Scrapbook Album Board */}
            <div className="scrapbook-board">
                {displayedStamps.length === 0 ? (
                    <div className="scrapbook-empty">
                        <div className="empty-icon">
                            <i className="ph-duotone ph-book-bookmark"></i>
                        </div>
                        <h3>Your Scrapbook Page is Empty</h3>
                        <p>Turn personal photos into perforated stamps or pin classic stamps from your collection.</p>
                        {isMacApp ? (
                            <button className="btn-primary" onClick={() => setIsPuncherOpen(true)}>
                                <i className="ph-fill ph-stamp"></i> Punch Your First Stamp
                            </button>
                        ) : (
                            <button className="btn-secondary" onClick={() => setIsPinCollectionOpen(true)}>
                                <i className="ph-bold ph-push-pin"></i> Pin from Collection
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="stamp-grid">
                        {displayedStamps.map(item => (
                            <div
                                key={item.id}
                                className={`scrapbook-card tape-${item.washiTape || 'vintage-kraft'}`}
                                style={{ '--stamp-tilt': `${item.tilt || 0}deg` }}
                                onClick={() => setSelectedStamp(item)}
                            >
                                {/* Washi Tape Decoration */}
                                {item.washiTape !== 'none' && (
                                    <div className={`washi-tape washi-${item.washiTape || 'vintage-kraft'}`}></div>
                                )}

                                {/* Perforated Stamp Item */}
                                <div className="stamp-frame">
                                    <img
                                        src={item.stampImage}
                                        alt={item.title}
                                        className="stamp-img"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Handwritten Memory Caption & Meta */}
                                <div className="stamp-caption-area">
                                    <h4 className="stamp-memory-title">{item.title}</h4>
                                    <p className="stamp-memory-text">{item.caption}</p>
                                    <div className="stamp-meta-footer">
                                        {item.location && (
                                            <span className="stamp-tag">
                                                <i className="ph-fill ph-map-pin"></i> {item.location}
                                            </span>
                                        )}
                                        {item.year && (
                                            <span className="stamp-tag date-tag">
                                                <i className="ph-bold ph-calendar-blank"></i> {item.year}
                                            </span>
                                        )}
                                        {item.denomination && (
                                            <span className="stamp-denom-tag">{item.denomination}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Action Bar */}
                                <div className="card-hover-actions">
                                    <button
                                        className="action-icon-btn"
                                        onClick={(e) => downloadStampPng(item, e)}
                                        title="Download Transparent Perforated PNG"
                                    >
                                        <i className="ph-bold ph-download-simple"></i>
                                    </button>
                                    <button
                                        className="action-icon-btn is-delete"
                                        onClick={(e) => handleDeleteStamp(item.id, e)}
                                        title="Delete from Scrapbook"
                                    >
                                        <i className="ph-bold ph-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Physical Stamp Puncher Reference Footer */}
            <div className="scrapbook-footer-info">
                <div className="info-card">
                    <i className="ph-fill ph-scissors"></i>
                    <div className="info-text">
                        <strong>Love physical scrapbooking?</strong> You can print your digital stamp sheet and cut them using the trending 
                        <a 
                            href="https://www.amazon.in/Scrapbooking-Projects-Journaling-Decoration-Supplies/dp/B0H9YY84HN" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="amazon-link"
                        >
                            Postage Stamp Paper Puncher on Amazon <i className="ph-bold ph-arrow-square-out"></i>
                        </a>.
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 1. STAMP PUNCHER STUDIO MODAL (macOS App exclusive)       */}
            {/* ========================================================= */}
            {isPuncherOpen && (
                <div className="modal-backdrop" onClick={() => setIsPuncherOpen(false)}>
                    <div className="puncher-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="puncher-icon-tag"><i className="ph-fill ph-stamp"></i></div>
                                <div>
                                    <h3>Stamp Puncher Studio</h3>
                                    <p>Crop any photo, perforate scalloped edges, and add vintage philatelic marks.</p>
                                </div>
                            </div>
                            <button className="modal-close-btn" onClick={() => setIsPuncherOpen(false)}>
                                <i className="ph-bold ph-x"></i>
                            </button>
                        </div>

                        <div className="puncher-body">
                            {/* Left Column: Interactive Canvas & Framing */}
                            <div className="puncher-left">
                                <div className="canvas-container">
                                    {sourceImage ? (
                                        <div className="canvas-wrapper">
                                            <canvas ref={previewCanvasRef} className="preview-canvas" />
                                        </div>
                                    ) : (
                                        <label className="upload-dropzone">
                                            <input
                                                type="file"
                                                accept="image/*,.heic,.heif,.HEIC,.HEIF"
                                                onChange={handlePhotoUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <div className="dropzone-content">
                                                <i className="ph-duotone ph-cloud-arrow-up"></i>
                                                <h4>Select or Drag Photo to Punch</h4>
                                                <p>Supports portraits, landscapes, travel memories, pets & art</p>
                                                <span className="browse-badge">Browse Photos</span>
                                            </div>
                                        </label>
                                    )}
                                </div>

                                {sourceImage && (
                                    <div className="canvas-controls">
                                        <div className="control-slider">
                                            <label><i className="ph-bold ph-magnifying-glass-plus"></i> Zoom: {zoom.toFixed(1)}x</label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="3"
                                                step="0.05"
                                                value={zoom}
                                                onChange={e => setZoom(parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="control-slider">
                                            <label><i className="ph-bold ph-arrows-out-line-horizontal"></i> Pan Horizontal</label>
                                            <input
                                                type="range"
                                                min="-100"
                                                max="100"
                                                step="2"
                                                value={panX}
                                                onChange={e => setPanX(parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="control-slider">
                                            <label><i className="ph-bold ph-arrows-out-line-vertical"></i> Pan Vertical</label>
                                            <input
                                                type="range"
                                                min="-100"
                                                max="100"
                                                step="2"
                                                value={panY}
                                                onChange={e => setPanY(parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <label className="change-photo-btn">
                                            <input type="file" accept="image/*,.heic,.heif,.HEIC,.HEIF" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                            <i className="ph-bold ph-camera-rotate"></i> Change Photo
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Customization Controls */}
                            <div className="puncher-right">
                                <div className="form-section">
                                    <label className="section-label">1. Stamp Size & Aspect Ratio</label>
                                    <div className="pill-group">
                                        {[
                                            { id: '3:4', label: 'Classic Portrait (3:4)' },
                                            { id: '4:3', label: 'Landscape (4:3)' },
                                            { id: '1:1', label: 'Square (1:1)' },
                                            { id: '2:3', label: 'Airmail (2:3)' }
                                        ].map(r => (
                                            <button
                                                key={r.id}
                                                className={`pill-btn ${aspectRatio === r.id ? 'is-active' : ''}`}
                                                onClick={() => setAspectRatio(r.id)}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label className="section-label">2. Philatelic Text & Markings</label>
                                    <div className="input-grid-2">
                                        <div>
                                            <span className="field-label">Country / Header</span>
                                            <input
                                                type="text"
                                                value={countryText}
                                                onChange={e => setCountryText(e.target.value)}
                                                placeholder="INDIA"
                                                maxLength={16}
                                            />
                                        </div>
                                        <div>
                                            <span className="field-label">Face Value / Denom</span>
                                            <input
                                                type="text"
                                                value={denomText}
                                                onChange={e => setDenomText(e.target.value)}
                                                placeholder="₹ 25"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-grid-2" style={{ marginTop: '0.65rem' }}>
                                        <div>
                                            <span className="field-label">Year / Issue Date</span>
                                            <input
                                                type="text"
                                                value={yearText}
                                                onChange={e => setYearText(e.target.value)}
                                                placeholder="2026"
                                                maxLength={6}
                                            />
                                        </div>
                                        <div>
                                            <span className="field-label">Postmark Cancellation</span>
                                            <select value={cancellation} onChange={e => setCancellation(e.target.value)}>
                                                <option value="circular">Circular Date Stamp</option>
                                                <option value="wavy">Classic Wavy Lines</option>
                                                <option value="airmail">Red Airmail Seal</option>
                                                <option value="none">Clean Mint (No Postmark)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label className="section-label">3. Photo Aesthetic & Tone</label>
                                    <div className="pill-group">
                                        {[
                                            { id: 'vintage', label: 'Warm Vintage' },
                                            { id: 'natural', label: 'Natural' },
                                            { id: 'golden', label: 'Golden Sun' },
                                            { id: 'monochrome', label: 'Classic B&W' }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                className={`pill-btn ${filterTone === t.id ? 'is-active' : ''}`}
                                                onClick={() => setFilterTone(t.id)}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label className="section-label">4. Memory & Scrapbook Placement</label>
                                    <div className="field-block">
                                        <span className="field-label">Memory Title</span>
                                        <input
                                            type="text"
                                            value={stampTitle}
                                            onChange={e => setStampTitle(e.target.value)}
                                            placeholder="e.g. Sunset at Marine Drive"
                                        />
                                    </div>
                                    <div className="field-block" style={{ marginTop: '0.65rem' }}>
                                        <span className="field-label">Journal Note / Caption</span>
                                        <textarea
                                            rows="2"
                                            value={stampCaption}
                                            onChange={e => setStampCaption(e.target.value)}
                                            placeholder="What makes this moment special..."
                                        />
                                    </div>
                                    <div className="input-grid-2" style={{ marginTop: '0.65rem' }}>
                                        <div>
                                            <span className="field-label">Location Tag</span>
                                            <input
                                                type="text"
                                                value={stampLocation}
                                                onChange={e => setStampLocation(e.target.value)}
                                                placeholder="e.g. Mumbai, Maharashtra"
                                            />
                                        </div>
                                        <div>
                                            <span className="field-label">Scrapbook Page</span>
                                            <input
                                                type="text"
                                                value={targetPage}
                                                onChange={e => setTargetPage(e.target.value)}
                                                placeholder="Travel & Memories"
                                                list="scrapbook-pages-list"
                                            />
                                            <datalist id="scrapbook-pages-list">
                                                {allPages.map(p => <option key={p} value={p} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="field-block" style={{ marginTop: '0.65rem' }}>
                                        <span className="field-label">Decorative Washi Tape</span>
                                        <div className="washi-picker">
                                            {[
                                                { id: 'vintage-kraft', name: 'Kraft Tape' },
                                                { id: 'postage-blue', name: 'Airmail Blue' },
                                                { id: 'floral-rose', name: 'Rose Floral' },
                                                { id: 'gold-foil', name: 'Gold Foil' },
                                                { id: 'sage-green', name: 'Sage Leaf' },
                                                { id: 'none', name: 'None (Photo Corners)' }
                                            ].map(w => (
                                                <button
                                                    key={w.id}
                                                    type="button"
                                                    className={`washi-choice washi-${w.id} ${tapeStyle === w.id ? 'is-selected' : ''}`}
                                                    onClick={() => setTapeStyle(w.id)}
                                                >
                                                    {w.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsPuncherOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className={`btn-primary punch-action-btn ${punchSuccess ? 'is-success' : ''}`}
                                onClick={handlePunchStamp}
                                disabled={!sourceImage || isPunching}
                            >
                                {isPunching ? (
                                    <>
                                        <i className="ph-bold ph-spinner ph-spin"></i>
                                        Punching Perforations…
                                    </>
                                ) : punchSuccess ? (
                                    <>
                                        <i className="ph-bold ph-check"></i>
                                        Stamp Punched & Mounted!
                                    </>
                                ) : (
                                    <>
                                        <i className="ph-fill ph-stamp"></i>
                                        PUNCH STAMP!
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 2. PIN FROM COLLECTION MODAL                              */}
            {/* ========================================================= */}
            {isPinCollectionOpen && (
                <div className="modal-backdrop" onClick={() => setIsPinCollectionOpen(false)}>
                    <div className="collection-picker-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Pin a Collectible Stamp</h3>
                                <p>Mount any historic stamp from your 162 collection items into your scrapbook journal.</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setIsPinCollectionOpen(false)}>
                                <i className="ph-bold ph-x"></i>
                            </button>
                        </div>

                        <div className="collection-picker-search">
                            <i className="ph-bold ph-magnifying-glass"></i>
                            <input
                                type="text"
                                placeholder="Search stamps by title, subject, year or denomination…"
                                value={collectionSearch}
                                onChange={e => setCollectionSearch(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="collection-picker-grid">
                            {(window.collectiblesData || [])
                                .filter(c => (c.type || 'stamp') === 'stamp')
                                .filter(c => {
                                    if (!collectionSearch) return true;
                                    const q = collectionSearch.toLowerCase();
                                    return (c.name && c.name.toLowerCase().includes(q)) ||
                                           (c.year && c.year.includes(q)) ||
                                           (c.denomination && c.denomination.toLowerCase().includes(q));
                                })
                                .slice(0, 48)
                                .map(c => {
                                    const img = c.images && c.images[0] ? c.images[0].url : '';
                                    return (
                                        <div
                                            key={c.id}
                                            className="collectible-pick-card"
                                            onClick={() => handlePinCollectible(c)}
                                        >
                                            <div className="collectible-thumb">
                                                <img src={img} alt={c.name} loading="lazy" />
                                            </div>
                                            <div className="collectible-info">
                                                <h5>{c.name}</h5>
                                                <span>{c.denomination} · {c.year}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 3. STAMP DETAIL & MEMORY VIEW MODAL                      */}
            {/* ========================================================= */}
            {selectedStamp && (
                <div className="modal-backdrop" onClick={() => setSelectedStamp(null)}>
                    <div className="stamp-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="detail-modal-stamp">
                            <img src={selectedStamp.stampImage} alt={selectedStamp.title} />
                        </div>
                        <div className="detail-modal-content">
                            <div className="detail-header">
                                <span className="detail-page-tag">{selectedStamp.page || 'Travel & Memories'}</span>
                                <h3>{selectedStamp.title}</h3>
                                <div className="detail-meta">
                                    {selectedStamp.location && <span><i className="ph-fill ph-map-pin"></i> {selectedStamp.location}</span>}
                                    {selectedStamp.year && <span><i className="ph-bold ph-calendar"></i> {selectedStamp.year}</span>}
                                    {selectedStamp.denomination && <span className="denom-pill">{selectedStamp.denomination}</span>}
                                </div>
                            </div>

                            <div className="detail-caption">
                                <p>{selectedStamp.caption}</p>
                            </div>

                            <div className="detail-actions">
                                <button className="btn-primary" onClick={(e) => downloadStampPng(selectedStamp, e)}>
                                    <i className="ph-bold ph-download-simple"></i>
                                    Download Perforated PNG
                                </button>
                                <button className="btn-secondary is-danger" onClick={(e) => handleDeleteStamp(selectedStamp.id, e)}>
                                    <i className="ph-bold ph-trash"></i>
                                    Delete Stamp
                                </button>
                                <button className="btn-secondary" onClick={() => setSelectedStamp(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 4. PRINT & PUNCH SHEET MODAL                              */}
            {/* ========================================================= */}
            {isPrintSheetOpen && (
                <div className="modal-backdrop" onClick={() => setIsPrintSheetOpen(false)}>
                    <div className="print-sheet-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Printable Stamp Punch Sheet</h3>
                                <p>Print on photo paper or sticker paper, then cut out or punch using your stamp puncher tool.</p>
                            </div>
                            <div className="print-header-actions">
                                <button className="btn-primary" onClick={() => window.print()}>
                                    <i className="ph-bold ph-printer"></i> Print Sheet
                                </button>
                                <button className="modal-close-btn" onClick={() => setIsPrintSheetOpen(false)}>
                                    <i className="ph-bold ph-x"></i>
                                </button>
                            </div>
                        </div>

                        <div className="print-sheet-content">
                            <div className="printable-page">
                                <div className="printable-sheet-title">
                                    <span>LIFESTUDIO · STAMP SCRAPBOOK CRAFT SHEET</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="printable-stamp-grid">
                                    {scrapbook.map(s => (
                                        <div key={s.id} className="printable-stamp-cell">
                                            <div className="punch-cross-guide top-left"></div>
                                            <div className="punch-cross-guide top-right"></div>
                                            <div className="punch-cross-guide bottom-left"></div>
                                            <div className="punch-cross-guide bottom-right"></div>
                                            <img src={s.stampImage} alt={s.title} />
                                            <span className="punch-title-label">{s.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
