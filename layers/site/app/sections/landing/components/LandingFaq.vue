<template>
  <section
    id="faq"
    class="faq">
    <div class="faq-inner">
      <LandingHeading
        class="faq-heading"
        :pre-title="t('faq_label')"
        :title="t('faq_title')" />
      <div class="faq-list">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="faq-item"
          :data-open="openItem === index ? 'true' : null">
          <button
            :aria-controls="`faq-answer-${index}`"
            :aria-expanded="openItem === index"
            class="faq-summary"
            type="button"
            @click="toggleItem(index)">
            {{ item.question }}
            <IconPlus
              aria-hidden="true"
              class="faq-sign"
              stroke="1.8" />
          </button>
          <div class="faq-answer-wrap">
            <div class="faq-answer-inner">
              <p :id="`faq-answer-${index}`">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'
import { computed, ref } from 'vue'

import { defineQuestion, defineWebPage, useSchemaOrg } from '#imports'
import { sellerDetails } from '#layers/core/app/constants/sellerDetails'
import { useI18n } from '#layers/core/app/i18n/useI18n'

import LandingHeading from './LandingHeading.vue'

const { t } = useI18n({
  en: {
    faq1a:
      'The Free plan is free forever. Paid plans (Plus, Team, Business) have higher limits, and you can switch to one at any time in the app — see the pricing section above. The AI features (/aisave and the AI in the web app) run on tokens: the Free plan includes 25,000 a month, each paid plan includes more, and the documentation explains how they are spent.',
    faq1q: 'Is it free?',
    faq2a:
      'Yes. Both the backend and the frontend are public on GitHub, so you can read exactly what happens to a message after you send it.',
    faq2q: 'Is it really open source?',
    faq3a:
      'Saved Messages is a great place to save something quickly, but a bad place to find it later. Laraue Boards is the alternative: it keeps the saving just as easy and gives what you saved a board, columns and statuses.',
    faq3q: "What's a good alternative to Telegram Saved Messages?",
    faq4a:
      'No. You sign in with Telegram or Google. In the Mini App you are already signed in, and the web version has Telegram and Google sign-in buttons.',
    faq4q: 'Do I need an account or a password?',
    faq5a:
      "Yes — Laraue Boards is a Jira alternative built entirely around Telegram, and lighter for teams that find Jira's setup overwhelming. You still get spaces, boards, custom attributes and permissions, but capturing work takes a forwarded message instead of a form.",
    faq5q: 'Is there a Jira alternative that works inside Telegram?',
    faq6a:
      'Yes. Every account gets a private personal organization automatically — no team, no invites, nothing to configure. Forward a message and it lands on your own board.',
    faq6q: 'Can I use it alone, without a team?',
    faq7a:
      "Yes, two ways: the Telegram Mini App opens inside Telegram on any phone, and the web app is fully responsive if you'd rather use a browser.",
    faq7q: 'Does Laraue Boards work on mobile?',
    faq8a:
      'Yes. The web app has an all-issues search across every space and board, and you can also search from inside any Telegram chat by typing @msgboard_bot followed by your query.',
    faq8q: 'Can I search across all my boards at once?',
    faq9a:
      'Yes. Create an organization, invite your team via Telegram, and forwarded messages route straight to shared boards with permissions per operation. It works as a lightweight project management bot without leaving the app your team already uses to chat.',
    faq9q: 'Can I use Laraue Boards as a Telegram task manager for my team?',
    faq10a:
      'Forward a message to @msgboard_bot and it becomes a card on your board within seconds, confirmed with a 👍 reaction. Or link a whole chat and pick a save mode: auto mode saves every message (good for a personal chat), manual mode saves only the messages you reply to with /save or /aisave (good for a busy group chat). In auto mode, editing the original message updates the card; in manual mode, run /save again to re-sync.',
    faq10q: 'How does a Telegram message turn into a task?',
    faq11a:
      "Yes — Laraue Boards has a remote MCP (Model Context Protocol) server. Create a personal API key from your organization's settings, add it as a custom connector in Claude (or any MCP client), and the agent can list, view, create, edit and move issues, and attach or download files, scoped to your own permissions.",
    faq11q: 'Can I connect Claude or another AI agent to my boards?',
    faq12a:
      'In the app, open Send feedback at the bottom of the sidebar to report a bug, suggest an idea or ask a question — it goes straight to the team. Not signed in, or prefer email? Write to {email}. Step-by-step guides are in the documentation.',
    faq12q: 'How do I get help or send feedback?',
    faq_label: 'Questions',
    faq_title: 'Common questions',
  },
  ru: {
    faq1a:
      'Да, бесплатный тариф не ограничен по времени. Платные тарифы (Plus, Team, Business) дают больше лимитов, перейти на них можно в приложении в любой момент — тарифы перечислены выше. Функции ИИ (/aisave и ИИ в веб-приложении) расходуют токены: на бесплатном тарифе их 25 000 в месяц, на платных — больше. Как они расходуются, написано в документации.',
    faq1q: 'Это бесплатно?',
    faq2a:
      'Да. Бэкенд и фронтенд лежат на GitHub — можно посмотреть, что происходит с сообщением после отправки.',
    faq2q: 'У проекта правда открытый код?',
    faq3a:
      'В «Избранное» удобно быстро что-то отправить, но потом это трудно найти. В Laraue Boards сохранять так же просто, только сохранённое попадает на доску с колонками и статусами.',
    faq3q: 'Чем заменить «Избранное» в Telegram?',
    faq4a:
      'Нет. Вход через Telegram или Google: в Mini App вы уже вошли, а в веб-версии есть кнопки входа через Telegram и Google.',
    faq4q: 'Нужно ли регистрироваться и придумывать пароль?',
    faq5a:
      'Да. Laraue Boards — более лёгкая альтернатива Jira, построенная вокруг Telegram, для команд, которым Jira кажется слишком сложной. Здесь есть пространства, доски, свои атрибуты и права доступа, но задачу создаёт пересланное сообщение, а не форма.',
    faq5q: 'Есть ли альтернатива Jira, которая работает прямо в Telegram?',
    faq6a:
      'Да. У каждого пользователя сразу есть личная организация: без команды, приглашений и настройки. Перешлите сообщение — и оно появится на вашей доске.',
    faq6q: 'Можно ли пользоваться в одиночку, без команды?',
    faq7a:
      'Да, двумя способами: Telegram Mini App открывается прямо в Telegram на любом телефоне, а веб-приложение подстраивается под экран, если вам удобнее браузер.',
    faq7q: 'Работает ли Laraue Boards на телефоне?',
    faq8a:
      'Да. В веб-приложении поиск идёт по задачам всех пространств и досок, а в любом чате Telegram можно набрать @msgboard_bot и запрос.',
    faq8q: 'Можно ли искать по всем доскам сразу?',
    faq9a:
      'Да. Создайте организацию и пригласите команду через Telegram: пересланные сообщения будут попадать на общие доски, а права можно настроить для каждого действия. Уходить из чата, где команда и так общается, не нужно.',
    faq9q: 'Подойдёт ли Laraue Boards как таск-менеджер для команды в Telegram?',
    faq10a:
      'Перешлите сообщение боту @msgboard_bot — через пару секунд оно станет карточкой на доске, а бот поставит реакцию 👍. Можно привязать и весь чат, выбрав режим сохранения: в автоматическом сохраняется каждое сообщение (удобно для личного чата), в ручном — только те, на которые вы ответили /save или /aisave (удобно для активного группового чата). В автоматическом режиме изменённое сообщение обновляет карточку, в ручном для этого нужно снова ответить /save.',
    faq10q: 'Как сообщение из Telegram превращается в задачу?',
    faq11a:
      'Да, у Laraue Boards есть удалённый MCP-сервер (Model Context Protocol). Создайте личный API-ключ в настройках организации и добавьте его в Claude как свой коннектор (или в другой MCP-клиент). Агент сможет просматривать, создавать, изменять и перемещать задачи, прикреплять и скачивать файлы — в пределах ваших прав.',
    faq11q: 'Можно ли подключить Claude или другого ИИ-агента к моим доскам?',
    faq12a:
      'В приложении нажмите «Обратная связь» внизу боковой панели: так можно сообщить об ошибке, предложить идею или задать вопрос, и сообщение сразу получит команда. Если вы не вошли или вам удобнее почта, пишите на {email}. Пошаговые инструкции есть в документации.',
    faq12q: 'Как получить помощь или оставить отзыв?',
    faq_label: 'Вопросы',
    faq_title: 'Частые вопросы',
  },
})

