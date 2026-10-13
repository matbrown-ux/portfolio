declare module 'fontkit' {
  /** Open a font file. The result satisfies `CardFont` in src/lib/cardText.ts. */
  export function openSync(path: string): unknown
}
