---
title: Issue links — blocks, relates to, duplicates
description: Link issues in Laraue Boards to show that one must be done before another, that two are related, or that one duplicates another. Blocked issues are marked on the board, and agents won't start them.
keywords: [issue links, blocked by issue, issue dependencies kanban, task dependencies tracker, duplicate issue, related issues]
type: documentation
project: boards
order: 9
createdAt: 2026-10-18
updatedAt: 2026-10-18
---
Links connect two issues of the same organization and say how they relate. They're listed in the **Links** section on the issue page, grouped by what they mean from that issue's side.

## Link types

- **Blocks / Blocked by** — one issue must be done before the other. If ISS-3 blocks ISS-7, ISS-7 shows it under **Blocked by**, and ISS-3 shows ISS-7 under **Blocks**. Blocks links can't form a loop.
- **Relates to** — the issues are related, with no order. It reads the same from both sides.
- **Duplicates / Duplicated by** — one issue repeats another. The one marked **Duplicates** is the copy; the other is the original.

Two issues have at most one link between them. To change its type, remove the link and add a new one.

## Adding and removing links

On the issue page, click **Add link**, choose the link type, and type the other issue's key or words from its title. Links are saved straight away — the issue's **Save changes** isn't needed. Hover a link and click the remove button to delete it.

You need edit access to the issue you add the link from, and to be able to see the other issue. Links to issues you can't see aren't shown to you.

Adding or removing a link appears in the [change history](/documentation/features/issue-history) of both issues.

## Blocked issues

An issue is **blocked** while an issue that blocks it isn't finished yet — it's in a not started, in progress, or in review status. Only a done status releases it.

Blocked issues get a small **Blocked** mark on their card on the board. An issue handed to the [agent](/documentation/integrations/agent-hand-off) waits while it's blocked and starts once every blocker is done.

AI agents connected [over MCP](/documentation/integrations/mcp) see the same links on each issue, and can leave blocked issues out when they look for work to start.
