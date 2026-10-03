<template>
  <IconButton
    :label="t('switchLanguage')"
    @click="setLocale(locale === 'ru' ? 'en' : 'ru')">
    {{ locale === 'ru' ? 'EN' : 'RU' }}
  </IconButton>
  <IconButton
    :label="theme === 'dark' ? t('lightTheme') : t('darkTheme')"
    :aria-pressed="theme === 'dark'"
    @click="setTheme(theme === 'dark' ? 'light' : 'dark')">
    <IconSun v-if="theme === 'dark'" />
    <IconMoon v-else />
  </IconButton>
</template>

<script setup lang="ts">
import { IconMoon, IconSun } from '@tabler/icons-vue'

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
