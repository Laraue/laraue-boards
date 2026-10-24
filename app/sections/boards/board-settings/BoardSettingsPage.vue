<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconSettings"
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
    </template>
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: page }">
        <section class="board-settings-page">
          <BoardSettingsForm
            :id="formId"
            :error="saveMessage || removeMessage || null"
            :on-update="(input) => save(page, input)"
            :submitting="saving || removing"
            :view-model="page" />
          <!-- The form is the component above; the button submits it through its id. -->
          <div
            v-if="page.canUpdate"
            class="form-actions">
            <BaseButton
              :disabled="removing"
              :form="formId"
              :loading="saving"
              type="submit"
              variant="primary">
              {{ t('saveChanges') }}
            </BaseButton>
          </div>
          <BaseDangerZone
            v-if="page.canDelete"
            :description="t('deleteDescription')"
            :title="t('deleteBoard')">
            <BaseButton
              :disabled="saving"
              :loading="removing"
              variant="danger"
              @click="remove">
              {{ t('deleteBoard') }}
            </BaseButton>
          </BaseDangerZone>
        </section>
      </template>
    </QueryState>
  </AppPage>
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

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    board: 'Board',
    deleteBoard: 'Delete board',
    deleteConfirm: 'Delete this board?',
    deleteDescription: 'Deletes the board for every member. This cannot be undone.',
    loadError: 'Could not load board',
    loading: 'Loading board…',
    saveChanges: 'Save changes',
    settings: 'Board settings',
  },
  ru: {
    board: 'Доска',
    deleteBoard: 'Удалить доску',
    deleteConfirm: 'Удалить эту доску?',
    deleteDescription: 'Удаляет доску для всех участников. Отменить нельзя.',
    loadError: 'Не удалось загрузить доску',
    loading: 'Загрузка доски…',
    saveChanges: 'Сохранить изменения',
    settings: 'Настройки доски',
  },
})

const organizationRoutes = useOrganizationRoutes()
const formId = `board-settings-${useId()}`

const { data, message, pending, refresh } = await useApiQuery(
  () => `board-settings:${props.boardId}`,
  (signal) => props.deps.view({ boardId: props.boardId, signal, spaceKey: props.spaceKey }),
)
useViewRefresh(refresh)

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
  if (
    (await confirm({ danger: true, title: t('deleteConfirm') })) &&
    (await removeBoard({ boardId: props.boardId }))
  ) {
    await props.onDeleted()
  }
}
</script>

<style scoped>
.board-settings-page {
  display: grid;
  gap: var(--space-5);
  margin-inline: auto;
  max-width: 768px;
  width: 100%;
}
</style>
