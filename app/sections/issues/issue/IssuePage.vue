<template>
  <QueryState
    :data="data"
    error-title="Could not load issue"
    loading-text="Loading issue…"
    :message="viewMessage"
    :on-retry="refresh"
    :pending="pending && !data">
    <template #loading>
      <IssueSkeleton />
    </template>
    <template #default="{ data: issue }">
      <section class="issue-page">
        <div class="title-row">
          <div class="page-heading">
            <slot name="leading">
              <button
                aria-label="Back"
                class="icon-btn"
                type="button"
                @click="leave">
                <ArrowLeft />
              </button>
            </slot>
            <div class="page-heading-text">
              <h1>
                <NuxtLink :to="issueRoute">
                  {{ issue.issueKey }}
                </NuxtLink>
              </h1>
              <button
                aria-label="Copy issue link"
                class="issue-copy"
                :class="{ 'issue-copy--copied': state.copied }"
                title="Copy issue link"
                type="button"
                @click="copyIssueLink">
                <Transition
                  mode="out-in"
                  name="icon-pop">
                  <Check
                    v-if="state.copied"
                    key="check" />
                  <Link
                    v-else
                    key="link" />
                </Transition>
              </button>
            </div>
            <slot name="actions" />
          </div>
        </div>
        <form
          class="issue-form issue-page-form"
          @submit.prevent="save">
          <div class="issue-form-content">
            <div class="issue-form-main">
              <IssueDescription
                v-model="state.content"
                :disabled="!issue.canEdit" />
              <IssueAttachments
                :key="issue.issueKey"
                :attachments="issue.attachments"
                :disabled="!issue.canEdit || saving || deleting"
                :files="state.files"
                :on-change="changeFiles"
                :on-remove-attachment="removeAttachment"
                :removed-attachment-ids="state.removedAttachmentIds" />
              <section class="issue-activity">
                <div
                  aria-label="Issue activity"
                  class="issue-tabs"
                  role="tablist">
                  <button
                    id="comments-tab"
                    ref="commentsTab"
                    aria-controls="comments-panel"
                    :aria-selected="state.activeTab === 'comments'"
                    class="issue-tab"
                    role="tab"
                    :tabindex="state.activeTab === 'comments' ? 0 : -1"
                    type="button"
                    @click="activateTab('comments')"
                    @keydown.left.prevent="activateTab('history', true)"
                    @keydown.right.prevent="activateTab('history', true)">
                    <MessageSquare />
                    Comments
                  </button>
                  <button
                    id="history-tab"
                    ref="historyTab"
                    aria-controls="history-panel"
                    :aria-selected="state.activeTab === 'history'"
                    class="issue-tab"
                    role="tab"
                    :tabindex="state.activeTab === 'history' ? 0 : -1"
                    type="button"
                    @click="activateTab('history')"
                    @keydown.left.prevent="activateTab('comments', true)"
                    @keydown.right.prevent="activateTab('comments', true)">
                    <HistoryIcon />
                    History
                  </button>
                </div>
                <div
                  v-show="state.activeTab === 'comments'"
                  id="comments-panel"
                  aria-labelledby="comments-tab"
                  class="issue-tab-panel"
                  role="tabpanel">
                  <IssueComments
                    :key="issue.issueKey"
                    :deps="deps.comments"
                    :initial-comments="issue.comments"
                    :issue-key="issue.issueKey" />
                </div>
                <div
                  v-show="state.activeTab === 'history'"
                  id="history-panel"
                  aria-labelledby="history-tab"
                  class="issue-tab-panel"
                  role="tabpanel">
                  <IssueHistory
                    v-if="state.historyOpened"
                    :key="issue.issueKey"
                    ref="history"
                    :deps="deps.history"
                    :issue-key="issue.issueKey" />
                </div>
              </section>
            </div>
            <div class="issue-form-side">
              <label>Space</label>
              <SpaceSelect
                :key="`space-${issue.issueKey}`"
                v-model="state.pickedSpaceId"
                :deps="deps.spaceSelect"
                :disabled="!issue.canEdit"
                :initial-option="{
                  label: issue.spaceLabel || 'Current space',
                  value: issue.spaceId,
                }" />
              <label>Board</label>
              <BoardSelect
                :key="`board-${issue.issueKey}`"
                v-model="state.boardId"
                :deps="deps.boardSelect"
                :disabled="!issue.canEdit"
                :initial-option="{
                  label: issue.boardLabel || 'Current board',
                  value: issue.boardId,
                }"
                :space-key="state.pickedSpaceId" />
              <label>Status</label>
              <StatusSelect
                :key="`status-${issue.issueKey}`"
                v-model="state.statusId"
                :board-id="state.boardId"
                :deps="deps.statusSelect"
                :disabled="!issue.canEdit"
                :initial-option="{
                  label: issue.statusLabel || 'Current status',
                  value: issue.statusId,
                }" />
              <label>Assignee</label>
              <AssigneeSelect
                :key="`assignee-${issue.issueKey}`"
                v-model="state.assigneeId"
                :deps="deps.assigneeSelect"
                :disabled="!issue.canEdit"
                :initial-option="{
                  color: issue.assigneeColor,
                  initials: issue.assigneeInitial,
                  label: issue.assignee,
                  value: issue.assigneeId,
                }"
                :space-key="state.pickedSpaceId" />
              <label>Owner</label>
              <div class="issue-person">
                <span
                  class="avatar"
                  :style="{ background: issue.ownerColor }">
                  {{ issue.ownerInitial }}
                </span>
                <span>{{ issue.owner }}</span>
              </div>
              <IssueAttributeFields
                v-if="issue.attributes.length"
                v-model="state.attributeValues"
                :attributes="issue.attributes"
                :disabled="!issue.canEdit" />
              <span class="issue-date-label">Created</span>
              <time :datetime="issue.createdAt">{{ formatDate(issue.createdAt) }}</time>
              <span class="issue-date-label">Updated</span>
              <time :datetime="issue.updatedAt">{{ formatDate(issue.updatedAt) }}</time>
            </div>
          </div>
          <div
            v-if="issue.canEdit"
            class="issue-actions">
            <p
              v-if="saveMessage || deleteMessage"
              class="form-error">
              {{ saveMessage || deleteMessage }}
            </p>
            <div class="form-actions">
              <button
                class="primary"
                :disabled="!canSave || saving || deleting"
                type="submit">
                {{ saving ? 'Saving…' : 'Save changes' }}
              </button>
              <button
                class="secondary danger"
                :disabled="saving || deleting"
                type="button"
                @click="remove">
                Delete issue
              </button>
            </div>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ArrowLeft, Check, History as HistoryIcon, Link, MessageSquare } from '@lucide/vue'

