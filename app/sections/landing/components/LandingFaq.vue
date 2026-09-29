<template>
  <section
    id="faq"
    class="faq">
    <div class="faq-inner">
      <div class="section-label reveal">{{ t('faq_label') }}</div>
      <h2 class="section-title reveal">{{ t('faq_title') }}</h2>
      <div class="faq-list">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="faq-item reveal"
          :data-open="openItem === index ? 'true' : null">
          <button
            :aria-controls="`faq-answer-${index}`"
            :aria-expanded="openItem === index"
            class="faq-summary"
            type="button"
            @click="toggleItem(index)">
            {{ item.question }}
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
import type { Locale } from '~/composables/useI18n'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      faq1a:
        "The Free plan is free forever. Paid tiers (Plus, Team, Business) exist for higher limits, but during our current MVP phase they're free too — see the pricing section above. /aisave is free while it's in testing and will become a paid feature later.",
      faq1q: 'Is it free?',
      faq2a:
        'Yes. Both the backend and the frontend are public on GitHub, so you can read exactly what happens to a message after you send it.',
      faq2q: 'Is it really open source?',
      faq3a:
        'Saved Messages is a great place to save something quickly, but a bad place to find it later. Laraue Boards is the alternative: it keeps the saving just as easy and gives what you saved a board, columns and statuses.',
      faq3q: "What's a good alternative to Telegram Saved Messages?",
      faq4a:
        'No. You log in with Telegram. In the Mini App you are already logged in, and the web version has a Telegram login button.',
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
        'Forward or send any message to @msgboard_bot and it becomes a card on your board within seconds, confirmed with a 👍 reaction. Edit the original message in Telegram and the card updates with it — no copy-pasting into another app.',
      faq10q: 'How does a Telegram message turn into a task?',
      faq11a:
        "Yes — Laraue Boards has a remote MCP (Model Context Protocol) server. Create a personal API key from your organization's settings, add it as a custom connector in Claude (or any MCP client), and the agent can list, view, create, edit and move issues, and attach or download files, scoped to your own permissions.",
      faq11q: 'Can I connect Claude or another AI agent to my boards?',
      faq_label: 'Questions',
      faq_title: 'Common questions',
    },
    ru: {
      faq1a:
        'Бесплатный тариф бесплатен навсегда. Есть и платные тарифы (Plus, Team, Business) для более высоких лимитов, но пока продукт на стадии MVP, они тоже бесплатны — смотрите тарифы выше. Функция /aisave бесплатна, пока тестируется, и позже станет платной.',
      faq1q: 'Это бесплатно?',
      faq2a:
        'Да. Бэкенд и фронтенд открыты на GitHub — можно прочитать, что именно происходит с сообщением после отправки.',
      faq2q: 'Проект действительно опенсорсный?',
      faq3a:
        '«Сохранённые сообщения» — отличное место, чтобы что-то быстро сохранить, но плохое, чтобы это потом найти. Laraue Boards — как раз такая альтернатива: сохранять так же просто, но у сохранённого появляется доска, колонки и статусы.',
      faq3q: 'Какая есть альтернатива «Сохранённым сообщениям» в Telegram?',
      faq4a:
        'Нет. Вход через Telegram: в Mini App вы уже авторизованы, а в веб-версии есть кнопка входа через Telegram.',
      faq4q: 'Нужен ли аккаунт или пароль?',
      faq5a:
        'Да — Laraue Boards — это альтернатива Jira, построенная вокруг Telegram, и более лёгкая для команд, которым настройка Jira кажется избыточной. Здесь есть спейсы, доски, кастомные атрибуты и права, но задача создаётся пересланным сообщением, а не через форму.',
      faq5q: 'Есть ли альтернатива Jira, которая работает прямо в Telegram?',
      faq6a:
        'Да. У каждого аккаунта автоматически есть личная организация — без команды, без приглашений, без настройки. Перешлите сообщение — и оно окажется на вашей доске.',
      faq6q: 'Можно ли пользоваться в одиночку, без команды?',
      faq7a:
        'Да, двумя способами: Telegram Mini App открывается прямо в Telegram на любом телефоне, а веб-приложение полностью адаптивно, если вам удобнее браузер.',
      faq7q: 'Работает ли Laraue Boards на телефоне?',
      faq8a:
        'Да. В веб-приложении есть поиск по всем issues во всех спейсах и досках, а ещё можно искать прямо из любого чата Telegram, набрав @msgboard_bot и запрос.',
      faq8q: 'Можно ли искать по всем доскам сразу?',
      faq9a:
        'Да. Создайте организацию, пригласите команду через Telegram — пересланные сообщения будут попадать прямо на общие доски, а права настраиваются по операциям. Это лёгкий бот для управления проектами, не заставляющий уходить из чата, где команда и так общается.',
      faq9q: 'Можно ли использовать Laraue Boards как Telegram таск-менеджер для команды?',
      faq10a:
        'Перешлите или отправьте любое сообщение боту @msgboard_bot — и через пару секунд оно станет карточкой на доске, а бот подтвердит это реакцией 👍. Отредактируйте исходное сообщение в Telegram — карточка обновится вместе с ним, без копирования в другое приложение.',
      faq10q: 'Как сообщение из Telegram превращается в задачу?',
      faq11a:
        'Да — у Laraue Boards есть удалённый MCP-сервер (Model Context Protocol). Создайте персональный API-ключ в настройках организации, добавьте его как кастомный коннектор в Claude (или любой другой MCP-клиент) — и агент сможет просматривать, создавать, редактировать и перемещать issues, а также прикладывать и скачивать файлы, в рамках ваших прав доступа.',
      faq11q: 'Можно ли подключить Claude или другого ИИ-агента к моим доскам?',
      faq_label: 'Вопросы',
      faq_title: 'Частые вопросы',
    },
  },
  props.locale,
)

