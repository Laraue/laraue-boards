---
title: Capturing Telegram messages — text, images, video and documents
description: How to capture any Telegram message as an issue in Laraue Boards. Supports text messages, photos, videos, documents and mixed media. Forward to the bot or capture directly from chats.
keywords: [forward telegram message task, save telegram message, telegram message to kanban, capture telegram photo task, telegram bot forward task, save telegram document to task]
type: documentation
project: boards
order: 3
createdAt: 2026-04-22
updatedAt: 2026-10-29
---
The core idea behind Laraue Boards is that work is already happening in Telegram. A client request, a bug report, a photo of something that needs fixing — these are all issues, they just haven't been structured yet. Laraue Boards captures them directly.

## Forwarding a message to the bot

The simplest way to capture a message:

1. Long-press any message in any Telegram chat
2. Tap **Forward**
3. Choose **@msgboard_bot** as the recipient
4. The message becomes an issue on your default board immediately

![A forwarded message in Telegram with the bot's reaction confirming it was saved](https://laraue.com/static/images/blog/docs/laraue-boards/message-board-bot-processed-message.jpg)

This works for text messages, photos, videos, documents, and albums.

## What gets captured

When you forward a message, Laraue Boards saves:

- The **text content** of the message (up to 4096 characters)
- **Photos** and **videos** — shown as thumbnails on the issue page, fetched from Telegram in original quality when you open them
- **Documents** — PDF, Word (DOCX, DOC), Markdown, TXT and JSON files, and images sent as a file, attached to the issue for download (see [Attachments](/en/documentation/features/media#what-you-can-attach) for formats and limits)
- **Sender name** — shown, with the time, in the issue preview the bot sends in Telegram (`/save`, `/info`, inline search)
- **Timestamp** — when the original message was sent

What is not captured: reactions, replies, forwarded-from attribution chains, voice message transcriptions, and files of other types.

## Files that aren't saved

A document of a type that isn't supported (an archive, a spreadsheet, an executable…), or one over its size limit, is skipped. The rest of the message — its text and any supported attachments — is still saved, and the bot tells you which file was left out and why:

- **`/save` and `/aisave`** always mention skipped files in their reply.
- In a chat that **saves every message**, the bot only replies when the skipped file was all the message had — no issue is created then. If the message also had text or other attachments, the issue is saved without the file and nothing is said.
- **Edits** never produce a notice: replacing a document with an unsupported one removes it from the issue quietly.

## Attachments on the issue

There are no thumbnails on the board card — media only shows up once you open the issue. The detail page has an **Attachments** section below the content, showing every photo and video as a small thumbnail. Tap one to open the full image.

![The Attachments section on an issue's detail page](https://laraue.com/static/images/blog/docs/laraue-boards/issue-attachments.jpg)

From here you can also add more images yourself — with **Attach files** (the paperclip), or paste one directly with **Ctrl+V** — and remove any attachment with the **×** on its thumbnail.

## Where the issue came from

An issue created from Telegram has a **Created via** row in the sidebar of its page, next to **Created**: the Telegram icon and the name of the chat it came from.

When Telegram can open the message, the row ends with a link icon (↗) that opens it. Whether there is one depends on the chat:

- **Public group** (it has an @username) — the link opens the message for anyone.
- **Private group** — the link opens the message only for members of the group; everyone else gets an error from Telegram.
- **Small group** (a basic group, not upgraded to a supergroup) — no link: Telegram has no links to messages there.
- **Your private chat with the bot**, including messages you forward to it — shown as **private chat with the bot**, with no link.

Everyone who can see the issue sees the same row and link; Boards can't tell whether you're a member of the chat.

When Telegram upgrades a small group to a supergroup (for example, when a group gets an @username or a lot of members), messages are numbered anew. Issues saved before the upgrade keep the **Created via** row but have no link; issues saved after it link to their messages as usual.

## Text-only issues

A message does not need text to become an issue. A photo with no caption becomes a media-only issue — the issue page shows the thumbnails with an empty description, and its title is generated from the kind of media, the time and the chat, like `image-20260930-101500-Chat name`. A document with no caption takes its file name as the title, like `contract.pdf`.

## Manually created issues

Issues created by tapping **+ Add issue** are not linked to any Telegram message. They have the same fields (content, status, attributes) but no sender or media from Telegram; their **Created via** row shows the web app.

## Related pages

- [Issues — what they are](/en/documentation/concepts/issues)
- [The Backlog](/en/documentation/working-alone/backlog)
- [Save links and ideas from Telegram — and find them later](/en/documentation/use-cases/save-links-and-ideas-from-telegram)