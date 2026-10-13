<template>
  <section class="interface-section">
    <BaseSectionHeader :title="t('interface')" />

    <div class="setting-list">
      <div class="setting-row">
        <label
          class="setting-info"
          for="interface-language">
          <strong>{{ t('language') }}</strong>
          <small class="muted">{{ t('languageHint') }}</small>
        </label>
        <BaseSelect
          id="interface-language"
          class="setting-control"
          :model-value="deps.locale.value"
          :options="[
            { label: 'English', value: 'en' },
            { label: 'Русский', value: 'ru' },
          ]"
          @update:model-value="changeLocale" />
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <strong>{{ t('theme') }}</strong>
          <small class="muted">{{ t('themeHint') }}</small>
        </div>
        <div
          :aria-label="t('theme')"
          class="base-tabs-list"
          role="group">
          <button
            v-for="option in themes"
            :key="option"
            :aria-pressed="deps.theme.value === option"
            class="base-tabs-tab"
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

.setting-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
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

:deep(.setting-control) {
  min-width: 180px;
  width: auto;
}

@media (max-width: 767px) {
  .setting-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
