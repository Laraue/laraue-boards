<!-- On Reka Dialog, as the kit's modals: a confirmation opened from the issue stacks above it. -->
<template>
  <DialogRoot
    :open="true"
    @update:open="(open) => !open && close()">
    <DialogPortal>
      <DialogOverlay class="base-dialog-overlay" />
      <DialogContent
        :aria-describedby="undefined"
        class="issue-dialog"
        @open-auto-focus="focusDialog">
        <VisuallyHidden>
          <DialogTitle>{{ t('issueDetails') }}</DialogTitle>
        </VisuallyHidden>
        <div class="issue-close">
          <BaseIconButton
            :label="t('closeDialog')"
            @click="close()">
            <IconX />
          </BaseIconButton>
        </div>
        <div class="issue-dialog-content">
          <ClientOnly>
            <IssuePage
              ref="issuePage"
              :deps="deps"
              in-dialog
              :issue-key="issueKey"
              lazy
              :on-back="() => close()"
              :on-deleted="onDeleted"
              :on-dirty-change="setDirty"
              :on-saved="handleSaved"
              :organization-routes="organizationRoutes" />
            <template #fallback>
              <IssueSkeleton in-dialog />
            </template>
          </ClientOnly>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui'
import { onBeforeUnmount, reactive, useTemplateRef, watch } from 'vue'

import { ClientOnly } from '#components'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import type { IssuePageDeps } from '#layers/workspace/app/sections/issues/issue/IssuePage.deps'
import type { IssuePageSavedIssue } from '#layers/workspace/app/sections/issues/issue/IssuePage.deps'
import IssuePage from '#layers/workspace/app/sections/issues/issue/IssuePage.vue'
import IssueSkeleton from '#layers/workspace/app/sections/issues/shared/components/IssueSkeleton.vue'
import { confirmUnsavedChanges } from '#layers/workspace/app/shared/composables/useUnsavedChangesWarning'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: IssuePageDeps
  issueKey: string
  onClose: () => void
  onDeleted: (issueKey: string) => void
  onDirtyChange: (dirty: boolean) => void
  onSaved: (issue: IssuePageSavedIssue) => Promise<void> | void
  organizationRoutes: OrganizationRoutes
}>()

const { t } = useI18n({
  en: {
    closeDialog: 'Close dialog',
    issueDetails: 'Issue details',
  },
  ru: {
    closeDialog: 'Закрыть диалог',
    issueDetails: 'Детали задачи',
  },
})

const state = reactive({ dirty: false })

// Focus the dialog itself, not its first control, so opening an issue does not scroll or open a field.
const focusDialog = (event: Event) => {
  event.preventDefault()
  if (event.target instanceof HTMLElement) {
    event.target.focus({ preventScroll: true })
  }
}
const setDirty = (dirty: boolean) => {
  state.dirty = dirty
  props.onDirtyChange(dirty)
}
const handleSaved = async (issue: IssuePageSavedIssue) => {
  setDirty(false)
  await props.onSaved(issue)
}
const close = (skipWarning = false) => {
  if (!skipWarning && !confirmUnsavedChanges(state.dirty)) {
    return
  }
  setDirty(false)
  props.onClose()
}
onBeforeUnmount(() => props.onDirtyChange(false))
watch(
  () => props.issueKey,
  () => setDirty(false),
)
const issuePage = useTemplateRef<InstanceType<typeof IssuePage>>('issuePage')
defineExpose({ refresh: () => issuePage.value?.refresh() })
</script>

<style scoped>
.issue-dialog {
  background: var(--color-background);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  inset: var(--space-8) 0 auto;
  margin: 0 auto;
  max-height: calc(100dvh - var(--space-8) - var(--space-8));
  outline: none;
  overflow: hidden;
  padding: var(--space-6);
  position: fixed;
  width: min(1280px, calc(100% - var(--space-8)));
  z-index: 46;
}
.issue-dialog-content {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
  padding: 0;
}
/* the close button floats over the content so it stays reachable while loading */
.issue-dialog-content :deep(.issue-dialog-heading),
.issue-dialog-content :deep(.skeleton-header) {
  padding-right: calc(var(--icon-btn-size) + var(--space-2));
}
.issue-close {
  position: absolute;
  right: var(--space-6);
  top: var(--space-6);
  z-index: 1;
}
@media (max-width: 767px) {
  .issue-dialog {
    border: 0;
    border-radius: 0;
    box-shadow: none;
    height: 100dvh;
    inset: 0;
    margin: 0;
    max-height: none;
    max-width: none;
    min-height: 0;
    padding: var(--space-4);
    width: 100%;
  }
  .issue-close {
    right: var(--space-4);
    top: var(--space-4);
  }
}
</style>
