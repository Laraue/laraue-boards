<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconClipboardPlus"
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
    </template>
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
            :board="{
              color: page.boardColor,
              id: boardId,
              name: page.boardName,
              spaceColor: page.spaceColor,
              spaceKey,
              spaceName: page.spaceName,
            }"
            :deps="deps.form"
            :initial-status-id="initialStatusId"
            :on-created="onCreated" />
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconClipboardPlus } from '@tabler/icons-vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import type { CreateBoardIssuePageDeps } from '#layers/workspace/app/sections/boards/create-issue/CreateBoardIssuePage.deps'
import CreateIssueForm from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.vue'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { BoardIcon, SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  boardId: string
  deps: CreateBoardIssuePageDeps
  initialStatusId?: string
  onCreated: (issueKey: string) => Promise<void> | void
  organizationRoutes: OrganizationRoutes
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

const { data, message, pending, refresh } = await useApiQuery(
  () => `create-board-issue:${props.boardId}`,
  (signal) => props.deps.view({ boardId: props.boardId, signal, spaceKey: props.spaceKey }),
)
</script>
