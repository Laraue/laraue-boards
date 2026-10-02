import type { Locale } from '~/composables/useI18n'

export type CompareSlug = 'linear' | 'trello'

export type ComparePageContent = {
  // When the competitor's pricing and features were last checked against its own site.
  checkedAt: string
  checkedLabel: string
  // The competitor's name, as the table header and in the links.
  competitor: string
  faq: { answer: string; question: string }[]
  // Who should pick which tool: the short verdict at the top of the page.
  forBoards: { items: string[]; title: string }
  forOther: { items: string[]; title: string }
  h1: string
  lead: string
  // Where the competitor's facts come from.
  seoDescription: string
  seoTitle: string
  sources: { href: string; label: string }[]
  sourcesTitle: string
  // Short paragraphs after the table, each with its own heading.
  sections: { paragraphs: string[]; title: string }[]
  table: {
    boardsHeader: string
    featureHeader: string
    rows: { boards: string; feature: string; other: string }[]
    title: string
  }
}

// The pages and where they live. Only pages that exist in a language are listed under it, so a page
// without a translation gets no hreflang pair.
export const comparePaths: Record<CompareSlug, Partial<Record<Locale, string>>> = {
  linear: { en: '/compare/linear' },
  trello: { en: '/compare/trello', ru: '/ru/compare/trello' },
}

export const compareLabels: Record<Locale, Record<CompareSlug, string>> = {
  en: { linear: 'Boards vs Linear', trello: 'Boards vs Trello' },
  ru: { linear: 'Boards и Linear', trello: 'Boards и Trello' },
}

export const relatedHeading: Record<Locale, string> = {
  en: 'Also compare with',
  ru: 'Также сравните с',
}

const checkedAt = '2026-10-02'

