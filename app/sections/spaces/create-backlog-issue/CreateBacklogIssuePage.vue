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
          icon: IconListDetails,
          label: data?.boardName ?? t('backlog'),
          to: organizationRoutes.backlog(spaceKey),
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
            :board="{
              id: page.boardId,
              isBacklog: true,
              name: page.boardName,
              spaceColor: page.spaceColor,
              spaceKey,
              spaceName: page.spaceName,
            }"
            :deps="deps.form"
            :on-created="onCreated" />
        </section>
      </template>
    </QueryState>
  </div>
</template>

<script setup lang="ts">
import { IconListDetails, IconPlus } from '@tabler/icons-vue'

import CreateIssueForm from '~/components/create-issue-form/CreateIssueForm.vue'
import { SpaceIcon } from '~/constants/icons'
import type { CreateBacklogIssuePageDeps } from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.deps'

const props = defineProps<{
  deps: CreateBacklogIssuePageDeps
  onCreated: (issueKey: string) => Promise<void> | void
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    addIssue: 'Add issue',
    backlog: 'Backlog',
    loadError: 'Could not load backlog issue form',
    loading: 'Loading backlog issue form…',
  },
  ru: {
    addIssue: 'Добавить задачу',
    backlog: 'Бэклог',
    loadError: 'Не удалось загрузить форму задачи бэклога',
    loading: 'Загрузка формы задачи бэклога…',
  },
})

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useApiQuery(
  () => `create-backlog-issue:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)
</script>
