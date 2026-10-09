<template>
  <nav
    v-if="headings.length > 0"
    :aria-label="t('title')"
    class="toc">
    <div class="toc-title">{{ t('title') }}</div>
    <ul>
      <li
        v-for="heading in headings"
        :key="heading.id"
        :class="{ nested: heading.level === 3 }">
        <a :href="`#${heading.id}`">{{ heading.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import type { DocHeading } from '../content/DocsContent.types'

const props = defineProps<{
  headings: DocHeading[]
  locale: Locale
}>()

const { t } = useI18n(
  {
    en: { title: 'On this page' },
    ru: { title: 'На этой странице' },
  },
  props.locale,
)
</script>

<style scoped>
.toc-title {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  text-transform: uppercase;
}

ul {
  border-left: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

a {
  color: var(--color-muted);
  display: block;
  font-size: var(--font-size-small);
  line-height: 1.4;
  padding: 4px 12px;
  text-decoration: none;
  transition: color var(--duration-base);
}

a:hover {
  color: var(--color-accent);
}

.nested a {
  padding-left: 24px;
}
</style>
