export function KineticBackground() {
    return (
        <svg
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden',
                maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 65%)',
                WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 65%)',
            }}
            viewBox="0 0 390 844"
            preserveAspectRatio="xMidYMin slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern id="kbg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(255,226,122,0.07)"
                        strokeWidth="0.5"
                    />
                </pattern>
                <clipPath id="kbg-clip">
                    <rect width="390" height="844" />
                </clipPath>
            </defs>

            <g className="kinetic-ambient">
                <rect className="kinetic-grid" width="390" height="844" fill="url(#kbg-grid)" />
                <rect
                    width="390"
                    height="844"
                    fill="url(#kbg-grid)"
                    opacity="0.18"
                    transform="translate(20 20)"
                />
            </g>

            {/* Sparks — solo transform (GPU composited) */}
            <g clipPath="url(#kbg-clip)">
                {/* Horizontales LTR: rect empieza en x=0, se mueve con translateX */}
                <rect className="kinetic-spark kinetic-spark-strong" x="0" y="79.5" width="36" height="1.1" fill="#ffe27a" fillOpacity="0.72"
                    style={{ animation: 'k-spark-ltr 3.5s linear infinite 0s' }} />
                <rect className="kinetic-spark" x="0" y="319.5" width="28" height="1" fill="#ffe27a" fillOpacity="0.48"
                    style={{ animation: 'k-spark-ltr 3.8s linear infinite 2.1s' }} />
                <rect className="kinetic-spark" x="0" y="559.5" width="22" height="0.9" fill="#ffe27a" fillOpacity="0.34"
                    style={{ animation: 'k-spark-ltr 3.2s linear infinite 4.0s' }} />

                {/* Horizontales RTL */}
                <rect className="kinetic-spark kinetic-spark-strong" x="0" y="199.5" width="30" height="1.1" fill="#ffe27a" fillOpacity="0.56"
                    style={{ animation: 'k-spark-rtl 4.2s linear infinite 1.4s' }} />
                <rect className="kinetic-spark" x="0" y="439.5" width="24" height="0.9" fill="#ffe27a" fillOpacity="0.4"
                    style={{ animation: 'k-spark-rtl 4.0s linear infinite 0.7s' }} />

                {/* Verticales TTB */}
                <rect className="kinetic-spark" x="79.5" y="0" width="1.1" height="30" fill="#ffe27a" fillOpacity="0.46"
                    style={{ animation: 'k-spark-ttb 5.0s linear infinite 0.3s' }} />
                <rect className="kinetic-spark" x="319.5" y="0" width="0.9" height="24" fill="#ffe27a" fillOpacity="0.36"
                    style={{ animation: 'k-spark-ttb 5.5s linear infinite 1.0s' }} />

                {/* Verticales BTT */}
                <rect className="kinetic-spark kinetic-spark-strong" x="199.5" y="0" width="1.1" height="32" fill="#ffe27a" fillOpacity="0.58"
                    style={{ animation: 'k-spark-btt 4.5s linear infinite 2.2s' }} />
                <rect className="kinetic-spark" x="279.5" y="0" width="0.9" height="20" fill="#ffe27a" fillOpacity="0.38"
                    style={{ animation: 'k-spark-btt 4.8s linear infinite 3.5s' }} />
            </g>
        </svg>
    )
}
