<template>
  <SiteHeader
    :locale="locale"
    :other-language-path="otherLanguagePath" />
  <main class="compare">
    <article class="article">
      <h1 class="title">{{ content.h1 }}</h1>
      <p class="lead">{{ content.lead }}</p>

      <div class="verdict">
        <section class="verdict-card">
          <h2>{{ content.forBoards.title }}</h2>
          <ul>
            <li
              v-for="item in content.forBoards.items"
              :key="item">
              {{ item }}
            </li>
          </ul>
        </section>
        <section class="verdict-card">
          <h2>{{ content.forOther.title }}</h2>
          <ul>
            <li
              v-for="item in content.forOther.items"
              :key="item">
              {{ item }}
            </li>
          </ul>
        </section>
      </div>

      <h2>{{ content.table.title }}</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">{{ t('feature') }}</th>
              <th scope="col">{{ content.table.boardsHeader }}</th>
              <th scope="col">{{ content.competitor }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in content.table.rows"
              :key="row.feature">
              <th scope="row">{{ row.feature }}</th>
              <td>{{ row.boards }}</td>
              <td>{{ row.other }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="checked">
        <time :datetime="content.checkedAt">{{ content.checkedLabel }}</time>
      </p>

      <section
        v-for="section in content.sections"
        :key="section.title">
        <h2>{{ section.title }}</h2>
        <p
          v-for="paragraph in section.paragraphs"
          :key="paragraph">
          {{ paragraph }}
        </p>
      </section>

      <h2>{{ t('faq') }}</h2>
      <section
        v-for="item in content.faq"
        :key="item.question">
        <h3>{{ item.question }}</h3>
        <p>{{ item.answer }}</p>
      </section>

      <h2>{{ content.sourcesTitle }}</h2>
      <ul>
        <li
          v-for="source in content.sources"
          :key="source.href">
          <a
            :href="source.href"
            rel="noopener nofollow"
            target="_blank">
            {{ source.label }}
          </a>
        </li>
      </ul>

      <p class="cta">
        <NuxtLink :to="appUrl">{{ t('try') }}</NuxtLink>
        ·
        <NuxtLink :to="homePath">{{ t('learn_more') }}</NuxtLink>
      </p>

      <template v-if="related.length > 0">
        <h2>{{ relatedHeading[locale] }}</h2>
        <ul>
          <li
            v-for="item in related"
            :key="item.path">
            <NuxtLink :to="item.path">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </template>
    </article>
  </main>
  <SiteFooter :locale="locale" />
</template>

<script setup lang="ts">
import SiteFooter from '~/components/site/SiteFooter.vue'
import SiteHeader from '~/components/site/SiteHeader.vue'
import type { Locale } from '~/composables/useI18n'

import { appUrl } from '../landing/landingLinks'
import {
  type CompareSlug,
  compareContent,
  compareLabels,
  comparePaths,
  relatedHeading,
} from './compareContent'

const props = defineProps<{ locale: Locale; slug: CompareSlug }>()

const { t } = useI18n(
  {
    en: {
      faq: 'Questions',
      feature: 'Feature',
      learn_more: 'About Laraue Boards',
      try: 'Try Laraue Boards for free',
    },
    ru: {
      faq: 'Вопросы',
      feature: 'Возможность',
      learn_more: 'О Laraue Boards',
      try: 'Попробовать Laraue Boards бесплатно',
    },
  },
  props.locale,
)

const content = compareContent(props.slug, props.locale)
if (!content) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const siteUrl = useSiteConfig().url.replace(/\/$/, '')
const paths = comparePaths[props.slug]
const path = paths[props.locale] ?? ''
const pageUrl = `${siteUrl}${path}`
const homePath = props.locale === 'ru' ? '/ru' : '/'
const otherLocale: Locale = props.locale === 'ru' ? 'en' : 'ru'
// The language switch goes to the same comparison when it exists in the other language, and to
// the landing page when it does not.
const otherLanguagePath = paths[otherLocale] ?? (otherLocale === 'ru' ? '/ru' : '/')

// The other comparison pages in this language, each linked once and not repeated here.
const related = (Object.keys(comparePaths) as CompareSlug[])
  .filter((slug) => slug !== props.slug)
  .flatMap((slug) => {
    const relatedPath = comparePaths[slug][props.locale]

    return relatedPath ? [{ label: compareLabels[props.locale][slug], path: relatedPath }] : []
  })

// Only the languages the page exists in are alternates; x-default is English.
const alternates = (Object.keys(paths) as Locale[]).map((language) => ({
  href: `${siteUrl}${paths[language]}`,
  hreflang: language,
}))
const defaultAlternate = paths.en ?? paths[props.locale]

useHead({
  htmlAttrs: { lang: props.locale },
  link: [
    { href: pageUrl, rel: 'canonical' },
    ...alternates.map(({ href, hreflang }) => ({ href, hreflang, rel: 'alternate' as const })),
    ...(defaultAlternate
      ? [
          {
            href: `${siteUrl}${defaultAlternate}`,
            hreflang: 'x-default',
            rel: 'alternate' as const,
          },
        ]
      : []),
  ],
  meta: [{ content: 'width=device-width, initial-scale=1', name: 'viewport' }],
  script: [
    {
      // `<` is escaped so no text in the data can close the script element.
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@id': `${pageUrl}#page`,
            '@type': 'WebPage',
            about: { '@type': 'SoftwareApplication', name: 'Laraue Boards' },
            dateModified: content.checkedAt,
            description: content.seoDescription,
            inLanguage: props.locale,
            name: content.seoTitle,
            publisher: {
              '@type': 'Organization',
              name: 'Laraue Software',
              url: 'https://laraue.com',
            },
            url: pageUrl,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                item: props.locale === 'ru' ? `${siteUrl}/ru` : `${siteUrl}/`,
                name: 'Laraue Boards',
                position: 1,
              },
              { '@type': 'ListItem', item: pageUrl, name: content.h1, position: 2 },
            ],
          },
          {
            '@type': 'FAQPage',
            mainEntity: content.faq.map((item) => ({
              '@type': 'Question',
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
              name: item.question,
            })),
          },
        ],
      }).replaceAll('<', String.raw`<`),
      key: 'compare-jsonld',
      type: 'application/ld+json',
    },
  ],
  // The title already names the product; the app's template would add it a second time.
  titleTemplate: (pageTitle) => pageTitle ?? '',
})

