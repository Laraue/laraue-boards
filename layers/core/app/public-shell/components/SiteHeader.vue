<template>
  <header class="header">
    <div class="header-inner">
      <BrandLogo :to="homePath" />
      <nav
        :aria-label="t('nav_label')"
        class="nav">
        <NuxtLink :to="`${homePath}#features`">{{ t('nav_features') }}</NuxtLink>
        <NuxtLink :to="`${homePath}#pricing`">{{ t('nav_pricing') }}</NuxtLink>
        <NuxtLink :to="`${homePath}#faq`">{{ t('nav_faq') }}</NuxtLink>
        <NuxtLink :to="docsHref">{{ t('documentation') }}</NuxtLink>
      </nav>
      <div class="actions">
        <BaseIconButton
          v-for="language in availableLocales"
          :key="language.code"
          :hreflang="language.code"
          :label="language.code.toUpperCase()"
          :to="languagePath(language.code)">
          {{ language.code.toUpperCase() }}
        </BaseIconButton>
        <BaseIconButton
          :label="t('theme_toggle')"
          @click="toggleTheme">
          <IconSun v-if="theme === 'dark'" />
          <IconMoon v-else />
        </BaseIconButton>
        <NuxtLink
          class="open-app"
          to="/organizations">
          {{ t('open_app') }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IconMoon, IconSun } from '@tabler/icons-vue'
import { computed } from 'vue'

import { NuxtLink } from '#components'
import { useLocalePath, useSwitchLocalePath } from '#imports'
import BrandLogo from '#layers/core/app/branding/BrandLogo.vue'
import { useAvailableLocales, useI18n } from '#layers/core/app/i18n/useI18n'
import type { Locale } from '#layers/core/app/i18n/useI18n'
import { useAppPreferences } from '#layers/core/app/preferences/useAppPreferences'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'

const availableLocales = useAvailableLocales()

const { locale, t } = useI18n({
  en: {
    documentation: 'Documentation',
    nav_faq: 'FAQ',
    nav_features: 'Features',
    nav_label: 'Main',
    nav_pricing: 'Pricing',
    open_app: 'Open App',
    theme_toggle: 'Switch theme',
  },
  ru: {
    documentation: 'Документация',
    nav_faq: 'Вопросы',
    nav_features: 'Возможности',
    nav_label: 'Основное меню',
    nav_pricing: 'Тарифы',
    open_app: 'Открыть приложение',
    theme_toggle: 'Сменить тему',
  },
})

const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
// The same page in another language, without the #section: the server never sees the hash, so a
// link with it would differ between the server's page and the browser's.
const languagePath = (code: Locale): string =>
  (switchLocalePath(code) || localePath('index', code)).split('#')[0] ?? ''
const docsHref = computed(() =>
  localePath({ name: 'documentation-path', params: { path: [] } }, locale.value),
)

const { setTheme, theme } = useAppPreferences()
const toggleTheme = (): void => setTheme(theme.value === 'dark' ? 'light' : 'dark')

const homePath = computed(() => localePath('index', locale.value))
</script>

<style scoped>
.header {
  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--color-surface) 85%, transparent);
  border-bottom: 1px solid var(--color-divider);
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 10;
}

.header-inner {
  align-items: center;
  display: flex;
  gap: 24px;
  /* Plus the header's border, like the app's header. */
  height: 55px;
  margin: 0 auto;
  /* The width of the docs' content. The header has the same width on every page, so it does not
     change size when moving between the landing page and the docs. */
  max-width: 1360px;
  padding: 0 24px;
}

.nav {
  display: flex;
  gap: 24px;
  margin-left: auto;
}

.nav a {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: color var(--duration-base);
}

.nav a:hover {
  color: var(--color-text);
}

.actions {
  align-items: center;
  display: flex;
  gap: var(--space-1);
}

.open-app {
  align-items: center;
  background: var(--color-action);
  border-radius: var(--radius-control);
  color: #fff;
  display: inline-flex;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  height: 32px;
  margin-left: var(--space-2);
  padding: 0 var(--space-3);
  text-decoration: none;
  transition: background var(--duration-base);
}

.open-app:hover {
  background: var(--color-action-hover);
}

@media (width <= 860px) {
  .nav {
    display: none;
  }

  .actions {
    margin-left: auto;
  }
}
</style>
