<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink
        class="logo"
        :to="homePath">
        <img
          alt=""
          height="28"
          src="/favicon.svg"
          width="28" />
        <span>Laraue Boards</span>
      </NuxtLink>
      <nav
        :aria-label="t('nav_label')"
        class="nav">
        <a href="#features">{{ t('nav_features') }}</a>
        <a href="#faq">{{ t('nav_faq') }}</a>
        <a :href="docsUrl">{{ t('documentation') }}</a>
      </nav>
      <div class="actions">
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
import type { LandingLocale } from '../LandingPage.messages'

import { useLandingText } from '../useLandingText'

const props = defineProps<{
  docsUrl: string
  locale: LandingLocale
}>()

const t = useLandingText(props.locale)

const homePath = computed(() => (props.locale === 'ru' ? '/ru' : '/'))
const otherLocale = computed<LandingLocale>(() => (props.locale === 'ru' ? 'en' : 'ru'))
const otherLocalePath = computed(() => (otherLocale.value === 'ru' ? '/ru' : '/'))
</script>

<style scoped>
.header {
  backdrop-filter: blur(12px);
  background: rgb(15 14 12 / 85%);
  border-bottom: 1px solid rgb(255 255 255 / 8%);
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
  color: var(--paper);
  display: flex;
  font-family: var(--serif);
  font-size: 16px;
  font-weight: 700;
  gap: 10px;
  text-decoration: none;
}

.logo img {
  border-radius: 6px;
}

.nav {
  display: flex;
  gap: 24px;
  margin-left: auto;
}

.nav a,
.lang {
  color: rgb(247 244 238 / 65%);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.nav a:hover,
.lang:hover {
  color: #fff;
}

.actions {
  align-items: center;
  display: flex;
  gap: 16px;
}

.open-app {
  background: var(--accent);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  text-decoration: none;
  transition: background 0.2s;
}

.open-app:hover {
  background: #b03d24;
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
