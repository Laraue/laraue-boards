<template>
  <section class="movement-section">
    <div>
      <h2>Spaces</h2>
      <p class="muted">Move spaces to another organization.</p>
    </div>
    <AppBulkBar
      action-label="Move spaces"
      :count="selectedIds.length"
      :on-action="() => openDialog(selectedIds)"
      :on-clear="() => state.selected.clear()" />
    <div class="entity-list">
      <div
        v-for="space in movableSpaces"
        :key="space.key"
        class="entity-row">
        <input
          :aria-label="`Select ${space.name}`"
          :checked="state.selected.has(space.key)"
          type="checkbox"
          @change="toggle(space.key)" />
        <SpaceIcon :style="{ color: space.color }" />
        <strong>{{ space.name }}</strong>
        <button
          :aria-label="`Move ${space.name}`"
          class="icon-btn"
          title="Move space"
          type="button"
          @click="openDialog([space.key])">
          <ArrowRightLeft />
        </button>
      </div>
      <p
        v-if="!movableSpaces.length"
        class="empty">
        No movable spaces.
      </p>
    </div>

    <MoveSpacesDialog
      ref="dialog"
      :deps="deps.dialog"
      :ids="state.dialogIds"
      :on-moved="onMoved" />
  </section>
</template>

<script setup lang="ts">
import { ArrowRightLeft } from '@lucide/vue'

import { SpaceIcon } from '~/constants/icons'
import type { DataMovementPageData } from '~/sections/organizations/data-movement/DataMovementPage.types'

import MoveSpacesDialog from './components/MoveSpacesDialog/MoveSpacesDialog.vue'
import type { SpacesMovementSectionDeps } from './SpacesMovementSection.deps'

const props = defineProps<{
  deps: SpacesMovementSectionDeps
  onMoved: () => Promise<void> | void
  spaces: DataMovementPageData['spaces']
}>()

const dialog = useTemplateRef('dialog')

const state = reactive({
  dialogIds: [] as string[],
  selected: new Set<string>(),
})

const movableSpaces = computed(() => props.spaces.filter((space) => !space.isDefault))

const selectedIds = computed(() =>
  movableSpaces.value.map(({ key }) => key).filter((key) => state.selected.has(key)),
)

const toggle = (id: string) => {
  if (state.selected.has(id)) {
    state.selected.delete(id)
  } else {
    state.selected.add(id)
  }
}

const openDialog = (ids: string[]) => {
  state.dialogIds = ids
  dialog.value?.open()
}
</script>

<style scoped>
.movement-section,
.entity-list {
  display: grid;
  gap: var(--space-2);
}

.movement-section h2,
.movement-section p {
  margin: 0;
}

.entity-row {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto auto 1fr auto;
  padding: var(--space-3) var(--space-4);
}

.entity-row:focus-within {
  border-color: var(--color-accent);
}

.entity-row:has(input:checked) {
  background: color-mix(in srgb, var(--color-accent-soft) 55%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-accent) 45%, var(--color-border));
}
</style>
