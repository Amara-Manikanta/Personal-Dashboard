window.PhysicsTitle = () => {
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
        engine.world.gravity.y = 1.0; 

        const container = sceneRef.current;
        const width = container.clientWidth || 1000;
        const height = 550; // Much taller for a curtain

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

        const spacingX = 30;
        const spacingY = 30;
        const boxSize = 25;
        const cols = Math.floor(width / spacingX);
        const rows = 12;
        const startX = (width - (cols * spacingX)) / 2 + (spacingX/2);
        
        const letterBodies = [];
        const allBodies = []; 

        for (let col = 0; col < cols; col++) {
            const colGroup = Matter.Body.nextGroup(true); // Same group for entire column so they don't explode
            let previousBody = null;
            const x = startX + (col * spacingX);
            
            for (let row = 0; row < rows; row++) {
                const char = sourceText[charIndex++];
                const y = 20 + (row * spacingY);

                const body = Bodies.rectangle(x, y, boxSize, boxSize, {
                    restitution: 0.5, 
                    frictionAir: 0.05,
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
                        stiffness: 0.9,
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
                        stiffness: 0.9,
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
                    isFirst: row === 0
                });
                
                Composite.add(engine.world, [body, constraint]);
                previousBody = body;
            }
        }

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.1,
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

    return (
        <div 
            ref={sceneRef} 
            className="physics-title-container" 
            onClick={initAudio}
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '550px', 
                margin: '0 auto', 
                overflow: 'hidden',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            {!audioEnabled && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid var(--primary)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '99px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    zIndex: 20,
                    pointerEvents: 'none',
                    backdropFilter: 'blur(4px)',
                    animation: 'pulse 2s infinite'
                }}>
                    Click anywhere to enable interaction sounds
                </div>
            )}
            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
            `}</style>
            
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                {letters.map((lb) => (
                    <line 
                        key={`str-${lb.body.id}`}
                        id={`dom-string-${lb.body.id}`}
                        x1="0" y1="0" x2="0" y2="0"
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeWidth="1"
                    />
                ))}
            </svg>
            
            {letters.map((lb) => (
                <div
                    key={`let-${lb.body.id}`}
                    id={`dom-letter-${lb.body.id}`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${lb.size}px`,
                        height: `${lb.size}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'rgba(255,255,255,0.7)',
                        textShadow: lb.char ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                        fontFamily: 'monospace',
                        pointerEvents: 'none', 
                        zIndex: 2,
                        willChange: 'transform'
                    }}
                >
                    {lb.char}
                </div>
            ))}
        </div>
    );
};
