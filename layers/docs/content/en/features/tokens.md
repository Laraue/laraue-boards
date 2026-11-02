---
title: Tokens — how AI features are paid for
description: What tokens are in Laraue Boards, which features spend them, how many you get on the Free and paid plans, and what happens when they run out.
keywords: [laraue boards tokens, ai tokens task board, aisave tokens, ai credits pricing, token pack]
type: documentation
project: boards
order: 10
createdAt: 2026-11-01
updatedAt: 2026-11-01
---
Tokens pay for the AI features of Laraue Boards. Everything else — boards, issues, saving messages with `/save` or by forwarding them — does not use tokens.

## What spends tokens

- [`/aisave`](/documentation/integrations/telegram-save-modes) in Telegram, which saves a message with an AI-cleaned title and description.
- **Improve with AI** on an issue's description or a comment in the web app.
- Creating an issue in the web app with an empty title, so the AI writes the title.

A token is a piece of text, the way AI models count it: a word is usually one or two tokens. Each AI call spends the tokens of the text sent to the model and of the text it writes back, so a long message costs more than a short one. Before a call, Boards sets aside enough tokens for the longest possible answer; after it, you are charged only what the model actually used, and if the call fails, nothing is charged.

## How many tokens you get

- **Free plan** — 25,000 tokens a month, for an account and for each team organization on the Free plan. The allowance is reset each month: unused tokens do not carry over.
- **Paid plans** — each plan includes more tokens; the [pricing section](/#pricing) lists how many. On team plans, tokens are per seat, combined into one balance for the whole organization.

Whose tokens are spent depends on where you work: in your personal organization, the tokens of your personal plan; in a team organization, the organization's shared tokens.

## Buying more

When the plan's tokens are not enough, buy a token pack: open **Organization profile → Plan and usage → Buy tokens**. A pack tops up the balance once, and its tokens are spent only after the plan's tokens run out. Some packs are valid for a number of months, others never expire. In a team organization, only the owner can pay for tokens.

## Seeing the balance

**Organization profile → Plan and usage** shows the tokens left, how many of the plan's tokens are used, and when they reset. **Transactions** lists every grant, purchase and spend.

## When tokens run out

AI features stop working until the balance is topped up or reset: `/aisave` replies with a notice instead of saving, and the web app shows an error instead of the AI result. Saving with `/save`, forwarding messages and creating issues with a title keep working.
