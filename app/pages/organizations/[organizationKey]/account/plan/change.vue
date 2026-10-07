<template>
  <ChangePlanPage
    :back-to="organizationRoutes.accountPlan()"
    :deps="deps"
    :on-pay="(url) => navigateTo(url, { external: true })" />
</template>

<script setup lang="ts">
import { createChangePlanPageDeps } from '~/sections/billing/change-plan/ChangePlanPage.deps.impl'
import ChangePlanPage from '~/sections/billing/change-plan/ChangePlanPage.vue'

const { t } = useI18n({
  en: { plan: 'Change plan' },
  ru: { plan: 'Сменить тариф' },
})

const deps = createChangePlanPageDeps(useApiClient(), useBillingApiClient())

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('plan') })
</script>