const linearEn: ComparePageContent = {
  checkedAt,
  checkedLabel: 'Linear’s pricing and features were checked on its own site on 2 October 2026.',
  competitor: 'Linear',
  faq: [
    {
      answer:
        'Yes, if you want a lighter tool and already live in Telegram. Boards has issues, statuses, epics, custom attributes and permissions, and every message in a linked Telegram chat can become a card. It does not have cycles, roadmaps or analytics, so a team that plans in sprints and reports on them is better off in Linear.',
      question: 'Is Laraue Boards a good Linear alternative?',
    },
    {
      answer:
        'Both. Linear has an official MCP server, and so does Boards. Boards’ remote MCP server uses a personal API key and lets an agent list, read, create, edit and move issues, comment, and attach or download files, within your own permissions. The difference is not MCP itself but what else feeds the same board: Boards also takes cards from Telegram.',
      question: 'Does Boards have MCP like Linear?',
    },
    {
      answer:
        'Not out of the box. Linear’s integrations directory lists Slack and Discord for creating issues from messages, and no Telegram integration. In Boards this is the core feature: forward a message to the bot, or link a group chat and save messages with /save.',
      question: 'Can I create Linear issues from Telegram?',
    },
  ],
  forBoards: {
    items: [
      'You or your team talk in Telegram, and tasks start there as messages.',
      'You want a board with statuses and a backlog, without a process to set up first.',
      'You want an AI agent (Claude, Cursor) to work on the same board over MCP.',
    ],
    title: 'Choose Laraue Boards if',
  },
  forOther: {
    items: [
      'You plan work in cycles and projects and want that structure built in.',
      'You need reporting and dashboards, or enterprise security such as SAML and SCIM.',
      'Your team works in Slack and wants issues created from there.',
    ],
    title: 'Choose Linear instead if',
  },
  h1: 'Boards vs Linear: a lighter issue tracker that lives in Telegram',
  lead: 'Linear is a fast, opinionated tool for product teams that plan in cycles. Laraue Boards is for a different moment: a small team or a single person whose work starts as messages in Telegram and who wants an issue board, and an AI agent on it, without the process around it.',
  sections: [
    {
      paragraphs: [
        'Linear is built around a workflow: teams, cycles and projects. That structure is the product, and it pays off when a team follows it. It also means there is more to learn and configure before the first issue is useful.',
        'Boards keeps the model small: an organization has spaces, a space has a backlog and boards, and an issue has a status, an assignee and your own attributes. You can start by sending a message to the bot, and add structure later.',
      ],
      title: 'A light model instead of a process',
    },
    {
      paragraphs: [
        'In Boards, a chat is a source of tasks. Forward a message to the bot, or link a Telegram group and reply to any message with /save: the card gets the text, photos and videos. Edit the original message and the card follows. Linear creates issues from Slack and Discord; Telegram is not in its integrations list.',
        'If you do not live in Telegram, this is not a reason to switch, and Linear’s Slack integration is likely the better fit.',
      ],
      title: 'Capture from Telegram groups',
    },
    {
      paragraphs: [
        'Linear’s official MCP server is available on its plans from Free, so MCP alone does not set Boards apart. What Boards offers is one board that both people (from Telegram) and agents (over MCP) write to: a bug is forwarded in a group chat, and your coding agent picks it up from the backlog, comments and moves it to Done.',
        'See the guide on setting up a backlog for an AI agent for the steps.',
      ],
      title: 'MCP and AI agents',
    },
    {
      paragraphs: [
        'Boards deliberately has no cycles or sprint planning, no roadmaps, no reporting or dashboards, and no calendar or timeline views. There are no SAML or SCIM features. If these matter to you, use Linear.',
      ],
      title: 'What Boards leaves out on purpose',
    },
  ],
  seoDescription:
    'Looking for a Linear alternative with Telegram and MCP? Compare Laraue Boards and Linear: Telegram capture, MCP for AI agents, setup, pricing, and what Boards deliberately lacks.',
  seoTitle: 'Linear alternative with Telegram and MCP — Laraue Boards vs Linear',
  sources: [
    { href: 'https://linear.app/pricing', label: 'Linear pricing' },
    { href: 'https://linear.app/integrations', label: 'Linear integrations' },
    { href: 'https://linear.app/docs/mcp', label: 'Linear MCP server' },
  ],
  sourcesTitle: 'Where the Linear facts come from',
  table: {
    boardsHeader: 'Laraue Boards',
    featureHeader: '',
    rows: [
      {
        boards:
          'Built in. Forward a message to the bot, or link a group chat and use /save or /aisave.',
        feature: 'Capture from Telegram groups',
        other: 'No Telegram integration in its directory (Slack and Discord are listed).',
      },
      {
        boards:
          'Remote MCP server with a personal API key: list, read, create, edit, move, comment, attachments.',
        feature: 'MCP and AI-agent access',
        other:
          'Official remote MCP server (OAuth, or an API key); the pricing page lists MCP access from the Free plan.',
      },
      {
        boards: 'Your first board exists when you log in; no workspace or team to configure first.',
        feature: 'Setup',
        other: 'A workspace with teams; cycles and projects to set up as you adopt them.',
      },
      {
        boards:
          'A free plan, free forever; paid plans are per seat. Current prices are in the pricing section of the landing page.',
        feature: 'Pricing',
        other:
          'Free: $0, 250 issues, 2 teams. Basic: $10 per user per month billed yearly. Business: $16 per user per month billed yearly. Enterprise: custom.',
      },
      {
        boards: 'No cycles, roadmaps, analytics or dashboards, and no SAML or SCIM.',
        feature: 'Heavy project management and reporting',
        other: 'Cycles and projects; Insights and dashboards on Business and above.',
      },
    ],
    title: 'Laraue Boards and Linear side by side',
  },
}

