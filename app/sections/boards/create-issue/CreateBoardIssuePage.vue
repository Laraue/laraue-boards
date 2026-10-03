<template>
  <div>
    <PageHeader
      :icon="IconPlus"
      :parents="[
        {
          color: data?.spaceColor,
          icon: SpaceIcon,
          label: data?.spaceName ?? spaceKey,
          to: organizationRoutes.space(spaceKey),
        },
        {
          color: data?.boardColor,
          icon: BoardIcon,
          label: data?.boardName ?? t('board'),
          to: organizationRoutes.board(spaceKey, boardId),
        },
      ]"
      :title="t('addIssue')" />
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: page }">
        <section>
          <CreateIssueForm
            :attributes="page.attributes"
            :board="{ id: boardId, name: page.boardName, spaceKey }"
            :deps="deps.form"
            :initial-status-id="initialStatusId"
            :on-created="onCreated" />
        </section>
      </template>
    </QueryState>
  </div>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'

import CreateIssueForm from '~/components/create-issue-form/CreateIssueForm.vue'
import { BoardIcon, SpaceIcon } from '~/constants/icons'
import type { CreateBoardIssuePageDeps } from '~/sections/boards/create-issue/CreateBoardIssuePage.deps'

const props = defineProps<{
  boardId: string
  deps: CreateBoardIssuePageDeps
  initialStatusId?: string
  onCreated: (issueKey: string) => Promise<void> | void
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    addIssue: 'Add issue',
    board: 'Board',
    loadError: 'Could not load issue form',
    loading: 'Loading issue form…',
  },
  ru: {
    addIssue: 'Добавить задачу',
    board: 'Доска',
    loadError: 'Не удалось загрузить форму задачи',
    loading: 'Загрузка формы задачи…',
  },
})

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useApiQuery(
  () => `create-board-issue:${props.boardId}`,
  (signal) => props.deps.view({ boardId: props.boardId, signal, spaceKey: props.spaceKey }),
)
</script>
