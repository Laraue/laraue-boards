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
import { useI18n } from '#layers/core/app/i18n/useI18n'

import LandingHeading from './LandingHeading.vue'

const { t } = useI18n({
  en: {
    faq1a:
      'The Free plan is free forever. Paid tiers (Plus, Team, Business) with higher limits will be available soon — see the pricing section above. /aisave runs on tokens: every user gets a free allowance each month, and what each plan includes is listed in the pricing section.',
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
    faq_label: 'Questions',
    faq_title: 'Common questions',
  },
  ru: {
    faq1a:
      'Бесплатный тариф бесплатен навсегда. Платные тарифы (Plus, Team, Business) с более высокими лимитами скоро станут доступны — смотрите тарифы выше. Функция /aisave работает на токенах: каждому пользователю каждый месяц доступен бесплатный запас, а что входит в каждый тариф — смотрите в разделе тарифов.',
    faq1q: 'Это бесплатно?',
    faq2a:
      'Да. Бэкенд и фронтенд открыты на GitHub — можно прочитать, что именно происходит с сообщением после отправки.',
    faq2q: 'Проект действительно опенсорсный?',
    faq3a:
      '«Сохранённые сообщения» — отличное место, чтобы что-то быстро сохранить, но плохое, чтобы это потом найти. Laraue Boards — как раз такая альтернатива: сохранять так же просто, но у сохранённого появляется доска, колонки и статусы.',
    faq3q: 'Какая есть альтернатива «Сохранённым сообщениям» в Telegram?',
    faq4a:
      'Нет. Вход через Telegram или Google: в Mini App вы уже авторизованы, а в веб-версии есть кнопки входа через Telegram и Google.',
    faq4q: 'Нужен ли аккаунт или пароль?',
    faq5a:
      'Да — Laraue Boards — это альтернатива Jira, построенная вокруг Telegram, и более лёгкая для команд, которым настройка Jira кажется избыточной. Здесь есть пространства, доски, кастомные атрибуты и права, но задача создаётся пересланным сообщением, а не через форму.',
    faq5q: 'Есть ли альтернатива Jira, которая работает прямо в Telegram?',
    faq6a:
      'Да. У каждого аккаунта автоматически есть личная организация — без команды, без приглашений, без настройки. Перешлите сообщение — и оно окажется на вашей доске.',
    faq6q: 'Можно ли пользоваться в одиночку, без команды?',
    faq7a:
      'Да, двумя способами: Telegram Mini App открывается прямо в Telegram на любом телефоне, а веб-приложение полностью адаптивно, если вам удобнее браузер.',
    faq7q: 'Работает ли Laraue Boards на телефоне?',
    faq8a:
      'Да. В веб-приложении есть поиск по всем issues во всех пространствах и досках, а ещё можно искать прямо из любого чата Telegram, набрав @msgboard_bot и запрос.',
    faq8q: 'Можно ли искать по всем доскам сразу?',
    faq9a:
      'Да. Создайте организацию, пригласите команду через Telegram — пересланные сообщения будут попадать прямо на общие доски, а права настраиваются по операциям. Это лёгкий бот для управления проектами, не заставляющий уходить из чата, где команда и так общается.',
    faq9q: 'Можно ли использовать Laraue Boards как Telegram таск-менеджер для команды?',
    faq10a:
      'Перешлите сообщение боту @msgboard_bot — и через пару секунд оно станет карточкой на доске, а бот подтвердит это реакцией 👍. Или привяжите чат целиком и выберите режим сохранения: автоматический сохраняет каждое сообщение (удобно для личного чата), ручной — только те, на которые вы ответили командой /save или /aisave (удобно для оживлённого группового чата). В автоматическом режиме правка исходного сообщения обновляет карточку; в ручном — повторите /save, чтобы обновить её.',
    faq10q: 'Как сообщение из Telegram превращается в задачу?',
    faq11a:
      'Да — у Laraue Boards есть удалённый MCP-сервер (Model Context Protocol). Создайте персональный API-ключ в настройках организации, добавьте его как кастомный коннектор в Claude (или любой другой MCP-клиент) — и агент сможет просматривать, создавать, редактировать и перемещать issues, а также прикладывать и скачивать файлы, в рамках ваших прав доступа.',
    faq11q: 'Можно ли подключить Claude или другого ИИ-агента к моим доскам?',
    faq_label: 'Вопросы',
    faq_title: 'Частые вопросы',
  },
})

type FaqKey = Parameters<typeof t>[0]

const items = computed(() =>
  Array.from({ length: 11 }, (_, index) => ({
    answer: t(`faq${index + 1}a` as FaqKey),
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
