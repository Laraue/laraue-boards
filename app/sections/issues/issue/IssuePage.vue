<template>
  <div class="issue-page-root">
    <PageHeader
      v-if="!inDialog"
      :parents="
        data
          ? [
              {
                color: data.spaceColor,
                icon: SpaceIcon,
                label: data.spaceLabel,
                to: organizationRoutes.space(data.spaceId),
              },
              {
                color: data.boardColor,
                icon: data.boardIsBacklog ? IconListDetails : BoardIcon,
                label: data.boardLabel || t('currentBoard'),
                to: data.boardIsBacklog
                  ? organizationRoutes.backlog(data.spaceId)
                  : organizationRoutes.board(data.spaceId, data.boardId),
              },
            ]
          : []
      "
      :title="data?.issueKey ?? issueKey">
      <template #actions>
        <IconButton
          :label="state.copied ? t('copied') : t('copyIssueLink')"
          @click="copyIssueLink">
          <Transition
            mode="out-in"
            name="icon-pop">
            <IconCheck
              v-if="state.copied"
              key="check" />
            <IconLink
              v-else
              key="link" />
          </Transition>
        </IconButton>
      </template>
    </PageHeader>
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="viewMessage"
      :on-retry="refresh"
      :pending="pending && !data">
      <template #loading>
        <IssueSkeleton :in-dialog="inDialog" />
      </template>
      <template #default="{ data: issue }">
        <section class="issue-page">
          <!-- The board's dialog has no page header of its own. -->
          <div
            v-if="inDialog"
            class="issue-dialog-heading">
            <h1>
              <NuxtLink :to="issueRoute">
                {{ issue.issueKey }}
              </NuxtLink>
            </h1>
            <IconButton
              :label="state.copied ? t('copied') : t('copyIssueLink')"
              @click="copyIssueLink">
              <IconCheck v-if="state.copied" />
              <IconLink v-else />
            </IconButton>
          </div>
          <form
            class="issue-page-form"
            @submit.prevent="save">
            <div class="issue-form-content">
              <div class="issue-form-main">
                <!-- The description belongs to the title: closer to it than the sections are. -->
                <div class="issue-head">
                  <!-- A textarea so a long title wraps; it is still one line of text. -->
                  <textarea
                    id="issue-title"
                    :aria-label="t('title')"
                    class="issue-title-input"
                    :disabled="!issue.canEdit"
                    :maxlength="256"
                    :placeholder="t('titlePlaceholder')"
                    rows="1"
                    :value="state.title"
                    @input="changeTitle"
                    @keydown.enter.prevent />
                  <IssueDescription
                    v-model="state.content"
                    v-model:title="state.title"
                    :deps="deps.description"
                    :disabled="!issue.canEdit">
                    <template #actions>
                      <IconButton
                        :disabled="saving || deleting"
                        :label="t('attachImages')"
                        :tooltip="t('attachImagesHint')"
                        @click="attachments?.pick()">
                        <IconPaperclip />
                      </IconButton>
                    </template>
                  </IssueDescription>
                </div>
                <IssueAttachments
                  :key="issue.issueKey"
                  ref="attachments"
                  :attachments="issue.attachments"
                  :disabled="!issue.canEdit || saving || deleting"
                  :files="state.files"
                  :on-change="changeFiles"
                  :on-remove-attachment="removeAttachment"
                  :removed-attachment-ids="state.removedAttachmentIds" />
                <BaseTabs
                  v-model="state.activeTab"
                  :items="[
                    {
                      icon: IconMessageCircle,
                      label: t('comments'),
                      value: 'comments',
                    },
                    { icon: IconHistory, label: t('history'), value: 'history' },
                  ]"
                  :label="t('issueActivity')">
                  <template #comments>
                    <IssueComments
                      :key="issue.issueKey"
                      :deps="deps.comments"
                      :issue-key="issue.issueKey" />
                  </template>
                  <template #history>
                    <IssueHistory
                      v-if="state.historyOpened"
                      :key="issue.issueKey"
                      ref="history"
                      :deps="deps.history"
                      :issue-key="issue.issueKey" />
                  </template>
                </BaseTabs>
              </div>
              <aside
                :aria-label="t('properties')"
                class="issue-form-side">
                <h2>{{ t('properties') }}</h2>
                <div class="issue-properties">
                  <label for="issue-space">{{ t('space') }}</label>
                  <SpaceSelect
                    id="issue-space"
                    :key="`space-${issue.issueKey}`"
                    v-model="state.pickedSpaceId"
                    :deps="deps.spaceSelect"
                    :disabled="!issue.canEdit"
                    :initial-option="{
                      color: issue.spaceColor,
                      label: issue.spaceLabel || t('currentSpace'),
                      value: issue.spaceId,
                    }"
                    variant="inline" />
                  <label for="issue-board">{{ t('board') }}</label>
                  <BoardSelect
                    id="issue-board"
                    :key="`board-${issue.issueKey}`"
                    v-model="state.boardId"
                    :deps="deps.boardSelect"
                    :disabled="!issue.canEdit"
                    :initial-option="{
                      color: issue.boardColor,
                      isBacklog: issue.boardIsBacklog,
                      label: issue.boardLabel || t('currentBoard'),
                      value: issue.boardId,
                    }"
                    :space-key="state.pickedSpaceId"
                    variant="inline" />
                  <label for="issue-status">{{ t('status') }}</label>
                  <StatusSelect
                    id="issue-status"
                    :key="`status-${issue.issueKey}`"
                    v-model="state.statusId"
                    :board-id="state.boardId"
                    :deps="deps.statusSelect"
                    :disabled="!issue.canEdit"
                    :initial-option="{
                      color: issue.statusColor,
                      category: issue.statusCategory,
                      label: issue.statusLabel || t('currentStatus'),
                      value: issue.statusId,
                    }"
                    variant="inline" />
                  <label for="issue-assignee">{{ t('assignee') }}</label>
                  <AssigneeSelect
                    id="issue-assignee"
                    :key="`assignee-${issue.issueKey}`"
                    v-model="state.assigneeId"
                    :deps="deps.assigneeSelect"
                    :disabled="!issue.canEdit"
                    :initial-option="{
                      color: issue.assigneeColor,
                      initials: issue.assigneeInitial,
                      isCurrentUser: issue.assigneeIsCurrentUser,
                      label: issue.assignee,
                      value: issue.assigneeId,
                    }"
                    :space-key="state.pickedSpaceId"
                    variant="inline" />
                  <span class="issue-property-label">{{ t('owner') }}</span>
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
                    :disabled="!issue.canEdit"
                    select-variant="inline" />
                </div>
                <dl class="issue-dates">
                  <dt>{{ t('created') }}</dt>
                  <dd>
                    <time :datetime="issue.createdAt">{{ formatDateTime(issue.createdAt) }}</time>
                  </dd>
                  <dt>{{ t('updated') }}</dt>
                  <dd>
                    <time :datetime="issue.updatedAt">{{ formatDateTime(issue.updatedAt) }}</time>
                  </dd>
                </dl>
              </aside>
            </div>
            <div
              v-if="issue.canEdit"
              class="issue-actions">
              <p
                v-if="saveMessage || deleteMessage"
                class="form-error">
                {{ saveMessage || deleteMessage }}
              </p>
              <div class="issue-actions-buttons">
                <BaseButton
                  :disabled="!canSave || deleting"
                  :loading="saving"
                  type="submit"
                  variant="primary">
                  {{ saving ? t('saving') : t('saveChanges') }}
                </BaseButton>
                <BaseButton
                  :disabled="saving"
                  :loading="deleting"
                  variant="danger"
                  @click="remove">
                  {{ t('deleteIssue') }}
                </BaseButton>
              </div>
            </div>
          </form>
        </section>
      </template>
    </QueryState>
  </div>
