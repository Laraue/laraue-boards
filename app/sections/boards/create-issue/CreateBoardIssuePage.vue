<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              :label="t('backToBoard')"
              :to="organizationRoutes.board(spaceKey, boardId)" />
            <ListPlus class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>{{ t('addIssue') }}</h1>
            </div>
          </div>
        </div>
        <CreateIssueForm
          :attributes="page.attributes"
          :board="{ id: boardId, name: page.boardName, spaceKey: page.spaceKey }"
          :deps="deps.form"
          :initial-status-id="initialStatusId"
          :on-created="onCreated" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ListPlus } from '@lucide/vue'

import CreateIssueForm from '~/components/create-issue-form/CreateIssueForm.vue'
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
    backToBoard: 'Back to board',
    loadError: 'Could not load issue form',
    loading: 'Loading issue form…',
  },
  ru: {
    addIssue: 'Добавить задачу',
    backToBoard: 'Назад к доске',
    loadError: 'Не удалось загрузить форму задачи',
    loading: 'Загрузка формы задачи…',
  },
})

const organizationRoutes = useOrganizationRoutes()
useHead(() => ({ title: t('addIssue') }))

const { data, message, pending, refresh } = await useQuery(
  () => `create-board-issue:${props.boardId}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({ boardId: props.boardId, signal, spaceKey: props.spaceKey }),
  { watch: [() => props.boardId] },
)
</script>
