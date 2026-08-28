/**
 * Hand-drawn category icons.
 *
 * Phosphor has no gopuram, no waterfall and nothing that reads as trekking,
 * so these five are inline SVG. They take the category's colour, scale
 * cleanly, and need no extra asset — everything else still falls back to the
 * Phosphor font icon named on the category.
 *
 * Drawn on a 24x24 grid, flat shapes with a darker outline, matching the
 * reference art style.
 */
(function () {
    const S = { strokeLinejoin: 'round', strokeLinecap: 'round' };

    /** South-Indian temple gopuram: stepped tiers over a pillared base. */
    const Temple = ({ c }) => (
        <g>
            {/* tiers, narrowing upward */}
            <rect x="7.5" y="2" width="9" height="2.4" rx="0.6" fill={c} />
            <rect x="6.4" y="4.6" width="11.2" height="2.6" rx="0.6" fill={c} opacity="0.85" />
            <rect x="5.3" y="7.4" width="13.4" height="2.8" rx="0.6" fill={c} opacity="0.7" />
            {/* arch openings up the centre */}
            <path d="M10.8 4.4a1.2 1.2 0 0 1 2.4 0v0.6h-2.4z" fill="#fbbf24" />
            <path d="M10.6 7.2a1.4 1.4 0 0 1 2.8 0v0.8h-2.8z" fill="#fbbf24" />
            {/* cornice */}
            <rect x="3.4" y="10.4" width="17.2" height="1.9" rx="0.7" fill={c} opacity="0.45" />
            {/* base with doorway */}
            <rect x="4.6" y="12.6" width="14.8" height="8.2" rx="0.7" fill={c} opacity="0.28" />
            <path d="M9.9 20.8v-4.1a2.1 2.1 0 0 1 4.2 0v4.1z" fill={c} opacity="0.75" />
            <rect x="3.2" y="20.6" width="17.6" height="1.6" rx="0.7" fill={c} opacity="0.55" />
        </g>
    );

    /** Church: gabled nave, steeple cross, arched door. */
    const Church = ({ c }) => (
        <g>
            <path d="M12 1.4v3.2M10.6 2.6h2.8" stroke={c} strokeWidth="1.5" {...S} />
            {/* roof */}
            <path d="M12 5.2 4.4 10.6v10.2h15.2V10.6z" fill={c} opacity="0.3" />
            <path d="M12 5.2 4.4 10.6M12 5.2l7.6 5.4" stroke={c} strokeWidth="1.7" fill="none" {...S} />
            {/* windows */}
            <path d="M10.9 10.2a1.1 1.1 0 0 1 2.2 0v1.9h-2.2z" fill="#fbbf24" />
            <rect x="6.6" y="14.6" width="2.3" height="3" rx="1.1" fill="#fbbf24" opacity="0.85" />
            <rect x="15.1" y="14.6" width="2.3" height="3" rx="1.1" fill="#fbbf24" opacity="0.85" />
            {/* arched door */}
            <path d="M9.8 20.8v-4a2.2 2.2 0 0 1 4.4 0v4z" fill={c} opacity="0.8" />
            <rect x="3.2" y="20.6" width="17.6" height="1.6" rx="0.7" fill={c} opacity="0.55" />
        </g>
    );

    /** Waterfall: cliffs either side, falling column, pool below. */
    const Waterfall = ({ c }) => (
        <g>
            {/* cliffs */}
            <path d="M2.6 4.2c2.4-.6 3.6.9 4.9 2.2 1 1 1.4 2.3 1.4 3.9v6.2H2.6z" fill={c} opacity="0.32" />
            <path d="M21.4 4.2c-2.4-.6-3.6.9-4.9 2.2-1 1-1.4 2.3-1.4 3.9v6.2h6.3z" fill={c} opacity="0.45" />
            {/* falling water */}
            <path d="M9.4 5.4h5.2v10.9H9.4z" fill={c} opacity="0.22" />
            <path d="M11.1 5.4h1.9v10.9h-1.9z" fill={c} opacity="0.35" />
            {/* spray */}
            <circle cx="9.9" cy="15.9" r="1.5" fill="#fff" opacity="0.55" />
            <circle cx="12.3" cy="15.5" r="1.8" fill="#fff" opacity="0.5" />
            <circle cx="14.3" cy="16" r="1.3" fill="#fff" opacity="0.45" />
            {/* pool */}
            <path d="M2.6 17.3h18.8v3.1a1 1 0 0 1-1 1H3.6a1 1 0 0 1-1-1z" fill={c} opacity="0.6" />
        </g>
    );

    /** Trekking: hiker leaning uphill with pack and pole. */
    const Trekking = ({ c }) => (
        <g fill={c}>
            <circle cx="13.4" cy="4.1" r="2.1" />
            {/* pack */}
            <rect x="4.9" y="5.2" width="4.2" height="6.6" rx="1.4" transform="rotate(-20 7 8.5)" opacity="0.75" />
            {/* torso and arm */}
            <path d="M11.4 6.4 9 11.5l2.3 1.6 1.6-2.7 2.4.1v-1.9l-2.6-.1z" />
            {/* legs */}
            <path d="M9.6 12.6 8 19.4a1.2 1.2 0 0 0 2.3.6l1.5-5z" />
            <path d="M12.1 12.4l2.4 3.4v4.1a1.2 1.2 0 0 1-2.4 0v-3.4z" />
            {/* pole */}
            <path d="M16.6 7.3 18.9 19" stroke={c} strokeWidth="1.5" fill="none" {...S} />
            {/* slope */}
            <path d="M2.4 21.6 21.6 17.4v4.2H2.4z" opacity="0.35" />
        </g>
    );

    /** Adventure: zipline rider hanging from a slack cable. */
    const Adventure = ({ c }) => (
        <g>
            <path d="M2 4.4c6.6 2 13.4 2 20-.4" stroke={c} strokeWidth="1.6" fill="none" {...S} />
            {/* harness line */}
            <path d="M11.6 5.6v4.6" stroke={c} strokeWidth="1.5" fill="none" {...S} />
            <g fill={c}>
                <circle cx="7.9" cy="10.4" r="2.1" />
                {/* body swinging forward */}
                <path d="M11.2 10.1l1.9.7v2.2l-2.4 1.8-2.6 2.6-2.2-2.2 3-3z" />
                {/* trailing legs */}
                <path d="M13.1 13.4l3.6 1.7 2.6 2.6-2.2 2.2-3.1-3-2.6-1.3z" opacity="0.85" />
                <rect x="17.4" y="12.6" width="3" height="3" rx="0.6" opacity="0.6" transform="rotate(20 18.9 14.1)" />
            </g>
        </g>
    );


    /** Viewpoint: binoculars. */
    const Viewpoint = ({ c }) => (
        <g>
            {/* eyecups */}
            <rect x="5.1" y="1.9" width="4.3" height="2.4" rx="0.8" fill={c} opacity="0.55" />
            <rect x="14.6" y="1.9" width="4.3" height="2.4" rx="0.8" fill={c} opacity="0.55" />
            {/* barrels */}
            <rect x="5.8" y="4.3" width="3" height="4.4" fill={c} opacity="0.8" />
            <rect x="15.3" y="4.3" width="3" height="4.4" fill={c} opacity="0.8" />
            {/* bodies */}
            <path d="M4.4 8.7h6v6.6h-6z" fill={c} opacity="0.5" />
            <path d="M13.7 8.7h6v6.6h-6z" fill={c} opacity="0.5" />
            {/* centre focus block */}
            <rect x="9" y="10.1" width="6.1" height="5.5" rx="1.1" fill={c} />
            <path d="M10.9 10.1h2.3v2.9a1.15 1.15 0 0 1-2.3 0z" fill={c} opacity="0.45" />
            {/* flared lower housings */}
            <path d="M4.4 15.4h6l1.2 5.2H3.2z" fill={c} opacity="0.7" />
            <path d="M13.7 15.4h6l1.2 5.2h-8.4z" fill={c} opacity="0.7" />
            <rect x="2.5" y="20.4" width="8.6" height="2.1" rx="0.8" fill={c} opacity="0.5" />
            <rect x="12.9" y="20.4" width="8.6" height="2.1" rx="0.8" fill={c} opacity="0.5" />
        </g>
    );


    /** Beach: parasol over sand and sea, with a sun. */
    const Beach = ({ c }) => (
        <g>
            {/* sun */}
            <circle cx="19.4" cy="4.2" r="2.1" fill="#fbbf24" />
            <path
                d="M19.4 0.6v1.1M19.4 6.7v1.1M15.8 4.2h1.1M21.9 4.2h1.1M16.85 1.65l0.78 0.78M21.17 5.97l0.78 0.78M21.95 1.65l-0.78 0.78M17.63 5.97l-0.78 0.78"
                stroke="#fbbf24" strokeWidth="1.1" {...S}
            />

            {/* sea then sand, so the shoreline reads correctly */}
            <path d="M1.4 14.6h21.2v6.6a1 1 0 0 1-1 1H2.4a1 1 0 0 1-1-1z" fill="#38bdf8" opacity="0.85" />
            <path d="M14.6 17.1h6.2M16.9 19.2h3.9" stroke="#fff" strokeWidth="1.1" opacity="0.75" {...S} />
            <path d="M1.4 18.4c3.4-2.6 6.5-2.6 9.2 0 2.1 2 4.3 2.5 6.6 1.4v1.4a1 1 0 0 1-1 1H2.4a1 1 0 0 1-1-1z" fill="#fcd34d" />

            {/* parasol: alternating panels, scalloped hem */}
            <path d="M2.2 12.2a9.4 9.4 0 0 1 18.8 0z" fill={c} opacity="0.9" />
            <path d="M11.6 2.8a9.4 9.4 0 0 0-4.7 9.4h4.7z" fill="#e0f2fe" />
            <path d="M11.6 2.8a9.4 9.4 0 0 1 4.7 9.4h-4.7z" fill={c} opacity="0.55" />
            <path
                d="M2.2 12.2c1.2-1.5 2.7-1.5 3.9 0 1.2-1.5 2.7-1.5 3.9 0 1.2-1.5 2.7-1.5 3.9 0 1.2-1.5 2.7-1.5 3.9 0 0.6-0.8 1.4-1.2 2.1-1.2"
                fill="none" stroke={c} strokeWidth="1.3" {...S}
            />

            {/* pole */}
            <path d="M11.9 12.2 12.9 19" stroke="#78350f" strokeWidth="1.2" {...S} />
        </g>
    );


    /** Amusement park: Ferris wheel on an A-frame. */
    const Amusement = ({ c }) => (
        <g>
            {/* legs and base */}
            <path d="M12 10.4 7.9 20.4M12 10.4l4.1 10" stroke="#f97316" strokeWidth="1.6" {...S} />
            <rect x="4.4" y="20.2" width="15.2" height="2.4" rx="0.6" fill="#fb7185" opacity="0.85" />
            <path d="M9.4 21.4h0.9M11.6 21.4h0.9M13.8 21.4h0.9" stroke="#fff" strokeWidth="0.9" {...S} />

            {/* rim and spokes */}
            <circle cx="12.0" cy="10.4" r="7.4" fill="none" stroke={c} strokeWidth="1.3" />
            <path d="M12.0 10.4L12.0 3.0M12.0 10.4L17.2 5.2M12.0 10.4L19.4 10.4M12.0 10.4L17.2 15.6M12.0 10.4L12.0 17.8M12.0 10.4L6.8 15.6M12.0 10.4L4.6 10.4M12.0 10.4L6.8 5.2" stroke={c} strokeWidth="1" opacity="0.75" />

            {/* cabins */}
            <circle cx="12.0" cy="3.0" r="1.75" fill="#7dd3fc" stroke={c} strokeWidth="0.9" />
            <path d="M10.2 3.0h3.5" stroke={c} strokeWidth="0.9" />
            <circle cx="17.2" cy="5.2" r="1.75" fill="#7dd3fc" stroke={c} strokeWidth="0.9" />
            <path d="M15.4 5.2h3.5" stroke={c} strokeWidth="0.9" />
            <circle cx="19.4" cy="10.4" r="1.75" fill="#7dd3fc" stroke={c} strokeWidth="0.9" />
            <path d="M17.6 10.4h3.5" stroke={c} strokeWidth="0.9" />
            <circle cx="17.2" cy="15.6" r="1.75" fill="#7dd3fc" stroke={c} strokeWidth="0.9" />
            <path d="M15.4 15.6h3.5" stroke={c} strokeWidth="0.9" />
            <circle cx="12.0" cy="17.8" r="1.75" fill="#7dd3fc" stroke={c} strokeWidth="0.9" />
            <path d="M10.2 17.8h3.5" stroke={c} strokeWidth="0.9" />
            <circle cx="6.8" cy="15.6" r="1.75" fill="#7dd3fc" stroke={c} strokeWidth="0.9" />
            <path d="M5.0 15.6h3.5" stroke={c} strokeWidth="0.9" />
            <circle cx="4.6" cy="10.4" r="1.75" fill="#7dd3fc" stroke={c} strokeWidth="0.9" />
            <path d="M2.8 10.4h3.5" stroke={c} strokeWidth="0.9" />
            <circle cx="6.8" cy="5.2" r="1.75" fill="#7dd3fc" stroke={c} strokeWidth="0.9" />
            <path d="M5.0 5.2h3.5" stroke={c} strokeWidth="0.9" />
        </g>
    );


    /** Lake & dam: still water with reeds, a lily pad and a rock. */
    const Lake = ({ c }) => (
        <g>
            {/* reeds behind the water line */}
            <path d="M8.4 9.6c-0.5-2.6-0.2-4.6 1.1-6.4 0.5 2.5 0.3 4.5-1.1 6.4z" fill="#4ade80" />
            <path d="M6.9 9.9C5.8 8.2 5.4 6.8 5.6 5.2c1.1 1.3 1.6 2.8 1.3 4.7z" fill="#22c55e" />
            <path d="M10.2 9.8c0.6-1.7 1.4-2.8 2.6-3.5-0.2 1.7-0.9 2.9-2.6 3.5z" fill="#22c55e" />

            {/* the water body: wider right, notched left bank */}
            <path
                d="M4.2 12.4c1.9-2 5.4-3 9-3 5.4 0 9.4 2.2 9.4 5.3s-4.4 5.6-10.2 5.6C6.9 20.3 1.4 18 1.4 15c0-1 0.7-1.7 1.9-2-0.9-0.2-0.6-0.4 0.9-0.6z"
                fill={c}
            />
            <path
                d="M13.2 9.4c5.4 0 9.4 2.2 9.4 5.3s-4.4 5.6-10.2 5.6c4-1.1 6.3-3 6.3-5.4 0-2.3-2-4.1-5.5-5.5z"
                fill={c} opacity="0.45"
            />

            {/* ripples */}
            <path d="M8.6 13.2h1.9M13.2 12.6h1.9M10.6 15.2h1.9M15.2 14.6h1.9" stroke="#0ea5e9" strokeWidth="1" opacity="0.8" {...S} />

            {/* lily pad */}
            <ellipse cx="9.3" cy="16.6" rx="3.1" ry="1.5" fill="#86efac" />

            {/* rock at the near shore */}
            <path d="M17.4 19.6c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7z" fill="#4b5563" />
            <path d="M15.4 19.7c0-1.1 0.9-2 2-2s2 0.9 2 2z" fill="#6b7280" />
        </g>
    );

    const CUSTOM = {
        temple: Temple, church: Church, waterfall: Waterfall,
        trekking: Trekking, adventure: Adventure, viewpoint: Viewpoint,
        beach: Beach, amusement: Amusement, lake: Lake
    };

    /**
     * Renders a category's icon: the custom drawing when there is one,
     * otherwise the Phosphor icon the category names.
     */
    window.CategoryIcon = ({ category, size = 18, className = '' }) => {
        if (!category) return null;

        const Custom = category.svg && CUSTOM[category.svg];
        if (!Custom) {
            return <i className={`ph-fill ${category.icon} ${className}`} style={{ color: category.color }}></i>;
        }

        return (
            <svg
                className={`category-icon ${className}`}
                width={size}
                height={size}
                viewBox="0 0 24 24"
                role="img"
                aria-label={category.label}
                style={{ flexShrink: 0, verticalAlign: '-0.15em' }}
            >
                <Custom c={category.color} />
            </svg>
        );
    };

    window.CATEGORY_CUSTOM_ICONS = Object.keys(CUSTOM);
    console.log('CategoryIcons registered:', window.CATEGORY_CUSTOM_ICONS.join(', '));
})();
