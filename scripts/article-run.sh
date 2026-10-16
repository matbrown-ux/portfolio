#!/bin/zsh
# Writes one blog article on this Mac: launchd runs it Monday, Wednesday and Friday
# (~/Library/LaunchAgents/io.matbrown.article.plist). In a fresh worktree of origin/main it runs
# three stages (docs/content/article-routine.md): a Claude writer session (Sonnet, on the owner's
# Claude subscription), Codex for the images (the owner's ChatGPT login), and a fresh Claude
# editor session for the owner's voice (docs/content/brand-voice.md). Then it pushes and opens a
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

RULES="Hard rules: never merge, never push, never run gh, never run codex, never use git's skip-hooks flag. Never invent facts, client results or first-hand experience. No em dashes, en dashes, emojis or symbol characters. Write American English. Edit the article with the Edit tool, never with a find-and-replace script, and reread each sentence you change."
DENY=('Bash(git push:*)' 'Bash(gh:*)' 'Bash(codex:*)' 'Bash(command codex:*)' 'Bash(rm -rf /:*)' 'Bash(rm -rf ~:*)')
field() { grep -o "$1: [^\`*]*" "$2" | tail -1 | sed -e "s/^$1: //" -e 's/[[:space:]]*$//'; }

# Stage 1: the writer. Research, the article, the image brief, the first checks, one local commit.
WRITER=$(cat <<PROMPT
You are the scheduled blog writer for matbrown.io, running on the owner's Mac in a fresh worktree of origin/main (repo matbrown-ux/portfolio).

1. Read CLAUDE.md (sections 2, 3 and 5), docs/content/brand-voice.md and docs/content/article-routine.md. You are the WRITER stage: do sections 1 to 3, section 4 steps 1 to 3 (the image brief and the markers; do not generate images), section 5 steps 1 to 3, and section 6 steps 1 to 3 (the branch, the map, ONE local commit). Do not push and do not open a pull request: the script does that after an editor session.
2. Write exactly ONE article on a new branch article/<slug> from origin/main, in the owner's voice from brand-voice.md.

Cite only pages you opened and read in this run; if you cannot fetch your sources, stop and commit nothing. Skip rows whose status is needs-input.
$RULES

End with these three lines, in this exact form, and nothing after them:
ARTICLE: <path to the .mdx file>
BRIEF: <path to the image brief>
RESULT: committed
If you stopped without committing, end with only: RESULT: none: <reason>
PROMPT
)
claude -p "$WRITER" --model claude-sonnet-5-5 --permission-mode dontAsk \
  --allowedTools Bash Read Write Edit Glob Grep WebSearch WebFetch Skill \
  --disallowedTools "${DENY[@]}" > "$LOG_DIR/$STAMP.writer.out"
STATUS=$?
cat "$LOG_DIR/$STAMP.writer.out"
ARTICLE=$(field ARTICLE "$LOG_DIR/$STAMP.writer.out")
BRIEF=$(field BRIEF "$LOG_DIR/$STAMP.writer.out")
RESULT=$(field RESULT "$LOG_DIR/$STAMP.writer.out")
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ $STATUS -ne 0 || $RESULT != committed || ! -f $ARTICLE || $BRANCH != article/* ]]; then
  RESULT=${RESULT:-"none: the writer exited $STATUS"}
  notify "No article this run: $RESULT. Log: $LOG"
else
  WRITTEN=$(shasum "$ARTICLE" | cut -d' ' -f1)

  # Stage 2: the images. Codex runs here, never inside a Claude session: on 2026-10-16 it hung
  # there with no output until the session's time limit. Its own limit is 25 minutes.
  IMAGES=""
  if [[ -f $BRIEF ]]; then
    PNGS=(${(f)"$(grep -o 'src/content/blog/[^`]*\.png' "$BRIEF" | sort -u)"})
    for f in $PNGS; do mkdir -p "${f:h}"; done
    echo "codex start $(date)"
    perl -e 'alarm shift; exec @ARGV' 1500 codex exec -C "$WORK" -s workspace-write --skip-git-repo-check \
      "Read $BRIEF. Generate each image it describes with your image generation tool, using each entry's Prompt exactly at its Size, and save each as a PNG at its File path. Do not edit any other file. Print the saved paths and their pixel sizes." \
      < /dev/null 2>&1 | grep -v rmcp::transport
    echo "codex end $(date) status=${pipestatus[1]}"
    for f in $PNGS; do [[ -f $f ]] && IMAGES="$IMAGES $f"; done
  fi
  echo "images made:${IMAGES:- none}"

  # Stage 3: the editor. A fresh session with no stake in the draft: the voice pass, the copy skills, the images.
  EDITOR=$(cat <<PROMPT
You are the EDITOR for a matbrown.io blog article that another session drafted in this worktree, on branch $BRANCH. The article is $ARTICLE and its image brief is $BRIEF.
Images Codex made:${IMAGES:- none}

1. Read CLAUDE.md section 2, docs/content/brand-voice.md (all of it) and docs/content/article-routine.md sections 3 to 6.
2. Do the voice pass in article-routine.md section 5 step 4, in order: the brand voice, then load and APPLY the copywriting skill, then load and APPLY the humanizer skill, then the checklist in brand-voice.md section 9. Loading a skill is not applying it: the article must show the edits. Keep every fact, source link and code block. Do not add facts, numbers or stories that brand-voice.md, docs/content/owner-facts.md or the case studies do not give you.
3. Do article-routine.md section 4 steps 5 to 7 for the images listed above.
4. Run npm run build until it passes, count the words (section 5 step 2) and stay in range.
5. Amend the one commit (git commit --amend) with your changes, and update its body as section 6 step 3 says. Do not push.
$RULES

End with one line in this exact form, and nothing after it:
EDITED: <one sentence on what you changed>
PROMPT
)
  claude -p "$EDITOR" --model claude-sonnet-5-5 --permission-mode dontAsk \
    --allowedTools Bash Read Write Edit Glob Grep Skill \
    --disallowedTools "${DENY[@]}" > "$LOG_DIR/$STAMP.editor.out"
  STATUS=$?
  cat "$LOG_DIR/$STAMP.editor.out"

  # The script, not a Claude session, decides whether the article ships.
  if [[ $STATUS -ne 0 || $(shasum "$ARTICLE" | cut -d' ' -f1) == $WRITTEN ]]; then
    RESULT="none: the editor pass did not change the article (exit $STATUS); branch $BRANCH kept locally"
    notify "No article PR: the editor pass failed. Log: $LOG"
  elif [[ -n $(git status --porcelain) ]]; then
    RESULT="none: the editor left uncommitted changes; branch $BRANCH kept locally"
    notify "No article PR: uncommitted changes after the editor. Log: $LOG"
  elif git push -u origin "$BRANCH" && RESULT=$(gh pr create --base main --head "$BRANCH" --fill | tail -1) && [[ $RESULT == https://* ]]; then
    date +%Y-%m-%d > "$DONE"
    notify "New article ready to review: $RESULT"
  else
    RESULT="none: the push or gh pr create failed for $BRANCH"
    notify "No article PR: the push or gh failed. Log: $LOG"
  fi
fi

cd "$REPO" && git worktree remove --force "$WORK" 2>/dev/null; git worktree prune
echo "end $(date) status=$STATUS result=$RESULT"
