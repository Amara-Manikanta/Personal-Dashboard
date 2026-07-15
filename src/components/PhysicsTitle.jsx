window.PhysicsTitle = ({ text = "My Life Tracker" }) => {
    const { useEffect, useRef, useState } = React;
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const runnerRef = useRef(null);
    const audioCtxRef = useRef(null);
    const [letters, setLetters] = useState([]);

    // Audio setup
    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const playChime = (velocity) => {
        if (!audioCtxRef.current) return;
        
        // Volume based on impact velocity
        const volume = Math.min(Math.max(velocity * 0.05, 0.01), 0.3);
        if (volume < 0.02) return; // Too soft to hear

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Soft bell/glass sound
        osc.type = 'sine';
        // Randomize pitch slightly around a pleasant frequency
        const baseFreq = 800 + Math.random() * 400;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.2);
    };

    useEffect(() => {
        if (!sceneRef.current) return;

        // Make sure Matter is loaded
        if (typeof Matter === 'undefined') {
            console.error("Matter.js is not loaded. Ensure it is in index.html.");
            return;
        }

        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            MouseConstraint = Matter.MouseConstraint,
            Mouse = Matter.Mouse,
            Composite = Matter.Composite,
            Constraint = Matter.Constraint,
            Events = Matter.Events,
            Bodies = Matter.Bodies;

        // create engine
        const engine = Engine.create();
        engineRef.current = engine;
        engine.world.gravity.y = 1.2; // slightly stronger gravity for snappy strings

        const container = sceneRef.current;
        const width = container.clientWidth || 800;
        const height = 250;

        // create renderer (we use it mostly to handle the mouse easily)
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
        
        // Hide canvas to let HTML text shine through
        render.canvas.style.opacity = '0';
        render.canvas.style.position = 'absolute';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.zIndex = '10'; // Above text for mouse events
        render.canvas.style.cursor = 'grab';

        // Parse text
        const chars = text.split('');
        
        // Calculate responsive sizing based on container width
        const isMobile = width < 600;
        const maxBoxWidth = isMobile ? 35 : 60;
        const boxWidth = Math.min(maxBoxWidth, (width - 40) / chars.length);
        const fontSize = boxWidth * 1.2;
        
        const totalWidth = chars.length * boxWidth;
        const startX = (width - totalWidth) / 2 + (boxWidth/2);
        
        const letterBodies = [];

        chars.forEach((char, i) => {
            if (char === ' ') return; // Skip spaces
            
            const x = startX + (i * boxWidth);
            const y = 80 + Math.random() * 40; // Slightly random initial drop heights

            const rectWidth = boxWidth * 0.8;
            const rectHeight = boxWidth * 0.9;

            // The physical body
            const body = Bodies.rectangle(x, y, rectWidth, rectHeight, {
                restitution: 0.8, // Bouncy
                frictionAir: 0.02,
                label: `letter-${i}`,
                render: { visible: false } 
            });

            // The string/constraint
            const constraint = Constraint.create({
                pointA: { x: x, y: 0 },
                bodyB: body,
                pointB: { x: 0, y: -rectHeight/2 },
                stiffness: 0.05,
                damping: 0.05,
                render: { visible: false } 
            });

            letterBodies.push({ 
                char, 
                body, 
                constraint, 
                width: rectWidth, 
                height: rectHeight,
                fontSize: fontSize
            });
            
            Composite.add(engine.world, [body, constraint]);
        });

        // Add invisible floor/walls so letters don't fly off screen permanently if swung too hard
        const floor = Bodies.rectangle(width/2, height + 50, width * 2, 100, { isStatic: true });
        const wallLeft = Bodies.rectangle(-50, height/2, 100, height * 2, { isStatic: true });
        const wallRight = Bodies.rectangle(width + 50, height/2, 100, height * 2, { isStatic: true });
        Composite.add(engine.world, [floor, wallLeft, wallRight]);

        // Add mouse control
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        Composite.add(engine.world, mouseConstraint);
        render.mouse = mouse; // keep mouse in sync with render

        // Sound on collision
        Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                const velocityA = pair.bodyA.velocity;
                const velocityB = pair.bodyB.velocity;
                const relVel = Math.abs(velocityA.x - velocityB.x) + Math.abs(velocityA.y - velocityB.y);
                if (relVel > 2) {
                    playChime(relVel);
                }
            }
        });

        // Sync DOM elements
        let rafId;
        const syncDOM = () => {
            letterBodies.forEach(lb => {
                const domEl = document.getElementById(`dom-letter-${lb.body.id}`);
                const stringEl = document.getElementById(`dom-string-${lb.body.id}`);
                
                if (domEl) {
                    const pos = lb.body.position;
                    const angle = lb.body.angle;
                    // Translate center of physics body to top-left of DOM element for absolute positioning
                    const domX = pos.x - (lb.width)/2;
                    const domY = pos.y - (lb.height)/2;
                    domEl.style.transform = `translate(${domX}px, ${domY}px) rotate(${angle}rad)`;
                }

                if (stringEl) {
                    const pos = lb.body.position;
                    const anchor = lb.constraint.pointA;
                    const bodyOffset = lb.constraint.pointB;
                    
                    const c = Math.cos(lb.body.angle);
                    const s = Math.sin(lb.body.angle);
                    const absOffset = {
                        x: pos.x + (bodyOffset.x * c - bodyOffset.y * s),
                        y: pos.y + (bodyOffset.x * s + bodyOffset.y * c)
                    };

                    stringEl.setAttribute('x1', anchor.x);
                    stringEl.setAttribute('y1', anchor.y);
                    stringEl.setAttribute('x2', absOffset.x);
                    stringEl.setAttribute('y2', absOffset.y);
                }
            });
            rafId = requestAnimationFrame(syncDOM);
        };

        // Start Physics Engine
        Render.run(render);
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);
        
        // Start DOM sync loop
        rafId = requestAnimationFrame(syncDOM);

        // Save letters to state so React renders the initial DOM nodes
        setLetters(letterBodies);

        // Audio must be initialized on a user gesture due to browser autoplay policies
        const enableAudio = () => {
            initAudio();
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('mousemove', enableAudio);
        };
        document.addEventListener('click', enableAudio);
        document.addEventListener('mousemove', enableAudio);

        // Cleanup on unmount
        return () => {
            cancelAnimationFrame(rafId);
            Render.stop(render);
            Runner.stop(runner);
            if (render.canvas) render.canvas.remove();
            Engine.clear(engine);
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('mousemove', enableAudio);
        };
    }, [text]);

    return (
        <div 
            ref={sceneRef} 
            className="physics-title-container" 
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '250px', 
                margin: '0 auto', 
                overflow: 'hidden'
            }}
        >
            <svg 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
            >
                {letters.map((lb) => (
                    <line 
                        key={`str-${lb.body.id}`}
                        id={`dom-string-${lb.body.id}`}
                        x1="0" y1="0" x2="0" y2="0"
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth="2"
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
                        width: `${lb.width}px`,
                        height: `${lb.height}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: `${lb.fontSize}px`,
                        fontWeight: '900',
                        color: 'white',
                        textShadow: '0 4px 16px rgba(99, 102, 241, 0.9), 0 0 8px rgba(255,255,255,0.4)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        pointerEvents: 'none', // Critical: Let mouse pass through to invisible Matter.js canvas
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
