---
title: Delegate issues to a coding agent and review its work
description: Hand well-defined issues to Claude Code or Codex running on your own computer, get on with other work, and review the result where you always work — then ask for changes with one command or send it back from Laraue Boards.
keywords: [delegate issues to ai agent, ai coding agent background tasks, claude code runs issues, codex task runner, review ai agent changes, ai agent pull request, hand off tasks to ai]
type: documentation
project: boards
order: 4
createdAt: 2026-10-22
updatedAt: 2026-10-28
---
You have a board of small, clear issues — a bug fix, a missing test, a settings page tweak — and no time to do them one by one. Hand them to a coding agent that runs on your own computer: it takes each issue, does the work on a branch, and tells you when it's ready for you to look at. You stay the reviewer.

![Video: an issue handed to the agent is fixed in the background and comes back for review, then is sent back with a comment](https://youtu.be/ADS7AHXHey4)

This is different from [chatting with an agent about your backlog](/documentation/use-cases/ai-agent-backlog): there you sit in the conversation; here you hand work off and come back to review it.

## When it fits

- Issues with a **clear outcome** you can check: "the export skips archived cards", "add a test for an empty list", "rename the setting in the UI and the docs".
- Work in **repositories you have cloned** on your computer — the agent works there, with your build tools.
- Not a fit: vague ideas, design decisions, anything you'd need to discuss first. Talk those through with the agent in a chat instead.

## Set it up once

1. **Install the runner** — one command, then click **Allow** in Boards. [Set up the runner](/documentation/integrations/agent-hand-off#set-up-the-runner) has the command for macOS, Linux and Windows.
2. **Link the repositories to the space.** In the space's settings, add each repository's URL under **Links**, with a line on what it is ("the web app", "the API"). The runner finds your local clones by these links — nothing to map by hand. See [Description and links](/documentation/concepts/spaces#description-and-links).
3. **Choose where the agent works.** If you review in your own editor, pick *your own clones* in setup: the agent's branch is then checked out right where you work. [Where the agent works](/documentation/integrations/agent-hand-off#where-the-agent-works) explains both options.
4. Optionally, let the runner **push the branch and open a pull request** when the agent is done.

## Write issues the agent can finish

The agent works only from what the issue says, so write it like a short brief:

- **What should be true when it's done** — the behaviour, not the steps.
- **Where to look** — the page, the endpoint, the file, if you know it.
- **How to check it** — the test to add or the case to try.

If one issue has to wait for another, link them with **blocked by** — the agent doesn't take a blocked issue until its blockers are done. See [Issue links](/documentation/features/issue-links).

## Hand off and get on with your day

On each issue, click **Hand to agent** in the Agent section. The card shows **For agent**, then **Agent working** once your runner picks it up — and your computer shows a notification. While the agent works, the issue is locked so the task doesn't change under it; comments and status changes still work.

When it's done, the card shows **Agent done · review** and you get a **ready for review** notification. Clicking it opens the issue, with the agent's summary of what it changed.

## Review where you work

The work is on a branch named after the issue, like `agent/WEB-42-export-skips-archived-cards`:

- with *your own clones*, it's already checked out — open your editor, run the app and the tests;
- with pull requests turned on, the link is in the runner's comment and the notification.

## Ask for changes

Something isn't right? Ask the agent directly, in a terminal:

```bash
lba continue
```

It opens the agent's own session of the issue — the same conversation, on the same branch — so you can say "the button is still blue" and watch it fix it, without anything moving in Boards. Or hand over one change and let it work alone:

```bash
lba continue WEB-42 also hide the export button for read-only members
```

When you're done, one comment with the new commits goes to the issue. Away from your computer? Use **Send back to agent** on the issue instead: write what's wrong, and the agent picks it up again on the same branch. [Ask for changes](/documentation/integrations/agent-hand-off#ask-for-changes) has the details.

## Finish

Merge the branch or the pull request and move the issue to done. The card keeps a **Done by agent** badge, so you can always tell which work the agent did.

## Keep it under control

- **Only your issues.** The runner works only on issues assigned to you and handed off by you — nobody else can send work to your computer.
- **Nothing leaves your computer unless you say so.** The agent can't push; the runner pushes only if you turned that on.
- **Your uncommitted changes are never touched.** In your own clones, the runner asks before switching a clone that has uncommitted changes.
- **Stop any time.** The **×** next to the agent badge cancels the run and unlocks the issue.
- **Everything is visible.** Each run, and every change it made, is in the issue's history with the agent's API key.

## Related pages

- [Hand issues to an AI agent](/documentation/integrations/agent-hand-off)
- [A backlog for AI-assisted development with Claude Code or Cursor](/documentation/use-cases/ai-agent-backlog)
- [Spaces: description and links](/documentation/concepts/spaces#description-and-links)
- [Issue links](/documentation/features/issue-links)
