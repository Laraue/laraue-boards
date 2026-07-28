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
              label="Back to issues"
              :to="organizationRoutes.issues()" />
            <ListPlus class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>Add issue</h1>
            </div>
          </div>
        </div>
        <CreateIssueForm
          :attributes="page.attributes"
          :deps="deps.form"
          :on-created="onCreated" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ListPlus } from '@lucide/vue'

import CreateIssueForm from '~/components/create-issue-form/CreateIssueForm.vue'
import type { CreateIssuePageDeps } from '~/sections/issues/create-issue/CreateIssuePage.deps'

const props = defineProps<{
  deps: CreateIssuePageDeps
  onCreated: (issueKey: string) => Promise<void> | void
}>()

const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Add issue' })

const { data, message, pending, refresh } = await useQuery('create-issue', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)
</script>