const trelloEn: ComparePageContent = {
  checkedAt,
  checkedLabel: 'Trello’s pricing and features were checked on its own site on 2 October 2026.',
  competitor: 'Trello',
  faq: [
    {
      answer:
        'If your tasks come from Telegram chats, yes. Boards is also a kanban board, but it takes cards straight from Telegram groups and gives them statuses, an issue key and a backlog. If you need Trello’s Power-Ups and calendar or timeline views, stay with Trello.',
      question: 'Is Laraue Boards a good Trello alternative?',
    },
    {
      answer:
        'Trello has an official Telegram Notifications Power-Up, which sends board changes to a Telegram chat. Creating cards from Telegram messages needs a third-party automation such as Make or Zapier. In Boards, creating cards from Telegram messages is built in.',
      question: 'Does Trello work with Telegram?',
    },
  ],
  forBoards: {
    items: [
      'Tasks and requests arrive as messages in Telegram groups, and you want them on a board without retyping.',
      'You like Trello’s simplicity but want issue keys, a backlog and statuses.',
      'You want your AI agent on the same board as your team.',
    ],
    title: 'Choose Laraue Boards if',
  },
  forOther: {
    items: [
      'You use Trello’s Power-Ups, automation, Custom Fields or card mirroring.',
      'You need calendar, timeline, table or map views.',
      'You want native iOS and Android apps rather than a Mini App and a responsive web app.',
    ],
    title: 'Choose Trello instead if',
  },
  h1: 'Boards vs Trello: simple kanban that starts in your Telegram group chats',
  lead: 'Trello is the classic kanban board: lists, cards, and a large library of Power-Ups. Laraue Boards is a simple board built around one habit: your team already writes its tasks in Telegram, so the cards should come from there.',
  sections: [
    {
      paragraphs: [
        'A Trello card starts when someone opens Trello and types it. In Boards, the card starts where the conversation happens. Link a group chat and choose a save mode: auto mode saves every message, manual mode saves only the messages you reply to with /save or /aisave, which is better for a busy group.',
        'Trello’s official Telegram Power-Up sends notifications from a board to a chat. Going the other way, from a Telegram message to a Trello card, needs a third-party automation. Boards does it natively.',
      ],
      title: 'Cards from Telegram messages',
    },
    {
      paragraphs: [
        'Boards cards are issues: each has a key such as WRK-42, a status, an assignee, and attributes you define. There is a backlog next to the boards, and a search across all of them. It is still a kanban board, with less to configure than a full project tracker.',
      ],
      title: 'Still kanban, with issue keys and a backlog',
    },
    {
      paragraphs: [
        'Trello has an official MCP server too, and it works on every Trello plan. So does Boards: an agent can read and edit cards on your board over MCP, with your own permissions, and attach and download files. The Trello MCP does not support file uploads yet, only links.',
      ],
      title: 'MCP and AI agents',
    },
    {
      paragraphs: [
        'Boards has no calendar, timeline, table or map views, no Power-Ups and no native mobile apps (it works as a Telegram Mini App and a responsive web app). If you rely on them, Trello is the right tool.',
      ],
      title: 'What Boards leaves out on purpose',
    },
  ],
  seoDescription:
    'A simple Trello alternative that captures tasks from Telegram group chats. Compare Laraue Boards and Trello: Telegram capture, MCP, pricing, setup, and what Boards deliberately lacks.',
  seoTitle: 'Trello alternative with Telegram capture — Laraue Boards vs Trello',
  sources: [
    { href: 'https://trello.com/pricing', label: 'Trello pricing' },
    {
      href: 'https://support.atlassian.com/trello/docs/connect-trello-to-ai-assistants-with-trello-mcp/',
      label: 'Trello MCP',
    },
    {
      href: 'https://trello.com/power-ups/65c1561e2d5a360cc8f80c6c',
      label: 'Telegram Notifications Power-Up',
    },
  ],
  sourcesTitle: 'Where the Trello facts come from',
  table: {
    boardsHeader: 'Laraue Boards',
    featureHeader: '',
    rows: [
      {
        boards:
          'Built in. Link a group chat and save messages automatically, or with /save and /aisave.',
        feature: 'Capture from Telegram groups',
        other:
          'An official Power-Up sends Trello notifications to Telegram; creating cards from messages needs a third-party automation (Make, Zapier).',
      },
      {
        boards: 'Remote MCP server with a personal API key; files can be attached and downloaded.',
        feature: 'MCP and AI-agent access',
        other: 'Official remote MCP server on all plans (OAuth); no file uploads yet, links only.',
      },
      {
        boards:
          'Your first board exists when you log in; the first card is one message to the bot.',
        feature: 'Setup',
        other: 'Create a Workspace and a board, then add lists and cards.',
      },
      {
        boards:
          'A free plan, free forever; paid plans are per seat. Current prices are in the pricing section of the landing page.',
        feature: 'Pricing',
        other:
          'Free: $0, up to 10 collaborators and 10 boards per Workspace. Standard: $5 per user per month billed yearly ($6 monthly). Premium: $10 yearly ($12.50 monthly).',
      },
      {
        boards:
          'No calendar, timeline, table or map views, no Power-Ups, no analytics, and no native mobile apps.',
        feature: 'Views, extensions and reporting',
        other: 'Calendar, timeline, table, dashboard and map views on Premium; Power-Ups.',
      },
    ],
    title: 'Laraue Boards and Trello side by side',
  },
}

