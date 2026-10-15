#!/bin/zsh
# Writes one blog article on this Mac: launchd runs it Monday, Wednesday and Friday
# (~/Library/LaunchAgents/io.matbrown.article.plist). Claude Code (Sonnet, on the owner's
# Claude subscription) follows docs/content/article-routine.md in a fresh worktree of
# origin/main, generates the images with Codex (the owner's ChatGPT login), and opens a
# pull request with gh. It never merges. Run it by hand to test: zsh scripts/article-run.sh

set -u
REPO=/Users/operationhq/Development/portfolio
WORK=/Users/operationhq/Development/.portfolio-article-run
LOG_DIR=$HOME/Library/Logs/matbrown-article
LOCK=/tmp/matbrown-article.lock
STAMP=$(date +%Y-%m-%d_%H%M)
LOG=$LOG_DIR/$STAMP.log

# launchd starts with a bare PATH: name every tool's folder.
export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v24.17.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

mkdir -p "$LOG_DIR"
exec > "$LOG" 2>&1

notify() { osascript -e "display notification \"$1\" with title \"matbrown.io article\"" >/dev/null 2>&1 || true; }

# One run at a time, and at most one article a day (a wake after a missed slot must not double up).
if ! mkdir "$LOCK" 2>/dev/null; then echo "another run holds $LOCK"; exit 0; fi
trap 'rm -rf "$LOCK"' EXIT
DONE=$LOG_DIR/last-success
if [[ -f $DONE && $(cat "$DONE") == $(date +%Y-%m-%d) ]]; then echo "already wrote an article today"; exit 0; fi

echo "start $(date)"
cd "$REPO" || exit 1
git fetch -q origin main || { notify "Could not reach GitHub. No article today."; exit 1; }

# A fresh worktree on origin/main, so the owner's own checkout and branches are never touched.
git worktree remove --force "$WORK" 2>/dev/null; rm -rf "$WORK"; git worktree prune
git worktree add -q --detach "$WORK" origin/main || exit 1
cd "$WORK" || exit 1
npm ci --no-audit --no-fund --loglevel=error || { notify "npm ci failed. See $LOG"; exit 1; }

PROMPT=$(cat <<'EOF'
You are the scheduled blog writer for matbrown.io, running on the owner's Mac in a fresh worktree of origin/main (repo matbrown-ux/portfolio).

1. Read CLAUDE.md (sections 2, 3 and 5) and docs/content/article-routine.md, then follow article-routine.md step by step. This run is local, so: generate the images with Codex as section 4 describes, and open the pull request with gh as section 6 describes.
2. Write exactly ONE article on a new branch article/<slug> from origin/main.

Hard rules: never merge, never push to main, never use git's skip-hooks flag. Never invent facts, client results or first-hand experience. Cite only pages you opened and read in this run; if you cannot fetch your sources, stop and push nothing. No em dashes, en dashes, emojis or symbol characters. Skip rows whose status is needs-input.

End with one line in this exact form, and nothing after it:
RESULT: <pull request URL, or "none: <reason>">
EOF
)

claude -p "$PROMPT" \
  --model claude-sonnet-5-5 \
  --permission-mode dontAsk \
  --allowedTools Bash Read Write Edit Glob Grep WebSearch WebFetch \
  --disallowedTools 'Bash(gh pr merge:*)' 'Bash(gh api:*)' 'Bash(gh repo:*)' 'Bash(gh auth:*)' 'Bash(gh secret:*)' \
    'Bash(git push origin main:*)' 'Bash(git push origin HEAD\:main:*)' 'Bash(git push -f:*)' 'Bash(git push --force:*)' \
    'Bash(rm -rf /:*)' 'Bash(rm -rf ~:*)' \
  > "$LOG_DIR/$STAMP.out"
STATUS=$?
cat "$LOG_DIR/$STAMP.out"

RESULT=$(grep -o 'RESULT: .*' "$LOG_DIR/$STAMP.out" | tail -1 | sed 's/^RESULT: //')
if [[ $STATUS -eq 0 && $RESULT == https://* ]]; then
  date +%Y-%m-%d > "$DONE"
  notify "New article ready to review: $RESULT"
else
  notify "No article this run: ${RESULT:-claude exited $STATUS}. Log: $LOG"
fi

cd "$REPO" && git worktree remove --force "$WORK" 2>/dev/null; git worktree prune
echo "end $(date) status=$STATUS result=$RESULT"
