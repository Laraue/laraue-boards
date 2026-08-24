<template>
  <QueryState
    :data="data"
    error-title="Could not load board"
    loading-text="Loading board…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to board"
              :to="organizationRoutes.board(spaceKey, boardId)" />
            <BoardIcon
              class="page-heading-icon"
              :style="{ color: page.color }" />
            <div class="page-heading-text"><h1>Edit board</h1></div>
          </div>
        </div>
        <BoardSettingsForm
          :error="saveMessage || removeMessage || null"
          :on-delete="remove"
          :on-update="(input) => save(page, input)"
          :submitting="saving || removing"
          :view-model="page" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { BoardIcon } from '~/constants/icons'
import type { BoardSettingsPageDeps } from '~/sections/boards/board-settings/BoardSettingsPage.deps'
import type { BoardSettingsPageData } from '~/sections/boards/board-settings/BoardSettingsPage.types'
import type { BoardSettingsFormInput } from '~/sections/boards/board-settings/components/BoardSettingsForm.types'
import BoardSettingsForm from '~/sections/boards/board-settings/components/BoardSettingsForm.vue'

const props = defineProps<{
  boardId: string
  deps: BoardSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onSaved: () => Promise<void> | void
  spaceKey: string
}>()

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useQuery(
  () => `board-settings:${props.boardId}`,
  (_nuxtApp, { signal }) => props.deps.view({ boardId: props.boardId, signal }),
  { watch: [() => props.boardId] },
)

useHead({
  title: computed(() => (data.value ? `${data.value.name} settings` : 'Board settings')),
})

const {
  execute: saveSettings,
  message: saveMessage,
  pending: saving,
} = useAction(props.deps.save, {
  onSuccess: props.onSaved,
})

const save = async (page: BoardSettingsPageData, input: BoardSettingsFormInput): Promise<void> => {
  if (saving.value || removing.value) {
    return
  }
  const result = await saveSettings({
    boardId: props.boardId,
    originalColumns: page.columns,
    originalStatus: page.status,
    ...input,
  })
  if (result === undefined) {
    await refresh()
  }
}

const {
  execute: removeBoard,
  message: removeMessage,
  pending: removing,
} = useAction(props.deps.remove, {
  onSuccess: props.onDeleted,
})

const remove = async (): Promise<void> => {
  if (saving.value || removing.value || !confirm('Delete this board?')) {
    return
  }
  void removeBoard({ boardId: props.boardId })
}
</script>
