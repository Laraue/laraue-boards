<template>
  <section
    v-if="hasContent"
    class="space-about"
    :class="{ collapsed: state.collapsed }">
    <button
      :aria-expanded="!state.collapsed"
      class="space-about-toggle"
      type="button"
      @click="toggle">
      <IconInfoCircle />
      <span>{{ t('about') }}</span>
      <IconChevronDown class="space-about-chevron" />
    </button>
    <div
      v-if="!state.collapsed"
      class="space-about-body">
      <!-- eslint-disable vue/no-v-html -- sanitized by renderMarkdown -->
      <div
        v-if="about.description"
        class="markdown"
        v-html="renderMarkdown(about.description)" />
      <!-- eslint-enable vue/no-v-html -->
      <ul
        v-if="about.links.length"
        class="space-about-links">
        <li
          v-for="link in about.links"
          :key="link.id">
          <a
            class="space-about-link"
            :href="link.url"
            rel="noopener noreferrer"
            target="_blank">
            <IconExternalLink />
            <span>{{ displayUrl(link.url) }}</span>
          </a>
          <!-- eslint-disable vue/no-v-html -- sanitized by renderMarkdown -->
          <div
            class="markdown muted space-about-link-description"
            v-html="renderMarkdown(link.description)" />
          <!-- eslint-enable vue/no-v-html -->
        </li>
      </ul>
      <NuxtLink
        v-if="about.canEdit"
        class="space-about-edit"
        :to="settingsTo">
        {{ t('edit') }}
      </NuxtLink>
    </div>
  </section>
  <NuxtLink
    v-else-if="about.canEdit"
    class="space-about-empty"
    :to="settingsTo">
    <IconInfoCircle />
    {{ t('describe') }}
  </NuxtLink>
</template>

<script setup lang="ts">
import { IconChevronDown, IconExternalLink, IconInfoCircle } from '@tabler/icons-vue'
import type { RouteLocationRaw } from 'vue-router'

import { renderMarkdown } from '~/utils/renderMarkdown'

import type { SpaceAboutViewModel } from './SpaceAbout.types'

const props = defineProps<{
  about: SpaceAboutViewModel
  settingsTo: RouteLocationRaw
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    about: 'About this space',
    describe: 'Describe this space and link its repositories and docs',
    edit: 'Edit description and links',
  },
  ru: {
    about: 'Об этом разделе',
    describe: 'Опишите раздел и добавьте ссылки на его репозитории и документацию',
    edit: 'Изменить описание и ссылки',
  },
})

// Remembered per person and space, in a cookie so the page renders the same on the server.
const collapsedCookie = useCookie<string | undefined>(`space-about-${props.spaceKey}`, {
  maxAge: 60 * 60 * 24 * 365,
})

const state = reactive({ collapsed: collapsedCookie.value === 'collapsed' })

const hasContent = computed(() => !!props.about.description || props.about.links.length > 0)

const toggle = (): void => {
  state.collapsed = !state.collapsed
  collapsedCookie.value = state.collapsed ? 'collapsed' : undefined
}

// The host and path are what tell links apart; the scheme is noise.
const displayUrl = (url: string): string => url.replace(/^https?:\/\//, '').replace(/\/$/, '')
</script>

<style scoped>
.space-about {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  margin: var(--space-4);
}

.space-about-toggle {
  align-items: center;
  background: none;
  border: 0;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  width: 100%;
}

.space-about-toggle:focus-visible {
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-focus);
  outline: none;
}

.space-about-toggle > svg {
  color: var(--color-muted);
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.space-about-chevron {
  margin-left: auto;
  transition: transform 0.15s ease;
}

.collapsed .space-about-chevron {
  transform: rotate(-90deg);
}

.space-about-body {
  display: grid;
  gap: var(--space-4);
  padding: 0 var(--space-4) var(--space-4);
}

.space-about-links {
  display: grid;
  gap: var(--space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.space-about-link {
  align-items: center;
  display: inline-flex;
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  overflow-wrap: anywhere;
}

.space-about-link > svg {
  flex: none;
  height: 14px;
  width: 14px;
}

.space-about-link-description {
  font-size: var(--font-size-small);
  margin-top: var(--space-1);
}

.space-about-edit {
  font-size: var(--font-size-small);
  justify-self: start;
}

.space-about-empty {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  margin: var(--space-4);
}

.space-about-empty > svg {
  height: var(--icon-size);
  width: var(--icon-size);
}
</style>
