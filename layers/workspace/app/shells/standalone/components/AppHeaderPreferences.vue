<template>
  <BaseIconButton
    v-for="language in availableLocales"
    :key="language.code"
    :label="t('switchLanguage')"
    @click="setLocale(language.code)">
    {{ language.code.toUpperCase() }}
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

import { useAvailableLocales, useI18n } from '#layers/core/app/i18n/useI18n'
import { useAppPreferences } from '#layers/core/app/preferences/useAppPreferences'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'

const availableLocales = useAvailableLocales()
const { setLocale, setTheme, theme } = useAppPreferences()
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
