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
            <!-- eslint-disable-next-line vue/no-v-html -- plain text, escaped by renderMarkdownAsText -->
            <span v-html="renderMarkdownAsText(link.description)" />
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { IconChevronDown, IconExternalLink, IconInfoCircle } from '@tabler/icons-vue'

import { renderMarkdown, renderMarkdownAsText } from '~/utils/renderMarkdown'

import type { SpaceAboutViewModel } from './SpaceAbout.types'

const props = defineProps<{
  about: SpaceAboutViewModel
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    about: 'About this space',
  },
  ru: {
    about: 'Об этом разделе',
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
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Drawn like the issue page's links: a plain row that highlights on hover, not a blue underlined link. */
.space-about-link {
  align-items: center;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  margin: 0 calc(-1 * var(--space-2));
  min-width: 0;
  padding: var(--space-1) var(--space-2);
  text-decoration: none;
}

.space-about-link:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.space-about-link > svg {
  color: var(--color-muted);
  flex: none;
  height: 14px;
  width: 14px;
}

.space-about-link > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (hover: hover) and (pointer: fine) {
  .space-about-link:hover {
    background: var(--color-row-hover);
  }
}
</style>
