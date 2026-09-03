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

export const BYPASS_PATTERNS = [
  { re: /--no-verify\b/, why: '--no-verify skips the git hooks' },
  { re: /\bgit\s+commit\b[^|&;\n]*\s-[a-zA-Z]*n\b/, why: 'git commit -n skips the git hooks' },
  { re: /core\.hookspath/i, why: 'changing core.hooksPath disables the commit guard' },
  { re: /\bHUSKY=0\b/, why: 'HUSKY=0 disables git hooks' },
]

export function findBypass(command) {
  const normalized = normalize(command)
  for (const { re, why } of BYPASS_PATTERNS) {
    if (re.test(normalized)) return why
  }
  return null
}

export function evaluate(input) {
  if (!input || input.tool_name !== 'Bash') return null
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
if (invokedDirectly) main().then((code) => process.exit(code))
