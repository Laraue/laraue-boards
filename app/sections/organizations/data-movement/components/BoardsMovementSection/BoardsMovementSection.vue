<template>
  <section class="movement-section">
    <div>
      <h3>{{ t('boards') }}</h3>
      <p class="muted">{{ t('description') }}</p>
    </div>
    <AppBulkBar
      :action-label="t('moveBoards')"
      :count="selectedIds.length"
      :on-action="() => openDialog(selectedIds)"
      :on-clear="() => state.selected.clear()" />
    <div class="board-groups">
      <section
        v-for="space in spaces"
        v-show="space.boards.length"
        :key="space.key"
        class="board-group">
        <div class="board-group-heading">
          <SpaceIcon :style="{ color: space.color }" />
          <span>{{ space.name }}</span>
        </div>
        <BaseList>
          <BaseListRow
            v-for="board in space.boards"
            :key="board.id">
            <template #leading>
              <input
                :aria-label="`${t('select')} ${board.name}`"
                :checked="state.selected.has(board.id)"
                type="checkbox"
                @change="toggle(board.id)" />
              <BoardIcon :style="{ color: board.color }" />
            </template>
            {{ board.name }}
            <template #trailing>
              <BaseIconButton
                :label="`${t('move')} ${board.name}`"
                :tooltip="t('moveBoard')"
                @click="openDialog([board.id])">
                <IconArrowsLeftRight />
              </BaseIconButton>
            </template>
          </BaseListRow>
        </BaseList>
      </section>
      <p
        v-if="!boardCount"
        class="empty">
        {{ t('empty') }}
      </p>
    </div>

    <MoveBoardsDialog
      ref="dialog"
      :current-organization-id="currentOrganizationId"
      :current-organization-name="currentOrganizationName"
      :deps="deps.dialog"
      :ids="state.dialogIds"
      :on-moved="afterMove" />
  </section>
</template>

<script setup lang="ts">
import { IconArrowsLeftRight } from '@tabler/icons-vue'

import { BoardIcon, SpaceIcon } from '~/constants/icons'
import type { DataMovementPageData } from '~/sections/organizations/data-movement/DataMovementPage.deps'

import type { BoardsMovementSectionDeps } from './BoardsMovementSection.deps'
import MoveBoardsDialog from './components/MoveBoardsDialog/MoveBoardsDialog.vue'

const props = defineProps<{
  currentOrganizationId: string
  currentOrganizationName: string
  deps: BoardsMovementSectionDeps
  onMoved: () => Promise<void> | void
  spaces: DataMovementPageData['spaces']
}>()

const { t } = useI18n({
  en: {
    boards: 'Boards',
    description: 'Move boards to a space in an accessible organization.',
    empty: 'No movable boards.',
    move: 'Move',
    moveBoard: 'Move board',
    moveBoards: 'Move boards',
    select: 'Select',
  },
  ru: {
    boards: 'Доски',
    description: 'Перемещайте доски в раздел доступной организации.',
    empty: 'Нет доступных для перемещения досок.',
    move: 'Переместить',
    moveBoard: 'Переместить доску',
    moveBoards: 'Переместить доски',
    select: 'Выбрать',
  },
})

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

// A board moved within the organization stays in the list, so it would stay selected.
const afterMove = async () => {
  state.selected.clear()
  await props.onMoved()
}
</script>

<style scoped>
.movement-section,
.board-groups,
.board-group {
  display: grid;
  gap: var(--space-2);
}

.board-groups {
  gap: var(--space-4);
}

.movement-section h3,
.movement-section p {
  margin: 0;
}

.movement-section h3 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}

.board-group-heading {
  align-items: center;
  display: flex;
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
}

.board-group-heading > svg {
  height: var(--icon-size);
  width: var(--icon-size);
}
</style>
