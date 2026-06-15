import { useCoverReveal } from './useCoverReveal'
import { CoverChip } from './CoverChip'

// Waffle body geometry (matches the original cover). The pockets are generated
// as individual rounded squares (instead of a pattern fill) so they can pop in
// as a staggered grid.
const BODY = { x: 1160, y: 300, size: 312 }
const CELL = 78
const COLS = 4
const POCKETS = Array.from({ length: COLS * COLS }, (_, i) => ({
  x: BODY.x + (i % COLS) * CELL + 6,
  y: BODY.y + Math.floor(i / COLS) * CELL + 6,
}))

/**
 * 'Aiwi Waffles cover. Motif: the brand mark. On reveal the mark scales in, the
 * waffle pockets pop in as a staggered grid from the centre, and the labels fade.
 */
export function AiwiWafflesCover() {
  const root = useCoverReveal((tl) => {
    tl.from('.a-mark', { autoAlpha: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(1.4)' }, 0)
    tl.from(
      '.a-pocket',
      {
        scale: 0,
        transformOrigin: '50% 50%',
        duration: 0.4,
        ease: 'back.out(2)',
        stagger: { each: 0.035, from: 'center', grid: [COLS, COLS] },
      },
      0.3
    )
    tl.from('.a-fade', { autoAlpha: 0, y: 12, duration: 0.55, stagger: 0.12 }, 0.5)
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
          <pattern id="aiwi-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0 H0 V44" fill="none" stroke="#1c1c1c" strokeWidth="1" />
          </pattern>
          <clipPath id="aiwi-body">
            <rect x={BODY.x} y={BODY.y} width={BODY.size} height={BODY.size} rx="40" />
          </clipPath>
        </defs>

        <rect width="1600" height="900" fill="#090909" />
        <rect width="1600" height="900" fill="url(#aiwi-grid)" opacity="0.5" />

        <rect x="1020" y="0" width="580" height="900" fill="#0e0e0e" />
        <line x1="1020" y1="0" x2="1020" y2="900" stroke="#1c1c1c" strokeWidth="1" />

        {/* waffle mark motif */}
        <g>
          <text className="a-fade" x="1140" y="200" fill="#7a7060" fontSize="22" letterSpacing="2">BRAND MARK</text>

          {/* mark body + border */}
          <g className="a-mark">
            <rect x={BODY.x} y={BODY.y} width={BODY.size} height={BODY.size} rx="40" fill="#7a3a2a" opacity="0.35" />
            <rect x={BODY.x} y={BODY.y} width={BODY.size} height={BODY.size} rx="40" fill="none" stroke="#f86343" strokeWidth="2" />
          </g>

          {/* pockets (staggered) clipped to the body */}
          <g clipPath="url(#aiwi-body)">
            {POCKETS.map((p, i) => (
              <rect key={i} className="a-pocket" x={p.x} y={p.y} width="66" height="66" rx="14" fill="#f86343" opacity="0.9" />
            ))}
          </g>

          <text className="a-fade" x="1140" y="710" fill="#f5f0e8" fontSize="40" fontWeight="600">Identity · Signage</text>
          <text className="a-fade" x="1140" y="752" fill="#7a7060" fontSize="24">Store, food truck &amp; merch</text>
        </g>

        {/* left content (static frame) */}
        <rect x="110" y="150" width="5" height="120" fill="#f86343" />
        <text x="140" y="180" fill="#7a7060" fontSize="24" letterSpacing="6">CASE STUDY — 03</text>

        <text x="106" y="430" fill="#f5f0e8" fontSize="140" fontWeight="700" letterSpacing="-5">&#8217;Aiwi</text>
        <text x="106" y="560" fill="#f5f0e8" fontSize="140" fontWeight="700" letterSpacing="-5">Waffles</text>

        <text x="112" y="640" fill="#7a7060" fontSize="28">Branding &amp; Shopify storefront</text>

        <CoverChip x={112} y={730} w={160} label="Branding" />
        <CoverChip x={288} y={730} w={200} label="UX/UI Design" />
        <CoverChip x={504} y={730} w={148} label="Shopify" />
        <CoverChip x={668} y={730} w={132} label="SEO/AEO" />
      </svg>
    </div>
  )
}
