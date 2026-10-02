<template>
  <SiteHeader :locale="locale" />
  <main>
    <LandingHero :locale="locale" />
    <LandingUseCases :locale="locale" />
    <LandingStructure :locale="locale" />
    <LandingCallToAction
      :locale="locale"
      variant="start" />
    <LandingFeaturesGrid
      id="features"
      :locale="locale" />
    <LandingPlatforms :locale="locale" />
    <LandingPricing
      id="pricing"
      v-model:currency="currency"
      :locale="locale"
      :tariffs="tariffs" />
    <LandingOpenSource :locale="locale" />
    <LandingFaq :locale="locale" />
    <LandingCallToAction
      :locale="locale"
      variant="final" />
  </main>
  <SiteFooter :locale="locale" />
</template>

<script setup lang="ts">
import SiteFooter from '~/components/site/SiteFooter.vue'
import SiteHeader from '~/components/site/SiteHeader.vue'
import type { Locale } from '~/composables/useI18n'

import LandingCallToAction from './components/LandingCallToAction.vue'
import LandingFaq from './components/LandingFaq.vue'
import LandingFeaturesGrid from './components/LandingFeaturesGrid.vue'
import LandingHero from './components/LandingHero.vue'
import LandingOpenSource from './components/LandingOpenSource.vue'
import LandingPlatforms from './components/LandingPlatforms.vue'
import LandingPricing from './components/LandingPricing.vue'
import LandingStructure from './components/LandingStructure.vue'
import LandingUseCases from './components/LandingUseCases.vue'
import type { LandingCurrency, LandingPageDeps } from './LandingPage.deps'
import { useLandingSeo } from './useLandingSeo'

const props = defineProps<{ deps: LandingPageDeps; locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      seoDescription:
        'A lightweight task board for small teams. Save Telegram messages as cards, and connect Claude or any MCP agent to the same board. Free, open source.',
      seoTitle: 'Laraue Boards — a task board for Telegram chats and AI agents',
    },
    ru: {
      seoDescription:
        'Лёгкая доска задач для небольших команд. Сообщения из Telegram — в карточки, а Claude или любой MCP-агент работает с той же доской. Бесплатно, открытый код.',
      seoTitle: 'Laraue Boards — доска задач для Telegram-чатов и ИИ-агентов',
    },
  },
  props.locale,
)

// Prices are loaded on the server for the first render (so they are in the HTML search engines see)
// and again in the browser when the visitor switches the currency.
const currency = ref<LandingCurrency>('USD')
const { data: tariffs } = await useApiQuery(
  () => `landing-tariffs-${currency.value}`,
  () => props.deps.getTariffs(currency.value),
)

useLandingSeo(props.locale, { description: t('seoDescription'), title: t('seoTitle') })
</script>