import AssigneeSelect from '~/components/assignee-select/AssigneeSelect.vue'
import BoardSelect from '~/components/board-select/BoardSelect.vue'
import IssueAttachments from '~/components/issue-attachments/IssueAttachments.vue'
import IssueAttributeFields from '~/components/issue-attribute-fields/IssueAttributeFields.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

import IssueComments from './components/IssueComments/IssueComments.vue'
import IssueDescription from './components/IssueDescription/IssueDescription.vue'
import IssueHistory from './components/IssueHistory/IssueHistory.vue'
import IssueSkeleton from './components/IssueSkeleton.vue'
import type { IssuePageDeps } from './IssuePage.deps'
import type { IssuePageSavedIssue, IssuePageViewModel } from './IssuePage.types'

const props = defineProps<{
  deps: IssuePageDeps
  issueKey: string
  lazy?: boolean
  onBack: () => Promise<void> | void
  onDeleted?: (issueKey: string) => Promise<void> | void
  onDirtyChange?: (dirty: boolean) => void
  onSaved?: (issue: IssuePageSavedIssue) => Promise<void> | void
}>()

const organizationRoutes = useOrganizationRoutes()
const router = useRouter()
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const state = reactive({
  activeTab: 'comments' as 'comments' | 'history',
  assigneeId: '',
  attributeValues: {} as Record<string, string>,
  boardId: '',
  content: '',
  copied: false,
  dirty: false,
  files: [] as File[],
  historyOpened: false,
  pickedSpaceId: '',
  removedAttachmentIds: [] as string[],
  statusId: '',
})