const trelloRu: ComparePageContent = {
  checkedAt,
  checkedLabel: 'Тарифы и возможности Trello проверены на его сайте 2 октября 2026 года.',
  competitor: 'Trello',
  faq: [
    {
      answer:
        'Если задачи у вас приходят из Telegram-чатов — да. Boards тоже канбан-доска, но карточки в неё попадают прямо из Telegram-групп, а у каждой есть статус, ключ и бэклог. Если вам нужны Power-Up’ы и календарь или таймлайн, оставайтесь в Trello.',
      question: 'Подойдёт ли Laraue Boards как аналог Trello?',
    },
    {
      answer:
        'У Trello есть официальный Power-Up Telegram Notifications: он отправляет изменения доски в Telegram-чат. Чтобы создавать карточки из сообщений Telegram, нужна сторонняя автоматизация, например Make или Zapier. В Boards создание карточек из сообщений Telegram встроено.',
      question: 'Работает ли Trello с Telegram?',
    },
  ],
  forBoards: {
    items: [
      'Задачи и просьбы приходят сообщениями в Telegram-группах, и вы хотите видеть их на доске без перепечатывания.',
      'Вам нравится простота Trello, но нужны ключи задач, бэклог и статусы.',
      'Вы хотите, чтобы ИИ-агент работал на той же доске, что и команда.',
    ],
    title: 'Выбирайте Laraue Boards, если',
  },
  forOther: {
    items: [
      'Вы пользуетесь Power-Up’ами, автоматизацией, Custom Fields или зеркалированием карточек Trello.',
      'Вам нужны календарь, таймлайн, таблица или карта.',
      'Вам нужны нативные приложения для iOS и Android, а не Mini App и адаптивная веб-версия.',
    ],
    title: 'Выбирайте Trello, если',
  },
  h1: 'Аналог Trello с Telegram: доска, карточки на которую приходят из групповых чатов',
  lead: 'Trello — классическая канбан-доска: списки, карточки и большая библиотека Power-Up’ов. Laraue Boards — простая доска, построенная вокруг одной привычки: команда уже пишет задачи в Telegram, значит, карточки должны появляться оттуда.',
  sections: [
    {
      paragraphs: [
        'Карточка в Trello появляется, когда кто-то открывает Trello и вводит её. В Boards карточка рождается там, где идёт разговор. Привяжите групповой чат и выберите режим сохранения: автоматический сохраняет каждое сообщение, ручной — только те, на которые вы ответили командой /save или /aisave; для шумной группы он удобнее.',
        'Официальный Power-Up Telegram у Trello отправляет уведомления с доски в чат. В обратную сторону, из сообщения Telegram в карточку Trello, нужна сторонняя автоматизация. В Boards это работает из коробки.',
      ],
      title: 'Карточки из сообщений Telegram',
    },
    {
      paragraphs: [
        'Карточки Boards — это задачи: у каждой есть ключ вроде WRK-42, статус, исполнитель и ваши собственные атрибуты. Рядом с досками есть бэклог и поиск по всем доскам. Это по-прежнему канбан, только с меньшим количеством настроек, чем в полноценном трекере.',
      ],
      title: 'Всё тот же канбан, но с ключами и бэклогом',
    },
    {
      paragraphs: [
        'У Trello тоже есть официальный MCP-сервер, он работает на всех тарифах. В Boards агент точно так же читает и редактирует карточки по MCP с вашими правами и умеет прикреплять и скачивать файлы. MCP Trello пока не поддерживает загрузку файлов, только ссылки.',
      ],
      title: 'MCP и ИИ-агенты',
    },
    {
      paragraphs: [
        'В Boards намеренно нет календаря, таймлайна, табличного представления и карты, Power-Up’ов, и нативных мобильных приложений (работает Telegram Mini App и адаптивная веб-версия). Если вы на них опираетесь, Trello — правильный выбор.',
      ],
      title: 'Чего в Boards нет намеренно',
    },
  ],
  seoDescription:
    'Простой аналог Trello с Telegram: карточки из групповых чатов. Сравнение Laraue Boards и Trello — захват из Telegram, MCP, цены, настройка и то, чего в Boards нет намеренно.',
  seoTitle: 'Аналог Trello с Telegram — сравнение Laraue Boards и Trello',
  sources: [
    { href: 'https://trello.com/pricing', label: 'Тарифы Trello' },
    {
      href: 'https://support.atlassian.com/trello/docs/connect-trello-to-ai-assistants-with-trello-mcp/',
      label: 'Trello MCP',
    },
    {
      href: 'https://trello.com/power-ups/65c1561e2d5a360cc8f80c6c',
      label: 'Power-Up Telegram Notifications',
    },
  ],
  sourcesTitle: 'Откуда факты о Trello',
  table: {
    boardsHeader: 'Laraue Boards',
    featureHeader: '',
    rows: [
      {
        boards:
          'Встроено. Привяжите групповой чат и сохраняйте сообщения автоматически или командами /save и /aisave.',
        feature: 'Захват из Telegram-групп',
        other:
          'Официальный Power-Up отправляет уведомления Trello в Telegram; создание карточек из сообщений требует сторонней автоматизации (Make, Zapier).',
      },
      {
        boards:
          'Удалённый MCP-сервер с персональным API-ключом; файлы можно прикреплять и скачивать.',
        feature: 'MCP и доступ для ИИ-агентов',
        other:
          'Официальный удалённый MCP-сервер на всех тарифах (OAuth); загрузки файлов пока нет, только ссылки.',
      },
      {
        boards: 'Первая доска есть сразу после входа; первая карточка — одно сообщение боту.',
        feature: 'Настройка',
        other: 'Создать рабочее пространство и доску, затем добавить списки и карточки.',
      },
      {
        boards:
          'Бесплатный тариф навсегда; платные тарифы — за место. Актуальные цены — в разделе тарифов на главной.',
        feature: 'Цены',
        other:
          'Free: $0, до 10 участников и 10 досок на пространство. Standard: $5 за пользователя в месяц при оплате за год ($6 помесячно). Premium: $10 за год ($12,50 помесячно).',
      },
      {
        boards:
          'Нет календаря, таймлайна, таблицы и карты, нет Power-Up’ов и аналитики, нет нативных мобильных приложений.',
        feature: 'Представления, расширения и отчётность',
        other: 'Календарь, таймлайн, таблица, дашборд и карта на Premium; Power-Up’ы.',
      },
    ],
    title: 'Laraue Boards и Trello рядом',
  },
}

const content: Record<CompareSlug, Partial<Record<Locale, ComparePageContent>>> = {
  linear: { en: linearEn },
  trello: { en: trelloEn, ru: trelloRu },
}

export const compareContent = (slug: CompareSlug, locale: Locale): ComparePageContent | undefined =>
  content[slug][locale]
