---
title: Hand issues to an AI agent
description: Hand an issue in Laraue Boards to your own AI coding agent. The agent runs on your machine, takes the issues assigned to you, works on them, and moves them to review — while the issue stays locked so nobody changes the task under it.
keywords: [hand issue to ai agent, ai coding agent task tracker, claude code issue tracker, codex issue tracker, agent runner mcp, ai agent backlog, delegate issue to agent]
type: documentation
project: boards
order: 8
createdAt: 2026-10-18
updatedAt: 2026-10-21
---
You can hand an issue to an AI coding agent — Claude Code or OpenAI Codex on your own machine, with your repositories and your settings. The agent takes the issue, works on it, reports progress in comments, and moves it to review for you to check.

## How it works

1. **You hand the issue off.** In the **Agent** section of the issue page, click **Hand to agent**. The card on the board shows **For agent**.
2. **Your agent takes it.** A runner on your machine — [boards-agent](https://github.com/Laraue/boards-agent), see [below](#set-up-the-runner) — signs in with your [API key](/en/documentation/integrations/api-keys), picks up the issues handed off to you, puts the work on a branch named after the issue in the space's repositories, and moves the issue to in progress. The card shows **Agent working**.
3. **The agent works.** It writes progress comments and a summary, then moves the issue to a review status.
4. **You review.** Move the issue to done, or send it back: move it to a not started status, add a comment, and hand it off again.

If the agent gives up, the card shows **Agent failed**. On the issue page the reason and when it happened are in a red box in the Agent section, and the runner leaves a comment with the details.

## Who can hand an issue off

Only the issue's assignee, and only to their own agent: a runner works only on issues assigned to the user whose API key it uses. Nobody else can send work to your machine.

The **Hand to agent** button is greyed out, with the reason in its hint, until:

- you have an [API key](/en/documentation/integrations/api-keys) in the organization — your runner signs in with it, and setting the runner up creates one,
- the issue is in a not started status, and
- its board has statuses for each stage the agent goes through — not started, in progress, and in review.

## While the agent has the issue

The issue is **locked**: its title, description, attributes, attachments, and assignee can't be changed, and it can't be deleted — the agent works from what you handed off. Status changes and comments still work. Comments from people other than the assignee are treated as information for the agent, not instructions.

Anyone who can edit the issue can cancel the run with the **×** next to its badge in the Agent section. That stops the agent and unlocks the issue.

## Blocked issues

You can hand off a [blocked issue](/en/documentation/features/issue-links). It waits — the agent doesn't take it — until every issue that blocks it is done.

## Set up the runner

[boards-agent](https://github.com/Laraue/boards-agent) is the runner: a single program on your computer, for macOS, Windows and Linux. It's in beta. You need git and a coding agent — [Claude Code](https://claude.com/claude-code) or [Codex](https://developers.openai.com/codex/cli).

Install it with one command. It downloads the newest release and starts the setup:

```bash
curl -fsSL https://raw.githubusercontent.com/Laraue/boards-agent/main/install.sh | sh
```

On Windows, in PowerShell:

```powershell
irm https://raw.githubusercontent.com/Laraue/boards-agent/main/install.ps1 | iex
```

The setup:

1. Picks the coding agent — the one you have installed, or asks when you have both.
2. Opens Boards in your browser. Check that the code matches the one in your terminal, choose the organization and click **Allow**. Boards creates an [API key](/en/documentation/integrations/api-keys) named after the agent and your computer, e.g. "Claude Code agent (MacBook)", and the runner keeps it in the Keychain or Credential Manager — you never copy it anywhere.
3. Asks which folder your repositories are cloned under — type it or choose it in Finder or Explorer — and shows which repositories it found for each space ([see below](#which-repositories-the-agent-works-in)).
4. Asks [where the agent should work](#where-the-agent-works).
5. Offers to keep the runner running in the background, also after a restart, so there's nothing to start by hand.

Run the install command again to update; running `boards-agent setup` again changes the answers. The [README](https://github.com/Laraue/boards-agent#readme) has the details.

## Which repositories the agent works in

A space's repositories are its [links](/en/documentation/concepts/spaces#description-and-links): every link whose URL matches the git remote of a repository cloned on your computer. Add the repository's URL as a link in the space's settings, and the runner finds your clone by itself — nothing is mapped by hand, and a link added later counts from the next hand-off. Link only the repositories issues of that space change: each one cloned on your computer is part of every run.

A space can have several repositories — say, a backend and a web app. The agent changes only the ones the issue needs, on the same branch in each. It also gets the space's description and its other links (docs, designs) as context, never as instructions.

An issue in a space with no repository on your computer stays waiting, for another of your computers that has one.

## Where the agent works

The setup asks which of two ways you prefer:

- **A separate worktree per issue** (the default). The agent works in its own copy of each repository, on a branch named after the issue, e.g. `agent/WEB-42`. Your clones aren't touched, so you can keep working in them meanwhile.
- **Your own clones, one issue at a time.** The runner fetches each repository's main branch and switches your clone to a new branch from it. When the agent is done, the branch stays checked out: open it in your editor, run the app, and review the way you always do. Clones the agent didn't change go back to the branch they were on.

  Before switching a clone that has uncommitted changes or isn't on its main branch — for example, it's still on the previous issue's branch while you review it — the runner asks first, in a dialog. **Continue** switches it; your uncommitted changes are never touched, so it asks again until you commit or stash them. **Not now** leaves the issue waiting and asks again in 10 minutes.

Either way, the agent runs with a fixed list of allowed commands and never pushes — you review the branch and push it yourself.

## For runner authors

A runner uses these MCP tools: `list_agent_runs` (poll with `state: Ready`, your user id from `get_me` in `assigneeIds`, and `excludeBlocked: true`), `claim_agent_run` (true when you got it, false to skip), `finish_agent_run` (`Done` or `Failed` with a reason), `get_issue`, whose `latestAgentRun` shows whether the run was cancelled, and `get_space` for the space's description and links. Every change to a run is in the issue's [change history](/en/documentation/features/issue-history), with the API key that made it.