const history = useTemplateRef<InstanceType<typeof IssueHistory>>('history')
const commentsTab = useTemplateRef<HTMLButtonElement>('commentsTab')
const historyTab = useTemplateRef<HTMLButtonElement>('historyTab')

const activateTab = async (tab: 'comments' | 'history', focus = false) => {
  state.activeTab = tab
  state.historyOpened ||= tab === 'history'

  if (focus) {
    await nextTick()
    const target = tab === 'comments' ? commentsTab : historyTab
    target.value?.focus()
  }
}

const {
  data,
  message: viewMessage,
  pending,
  refresh,
} = await useQuery(
  () => `issue:${props.issueKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ issueKey: props.issueKey, signal }),
  { lazy: props.lazy, watch: [() => props.issueKey] },
)

useHead({ title: computed(() => data.value?.issueKey ?? 'Issue') })

const currentIssue = computed(() => data.value)
const canSave = computed(
  () =>
    !!currentIssue.value &&
    !saving.value &&
    !!state.assigneeId &&
    (state.boardId === currentIssue.value.boardId || !!state.statusId),
)
const dirty = computed(
  () =>
    !!currentIssue.value &&
    (state.assigneeId !== currentIssue.value.assigneeId ||
      state.boardId !== currentIssue.value.boardId ||
      state.content !== currentIssue.value.content ||
      state.pickedSpaceId !== currentIssue.value.spaceId ||
      state.statusId !== currentIssue.value.statusId ||
      state.files.length > 0 ||
      state.removedAttachmentIds.length > 0 ||
      currentIssue.value.attributes.some(
        (attribute) => state.attributeValues[attribute.id] !== attribute.value,
      )),
)

const issueRoute = computed(() => organizationRoutes.issue(props.issueKey))

const formatDate = (value: string) => dateTimeFormatter.format(new Date(value))

const syncState = (issue: IssuePageViewModel) => {
  if (state.dirty) {
    return
  }
  Object.assign(state, {
    assigneeId: issue.assigneeId,
    attributeValues: Object.fromEntries(
      issue.attributes.map((attribute) => [attribute.id, attribute.value]),
    ),
    boardId: issue.boardId,
    content: issue.content,
    files: [],
    pickedSpaceId: issue.spaceId,
    removedAttachmentIds: [],
    statusId: issue.statusId,
  })
}

const handleSaved = async (issue: IssuePageSavedIssue) => {
  await props.onSaved?.(issue)
  state.dirty = false
  await refresh()
  void history.value?.refresh()
  if (!issue.complete) {
    saveMessage.value = 'Changes were saved, but the issue could not be moved. Try again.'
  }
}

const {
  execute: saveIssue,
  message: saveMessage,
  pending: saving,
} = useAction(props.deps.saveIssue, { onSuccess: handleSaved })

const {
  execute: deleteIssue,
  message: deleteMessage,
  pending: deleting,
} = useAction(props.deps.deleteIssue, {
  onSuccess: async () => {
    await props.onDeleted?.(props.issueKey)
    await leaveAfterIssueChanged()
  },
})

const save = async () => {
  const issue = currentIssue.value
  if (!issue || !canSave.value) {
    return
  }
  await saveIssue({
    assigneeId: state.assigneeId,
    attributeValues: getIssueAttributeValueInput(
      Object.fromEntries(Object.entries(state.attributeValues).filter(([, value]) => value)),
      issue.attributes,
    ),
    boardId: state.boardId,
    content: state.content,
    files: state.files,
    issueKey: issue.issueKey,
    previousBoardId: issue.boardId,
    previousStatusId: issue.statusId,
    removeAttachmentIds: state.removedAttachmentIds,
    statusId: state.statusId,
  })
}

const remove = async () => {
  if (confirm('Delete this issue?')) {
    await deleteIssue({ issueKey: props.issueKey })
  }
}

const changeFiles = (files: File[]) => {
  state.files = files
}

const removeAttachment = (id: string) => {
  state.removedAttachmentIds.push(id)
}

const copyIssueLink = async () => {
  const url = new URL(router.resolve(issueRoute.value).href, window.location.origin).href
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    window.prompt('Copy issue link', url)
  }
  state.copied = true
  setTimeout(() => (state.copied = false), 1200)
}

const leaveAfterIssueChanged = async () => {
  state.dirty = false
  await leave()
}

const leave = async () => {
  await props.onBack()
}

useUnsavedChangesWarning(toRef(state, 'dirty'))

watch(data, (issue) => issue && syncState(issue), { immediate: true })

watch(
  () => props.issueKey,
  () => {
    state.activeTab = 'comments'
    state.historyOpened = false
  },
)

watch(
  dirty,
  (value) => {
    state.dirty = value
    props.onDirtyChange?.(value)
  },
  { immediate: true },
)
</script>

<style scoped>
.issue-page {
  align-self: start;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  max-height: 100%;
  min-height: 0;
}

.issue-page-form {
  display: grid;
  grid-template-areas:
    'content'
    'actions';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  margin-top: var(--space-5);
  min-height: 0;
  row-gap: var(--space-6);
}

.issue-form-main {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-height: 100%;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: var(--space-1);
}

.issue-form-main > * {
  flex-shrink: 0;
}

.issue-form-content {
  align-items: start;
  column-gap: var(--space-5);
  display: grid;
  grid-area: content;
  grid-template-areas: 'main side';
  grid-template-columns: minmax(0, 5fr) minmax(0, 3fr);
  grid-template-rows: fit-content(100%);
  min-height: 0;
  overflow: hidden;
  padding-bottom: var(--space-1);
  width: 100%;
}

.issue-form-content .issue-form-main {
  grid-area: main;
}

.issue-form-content .issue-form-side {
  grid-area: side;
}

.issue-form-side {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-auto-rows: minmax(var(--control-height), auto);
  grid-template-columns: max-content minmax(0, 1fr);
  max-height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  place-self: start stretch;
}

.issue-activity {
  display: grid;
  gap: var(--space-4);
}

.issue-tabs {
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  gap: 0;
}

.issue-tab {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--color-muted);
  display: inline-flex;
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  margin-bottom: -1px;
  min-height: var(--control-height);
  padding: var(--space-2) var(--space-3);
  position: relative;
}

.issue-tab:first-child {
  padding-left: 0;
}

.issue-tab::after {
  background: transparent;
  border-radius: var(--radius-pill);
  bottom: 0;
  content: '';
  height: 2px;
  left: 0;
  position: absolute;
  right: 0;
}

.issue-tab:hover {
  color: var(--color-text);
}

.issue-tab[aria-selected='true'] {
  color: var(--color-accent);
}

.issue-tab[aria-selected='true']::after {
  background: var(--color-accent);
}

.issue-tab > svg {
  height: 17px;
  width: 17px;
}

.issue-tab-panel {
  min-width: 0;
}

.issue-form-side > label {
  margin: 0;
}

.issue-person {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
}

.issue-person .avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  width: 28px;
}

.issue-date-label {
  font-weight: var(--font-weight-semibold);
}

.issue-actions {
  grid-area: actions;
}

.issue-actions .form-error {
  margin: 0;
}

.issue-actions .form-actions {
  margin-top: 0;
}

.issue-actions .form-error + .form-actions {
  margin-top: var(--space-4);
}

.issue-copy {
  background: transparent;
  border: 0;
  color: var(--color-muted);
  display: inline-flex;
  padding: 0;
  transition: var(--transition-press);
}

.issue-copy:hover {
  color: var(--color-text);
}

.issue-copy:active {
  translate: 0 var(--press-offset);
}

.issue-copy--copied {
  color: var(--color-success);
}

.page-heading h1 a {
  color: inherit;
  text-decoration: none;
}

.page-heading h1 a:hover {
  color: var(--color-accent);
}

@media (max-width: 760px) {
  .page-heading-text {
    align-items: center;
    flex-direction: row;
    gap: var(--space-2);
  }

  .issue-form-content {
    column-gap: 0;
    grid-template-areas:
      'main'
      'side';
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: max-content max-content;
    overflow: auto;
    row-gap: var(--space-5);
  }

  .issue-form-main,
  .issue-form-side {
    overflow: visible;
  }

  .issue-form-side {
    width: auto;
  }

  .issue-actions .form-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
