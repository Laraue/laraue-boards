<template>
  <CreateIssuePage
    :deps="deps"
    :on-created="onCreated"
    :organization-routes="organizationRoutes" />
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { createCreateIssuePageDeps } from '#layers/workspace/app/sections/issues/create-issue/CreateIssuePage.deps.impl'
import CreateIssuePage from '#layers/workspace/app/sections/issues/create-issue/CreateIssuePage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import { useOrganizationCatalog } from '#layers/workspace/app/shells/organization/useAppLayoutData'

const organizationRoutes = useOrganizationRoutes()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createCreateIssuePageDeps(client, useOrganizationCatalog())
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.issues(), { replace: true })
}
</script>
