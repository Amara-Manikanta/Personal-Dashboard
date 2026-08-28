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

    const CUSTOM = {
        temple: Temple, church: Church, waterfall: Waterfall,
        trekking: Trekking, adventure: Adventure, viewpoint: Viewpoint
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
