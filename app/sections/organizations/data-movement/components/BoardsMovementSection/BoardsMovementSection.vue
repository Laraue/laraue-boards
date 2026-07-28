<template>
  <section class="movement-section">
    <div>
      <h2>Boards</h2>
      <p class="muted">Move boards to a space in an accessible organization.</p>
    </div>
    <AppBulkBar
      action-label="Move boards"
      :count="selectedIds.length"
      :on-action="() => openDialog(selectedIds)"
      :on-clear="() => state.selected.clear()" />
    <div class="board-groups">
      <section
        v-for="space in spaces"
        v-show="space.boards.length"
        :key="space.id"
        class="board-group">
        <div class="board-group-heading">
          <SpaceIcon :style="{ color: space.color }" />
          <strong>{{ space.name }}</strong>
        </div>
        <div class="board-list">
          <div
            v-for="board in space.boards"
            :key="board.id"
            class="entity-row">
            <input
              :aria-label="`Select ${board.name}`"
              :checked="state.selected.has(board.id)"
              type="checkbox"
              @change="toggle(board.id)" />
            <BoardIcon :style="{ color: board.color }" />
            <strong>{{ board.name }}</strong>
            <button
              :aria-label="`Move ${board.name}`"
              class="icon-btn"
              title="Move board"
              type="button"
              @click="openDialog([board.id])">
              <ArrowRightLeft />
            </button>
          </div>
        </div>
      </section>
      <p
        v-if="!boardCount"
        class="empty">
        No movable boards.
      </p>
    </div>

    <MoveBoardsDialog
      ref="dialog"
      :current-organization-id="currentOrganizationId"
      :current-organization-name="currentOrganizationName"
      :deps="deps.dialog"
      :ids="state.dialogIds"
      :on-moved="onMoved" />
  </section>
</template>

<script setup lang="ts">
import { ArrowRightLeft } from '@lucide/vue'

import { BoardIcon, SpaceIcon } from '~/constants/icons'
import type { DataMovementPageData } from '~/sections/organizations/data-movement/DataMovementPage.types'

import type { BoardsMovementSectionDeps } from './BoardsMovementSection.deps'
import MoveBoardsDialog from './components/MoveBoardsDialog/MoveBoardsDialog.vue'

const props = defineProps<{
  currentOrganizationId: string
  currentOrganizationName: string
  deps: BoardsMovementSectionDeps
  onMoved: () => Promise<void> | void
  spaces: DataMovementPageData['spaces']
}>()

const dialog = useTemplateRef('dialog')

const boardIds = computed(() => props.spaces.flatMap((space) => space.boards.map(({ id }) => id)))

const boardCount = computed(() => boardIds.value.length)

const selectedIds = computed(() => boardIds.value.filter((id) => state.selected.has(id)))
const state = reactive({
  dialogIds: [] as string[],
  selected: new Set<string>(),
})

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
.board-groups,
.board-group,
.board-list {
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

.board-group-heading {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}

.board-list {
  border-left: var(--movement-tree-line-width) solid var(--color-border);
  margin-left: calc((var(--icon-size) - var(--movement-tree-line-width)) / 2);
  padding-left: var(--space-4);
}
</style>
