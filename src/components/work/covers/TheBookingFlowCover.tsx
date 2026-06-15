import { useCoverReveal, drawStroke } from './useCoverReveal'
import { CoverChip } from './CoverChip'

/**
 * The Booking Flow cover. Motif: a lead pipeline. On reveal the source nodes
 * appear, the connectors draw, the n8n AI node pops in, a pulse travels down to
 * "Lead captured" which draws in. Reads as a lead flowing through the pipeline.
 */
export function TheBookingFlowCover() {
  const root = useCoverReveal((tl, el) => {
    tl.from('.b-source', { autoAlpha: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.14 }, 0)
    el.querySelectorAll('.b-connector').forEach((p, i) =>
      drawStroke(tl, p as SVGGeometryElement, 0.45 + i * 0.12, 0.6)
    )
    tl.from('.b-ai', { autoAlpha: 0, scale: 0.8, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(1.7)' }, 0.85)
    drawStroke(tl, el.querySelector('.b-down'), 1.2, 0.4)
    tl.from('.b-pulse', { attr: { cy: 478 }, autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 1.25)
    tl.from('.b-captured', { autoAlpha: 0, scale: 0.92, transformOrigin: '50% 50%', duration: 0.5 }, 1.55)
    tl.from('.b-fade', { autoAlpha: 0, y: 12, duration: 0.55, stagger: 0.12 }, 0.3)
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
          <pattern id="bf-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0 H0 V44" fill="none" stroke="#1c1c1c" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1600" height="900" fill="#090909" />
        <rect width="1600" height="900" fill="url(#bf-grid)" opacity="0.5" />

        <rect x="1020" y="0" width="580" height="900" fill="#0e0e0e" />
        <line x1="1020" y1="0" x2="1020" y2="900" stroke="#1c1c1c" strokeWidth="1" />

        {/* pipeline / lead-capture flow motif */}
        <g>
          <text className="b-fade" x="1100" y="180" fill="#7a7060" fontSize="22" letterSpacing="2">LEAD PIPELINE</text>

          {/* source nodes */}
          <g className="b-source">
            <rect x="1100" y="250" width="170" height="64" rx="10" fill="none" stroke="#1c1c1c" />
            <text x="1132" y="290" fill="#f5f0e8" fontSize="26">Angi</text>
          </g>
          <g className="b-source">
            <rect x="1330" y="250" width="190" height="64" rx="10" fill="none" stroke="#1c1c1c" />
            <text x="1362" y="290" fill="#f5f0e8" fontSize="26">Thumbtack</text>
          </g>

          {/* connectors to AI node */}
          <path className="b-connector" d="M1185 314 V370 Q1185 400 1230 400 H1310" fill="none" stroke="#7a7060" strokeWidth="2" />
          <path className="b-connector" d="M1425 314 V370 Q1425 400 1380 400 H1310" fill="none" stroke="#7a7060" strokeWidth="2" />

          {/* AI flow node (highlight) */}
          <g className="b-ai">
            <rect x="1180" y="400" width="260" height="78" rx="12" fill="#f86343" />
            <text x="1218" y="448" fill="#090909" fontSize="28" fontWeight="600">n8n AI flow</text>
          </g>

          {/* down to capture */}
          <path className="b-down" d="M1310 478 V548" fill="none" stroke="#f86343" strokeWidth="3" />
          <circle className="b-pulse" cx="1310" cy="548" r="7" fill="#f86343" />

          {/* captured lead */}
          <g className="b-captured">
            <rect x="1180" y="560" width="260" height="78" rx="12" fill="none" stroke="#f86343" />
            <text x="1212" y="608" fill="#f5f0e8" fontSize="28">Lead captured</text>
          </g>

          <text className="b-fade" x="1100" y="720" fill="#f5f0e8" fontSize="40" fontWeight="600">Source attribution</text>
          <text className="b-fade" x="1100" y="762" fill="#7a7060" fontSize="24">Every lead tracked &amp; routed</text>
        </g>

        {/* left content (static frame) */}
        <rect x="110" y="150" width="5" height="120" fill="#f86343" />
        <text x="140" y="180" fill="#7a7060" fontSize="24" letterSpacing="6">CASE STUDY — 02</text>

        <text x="106" y="430" fill="#f5f0e8" fontSize="130" fontWeight="700" letterSpacing="-5">The Booking</text>
        <text x="106" y="560" fill="#f5f0e8" fontSize="130" fontWeight="700" letterSpacing="-5">Flow</text>

        <text x="112" y="640" fill="#7a7060" fontSize="28">SaaS lead capture for service businesses</text>

        <CoverChip x={112} y={730} w={108} label="SaaS" />
        <CoverChip x={236} y={730} w={248} label="UX/UI Engineering" />
        <CoverChip x={500} y={730} w={160} label="Branding" />
        <CoverChip x={676} y={730} w={172} label="AI Workflows" />
      </svg>
    </div>
  )
}
