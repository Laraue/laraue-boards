<template>
  <!-- Next to the space's name: the description is read now and then, not on every visit. -->
  <BasePopover
    v-if="hasContent"
    class="space-about">
    <template #trigger="{ open, toggle }">
      <BaseIconButton
        :aria-expanded="open"
        :label="t('about')"
        @click="toggle">
        <IconInfoCircle />
      </BaseIconButton>
    </template>
    <div class="space-about-body">
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
  </BasePopover>
</template>

<script setup lang="ts">
import { IconExternalLink, IconInfoCircle } from '@tabler/icons-vue'
import { computed } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import BasePopover from '#layers/core/app/ui/components/BasePopover.vue'
import {
  renderMarkdown,
  renderMarkdownAsText,
} from '#layers/workspace/app/shared/utils/renderMarkdown'

import type { SpaceAboutViewModel } from './SpaceAbout.types'

const props = defineProps<{
  about: SpaceAboutViewModel
}>()

const { t } = useI18n({
  en: {
    about: 'About this space',
  },
  ru: {
    about: 'Об этом пространстве',
  },
})

const hasContent = computed(() => !!props.about.description || props.about.links.length > 0)
</script>

<style scoped>
.space-about {
  --base-popover-width: 26rem;
}

.space-about-body {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
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
