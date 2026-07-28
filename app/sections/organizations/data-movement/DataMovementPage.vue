<template>
  <QueryState
    :data="data"
    error-title="Could not load data movement"
    loading-text="Loading data movement…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="movement-page">
        <div class="title-row">
          <div class="page-heading">
            <ArrowRightLeft class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>Data movement</h1>
            </div>
          </div>
        </div>
        <div class="movement-sections">
          <SpacesMovementSection
            :deps="deps.spacesMovementSection"
            :on-moved="onSpacesMoved"
            :spaces="page.spaces" />
          <BoardsMovementSection
            :current-organization-id="page.currentOrganizationId"
            :current-organization-name="page.currentOrganizationName"
            :deps="deps.boardsMovementSection"
            :on-moved="refresh"
            :spaces="page.spaces" />
        </div>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ArrowRightLeft } from '@lucide/vue'

import BoardsMovementSection from '~/sections/organizations/data-movement/components/BoardsMovementSection/BoardsMovementSection.vue'
import SpacesMovementSection from '~/sections/organizations/data-movement/components/SpacesMovementSection/SpacesMovementSection.vue'
import type { DataMovementPageDeps } from '~/sections/organizations/data-movement/DataMovementPage.deps'

const props = defineProps<{
  deps: DataMovementPageDeps
  onSpacesMoved: () => Promise<void> | void
}>()
useHead({ title: 'Data movement' })

const { data, message, pending, refresh } = await useQuery(
  'organization-data-movement',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)

const onSpacesMoved = async () => {
  await Promise.all([refresh(), props.onSpacesMoved()])
}
</script>

<style scoped>
.movement-page {
  --movement-tree-line-width: 2px;
}

.movement-sections {
  display: grid;
  gap: var(--space-6);
  margin-top: var(--space-6);
}
</style>
