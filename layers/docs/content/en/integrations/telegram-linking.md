---
title: Linking a Telegram chat to Boards
description: Point any Telegram chat — your private chat with the bot or a group — at an organization, space, epic, and status with /link, or let it ask where each message goes. /link in a linked chat shows its settings.
keywords: [telegram link chat to board, telegram bot /link command, telegram private chat linking, telegram group chat linking, telegram bot destination]
type: documentation
project: boards
order: 3
createdAt: 2026-08-19
updatedAt: 2026-11-19
---
A message sent to the `@msgboard_bot` bot initially lands in the Backlog of your personal organization's first space (`Default Space`, unless you renamed it). **Linking** lets you change this behavior by choosing the board that messages from this chat will be sent to.

Linking works both in team and personal modes. Any chat can be linked — your own private 1:1 with the bot, a group, or a supergroup — with any organization you have permission for.

## Linking a chat with /link

Send `/link` in the chat to start.

![Sending /link in a Telegram chat to start linking it](https://laraue.com/static/images/blog/docs/laraue-boards/link-chat-link-command.jpg)

In a group or supergroup, only a Telegram **chat admin** can run `/link` (or `/unlink`) — anyone else gets a "User should be group admin" message. Your private chat with the bot has no separate admin concept, so this check doesn't apply there.

The bot then walks you through several steps to create the link:

1. **Organization** — only organizations where you hold the *Link Telegram chats* admin permission are offered. If none qualify, the bot tells you so and stops.
2. **Space** — any space you can read within that organization.

   ![Choosing a space during the /link flow, with the button to ask for the space each time](https://laraue.com/static/images/blog/docs/laraue-boards/link-chat-choose-space.jpg)

3. **Epic** — every epic in the space, or the backlog. Picking the backlog skips the status step.

   ![Choosing an epic during the /link flow](https://laraue.com/static/images/blog/docs/laraue-boards/link-chat-choose-epic.jpg)

4. **Status** — every column in the epic you picked (skipped for the backlog).

   ![Choosing a status during the /link flow, with the button to ask for the status each time](https://laraue.com/static/images/blog/docs/laraue-boards/link-chat-choose-status.jpg)

5. **Save mode** — whether every message is saved or only the ones you `/save`: see [Auto vs. manual save mode](/documentation/integrations/telegram-save-modes).

   ![Choosing a save mode during /link](https://laraue.com/static/images/blog/docs/laraue-boards/link-chat-choose-save-mode.jpg)

6. **Confirmation** — whether the bot replies with a link to each new card or just puts 👍 on the message: see [How the bot confirms](/documentation/integrations/telegram-chat-settings#reply-mode).

   ![Choosing how the bot confirms a saved message, the last step of /link](https://laraue.com/static/images/blog/docs/laraue-boards/link-chat-choose-reply-mode.jpg)

The space, epic and status steps each have a **❓ Ask for the space / epic / status each time** button. It ends the destination there: the chat keeps only what you've picked so far, and the rest is chosen for each message — see [Where to save](/documentation/integrations/telegram-chat-settings#destination).

A **Back** button returns to the previous step, and **Cancel** aborts at any point.

Once you choose how to confirm, the bot links the chat and shows the destination as a breadcrumb — `Organization → Space → Epic → Status`, or e.g. `Organization → Space → ❓ chosen each time` — along with a one-line explanation of what the chosen save mode does.

![The linked chat, showing the destination breadcrumb and chosen save mode](https://laraue.com/static/images/blog/docs/laraue-boards/link-chat-linked.jpg)

A chat can only have one active link at a time. Running `/link` again on an already-linked chat shows its settings instead of starting over — where it saves, how, and how the bot confirms — with buttons to change each of them, change the destination, or unlink: see [Changing settings](/documentation/integrations/telegram-chat-settings#changing-settings).

![The /link menu in an already-linked chat: its settings and the buttons to change them](https://laraue.com/static/images/blog/docs/laraue-boards/telegram-chat-settings-menu.jpg)

## Unlinking

Send `/unlink` (same admin requirement as `/link`), or tap **Unlink** from the already-linked menu. Unlinking works as a soft delete.

## Who can link a chat

Being able to link a chat is its own admin permission, separate from being able to save issues in it. Only organizations where you hold the *Link Telegram chats* administrative permission appear in the `/link` picker. The organization owner holds it; an admin who manages permissions can grant it to other members on their permissions page, in the **Administration** block — see [Permissions management](/documentation/working-in-a-team/permissions).

## Related pages

- [Telegram chat settings](/documentation/integrations/telegram-chat-settings) — when, where and how messages are saved, with use cases
- [Auto vs. manual save mode](/documentation/integrations/telegram-save-modes) — what happens to messages once a chat is linked
- [Searching issues from any Telegram chat](/documentation/integrations/telegram-inline-search)
- [Permissions management](/documentation/working-in-a-team/permissions)
- [Turn a Telegram group chat into a team task board](/documentation/use-cases/telegram-group-chat-task-board) — a start-to-finish guide
