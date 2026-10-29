<template>
  <SiteHeader />
  <main class="compare">
    <article class="article">
      <h1 class="title">{{ t('title') }}</h1>
      <p class="lead">{{ t('lead') }}</p>

      <div class="verdict">
        <section class="verdict-card">
          <h2>{{ t('forBoards') }}</h2>
          <ul>
            <li>{{ t('forBoards1') }}</li>
            <li>{{ t('forBoards2') }}</li>
            <li>{{ t('forBoards3') }}</li>
          </ul>
        </section>
        <section class="verdict-card">
          <h2>{{ t('forOther') }}</h2>
          <ul>
            <li>{{ t('forOther1') }}</li>
            <li>{{ t('forOther2') }}</li>
            <li>{{ t('forOther3') }}</li>
          </ul>
        </section>
      </div>

      <h2>{{ t('table') }}</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">{{ t('feature') }}</th>
              <th scope="col">Laraue Boards</th>
              <th scope="col">Trello</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{{ t('row1') }}</th>
              <td>{{ t('row1Boards') }}</td>
              <td>{{ t('row1Other') }}</td>
            </tr>
            <tr>
              <th scope="row">{{ t('row2') }}</th>
              <td>{{ t('row2Boards') }}</td>
              <td>{{ t('row2Other') }}</td>
            </tr>
            <tr>
              <th scope="row">{{ t('row3') }}</th>
              <td>{{ t('row3Boards') }}</td>
              <td>{{ t('row3Other') }}</td>
            </tr>
            <tr>
              <th scope="row">{{ t('row4') }}</th>
              <td>{{ t('row4Boards') }}</td>
              <td>{{ t('row4Other') }}</td>
            </tr>
            <tr>
              <th scope="row">{{ t('row5') }}</th>
              <td>{{ t('row5Boards') }}</td>
              <td>{{ t('row5Other') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="checked">
        <time datetime="2026-10-02">{{ t('checked') }}</time>
      </p>

      <h2>{{ t('section1') }}</h2>
      <p>{{ t('section1Text1') }}</p>
      <p>{{ t('section1Text2') }}</p>
      <h2>{{ t('section2') }}</h2>
      <p>{{ t('section2Text1') }}</p>
      <h2>{{ t('section3') }}</h2>
      <p>{{ t('section3Text1') }}</p>
      <h2>{{ t('section4') }}</h2>
      <p>{{ t('section4Text1') }}</p>

      <h2>{{ t('faq') }}</h2>
      <h3>{{ t('question1') }}</h3>
      <p>{{ t('answer1') }}</p>
      <h3>{{ t('question2') }}</h3>
      <p>{{ t('answer2') }}</p>

      <h2>{{ t('sources') }}</h2>
      <ul>
        <li>
          <a
            href="https://trello.com/pricing"
            rel="noopener nofollow"
            target="_blank">
            {{ t('source1') }}
          </a>
        </li>
        <li>
          <a
            href="https://support.atlassian.com/trello/docs/connect-trello-to-ai-assistants-with-trello-mcp/"
            rel="noopener nofollow"
            target="_blank">
            {{ t('source2') }}
          </a>
        </li>
        <li>
          <a
            href="https://trello.com/power-ups/65c1561e2d5a360cc8f80c6c"
            rel="noopener nofollow"
            target="_blank">
            {{ t('source3') }}
          </a>
        </li>
      </ul>

      <p class="cta">
        <NuxtLink to="/organizations">{{ t('try') }}</NuxtLink>
        ·
        <NuxtLink :to="localePath('index', locale)">{{ t('learnMore') }}</NuxtLink>
      </p>

      <h2>{{ t('related') }}</h2>
      <ul>
        <li>
          <NuxtLink :to="localePath('compare-linear', locale)">{{ t('other') }}</NuxtLink>
        </li>
      </ul>
    </article>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { useHead, useSeoMeta } from '#app'
import { NuxtLink } from '#components'
import {
  defineBreadcrumb,
  defineQuestion,
  defineWebPage,
  useLocaleHead,
  useLocalePath,
  useSchemaOrg,
} from '#imports'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import SiteFooter from '#layers/core/app/public-shell/components/SiteFooter.vue'
import SiteHeader from '#layers/core/app/public-shell/components/SiteHeader.vue'

const { locale, t } = useI18n({
  en: {
    answer1:
      'If your tasks come from Telegram chats, yes. Boards is also a kanban board, but it takes cards straight from Telegram groups and gives them statuses, an issue key and a backlog. If you need Trello’s Power-Ups and calendar or timeline views, stay with Trello.',
    answer2:
      'Trello has an official Telegram Notifications Power-Up, which sends board changes to a Telegram chat. Creating cards from Telegram messages needs a third-party automation such as Make or Zapier. In Boards, creating cards from Telegram messages is built in.',
    checked: 'Trello’s pricing and features were checked on its own site on 2 October 2026.',
    faq: 'Questions',
    feature: 'Feature',
    forBoards: 'Choose Laraue Boards if',
    forBoards1:
      'Tasks and requests arrive as messages in Telegram groups, and you want them on a board without retyping.',
    forBoards2: 'You like Trello’s simplicity but want issue keys, a backlog and statuses.',
    forBoards3: 'You want your AI agent on the same board as your team.',
    forOther: 'Choose Trello instead if',
    forOther1: 'You use Trello’s Power-Ups, automation, Custom Fields or card mirroring.',
    forOther2: 'You need calendar, timeline, table or map views.',
    forOther3:
      'You want native iOS and Android apps rather than a Mini App and a responsive web app.',
    lead: 'Trello is the classic kanban board: lists, cards, and a large library of Power-Ups. Laraue Boards is a simple board built around one habit: your team already writes its tasks in Telegram, so the cards should come from there.',
    learnMore: 'About Laraue Boards',
    other: 'Boards vs Linear',
    question1: 'Is Laraue Boards a good Trello alternative?',
    question2: 'Does Trello work with Telegram?',
    related: 'Also compare with',
    row1: 'Capture from Telegram groups',
    row1Boards:
      'Built in. Link a group chat and save messages automatically, or with /save and /aisave.',
    row1Other:
      'An official Power-Up sends Trello notifications to Telegram; creating cards from messages needs a third-party automation (Make, Zapier).',
    row2: 'MCP and AI-agent access',
    row2Boards: 'Remote MCP server with a personal API key; files can be attached and downloaded.',
    row2Other: 'Official remote MCP server on all plans (OAuth); no file uploads yet, links only.',
    row3: 'Setup',
    row3Boards:
      'Your first board exists when you log in; the first card is one message to the bot.',
    row3Other: 'Create a Workspace and a board, then add lists and cards.',
    row4: 'Pricing',
    row4Boards:
      'A free plan, free forever; paid plans are per seat. Current prices are in the pricing section of the landing page.',
    row4Other:
      'Free: $0, up to 10 collaborators and 10 boards per Workspace. Standard: $5 per user per month billed yearly ($6 monthly). Premium: $10 yearly ($12.50 monthly).',
    row5: 'Views, extensions and reporting',
    row5Boards:
      'No calendar, timeline, table or map views, no Power-Ups, no analytics, and no native mobile apps.',
    row5Other: 'Calendar, timeline, table, dashboard and map views on Premium; Power-Ups.',
    section1: 'Cards from Telegram messages',
    section1Text1:
      'A Trello card starts when someone opens Trello and types it. In Boards, the card starts where the conversation happens. Link a group chat and choose a save mode: auto mode saves every message, manual mode saves only the messages you reply to with /save or /aisave, which is better for a busy group.',
    section1Text2:
      'Trello’s official Telegram Power-Up sends notifications from a board to a chat. Going the other way, from a Telegram message to a Trello card, needs a third-party automation. Boards does it natively.',
    section2: 'Still kanban, with issue keys and a backlog',
    section2Text1:
      'Boards cards are issues: each has a key such as WRK-42, a status, an assignee, and attributes you define. There is a backlog next to the boards, and a search across all of them. It is still a kanban board, with less to configure than a full project tracker.',
    section3: 'MCP and AI agents',
    section3Text1:
      'Trello has an official MCP server too, and it works on every Trello plan. So does Boards: an agent can read and edit cards on your board over MCP, with your own permissions, and attach and download files. The Trello MCP does not support file uploads yet, only links.',
    section4: 'What Boards leaves out on purpose',
    section4Text1:
      'Boards has no calendar, timeline, table or map views, no Power-Ups and no native mobile apps (it works as a Telegram Mini App and a responsive web app). If you rely on them, Trello is the right tool.',
    seoDescription:
      'A simple Trello alternative that captures tasks from Telegram group chats. Compare Laraue Boards and Trello: Telegram capture, MCP, pricing, setup, and what Boards deliberately lacks.',
    seoTitle: 'Trello alternative with Telegram capture — Laraue Boards vs Trello',
    source1: 'Trello pricing',
    source2: 'Trello MCP',
    source3: 'Telegram Notifications Power-Up',
    sources: 'Where the Trello facts come from',
    table: 'Laraue Boards and Trello side by side',
    title: 'Boards vs Trello: simple kanban that starts in your Telegram group chats',
    try: 'Try Laraue Boards for free',
  },
  ru: {
    answer1:
      'Если задачи у вас приходят из Telegram-чатов — да. Boards тоже канбан-доска, но карточки в неё попадают прямо из Telegram-групп, а у каждой есть статус, ключ и бэклог. Если вам нужны Power-Up’ы и календарь или таймлайн, оставайтесь в Trello.',
    answer2:
      'У Trello есть официальный Power-Up Telegram Notifications: он отправляет изменения доски в Telegram-чат. Чтобы создавать карточки из сообщений Telegram, нужна сторонняя автоматизация, например Make или Zapier. В Boards создание карточек из сообщений Telegram встроено.',
    checked: 'Тарифы и возможности Trello проверены на его сайте 2 октября 2026 года.',
    faq: 'Вопросы',
    feature: 'Возможность',
    forBoards: 'Выбирайте Laraue Boards, если',
    forBoards1:
      'Задачи и просьбы приходят сообщениями в Telegram-группах, и вы хотите видеть их на доске без перепечатывания.',
    forBoards2: 'Вам нравится простота Trello, но нужны ключи задач, бэклог и статусы.',
    forBoards3: 'Вы хотите, чтобы ИИ-агент работал на той же доске, что и команда.',
    forOther: 'Выбирайте Trello, если',
    forOther1:
      'Вы пользуетесь Power-Up’ами, автоматизацией, Custom Fields или зеркалированием карточек Trello.',
    forOther2: 'Вам нужны календарь, таймлайн, таблица или карта.',
    forOther3:
      'Вам нужны нативные приложения для iOS и Android, а не Mini App и адаптивная веб-версия.',
    lead: 'Trello — классическая канбан-доска: списки, карточки и большая библиотека Power-Up’ов. Laraue Boards — простая доска, построенная вокруг одной привычки: команда уже пишет задачи в Telegram, значит, карточки должны появляться оттуда.',
    learnMore: 'О Laraue Boards',
    other: 'Boards и Linear',
    question1: 'Подойдёт ли Laraue Boards как аналог Trello?',
    question2: 'Работает ли Trello с Telegram?',
    related: 'Также сравните с',
    row1: 'Захват из Telegram-групп',
    row1Boards:
      'Встроено. Привяжите групповой чат и сохраняйте сообщения автоматически или командами /save и /aisave.',
    row1Other:
      'Официальный Power-Up отправляет уведомления Trello в Telegram; создание карточек из сообщений требует сторонней автоматизации (Make, Zapier).',
    row2: 'MCP и доступ для ИИ-агентов',
    row2Boards:
      'Удалённый MCP-сервер с персональным API-ключом; файлы можно прикреплять и скачивать.',
    row2Other:
      'Официальный удалённый MCP-сервер на всех тарифах (OAuth); загрузки файлов пока нет, только ссылки.',
    row3: 'Настройка',
    row3Boards: 'Первая доска есть сразу после входа; первая карточка — одно сообщение боту.',
    row3Other: 'Создать рабочее пространство и доску, затем добавить списки и карточки.',
    row4: 'Цены',
    row4Boards:
      'Бесплатный тариф навсегда; платные тарифы — за место. Актуальные цены — в разделе тарифов на главной.',
    row4Other:
      'Free: $0, до 10 участников и 10 досок на пространство. Standard: $5 за пользователя в месяц при оплате за год ($6 помесячно). Premium: $10 за год ($12,50 помесячно).',
    row5: 'Представления, расширения и отчётность',
    row5Boards:
      'Нет календаря, таймлайна, таблицы и карты, нет Power-Up’ов и аналитики, нет нативных мобильных приложений.',
    row5Other: 'Календарь, таймлайн, таблица, дашборд и карта на Premium; Power-Up’ы.',
    section1: 'Карточки из сообщений Telegram',
    section1Text1:
      'Карточка в Trello появляется, когда кто-то открывает Trello и вводит её. В Boards карточка рождается там, где идёт разговор. Привяжите групповой чат и выберите режим сохранения: автоматический сохраняет каждое сообщение, ручной — только те, на которые вы ответили командой /save или /aisave; для шумной группы он удобнее.',
    section1Text2:
      'Официальный Power-Up Telegram у Trello отправляет уведомления с доски в чат. В обратную сторону, из сообщения Telegram в карточку Trello, нужна сторонняя автоматизация. В Boards это работает из коробки.',
    section2: 'Всё тот же канбан, но с ключами и бэклогом',
    section2Text1:
      'Карточки Boards — это задачи: у каждой есть ключ вроде WRK-42, статус, исполнитель и ваши собственные атрибуты. Рядом с досками есть бэклог и поиск по всем доскам. Это по-прежнему канбан, только с меньшим количеством настроек, чем в полноценном трекере.',
    section3: 'MCP и ИИ-агенты',
    section3Text1:
      'У Trello тоже есть официальный MCP-сервер, он работает на всех тарифах. В Boards агент точно так же читает и редактирует карточки по MCP с вашими правами и умеет прикреплять и скачивать файлы. MCP Trello пока не поддерживает загрузку файлов, только ссылки.',
    section4: 'Чего в Boards нет намеренно',
    section4Text1:
      'В Boards намеренно нет календаря, таймлайна, табличного представления и карты, Power-Up’ов, и нативных мобильных приложений (работает Telegram Mini App и адаптивная веб-версия). Если вы на них опираетесь, Trello — правильный выбор.',
    seoDescription:
      'Простой аналог Trello с Telegram: карточки из групповых чатов. Сравнение Laraue Boards и Trello — захват из Telegram, MCP, цены, настройка и то, чего в Boards нет намеренно.',
    seoTitle: 'Аналог Trello с Telegram — сравнение Laraue Boards и Trello',
    source1: 'Тарифы Trello',
    source2: 'Trello MCP',
    source3: 'Power-Up Telegram Notifications',
    sources: 'Откуда факты о Trello',
    table: 'Laraue Boards и Trello рядом',
    title: 'Аналог Trello с Telegram: доска, карточки на которую приходят из групповых чатов',
    try: 'Попробовать Laraue Boards бесплатно',
  },
})

const localePath = useLocalePath()

// Every language is an alternate; x-default is English. Canonical, og and twitter tags, the
// preview image and the Organization node come from nuxt-seo-utils, nuxt-schema-org and the layout.
useHead(useLocaleHead())
useSeoMeta({
  description: t('seoDescription'),
  title: t('seoTitle'),
  // The title already names the product.
  titleTemplate: '%s',
})
useSchemaOrg([
  // An FAQPage collects the Questions below. Trello's pricing and features were checked on this date.
  defineWebPage({ '@type': 'FAQPage', dateModified: '2026-10-02' }),
  defineBreadcrumb({
    itemListElement: [
      { item: localePath('index', locale.value), name: 'Laraue Boards' },
      { item: localePath('compare-trello', locale.value), name: t('title') },
    ],
  }),
  defineQuestion({ acceptedAnswer: t('answer1'), name: t('question1') }),
  defineQuestion({ acceptedAnswer: t('answer2'), name: t('question2') }),
])
</script>

<style scoped>
.compare {
  margin: 0 auto;
  max-width: 980px;
  padding: 96px 24px 88px;
}

.title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.article .lead {
  color: var(--color-muted);
  font-size: 18px;
  line-height: 1.7;
  margin: 18px 0 32px;
}

.article {
  font-size: 16px;
  line-height: 1.75;
}

.article h2 {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin: 44px 0 14px;
}

.article h3 {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  margin: 20px 0 6px;
}

.article p {
  margin: 0 0 14px;
}

.article ul {
  list-style: disc;
  padding-left: 24px;
}

.article a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.verdict {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.verdict-card {
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: 12px;
  padding: 20px 22px;
}

.verdict-card h2 {
  font-size: 17px;
  margin: 0 0 10px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  font-size: 15px;
  line-height: 1.55;
  min-width: 640px;
  width: 100%;
}

th,
td {
  border: 1px solid var(--color-divider);
  padding: 12px 14px;
  text-align: left;
  vertical-align: top;
}

thead th {
  background: var(--color-surface);
}

tbody th {
  font-weight: var(--font-weight-bold);
  width: 20%;
}

.article .checked {
  color: var(--color-muted);
  font-size: 13px;
  margin-top: 10px;
}

.article .cta {
  font-weight: var(--font-weight-bold);
  margin-top: 40px;
}
</style>
