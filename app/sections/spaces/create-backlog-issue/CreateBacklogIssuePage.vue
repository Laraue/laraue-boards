<template>
  <QueryState
    :data="data"
    error-title="Could not load backlog issue form"
    loading-text="Loading backlog issue form…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to backlog"
              :to="organizationRoutes.backlog(spaceKey)" />
            <ListPlus class="page-heading-icon" />
            <div class="page-heading-text"><h1>Add backlog issue</h1></div>
          </div>
        </div>
        <CreateIssueForm
          :attributes="page.attributes"
          :board="{ id: page.boardId, name: page.boardName, spaceKey: page.spaceKey }"
          :deps="deps.form"
          :on-created="onCreated" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ListPlus } from '@lucide/vue'

import CreateIssueForm from '~/components/create-issue-form/CreateIssueForm.vue'
import type { CreateBacklogIssuePageDeps } from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.deps'

const props = defineProps<{
  deps: CreateBacklogIssuePageDeps
  onCreated: (issueKey: string) => Promise<void> | void
  spaceKey: string
}>()

const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Add backlog issue' })

const { data, message, pending, refresh } = await useQuery(
  () => `create-backlog-issue:${props.spaceKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ signal, spaceKey: props.spaceKey }),
  { watch: [() => props.spaceKey] },
)
</script>