useSeoMeta({
  description: content.seoDescription,
  ogDescription: content.seoDescription,
  ogLocale: props.locale === 'ru' ? 'ru_RU' : 'en_US',
  ogSiteName: 'Laraue Boards',
  ogTitle: content.seoTitle,
  ogType: 'website',
  ogUrl: pageUrl,
  robots: 'index, follow, max-image-preview:large',
  title: content.seoTitle,
  twitterCard: 'summary',
  twitterDescription: content.seoDescription,
  twitterTitle: content.seoTitle,
})
</script>

<style scoped>
.compare {
  margin: 0 auto;
  max-width: 980px;
  padding: 96px 24px 88px;
}

.title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.article .lead {
  color: var(--color-muted);
  font-size: 18px;
  line-height: 1.7;
  margin: 18px 0 32px;
}

.article {
  font-size: 16px;
  line-height: 1.75;
}

.article h2 {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin: 44px 0 14px;
}

.article h3 {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  margin: 20px 0 6px;
}

.article p {
  margin: 0 0 14px;
}

.article ul {
  list-style: disc;
  padding-left: 24px;
}

.article a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.verdict {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.verdict-card {
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: 12px;
  padding: 20px 22px;
}

.verdict-card h2 {
  font-size: 17px;
  margin: 0 0 10px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  font-size: 15px;
  line-height: 1.55;
  min-width: 640px;
  width: 100%;
}

th,
td {
  border: 1px solid var(--color-divider);
  padding: 12px 14px;
  text-align: left;
  vertical-align: top;
}

thead th {
  background: var(--color-surface);
}

tbody th {
  font-weight: var(--font-weight-bold);
  width: 20%;
}

.article .checked {
  color: var(--color-muted);
  font-size: 13px;
  margin-top: 10px;
}

.article .cta {
  font-weight: var(--font-weight-bold);
  margin-top: 40px;
}
</style>
