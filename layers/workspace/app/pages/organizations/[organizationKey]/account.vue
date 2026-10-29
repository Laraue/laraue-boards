<template>
  <OrganizationAccountPage
    :api-keys-to="organizationRoutes.apiKeys()"
    :organization-name="organizationName"
    :plan-to="organizationRoutes.accountPlan()"
    :profile-to="organizationRoutes.account()"
    :transactions-to="organizationRoutes.accountTransactions()"
    user-account-to="/account">
    <NuxtPage />
  </OrganizationAccountPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { NuxtPage } from '#components'
import OrganizationAccountPage from '#layers/workspace/app/sections/organizations/account/OrganizationAccountPage.vue'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useAppLayoutData } from '#layers/workspace/app/shells/organization/useAppLayoutData'

const organizationRoutes = useOrganizationRoutes()
const layout = useAppLayoutData()
const organizationName = computed(() => layout.value?.organization.name ?? '')
</script>
