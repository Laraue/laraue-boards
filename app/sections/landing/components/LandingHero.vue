<template>
  <LandingIntro
    :post-title="t('hero_sub')"
    :pre-title="t('hero_eyebrow')"
    :title="t('hero_title')">
    <template #badges>
      <LandingPlatformBadge
        title="Web App"
        type="web" />
      <LandingPlatformBadge
        title="Telegram Mini App"
        type="tg" />
    </template>
    <template #actions>
      <LandingActionButton
        :link="appUrl"
        :title="t('open_app')"
        type="site" />
      <LandingActionButton
        link="https://t.me/msgboard_bot"
        title="@msgboard_bot"
        type="telegram" />
      <div class="hero-quick-links">
        <a :href="docsUrl">{{ t('documentation') }}</a>
        <a :href="projectUrl">{{ t('project_description') }}</a>
      </div>
    </template>
    <template #visual>
      <!-- A chat message travels into the Backlog column as an AI-written card. -->
      <figure class="stage">
        <div class="chat">
          <div class="chat-head">
            <IconChevronLeft
              class="chat-back"
              stroke="2.4" />
            <div class="chat-avatar"><LandingIcon name="chat" /></div>
            <div>
              <div class="chat-name">{{ t('hv_chat_title') }}</div>
              <div class="chat-sub">{{ t('hv_chat') }}</div>
            </div>
          </div>
          <div class="chat-body">
            <div class="bubble">
              <div class="bubble-header">
                <div class="avatar">{{ t('hv_sender_initials') }}</div>
                <div class="bubble-name">{{ t('hv_sender') }}</div>
              </div>
              <p class="bubble-text">{{ t('hv_msg') }}</p>
              <span class="bubble-time">{{ t('hv_time1') }}</span>
            </div>
            <div class="bubble reply">
              <div class="bubble-header">
                <div class="bubble-name">{{ t('hv_replier') }}</div>
                <div class="avatar">{{ t('hv_replier_initials') }}</div>
              </div>
              <p class="bubble-text command">{{ t('hv_command') }}</p>
              <span class="bubble-time">{{ t('hv_time2') }}</span>
            </div>
          </div>
          <div class="chat-input">
            <span class="chat-input-field">{{ t('hv_input') }}</span>
            <span class="chat-input-send"><IconSend stroke="2" /></span>
          </div>
        </div>

        <div
          aria-hidden="true"
          class="flow">
          <IconSparkles stroke="1.8" />
        </div>

        <div class="column">
          <div class="column-head">
            <span class="column-dot"></span>
            {{ t('hv_badge') }}
          </div>
          <div
            aria-hidden="true"
            class="ghost-card">
            <span></span>
            <span></span>
          </div>
          <div class="issue-card">
            <span class="issue-card-key">{{ t('hv_key') }}</span>
            <p class="issue-card-content">{{ t('hv_title') }}</p>
            <div class="issue-card-footer">
              <div class="avatar">{{ t('hv_sender_initials') }}</div>
              <span>{{ t('hv_sender') }}</span>
            </div>
          </div>
          <div
            aria-hidden="true"
            class="ghost-card faded">
            <span></span>
          </div>
        </div>

        <figcaption class="stage-caption">{{ t('hv_arrow') }}</figcaption>
      </figure>
    </template>
  </LandingIntro>
</template>

<script setup lang="ts">
import { IconChevronLeft, IconSend, IconSparkles } from '@tabler/icons-vue'

import type { Locale } from '~/composables/useI18n'

