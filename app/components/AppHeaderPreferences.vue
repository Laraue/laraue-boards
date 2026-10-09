<template>
  <BaseIconButton
    :label="t('switchLanguage')"
    @click="setLocale(locale === 'ru' ? 'en' : 'ru')">
    {{ locale === 'ru' ? 'EN' : 'RU' }}
  </BaseIconButton>
  <BaseIconButton
    :aria-pressed="theme === 'dark'"
    :label="theme === 'dark' ? t('lightTheme') : t('darkTheme')"
    @click="setTheme(theme === 'dark' ? 'light' : 'dark')">
    <IconSun v-if="theme === 'dark'" />
    <IconMoon v-else />
  </BaseIconButton>
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
