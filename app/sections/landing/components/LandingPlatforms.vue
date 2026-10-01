<template>
  <LandingSection
    :post-title="t('pl_sub')"
    :pre-title="t('pl_label')"
    :title="t('pl_title')"
    type="alt">
    <div class="platforms-grid">
      <div class="platform-card">
        <div class="platform-card-header">
          <div class="platform-card-icon web"><LandingIcon name="globe" /></div>
          <div>
            <div class="platform-card-name">{{ t('web_name') }}</div>
            <div class="platform-card-tag">boards.laraue.com</div>
          </div>
        </div>
        <p class="platform-card-desc">{{ t('web_desc') }}</p>
        <ul class="platform-card-features">
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('web_f1') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('web_f2') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('web_f3') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('web_f4') }}</span>
          </li>
        </ul>
        <a
          class="platform-card-link web"
          :href="appUrl"
          style="align-self: flex-start">
          {{ t('open_webapp') }} &#8594;
        </a>
      </div>

      <div class="platform-card">
        <div class="platform-card-header">
          <div class="platform-card-icon tg"><LandingIcon name="chat" /></div>
          <div>
            <div class="platform-card-name">{{ t('tg_name') }}</div>
            <div class="platform-card-tag">@msgboard_bot</div>
          </div>
        </div>
        <p class="platform-card-desc">{{ t('tg_desc') }}</p>
        <ul class="platform-card-features">
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('tg_f1') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('tg_f2') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('tg_f3') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('tg_f4') }}</span>
          </li>
        </ul>
        <a
          class="platform-card-link tg"
          href="https://t.me/msgboard_bot"
          rel="noopener"
          style="align-self: flex-start"
          target="_blank">
          @msgboard_bot &#8594;
        </a>
      </div>

      <div class="platform-card">
        <div class="platform-card-header">
          <div class="platform-card-icon mcp"><LandingIcon name="sparkle" /></div>
          <div>
            <div class="platform-card-name">{{ t('mcp_name') }}</div>
            <div class="platform-card-tag">{{ t('mcp_tag') }}</div>
          </div>
        </div>
        <p class="platform-card-desc">{{ t('mcp_desc') }}</p>
        <ul class="platform-card-features">
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('mcp_f1') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('mcp_f2') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('mcp_f3') }}</span>
          </li>
          <li>
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('mcp_f4') }}</span>
          </li>
        </ul>
        <a
          class="platform-card-link mcp"
          :href="appUrl"
          style="align-self: flex-start">
          {{ t('mcp_cta') }} &#8594;
        </a>
      </div>
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import { appUrl } from '../landingLinks'
import LandingIcon from './LandingIcon.vue'
import LandingSection from './LandingSection.vue'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      mcp_cta: 'Get an API key',
      mcp_desc:
        'Connect Claude or any MCP-compatible agent straight to your boards over the Model Context Protocol. Create a personal API key and the agent can act on your behalf.',
      mcp_f1: 'Read, create, edit and move issues',
      mcp_f2: 'Attach and download files',
      mcp_f3: 'Scoped to your own permissions',
      mcp_f4: 'Works with Claude and any MCP client',
      mcp_name: 'MCP / AI Agents',
      mcp_tag: 'boards.laraue.com/boards-mcp/mcp',
      open_webapp: 'Web App',
      pl_label: 'Three ways to use it',
      pl_sub:
        'Start in Telegram, continue in the browser, hand the routine to an AI agent. Your boards are always in sync.',
      pl_title: 'Telegram, web app and AI agents',
      tg_desc:
        'Access your boards inside Telegram without leaving the app. Forward any message to the bot and it lands on your board in seconds.',
      tg_f1: 'Forward messages from any chat',
      tg_f2: 'Native iOS & Android feel',
      tg_f3: 'Instant — nothing to install',
      tg_f4: 'The same boards as the web app',
      tg_name: 'Telegram Mini App',
      web_desc:
        'Full-featured Kanban in the browser. Sign in with Telegram or Google — no separate registration. Works on desktop and mobile.',
      web_f1: 'Telegram or Google sign-in — no password',
      web_f2: 'Full drag-and-drop Kanban',
      web_f3: 'Organization & permission management',
      web_f4: 'Large screen — see more, do more',
      web_name: 'Web App',
    },
    ru: {
      mcp_cta: 'Получить API-ключ',
      mcp_desc:
        'Подключите Claude или любого MCP-совместимого агента прямо к вашим доскам по протоколу Model Context Protocol. Создайте персональный API-ключ — и агент сможет действовать от вашего имени.',
      mcp_f1: 'Чтение, создание, редактирование и перемещение issues',
      mcp_f2: 'Прикладывайте и скачивайте файлы',
      mcp_f3: 'Права ограничены вашими правами доступа',
      mcp_f4: 'Работает с Claude и любым MCP-клиентом',
      mcp_name: 'MCP / ИИ-агенты',
      mcp_tag: 'boards.laraue.com/boards-mcp/mcp',
      open_webapp: 'Веб-приложение',
      pl_label: 'Три способа использования',
      pl_sub:
        'Начните в Telegram, продолжайте в браузере, рутину отдайте ИИ-агенту. Доски всегда синхронизированы.',
      pl_title: 'Telegram, веб-приложение и ИИ-агенты',
      tg_desc:
        'Доступ к доскам прямо внутри Telegram. Перешлите любое сообщение боту — оно сразу появится на доске.',
      tg_f1: 'Пересылка сообщений из любого чата',
      tg_f2: 'Нативный iOS и Android',
      tg_f3: 'Мгновенно — ничего не нужно устанавливать',
      tg_f4: 'Те же доски, что в веб-приложении',
      tg_name: 'Telegram Mini App',
      web_desc:
        'Полноценный Kanban в браузере. Вход через Telegram или Google без дополнительной регистрации. Работает на десктопе и мобильных.',
      web_f1: 'Вход через Telegram или Google — без пароля',
      web_f2: 'Drag-and-drop Kanban',
      web_f3: 'Управление организацией и правами',
      web_f4: 'Адаптация под большой экран',
      web_name: 'Веб-приложение',
    },
  },
  props.locale,
)
</script>

<style scoped>
.platform-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  padding: 32px;
  transition:
    box-shadow var(--duration-base),
    transform var(--duration-base);
}

.platform-card:hover {
  box-shadow: var(--shadow-popover);
  transform: translateY(-3px);
}

.platform-card-icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-accent);
  display: flex;
  flex-shrink: 0;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.platform-card-link {
  align-items: center;
  color: var(--color-accent);
  display: inline-flex;
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  gap: 6px;
  text-decoration: none;
  transition: gap 0.15s;
}

.platform-card-link:hover {
  gap: 10px;
}

.platforms-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 48px;
}

.platform-card-header {
  align-items: center;
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.platform-card-icon :deep(.landing-icon) {
  height: 24px;
  width: 24px;
}

.platform-card-name {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
}

.platform-card-tag {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.06em;
  margin-top: 2px;
  text-transform: uppercase;
}

.platform-card-desc {
  color: var(--color-muted);
  flex: 1;
  font-size: 15px;
  line-height: 1.65;
  margin-bottom: 24px;
}

.platform-card-features {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 28px;
}

.platform-card-features li {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: 13px;
  gap: 8px;
}

.platform-card-features li svg {
  flex-shrink: 0;
  height: 14px;
  stroke: var(--color-accent);
  width: 14px;
}

@media (width <= 900px) {
  .platforms-grid {
    grid-template-columns: 1fr;
  }
}
</style>
