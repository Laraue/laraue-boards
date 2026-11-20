---
title: Connecting Claude and other AI agents via MCP
description: Connect Claude Desktop, Claude Code, Cursor, or claude.ai to Laraue Boards over the remote MCP server. Step-by-step setup for each client, and what the agent can do — list, view, create, edit, delete, and comment on issues, scoped to your own permissions.
keywords: [boards mcp server, claude mcp connector, model context protocol boards, connect claude to boards, connect claude code to task tracker, claude code mcp server setup, cursor mcp server, ai agent project management, remote mcp connector]
type: documentation
project: boards
order: 8
createdAt: 2026-09-23
updatedAt: 2026-11-20
---
Laraue Boards runs a remote **MCP** (Model Context Protocol) server, so an AI agent like Claude can work with your issues directly — listing them, opening one, moving it between statuses, or leaving a comment — without you copying anything back and forth by hand.

## What you need

A Laraue Boards account. Claude and Claude Code sign in to Boards when you connect them: Boards asks which organization they should work in, and you allow it. Other clients, like Cursor, connect with an [API key](/documentation/integrations/api-keys) instead — create one from **Organization profile → API keys** before connecting.

## Connecting in Claude

In Claude, type `/mcp` to open the MCP connectors list, choose the **custom connector** option and set the URL:

- **URL**: `https://boards.laraue.com/boards-mcp/mcp`

When you connect it, Claude opens Boards: sign in if you aren't yet, choose the organization and click **Allow**. You're taken back to Claude, and the connector is ready.

If you prefer an API key, add a header to the connector instead of signing in:

- **Header**: `X-Api-Key` set to your API key

![Adding the Laraue Boards MCP connector in Claude, with the server URL and X-Api-Key header](https://laraue.com/static/images/blog/docs/laraue-boards/claude-mcp-connector-setup.jpg)

Laraue Boards is also listed on the [official MCP Registry](https://registry.modelcontextprotocol.io) as `com.laraue/boards`, so any other MCP-compatible client that can browse the registry can find it the same way.

## Connecting Claude Code

Run this once in a terminal:

```bash
claude mcp add --transport http boards https://boards.laraue.com/boards-mcp/mcp
```

Then type `/mcp` inside Claude Code, select `boards` and authenticate: the browser opens Boards, where you choose the organization and click **Allow**.

By default the server is added for the current project only. Add `--scope user` to make it available in every project.

To connect with an API key instead, pass it as a header:

```bash
claude mcp add --transport http boards https://boards.laraue.com/boards-mcp/mcp \
  --header "X-Api-Key: YOUR_API_KEY"
```

With `--scope project` the server goes into the project's `.mcp.json`, which then includes the key — keep that file out of version control.

## Connecting Cursor

Add the server to `.cursor/mcp.json` in your project, or to `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "boards": {
      "url": "https://boards.laraue.com/boards-mcp/mcp",
      "headers": {
        "X-Api-Key": "${env:BOARDS_API_KEY}"
      }
    }
  }
}
```

Set `BOARDS_API_KEY` in your shell environment, so the key never sits in the file.

## Connecting more than one organization

One connection works in one organization. To use the agent with, for example, your personal organization and your company's, connect the server twice under different names and choose a different organization each time you allow it:

```bash
claude mcp add --transport http boards-personal https://boards.laraue.com/boards-mcp/mcp
claude mcp add --transport http boards-work https://boards.laraue.com/boards-mcp/mcp
```

Authenticate each of them from `/mcp`. The agent sees both servers and their tools side by side, and you can tell it which one to use ("in boards-work, create an issue…"). In Claude, add a second custom connector with another name in the same way. With API keys, give each connection the key of its own organization.

Once connected, see [A backlog for AI-assisted development](/documentation/use-cases/ai-agent-backlog) for what to ask the agent.

## What Claude can do

Every action runs with your own permissions, live — Claude can't do anything in an organization that you couldn't do yourself there, and it can't act at all once the API key behind its connection is revoked.

- **Issues** — list and filter issues, view one in full detail, create a new one (with a title), edit its title, content or assignee, move it to a different status (keeping or dropping the values of attributes the new board doesn't use), or delete it
- **Comments** — add a comment to an issue, or edit one you wrote, with files attached (e.g. a report or config)
- **Organization structure** — look up spaces (with a space's [description and links](/documentation/concepts/spaces#description-and-links)), statuses, custom attributes (all of them, or only those a board uses), and members, so Claude can resolve names to the right ids on its own
- **Attachments** — attach images and documents to issues and comments, and read them back: an image as an image, Markdown, TXT and JSON as text, PDF and Word as a file — see [Attachments](/documentation/features/media#what-you-can-attach) for formats and limits
- **Issue links** — link issues (blocks, relates to, duplicates), remove a link, and leave blocked issues out when looking for work to start — see [Issue links](/documentation/features/issue-links)
- **Agent runs** — hand an issue to your coding agent, and, for a runner, pick up and finish the issues handed off to you — see [Hand issues to an AI agent](/documentation/integrations/agent-hand-off)

Claude only offers actions you're actually allowed to take — for example, it won't suggest deleting an issue in a space where you don't have delete permission.

## Revoking access

Every connection works through an API key: the one you created, or one Boards created when the client signed in, named after the client — for example `Claude (claude.ai)` or `Claude Code (claude.ai)`. Revoke it from **Organization profile → API keys** at any time, and the agent immediately loses the ability to reach that organization — the same as revoking any other key.

## Related pages

- [A backlog for AI-assisted development](/documentation/use-cases/ai-agent-backlog) — connecting Claude Code or Cursor, and what to ask the agent
- [API keys — connecting your own tools to Boards](/documentation/integrations/api-keys)
- [Permissions management](/documentation/working-in-a-team/permissions)
