<template>
  <div>
    <PageHeader
      :parents="[{ label: t('allIssues'), to: organizationRoutes.issues() }]"
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
            :deps="deps.form"
            :on-created="onCreated" />
        </section>
      </template>
    </QueryState>
  </div>
</template>

<script setup lang="ts">
import CreateIssueForm from '~/components/create-issue-form/CreateIssueForm.vue'
import type { CreateIssuePageDeps } from '~/sections/issues/create-issue/CreateIssuePage.deps'

const props = defineProps<{
  deps: CreateIssuePageDeps
  onCreated: (issueKey: string) => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    addIssue: 'Add issue',
    allIssues: 'All issues',
    loadError: 'Could not load issue form',
    loading: 'Loading issue form…',
  },
  ru: {
    addIssue: 'Добавить задачу',
    allIssues: 'Все задачи',
    loadError: 'Не удалось загрузить форму задачи',
    loading: 'Загрузка формы задачи…',
  },
})

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useApiQuery('create-issue', (signal) =>
  props.deps.view({ signal }),
)
</script>
