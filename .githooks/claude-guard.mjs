// tdd-kit: Claude Code PreToolUse hook for Bash. Exit 2 refuses the command.
// Installed per repo at .githooks/claude-guard.mjs and globally from ~/dotfiles/tdd-kit/.
import { fileURLToPath } from 'node:url'

// Blank the value of -m / --message (and combined short flags like -am) so a commit message
// that merely mentions a flag is never treated as a bypass. Then drop remaining quote
// characters so `"-n"` and `HUSKY="0"` look the way the shell will hand them to git.
const MESSAGE_ARG = /(\s-[a-zA-Z]*m|\s--message)(?:\s+|=)("(?:[^"\\]|\\.)*"|'[^']*'|\S+)/g

export function normalize(command) {
  return command.replace(MESSAGE_ARG, '$1 ""').replace(/["']/g, '')
}

// git accepts any unambiguous long-option prefix, and --no-veri is the shortest
// prefix that resolves to --no-verify, so every abbreviation of it is caught.
// Short flags combine, so any git-commit flag group containing an `n` is -n.
export const BYPASS_PATTERNS = [
  { re: /--no-veri\w*/, why: '--no-verify (or an abbreviation of it) skips the git hooks' },
  { re: /\bgit\s+commit\b[^|&;\n]*\s-[a-zA-Z]*n[a-zA-Z]*\b/, why: 'git commit -n skips the git hooks' },
  { re: /core\.hookspath/i, why: 'changing core.hooksPath disables the commit guard' },
  { re: /\bHUSKY=0\b/, why: 'HUSKY=0 disables git hooks' },
  { re: /\b(rm|mv|chmod|truncate|cp)\b[^|&;\n]*\.githooks\//, why: 'removing or altering .githooks/ would disable the commit guard' },
]

// The hook files are the gate itself, so no Claude session may rewrite them in place.
// Re-run the installer to refresh them instead.
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])
const GITHOOKS_PATH = /(^|\/)\.githooks\//

export function findBypass(command) {
  const normalized = normalize(command)
  for (const { re, why } of BYPASS_PATTERNS) {
    if (re.test(normalized)) return why
  }
  return null
}

export function evaluate(input) {
  if (!input) return null
  if (EDIT_TOOLS.has(input.tool_name)) {
    const filePath = input.tool_input?.file_path
    if (typeof filePath !== 'string') return null
    return GITHOOKS_PATH.test(filePath.replace(/\\/g, '/')) ? 'editing .githooks/ would disable the commit guard' : null
  }
  if (input.tool_name !== 'Bash') return null
  const command = input.tool_input?.command
  if (typeof command !== 'string') return null
  return findBypass(command)
}

export async function main(stdin = process.stdin) {
  let raw = ''
  for await (const chunk of stdin) raw += chunk
  let input
  try {
    input = JSON.parse(raw)
  } catch {
    return 0
  }
  const why = evaluate(input)
  if (!why) return 0
  console.error(
    `tdd-kit: BLOCKED. ${why}. The TDD gate cannot be bypassed. ` +
      'Commit with a test, or (with your human partner\'s explicit approval) add a "Test-Exempt: <reason>" trailer to the commit message.',
  )
  return 2
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
  main()
    .then((code) => process.exit(code))
    .catch(() => process.exit(2))
}
