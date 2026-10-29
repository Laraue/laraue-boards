<template>
  <AttributePage
    :attribute-id="attributeId"
    :deps="deps"
    :on-finished="onFinished"
    :organization-routes="organizationRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { createAttributePageDeps } from '#layers/workspace/app/sections/organizations/attributes/attribute/AttributePage.deps.impl'
import AttributePage from '#layers/workspace/app/sections/organizations/attributes/attribute/AttributePage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-admin-attributes-id')
const attributeId = computed(() => String(route.params.id))
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createAttributePageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onFinished = async (): Promise<void> => {
  await navigateTo(organizationRoutes.attributes())
}
</script>
