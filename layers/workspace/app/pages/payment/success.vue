<template>
  <PaymentResultPage
    :on-continue="() => navigateTo('/organizations')"
    status="success" />
</template>

<script setup lang="ts">
import { navigateTo, useHead } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import PaymentResultPage from '#layers/workspace/app/sections/billing/payment-result/PaymentResultPage.vue'

const { t } = useI18n({
  en: { title: 'Payment' },
  ru: { title: 'Оплата' },
})

definePageMeta({ layout: 'public' })

useHead({ title: t('title') })
</script>
