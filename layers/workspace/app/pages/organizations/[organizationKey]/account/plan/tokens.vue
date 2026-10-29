<template>
  <TokenPacksPage
    :back-to="organizationRoutes.accountPlan()"
    :deps="deps"
    :on-pay="(url) => navigateTo(url, { external: true })" />
</template>

<script setup lang="ts">
import { navigateTo, useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import { createTokenPacksPageDeps } from '#layers/workspace/app/sections/billing/token-packs/TokenPacksPage.deps.impl'
import TokenPacksPage from '#layers/workspace/app/sections/billing/token-packs/TokenPacksPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useBillingApiClient } from '#layers/workspace/app/shared/composables/useBillingApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const { t } = useI18n({
  en: { plan: 'Buy tokens' },
  ru: { plan: 'Купить токены' },
})

const deps = createTokenPacksPageDeps(
  useApiClient({ onUnauthorized: useSignInRedirect() }),
  useBillingApiClient(),
)

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('plan') })
</script>
