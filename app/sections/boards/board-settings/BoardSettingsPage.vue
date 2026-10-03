<template>
  <div>
    <PageHeader
      :icon="Settings"
      :parents="[
        {
          color: data?.spaceColor,
          icon: SpaceIcon,
          label: data?.spaceName ?? spaceKey,
          to: organizationRoutes.space(spaceKey),
        },
        {
          color: data?.color,
          icon: BoardIcon,
          label: data?.name ?? t('board'),
          to: organizationRoutes.board(spaceKey, boardId),
        },
      ]"
      :title="t('settings')" />
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: page }">
        <section class="form-page">
          <BoardSettingsForm
            :error="saveMessage || removeMessage || null"
            :on-delete="remove"
            :on-update="(input) => save(page, input)"
            :submitting="saving || removing"
            :view-model="page" />
        </section>
      </template>
    </QueryState>
  </div>
</template>

<script setup lang="ts">
import { IconSettings } from '@tabler/icons-vue'

import { BoardIcon, SpaceIcon } from '~/constants/icons'
import type {
  BoardSettingsPageData,
  BoardSettingsPageDeps,
} from '~/sections/boards/board-settings/BoardSettingsPage.deps'
import type { BoardSettingsFormInput } from '~/sections/boards/board-settings/components/BoardSettingsForm.types'
import BoardSettingsForm from '~/sections/boards/board-settings/components/BoardSettingsForm.vue'

const props = defineProps<{
  boardId: string
  deps: BoardSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onSaved: () => Promise<void> | void
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    board: 'Board',
    deleteConfirm: 'Delete this board?',
    loadError: 'Could not load board',
    loading: 'Loading board…',
    settings: 'Settings',
  },
  ru: {
    board: 'Доска',
    deleteConfirm: 'Удалить эту доску?',
    loadError: 'Не удалось загрузить доску',
    loading: 'Загрузка доски…',
    settings: 'Настройки',
  },
})

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useApiQuery(
  () => `board-settings:${props.boardId}`,
  (signal) => props.deps.view({ boardId: props.boardId, signal, spaceKey: props.spaceKey }),
)

const {
  execute: saveSettings,
  message: saveMessage,
  pending: saving,
} = useApiAction(props.deps.save)
const {
  execute: removeBoard,
  message: removeMessage,
  pending: removing,
} = useApiAction(props.deps.remove)

const save = async (page: BoardSettingsPageData, input: BoardSettingsFormInput): Promise<void> => {
  const saved = await saveSettings({
    boardId: props.boardId,
    originalColumns: page.columns,
    originalStatus: page.status,
    ...input,
  })
  if (saved) {
    await props.onSaved()
  } else {
    // A failed save may have applied some of the changes already.
    await refresh()
  }
}

const remove = async (): Promise<void> => {
  if (confirm(t('deleteConfirm')) && (await removeBoard({ boardId: props.boardId }))) {
    await props.onDeleted()
  }
}
</script>
