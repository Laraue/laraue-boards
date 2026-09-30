<template>
  <SiteHeader
    :locale="locale"
    :other-language-path="otherLanguagePath" />
  <main class="terms">
    <article class="article">
      <h1 class="title">{{ content.title }}</h1>
      <p class="updated">{{ content.updated }}</p>
      <p>{{ content.intro }}</p>
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
      <h2>{{ t('contacts') }}</h2>
      <ul>
        <li>{{ sellerDetails.name[locale] }}, {{ sellerDetails.status[locale] }}</li>
        <li>{{ t('inn') }}: {{ sellerDetails.inn }}</li>
        <li>
          Email:
          <a :href="`mailto:${sellerDetails.email}`">{{ sellerDetails.email }}</a>
        </li>
        <li>
          {{ t('phone') }}:
          <a :href="`tel:${sellerDetails.phoneHref}`">{{ sellerDetails.phone }}</a>
        </li>
      </ul>
    </article>
  </main>
  <SiteFooter :locale="locale" />
</template>

<script setup lang="ts">
import SiteFooter from '~/components/site/SiteFooter.vue'
import SiteHeader from '~/components/site/SiteHeader.vue'
import type { Locale } from '~/composables/useI18n'

import { sellerDetails } from './sellerDetails'
import { termsContent } from './termsContent'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: { contacts: 'Contacts and seller details', inn: 'INN', phone: 'Phone' },
    ru: { contacts: 'Контакты и реквизиты', inn: 'ИНН', phone: 'Телефон' },
  },
  props.locale,
)

const content = termsContent(props.locale)
const path = props.locale === 'ru' ? '/ru/terms' : '/terms'
const otherLanguagePath = props.locale === 'ru' ? '/terms' : '/ru/terms'
const siteUrl = useSiteConfig().url.replace(/\/$/, '')

useHead({
  htmlAttrs: { lang: props.locale },
  link: [
    { href: `${siteUrl}${path}`, rel: 'canonical' },
    { href: `${siteUrl}/terms`, hreflang: 'en', rel: 'alternate' },
    { href: `${siteUrl}/ru/terms`, hreflang: 'ru', rel: 'alternate' },
  ],
})

useSeoMeta({
  description: content.seoDescription,
  ogDescription: content.seoDescription,
  ogSiteName: 'Laraue Boards',
  ogTitle: `${content.title} — Laraue Boards`,
  ogType: 'website',
  ogUrl: `${siteUrl}${path}`,
  robots: 'index, follow',
  title: `${content.title} — Laraue Boards`,
})
</script>

<style scoped>
.terms {
  margin: 0 auto;
  max-width: 820px;
  padding: 56px 24px 88px;
}

.title {
  font-size: clamp(28px, 4vw, 38px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.updated {
  color: var(--color-muted);
  font-size: 13px;
  margin: 10px 0 28px;
}

.article {
  font-size: 16px;
  line-height: 1.75;
}

.article h2 {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin: 40px 0 12px;
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
</style>
