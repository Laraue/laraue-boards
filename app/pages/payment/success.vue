<template>
  <PaymentResultPage
    :on-continue="() => navigateTo('/organizations')"
    status="success" />
</template>

<script setup lang="ts">
import PaymentResultPage from '~/sections/billing/PaymentResultPage.vue'

const { t } = useI18n({
  en: { title: 'Payment' },
  ru: { title: 'Оплата' },
})

definePageMeta({ layout: 'public' })

useHead({ title: t('title') })
</script>