import { docsPath } from '../../docs/docsPaths'
import { appUrl, laraueUrl } from '../landingLinks'
import LandingActionButton from './LandingActionButton.vue'
import LandingIcon from './LandingIcon.vue'
import LandingIntro from './LandingIntro.vue'
import LandingPlatformBadge from './LandingPlatformBadge.vue'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      documentation: 'Documentation',
      hero_eyebrow: 'Task board for small teams',
      hero_sub:
        'Save messages from Telegram chats as cards, and let Claude or any MCP agent read and update the same board. Lightweight by design: free to start, open source.',
      hero_title: 'Tasks from your chats,\nmanaged by you and your AI agent',
      hv_arrow: 'New issue in Backlog, title & description written by AI',
      hv_badge: 'Backlog',
      hv_chat: '#product-team',
      hv_chat_title: 'Product Team',
      hv_command: '/aisave',
      hv_input: 'Message',
      hv_key: 'WRK-42',
      hv_msg: "checkout button's broken on mobile safari, cant pay 😩",
      hv_replier: 'Priya Nair',
      hv_replier_initials: 'PN',
      hv_sender: 'Alex Chen',
      hv_sender_initials: 'AC',
      hv_time1: '9:41',
      hv_time2: '9:42',
      hv_title: 'Fix checkout button on mobile Safari',
      open_app: 'Open App',
      project_description: 'More details',
    },
    ru: {
      documentation: 'Документация',
      hero_eyebrow: 'Доска задач для небольших команд',
      hero_sub:
        'Сообщения из Telegram превращаются в карточки, а Claude или любой MCP-агент помогает их разбирать и обновлять. Бесплатно, с открытым кодом.',
      hero_title:
        'Задачи из ваших чатов.\nРаботайте с ними самостоятельно или через своего ИИ-агента',
      hv_arrow: 'Новый issue в Бэклоге, заголовок и описание пишет ИИ',
      hv_badge: 'Бэклог',
      hv_chat: '#продукт-команда',
      hv_chat_title: 'Продукт-команда',
      hv_command: '/aisave',
      hv_input: 'Сообщение',
      hv_key: 'WRK-42',
      hv_msg: 'кнопка оплаты не работает в сафари на телефоне, не могу оплатить 😩',
      hv_replier: 'Мария Соколова',
      hv_replier_initials: 'МС',
      hv_sender: 'Игорь Петров',
      hv_sender_initials: 'ИП',
      hv_time1: '9:41',
      hv_time2: '9:42',
      hv_title: 'Починить кнопку оплаты в мобильном Safari',
      open_app: 'Открыть приложение',
      project_description: 'Подробнее о проекте',
    },
  },
  props.locale,
)

const docsUrl = docsPath(props.locale)
const projectUrl = laraueUrl(props.locale, '/blog/projects/boards')
</script>

<style scoped>
.hero-quick-links {
  display: flex;
  flex-basis: 100%;
  flex-wrap: wrap;
  gap: 0 24px;
  margin-top: 4px;
}

.hero-quick-links a {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  font-size: var(--font-size-md);
  min-height: var(--control-height);
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-underline-offset: 4px;
  transition:
    color var(--duration-base),
    text-decoration-color var(--duration-base);
}

.hero-quick-links a:hover {
  color: var(--color-text);
  text-decoration-color: currentcolor;
}

/* The stage: chat on the left, the board column on the right, the caption under both. */
.stage {
  align-items: center;
  background: var(--color-workspace);
  border: 1px solid var(--color-border-surface);
  border-radius: 20px;
  display: grid;
  gap: 0 20px;
  grid-template-areas:
    'chat flow column'
    'caption caption caption';
  grid-template-columns: minmax(0, 1.15fr) auto minmax(0, 1fr);
  max-width: 640px;
  padding: 24px;
  width: 100%;
}

.chat {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: 14px;
  grid-area: chat;
  overflow: hidden;
}

.chat-head {
  align-items: center;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  gap: 8px;
  padding: 10px 12px;
}

.chat-back {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 18px;
  width: 18px;
}

.chat-avatar {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: 50%;
  color: var(--color-accent);
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;
}

.chat-avatar :deep(.landing-icon) {
  height: 16px;
  width: 16px;
}

.chat-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
}

.chat-sub {
  color: var(--color-muted);
  font-size: var(--font-size-xs);
}

.chat-body {
  background: var(--color-soft);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 172px;
  padding: 14px 12px;
}

.bubble {
  align-self: flex-start;
  background: var(--color-surface);
  border-radius: 4px 12px 12px;
  max-width: 92%;
  padding: 8px 11px 6px;
}

.bubble.reply {
  align-self: flex-end;
  background: var(--color-accent-soft);
  border-radius: 12px 4px 12px 12px;
}

.bubble-header {
  align-items: center;
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.bubble.reply .bubble-header {
  flex-direction: row-reverse;
}

.bubble-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.bubble-text {
  font-size: var(--font-size-sm);
  line-height: 1.45;
}

.bubble-text.command {
  color: var(--color-accent);
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-medium);
}

