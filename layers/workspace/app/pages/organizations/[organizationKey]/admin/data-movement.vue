<template>
  <DataMovementPage
    :deps="deps"
    :on-spaces-moved="onSpacesMoved" />
</template>

<script setup lang="ts">
import { createDataMovementPageDeps } from '#layers/workspace/app/sections/organizations/data-movement/DataMovementPage.deps.impl'
import DataMovementPage from '#layers/workspace/app/sections/organizations/data-movement/DataMovementPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import { refreshAppLayoutData } from '#layers/workspace/app/shells/organization/useAppLayoutData'

const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createDataMovementPageDeps(client)
const onSpacesMoved = async (): Promise<void> => {
  await refreshAppLayoutData()
}
</script>
