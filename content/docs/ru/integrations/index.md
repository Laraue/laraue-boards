---
title: Интеграции — подключение Laraue Boards к вашим инструментам
description: Как Laraue Boards работает с Telegram — в виде Mini App и бота — и с ИИ-агентами вроде Claude через MCP. Вход через Telegram, привязка групповых чатов, режимы сохранения, inline-поиск, API-ключи и работа с приложением прямо в Telegram.
keywords: [интеграция telegram mini app, telegram бот управление проектами, telegram веб-приложение инструменты, интеграция telegram kanban, telegram бот групповой чат, mcp сервер boards, claude mcp коннектор]
type: sectionDefinition
order: 6
createdAt: 2026-04-22
updatedAt: 2026-10-28
---
Laraue Boards построен вокруг Telegram и подключается к ИИ-агентам вроде Claude. В этом разделе — как устроена каждая интеграция и как извлечь из неё максимум.

## В этом разделе

- [Telegram Mini App](/ru/documentation/integrations/telegram-mini-app) — Laraue Boards прямо в Telegram: автоматический вход, сохранение сообщений из любого чата и интерфейс, рассчитанный на телефон.

- [Привязка чата Telegram к Boards](/ru/documentation/integrations/telegram-linking) — направьте любой чат, личный или групповой, в организацию, пространство, эпик и статус командой `/link`.

- [Автоматический и ручной режимы сохранения](/ru/documentation/integrations/telegram-save-modes) — выберите, будут ли сообщения в привязанном чате становиться issues автоматически или только по команде `/save`.

- [Поиск issues из любого чата Telegram](/ru/documentation/integrations/telegram-inline-search) — находите issues откуда угодно запросом `@msgboard_bot запрос`, с фильтрами или по произвольному тексту.

- [API-ключи](/ru/documentation/integrations/api-keys) — создайте долгосрочный ключ, чтобы скрипты, CI или ИИ-агенты могли действовать от вашего имени.

- [Подключение Claude и других ИИ-агентов через MCP](/ru/documentation/integrations/mcp) — просматривайте, создавайте, редактируйте и удаляйте issues и комментируйте их прямо из Claude.

- [Передача issues ИИ-агенту](/ru/documentation/integrations/agent-hand-off) — передайте issue своему агенту для разработки: он берёт issue, выполняет работу и переводит его на проверку, а пока агент работает, issue нельзя изменить.
