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
              :label="t('backToIssues')"
              :to="organizationRoutes.issues()" />
            <ListPlus class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>{{ t('addIssue') }}</h1>
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

const { t } = useI18n({
  en: {
    addIssue: 'Add issue',
    backToIssues: 'Back to issues',
    loadError: 'Could not load issue form',
    loading: 'Loading issue form…',
  },
  ru: {
    addIssue: 'Добавить задачу',
    backToIssues: 'Назад к задачам',
    loadError: 'Не удалось загрузить форму задачи',
    loading: 'Загрузка формы задачи…',
  },
})

const organizationRoutes = useOrganizationRoutes()
useHead(() => ({ title: t('addIssue') }))

const { data, message, pending, refresh } = await useQuery('create-issue', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)
</script>
