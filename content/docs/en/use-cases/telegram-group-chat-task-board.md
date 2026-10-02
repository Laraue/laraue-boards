---
title: Turn a Telegram group chat into a team task board
description: Stop losing tasks in a busy group chat. Link the chat to a shared board, reply /save to any message to turn it into a card for the whole team, and keep working in Telegram.
keywords: [telegram group chat task board, turn telegram chat into tasks, telegram group task manager, save telegram message as task, telegram team kanban, telegram bot tasks from group chat]
type: documentation
project: boards
order: 1
createdAt: 2026-10-01
updatedAt: 2026-10-01
---
In a busy group chat, a task is rarely where the work happens: someone asks for a fix on Tuesday, and by Friday it is buried under two hundred messages. This guide sets up a shared board that your group chat feeds. Anyone on the team replies `/save` to a message, it becomes a card everyone can see, and nobody has to leave Telegram.

## What you get

- The messages **you pick** become cards on one shared board, with the text, photos, videos and the sender kept.
- The whole team sees the cards in the Telegram Mini App or the web app, and can move them between columns.
- Who may create cards is under your control: it follows the permissions you set for each member.

## Set it up in four steps

### 1. Create a team organization

Create an organization, copy its invite link and send it to your teammates. [Creating an organization and inviting your team](/en/documentation/working-in-a-team/creating-organization) walks through it, and it takes about two minutes.

### 2. Link the group chat to a board

Add [@msgboard_bot](https://t.me/msgboard_bot) to the group, then send `/link` in it. Only a chat admin can do this, and you need the *Link chats* permission in the organization. The bot walks you through the destination: organization, space, epic and status. At the last step, choose **Only via /save** — the manual mode, built for busy chats.

![The linked chat, showing the destination breadcrumb and the chosen save mode](https://laraue.com/static/images/blog/docs/laraue-boards/link-chat-linked.jpg)

See [Linking a Telegram chat to Boards](/en/documentation/integrations/telegram-linking) for every step.

### 3. Let your teammates create cards

A new member starts with no permissions at all, and linking a chat does not hand everyone in it the right to create cards. Give your teammates permission to create issues in that space. See [Permissions management](/en/documentation/working-in-a-team/permissions).

### 4. Save a message

Reply to any message with `/save`. Add a title after the command if you want to set it yourself:

```
/save Follow up next sprint
```

Without a title, the first line of the message becomes the title. Reply to a photo or video album and the whole album becomes one card.

![Replying to a message with /save and a title in a group chat](https://laraue.com/static/images/blog/docs/laraue-boards/telegram-save-command.jpg)

For a rambling message, reply with `/aisave` instead. It rewrites the text into a clean title and a bullet-point description. It runs on tokens, and every user gets a free allowance each month.

## Day to day

- **Get a card's link.** Reply to a saved message with `/info` to see the card and an **Open issue** button.
- **Update a card after an edit.** Run `/save` again on the message and the card is re-synced.
- **Find a card from any chat.** Type `@msgboard_bot` and your query. See [Searching issues from any Telegram chat](/en/documentation/integrations/telegram-inline-search).
- **Remove a card.** Reply with `/delete`, if you have the delete permission for it.

## When to save everything automatically

Auto mode turns every message in the chat into a card, and keeps the card in sync when the message is edited. Use it for a small chat that exists only for requests, not for a busy group. To change the mode, unlink the chat with `/unlink` and link it again. See [Auto vs. manual save mode](/en/documentation/integrations/telegram-save-modes).

## Start now

Open [Laraue Boards](https://boards.laraue.com), create your organization, then add [@msgboard_bot](https://t.me/msgboard_bot) to your group and send `/link`.

## Related pages

- [Linking a Telegram chat to Boards](/en/documentation/integrations/telegram-linking)
- [Auto vs. manual save mode](/en/documentation/integrations/telegram-save-modes)
- [Creating an organization and inviting your team](/en/documentation/working-in-a-team/creating-organization)
- [Permissions management](/en/documentation/working-in-a-team/permissions)
