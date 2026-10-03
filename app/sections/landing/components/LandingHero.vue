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
                <IconChevronLeft
                  class="phone-back"
                  stroke="2.4" />
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
            <IconArrowDown />
            <span>{{ t('hv_arrow') }}</span>
          </div>
          <div class="issue-card-mockup">
            <div class="issue-card-row">
              <span class="issue-card-key">{{ t('hv_key') }}</span>
              <span class="issue-card-status">&#9679; {{ t('hv_badge') }}</span>
            </div>
            <p class="issue-card-content">{{ t('hv_title') }}</p>
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
import { IconArrowDown, IconChevronLeft } from '@tabler/icons-vue'

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
  gap: 20px;
  margin-top: 6px;
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
  background: var(--color-action);
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px 12px 12px;
  max-width: 88%;
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
  background: var(--color-action);
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
  background: var(--color-accent-soft);
  border-color: transparent;
  border-radius: 12px 4px 12px 12px;
}

.tg-bubble.reply .tg-bubble-header {
  flex-direction: row-reverse;
}

.transform-arrow {
  align-items: flex-start;
  color: var(--color-muted);
  display: flex;
  gap: 8px;
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
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
  background: var(--color-action);
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
</style>
