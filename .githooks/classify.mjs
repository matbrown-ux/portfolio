// tdd-kit: pure path classification. No I/O. Mirrors spec section 5.2.
const TEST_BASENAME = /\.(test|spec)\.[^./]+$/
const TEST_DIR = /(^|\/)(tests?|__tests__|e2e|mocks)\//
const CONFIG_BASENAME = /\.(config|workspace)\.[^.]+$/
const TSCONFIG = /^tsconfig.*\.json$/
const EXEMPT_BASENAMES = new Set([
  'package.json', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'deno.lock',
  'pnpm-workspace.yaml', 'netlify.toml', 'vercel.json', '.gitignore', '.env.example',
  'LICENSE', '.tdd-kit-optout',
])
const EXEMPT_DIRS = /^(\.githooks|\.github|\.claude|docs)\//
const CONTENT_EXT = new Set([
  'css', 'scss', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'ico',
  'mp4', 'webm', 'mov', 'woff', 'woff2', 'ttf', 'otf', 'astro',
])
const CONTENT_DIRS = /^public\//
const CONTENT_JSON_DIRS = /^(src\/content|content)\/.*\.json$/
const SOURCE_EXT = new Set(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'])
const SOURCE_DIRS = /^(src|scripts|api|netlify|supabase\/functions|packages|apps|build|content)\//
const MIGRATIONS = /^supabase\/migrations\/.+\.sql$/

export function classify(path) {
  const base = path.slice(path.lastIndexOf('/') + 1)
  const dot = base.lastIndexOf('.')
  const ext = dot > 0 ? base.slice(dot + 1).toLowerCase() : ''

  if (TEST_BASENAME.test(base) || TEST_DIR.test(path)) return 'test'

  if (
    CONFIG_BASENAME.test(base) || TSCONFIG.test(base) || EXEMPT_BASENAMES.has(base) ||
    EXEMPT_DIRS.test(path) || ext === 'md' || ext === 'mdx'
  ) return 'exempt'

  if (CONTENT_EXT.has(ext) || CONTENT_DIRS.test(path) || CONTENT_JSON_DIRS.test(path)) return 'content'

  if (SOURCE_EXT.has(ext) && SOURCE_DIRS.test(path)) return 'source'
  if (MIGRATIONS.test(path)) return 'source'

  return 'content'
}

export function summarize(paths) {
  const out = { source: [], test: [], content: [], exempt: [] }
  for (const p of paths) out[classify(p)].push(p)
  return out
}
