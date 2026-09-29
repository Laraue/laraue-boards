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
        :title="t('login')"
        type="site" />
      <LandingActionButton
        link="https://t.me/msgboard_bot"
        title="@msgboard_bot"
        type="telegram" />
      <div class="hero-quick-links">
        <a :href="docsUrl">{{ t('documentation') }} &#8594;</a>
        <a :href="projectUrl">{{ t('project_description') }} &#8594;</a>
      </div>
    </template>
    <template #visual>
      <div class="hero-visual">
        <!-- Message → AI-cleaned card transformation -->
        <div class="transform-mockup">
          <div class="phone-mockup">
            <div class="phone-screen">
              <div class="phone-statusbar">
                <span class="phone-time">{{ t('hv_time1') }}</span>
                <span class="phone-island"></span>
                <span class="phone-indicators">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 18 12">
                    <rect
                      height="4"
                      rx="1"
                      width="3"
                      x="0"
                      y="8" />
                    <rect
                      height="7"
                      rx="1"
                      width="3"
                      x="5"
                      y="5" />
                    <rect
                      height="10"
                      rx="1"
                      width="3"
                      x="10"
                      y="2" />
                    <rect
                      height="12"
                      rx="1"
                      width="3"
                      x="15"
                      y="0" />
                  </svg>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 26 12">
                    <rect
                      height="11"
                      rx="3.5"
                      width="22"
                      x="0.5"
                      y="0.5" />
                    <rect
                      fill="currentColor"
                      height="7"
                      rx="1.5"
                      stroke="none"
                      width="16"
                      x="2.5"
                      y="2.5" />
                    <path
                      d="M24.5 4v4"
                      stroke-linecap="round" />
                  </svg>
                </span>
              </div>
              <div class="phone-status">
                <svg
                  class="phone-back"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.4"
                  viewBox="0 0 24 24">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
                <div class="phone-status-avatar"><LandingIcon name="chat" /></div>
                <div>
                  <div class="phone-status-name">{{ t('hv_chat_title') }}</div>
                  <div class="phone-status-sub">{{ t('hv_chat') }}</div>
                </div>
              </div>
              <div class="phone-body">
                <div class="tg-bubble">
                  <div class="tg-bubble-header">
                    <div class="tg-bubble-avatar">{{ t('hv_sender_initials') }}</div>
                    <div class="tg-bubble-name">{{ t('hv_sender') }}</div>
                  </div>
                  <p class="tg-bubble-text">{{ t('hv_msg') }}</p>
                  <span class="tg-bubble-time">{{ t('hv_time1') }}</span>
                </div>
                <div class="tg-bubble reply">
                  <div class="tg-bubble-header">
                    <div class="tg-bubble-name">{{ t('hv_replier') }}</div>
                    <div class="tg-bubble-avatar you">{{ t('hv_replier_initials') }}</div>
                  </div>
                  <p class="tg-bubble-text command">{{ t('hv_command') }}</p>
                  <span class="tg-bubble-time">{{ t('hv_time2') }}</span>
                </div>
              </div>
              <div class="phone-input">
                <span class="phone-input-field">{{ t('hv_input') }}</span>
                <span class="phone-input-send">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div class="transform-arrow">
            <svg
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24">
              <path d="M12 4v14M12 18l-5-5M12 18l5-5" />
            </svg>
            <span>{{ t('hv_arrow') }}</span>
          </div>
          <div class="issue-card-mockup">
            <div class="issue-card-row">
              <span class="issue-card-key">{{ t('hv_key') }}</span>
              <span class="issue-card-status">&#9679; {{ t('hv_badge') }}</span>
            </div>
            <p class="issue-card-content">
              <strong>{{ t('hv_title') }}</strong>
              --- {{ t('hv_desc') }}
            </p>
            <div class="issue-card-footer">
              <div class="issue-card-avatar">{{ t('hv_sender_initials') }}</div>
              <span>{{ t('hv_sender') }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </LandingIntro>
</template>

<script setup lang="ts">
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
      hero_eyebrow: 'Telegram task manager by Laraue Software',
      hero_sub:
        'A Jira alternative in Telegram. Link your chats to boards with @msgboard_bot. Free, open source, ready in seconds.',
      hero_title: 'Turn Telegram messages\ninto Kanban boards',
      hv_arrow: 'New issue in Backlog, title & description written by AI',
      hv_badge: 'Backlog',
      hv_chat: '#product-team',
      hv_chat_title: 'Product Team',
      hv_command: '/aisave',
      hv_desc: "Pay button doesn't respond to tap. Only happens in Safari on mobile",
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
      login: 'Log in',
      project_description: 'More details',
    },
    ru: {
      documentation: 'Документация',
      hero_eyebrow: 'Telegram-таск-менеджер от Laraue Software',
      hero_sub:
        'Альтернатива Jira в Telegram. Привяжите свои чаты к доскам с помощью @msgboard_bot. Бесплатно, с открытым кодом, готово за секунды.',
      hero_title: 'Превращайте сообщения Telegram\nв Kanban-доски',
      hv_arrow: 'Новый issue в Бэклоге, заголовок и описание пишет ИИ',
      hv_badge: 'Бэклог',
      hv_chat: '#продукт-команда',
      hv_chat_title: 'Продукт-команда',
      hv_command: '/aisave',
      hv_desc: 'Кнопка не реагирует на нажатие. Только в Safari на телефоне',
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
      login: 'Войти',
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
  animation: fade-up var(--anim-duration-lg) calc(var(--anim-stagger) * 4) var(--anim-ease) both;
  display: flex;
  flex-basis: 100%;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 6px;
  opacity: 0;
}