</template>

<script setup lang="ts">
import {
  IconCheck,
  IconHistory,
  IconLink,
  IconListDetails,
  IconMessageCircle,
  IconPaperclip,
} from '@tabler/icons-vue'

import AssigneeSelect from '~/components/assignee-select/AssigneeSelect.vue'
import BoardSelect from '~/components/board-select/BoardSelect.vue'
import IssueAttachments from '~/components/issue-attachments/IssueAttachments.vue'
import IssueAttributeFields from '~/components/issue-attribute-fields/IssueAttributeFields.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import { BoardIcon, SpaceIcon } from '~/constants/icons'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

import IssueComments from './components/IssueComments/IssueComments.vue'
import IssueDescription from './components/IssueDescription/IssueDescription.vue'
import IssueHistory from './components/IssueHistory/IssueHistory.vue'
import IssueSkeleton from './components/IssueSkeleton.vue'
import type { IssuePageDeps, IssuePageSavedIssue, IssuePageViewModel } from './IssuePage.deps'

const props = defineProps<{
  deps: IssuePageDeps
  // In the board's dialog, which has no page header to show the issue in.
  inDialog?: boolean
  issueKey: string
  lazy?: boolean
  onBack: () => Promise<void> | void
  onDeleted?: (issueKey: string) => Promise<void> | void
  onDirtyChange: (dirty: boolean) => void
  onSaved?: (issue: IssuePageSavedIssue) => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    assignee: 'Assignee',
    attachImages: 'Attach images',
    attachImagesHint: 'Attach PNG or JPG images, or paste them with Ctrl+V',
    board: 'Board',
    comments: 'Comments',
    copied: 'Copied',
    copyIssueLink: 'Copy issue link',
    created: 'Created',
    currentBoard: 'Current board',
    currentSpace: 'Current space',
    currentStatus: 'Current status',
    deleteConfirm: 'Delete this issue?',
    deleteIssue: 'Delete issue',
    history: 'History',
    issue: 'Issue',
    issueActivity: 'Issue activity',
    loadError: 'Could not load issue',
    loading: 'Loading issue…',
    owner: 'Owner',
    properties: 'Properties',
    saveChanges: 'Save changes',
    saveWarning: 'Changes were saved, but the issue could not be moved. Try again.',
    saving: 'Saving…',
    space: 'Space',
    status: 'Status',
    title: 'Title',
    titlePlaceholder: 'Leave empty to generate it with AI',
    updated: 'Updated',
  },
  ru: {
    assignee: 'Исполнитель',
    attachImages: 'Прикрепить изображения',
    attachImagesHint: 'Прикрепите PNG или JPG либо вставьте их через Ctrl+V',
    board: 'Доска',
    comments: 'Комментарии',
    copied: 'Скопировано',
    copyIssueLink: 'Копировать ссылку на задачу',
    created: 'Создана',
    currentBoard: 'Текущая доска',
    currentSpace: 'Текущий раздел',
    currentStatus: 'Текущий статус',
    deleteConfirm: 'Удалить эту задачу?',
    deleteIssue: 'Удалить задачу',
    history: 'История',
    issue: 'Задача',
    issueActivity: 'Активность задачи',
    loadError: 'Не удалось загрузить задачу',
    loading: 'Загрузка задачи…',
    owner: 'Владелец',
    properties: 'Свойства',
    saveChanges: 'Сохранить изменения',
    saveWarning: 'Изменения сохранены, но задачу не удалось переместить. Повторите попытку.',
    saving: 'Сохранение…',
    space: 'Раздел',
    status: 'Статус',
    title: 'Заголовок',
    titlePlaceholder: 'Оставьте пустым, чтобы создать его с помощью ИИ',
    updated: 'Изменена',
  },
})

