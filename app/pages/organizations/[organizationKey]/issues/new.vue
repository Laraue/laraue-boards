<template>
  <CreateIssuePage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import CreateIssuePage from '~/sections/issues/create-issue/CreateIssuePage.vue'
import { createCreateIssuePageDeps } from '~/sections/issues/create-issue/deps-impl'

const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createCreateIssuePageDeps(client)
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.issues(), { replace: true })
}
</script>
