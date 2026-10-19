---
title: Hand issues to an AI agent
description: Hand an issue in Laraue Boards to your own AI coding agent. The agent runs on your machine, takes the issues assigned to you, works on them, and moves them to review — while the issue stays locked so nobody changes the task under it.
keywords: [hand issue to ai agent, ai coding agent task tracker, claude code issue tracker, agent runner mcp, ai agent backlog, delegate issue to agent]
type: documentation
project: boards
order: 8
createdAt: 2026-10-18
updatedAt: 2026-10-18
---
You can hand an issue to an AI coding agent — Claude Code on your own machine, with your repository and your settings. The agent takes the issue, works on it, reports progress in comments, and moves it to review for you to check.

## How it works

1. **You hand the issue off.** In the **Agent** section of the issue page, click **Hand to agent**. The card on the board shows **For agent**.
2. **Your agent takes it.** A runner on your machine, connected [over MCP](/en/documentation/integrations/mcp) with your [API key](/en/documentation/integrations/api-keys), picks up the issues handed off to you and moves the issue to in progress. The card shows **Agent working**.
3. **The agent works.** It writes progress comments and a summary, then moves the issue to a review status.
4. **You review.** Move the issue to done, or send it back: move it to a not started status, add a comment, and hand it off again.

If the agent gives up, the card shows **Agent failed**, and the reason is in the badge's hint on the issue page.

## Who can hand an issue off

Only the issue's assignee, and only to their own agent: a runner works only on issues assigned to the user whose API key it uses. Nobody else can send work to your machine.

The **Hand to agent** button is greyed out, with the reason in its hint, until:

- you have an [API key](/en/documentation/integrations/api-keys) in the organization — your runner signs in with it,
- the issue is in a not started status, and
- its board has statuses for each stage the agent goes through — not started, in progress, and in review.

## While the agent has the issue

The issue is **locked**: its title, description, attributes, attachments, and assignee can't be changed, and it can't be deleted — the agent works from what you handed off. Status changes and comments still work. Comments from people other than the assignee are treated as information for the agent, not instructions.

Anyone who can edit the issue can click **Cancel run** in the Agent section. That stops the agent and unlocks the issue.

## Blocked issues

You can hand off a [blocked issue](/en/documentation/features/issue-links). It waits — the agent doesn't take it — until every issue that blocks it is done.

## For runner authors

A runner uses these MCP tools: `list_agent_runs` (poll with `state: Ready`, your user id from `get_me` in `assigneeIds`, and `excludeBlocked: true`), `claim_agent_run` (true when you got it, false to skip), `finish_agent_run` (`Done` or `Failed` with a reason), and `get_issue`, whose `latestAgentRun` shows whether the run was cancelled. Every change to a run is in the issue's [change history](/en/documentation/features/issue-history), with the API key that made it.