const organizationRoutes = useOrganizationRoutes()
const router = useRouter()
const { formatDateTime } = useFormatters()

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
  title: '',
})

const history = useTemplateRef<InstanceType<typeof IssueHistory>>('history')
const attachments = useTemplateRef<InstanceType<typeof IssueAttachments>>('attachments')

// History loads when its tab is first opened and stays after that.
watch(
  () => state.activeTab,
  (tab) => (state.historyOpened ||= tab === 'history'),
)

const {
  data,
  message: viewMessage,
  pending,
  refresh,
} = await useApiQuery(
  () => `issue:${props.issueKey}`,
  (signal) => props.deps.view({ issueKey: props.issueKey, signal }),
  { lazy: props.lazy },
)

// The page header names the issue on its own page.
if (props.inDialog) {
  useHead({ title: computed(() => data.value?.issueKey ?? t('issue')) })
}

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
      state.title !== currentIssue.value.title ||
      state.files.length > 0 ||
      state.removedAttachmentIds.length > 0 ||
      currentIssue.value.attributes.some(
        (attribute) => state.attributeValues[attribute.id] !== attribute.value,
      )),
)

const issueRoute = computed(() => organizationRoutes.issue(props.issueKey))

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
    title: issue.title,
  })
}

const setDirty = (value: boolean) => {
  state.dirty = value
  props.onDirtyChange(value)
}

const handleSaved = async (issue: IssuePageSavedIssue) => {
  const keyChanged = issue.issueKey !== props.issueKey
  setDirty(false)
  await props.onSaved?.(issue)
  if (keyChanged) {
    return
  }
  await refresh()
  void history.value?.refresh()
  if (!issue.complete) {
    saveMessage.value = t('saveWarning')
  }
}

const {
  execute: saveIssue,
  message: saveMessage,
  pending: saving,
} = useApiAction(props.deps.saveIssue)

const {
  execute: deleteIssue,
  message: deleteMessage,
  pending: deleting,
} = useApiAction(props.deps.deleteIssue)

