---
title: Attachments — photos, videos and documents in issues
description: How photos, videos and documents are attached to Laraue Boards issues, stored and displayed. Originals stream from Telegram; you can add images and documents (PDF, DOCX, Markdown, TXT, JSON) yourself.
keywords: [telegram photo task, video attachment kanban, media in project management, photo issue tracker, telegram video task board, attach pdf to task, document attachment issue tracker]
type: documentation
project: boards
order: 3
createdAt: 2026-04-22
updatedAt: 2026-10-23
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

Original files are not stored on Laraue Boards — they're streamed from Telegram each time you open them, in their original quality. Preview thumbnails are cached on our server, so the small previews load quickly without hitting Telegram every time.

This is also true for images and documents you add yourself through the interface, not just ones forwarded from a chat. When you upload a file directly, our bot actually sends it into a private chat that only the bot can access — that's where it's stored, the same way as any other file from Telegram. This is why attachment storage stays free.

We're planning to add the option to store files directly on our own servers, for people who don't want to depend on Telegram as storage. That option will be paid, since it's a real storage cost on our side rather than Telegram's.

## Media-only issues

An issue can consist entirely of media with no text — for example, a photo of something that needs fixing with no caption. These show the Attachments section with an empty content area above it.

## Access follows the issue's permissions

Media files follow the same permission model as the issue they belong to. If you don't have Read access to an issue, you can't access its attachments either.

## Related pages

- [Capturing Telegram messages](/documentation/working-alone/telegram-messages)
- [Issues — what they contain](/documentation/concepts/issues)