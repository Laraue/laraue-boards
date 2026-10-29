<template>
  <SiteHeader />
  <main>
    <LandingHero />
    <LandingPlatforms />
    <LandingUseCases />
    <LandingStructure />
    <LandingFeaturesGrid id="features" />
    <LandingCallToAction variant="start" />
    <LandingPricing
      id="pricing"
      :tariffs="tariffs" />
    <LandingOpenSource />
    <LandingFaq />
    <LandingCallToAction variant="final" />
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useAsyncData, useHead, useSeoMeta } from '#app'
import { defineSoftwareApp, useLocaleHead, useLocalePath, useSchemaOrg } from '#imports'
import { previewImageUrl } from '#layers/core/app/constants/links'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import SiteFooter from '#layers/core/app/public-shell/components/SiteFooter.vue'
import SiteHeader from '#layers/core/app/public-shell/components/SiteHeader.vue'
import { useSiteConfig } from '#site-config/app/composables/useSiteConfig'

import LandingCallToAction from './components/LandingCallToAction.vue'
import LandingFaq from './components/LandingFaq.vue'
import LandingFeaturesGrid from './components/LandingFeaturesGrid.vue'
import LandingHero from './components/LandingHero.vue'
import LandingOpenSource from './components/LandingOpenSource.vue'
import LandingPlatforms from './components/LandingPlatforms.vue'
import LandingPricing from './components/LandingPricing.vue'
import LandingStructure from './components/LandingStructure.vue'
import LandingUseCases from './components/LandingUseCases.vue'
import { getLandingOffers } from './getLandingOffers'
import type { LandingPageDeps } from './LandingPage.deps'

const props = defineProps<{ deps: LandingPageDeps }>()

const { locale, t } = useI18n({
  en: {
    offer_free_orgs: '{count} free team organization(s)',
    offer_issues: 'up to {count} issues per month',
    offer_issues_org: 'up to {count} issues per month for the whole organization',
    offer_tokens: '{count} tokens included',
    offer_tokens_monthly: '{count} tokens per month',
    offer_tokens_monthly_org: '{count} tokens per month for the whole organization',
    offer_tokens_per_seat: '{count} tokens per seat',
    offer_unlimited_orgs: 'unlimited team organizations',
    personal_label: 'For individuals',
    seoDescription:
      'A lightweight task board for small teams. Save Telegram messages as cards, and connect Claude or any MCP agent to the same board. Free, open source.',
    seoTitle: 'Laraue Boards — a task board for Telegram chats and AI agents',
    team_label: 'For teams',
  },
  ru: {
    offer_free_orgs: '{count} бесплатных организаций',
    offer_issues: 'до {count} issues в месяц',
    offer_issues_org: 'до {count} issues в месяц на всю организацию',
    offer_tokens: '{count} токенов включено',
    offer_tokens_monthly: '{count} токенов в месяц',
    offer_tokens_monthly_org: '{count} токенов в месяц на всю организацию',
    offer_tokens_per_seat: '{count} токенов на место',
    offer_unlimited_orgs: 'неограниченное число организаций',
    personal_label: 'Для себя',
    seoDescription:
      'Лёгкая доска задач для небольших команд. Сообщения из Telegram — в карточки, а Claude или любой MCP-агент работает с той же доской. Бесплатно, открытый код.',
    seoTitle: 'Laraue Boards — доска задач для Telegram-чатов и ИИ-агентов',
    team_label: 'Для команд',
  },
})

// Prices are loaded on the server for the first render, so they are in the HTML search engines see.
// Without tariffs the landing still renders, just without prices.
const { data: tariffs } = await useAsyncData('landing-tariffs', () => props.deps.getTariffs())

const localePath = useLocalePath()
const pricingUrl = `${useSiteConfig().url.replace(/\/$/, '')}${localePath({ hash: '#pricing', name: 'index' }, locale.value)}`
const offers = computed(() =>
  getLandingOffers(tariffs.value, { locale: locale.value, pricingUrl, t }),
)

// The rest (canonical, og and twitter tags, Organization, WebSite and WebPage) comes from
// nuxt-seo-utils and nuxt-schema-org; the preview image and robots come from the layout.
useHead(useLocaleHead())
useSeoMeta({
  description: t('seoDescription'),
  ogImageAlt: t('seoTitle'),
  title: t('seoTitle'),
  // The title already names the product.
  titleTemplate: '%s',
})
useSchemaOrg([
  defineSoftwareApp({
    applicationCategory: 'BusinessApplication',
    description: t('seoDescription'),
    image: previewImageUrl[locale.value],
    name: 'Laraue Boards',
    offers: offers.value.length > 0 ? offers.value : [{ price: 0, priceCurrency: 'USD' }],
    operatingSystem: 'Web, Telegram',
  }),
])
</script>
