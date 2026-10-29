<template>
  <AppPage
    class="issue-page-root"
    contained
    :padded="!inDialog">
    <template #header>
      <PageHeader
        v-if="!inDialog"
        context-only
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
        <template #title-actions>
          <BaseIconButton
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
          </BaseIconButton>
        </template>
        <template
          v-if="data?.canEdit"
          #actions>
          <IssuePageActions
            :can-save="canSave"
            :deleting="deleting"
            :form-id="formId"
            :locked="fieldsLocked(data)"
            :on-delete="remove"
            :saving="saving" />
        </template>
      </PageHeader>
      <div
        v-else
        class="issue-dialog-heading">
        <h1>
          <NuxtLink :to="issueRoute">{{ data?.issueKey ?? issueKey }}</NuxtLink>
        </h1>
        <BaseIconButton
          :label="state.copied ? t('copied') : t('copyIssueLink')"
          @click="copyIssueLink">
          <IconCheck v-if="state.copied" />
          <IconLink v-else />
        </BaseIconButton>
      </div>
    </template>
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="viewMessage"
      :on-retry="refresh"
      :pending="pending && !data">
      <template #loading>
        <IssueSkeleton
          hide-header
          :in-dialog="inDialog" />
      </template>
      <template #default="{ data: issue }">
        <section class="issue-page">
          <form
            :id="formId"
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
                    :disabled="!canEditFields(issue)"
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
                    :disabled="!canEditFields(issue)">
                    <template #actions>
                      <BaseIconButton
                        :disabled="!canEditFields(issue) || saving || deleting"
                        :label="t('attachImages')"
                        :tooltip="t('attachImagesHint')"
                        @click="attachments?.pick()">
                        <IconPaperclip />
                      </BaseIconButton>
                    </template>
                  </IssueDescription>
                </div>
                <IssueAttachments
                  :key="issue.issueKey"
                  ref="attachments"
                  :attachments="issue.attachments"
                  :disabled="!canEditFields(issue) || saving || deleting"
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
                      :issue-key="issue.issueKey"
                      :reload-token="state.commentsReloadToken" />
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
                    :disabled="!canEditFields(issue)"
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
                    <BaseAvatar
                      :color="issue.ownerColor"
                      :initials="issue.ownerInitial"
                      size="sm" />
                    <span>{{ issue.owner }}</span>
                  </div>
                  <IssueAttributeFields
                    v-if="issue.attributes.length"
                    v-model="state.attributeValues"
                    :attributes="issue.attributes"
                    :disabled="!canEditFields(issue)"
                    select-variant="inline" />
                </div>
                <IssueLinks
                  :key="`links-${issue.issueKey}`"
                  :can-edit="issue.canEdit"
                  :deps="deps.links"
                  :issue-key="issue.issueKey"
                  :links="issue.links"
                  :on-changed="refreshAfterChange" />
                <IssueAgentRun
                  :key="`agent-${issue.issueKey}`"
                  :blocked-by="openBlockers(issue)"
                  :can-edit="issue.canEdit"
                  :completed="issue.statusCategory === 'Completed'"
                  :deps="deps.agentRun"
                  :hand-off="issue.agentHandOff"
                  :in-review="issue.statusCategory === 'Review'"
                  :issue-key="issue.issueKey"
                  :on-changed="refreshAfterChange"
                  :run="issue.agentRun" />
                <dl class="issue-dates">
                  <template v-if="issue.source">
                    <dt>{{ t('source') }}</dt>
                    <dd class="issue-source">
                      <IssueSourceIcon :source="TELEGRAM_SOURCE" />
                      <span v-if="sourceChatLabel(issue.source)">
                        {{ sourceChatLabel(issue.source) }}
                      </span>
                      <a
                        v-if="issue.source.messageUrl"
                        :aria-label="t('openMessage')"
                        class="issue-source-link"
                        :href="issue.source.messageUrl"
                        rel="noopener noreferrer"
                        target="_blank"
                        :title="t('openMessage')">
                        <IconExternalLink />
                      </a>
                    </dd>
                  </template>
                  <!-- The web app, or the key an MCP client or an agent created it with. -->
                  <template v-else-if="issue.createdVia">
                    <dt>{{ t('source') }}</dt>
                    <dd class="issue-source">
                      <IssueSourceIcon :source="issue.createdVia" />
                      <span>{{ createdViaLabel(issue.createdVia) }}</span>
                    </dd>
                  </template>
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
            <div v-if="saveMessage || deleteMessage || (inDialog && issue.canEdit)">
              <p
                v-if="saveMessage || deleteMessage"
                class="form-error"
                role="alert">
                {{ saveMessage || deleteMessage }}
              </p>
              <footer
                v-if="inDialog && issue.canEdit"
                class="issue-dialog-footer">
                <IssuePageActions
                  :can-save="canSave"
                  :deleting="deleting"
                  :form-id="formId"
                  :locked="fieldsLocked(issue)"
                  :on-delete="remove"
                  :saving="saving" />
              </footer>
            </div>
          </form>
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import {
  IconCheck,
  IconExternalLink,
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
import type { IssueSource } from '~/components/issue-source-icon/IssueSourceIcon.types'
import IssueSourceIcon from '~/components/issue-source-icon/IssueSourceIcon.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import { BoardIcon, SpaceIcon } from '~/constants/icons'
import { assertNever } from '~/utils/assertNever'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

import IssueAgentRun from './components/IssueAgentRun/IssueAgentRun.vue'
import IssueComments from './components/IssueComments/IssueComments.vue'
import IssueDescription from './components/IssueDescription/IssueDescription.vue'
import IssueHistory from './components/IssueHistory/IssueHistory.vue'
import IssueLinks from './components/IssueLinks/IssueLinks.vue'
import IssuePageActions from './components/IssuePageActions.vue'
import IssueSkeleton from './components/IssueSkeleton.vue'
import type {
  IssuePageDeps,
  IssuePageSavedIssue,
  IssuePageViewModel,
  IssueSourceViewModel,
} from './IssuePage.deps'

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
const formId = `issue-form-${useId()}`

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    assignee: 'Assignee',
    attachImages: 'Attach files',
    attachImagesHint:
      'Attach images (up to 3 MB) or documents — PDF, DOCX, Markdown, TXT, JSON (up to 10 MB) — or paste them with Ctrl+V',
    board: 'Board',
    comments: 'Comments',
    copied: 'Copied',
    copyIssueLink: 'Copy issue link',
    created: 'Created',
    currentBoard: 'Current board',
    currentSpace: 'Current space',
    currentStatus: 'Current status',
    deleteConfirm: 'Delete this issue?',
    history: 'History',
    issue: 'Issue',
    issueActivity: 'Issue activity',
    loadError: 'Could not load issue',
    loading: 'Loading issue…',
    openMessage: 'Open message in Telegram',
    owner: 'Owner',
    properties: 'Properties',
    saveWarning: 'Changes were saved, but the issue could not be moved. Try again.',
    source: 'Created via',
    sourceAgent: 'Agent',
    sourcePrivateChat: 'private chat with the bot',
    sourceWeb: 'Web app',
    space: 'Space',
    status: 'Status',
    title: 'Title',
    titlePlaceholder: 'Leave empty to generate it with AI',
    updated: 'Updated',
  },
  ru: {
    assignee: 'Исполнитель',
    attachImages: 'Прикрепить файлы',
    attachImagesHint:
      'Прикрепите изображения (до 3 МБ) или документы — PDF, DOCX, Markdown, TXT, JSON (до 10 МБ) — либо вставьте их через Ctrl+V',
    board: 'Доска',
    comments: 'Комментарии',
    copied: 'Скопировано',
    copyIssueLink: 'Копировать ссылку на задачу',
    created: 'Создана',
    currentBoard: 'Текущая доска',
    currentSpace: 'Текущее пространство',
    currentStatus: 'Текущий статус',
    deleteConfirm: 'Удалить эту задачу?',
    history: 'История',
    issue: 'Задача',
    issueActivity: 'Активность задачи',
    loadError: 'Не удалось загрузить задачу',
    loading: 'Загрузка задачи…',
    openMessage: 'Открыть сообщение в Telegram',
    owner: 'Владелец',
    properties: 'Свойства',
    saveWarning: 'Изменения сохранены, но задачу не удалось переместить. Повторите попытку.',
    source: 'Создана через',
    sourceAgent: 'Агент',
    sourcePrivateChat: 'личный чат с ботом',
    sourceWeb: 'Веб-приложение',
    space: 'Пространство',
    status: 'Статус',
    title: 'Заголовок',
    titlePlaceholder: 'Оставьте пустым, чтобы создать его с помощью ИИ',
    updated: 'Изменена',
  },
})

