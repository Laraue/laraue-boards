<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconClipboardPlus"
        :parents="[
          { icon: IconClipboardList, label: t('allIssues'), to: organizationRoutes.issues() },
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
            :deps="deps.form"
            :on-created="onCreated" />
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconClipboardList, IconClipboardPlus } from '@tabler/icons-vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import type { CreateIssuePageDeps } from '#layers/workspace/app/sections/issues/create-issue/CreateIssuePage.deps'
import CreateIssueForm from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.vue'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: CreateIssuePageDeps
  onCreated: (issueKey: string) => Promise<void> | void
  organizationRoutes: OrganizationRoutes
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

const { data, message, pending, refresh } = await useApiQuery('create-issue', (signal) =>
  props.deps.view({ signal }),
)
</script>
