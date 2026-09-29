<template>
  <nav
    :aria-label="t('title')"
    class="sidebar">
    <NuxtLink
      class="sidebar-home"
      :class="{ active: current.length === 0 }"
      :to="docsPath(locale)">
      {{ t('title') }}
    </NuxtLink>
    <ul class="sections">
      <li
        v-for="section in tree.children"
        :key="section.path.join('/')"
        class="section">
        <NuxtLink
          class="section-title"
          :class="{ active: isCurrent(section.path) }"
          :to="docsPath(locale, section.path)">
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
              :to="docsPath(locale, page.path)">
              {{ page.meta.title }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import type { DocNode } from '../content/DocsContent.types'
import { docsPath } from '../docsPaths'

const props = defineProps<{
  current: string[]
  locale: Locale
  tree: DocNode
}>()

const { t } = useI18n(
  {
    en: { title: 'Documentation' },
    ru: { title: 'Документация' },
  },
  props.locale,
)

const isCurrent = (path: string[]): boolean => path.join('/') === props.current.join('/')
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-home {
  color: var(--color-text);
  display: block;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
}

.sections,
.pages {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sections {
  gap: 18px;
}

.section-title {
  color: var(--color-text);
  display: block;
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.02em;
  line-height: 1.35;
  text-decoration: none;
  text-wrap: balance;
}

.pages {
  border-left: 1px solid var(--color-divider);
  margin-top: 6px;
}

.page-link {
  border-left: 2px solid transparent;
  color: var(--color-muted);
  display: block;
  font-size: 13px;
  line-height: 1.4;
  margin-left: -1px;
  padding: 5px 12px;
  text-decoration: none;
  transition: color var(--duration-base);
}

.page-link:hover,
.section-title:hover,
.sidebar-home:hover {
  color: var(--color-accent);
}

.page-link.active {
  border-left-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.section-title.active,
.sidebar-home.active {
  color: var(--color-accent);
}
</style>
