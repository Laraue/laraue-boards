<template>
  <SiteHeader
    :locale="locale"
    :other-language-path="otherLanguagePath" />
  <div class="docs">
    <details class="mobile-menu">
      <summary>{{ t('menu') }}</summary>
      <DocsSidebar
        :current="path"
        :locale="locale"
        :tree="menu" />
    </details>
    <aside class="docs-sidebar">
      <DocsSidebar
        :current="path"
        :locale="locale"
        :tree="menu" />
    </aside>
    <DocsArticle
      :locale="locale"
      :page="page" />
    <aside class="docs-toc">
      <DocsToc
        :headings="page.headings"
        :locale="locale" />
    </aside>
  </div>
  <SiteFooter :locale="locale" />
</template>

<script setup lang="ts">
import SiteFooter from '~/components/site/SiteFooter.vue'
import SiteHeader from '~/components/site/SiteHeader.vue'
import type { Locale } from '~/composables/useI18n'

import DocsArticle from './components/DocsArticle.vue'
import DocsSidebar from './components/DocsSidebar.vue'
import DocsToc from './components/DocsToc.vue'
import type { DocsPageDeps } from './DocsPage.deps'
import { docsPath } from './docsPaths'

const props = defineProps<{
  deps: DocsPageDeps
  locale: Locale
  path: string[]
}>()

const { t } = useI18n(
  {
    en: { menu: 'Documentation menu' },
    ru: { menu: 'Меню документации' },
  },
  props.locale,
)

const pageKey = `docs-page-${props.locale}-${props.path.join('/')}`
const [{ data: tree }, { data: result }] = await Promise.all([
  // The menu is the same on every page: it is loaded once per language.
  useQuery(`docs-tree-${props.locale}`, () => props.deps.getTree(props.locale), { cached: true }),
  useAsyncData(pageKey, () => props.deps.getPage(props.locale, props.path)),
])

if (result.value?.status !== 'success' || !tree.value) {
  throw createError({
    fatal: true,
    statusCode: result.value?.status === 'error' ? result.value.code || 500 : 500,
  })
}
const page = result.value.data
const menu = tree.value

const otherLocale: Locale = props.locale === 'ru' ? 'en' : 'ru'
// The other language's version of this page, or the docs' home page when it has none.
const otherLanguagePath = docsPath(
  otherLocale,
  page.alternates.includes(otherLocale) ? props.path : [],
)

useHead({ htmlAttrs: { lang: props.locale } })
useSeoMeta({ description: page.meta.description, title: page.meta.title })
</script>

<style scoped>
.docs {
  display: grid;
  gap: 48px;
  grid-template-columns: 240px minmax(0, 1fr) 220px;
  margin: 0 auto;
  max-width: 1240px;
  padding: 96px 24px 72px;
}

.docs-sidebar,
.docs-toc {
  align-self: start;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  position: sticky;
  top: 84px;
}

.mobile-menu {
  display: none;
}

@media (width <= 1100px) {
  .docs {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .docs-toc {
    display: none;
  }
}

@media (width <= 860px) {
  .docs {
    display: block;
    padding-top: 84px;
  }

  .docs-sidebar {
    display: none;
  }

  .mobile-menu {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    display: block;
    margin-bottom: 24px;
    padding: 12px 16px;
  }

  .mobile-menu summary {
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
  }

  .mobile-menu[open] summary {
    margin-bottom: 16px;
  }
}
</style>
