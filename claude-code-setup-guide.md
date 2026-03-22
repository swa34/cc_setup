# Claude Code — Setup Guide

what each feature is for, when to use it, and how the pieces fit together.

---

## Table of Contents

1. [Install](#1-install)
2. [The Big Picture — What Goes Where](#2-the-big-picture--what-goes-where)
3. [CLAUDE.md — Project Instructions](#3-claudemd--project-instructions)
4. [Memory — Persistence Across Sessions](#4-memory--persistence-across-sessions)
5. [Hooks — Automated Reactions](#5-hooks--automated-reactions)
6. [Skills — Reusable Workflows](#6-skills--reusable-workflows)
7. [Plugins — Packaged Extensions](#7-plugins--packaged-extensions)
8. [MCP Servers — External Connections](#8-mcp-servers--external-connections)
9. [Settings & Permissions](#9-settings--permissions)
10. [Deciding What to Use](#10-deciding-what-to-use)
11. [Portable Config with a Private Gist](#11-portable-config-with-a-private-gist)
12. [Useful Commands](#12-useful-commands)

---

## 1. Install

```bash
# Linux / macOS
curl -fsSL https://claude.ai/install.sh | sh

# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex

# Alternatives
brew install --cask claude-code          # Homebrew
winget install Anthropic.ClaudeCode      # WinGet
npm install -g @anthropic-ai/claude-code # npm
```

Run `claude` in any project directory to start. Authenticate on first run.

---

## 2. The Big Picture — What Goes Where

Claude Code has several layers of configuration.

| Layer           | What it does                                         | When to use it                               |
| --------------- | ---------------------------------------------------- | -------------------------------------------- |
| **CLAUDE.md**   | Static project context Claude reads every session    | Architecture, conventions, build commands    |
| **Memory**      | Persistent notes Claude reads/writes across sessions | User preferences, feedback, project context  |
| **Hooks**       | Scripts/agents that fire automatically on events     | Post-commit tasks, validation, reminders     |
| **Skills**      | Reusable slash commands you invoke manually          | Repeated workflows, templates, procedures    |
| **Plugins**     | Packaged bundles of skills + hooks + MCP servers     | Shared toolkits (code review, testing, etc.) |
| **MCP Servers** | External tool connections (APIs, databases, etc.)    | GitHub, Docker, Git, databases, browsers     |
| **Settings**    | Permissions, env vars, plugin toggles                | What Claude can/can't do without asking      |

### The key distinction

- **CLAUDE.md** = "here's what you need to know"
- **Memory** = "here's what you've learned"
- **Hooks** = "when X happens, do Y automatically"
- **Skills** = "when I say /X, do Y"
- **MCP** = "here are external tools you can use"

---

## 3. CLAUDE.md — Project Instructions

The main way to give Claude context about a project. Claude reads it at the start of every session.

### Locations (most specific wins)

| File                        | Scope             | Shared          |
| --------------------------- | ----------------- | --------------- |
| `~/.claude/CLAUDE.md`       | All your projects | No              |
| `<repo>/CLAUDE.md`          | One project       | Yes (committed) |
| `<repo>/.claude/rules/*.md` | Path-scoped rules | Yes             |

### What to put in CLAUDE.md

**Project overview** — what it is, who it's for, what stage it's in:

```
Budget Contributions app for UGA CAES. ~753 county personnel enter annual
budget data. Phase 4 (testing/polish) in progress.
```

**Tech stack and architecture** — so Claude doesn't guess wrong:

```
Node.js + Express 5 + TypeScript (ESM), PostgreSQL 17 via Knex 3.
Frontend: React 19 + Vite 7 + Tailwind 4. AG Grid for spreadsheet views.
Auth: UGA CAS SSO via x-remote-user header. OIDC via openid-client 6.
```

**Build / run / test commands** — the exact commands, not generic ones:

```
docker compose up -d              # Full stack
npm run migrate                   # Knex migrations
npm test                          # Vitest (backend: 143 tests)
```

**Key conventions and constraints** — things Claude would get wrong without being told:

```
- All local imports require .js extension (ESM)
- UUID public_id in API URLs — never expose internal integer id
- All FK behavior is ON DELETE RESTRICT — no cascading deletes
- Audit log is append-only (REVOKE UPDATE, DELETE in migration)
```

**Database schema overview** — table names, prefixes, relationships:

```
Table prefixes: cc_ (contributions), caes_ctyinv_ (inventory).
cc_funding_sources PK is a string slug, not integer/UUID.
```

**API structure** — endpoints, auth guards, patterns to follow:

```
/api/budget/* — contributions CRUD (authMiddleware + countyGuard)
/api/inventory/* — inventory CRUD (same auth chain)
Follow the voucherData CRUD pattern for new endpoints.
```

### What NOT to put in CLAUDE.md

**Event-driven workflows** — use **hooks** instead:

```
Bad:  "After every commit, run the linter and check for TODO comments"
Good: PostToolUse hook on Bash that detects git commit and runs checks
```

**Repeated manual procedures** — use **skills** instead:

```
Bad:  "When I say 'scaffold component', create files X, Y, Z..."
Good: /scaffold-component skill with templates
```

**Descriptions of what the code does** — Claude reads the actual source files, so
describing them in CLAUDE.md just goes stale when the code changes:

```
Bad:  "Button.tsx accepts variant, size, and disabled props"
      (Claude will read the file and see the real props — if you add
       a new prop later, CLAUDE.md is wrong but the code is right)

Good: "Use string slugs for funding_source IDs, not UUIDs — the legacy
       API returns slugs and we need stable references"
      (Claude can't figure out WHY from the code alone, so this belongs
       in CLAUDE.md to prevent well-intentioned refactors)
```

**Sensitive info** — keep out of committed files:

```
Bad:  API keys, personal emails, project tracker IDs, admin user lists
Good: Put these in hooks (gitignored), env vars, or .claude/settings.local.json
```

### Best practices

- Keep it under 200 lines — Claude reads it every session, so bloat costs tokens
- Use headers and bullets over dense paragraphs
- If a section is only relevant after a specific event (commit, deploy), move it to a hook
- Use `.claude/rules/` for detailed rules — see below

### Rules directory (`.claude/rules/`)

When CLAUDE.md gets too long, split detailed rules into separate files. Each file covers
one topic. Rules without a `paths` field load every session. Rules with `paths` only load
when Claude works with matching files — saving context for everything else.

```
your-project/
  .claude/
    CLAUDE.md              # Keep this short — overview + build commands
    rules/
      testing.md           # Test conventions (loads every session)
      api-design.md        # API patterns (loads every session)
      frontend-styles.md   # CSS/styling rules (only when editing frontend files)
      security.md          # Security requirements (loads every session)
```

**Example: a rule that applies to all files** (`testing.md`):

```markdown
# Testing Rules

- Use Vitest for all tests
- Backend tests use supertest for HTTP assertions
- Never mock the database in integration tests
- Test files live in `src/__tests__/` not next to source files
```

**Example: a rule scoped to specific file paths** (`frontend-styles.md`):

```markdown
---
paths:
  - 'frontend/src/components/**/*.tsx'
  - 'frontend/src/styles/**/*.css'
---

# Frontend Styling Rules

- Use Tailwind utility classes — no inline styles or CSS modules
- Use CSS custom properties from the @theme block (e.g., --color-primary)
- Never hardcode hex colors or font names
- AG Grid overrides go in inventory-grid.css, not component styles
```

This rule only loads when Claude reads or edits files matching those glob patterns.
If Claude is working on backend code, these frontend rules stay out of context
and don't waste tokens.

**Path pattern examples:**

| Pattern                 | Matches               |
| ----------------------- | --------------------- |
| `src/**/*.test.ts`      | All test files        |
| `frontend/**/*.tsx`     | All React components  |
| `backend/src/routes/**` | All route files       |
| `**/*.css`              | Any CSS file anywhere |
| `src/api/**/*.ts`       | API layer files       |

---

## 4. Memory — Persistence Across Sessions

Claude Code has a built-in memory system so it remembers things across conversations.

### How it works

- **Auto-memory**: Claude writes notes to `~/.claude/projects/<project>/memory/MEMORY.md`
- **Global CLAUDE.md**: `~/.claude/CLAUDE.md` holds rules that apply everywhere
- First 200 lines of `MEMORY.md` are loaded each session; topic files loaded on demand

### Memory types

| Type          | What to store                        | Example                                          |
| ------------- | ------------------------------------ | ------------------------------------------------ |
| **user**      | Your role, expertise, preferences    | "Senior dev, prefers terse responses"            |
| **feedback**  | Corrections and confirmed approaches | "Don't mock the database in integration tests"   |
| **project**   | Ongoing work, decisions, deadlines   | "Auth rewrite driven by legal compliance"        |
| **reference** | Pointers to external resources       | "Pipeline bugs tracked in Linear project INGEST" |

### Setting up the memory system

On a fresh machine, paste this prompt into Claude Code to bootstrap the full memory system:

```
Set up a structured, persistent memory management system for Claude Code. Run in plan mode,
show me the plan, then execute.

Create tasks for each step, mark each in_progress before starting and completed when done.

Rule: if any file already exists and would be modified or removed, use AskUserQuestion first.
Show the current content and the proposed change. Do not modify without explicit confirmation.

Step 1 — Create global memory directory structure:

Create ~/.claude/memory/ with these files if they don't exist:

~/.claude/memory/memory.md (the index):
  # Memory Index
  Read this file at session start. Load specific topic files only when relevant.
  | File | Description | Last updated |
  | general.md | Cross-project conventions and preferences | {today} |
  Include Cross-Memory Sync Rule and Domain Knowledge Lifecycle sections.

~/.claude/memory/general.md (cross-project conventions):
  # General - Cross-Project Conventions
  ## Writing & Naming Conventions
  ## Workflow Preferences
  (Both sections start empty, populated as you work)

Also create empty directories: ~/.claude/memory/tools/ and ~/.claude/memory/domain/

Step 2 — Update ~/.claude/CLAUDE.md with these sections (skip any that already exist):

- Memory Management: structure (memory.md, general.md, domain/, tools/), rules (write
  immediately, keep index current, date/what/why format, confirm before modifying), and
  maintenance instructions ("reorganize memory" command)
- Global Memory: pointer to ~/.claude/memory/memory.md + topic file list
- Global Memory Reference Rule: every project MEMORY.md must have a short pointer to
  ~/.claude/CLAUDE.md — no duplicating topic lists, 200-line budget
- Repo Memory Auto-Init: at session start, check for MEMORY.md in the project memory
  directory, create from template if missing
- Domain Knowledge Lifecycle: staging → promotion → pointer flow

Step 3 — Initialize project MEMORY.md files:

Scan ~/.claude/projects/ for existing project directories. For each:
a) If memory/MEMORY.md doesn't exist: create it with the template
b) If it exists with an old trigger table format: replace with 2-line pointer
c) If it already has the correct pointer: leave it alone
```

### Directory structure after setup

```
~/.claude/
  CLAUDE.md                          # Global rules (memory mgmt, conventions)
  memory/
    memory.md                        # Index — read at session start
    general.md                       # Cross-project conventions
    domain/                          # Domain knowledge (fills over time)
    tools/                           # Tool configs, CLI patterns
  projects/
    -home-user-project-name/         # Per-project (path-encoded)
      memory/
        MEMORY.md                    # Project-specific notes
```

### Key rules

- Claude reads `memory.md` at session start, loads topic files on demand
- First 200 lines of project `MEMORY.md` are loaded each session
- Memory files are plain markdown — fully editable and deletable
- Run `/memory` to see all loaded CLAUDE.md and memory files
- Say "reorganize memory" to have Claude clean up and deduplicate
- Claude saves memories automatically when it learns something worth keeping
- Before modifying or removing a memory entry, Claude asks for confirmation

---

## 5. Hooks — Automated Reactions

Hooks fire automatically when specific events happen. They're the backbone of workflow automation.

### When to use hooks

Use a hook when you want something to happen **automatically** in response to an event. If you find yourself writing the same instructions in CLAUDE.md and hoping Claude remembers them, that's a hook.

**Good hook candidates:**

- "After every commit, run the linter and check for broken tests"
- "After editing a file, auto-format with Prettier"
- "Before stopping, verify all tests pass"
- "When config files change, remind me to sync them"
- "After a commit, check if documentation needs updating"

**Not a hook (use a skill instead):**

- "When I say /deploy, run the deployment"
- "When I say /review, analyze this PR"

### Hook events

| Event                        | When it fires                    | Common use                      |
| ---------------------------- | -------------------------------- | ------------------------------- |
| `PreToolUse`                 | Before a tool runs               | Block dangerous commands        |
| `PostToolUse`                | After a tool completes           | Lint, format, post-commit tasks |
| `Stop`                       | Before Claude stops              | Verify work is complete         |
| `SessionStart`               | Session begins                   | Load context, check status      |
| `UserPromptSubmit`           | Before your message is processed | Inject context                  |
| `PreCompact` / `PostCompact` | Around context compression       | Preserve/re-inject key info     |

### Hook types

| Type      | What it does                       | Best for                             |
| --------- | ---------------------------------- | ------------------------------------ |
| `command` | Runs a shell script                | Pattern matching, fast checks (~5ms) |
| `prompt`  | Single LLM call (Haiku)            | Judgment calls, yes/no decisions     |
| `agent`   | Spawns a subagent with tool access | Verification requiring file reads    |
| `http`    | POSTs JSON to a URL                | External services, webhooks          |

### Configuration

Hooks go in the `hooks` key of any settings file:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/my-script.sh",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

### Writing a command hook script

Scripts receive JSON on stdin. Parse with `jq`, exit 0 (allow) or 2 (block with message):

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$COMMAND" == *"something dangerous"* ]]; then
  echo "Blocked: reason here" >&2
  exit 2    # Forces Claude to respond to stderr message
fi

exit 0      # Silent success
```

### Writing a prompt/agent hook

No script needed — the prompt is inline in the config:

```json
{
  "type": "agent",
  "prompt": "Check if tests pass after this change. $ARGUMENTS\n\nReturn {\"ok\": true} if all good, or {\"ok\": false, \"reason\": \"what failed\"} if not.",
  "timeout": 60
}
```

Agent hooks can read files, search code, and run commands to verify conditions. They only interrupt when something needs attention.

### Exit codes

| Code  | Behavior                                             |
| ----- | ---------------------------------------------------- |
| 0     | Success — continue (parse stdout for optional JSON)  |
| 2     | Block — stderr message shown to Claude, must respond |
| Other | Non-blocking warning — shown in verbose mode only    |

---

## 6. Skills — Reusable Workflows

Skills are slash commands you invoke manually. They're for repeated workflows that need your trigger, not automatic reactions.

### When to use skills

Use a skill when you have a **repeatable procedure** you trigger on demand.

**Good skill candidates:**

- "Set up a new React component with tests and storybook"
- "Review this PR with our team's checklist"
- "Generate API documentation for this module"
- "Run the full deploy pipeline"

**Not a skill (use a hook instead):**

- "After every commit, update the task tracker"
- "After editing files, run the linter"

### Skill file format

```yaml
---
name: my-skill
description: When Claude should suggest this skill
disable-model-invocation: true # Optional: only triggered by typing /my-skill
---
Step-by-step instructions for what Claude should do.
Can reference files, run commands, use tools.
```

### Locations

| Path                                    | Scope                       |
| --------------------------------------- | --------------------------- |
| `~/.claude/skills/<name>/SKILL.md`      | Personal, all projects      |
| `<repo>/.claude/skills/<name>/SKILL.md` | Project, shared with team   |
| Plugin skills                           | Come with installed plugins |

### Using skills

```
/my-skill              # Invoke by name
/my-skill some args    # Pass arguments
```

Claude can also invoke skills automatically based on the `description` field — unless `disable-model-invocation: true` is set.

### Skills can have hooks

Skills can define their own hooks in the YAML frontmatter. These hooks are scoped to the skill's lifetime and cleaned up when it finishes:

```yaml
---
name: secure-deploy
description: Deploy with security checks
hooks:
  PreToolUse:
    - matcher: 'Bash'
      hooks:
        - type: command
          command: './scripts/security-check.sh'
---
```

---

## 7. Plugins — Packaged Extensions

Plugins bundle skills, hooks, agents, and MCP servers into installable packages. Think of them as "apps" for Claude Code.

### Managing plugins

```
/plugins              # Browse and toggle plugins
/plugins search       # Find available plugins
```

Enabled plugins are stored in `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "code-review@claude-plugins-official": true,
    "playwright@claude-plugins-official": true
  }
}
```

### Notable official plugins

| Plugin                  | What it does                                    |
| ----------------------- | ----------------------------------------------- |
| **code-review**         | PR review with confidence-based scoring         |
| **playwright**          | Browser automation and E2E testing              |
| **skill-creator**       | Create and benchmark custom skills              |
| **hookify**             | Create hooks by analyzing conversation patterns |
| **chrome-devtools-mcp** | Chrome DevTools for debugging and a11y          |
| **frontend-design**     | Production-grade UI (anti-AI-slop aesthetics)   |
| **agent-sdk-dev**       | Build custom agents with the Agent SDK          |

### When to use a plugin vs. a standalone skill/hook

- **Plugin**: when you want a packaged, versioned, shareable bundle
- **Standalone skill**: when it's personal or project-specific
- **Standalone hook**: when it's a simple automation for one project

---

## 8. MCP Servers — External Connections

MCP (Model Context Protocol) servers connect Claude to external tools and data sources — APIs, databases, browsers, task trackers, etc.

### When to use MCP

When Claude needs to **interact with something outside the codebase**: manage Docker containers, interact with GitHub PRs/issues, query a database, control a browser, fetch documentation.

### Configuration

```json
// ~/.claude.json (global) or .mcp.json (project)
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@some/mcp-server"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

### Managing MCP servers

```bash
claude mcp add server-name -s user -- command args    # Add
claude mcp list                                        # List
claude mcp remove server-name                          # Remove
```

### MCP vs. hooks vs. skills

| Need                                                 | Use        |
| ---------------------------------------------------- | ---------- |
| Claude needs to call an external API                 | MCP server |
| Something should happen automatically after an event | Hook       |
| You want to trigger a workflow manually              | Skill      |
| You want Claude to have a new tool available         | MCP server |

---

## 9. Settings & Permissions

### Settings files (most specific wins)

| Level   | File                          | Scope                 |
| ------- | ----------------------------- | --------------------- |
| Managed | Enterprise-controlled         | Can't override        |
| User    | `~/.claude/settings.json`     | All projects          |
| Project | `.claude/settings.json`       | Shared (committed)    |
| Local   | `.claude/settings.local.json` | Personal (gitignored) |

### Permission modes

| Mode          | Behavior                                  |
| ------------- | ----------------------------------------- |
| `default`     | Ask for most operations                   |
| `plan`        | Read-only, no edits                       |
| `acceptEdits` | Auto-approve file edits, ask for commands |
| `dontAsk`     | Auto-approve everything                   |

### Allow rules

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(git:*)",
      "Read(/home/user/project/**)",
      "Edit(/home/user/project/**)"
    ]
  }
}
```

`deny` rules override `allow`. First match wins.

---

## 10. Deciding What to Use

This is the most important section. When you have a new need, here's how to decide where it goes:

### "Claude needs to know this about my project"

**Use CLAUDE.md.** Architecture, conventions, build commands, schema.

### "Claude keeps forgetting my preference"

**Use memory.** Save it as a feedback memory so it persists across sessions.

### "After X happens, Claude should do Y"

**Use a hook.** Post-commit tasks, linting, validation, reminders.

### "When I say X, Claude should do Y"

**Use a skill.** Deployment, scaffolding, code generation templates.

### "Claude needs to talk to an external service"

**Use an MCP server.** GitHub, Docker, Git, databases, browsers.

### "I want to share a bundle of tools with my team"

**Use a plugin.** Package skills + hooks + MCP servers together.

### "This instruction is in CLAUDE.md but Claude keeps forgetting it"

**Move it to a hook.** If it's event-driven, CLAUDE.md is the wrong place. Hooks fire reliably; CLAUDE.md instructions can get lost in context compression.

### "I'm repeating myself across projects"

**Put it in `~/.claude/CLAUDE.md`** (global) or create a personal skill in `~/.claude/skills/`.

### Common migrations

| From                    | To         | When                                                   |
| ----------------------- | ---------- | ------------------------------------------------------ |
| CLAUDE.md instruction   | Hook       | The instruction is event-driven ("after commit, do X") |
| CLAUDE.md instruction   | Skill      | The instruction is a procedure you trigger manually    |
| Manual API calls        | MCP server | Claude needs to interact with an external service      |
| Copy-paste procedure    | Skill      | You type the same steps in every project               |
| Standalone skill + hook | Plugin     | You want to version and share the bundle               |

---

## 11. Portable Config with a Private Gist

Your Claude Code config lives in directories that aren't tracked by git (`.claude/` is gitignored, `~/.claude/` is outside the repo). To make it portable across machines, store everything in a **private GitHub gist**.

### The problem

| Config              | Location                             | Tracked by git?   |
| ------------------- | ------------------------------------ | ----------------- |
| Hook scripts        | `<repo>/.claude/hooks/`              | No (gitignored)   |
| Local settings      | `<repo>/.claude/settings.local.json` | No (gitignored)   |
| Global instructions | `~/.claude/CLAUDE.md`                | No (outside repo) |
| Memory files        | `~/.claude/memory/`                  | No (outside repo) |
| Project memory      | `~/.claude/projects/*/memory/`       | No (outside repo) |

None of this follows you to another machine.

### Step 1 — Create the gist

After you've set up your hooks, memory, and settings, push them all to a secret gist:

```bash
# Collect files into a temp dir (rename to avoid conflicts in the gist)
mkdir -p /tmp/cc-config
cp .claude/hooks/*.sh /tmp/cc-config/
cp .claude/settings.local.json /tmp/cc-config/
cp ~/.claude/CLAUDE.md /tmp/cc-config/global-CLAUDE.md
cp ~/.claude/memory/memory.md /tmp/cc-config/global-memory-index.md
cp ~/.claude/memory/general.md /tmp/cc-config/global-general.md

# Create the gist (secret by default — only accessible via direct link)
cd /tmp/cc-config
gh gist create -d "Claude Code personal config" *.sh *.json *.md

# Save the gist ID from the output URL — you'll need it for syncing
rm -rf /tmp/cc-config
```

Find your gists later: **github.com** → profile avatar → **"Your gists"**

### Step 2 — Restore on a new machine

```bash
# Clone the gist
gh gist clone <GIST_ID> /tmp/cc-config

# Hooks (from project repo root)
mkdir -p .claude/hooks
cp /tmp/cc-config/*.sh .claude/hooks/
chmod +x .claude/hooks/*.sh
cp /tmp/cc-config/settings.local.json .claude/

# Global memory
mkdir -p ~/.claude/memory/tools ~/.claude/memory/domain
cp /tmp/cc-config/global-CLAUDE.md ~/.claude/CLAUDE.md
cp /tmp/cc-config/global-memory-index.md ~/.claude/memory/memory.md
cp /tmp/cc-config/global-general.md ~/.claude/memory/general.md

# Project memory (path varies per machine — check with: ls ~/.claude/projects/)
PROJECT_DIR=$(ls -d ~/.claude/projects/*your-project* 2>/dev/null | head -1)
if [ -n "$PROJECT_DIR" ]; then
  mkdir -p "$PROJECT_DIR/memory"
  cp /tmp/cc-config/project-MEMORY.md "$PROJECT_DIR/memory/MEMORY.md"
fi

rm -rf /tmp/cc-config
```

### Step 3 — Set up the auto-sync reminder hook

Create a hook that reminds you to push changes to the gist whenever a config or memory file is edited. This closes the loop — edits trigger a reminder, so the gist stays current.

**Create the script** at `.claude/hooks/sync-gist-reminder.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

case "$FILE_PATH" in
  */.claude/hooks/*|*/.claude/settings.local.json)
    echo "GIST SYNC REMINDER: Config file modified. Push changes to gist:" >&2
    echo "gh gist edit <GIST_ID> -a .claude/hooks/your-hook.sh" >&2
    echo "gh gist edit <GIST_ID> -a .claude/settings.local.json" >&2
    exit 2
    ;;
  */.claude/memory/*|*/.claude/CLAUDE.md)
    echo "GIST SYNC REMINDER: Memory file modified. Push changes to gist:" >&2
    echo "gh gist edit <GIST_ID> -a ~/.claude/CLAUDE.md --filename global-CLAUDE.md" >&2
    echo "gh gist edit <GIST_ID> -a ~/.claude/memory/memory.md --filename global-memory-index.md" >&2
    exit 2
    ;;
esac
exit 0
```

```bash
chmod +x .claude/hooks/sync-gist-reminder.sh
```

**Register the hook** in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/sync-gist-reminder.sh",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

Replace `<GIST_ID>` in the script with your actual gist ID.

### Syncing changes manually

```bash
# Push a single file to the gist
gh gist edit <GIST_ID> -a path/to/local/file

# Push with a different filename (needed when local and gist names differ)
gh gist edit <GIST_ID> -a ~/.claude/CLAUDE.md --filename global-CLAUDE.md
```

### What to store in the gist

| File             | Local path                              | Purpose                              |
| ---------------- | --------------------------------------- | ------------------------------------ |
| Hook scripts     | `.claude/hooks/*.sh`                    | Automated workflows                  |
| Local settings   | `.claude/settings.local.json`           | Hook registration + permissions      |
| Global CLAUDE.md | `~/.claude/CLAUDE.md`                   | Memory rules + global instructions   |
| Memory index     | `~/.claude/memory/memory.md`            | Memory file index                    |
| General memory   | `~/.claude/memory/general.md`           | Cross-project conventions            |
| Project memory   | `~/.claude/projects/*/memory/MEMORY.md` | Project-specific notes               |
| Setup prompts    | (reference only)                        | Bootstrap prompts for fresh machines |
| This guide       | (reference only)                        | How everything fits together         |

---

## 12. Useful Commands

### In-session

| Command     | What it does                               |
| ----------- | ------------------------------------------ |
| `/memory`   | Show all loaded CLAUDE.md and memory files |
| `/hooks`    | Browse configured hooks                    |
| `/plugins`  | Manage plugins                             |
| `/compact`  | Compress context to free up space          |
| `/fast`     | Toggle fast output mode                    |
| `/help`     | Show all commands                          |
| `! command` | Run a shell command in the session         |

### CLI

```bash
claude                          # Interactive session
claude "do something"           # Start with a prompt
claude -c                       # Continue last session
claude -r "session-name"        # Resume named session
claude -p "query"               # Non-interactive (for scripts/CI)
claude --permission-mode plan   # Read-only exploration
claude --model claude-opus      # Pick a model
claude --add-dir ../other-repo  # Add another directory
claude update                   # Update Claude Code
```
