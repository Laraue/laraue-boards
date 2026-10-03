<template>
  <button
    :aria-label="t('switchLanguage')"
    class="header-btn"
    type="button"
    @click="setLocale(locale === 'ru' ? 'en' : 'ru')">
    {{ locale === 'ru' ? 'EN' : 'RU' }}
  </button>
  <button
    :aria-label="theme === 'dark' ? t('lightTheme') : t('darkTheme')"
    :aria-pressed="theme === 'dark'"
    class="header-btn"
    type="button"
    @click="setTheme(theme === 'dark' ? 'light' : 'dark')">
    <Sun v-if="theme === 'dark'" />
    <Moon v-else />
  </button>
</template>

<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const { locale, setLocale, setTheme, theme } = useAppPreferences()
const { t } = useI18n({
  en: {
    darkTheme: 'Switch to dark theme',
    lightTheme: 'Switch to light theme',
    switchLanguage: 'Переключить на русский',
  },
  ru: {
    darkTheme: 'Включить тёмную тему',
    lightTheme: 'Включить светлую тему',
    switchLanguage: 'Switch to English',
  },
})
</script>
