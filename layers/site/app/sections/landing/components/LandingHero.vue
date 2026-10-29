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
        link="/organizations"
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
      <LandingVideo />
    </template>
  </LandingIntro>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useLocalePath } from '#imports'
import { laraueWebsiteUrl } from '#layers/core/app/constants/links'
import { useI18n } from '#layers/core/app/i18n/useI18n'

import LandingActionButton from './LandingActionButton.vue'
import LandingIntro from './LandingIntro.vue'
import LandingPlatformBadge from './LandingPlatformBadge.vue'
import LandingVideo from './LandingVideo.vue'

const { locale, t } = useI18n({
  en: {
    documentation: 'Documentation',
    hero_eyebrow: 'Task board for small teams',
    hero_sub:
      'Save messages from Telegram chats as cards, and let Claude or any MCP agent read and update the same board. Lightweight by design: free to start, open source.',
    hero_title: 'Tasks from your chats,\nmanaged by you and your AI agent',
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
    open_app: 'Открыть приложение',
    project_description: 'Подробнее о проекте',
  },
})

const localePath = useLocalePath()
const docsUrl = computed(() =>
  localePath({ name: 'documentation-path', params: { path: [] } }, locale.value),
)
const projectUrl = computed(() => laraueWebsiteUrl(locale.value, '/blog/projects/boards'))
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
</style>
