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
              <th scope="col">Linear</th>
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
      <p>{{ t('section2Text2') }}</p>
      <h2>{{ t('section3') }}</h2>
      <p>{{ t('section3Text1') }}</p>
      <p>{{ t('section3Text2') }}</p>
      <h2>{{ t('section4') }}</h2>
      <p>{{ t('section4Text1') }}</p>

      <h2>{{ t('faq') }}</h2>
      <h3>{{ t('question1') }}</h3>
      <p>{{ t('answer1') }}</p>
      <h3>{{ t('question2') }}</h3>
      <p>{{ t('answer2') }}</p>
      <h3>{{ t('question3') }}</h3>
      <p>{{ t('answer3') }}</p>

      <h2>{{ t('sources') }}</h2>
      <ul>
        <li>
          <a
            href="https://linear.app/pricing"
            rel="noopener nofollow"
            target="_blank">
            {{ t('source1') }}
          </a>
        </li>
        <li>
          <a
            href="https://linear.app/integrations"
            rel="noopener nofollow"
            target="_blank">
            {{ t('source2') }}
          </a>
        </li>
        <li>
          <a
            href="https://linear.app/docs/mcp"
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
          <NuxtLink :to="localePath('compare-trello', locale)">{{ t('other') }}</NuxtLink>
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
      'Yes, if you want a lighter tool and already live in Telegram. Boards has issues, statuses, epics, custom attributes and permissions, and every message in a linked Telegram chat can become a card. It does not have cycles, roadmaps or analytics, so a team that plans in sprints and reports on them is better off in Linear.',
    answer2:
      'Both. Linear has an official MCP server, and so does Boards. Boards’ remote MCP server uses a personal API key and lets an agent list, read, create, edit and move issues, comment, and attach or download files, within your own permissions. The difference is not MCP itself but what else feeds the same board: Boards also takes cards from Telegram.',
    answer3:
      'Not out of the box. Linear’s integrations directory lists Slack and Discord for creating issues from messages, and no Telegram integration. In Boards this is the core feature: forward a message to the bot, or link a group chat and save messages with /save.',
    checked: 'Linear’s pricing and features were checked on its own site on 2 October 2026.',
    faq: 'Questions',
    feature: 'Feature',
    forBoards: 'Choose Laraue Boards if',
    forBoards1: 'You or your team talk in Telegram, and tasks start there as messages.',
    forBoards2: 'You want a board with statuses and a backlog, without a process to set up first.',
    forBoards3: 'You want an AI agent (Claude, Cursor) to work on the same board over MCP.',
    forOther: 'Choose Linear instead if',
    forOther1: 'You plan work in cycles and projects and want that structure built in.',
    forOther2: 'You need reporting and dashboards, or enterprise security such as SAML and SCIM.',
    forOther3: 'Your team works in Slack and wants issues created from there.',
    lead: 'Linear is a fast, opinionated tool for product teams that plan in cycles. Laraue Boards is for a different moment: a small team or a single person whose work starts as messages in Telegram and who wants an issue board, and an AI agent on it, without the process around it.',
    learnMore: 'About Laraue Boards',
    other: 'Boards vs Trello',
    question1: 'Is Laraue Boards a good Linear alternative?',
    question2: 'Does Boards have MCP like Linear?',
    question3: 'Can I create Linear issues from Telegram?',
    related: 'Also compare with',
    row1: 'Capture from Telegram groups',
    row1Boards:
      'Built in. Forward a message to the bot, or link a group chat and use /save or /aisave.',
    row1Other: 'No Telegram integration in its directory (Slack and Discord are listed).',
    row2: 'MCP and AI-agent access',
    row2Boards:
      'Remote MCP server with a personal API key: list, read, create, edit, move, comment, attachments.',
    row2Other:
      'Official remote MCP server (OAuth, or an API key); the pricing page lists MCP access from the Free plan.',
    row3: 'Setup',
    row3Boards: 'Your first board exists when you log in; no workspace or team to configure first.',
    row3Other: 'A workspace with teams; cycles and projects to set up as you adopt them.',
    row4: 'Pricing',
    row4Boards:
      'A free plan, free forever; paid plans are per seat. Current prices are in the pricing section of the landing page.',
    row4Other:
      'Free: $0, 250 issues, 2 teams. Basic: $10 per user per month billed yearly. Business: $16 per user per month billed yearly. Enterprise: custom.',
    row5: 'Heavy project management and reporting',
    row5Boards: 'No cycles, roadmaps, analytics or dashboards, and no SAML or SCIM.',
    row5Other: 'Cycles and projects; Insights and dashboards on Business and above.',
    section1: 'A light model instead of a process',
    section1Text1:
      'Linear is built around a workflow: teams, cycles and projects. That structure is the product, and it pays off when a team follows it. It also means there is more to learn and configure before the first issue is useful.',
    section1Text2:
      'Boards keeps the model small: an organization has spaces, a space has a backlog and boards, and an issue has a status, an assignee and your own attributes. You can start by sending a message to the bot, and add structure later.',
    section2: 'Capture from Telegram groups',
    section2Text1:
      'In Boards, a chat is a source of tasks. Forward a message to the bot, or link a Telegram group and reply to any message with /save: the card gets the text, photos and videos. Edit the original message and the card follows. Linear creates issues from Slack and Discord; Telegram is not in its integrations list.',
    section2Text2:
      'If you do not live in Telegram, this is not a reason to switch, and Linear’s Slack integration is likely the better fit.',
    section3: 'MCP and AI agents',
    section3Text1:
      'Linear’s official MCP server is available on its plans from Free, so MCP alone does not set Boards apart. What Boards offers is one board that both people (from Telegram) and agents (over MCP) write to: a bug is forwarded in a group chat, and your coding agent picks it up from the backlog, comments and moves it to Done.',
    section3Text2: 'See the guide on setting up a backlog for an AI agent for the steps.',
    section4: 'What Boards leaves out on purpose',
    section4Text1:
      'Boards deliberately has no cycles or sprint planning, no roadmaps, no reporting or dashboards, and no calendar or timeline views. There are no SAML or SCIM features. If these matter to you, use Linear.',
    seoDescription:
      'Looking for a Linear alternative with Telegram and MCP? Compare Laraue Boards and Linear: Telegram capture, MCP for AI agents, setup, pricing, and what Boards deliberately lacks.',
    seoTitle: 'Linear alternative with Telegram and MCP — Laraue Boards vs Linear',
    source1: 'Linear pricing',
    source2: 'Linear integrations',
    source3: 'Linear MCP server',
    sources: 'Where the Linear facts come from',
    table: 'Laraue Boards and Linear side by side',
    title: 'Boards vs Linear: a lighter issue tracker that lives in Telegram',
    try: 'Try Laraue Boards for free',
  },
  ru: {
    answer1:
      'Да, если вам нужен инструмент полегче и вы и так живёте в Telegram. В Boards есть задачи, статусы, эпики, свои атрибуты и права доступа, а любое сообщение из привязанного Telegram-чата может стать карточкой. Циклов, роадмапов и аналитики в Boards нет, поэтому команде, которая планирует спринтами и отчитывается по ним, лучше остаться в Linear.',
    answer2:
      'Есть у обоих. У Linear есть официальный MCP-сервер, у Boards тоже. Удалённый MCP-сервер Boards работает с персональным API-ключом и позволяет агенту в пределах ваших прав искать, читать, создавать, редактировать и перемещать задачи, комментировать, прикреплять и скачивать файлы. Разница не в самом MCP, а в том, что ещё попадает на ту же доску: Boards принимает карточки и из Telegram.',
    answer3:
      'Из коробки — нет. В каталоге интеграций Linear для создания задач из сообщений есть Slack и Discord, а интеграции с Telegram нет. В Boards это главная функция: перешлите сообщение боту или привяжите групповой чат и сохраняйте сообщения командой /save.',
    checked: 'Тарифы и возможности Linear проверены на его сайте 2 октября 2026 года.',
    faq: 'Вопросы',
    feature: 'Возможность',
    forBoards: 'Выбирайте Laraue Boards, если',
    forBoards1:
      'Вы или ваша команда общаетесь в Telegram, и задачи появляются там в виде сообщений.',
    forBoards2:
      'Вам нужна доска со статусами и бэклогом без процесса, который сначала надо настроить.',
    forBoards3: 'Вы хотите, чтобы ИИ-агент (Claude, Cursor) работал на той же доске по MCP.',
    forOther: 'Выбирайте Linear, если',
    forOther1:
      'Вы планируете работу циклами и проектами и хотите, чтобы эта структура была встроена.',
    forOther2: 'Вам нужны отчёты и дашборды или корпоративная безопасность вроде SAML и SCIM.',
    forOther3: 'Ваша команда работает в Slack и хочет создавать задачи оттуда.',
    lead: 'Linear — быстрый инструмент со своим взглядом на работу для продуктовых команд, которые планируют циклами. Laraue Boards — для другой ситуации: небольшая команда или один человек, чья работа начинается с сообщений в Telegram, и кому нужна доска задач и ИИ-агент на ней без процесса вокруг.',
    learnMore: 'О Laraue Boards',
    other: 'Boards и Trello',
    question1: 'Подойдёт ли Laraue Boards как аналог Linear?',
    question2: 'Есть ли в Boards MCP, как в Linear?',
    question3: 'Можно ли создавать задачи в Linear из Telegram?',
    related: 'Также сравните с',
    row1: 'Задачи из Telegram-групп',
    row1Boards:
      'Встроено. Перешлите сообщение боту или привяжите групповой чат и используйте /save или /aisave.',
    row1Other: 'В каталоге нет интеграции с Telegram (есть Slack и Discord).',
    row2: 'MCP и доступ для ИИ-агентов',
    row2Boards:
      'Удалённый MCP-сервер с персональным API-ключом: поиск, чтение, создание, редактирование, перемещение, комментарии, вложения.',
    row2Other:
      'Официальный удалённый MCP-сервер (OAuth или API-ключ); по странице тарифов MCP доступен начиная с Free.',
    row3: 'Настройка',
    row3Boards:
      'Первая доска есть сразу после входа; не нужно сначала настраивать пространство или команду.',
    row3Other: 'Рабочее пространство с командами; циклы и проекты настраиваются по мере внедрения.',
    row4: 'Цены',
    row4Boards:
      'Бесплатный тариф навсегда; платные тарифы — за место. Актуальные цены — в разделе тарифов на главной.',
    row4Other:
      'Free: $0, 250 задач, 2 команды. Basic: $10 за пользователя в месяц при оплате за год. Business: $16 за пользователя в месяц при оплате за год. Enterprise: по запросу.',
    row5: 'Сложное управление проектами и отчётность',
    row5Boards: 'Нет циклов, роадмапов, аналитики и дашбордов, нет SAML и SCIM.',
    row5Other: 'Циклы и проекты; Insights и дашборды начиная с Business.',
    section1: 'Простая модель вместо процесса',
    section1Text1:
      'Linear построен вокруг процесса: команды, циклы и проекты. Эта структура и есть продукт, и она окупается, когда команда ей следует. Но это значит, что до первой полезной задачи больше нужно изучить и настроить.',
    section1Text2:
      'В Boards модель простая: в организации есть пространства, в пространстве — бэклог и доски, у задачи — статус, исполнитель и ваши атрибуты. Начать можно с одного сообщения боту, а структуру добавить позже.',
    section2: 'Задачи из Telegram-групп',
    section2Text1:
      'В Boards чат — источник задач. Перешлите сообщение боту или привяжите Telegram-группу и ответьте на любое сообщение командой /save: в карточку попадут текст, фото и видео. Если отредактировать исходное сообщение, карточка обновится. Linear создаёт задачи из Slack и Discord, Telegram в списке его интеграций нет.',
    section2Text2:
      'Если вы не живёте в Telegram, это не повод переходить: скорее всего, вам больше подойдёт интеграция Linear со Slack.',
    section3: 'MCP и ИИ-агенты',
    section3Text1:
      'Официальный MCP-сервер Linear доступен на всех тарифах начиная с Free, поэтому сам по себе MCP не отличает Boards. Boards даёт одну доску, на которую пишут и люди (из Telegram), и агенты (по MCP): баг пересылают в групповом чате, а ваш агент для кода берёт его из бэклога, комментирует и переводит в Done.',
    section3Text2: 'Как это настроить, рассказано в руководстве о бэклоге для ИИ-агента.',
    section4: 'Чего в Boards нет намеренно',
    section4Text1:
      'В Boards намеренно нет циклов и планирования спринтов, роадмапов, отчётов и дашбордов, календаря и таймлайна. Нет и SAML и SCIM. Если всё это вам важно, выбирайте Linear.',
    seoDescription:
      'Ищете аналог Linear с Telegram и MCP? Сравнение Laraue Boards и Linear — задачи из Telegram, MCP для ИИ-агентов, настройка, цены и то, чего в Boards нет намеренно.',
    seoTitle: 'Аналог Linear с Telegram и MCP — сравнение Laraue Boards и Linear',
    source1: 'Тарифы Linear',
    source2: 'Интеграции Linear',
    source3: 'MCP-сервер Linear',
    sources: 'Откуда факты о Linear',
    table: 'Laraue Boards и Linear рядом',
    title: 'Аналог Linear с Telegram: лёгкий трекер задач, который живёт в Telegram',
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
  // An FAQPage collects the Questions below. Linear's pricing and features were checked on this date.
  defineWebPage({ '@type': 'FAQPage', dateModified: '2026-10-02' }),
  defineBreadcrumb({
    itemListElement: [
      { item: localePath('index', locale.value), name: 'Laraue Boards' },
      { item: localePath('compare-linear', locale.value), name: t('title') },
    ],
  }),
  defineQuestion({ acceptedAnswer: t('answer1'), name: t('question1') }),
  defineQuestion({ acceptedAnswer: t('answer2'), name: t('question2') }),
  defineQuestion({ acceptedAnswer: t('answer3'), name: t('question3') }),
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
