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
import { useId, useTemplateRef } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import CreateIssueForm from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.vue'
import type { CreateBacklogIssuePageDeps } from '#layers/workspace/app/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.deps'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: CreateBacklogIssuePageDeps
  onCreated: (issueKey: string) => Promise<void> | void
  organizationRoutes: OrganizationRoutes
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

const formId = `create-backlog-issue-${useId()}`
const issueForm = useTemplateRef<InstanceType<typeof CreateIssueForm>>('issueForm')

const { data, message, pending, refresh } = await useApiQuery(
  () => `create-backlog-issue:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)
</script>
