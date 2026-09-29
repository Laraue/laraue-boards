<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink
        class="logo"
        :to="homePath">
        <img
          alt=""
          height="32"
          :src="laraueLogoUrl"
          width="32" />
        <span>Laraue Boards</span>
      </NuxtLink>
      <nav
        :aria-label="t('nav_label')"
        class="nav">
        <NuxtLink :to="`${homePath}#features`">{{ t('nav_features') }}</NuxtLink>
        <NuxtLink :to="`${homePath}#pricing`">{{ t('nav_pricing') }}</NuxtLink>
        <NuxtLink :to="`${homePath}#faq`">{{ t('nav_faq') }}</NuxtLink>
        <NuxtLink :to="docsHref">{{ t('documentation') }}</NuxtLink>
      </nav>
      <div class="actions">
        <button
          :aria-label="t('theme_toggle')"
          class="theme-toggle"
          type="button"
          @click="toggleTheme">
          <Sun v-if="theme === 'dark'" />
          <Moon v-else />
        </button>
        <NuxtLink
          class="lang"
          :hreflang="otherLocale"
          :to="otherLocalePath">
          {{ otherLocale.toUpperCase() }}
        </NuxtLink>
        <NuxtLink
          class="open-app"
          to="/organizations">
          {{ t('login') }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

import type { Locale } from '~/composables/useI18n'
import { docsPath } from '~/sections/docs/docsPaths'

const props = defineProps<{
  locale: Locale
  // Where the other language's version of the current page is; the landing page by default.
  otherLanguagePath?: string
}>()

const { t } = useI18n(
  {
    en: {
      documentation: 'Documentation',
      login: 'Log in',
      nav_faq: 'FAQ',
      nav_features: 'Features',
      nav_label: 'Main',
      nav_pricing: 'Pricing',
      theme_toggle: 'Switch theme',
    },
    ru: {
      documentation: 'Документация',
      login: 'Войти',
      nav_faq: 'Вопросы',
      nav_features: 'Возможности',
      nav_label: 'Основное меню',
      nav_pricing: 'Тарифы',
      theme_toggle: 'Сменить тему',
    },
  },
  props.locale,
)

const docsHref = computed(() => docsPath(props.locale))

const { setTheme, theme } = useAppPreferences()
const toggleTheme = (): void => setTheme(theme.value === 'dark' ? 'light' : 'dark')

const homePath = computed(() => (props.locale === 'ru' ? '/ru' : '/'))
const otherLocale = computed<Locale>(() => (props.locale === 'ru' ? 'en' : 'ru'))
const otherLocalePath = computed(
  () => props.otherLanguagePath ?? (otherLocale.value === 'ru' ? '/ru' : '/'),
)
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
  height: 60px;
  margin: 0 auto;
  max-width: 1160px;
  padding: 0 24px;
}

.logo {
  align-items: center;
  color: var(--color-text);
  display: flex;
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  gap: 10px;
  text-decoration: none;
}

.logo img {
  border-radius: 8px;
}

.nav {
  display: flex;
  gap: 24px;
  margin-left: auto;
}

.nav a,
.lang {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: color var(--duration-base);
}

.nav a:hover,
.lang:hover {
  color: var(--color-text);
}

.actions {
  align-items: center;
  display: flex;
  gap: 16px;
}

.theme-toggle {
  align-items: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: flex;
  height: 32px;
  justify-content: center;
  transition:
    color var(--duration-base),
    background var(--duration-base);
  width: 32px;
}

.theme-toggle:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

.open-app {
  background: var(--color-accent);
  border-radius: var(--radius-control);
  color: #fff;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  padding: 8px 16px;
  text-decoration: none;
  transition: background var(--duration-base);
}

.open-app:hover {
  background: color-mix(in srgb, var(--color-accent) 85%, #000);
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
