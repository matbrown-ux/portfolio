// tdd-kit: commit guard. Run by .githooks/pre-commit and .githooks/commit-msg.
// Decision functions are pure; I/O helpers and main() are added in Task 4.
import { summarize } from './classify.mjs'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const MIN_REASON_CHARS = 10
const TRAILER = /^Test-Exempt:[ \t]*(.*)$/m

export function parseTrailer(message) {
  const body = message.split('\n').filter((line) => !line.startsWith('#')).join('\n')
  const match = TRAILER.exec(body)
  if (!match) return { present: false, reason: null }
  return { present: true, reason: match[1].trim() }
}

export function decideCommitMsg({ stagedPaths, message }) {
  const { source, test } = summarize(stagedPaths)
  if (source.length === 0 || test.length > 0) return { ok: true, messages: [] }

  const trailer = parseTrailer(message)
  const reasonLength = trailer.present ? trailer.reason.replace(/\s/g, '').length : 0
  if (trailer.present && reasonLength >= MIN_REASON_CHARS) {
    return { ok: true, messages: [`tdd-kit: Test-Exempt accepted: ${trailer.reason}`] }
  }

  const messages = [
    'tdd-kit: REFUSED. Source files changed but no test file is staged.',
    ...source.map((p) => `  source: ${p}`),
    '',
    'Write the failing test first, stage it with the change, and commit again.',
    "For a genuine exception (needs your human partner's approval) add a trailer to the message:",
    `  Test-Exempt: <reason of at least ${MIN_REASON_CHARS} characters>`,
  ]
  if (trailer.present) messages.push('', `Trailer found but the reason is too short: "${trailer.reason}"`)
  return { ok: false, messages }
}

export function decidePreCommit({ stagedPaths }) {
  const { source, test } = summarize(stagedPaths)
  return { needsTests: source.length + test.length > 0 }
}

export function getStagedPaths(cwd) {
  const out = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], { cwd, encoding: 'utf8' })
  return out.split('\n').filter(Boolean)
}

export function isMerging(cwd) {
  const mergeHead = execFileSync('git', ['rev-parse', '--git-path', 'MERGE_HEAD'], { cwd, encoding: 'utf8' }).trim()
  return existsSync(resolve(cwd, mergeHead))
}

export function detectPackageManager(cwd) {
  return existsSync(join(cwd, 'pnpm-lock.yaml')) ? 'pnpm' : 'npm'
}

export function runTests(cwd) {
  const pm = detectPackageManager(cwd)
  const result = spawnSync(pm, ['test'], { cwd, stdio: 'inherit', env: { ...process.env, CI: '1' } })
  return result.status === 0
}

export function runLegacyHook(cwd, hooksDir) {
  const legacy = join(hooksDir, 'pre-commit.local')
  if (!existsSync(legacy)) return true
  const result = spawnSync('sh', [legacy], { cwd, stdio: 'inherit' })
  return result.status === 0
}

export function main(argv, deps = {}) {
  const {
    cwd = process.cwd(),
    hooksDir = dirname(fileURLToPath(import.meta.url)),
    staged = getStagedPaths,
    merging = isMerging,
    tests = runTests,
    legacy = runLegacyHook,
    readMessage = (file) => readFileSync(file, 'utf8'),
    log = console.log,
    error = console.error,
  } = deps
  const [mode, messageFile] = argv

  if (mode === 'pre-commit') {
    if (!legacy(cwd, hooksDir)) {
      error('tdd-kit: REFUSED by the repo\'s own pre-commit.local hook (see output above).')
      return 1
    }
    const stagedPaths = staged(cwd)
    if (!decidePreCommit({ stagedPaths }).needsTests) return 0
    log('tdd-kit: source or test files staged, running the unit suite...')
    if (!tests(cwd)) {
      error('tdd-kit: REFUSED. The test suite is red. Fix the code (not the test) and commit again.')
      return 1
    }
    return 0
  }

  if (mode === 'commit-msg') {
    if (merging(cwd)) return 0
    const stagedPaths = staged(cwd)
    const result = decideCommitMsg({ stagedPaths, message: readMessage(messageFile) })
    for (const m of result.messages) (result.ok ? log : error)(m)
    return result.ok ? 0 : 1
  }

  error(`tdd-kit: unknown mode "${mode}". Expected pre-commit or commit-msg.`)
  return 2
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) process.exit(main(process.argv.slice(2)))
