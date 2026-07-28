<template>
  <QueryState
    :data="data"
    error-title="Could not load issue form"
    loading-text="Loading issue form…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to board"
              :to="organizationRoutes.board(spaceKey, boardId)" />
            <ListPlus class="page-heading-icon" />
            <div class="page-heading-text"><h1>Add issue</h1></div>
          </div>
        </div>
        <CreateIssueForm
          :attributes="page.attributes"
          :board="{ id: boardId, name: page.boardName, spaceId: page.spaceId }"
          :deps="deps.form"
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
  onCreated: (issueKey: string) => Promise<void> | void
  spaceKey: string
}>()

const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Add issue' })

const { data, message, pending, refresh } = await useQuery(
  () => `create-board-issue:${props.boardId}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({ boardId: props.boardId, signal, spaceKey: props.spaceKey }),
  { watch: [() => props.boardId] },
)
</script>
