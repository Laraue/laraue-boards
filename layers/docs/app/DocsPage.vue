<template>
  <SiteHeader />
  <div class="docs">
    <details class="mobile-menu">
      <summary>{{ t('menu') }}</summary>
      <DocsSidebar
        :current="path"
        :tree="menu" />
    </details>
    <aside class="docs-sidebar">
      <DocsSidebar
        :current="path"
        :tree="menu" />
    </aside>
    <DocsArticle :page="page" />
    <aside class="docs-toc">
      <DocsToc :headings="page.headings" />
    </aside>
  </div>
  <SiteFooter />
</template>

<script setup lang="ts">
import { createError, useAsyncData, useHead, useSeoMeta } from '#app'
import {
  defineArticle,
  defineBreadcrumb,
  defineWebPage,
  useLocaleHead,
  useLocalePath,
  useSchemaOrg,
} from '#imports'
import { previewImageUrl } from '#layers/core/app/constants/links'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import type { Locale } from '#layers/core/app/i18n/useI18n'
import SiteFooter from '#layers/core/app/public-shell/components/SiteFooter.vue'
import SiteHeader from '#layers/core/app/public-shell/components/SiteHeader.vue'

import DocsArticle from './components/DocsArticle.vue'
import DocsSidebar from './components/DocsSidebar.vue'
import DocsToc from './components/DocsToc.vue'
import type { DocsPageDeps } from './DocsPage.deps'

const props = defineProps<{
  deps: DocsPageDeps
  locale: Locale
  path: string[]
}>()

const { t } = useI18n(
  {
    en: { documentation: 'Documentation', menu: 'Documentation menu' },
    ru: { documentation: 'Документация', menu: 'Меню документации' },
  },
  props.locale,
)

const pageKey = `docs-page-${props.locale}-${props.path.join('/')}`
const [{ data: tree, error: treeError }, { data: result, error: pageError }] = await Promise.all([
  // The menu is the same on every page: it is loaded once per language.
  useAsyncData(`docs-tree-${props.locale}`, () => props.deps.getTree(props.locale), {
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  }),
  useAsyncData(pageKey, () => props.deps.getPage(props.locale, props.path)),
])

if (!result.value || !tree.value) {
  // The deps throw an `ApiError`, whose status (404 for a missing page) becomes the error's code.
  const statusCode = pageError.value?.statusCode ?? treeError.value?.statusCode ?? 500
  throw createError({ fatal: true, statusCode })
}
const page = result.value
const menu = tree.value
const localePath = useLocalePath()

// Every article exists in both languages (see the content test), so the language switch and the
// hreflang links keep the path. Canonical, og tags, the preview image and the Organization, WebSite
// and WebPage nodes come from nuxt-seo-utils, nuxt-schema-org and the layout.
const { createdAt, description, keywords, kind, title, updatedAt } = page.meta
const docsPath = (segments: string[]) =>
  localePath({ name: 'documentation-path', params: { path: segments } }, props.locale)

useHead(useLocaleHead())
if (keywords.length > 0) {
  useHead({ meta: [{ content: keywords.join(', '), name: 'keywords' }] })
}
useSeoMeta({
  articleModifiedTime: updatedAt,
  articlePublishedTime: createdAt,
  description,
  ogImageAlt: title,
  ogType: kind === 'page' ? 'article' : 'website',
  title,
})
useSchemaOrg([
  kind === 'page'
    ? defineArticle({
        '@type': 'TechArticle',
        dateModified: updatedAt,
        datePublished: createdAt,
        headline: title,
        image: previewImageUrl[props.locale],
        keywords,
      })
    : defineWebPage({ '@type': 'CollectionPage', dateModified: updatedAt }),
  // Product > Documentation > sections > the page; the page's first crumb is the docs' home.
  defineBreadcrumb({
    itemListElement: [
      { item: localePath('index', props.locale), name: 'Laraue Boards' },
      { item: docsPath([]), name: t('documentation') },
      ...page.breadcrumbs
        .slice(1)
        .map((crumb) => ({ item: docsPath(crumb.path), name: crumb.title })),
    ],
  }),
])
</script>

<style scoped>
.docs {
  display: grid;
  gap: 56px;
  grid-template-columns: 240px minmax(0, 1fr) 200px;
  margin: 0 auto;
  max-width: 1360px;
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
    gap: 40px;
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
