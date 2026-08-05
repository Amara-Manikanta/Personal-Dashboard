window.PhysicsTitle = ({ text = 'My Life Tracker' }) => {
    const { useEffect, useRef, useState } = React;
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const runnerRef = useRef(null);
    const audioCtxRef = useRef(null);
    const [letters, setLetters] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(false);

    // Audio setup
    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        setAudioEnabled(true);
    };

    const playChime = (velocity) => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        
        // Lower threshold for curtain brushes
        const volume = Math.min(Math.max(velocity * 0.05, 0.005), 0.2);
        if (volume < 0.01) return;

        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle'; // Clearer, glassier sound than sine
        // Pitch based roughly on random string length or just random
        const baseFreq = 1200 + Math.random() * 800;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    };

    useEffect(() => {
        if (!sceneRef.current) return;
        if (typeof Matter === 'undefined') return;

        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            MouseConstraint = Matter.MouseConstraint,
            Mouse = Matter.Mouse,
            Composite = Matter.Composite,
            Constraint = Matter.Constraint,
            Events = Matter.Events,
            Bodies = Matter.Bodies;

        const engine = Engine.create();
        engineRef.current = engine;
        engine.world.gravity.y = 1.5; // Stronger gravity to pull strings tight
        
        // Improve solver accuracy for long chains
        engine.positionIterations = 10;
        engine.velocityIterations = 10;

        const container = sceneRef.current;
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 340;

        const render = Render.create({
            element: container,
            engine: engine,
            options: {
                width: width,
                height: height,
                background: 'transparent',
                wireframes: false, 
            }
        });
        
        render.canvas.style.opacity = '0';
        render.canvas.style.position = 'absolute';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.zIndex = '10'; 
        render.canvas.style.cursor = 'crosshair';

        // Source text for curtain
        const sourceText = "A JOURNEY OF A THOUSAND MILES BEGINS WITH A SINGLE STEP - TRACK YOUR NOVELS TRAVEL CLOTHES AND WRITING WITH THIS LIFE TRACKER... ".repeat(15);
        let charIndex = 0;

        const spacingX = 16;
        const spacingY = 16;
        const boxSize = 13;
        const cols = Math.max(4, Math.floor(width / spacingX));
        const maxRows = Math.max(6, Math.floor((height - 30) / spacingY));
        const startX = (width - (cols * spacingX)) / 2 + (spacingX/2);

        // Rows per column taper towards the edges so the curtain hangs like drapery
        // under the eaves rather than filling the whole box.
        const rowsForColumn = (col) => {
            const t = (col + 0.5) / cols;
            const shape = Math.pow(Math.sin(Math.PI * t), 0.6);
            return Math.max(2, Math.round(maxRows * (0.25 + 0.75 * shape) * (0.75 + Math.random() * 0.35)));
        };

        const letterBodies = [];
        const allBodies = [];

        for (let col = 0; col < cols; col++) {
            const colGroup = Matter.Body.nextGroup(true); // Same group for entire column so they don't explode
            let previousBody = null;
            const x = startX + (col * spacingX);
            const rows = rowsForColumn(col);

            for (let row = 0; row < rows; row++) {
                // Leave gaps so the glyphs read as scattered falling characters
                const char = Math.random() < 0.35 ? ' ' : sourceText[charIndex++];
                const y = 12 + (row * spacingY);

                // Use circles instead of rectangles! Corners snag on each other, circles perfectly slide off.
                const body = Bodies.circle(x, y, boxSize/1.8, {
                    restitution: 0.1, // Minimal bounce to prevent chaotic energy
                    frictionAir: 0.05, // More air resistance to settle faster
                    friction: 0, // Zero surface friction so they are slippery like glass
                    density: 0.005,
                    collisionFilter: { group: colGroup },
                    render: { visible: false } 
                });
                
                allBodies.push(body);

                let constraint;
                if (row === 0) {
                    // Anchor to ceiling
                    constraint = Constraint.create({
                        pointA: { x: x, y: 0 },
                        bodyB: body,
                        pointB: { x: 0, y: -spacingY/2 },
                        stiffness: 1.0, // Perfectly rigid string
                        damping: 0.1,
                        render: { visible: false } 
                    });
                } else {
                    // Anchor to previous body
                    constraint = Constraint.create({
                        bodyA: previousBody,
                        pointA: { x: 0, y: spacingY/2 },
                        bodyB: body,
                        pointB: { x: 0, y: -spacingY/2 },
                        length: 5,
                        stiffness: 1.0, // Perfectly rigid string
                        damping: 0.1,
                        render: { visible: false } 
                    });
                }

                // Even spaces are physical bodies to maintain the chain
                letterBodies.push({ 
                    char: char === ' ' ? '' : char, 
                    body, 
                    constraint, 
                    size: boxSize,
                    isFirst: row === 0,
                    originalX: x, // Save original X to apply restoring force
                    originalY: y  // Save original Y to break knots
                });
                
                Composite.add(engine.world, [body, constraint]);
                previousBody = body;
            }
        }

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.01, // Extremely weak mouse pull so it brushes instead of violently yanking into knots
                render: { visible: false }
            }
        });

        Composite.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        // Sound on collision (throttle slightly for performance)
        let lastChimeTime = 0;
        Events.on(engine, 'collisionStart', (event) => {
            const now = Date.now();
            if (now - lastChimeTime < 50) return; // limit to 20 chimes per second max

            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                if (pair.bodyA.isStatic && pair.bodyB.isStatic) continue;

                const relVel = Math.abs(pair.bodyA.velocity.x - pair.bodyB.velocity.x) + 
                               Math.abs(pair.bodyA.velocity.y - pair.bodyB.velocity.y);
                               
                if (relVel > 1.5) { // Lowered threshold for brushing
                    playChime(relVel);
                    lastChimeTime = now;
                    break; 
                }
            }
        });

        // Apply a stronger restoring force and an absolute clamp to remove knots entirely
        Events.on(engine, 'beforeUpdate', () => {
            letterBodies.forEach(lb => {
                let currentX = lb.body.position.x;
                const dx = lb.originalX - currentX;
                const dy = lb.originalY - lb.body.position.y;
                
                // NO KNOTS: Absolutely prevent any string from moving more than 35px horizontally from its column.
                // This makes it physically impossible for strings to wrap around each other.
                if (dx < -14) {
                    currentX = lb.originalX + 14;
                    Matter.Body.setPosition(lb.body, { x: currentX, y: lb.body.position.y });
                    Matter.Body.setVelocity(lb.body, { x: 0, y: lb.body.velocity.y });
                } else if (dx > 14) {
                    currentX = lb.originalX - 14;
                    Matter.Body.setPosition(lb.body, { x: currentX, y: lb.body.position.y });
                    Matter.Body.setVelocity(lb.body, { x: 0, y: lb.body.velocity.y });
                }
                
                if (Math.abs(dy) > 80) {
                    Matter.Body.setPosition(lb.body, { x: currentX, y: lb.originalY });
                    Matter.Body.setVelocity(lb.body, { x: 0, y: 0 });
                }

                // NORMAL RESTORING FORCE: Pull back to column much faster
                const newDx = lb.originalX - currentX;
                if (Math.abs(newDx) > 0.5) {
                    Matter.Body.applyForce(lb.body, lb.body.position, {
                        x: newDx * 0.00002, // Stronger restoring force
                        y: 0
                    });
                }
            });
        });

        let rafId;
        const syncDOM = () => {
            letterBodies.forEach(lb => {
                const domEl = document.getElementById(`dom-letter-${lb.body.id}`);
                const stringEl = document.getElementById(`dom-string-${lb.body.id}`);
                
                if (domEl) {
                    const pos = lb.body.position;
                    const angle = lb.body.angle;
                    const domX = pos.x - (lb.size)/2;
                    const domY = pos.y - (lb.size)/2;
                    domEl.style.transform = `translate(${domX}px, ${domY}px) rotate(${angle}rad)`;
                }

                if (stringEl) {
                    const pos = lb.body.position;
                    
                    let startX, startY;
                    if (lb.isFirst) {
                        startX = lb.constraint.pointA.x;
                        startY = lb.constraint.pointA.y;
                    } else {
                        const prevPos = lb.constraint.bodyA.position;
                        const prevAngle = lb.constraint.bodyA.angle;
                        const pOffset = lb.constraint.pointA;
                        const pc = Math.cos(prevAngle);
                        const ps = Math.sin(prevAngle);
                        startX = prevPos.x + (pOffset.x * pc - pOffset.y * ps);
                        startY = prevPos.y + (pOffset.x * ps + pOffset.y * pc);
                    }

                    const bodyOffset = lb.constraint.pointB;
                    const c = Math.cos(lb.body.angle);
                    const s = Math.sin(lb.body.angle);
                    const endX = pos.x + (bodyOffset.x * c - bodyOffset.y * s);
                    const endY = pos.y + (bodyOffset.x * s + bodyOffset.y * c);

                    stringEl.setAttribute('x1', startX);
                    stringEl.setAttribute('y1', startY);
                    stringEl.setAttribute('x2', endX);
                    stringEl.setAttribute('y2', endY);
                }
            });
            rafId = requestAnimationFrame(syncDOM);
        };

        Render.run(render);
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);
        rafId = requestAnimationFrame(syncDOM);
        setLetters(letterBodies);

        return () => {
            cancelAnimationFrame(rafId);
            Render.stop(render);
            Runner.stop(runner);
            if (render.canvas) render.canvas.remove();
            Engine.clear(engine);
        };
    }, []);

    const words = String(text).trim().split(/\s+/);
    const lastWord = words.length > 1 ? words.pop() : null;

    return (
        <div className="physics-title" onClick={initAudio}>
            <h1 className="physics-title-heading">
                {words.join(' ')}{lastWord ? ' ' : ''}
                {lastWord && <span className="text-accent">{lastWord}</span>}
            </h1>

            <div className="physics-title-gate">
            {/* Torii arch — the glyphs hang from the underside of the nuki beam */}
            <svg className="physics-title-arch" viewBox="0 0 560 380" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="toriiPillar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a8342a" />
                        <stop offset="45%" stopColor="#e05c46" />
                        <stop offset="100%" stopColor="#912b23" />
                    </linearGradient>
                    <linearGradient id="toriiBeam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3a3a46" />
                        <stop offset="100%" stopColor="#1c1c24" />
                    </linearGradient>
                </defs>

                {/* Kasagi: upswept top beam */}
                <path
                    d="M4 46 Q 280 4 556 46 L 556 66 Q 280 26 4 66 Z"
                    fill="url(#toriiBeam)"
                />
                {/* Shimaki: thin dark band under the kasagi */}
                <path d="M28 68 Q 280 32 532 68 L 532 78 Q 280 42 28 78 Z" fill="#12121a" />

                {/* Nuki: lower cross beam the curtain hangs from */}
                <rect x="58" y="96" width="444" height="16" rx="2" fill="url(#toriiPillar)" />
                {/* Gakuzuka + plaque */}
                <rect x="264" y="72" width="32" height="26" fill="#912b23" />
                <rect x="248" y="66" width="64" height="34" rx="3" fill="#1c1c24" stroke="#c9a227" strokeWidth="1.5" />

                {/* Pillars — splayed slightly outward, running to the base */}
                <path d="M88 78 L 118 78 L 126 380 L 80 380 Z" fill="url(#toriiPillar)" />
                <path d="M442 78 L 472 78 L 480 380 L 434 380 Z" fill="url(#toriiPillar)" />
                {/* Kamebara: dark bases */}
                <rect x="70" y="330" width="64" height="50" rx="3" fill="#1c1c24" opacity="0.9" />
                <rect x="426" y="330" width="64" height="50" rx="3" fill="#1c1c24" opacity="0.9" />
            </svg>

            <div ref={sceneRef} className="physics-title-container">
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    {letters.map((lb) => (
                        <line
                            key={`str-${lb.body.id}`}
                            id={`dom-string-${lb.body.id}`}
                            x1="0" y1="0" x2="0" y2="0"
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="1"
                        />
                    ))}
                </svg>

                {letters.map((lb) => (
                    <div
                        key={`let-${lb.body.id}`}
                        id={`dom-letter-${lb.body.id}`}
                        className="physics-letter"
                        style={{ width: `${lb.size}px`, height: `${lb.size}px` }}
                    >
                        {lb.char}
                    </div>
                ))}
            </div>
            </div>

            {!audioEnabled && (
                <div className="physics-title-hint">Click anywhere to enable interaction sounds</div>
            )}

            <style>{`
                .physics-title {
                    position: relative;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .physics-title-heading {
                    font-size: 3.75rem;
                    font-weight: 800;
                    margin: 0 0 0.5rem;
                    background: linear-gradient(to right, #ffffff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .physics-title-heading .text-accent {
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .physics-title-gate {
                    position: relative;
                    width: min(460px, 88%);
                    height: 380px;
                }

                .physics-title-arch {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    filter: drop-shadow(0 6px 18px rgba(0,0,0,0.5));
                }

                /* Curtain hangs from the nuki (y=112/380) between the pillars */
                .physics-title-container {
                    position: absolute;
                    top: 29.5%;
                    left: 16%;
                    width: 68%;
                    height: 62%;
                    overflow: hidden;
                    cursor: crosshair;
                    -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
                    mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
                }

                .physics-letter {
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.45);
                    font-family: monospace;
                    pointer-events: none;
                    z-index: 2;
                    will-change: transform;
                }

                .physics-title-hint {
                    margin-top: 0.75rem;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    pointer-events: none;
                    opacity: 0.7;
                }

                @media (max-width: 768px) {
                    .physics-title-heading { font-size: 2.5rem; }
                    .physics-title-gate { height: 280px; }
                }
            `}</style>
        </div>
    );
};