.bubble-time {
  color: var(--color-muted);
  display: block;
  font-size: 10px;
  text-align: right;
}

.avatar {
  align-items: center;
  background: var(--color-action);
  border-radius: 50%;
  color: var(--color-on-action);
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: var(--font-weight-semibold);
  height: 18px;
  justify-content: center;
  width: 18px;
}

.chat-input {
  align-items: center;
  border-top: 1px solid var(--color-divider);
  display: flex;
  gap: 8px;
  padding: 8px 10px;
}

.chat-input-field {
  background: var(--color-soft);
  border-radius: var(--radius-full);
  color: var(--color-muted);
  flex: 1;
  font-size: var(--font-size-xs);
  line-height: 26px;
  padding: 0 12px;
}

.chat-input-send {
  align-items: center;
  background: var(--color-action);
  border-radius: 50%;
  color: var(--color-on-action);
  display: flex;
  height: 26px;
  justify-content: center;
  width: 26px;
}

.chat-input-send svg {
  height: 14px;
  width: 14px;
}

/* The hand-off between chat and board: a dashed track with the AI step on it. */
.flow {
  align-items: center;
  align-self: stretch;
  color: var(--color-accent);
  display: flex;
  grid-area: flow;
  justify-content: center;
  position: relative;
  width: 28px;
}

.flow::before {
  border-top: 1.5px dashed color-mix(in srgb, var(--color-accent) 55%, transparent);
  content: '';
  left: -20px;
  position: absolute;
  right: -20px;
  top: 50%;
}

.flow svg {
  background: var(--color-workspace);
  height: 28px;
  padding: 4px;
  position: relative;
  width: 28px;
}

.column {
  background: var(--color-soft);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  grid-area: column;
  padding: 10px;
}

.column-head {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  gap: 8px;
  padding: 2px 4px 4px;
}

.column-dot {
  border: 1.5px solid currentcolor;
  border-radius: 50%;
  height: 9px;
  width: 9px;
}

.ghost-card,
.issue-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: 10px;
}

.ghost-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px;
}

.ghost-card span {
  background: var(--color-soft);
  border-radius: var(--radius-full);
  height: 6px;
  width: 85%;
}

.ghost-card span:last-child {
  width: 55%;
}

.ghost-card.faded {
  opacity: 0.55;
}

.issue-card {
  border-color: var(--color-accent);
  padding: 12px;
}

.issue-card-key {
  color: var(--color-accent);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.issue-card-content {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  line-height: 1.35;
  margin: 4px 0 10px;
}

.issue-card-footer {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-xs);
  gap: 6px;
}

.stage-caption {
  border-top: 1px solid var(--color-divider);
  color: var(--color-muted);
  font-size: var(--font-size-sm);
  grid-area: caption;
  margin-top: 20px;
  padding-top: 14px;
  text-align: center;
}

/* One orchestrated moment on load: the message, the command, then the card lands in Backlog. */
@media (prefers-reduced-motion: no-preference) {
  .bubble,
  .flow svg {
    animation: stage-in 0.5s var(--ease-standard) 0.3s both;
  }

  .bubble.reply {
    animation-delay: 0.9s;
  }

  .flow svg {
    animation-delay: 1.4s;
  }

  .issue-card {
    animation: card-land 0.7s var(--ease-standard) 1.8s both;
  }
}

@keyframes stage-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@keyframes card-land {
  from {
    opacity: 0;
    transform: translateX(-48px) rotate(-3deg);
  }

  60% {
    opacity: 1;
  }
}

@media (width <= 560px) {
  .stage {
    gap: 16px 0;
    grid-template-areas:
      'chat'
      'flow'
      'column'
      'caption';
    grid-template-columns: minmax(0, 1fr);
    padding: 16px;
  }

  .flow {
    height: 28px;
    width: auto;
  }

  .flow::before {
    border-left: 1.5px dashed color-mix(in srgb, var(--color-accent) 55%, transparent);
    border-top: none;
    bottom: -16px;
    left: 50%;
    right: auto;
    top: -16px;
  }

  .stage-caption {
    margin-top: 4px;
  }
}
</style>
