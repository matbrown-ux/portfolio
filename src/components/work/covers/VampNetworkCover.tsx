import { useCoverReveal, drawStroke } from './useCoverReveal'
import { CoverChip } from './CoverChip'

/**
 * Vamp Network cover. Motif: an analytics chart. On reveal the bars grow up,
 * the ascending line draws on, the data points pop in, and the labels fade in.
 * The frame (background, grid, panel, title, tags) stays static.
 */
export function VampNetworkCover() {
  const root = useCoverReveal((tl, el) => {
    tl.from('.v-bar', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, stagger: 0.08 }, 0)
    drawStroke(tl, el.querySelector('.v-line'), 0.35, 0.9)
    tl.from(
      '.v-point',
      { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.07, ease: 'back.out(2)' },
      0.75
    )
    tl.from('.v-fade', { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.12 }, 0.4)
  })

  return (
    <div ref={root} className="w-full h-full">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="block w-full h-full"
        fill="none"
        fontFamily="Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      >
        <defs>
          <pattern id="vamp-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0 H0 V44" fill="none" stroke="#1c1c1c" strokeWidth="1" />
          </pattern>
        </defs>

        {/* base */}
        <rect width="1600" height="900" fill="#090909" />
        <rect width="1600" height="900" fill="url(#vamp-grid)" opacity="0.5" />

        {/* right motif panel */}
        <rect x="1020" y="0" width="580" height="900" fill="#0e0e0e" />
        <line x1="1020" y1="0" x2="1020" y2="900" stroke="#1c1c1c" strokeWidth="1" />

        {/* analytics motif: bars + ascending line */}
        <g>
          <rect className="v-bar" x="1120" y="470" width="46" height="120" fill="#f5f0e8" opacity="0.16" />
          <rect className="v-bar" x="1186" y="420" width="46" height="170" fill="#f5f0e8" opacity="0.16" />
          <rect className="v-bar" x="1252" y="360" width="46" height="230" fill="#f5f0e8" opacity="0.22" />
          <rect className="v-bar" x="1318" y="300" width="46" height="290" fill="#f86343" />
          <rect className="v-bar" x="1384" y="250" width="46" height="340" fill="#f86343" opacity="0.55" />
          <polyline
            className="v-line"
            points="1143,560 1209,500 1275,470 1341,380 1407,300 1473,250"
            fill="none"
            stroke="#f86343"
            strokeWidth="3"
          />
          <g fill="#f5f0e8">
            <circle className="v-point" cx="1143" cy="560" r="6" />
            <circle className="v-point" cx="1209" cy="500" r="6" />
            <circle className="v-point" cx="1275" cy="470" r="6" />
            <circle className="v-point" cx="1341" cy="380" r="6" />
            <circle className="v-point" cx="1407" cy="300" r="6" />
            <circle className="v-point" cx="1473" cy="250" r="6" />
          </g>
          {/* stat labels */}
          <text className="v-fade" x="1120" y="200" fill="#7a7060" fontSize="22" letterSpacing="2">ANALYTICS</text>
          <text className="v-fade" x="1120" y="700" fill="#f5f0e8" fontSize="40" fontWeight="600">Creators · Brands</text>
          <text className="v-fade" x="1120" y="744" fill="#7a7060" fontSize="24">Campaign performance dashboard</text>
        </g>

        {/* left content (static frame) */}
        <rect x="110" y="150" width="5" height="120" fill="#f86343" />
        <text x="140" y="180" fill="#7a7060" fontSize="24" letterSpacing="6">CASE STUDY — 01</text>

        <text x="106" y="430" fill="#f5f0e8" fontSize="140" fontWeight="700" letterSpacing="-5">Vamp</text>
        <text x="106" y="560" fill="#f5f0e8" fontSize="140" fontWeight="700" letterSpacing="-5">Network</text>

        <text x="112" y="640" fill="#7a7060" fontSize="28">Creative direction · Product · AI workflows</text>

        {/* tags */}
        <CoverChip x={112} y={730} w={240} label="Creative Direction" />
        <CoverChip x={368} y={730} w={248} label="UX/UI Engineering" />
        <CoverChip x={632} y={730} w={172} label="AI Workflows" />
      </svg>
    </div>
  )
}
