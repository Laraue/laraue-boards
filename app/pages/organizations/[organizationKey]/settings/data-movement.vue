<template>
  <DataMovementPage
    :deps="deps"
    :on-spaces-moved="onSpacesMoved" />
</template>

<script setup lang="ts">
import DataMovementPage from '~/sections/organizations/data-movement/DataMovementPage.vue'
import { createDataMovementPageDeps } from '~/sections/organizations/data-movement/deps-impl'

const client = useApiClient()
const deps = createDataMovementPageDeps(client)
const onSpacesMoved = async (): Promise<void> => {
  await refreshAppLayoutData()
}
</script>
