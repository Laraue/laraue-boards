<template>
  <section class="interface-section">
    <h2>{{ t('interface') }}</h2>

    <div class="setting-list">
      <div class="setting-row">
        <label
          class="setting-info"
          for="interface-language">
          <strong>{{ t('language') }}</strong>
          <small class="muted">{{ t('languageHint') }}</small>
        </label>
        <select
          id="interface-language"
          class="setting-control"
          :value="deps.locale.value"
          @change="changeLocale(($event.target as HTMLSelectElement).value)">
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <strong>{{ t('theme') }}</strong>
          <small class="muted">{{ t('themeHint') }}</small>
        </div>
        <div
          :aria-label="t('theme')"
          class="theme-switch"
          role="group">
          <button
            v-for="option in themes"
            :key="option"
            :aria-pressed="deps.theme.value === option"
            type="button"
            @click="deps.setTheme(option)">
            {{ option === 'light' ? t('light') : t('dark') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Theme } from '~/composables/useAppPreferences'
import { isLocale } from '~/composables/useI18n'

import type { InterfaceSectionDeps } from './InterfaceSection.deps'

const props = defineProps<{ deps: InterfaceSectionDeps }>()

const { t } = useI18n({
  en: {
    dark: 'Dark',
    interface: 'Interface',
    language: 'Language',
    languageHint: 'Menus, buttons and the bot’s messages',
    light: 'Light',
    theme: 'Theme',
    themeHint: 'Light or dark',
  },
  ru: {
    dark: 'Тёмная',
    interface: 'Интерфейс',
    language: 'Язык',
    languageHint: 'Меню, кнопки и сообщения бота',
    light: 'Светлая',
    theme: 'Тема',
    themeHint: 'Светлая или тёмная',
  },
})

const themes: Theme[] = ['light', 'dark']

const changeLocale = (value: string): void => {
  if (isLocale(value)) {
    props.deps.setLocale(value)
  }
}
</script>

<style scoped>
.interface-section {
  display: grid;
  gap: var(--space-3);
}

.interface-section h2 {
  font-size: var(--font-size-lg);
  margin: 0;
}

.setting-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.setting-row {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-4);
}

.setting-row + .setting-row {
  border-top: 1px solid var(--color-divider);
}

.setting-info {
  display: grid;
  font-weight: normal;
  gap: var(--space-1);
  margin: 0;
}

.setting-control {
  min-width: 180px;
  width: auto;
}

.theme-switch {
  background: var(--color-soft);
  border-radius: var(--radius-control);
  display: flex;
  gap: 2px;
  padding: 3px;
}

.theme-switch button {
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  font-weight: var(--font-weight-semibold);
  height: 34px;
  padding: 0 var(--space-3);
}

.theme-switch button[aria-pressed='true'] {
  background: var(--color-surface);
  box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
  color: var(--color-text);
}

@media (max-width: 767px) {
  .setting-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