const organizationRoutes = useOrganizationRoutes()
const router = useRouter()
const { formatDateTime } = useFormatters()

// "Telegram · Team"; the private chat with the bot has no title of its own.
// The Telegram icon says where it came from; the text is just the chat.
const TELEGRAM_SOURCE: IssueSource = { keyName: null, kind: 'telegram' }

const sourceChatLabel = (source: IssueSourceViewModel) =>
  source.isPrivateChat ? t('sourcePrivateChat') : source.chatTitle

// Next to the icon, which says how: the key's name for MCP and agents ("My laptop", "Claude Code agent
// (dev-laptop)": an agent's key is named after its client and machine), else the source itself.
const createdViaLabel = (createdVia: IssueSource) => {
  if (createdVia.keyName) {
    return createdVia.keyName
  }

  switch (createdVia.kind) {
    case 'agent':
      return t('sourceAgent')
    case 'mcp':
      return 'MCP'
    case 'telegram':
      return 'Telegram'
    case 'web':
      return t('sourceWeb')
    default:
      return assertNever(createdVia.kind)
  }
}

const state = reactive({
  activeTab: 'comments' as 'comments' | 'history',
  assigneeId: '',
  attributeValues: {} as Record<string, string>,
  boardId: '',
  commentsReloadToken: 0,
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
// Unsaved edits stay: syncState leaves a dirty form alone. Comments and history register their own.
useViewRefresh(refresh)

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

// An open agent run locks the issue's fields (the agent works from what was handed off); status, comments and
// cancelling the run stay available.
const fieldsLocked = (issue?: IssuePageViewModel | null) =>
  issue?.agentRun?.state === 'ready' || issue?.agentRun?.state === 'working'

const canEditFields = (issue: IssuePageViewModel) => issue.canEdit && !fieldsLocked(issue)

const openBlockers = (issue: IssuePageViewModel) =>
  issue.links
    .filter((link) => link.relation === 'blockedBy' && link.statusCategory !== 'Completed')
    .map((link) => link.issueKey)

// Agent run and link changes also show in the comments (send back posts one) and the history, which load separately.
const refreshAfterChange = async () => {
  await refresh()
  state.commentsReloadToken++
  void history.value?.refresh()
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
    fieldsLocked: fieldsLocked(issue),
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
  if (
    (await confirm({ danger: true, title: t('deleteConfirm') })) &&
    (await deleteIssue({ issueKey: props.issueKey }))
  ) {
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
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  width: 100%;
}

.issue-dialog-heading {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  min-width: 0;
}

.issue-dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.issue-dialog-heading h1 {
  font-size: var(--font-size-lg);
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
  row-gap: var(--space-2);
}

.issue-form-content {
  align-items: start;
  column-gap: var(--space-8);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
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
  box-shadow: none;
  color: var(--color-text);
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
  line-height: var(--line-height-heading);
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

.issue-properties {
  grid-auto-rows: var(--control-height);
}

.issue-properties,
.issue-dates {
  align-items: center;
  display: grid;
  gap: var(--space-1) var(--space-3);
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

.issue-dates {
  border-top: 1px solid var(--color-divider);
  grid-auto-rows: minmax(var(--control-height-small), auto);
  padding-top: var(--space-4);
}

.issue-dates dt {
  align-self: start;
  line-height: var(--control-height-small);
}

.issue-source {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  line-height: var(--control-height-small);
  overflow-wrap: anywhere;
}

.issue-source-link {
  color: var(--color-accent);
  display: inline-flex;
  flex-shrink: 0;
}

.issue-source-link svg {
  height: 1em;
  width: 1em;
}

.issue-dates dd {
  color: var(--color-muted);
  margin: 0;
}

/* Beside a 320px Properties column the issue would get under 400px on a tablet; up to 1023px the
   properties go under it. */
@media (max-width: 1023px) {
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
