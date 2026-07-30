<template>
  <div
    aria-hidden="true"
    class="issue-dialog-overlay" />
  <dialog
    ref="dialogEl"
    aria-label="Issue details"
    class="issue-dialog"
    open
    tabindex="-1"
    @cancel.self="handleCancel">
    <button
      aria-label="Close dialog"
      class="icon-btn issue-close"
      title="Close dialog"
      type="button"
      @click="close()">
      <X />
    </button>
    <div class="issue-dialog-content">
      <ClientOnly>
        <IssuePage
          :deps="deps"
          :issue-key="issueKey"
          lazy
          :on-back="() => close(true)"
          :on-deleted="onDeleted"
          :on-dirty-change="setDirty"
          :on-saved="onSaved" />
        <template #fallback>
          <IssueSkeleton />
        </template>
      </ClientOnly>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'
import { onBeforeRouteUpdate } from 'vue-router'

import IssueSkeleton from '~/sections/issues/issue/components/IssueSkeleton.vue'
import type { IssuePageDeps } from '~/sections/issues/issue/IssuePage.deps'
import type { IssuePageSavedIssue } from '~/sections/issues/issue/IssuePage.types'
import IssuePage from '~/sections/issues/issue/IssuePage.vue'

const props = defineProps<{
  deps: IssuePageDeps
  issueKey: string
  onClose: () => void
  onDeleted: (issueKey: string) => void
  onSaved: (issue: IssuePageSavedIssue) => void
}>()

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const dialogEl = useTemplateRef('dialogEl')
const state = reactive({ dirty: false })
const { confirmUnsavedChanges } = useUnsavedChangesWarning(toRef(state, 'dirty'))

const showDialog = () => {
  if (dialogEl.value) {
    dialogEl.value.close()
    dialogEl.value.showModal()
    dialogEl.value.focus({ preventScroll: true })
  }
}
const setDirty = (dirty: boolean) => {
  state.dirty = dirty
}
const close = (skipWarning = false) => {
  if (!skipWarning && !confirmUnsavedChanges()) {
    return
  }
  state.dirty = false
  props.onClose()
}
const handleCancel = (event: Event) => {
  event.preventDefault()
  close()
}

onMounted(showDialog)
onBeforeRouteUpdate(
  (to) => (to.path === route.path && to.query.issue === props.issueKey) || confirmUnsavedChanges(),
)
watch(
  () => props.issueKey,
  () => (state.dirty = false),
)
</script>

<style scoped>
.issue-dialog-overlay {
  backdrop-filter: blur(1px);
  background: #00000082;
  inset: 0;
  opacity: 1;
  position: fixed;
  transition: opacity var(--duration-base) var(--ease-standard);
  z-index: 1000;
}
.issue-dialog {
  background: var(--color-workspace);
  inset: var(--space-8) 0 auto;
  margin: 0 auto;
  max-height: calc(100dvh - var(--space-8) - var(--space-8));
  outline: none;
  overflow: hidden;
  padding: var(--space-6);
  position: fixed;
  transition: none;
  width: min(1280px, calc(100% - var(--space-8)));
  z-index: 1001;
}
.issue-dialog[open] {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
}
.issue-dialog::backdrop {
  backdrop-filter: none;
  background: transparent;
  transition: none;
}
.issue-dialog-content {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
  padding: 0;
}
/* layout reserves room for the mobile sidebar button; the dialog has none */
.issue-dialog-content :deep(.page-heading) {
  padding-left: 0;
}
/* the close button floats over the content so it stays reachable while loading */
.issue-dialog-content :deep(.page-heading),
.issue-dialog-content :deep(.skeleton-header) {
  padding-right: calc(var(--icon-btn-size) + var(--space-2));
}
.issue-close {
  position: absolute;
  right: var(--space-6);
  top: var(--space-6);
  z-index: 1;
}
@starting-style {
  .issue-dialog-overlay {
    opacity: 0;
  }
  .issue-dialog[open] {
    opacity: 1;
    scale: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .issue-dialog-overlay {
    transition: none;
  }
}
@media (max-width: 760px) {
  .issue-dialog {
    border: 0;
    box-shadow: none;
    height: calc(100dvh - var(--space-2) - var(--space-2));
    inset: var(--space-2);
    margin: 0;
    max-height: none;
    max-width: none;
    min-height: 0;
    padding: var(--space-4);
    width: calc(100% - var(--space-2) - var(--space-2));
  }
  .issue-close {
    right: var(--space-4);
    top: var(--space-4);
  }
}
</style>