.hero-quick-links a {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--duration-base);
}

.hero-quick-links a:hover {
  color: var(--color-text);
}

.transform-mockup {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 270px;
}

.phone-mockup {
  background: #1a1a1d;
  border-radius: 44px;
  box-shadow:
    var(--shadow-popover),
    inset 0 0 0 2px #3a3a3f;
  flex-shrink: 0;
  padding: 8px;
  width: 270px;
}

.phone-screen {
  background: var(--color-workspace);
  border-radius: 36px;
  overflow: hidden;
}

.phone-statusbar {
  align-items: center;
  background: var(--color-surface);
  display: flex;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  justify-content: space-between;
  padding: 10px 20px 4px;
}

.phone-island {
  background: #1a1a1d;
  border-radius: var(--radius-pill);
  height: 18px;
  width: 64px;
}

.phone-indicators {
  align-items: center;
  display: flex;
  gap: 5px;
}

.phone-indicators svg:first-child {
  height: 9px;
  width: 13px;
}

.phone-indicators svg:last-child {
  height: 10px;
  width: 20px;
}

.phone-status {
  align-items: center;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  gap: 8px;
  padding: 8px 14px 10px 10px;
}

.phone-back {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 20px;
  width: 20px;
}

.phone-status-avatar {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: 50%;
  color: var(--color-accent);
  display: flex;
  flex-shrink: 0;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.phone-status-avatar :deep(.landing-icon) {
  height: 18px;
  width: 18px;
}

.phone-status-name {
  font-size: 13px;
  font-weight: var(--font-weight-bold);
}

.phone-status-sub {
  color: var(--color-muted);
  font-size: 10px;
}

.phone-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 190px;
  padding: 14px 12px;
}

.phone-input {
  align-items: center;
  background: var(--color-surface);
  border-top: 1px solid var(--color-divider);
  display: flex;
  gap: 8px;
  padding: 8px 12px 14px;
}

.phone-input-field {
  align-items: center;
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  display: flex;
  flex: 1;
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

.phone-input-send {
  align-items: center;
  background: var(--color-accent);
  border-radius: 50%;
  color: #fff;
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;
}

.phone-input-send svg {
  height: 14px;
  width: 14px;
}

.tg-bubble {
  align-self: flex-start;
  animation: msg-reveal var(--anim-demo-duration) var(--anim-demo-step) var(--anim-ease) forwards;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px 12px 12px;
  max-width: 88%;
  opacity: 0;
  padding: 9px 12px;
  width: fit-content;
}

.tg-bubble-header {
  align-items: center;
  display: flex;
  gap: 6px;
  margin-bottom: 5px;
}

.tg-bubble-avatar {
  align-items: center;
  background: var(--color-accent);
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: var(--font-weight-bold);
  height: 18px;
  justify-content: center;
  width: 18px;
}

.tg-bubble-name {
  font-size: 11px;
  font-weight: var(--font-weight-bold);
}

.tg-bubble-text {
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}

.tg-bubble-text.command {
  color: var(--color-accent);
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-semibold);
}

.tg-bubble-time {
  color: var(--color-muted);
  display: block;
  font-size: 9px;
  margin-top: 3px;
  text-align: right;
}

.tg-bubble.reply {
  align-self: flex-end;
  animation-delay: calc(var(--anim-demo-step) * 2);
  background: var(--color-accent-soft);
  border-color: transparent;
  border-radius: 12px 4px 12px 12px;
}

.tg-bubble.reply .tg-bubble-header {
  flex-direction: row-reverse;
}

.transform-arrow {
  align-items: flex-start;
  animation:
    msg-reveal var(--anim-demo-duration) calc(var(--anim-demo-step) * 3) var(--anim-ease) forwards,
    pulse-arrow var(--anim-pulse-duration)
      calc(var(--anim-demo-step) * 3 + var(--anim-demo-duration)) ease-in-out infinite;
  color: var(--color-muted);
  display: flex;
  gap: 8px;
  opacity: 0;
  width: 260px;
}

.transform-arrow svg {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 18px;
  margin-top: 1px;
  width: 18px;
}

.transform-arrow span {
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.5;
}

.issue-card-mockup {
  animation: msg-reveal var(--anim-demo-duration) calc(var(--anim-demo-step) * 4) var(--anim-ease)
    forwards;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  opacity: 0;
  padding: 14px 16px;
  width: 260px;
}

.issue-card-row {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.issue-card-key {
  color: var(--color-accent);
  font-family: var(--font-family-mono);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
}

.issue-card-status {
  align-items: center;
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  display: flex;
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  gap: 5px;
  margin-left: auto;
  padding: 3px 9px;
}

.issue-card-content {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  font-size: 13px;
  -webkit-line-clamp: 2;
  line-height: 1.5;
  margin: 0 0 12px;
  overflow: hidden;
}

.issue-card-footer {
  align-items: center;
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.issue-card-avatar {
  align-items: center;
  background: var(--color-accent);
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: var(--font-weight-bold);
  height: 18px;
  justify-content: center;
  width: 18px;
}

.issue-card-footer span {
  color: var(--color-muted);
  font-size: 11px;
}

@media (prefers-reduced-motion: reduce) {
  .hero-quick-links {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes msg-reveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-arrow {
  0%,
  100% {
    opacity: 0.55;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(2px);
  }
}
</style>
