<template>
  <article class="article">
    <nav
      v-if="page.breadcrumbs.length > 1"
      :aria-label="t('breadcrumbs')"
      class="breadcrumbs">
      <template
        v-for="(crumb, index) in page.breadcrumbs"
        :key="crumb.path.join('/')">
        <span
          v-if="index === page.breadcrumbs.length - 1"
          aria-current="page">
          {{ crumb.title }}
        </span>
        <template v-else>
          <NuxtLink :to="docsPath(locale, crumb.path)">{{ crumb.title }}</NuxtLink>
          <span aria-hidden="true">/</span>
        </template>
      </template>
    </nav>
    <h1 class="title">{{ page.meta.title }}</h1>
    <p class="updated">{{ t('updated') }} {{ updated }}</p>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      class="content"
      @click="openInternalLink"
      v-html="page.html"></div>
    <nav
      v-if="page.previous || page.next"
      :aria-label="t('pages')"
      class="pager">
      <NuxtLink
        v-if="page.previous"
        class="pager-link"
        :to="docsPath(locale, page.previous.path)">
        <span class="pager-label">← {{ t('previous') }}</span>
        {{ page.previous.title }}
      </NuxtLink>
      <NuxtLink
        v-if="page.next"
        class="pager-link next"
        :to="docsPath(locale, page.next.path)">
        <span class="pager-label">{{ t('next') }} →</span>
        {{ page.next.title }}
      </NuxtLink>
    </nav>
  </article>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import type { DocPage } from '../content/DocsContent.types'
import { docsPath } from '../docsPaths'

const props = defineProps<{
  locale: Locale
  page: DocPage
}>()

const { t } = useI18n(
  {
    en: {
      breadcrumbs: 'Breadcrumbs',
      next: 'Next',
      pages: 'Previous and next page',
      previous: 'Previous',
      updated: 'Updated',
    },
    ru: {
      breadcrumbs: 'Навигационная цепочка',
      next: 'Следующая',
      pages: 'Предыдущая и следующая страницы',
      previous: 'Предыдущая',
      updated: 'Обновлено',
    },
  },
  props.locale,
)

// The dates are calendar days (2026-08-20), so they are shown as they are written, in any timezone.
const updated = computed(() =>
  new Intl.DateTimeFormat(props.locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(props.page.meta.updatedAt),
  ),
)

// Links inside the text are plain `<a>` from markdown: move between docs pages without a reload.
const openInternalLink = async (event: MouseEvent): Promise<void> => {
  const link = (event.target as HTMLElement).closest('a')
  const href = link?.getAttribute('href')
  if (
    !href?.startsWith('/') ||
    link?.target ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0
  ) {
    return
  }

  event.preventDefault()
  await navigateTo(href)
}
</script>

<style scoped>
.article {
  min-width: 0;
}

.breadcrumbs {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  gap: 6px;
  margin-bottom: 16px;
}

.breadcrumbs a {
  color: var(--color-muted);
  text-decoration: none;
}

.breadcrumbs a:hover {
  color: var(--color-accent);
}

.title {
  font-size: clamp(28px, 4vw, 38px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.updated {
  color: var(--color-muted);
  font-size: 13px;
  margin: 10px 0 28px;
}

.content {
  font-size: 16px;
  line-height: 1.75;
}

.content :deep(h2) {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin: 44px 0 14px;
  scroll-margin-top: 84px;
}

.content :deep(h3) {
  font-size: 19px;
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  margin: 32px 0 10px;
  scroll-margin-top: 84px;
}

.content :deep(p),
.content :deep(ul),
.content :deep(ol),
.content :deep(table),
.content :deep(pre),
.content :deep(blockquote) {
  margin: 0 0 16px;
}

.content :deep(ul),
.content :deep(ol) {
  padding-left: 24px;
}

.content :deep(ul) {
  list-style: disc;
}

.content :deep(li) {
  margin: 4px 0;
}

.content :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.content :deep(code) {
  background: var(--color-soft);
  border-radius: var(--radius-small);
  font-family: var(--font-family-mono);
  font-size: 0.88em;
  padding: 2px 6px;
}

.content :deep(pre) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow-x: auto;
  padding: 14px 16px;
}

.content :deep(pre code) {
  background: none;
  padding: 0;
}

.content :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  color: var(--color-muted);
  padding: 4px 16px;
}

.content :deep(img) {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: block;
  height: auto;
  margin: 20px 0;
  max-width: 100%;
}

.content :deep(table) {
  border-collapse: collapse;
  display: block;
  font-size: 14px;
  overflow-x: auto;
}

.content :deep(th),
.content :deep(td) {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  text-align: left;
}

.content :deep(th) {
  background: var(--color-soft);
}

.content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-divider);
  margin: 32px 0;
}

.pager {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;
  margin-top: 56px;
}

.pager-link {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  font-weight: var(--font-weight-semibold);
  gap: 4px;
  padding: 14px 18px;
  text-decoration: none;
  transition: border-color var(--duration-base);
}

.pager-link:hover {
  border-color: var(--color-accent);
}

.pager-link.next {
  grid-column: 2;
  text-align: right;
}

.pager-label {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

@media (width <= 720px) {
  .pager {
    grid-template-columns: 1fr;
  }

  .pager-link.next {
    grid-column: 1;
  }
}
</style>
