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
            icon: IconListDetails,
            label: data?.boardName ?? t('backlog'),
            to: organizationRoutes.backlog(spaceKey),
          },
        ]"
        :title="t('addIssue')">
        <template
          v-if="data"
          #actions>
          <BaseButton
            :aria-label="t('addIssue')"
            :disabled="!issueForm?.canSubmit"
            :form="formId"
            icon-on-mobile
            :loading="issueForm?.pending"
            type="submit"
            variant="primary">
            <IconClipboardPlus />
            <template #label>{{ t('addIssue') }}</template>
          </BaseButton>
        </template>
      </PageHeader>
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
            :id="formId"
            ref="issueForm"
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
            hide-submit
            :on-created="onCreated" />
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconClipboardPlus, IconListDetails } from '@tabler/icons-vue'

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
const formId = `create-backlog-issue-${useId()}`
const issueForm = useTemplateRef<InstanceType<typeof CreateIssueForm>>('issueForm')

const { data, message, pending, refresh } = await useApiQuery(
  () => `create-backlog-issue:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)
</script>
