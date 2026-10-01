---
title: A backlog for AI-assisted development with Claude Code or Cursor
description: How to work with an AI coding agent and your task board over MCP — what an MCP server is, what to ask the agent (list your issues, capture bugs, triage the backlog, move work as it goes), and how to keep it under control.
keywords: [mcp task management claude code, claude code backlog, ai agent backlog, what is an mcp server, ai coding agent task management, cursor task board, mcp server for project management]
type: documentation
project: boards
order: 8
createdAt: 2026-10-01
updatedAt: 2026-10-01
---
An AI coding agent works on your code, but the list of what to build usually lives somewhere else — so you end up copying bug reports into the chat and status updates back out. Laraue Boards removes that step: the agent reads your backlog, creates cards and moves them while it works.

## What is an MCP server?

**MCP** (Model Context Protocol) is an open standard that lets an AI app use outside tools — look something up, create a record, change a status. An **MCP server** is the tool side of that: a service the agent connects to and calls.

Laraue Boards runs a **remote** MCP server, so there is nothing to install or run on your machine. You give your client its address and an API key, and the agent can list issues, open one, create and edit issues, move them between statuses and comment — always with your own permissions.

## Connect the agent first

You need an [API key](/en/documentation/integrations/api-keys) and one setup step in your client. [Connecting Claude and other AI agents via MCP](/en/documentation/integrations/mcp) has the steps for Claude Code, Cursor, and Claude on desktop or the web. Consider a separate key for the agent, so you can revoke it on its own.

To check the connection, ask: *"List the spaces in my Boards organization."* If the agent answers with your spaces, you are connected.

## Use it as a development backlog

Some things to ask once it is connected:

- **"What's on my plate?"** — the agent finds who you are and lists the open issues assigned to you.
- **Capture while you code.** *"Create a card for the flaky checkout test and paste the failing output into it."* The issue lands in the space's backlog, with a title and description.
- **Triage.** *"Go through the Backlog and suggest five issues for this week."* Review the list, then say *"Move those to Doing."*
- **Close the loop.** *"When you're done with WRK-42, comment what changed and move it to Done."*
- **From chat to code.** Forward a bug report in Telegram and it becomes a card in the Backlog (see [Capturing Telegram messages](/en/documentation/working-alone/telegram-messages)). Then ask the agent to pick it up.

## Tell the agent how your board works

Agents follow instructions in a project file such as `CLAUDE.md` or `AGENTS.md`. A few lines are enough:

```markdown
Our tasks live in Laraue Boards (space WRK), reachable through the `boards` MCP server.
- Before starting work, move the issue to Doing.
- When you finish, add a comment saying what changed, then move it to Done.
- Editing an issue replaces its whole content: read the issue first and keep what should stay.
```

Adjust the space key and the statuses to your own board.

## Keep it under control

- The agent acts **as you**. It cannot do anything in an organization that you could not do yourself, and it stops working the moment the key is revoked.
- If you do not want the agent to delete issues, use a key from an account that has no delete permission in that space. See [Permissions management](/en/documentation/working-in-a-team/permissions).
- Changes made through an API key show up in the issue history with a key icon, so you can always tell what the agent did and what you did yourself.

## If something does not work

- **It cannot connect.** Check the setup steps in [Connecting Claude and other AI agents via MCP](/en/documentation/integrations/mcp): the header must be named exactly `X-Api-Key`, and the key must not be revoked.
- **It sees too little.** The agent only sees what your account can see. Check your permissions in that organization.
- **It cannot find a status or a space.** Ask it to list them first; it can look up spaces, statuses and members by itself.

## Related pages

- [Connecting Claude and other AI agents via MCP](/en/documentation/integrations/mcp)
- [API keys — connecting your own tools to Boards](/en/documentation/integrations/api-keys)
- [Permissions management](/en/documentation/working-in-a-team/permissions)
