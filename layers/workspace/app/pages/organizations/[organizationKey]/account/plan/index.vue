<template>
  <BillingPage
    :deps="deps"
    :on-buy-tokens="() => navigateTo(organizationRoutes.accountPlanTokens())"
    :on-change-plan="() => navigateTo(organizationRoutes.accountPlanChange())" />
</template>

<script setup lang="ts">
import { navigateTo, useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import { createBillingPageDeps } from '#layers/workspace/app/sections/billing/plan/BillingPage.deps.impl'
import BillingPage from '#layers/workspace/app/sections/billing/plan/BillingPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const { t } = useI18n({
  en: { plan: 'Plan and usage' },
  ru: { plan: 'Тариф и лимиты' },
})

const deps = createBillingPageDeps(useApiClient({ onUnauthorized: useSignInRedirect() }))

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('plan') })
</script>
