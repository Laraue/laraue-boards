<template>
  <OrganizationAccountPage
    :api-keys-to="organizationRoutes.apiKeys()"
    :organization-name="organizationName"
    :plan-to="organizationRoutes.account()"
    :transactions-to="organizationRoutes.accountTransactions()"
    user-account-to="/account">
    <NuxtPage />
  </OrganizationAccountPage>
</template>

<script setup lang="ts">
import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.types'
import OrganizationAccountPage from '~/sections/organizations/account/OrganizationAccountPage.vue'

const organizationRoutes = useOrganizationRoutes()
const { data } = useNuxtData<{ data?: AppLayoutData }>(appLayoutDataKey)
const organizationName = computed(() => data.value?.data?.organization.name ?? '')
</script>
