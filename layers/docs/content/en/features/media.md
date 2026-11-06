---
title: Attachments — photos, videos and documents in issues
description: How photos, videos and documents are attached to Laraue Boards issues, stored and displayed, and how much storage each plan includes. You can add images and documents (PDF, DOCX, Markdown, TXT, JSON) yourself.
keywords: [issue tracker file storage limit, extra storage add-on, telegram photo task, video attachment kanban, media in project management, photo issue tracker, telegram video task board, attach pdf to task, document attachment issue tracker]
type: documentation
project: boards
order: 3
createdAt: 2026-04-22
updatedAt: 2026-11-07
---
When you capture a Telegram message that contains photos, videos or documents, those files become part of the issue.

## Where media appears

There are no thumbnails on the board card — media is only visible once you open the issue. The detail page has an **Attachments** section below the content, showing every photo and video as a small thumbnail. Tap one to open the full image.

![The Attachments section on an issue's detail page](https://laraue.com/static/images/blog/docs/laraue-boards/issue-attachments.jpg)

From the same section you can add more files yourself — with the paperclip by the description, or by pasting directly with **Ctrl+V** — and remove any attachment with its **×**.

## What you can attach

| Kind | Formats | Size limit |
|---|---|---|
| Images | JPEG, PNG, WebP, GIF | 3 MB per file |
| Documents | PDF, Word (DOCX, DOC), Markdown, TXT, JSON | 10 MB per file |

A file's type is checked by its content, not its name: a renamed file is rejected if it isn't what it claims to be. SVG images, HEIC/AVIF photos and other formats aren't accepted — convert an iPhone photo to JPEG first.

The same list and limits apply to files sent or forwarded to the bot as documents. A file of another type, or over its limit, is skipped: the issue is saved without it (its text and other attachments are kept), and the bot tells you which file was left out and why — see [Capturing Telegram messages](/documentation/working-alone/telegram-messages#files-that-arent-saved).

Documents have no preview: they're listed under the images with an icon, their name and size. Tap one to download it — documents are never opened inside the page.

Comments can carry attachments too. Today they're added through the [MCP server](/documentation/integrations/mcp) — for example, a report or config an AI agent attaches to its comment — and shown under the comment the same way.

## How storage works

Files you attach yourself — in the web app, or through the [MCP server](/documentation/integrations/mcp) — are kept in our own file storage, together with their previews. Files from Telegram messages stay in Telegram: they're streamed from there each time you open them. So do files uploaded before our own storage was added: they're kept in a private Telegram chat of the bot.

## Storage limit

Every organization has its own storage. A file counts toward the organization it's attached in, whoever attaches it: in your personal organization it's your personal plan's storage, in a team organization it's the team plan's.

| Plan | Storage |
|---|---|
| Free (personal or team) | 100 MB |
| Plus, Team, Business | 1 GB |
| Paid plan with extra storage | 1 GB + 10 GB or + 50 GB |

What counts is each file you upload plus its preview. Files from Telegram messages don't count, and neither do the older files kept in Telegram. The same file attached twice in one organization is stored once and counts once. Deleting an attachment frees its space once no other attachment uses the same file.

You can see how much is used on **Organization profile → Plan and usage**, in the **Storage left** card.

When a file doesn't fit, it isn't attached: the message says how much is used, how much the plan gives, and how to get more. An AI agent gets the same message from the MCP server. To make room, delete attachments you no longer need, or get more storage.

### Getting more storage

Open **Plan and usage → Get more storage**. Extra storage is added to a paid plan and paid together with it, in one payment, every month: +10 GB or +50 GB (the prices are in the [pricing section](/#pricing)). Choose it in the payment window when you buy or extend a plan; to change it later, extend the plan with another option. Only the organization owner can pay.

You can't move to less storage than your files already take: the payment window says how much to delete first. If a paid plan ends while you use more than the Free plan's 100 MB, nothing is deleted — your files stay — but new files can't be attached until you delete enough or pay for the plan again.

## Media-only issues

An issue can consist entirely of media with no text — for example, a photo of something that needs fixing with no caption. These show the Attachments section with an empty content area above it.

## Access follows the issue's permissions

Media files follow the same permission model as the issue they belong to. If you don't have Read access to an issue, you can't access its attachments either.

## Related pages

- [Capturing Telegram messages](/documentation/working-alone/telegram-messages)
- [Issues — what they contain](/documentation/concepts/issues)