type FaqKey = Parameters<typeof t>[0]

const items = Array.from({ length: 11 }, (_, index) => ({
  answer: t(`faq${index + 1}a` as FaqKey),
  question: t(`faq${index + 1}q` as FaqKey),
}))

const openItem = ref<number>()
const toggleItem = (index: number): void => {
  openItem.value = openItem.value === index ? undefined : index
}

// The same questions, for search engines (see the software description in `useLandingSeo`).
useHead({
  script: [
    {
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: props.locale,
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
          name: item.question,
        })),
      }).replaceAll('<', String.raw`\u003c`),
      key: 'landing-faq-jsonld',
      type: 'application/ld+json',
    },
  ],
})
</script>

<style scoped>
.faq-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-dialog);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 20px 24px;
}

.faq {
  background: var(--color-workspace);
  border-bottom: 1px solid var(--color-divider);
  padding: 88px 24px;
}

.faq-inner {
  margin: 0 auto;
  /* The width of the header and footer (1360px with 24px of padding), so the page lines up with them. */
  max-width: 1312px;
}

.section-label {
  align-items: center;
  color: var(--color-accent);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  gap: 8px;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.section-label::after {
  background: var(--color-accent);
  content: '';
  flex: 1;
  height: 1px;
  max-width: 40px;
  opacity: 0.5;
}

.section-title {
  font-size: clamp(26px, 3vw, 40px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 16px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;
  max-width: 820px;
}

.faq-summary {
  align-items: center;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  gap: 12px;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  text-align: left;
  width: 100%;
}

.faq-summary::after {
  color: var(--color-muted);
  content: '+';
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 400;
  transition: transform var(--anim-duration) var(--anim-ease);
}

.faq-item[data-open='true'] .faq-summary::after {
  transform: rotate(45deg);
}

.faq-answer-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--anim-duration) var(--anim-ease);
}

.faq-item[data-open='true'] .faq-answer-wrap {
  grid-template-rows: 1fr;
}

.faq-answer-inner {
  overflow: hidden;
}

.faq-item p {
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.7;
  margin-top: 14px;
}

@media (width <= 720px) {
  .faq {
    padding: 60px 22px;
  }
}
</style>
