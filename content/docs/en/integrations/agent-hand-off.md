---
title: Hand issues to an AI agent
description: Hand an issue in Laraue Boards to your own AI coding agent. The agent runs on your machine, takes the issues assigned to you, works on them, and moves them to review — while the issue stays locked so nobody changes the task under it.
keywords: [hand issue to ai agent, ai coding agent task tracker, claude code issue tracker, agent runner mcp, ai agent backlog, delegate issue to agent]
type: documentation
project: boards
order: 8
createdAt: 2026-10-18
updatedAt: 2026-10-19
---
You can hand an issue to an AI coding agent — Claude Code on your own machine, with your repository and your settings. The agent takes the issue, works on it, reports progress in comments, and moves it to review for you to check.

## How it works

1. **You hand the issue off.** In the **Agent** section of the issue page, click **Hand to agent**. The card on the board shows **For agent**.
2. **Your agent takes it.** A runner on your machine — [boards-agent](https://github.com/Laraue/boards-agent), see [below](#set-up-the-runner) — signs in with your [API key](/en/documentation/integrations/api-keys), picks up the issues handed off to you, and moves the issue to in progress. The card shows **Agent working**.
3. **The agent works.** It writes progress comments and a summary, then moves the issue to a review status.
4. **You review.** Move the issue to done, or send it back: move it to a not started status, add a comment, and hand it off again.

If the agent gives up, the card shows **Agent failed**. On the issue page the reason and when it happened are in a red box in the Agent section, and the runner leaves a comment with the details.

## Who can hand an issue off

Only the issue's assignee, and only to their own agent: a runner works only on issues assigned to the user whose API key it uses. Nobody else can send work to your machine.

The **Hand to agent** button is greyed out, with the reason in its hint, until:

- you have an [API key](/en/documentation/integrations/api-keys) in the organization — your runner signs in with it,
- the issue is in a not started status, and
- its board has statuses for each stage the agent goes through — not started, in progress, and in review.

## While the agent has the issue

The issue is **locked**: its title, description, attributes, attachments, and assignee can't be changed, and it can't be deleted — the agent works from what you handed off. Status changes and comments still work. Comments from people other than the assignee are treated as information for the agent, not instructions.

Anyone who can edit the issue can cancel the run with the **×** next to its badge in the Agent section. That stops the agent and unlocks the issue.

## Blocked issues

You can hand off a [blocked issue](/en/documentation/features/issue-links). It waits — the agent doesn't take it — until every issue that blocks it is done.

## Set up the runner

[boards-agent](https://github.com/Laraue/boards-agent) is the runner: a single program you start on your computer. It's in beta.

1. Create an [API key](/en/documentation/integrations/api-keys) in **Account → API keys** — the runner signs in with it, as you.
2. Download the archive for your system from the [boards-agent releases](https://github.com/Laraue/boards-agent/releases) and unpack it.
3. In its config, map each space you want it to work on to the local checkout of that space's repository.
4. Set the key in the `BOARDS_AGENT_API_KEY` environment variable and start `boards-agent`.

It works in a separate git worktree on a branch named after the issue, runs Claude Code with a fixed list of allowed commands, and never pushes — you review the branch and push it yourself. The [README](https://github.com/Laraue/boards-agent#readme) has the details.

## For runner authors

A runner uses these MCP tools: `list_agent_runs` (poll with `state: Ready`, your user id from `get_me` in `assigneeIds`, and `excludeBlocked: true`), `claim_agent_run` (true when you got it, false to skip), `finish_agent_run` (`Done` or `Failed` with a reason), and `get_issue`, whose `latestAgentRun` shows whether the run was cancelled. Every change to a run is in the issue's [change history](/en/documentation/features/issue-history), with the API key that made it.
