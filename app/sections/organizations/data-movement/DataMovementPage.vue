<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="movement-page">
        <BaseSectionHeader :title="t('dataMovement')" />
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
import BoardsMovementSection from '~/sections/organizations/data-movement/components/BoardsMovementSection/BoardsMovementSection.vue'
import SpacesMovementSection from '~/sections/organizations/data-movement/components/SpacesMovementSection/SpacesMovementSection.vue'
import type { DataMovementPageDeps } from '~/sections/organizations/data-movement/DataMovementPage.deps'

const props = defineProps<{
  deps: DataMovementPageDeps
  onSpacesMoved: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    dataMovement: 'Data movement',
    loadError: 'Could not load data movement',
    loading: 'Loading data movement…',
  },
  ru: {
    dataMovement: 'Перенос данных',
    loadError: 'Не удалось загрузить перемещение данных',
    loading: 'Загрузка перемещения данных…',
  },
})

useHead({ title: t('dataMovement') })

const { data, message, pending, refresh } = await useApiQuery(
  'organization-data-movement',
  (signal) => props.deps.view({ signal }),
)
useViewRefresh(refresh)

const onSpacesMoved = async () => {
  await Promise.all([refresh(), props.onSpacesMoved()])
}
</script>

<style scoped>
.movement-page {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}

.movement-sections {
  display: grid;
  gap: var(--space-6);
}
</style>
