<template>
  <ChangePlanPage
    :back-to="organizationRoutes.accountPlan()"
    :deps="deps"
    :on-pay="(url) => navigateTo(url, { external: true })" />
</template>

<script setup lang="ts">
import { navigateTo, useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import { createChangePlanPageDeps } from '#layers/workspace/app/sections/billing/change-plan/ChangePlanPage.deps.impl'
import ChangePlanPage from '#layers/workspace/app/sections/billing/change-plan/ChangePlanPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useBillingApiClient } from '#layers/workspace/app/shared/composables/useBillingApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const { t } = useI18n({
  en: { plan: 'Change plan' },
  ru: { plan: 'Сменить тариф' },
})

const deps = createChangePlanPageDeps(
  useApiClient({ onUnauthorized: useSignInRedirect() }),
  useBillingApiClient(),
)

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('plan') })
</script>
