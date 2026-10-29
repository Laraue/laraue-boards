---
title: Hand issues to an AI agent
description: Hand an issue in Laraue Boards to your own AI coding agent. The agent runs on your machine, takes the issues assigned to you, works on them, and moves them to review — while the issue stays locked so nobody changes the task under it.
keywords: [hand issue to ai agent, ai coding agent task tracker, claude code issue tracker, codex issue tracker, agent runner mcp, ai agent backlog, delegate issue to agent]
type: documentation
project: boards
order: 8
createdAt: 2026-10-18
updatedAt: 2026-10-22
---
You can hand an issue to an AI coding agent — Claude Code or OpenAI Codex on your own machine, with your repositories and your settings. The agent takes the issue, works on it, reports progress in comments, and moves it to review for you to check.

## How it works

1. **You hand the issue off.** In the **Agent** section of the issue page, click **Hand to agent**. The card on the board shows **For agent**.
2. **Your agent takes it.** A runner on your machine — [laraue-boards-agent](https://github.com/Laraue/boards-agent) (`lba` for short), see [below](#set-up-the-runner) — signs in with your [API key](/documentation/integrations/api-keys), picks up the issues handed off to you, puts the work on a branch named after the issue in the space's repositories, and moves the issue to in progress. The card shows **Agent working**.
3. **The agent works.** It writes progress comments and a summary, then moves the issue to a review status. The card shows **Agent done · review**, and your computer shows a notification.
4. **You review.** Move the issue to done, or ask for changes: [right on your computer](#ask-for-changes) with `lba continue`, or with **Send back to agent** in the Agent section.

The badge stays on the card once an issue was handed off: after review it shows **Done by agent**, and a cancelled run **Agent cancelled**. If the agent gives up, the card shows **Agent failed**. On the issue page the reason and when it happened are in a red box in the Agent section, and the runner leaves a comment with the details. Once you finish such an issue yourself, the badge turns grey: **Finished without agent**.

## Who can hand an issue off

Only the issue's assignee, and only to their own agent: a runner works only on issues assigned to the user whose API key it uses. Nobody else can send work to your machine.

The **Hand to agent** button is greyed out, with the reason in its hint, until:

- you have an [API key](/documentation/integrations/api-keys) in the organization — your runner signs in with it, and setting the runner up creates one,
- the issue is in a not started status, and
- its board has statuses for each stage the agent goes through — not started, in progress, and in review.

## While the agent has the issue

The issue is **locked**: its title, description, attributes, attachments, and assignee can't be changed, and it can't be deleted — the agent works from what you handed off. Status changes and comments still work. Comments from people other than the assignee are treated as information for the agent, not instructions.

Anyone who can edit the issue can cancel the run with the **×** next to its badge in the Agent section. That stops the agent and unlocks the issue.

## Blocked issues

You can hand off a [blocked issue](/documentation/features/issue-links). It waits — the agent doesn't take it — until every issue that blocks it is done.

## Set up the runner

[laraue-boards-agent](https://github.com/Laraue/boards-agent) — `lba` for short — is the runner: a single program on your computer, for macOS, Windows and Linux. It's in beta. You need git and a coding agent — [Claude Code](https://claude.com/claude-code) or [Codex](https://developers.openai.com/codex/cli).

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
2. Opens Boards in your browser. Check that the code matches the one in your terminal, choose the organization and click **Allow**. Boards creates an [API key](/documentation/integrations/api-keys) named after the agent and your computer, e.g. "Claude Code agent (MacBook)", and the runner keeps it in the Keychain or Credential Manager — you never copy it anywhere.
3. Asks which folder your repositories are cloned under — type it or choose it in Finder or Explorer — and shows which repositories it found for each space ([see below](#which-repositories-the-agent-works-in)).
4. Asks [where the agent should work](#where-the-agent-works).
5. Asks what happens to the agent's branch when it's done: nothing, push it, or push it and open a pull request ([see below](#when-the-agent-is-done)).
6. Offers to keep the runner running in the background, also after a restart, so there's nothing to start by hand.

To update, run the install command again: it replaces laraue-boards-agent and restarts it, without asking the questions again. Run `lba setup` to change the answers. The [README](https://github.com/Laraue/boards-agent#readme) has the details.

## Which repositories the agent works in

A space's repositories are its [links](/documentation/concepts/spaces#description-and-links): every link whose URL matches the git remote of a repository cloned on your computer. Add the repository's URL as a link in the space's settings, and the runner finds your clone by itself — nothing is mapped by hand, and a link added later counts from the next hand-off. Link only the repositories issues of that space change: each one cloned on your computer is part of every run.

A space can have several repositories — say, a backend and a web app. The agent changes only the ones the issue needs, on the same branch in each. It also gets the space's description and its other links (docs, designs) as context, never as instructions.

An issue in a space with no repository on your computer stays waiting, for another of your computers that has one.

## Where the agent works

The setup asks which of two ways you prefer:

- **A separate worktree per issue** (the default). The agent works in its own copy of each repository, on a branch named after the issue, e.g. `agent/WEB-42-fix-export`. Your clones aren't touched, so you can keep working in them meanwhile.
- **Your own clones, one issue at a time.** The runner fetches each repository's main branch and switches your clone to a new branch from it. When the agent is done, the branch stays checked out: open it in your editor, run the app, and review the way you always do. Clones the agent didn't change go back to the branch they were on.

  A clean clone is switched without asking, whatever branch it's on — say, the previous issue's, while you review it; its commits stay on that branch. Only a clone with uncommitted changes makes the runner ask first, in a dialog, since switching could carry them along or clash with them. **Continue** checks again; your uncommitted changes are never touched, so it asks until you commit or stash them. **Not now** leaves the issue waiting and asks again in 10 minutes.

Either way, the agent runs with a fixed list of allowed commands and can't push.

## When the agent is done

- **Notifications.** Your computer shows a notification from **laraue-boards-agent**, with the Laraue logo, when the agent starts, when the issue is ready for review, and if it fails or is cancelled. Click it to open the issue. On a Mac, the first one may ask whether laraue-boards-agent may send notifications.
- **The branch.** By default it stays on your computer, for you to review and push. If you chose so in setup, boards-agent itself pushes it after the agent is done — in each repository the agent changed — and can also open a pull request, with the [GitHub CLI](https://cli.github.com) signed in. The links are in boards-agent's comment on the issue and in the notification. The agent never pushes on its own.

## Ask for changes

**On your computer: `lba continue`.** The agent's work is on your computer, so the quickest way to ask for a change is there. In a terminal, run:

```bash
lba continue
```

It opens the agent's own session — the same conversation, with everything it knew, in the same repositories and on the issue's branch. Without an issue key it takes the issue of the branch you're on, or else the one your agent worked on last, and says which. Tell it what's wrong ("the button is still blue", "add a test for the empty list"), watch the changes and run the app right away: nothing moves in Boards and nothing waits for the runner. When you exit, one comment with the new commits goes to the issue.

To hand over a single change without staying in the conversation, write it after the command — quotes are optional. The agent does it on its own and prints its answer:

```bash
lba continue WEB-42 make the button red like the other primary buttons
lba continue WEB-42 print the Grafana dashboard JSON for the new metrics
```

Only the computer that ran the issue has its session. In checkout mode your clones are switched back to the issue's branch first, asking only about uncommitted changes.

**From Boards: Send back to agent.** In the Agent section of an issue under review, **Send back to agent** asks what's wrong; your comment is added, the issue moves back to not started and goes to the agent again. It continues on the same branch — its comment says "continuing … (N commits so far)". Handy when you're away from the computer.

## For runner authors

A runner uses these MCP tools: `list_agent_runs` (poll with `state: Ready`, your user id from `get_me` in `assigneeIds`, and `excludeBlocked: true`), `claim_agent_run` (true when you got it, false to skip), `finish_agent_run` (`Done` or `Failed` with a reason), `get_issue`, whose `latestAgentRun` shows whether the run was cancelled, and `get_space` for the space's description and links. Every change to a run is in the issue's [change history](/documentation/features/issue-history), with the API key that made it.