const save = async () => {
  const issue = currentIssue.value
  if (!issue || !canSave.value) {
    return
  }
  const saved = await saveIssue({
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
    previousSpaceKey: issue.spaceId,
    previousStatusId: issue.statusId,
    removeAttachmentIds: state.removedAttachmentIds,
    spaceKey: state.pickedSpaceId,
    statusId: state.statusId,
    title: state.title,
  })
  if (saved) {
    await handleSaved(saved.value)
  }
}

const remove = async () => {
  if (confirm(t('deleteConfirm')) && (await deleteIssue({ issueKey: props.issueKey }))) {
    await props.onDeleted?.(props.issueKey)
    await leaveAfterIssueChanged()
  }
}

// A pasted line break becomes a space: the title is one line.
const changeTitle = (event: Event) => {
  state.title = (event.target as HTMLTextAreaElement).value.replaceAll(/\s*\n\s*/g, ' ')
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
    window.prompt(t('copyIssueLink'), url)
  }
  state.copied = true
  setTimeout(() => (state.copied = false), 1200)
}

const leaveAfterIssueChanged = async () => {
  setDirty(false)
  await leave()
}

const leave = async () => {
  await props.onBack()
}

watch(data, (issue) => issue && syncState(issue), { immediate: true })

watch(
  () => props.issueKey,
  () => {
    state.activeTab = 'comments'
    state.historyOpened = false
  },
)

watch(dirty, setDirty, { immediate: true })
</script>

<style scoped>
/* The issue scrolls inside itself, under the page header, in the space the page has left. */
.issue-page-root {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.issue-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  margin-inline: auto;
  max-width: 1240px;
  min-height: 0;
  width: 100%;
}

.issue-dialog-heading {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  min-width: 0;
}

.issue-dialog-heading h1 {
  font-size: 16px;
}

.issue-dialog-heading h1 a {
  color: var(--color-muted);
  text-decoration: none;
}

.issue-dialog-heading h1 a:is(:hover, :focus-visible) {
  color: var(--color-text);
}

.issue-page-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
  row-gap: var(--space-4);
}

.issue-form-content {
  align-items: start;
  column-gap: var(--space-8);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 304px;
  grid-template-rows: fit-content(100%);
  min-height: 0;
  overflow: hidden;
}

.issue-form-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-height: 100%;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 var(--space-3) var(--space-4) 0;
}

.issue-form-main > * {
  flex-shrink: 0;
}

.issue-head {
  display: grid;
  gap: var(--space-4);
}

.issue-title-input {
  background: transparent;
  border: 0;
  border-radius: 0;
  color: var(--color-text);
  font-size: 26px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
  line-height: 1.25;
  max-height: none;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  resize: none;
}

/* Like a heading being written: only the caret shows that it is edited. */
.issue-title-input:is(:hover, :focus, :disabled) {
  border: 0;
  box-shadow: none;
}

.issue-form-side {
  display: grid;
  font-size: var(--font-size-body);
  gap: var(--space-4);
  max-height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.issue-form-side h2 {
  font-size: inherit;
  margin: 0;
}

/* A dense panel: its fields take the small control size through the tokens, at the text's size. */
.issue-properties {
  --control-height: var(--control-height-small);

  grid-auto-rows: var(--control-height);
}

.issue-properties,
.issue-dates {
  align-items: center;
  display: grid;
  gap: var(--space-2) var(--space-3);
  grid-template-columns: 88px minmax(0, 1fr);
  margin: 0;
}

.issue-properties :deep(label),
.issue-property-label,
.issue-dates dt {
  color: var(--color-muted);
  font-weight: normal;
  margin: 0;
  overflow-wrap: anywhere;
}

.issue-person {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
  padding: 0 var(--space-3);
}

.issue-person .avatar {
  font-size: var(--font-size-caption);
  height: 20px;
  width: 20px;
}

.issue-dates {
  border-top: 1px solid var(--color-divider);
  grid-auto-rows: var(--control-height-small);
  padding-top: var(--space-4);
}

.issue-dates dd {
  color: var(--color-muted);
  margin: 0;
}

.issue-actions .form-error {
  margin: 0 0 var(--space-3);
}

.issue-actions-buttons {
  display: flex;
  gap: var(--space-2);
}

@media (max-width: 767px) {
  .issue-title-input {
    font-size: var(--font-size-title);
  }

  .issue-form-content {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: max-content max-content;
    overflow: auto;
    row-gap: var(--space-8);
  }

  .issue-form-main,
  .issue-form-side {
    max-height: none;
    overflow: visible;
  }
}
</style>
