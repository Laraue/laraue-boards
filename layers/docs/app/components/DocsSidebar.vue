<template>
  <nav
    :aria-label="t('title')"
    class="sidebar">
    <ul class="sections">
      <li
        v-for="section in tree.children"
        :key="section.path.join('/')"
        class="section">
        <NuxtLink
          class="section-title"
          :class="{ active: isCurrent(section.path) }"
          :to="localePath({ name: 'documentation-path', params: { path: section.path } }, locale)">
          {{ section.meta.title }}
        </NuxtLink>
        <ul
          v-if="section.children.length > 0"
          class="pages">
          <li
            v-for="page in section.children"
            :key="page.path.join('/')">
            <NuxtLink
              class="page-link"
              :class="{ active: isCurrent(page.path) }"
              :to="localePath({ name: 'documentation-path', params: { path: page.path } }, locale)">
              {{ page.meta.title }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { useLocalePath } from '#imports'
import { useI18n } from '#layers/core/app/i18n/useI18n'

import type { DocNode } from '../../shared/DocsContent.types'

const props = defineProps<{
  current: string[]
  tree: DocNode
}>()

const localePath = useLocalePath()
const { locale, t } = useI18n({
  en: { title: 'Documentation' },
  ru: { title: 'Документация' },
})

const isCurrent = (path: string[]): boolean => path.join('/') === props.current.join('/')
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sections,
.pages {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sections {
  gap: 24px;
}

.section-title {
  color: var(--color-text);
  display: block;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.02em;
  line-height: 1.35;
  text-decoration: none;
  text-wrap: balance;
}

.pages {
  border-left: 1px solid var(--color-divider);
  margin-top: 8px;
}

.page-link {
  border-left: 2px solid transparent;
  color: var(--color-muted);
  display: block;
  font-size: var(--font-size-body);
  line-height: 1.4;
  margin-left: -1px;
  padding: 6px 12px;
  text-decoration: none;
  transition: color var(--duration-base);
}

.page-link:hover,
.section-title:hover {
  color: var(--color-accent);
}

.page-link.active {
  border-left-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.section-title.active {
  color: var(--color-accent);
}
</style>
