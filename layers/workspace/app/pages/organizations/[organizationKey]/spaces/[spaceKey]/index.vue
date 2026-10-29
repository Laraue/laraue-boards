<template>
  <SpacePage
    :deps="deps"
    :organization-routes="organizationRoutes"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useRoute } from '#app'
import { createSpacePageDeps } from '#layers/workspace/app/sections/spaces/space/SpacePage.deps.impl'
import SpacePage from '#layers/workspace/app/sections/spaces/space/SpacePage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-spaces-spaceKey')
const spaceKey = computed(() => String(route.params.spaceKey))
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createSpacePageDeps(client)

const organizationRoutes = useOrganizationRoutes()
</script>
