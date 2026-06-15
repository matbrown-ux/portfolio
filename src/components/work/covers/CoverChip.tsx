interface CoverChipProps {
  x: number
  y: number
  w: number
  label: string
  h?: number
  fontSize?: number
}

/**
 * A category pill for the case-study cover SVGs. The label is centered both
 * horizontally (text-anchor) and vertically (dominant-baseline) within the
 * rounded rectangle, so it stays centered regardless of the label length.
 */
export function CoverChip({ x, y, w, label, h = 52, fontSize = 22 }: CoverChipProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="none" stroke="#1c1c1c" />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fill="#f5f0e8"
      >
        {label}
      </text>
    </g>
  )
}
