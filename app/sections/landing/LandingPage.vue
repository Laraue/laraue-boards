<template>
  <LandingHeader :locale="locale" />
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
  <LandingFooter :locale="locale" />
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import LandingCallToAction from './components/LandingCallToAction.vue'
import LandingFaq from './components/LandingFaq.vue'
import LandingFeaturesGrid from './components/LandingFeaturesGrid.vue'
import LandingFooter from './components/LandingFooter.vue'
import LandingHeader from './components/LandingHeader.vue'
import LandingHero from './components/LandingHero.vue'
import LandingOpenSource from './components/LandingOpenSource.vue'
import LandingPlatforms from './components/LandingPlatforms.vue'
import LandingPricing from './components/LandingPricing.vue'
import LandingStructure from './components/LandingStructure.vue'
import LandingUseCases from './components/LandingUseCases.vue'
import type { LandingPageDeps } from './LandingPage.deps'
import type { LandingCurrency } from './LandingPage.types'
import { useLandingSeo } from './useLandingSeo'

const props = defineProps<{ deps: LandingPageDeps; locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      seoDescription:
        'A free, open-source Jira alternative built on Telegram. Forward a message to @msgboard_bot and it becomes a task on your Kanban board — Mini App or web app.',
      seoTitle: 'Laraue Boards — Telegram Kanban Task Manager',
    },
    ru: {
      seoDescription:
        'Перестаньте терять важные сообщения в Telegram. Laraue Boards превращает сообщения, отправленные боту @msgboard_bot, в карточки на канбан-доске. Бесплатно, открытый код, работает как Telegram Mini App и веб-приложение.',
      seoTitle: 'Laraue Boards — превращайте сообщения Telegram в Kanban-доски',
    },
  },
  props.locale,
)

// Prices are loaded on the server for the first render (so they are in the HTML search engines see)
// and again in the browser when the visitor switches the currency.
const currency = ref<LandingCurrency>('USD')
const { data: tariffs } = await useQuery(
  () => `landing-tariffs-${currency.value}`,
  () => props.deps.getTariffs(currency.value),
  { watch: [currency] },
)

useLandingSeo(props.locale, { description: t('seoDescription'), title: t('seoTitle') })
</script>