type FaqKey = Parameters<typeof t>[0]

const items = computed(() =>
  Array.from({ length: 12 }, (_, index) => ({
    answer: t(`faq${index + 1}a` as FaqKey, { email: sellerDetails.email }),
    question: t(`faq${index + 1}q` as FaqKey),
  })),
)

const openItem = ref<number>()
const toggleItem = (index: number): void => {
  openItem.value = openItem.value === index ? undefined : index
}

// The same questions for search engines: the page becomes an FAQPage that collects them.
useSchemaOrg([
  defineWebPage({ '@type': 'FAQPage' }),
  ...items.value.map((item) =>
    defineQuestion({ acceptedAnswer: item.answer, name: item.question }),
  ),
])
</script>

<style scoped>
.faq {
  border-bottom: 1px solid var(--color-divider);
  padding: 112px 24px;
}

.faq-inner {
  align-items: start;
  display: grid;
  gap: 64px;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  margin: 0 auto;
  /* The width of the header and footer (1360px with 24px of padding), so the page lines up with them. */
  max-width: 1312px;
}

.faq-heading {
  position: sticky;
  top: 96px;
}

.faq-list {
  border-top: 1px solid var(--color-border-surface);
}

.faq-item {
  border-bottom: 1px solid var(--color-border-surface);
}

.faq-summary {
  align-items: center;
  background: none;
  border: none;
  border-radius: var(--radius-control);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  gap: 24px;
  justify-content: space-between;
  line-height: 1.4;
  padding: 22px 0;
  text-align: left;
  transition: color var(--duration-base);
  width: 100%;
}

.faq-summary:hover {
  color: var(--color-accent);
}

.faq-summary:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.faq-sign {
  color: var(--color-muted);
  flex-shrink: 0;
  height: 22px;
  transition: transform var(--duration-base) var(--ease-standard);
  width: 22px;
}

.faq-item[data-open='true'] .faq-sign {
  color: var(--color-accent);
  transform: rotate(45deg);
}

.faq-answer-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-base) var(--ease-standard);
}

.faq-item[data-open='true'] .faq-answer-wrap {
  grid-template-rows: 1fr;
}

.faq-answer-inner {
  overflow: hidden;
}

.faq-item p {
  color: var(--color-muted);
  font-size: var(--font-size-lg);
  line-height: 1.7;
  max-width: 70ch;
  padding-bottom: 24px;
}

@media (width <= 900px) {
  .faq {
    padding: 72px 16px;
  }

  .faq-inner {
    display: block;
  }

  .faq-heading {
    position: static;
  }

  .faq-list {
    margin-top: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq-sign,
  .faq-answer-wrap {
    transition: none;
  }
}
</style>
