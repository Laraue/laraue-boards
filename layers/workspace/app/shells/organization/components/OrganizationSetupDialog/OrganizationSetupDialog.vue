<!-- The organization setup window (BRD-293), shown to the owner until it is finished: first name the space
     sign-up created, then start empty or with demo issues. Closing it postpones the setup to the next visit. -->
<template>
  <BaseDialog
    ref="dialog"
    :close-label="t('close')"
    :description="state.step === 'space' ? t('spaceDescription') : t('demoDescription')"
    :size="state.step === 'demo' && state.addDemo ? 'wide' : 'default'"
    :title="state.step === 'space' ? t('spaceTitle') : t('demoTitle')"
    @submit="submit">
    <BaseFieldGroup v-if="state.step === 'space'">
      <BaseField
        id="setup-space-name"
        :label="t('spaceName')">
        <BaseInput
          id="setup-space-name"
          v-model="state.spaceName"
          :disabled="pending"
          maxlength="128"
          minlength="3"
          required
          @update:model-value="suggestKey" />
      </BaseField>
      <BaseField
        id="setup-space-key"
        :hint="t('keyHint', { key: state.spaceKey || 'ABC' })"
        :label="t('spaceKey')">
        <BaseInput
          id="setup-space-key"
          :disabled="pending"
          maxlength="3"
          minlength="3"
          :model-value="state.spaceKey"
          required
          @update:model-value="editKey" />
      </BaseField>
      <!-- A new key renames the keys of the issues already in the space (saved from Telegram before the
           setup). -->
      <p
        v-if="space?.issueCount"
        class="setup-warning"
        role="note">
        <IconAlertTriangle class="setup-warning-icon" />
        {{ t('keyWarning', { count: space.issueCount }) }}
      </p>
    </BaseFieldGroup>

    <div
      v-else-if="spaces.length"
      class="setup-demo">
      <BaseField :label="t('demoData')">
        <template #default="{ labelId }">
          <div
            :aria-labelledby="labelId"
            class="base-tabs-list"
            role="group">
            <button
              v-for="choice in demoChoices"
              :key="String(choice)"
              :aria-pressed="state.addDemo === choice"
              class="base-tabs-tab"
              :disabled="pending"
              type="button"
              @click="state.addDemo = choice">
              {{ choice ? t('addDemoData') : t('noDemoData') }}
            </button>
          </div>
        </template>
      </BaseField>

      <!-- The fields show only for demo data: starting empty is one click. -->
      <BaseFieldGroup v-if="state.addDemo">
        <BaseField
          id="setup-demo-space"
          :label="t('demoSpace')">
          <BaseSelect
            id="setup-demo-space"
            v-model="state.demoSpaceKey"
            :disabled="pending"
            :options="spaceOptions" />
        </BaseField>
        <BaseField :label="t('demoTarget')">
          <template #default="{ labelId }">
            <div
              :aria-labelledby="labelId"
              class="base-tabs-list"
              role="group">
              <button
                v-for="target in targets"
                :key="target"
                :aria-pressed="state.target === target"
                class="base-tabs-tab"
                :disabled="pending"
                type="button"
                @click="state.target = target">
                {{ t(target) }}
              </button>
            </div>
          </template>
        </BaseField>
        <BaseField
          v-if="state.target === 'board'"
          id="setup-board-name"
          :label="t('boardName')">
          <BaseInput
            id="setup-board-name"
            v-model="state.boardName"
            :disabled="pending"
            maxlength="128"
            required />
        </BaseField>
      </BaseFieldGroup>

      <fieldset
        v-if="state.addDemo && state.target === 'board'"
        class="setup-list">
        <legend>{{ t('statuses') }}</legend>
        <div
          v-for="(status, index) in state.statuses"
          :key="status.id"
          class="setup-row">
          <BaseInput
            v-model="status.name"
            :aria-label="t('statusName')"
            :disabled="pending"
            maxlength="128"
            required />
          <StatusCategorySelect
            v-model="status.category"
            :disabled="pending" />
          <BaseIconButton
            :disabled="pending || state.statuses.length === 1"
            :label="t('deleteStatus')"
            variant="danger"
            @click="deleteStatus(index)">
            <IconTrash />
          </BaseIconButton>
        </div>
        <BaseButton
          class="setup-add"
          :disabled="pending"
          @click="addStatus">
          <IconPlus />
          {{ t('addStatus') }}
        </BaseButton>
      </fieldset>

      <fieldset
        v-if="state.addDemo"
        class="setup-list">
        <legend>{{ t('issues') }}</legend>
        <div
          v-for="(issue, index) in state.issues"
          :key="issue.id"
          :class="['setup-row', { 'setup-row-backlog': state.target === 'backlog' }]">
          <BaseInput
            v-model="issue.title"
            :aria-label="t('issueTitle')"
            :disabled="pending"
            maxlength="256"
            required />
          <BaseSelect
            v-if="state.target === 'board'"
            :aria-label="t('issueStatus')"
            :disabled="pending"
            :model-value="String(statusIndexOf(issue))"
            :options="statusOptions"
            @update:model-value="(value: string) => setIssueStatus(issue, Number(value))" />
          <BaseIconButton
            :disabled="pending"
            :label="t('deleteIssue')"
            variant="danger"
            @click="state.issues.splice(index, 1)">
            <IconTrash />
          </BaseIconButton>
        </div>
      </fieldset>
    </div>

    <p
      v-else
      class="muted">
      {{ t('noSpaces') }}
    </p>

    <p
      v-if="message"
      class="form-error">
      {{ message }}
    </p>

    <template #actions>
      <template v-if="state.step === 'space'">
        <BaseButton
          :loading="pending"
          type="submit"
          variant="primary">
          {{ t('next') }}
        </BaseButton>
      </template>
      <BaseButton
        v-else
        :disabled="state.addDemo && state.issues.length === 0"
        :loading="pending"
        type="submit"
        variant="primary">
        {{ t('finish') }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconPlus, IconTrash } from '@tabler/icons-vue'
import { computed, onMounted, reactive, useTemplateRef } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseDialog from '#layers/core/app/ui/components/BaseDialog.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseFieldGroup from '#layers/core/app/ui/components/BaseFieldGroup.vue'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import BaseInput from '#layers/core/app/ui/components/BaseInput.vue'
import BaseSelect from '#layers/core/app/ui/components/BaseSelect.vue'
import type { StatusCategory } from '#layers/workspace/app/sections/boards/shared/components/StatusCategorySelect/StatusCategorySelect.types'
import StatusCategorySelect from '#layers/workspace/app/sections/boards/shared/components/StatusCategorySelect/StatusCategorySelect.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import type { AppLayoutData } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { DemoDataTarget, OrganizationSetupDialogDeps } from './OrganizationSetupDialog.deps'

type DraftStatus = { category: StatusCategory; id: number; name: string }
// An issue points at its status by the draft's id, so it survives deleting another status.
type DraftIssue = { id: number; statusId: number; title: string }

const props = defineProps<{
  deps: OrganizationSetupDialogDeps
  onCompleted: () => Promise<void> | void
  // The sidebar shows the new name while the demo step is open.
  onSpaceRenamed: () => Promise<void> | void
  setup: NonNullable<AppLayoutData['setup']>
  spaces: AppLayoutData['spaces']
}>()

const { t } = useI18n({
  en: {
    addDemoData: 'Add demo data',
    addStatus: 'Add status',
    backlog: 'Backlog',
    board: 'New board',
    boardName: 'Board name',
    close: 'Close',
    defaultBoardName: 'Getting started',
    deleteIssue: 'Delete issue',
    deleteStatus: 'Delete status',
    demoData: 'Demo data',
    demoDescription:
      'Last step: start with an empty organization, or add a few example issues to see how Boards works.',
    demoSpace: 'Space',
    demoTarget: 'Add issues to',
    demoTitle: 'Almost done',
    done: 'Done',
    finish: 'Finish',
    inProgress: 'In Progress',
    issue1: 'Open this issue to see its description, comments and history',
    issue2: 'Drag an issue to another column to change its status',
    issue3: 'Forward a Telegram message to @msgboard_bot to save it as an issue',
    issue4: 'Assign an issue to a teammate',
    issue5: 'Create your first space for a real project',
    issues: 'Issues',
    issueStatus: 'Issue status',
    issueTitle: 'Issue title',
    keyHint: 'Three letters that start every issue key, like {key}-1.',
    keyWarning:
      'The space has {count} issues already. A new key changes their keys and links, and old links stop working.',
    next: 'Next',
    noDemoData: 'No data',
    noSpaces: 'The organization has no spaces to add demo data to.',
    review: 'Review',
    spaceDescription:
      "Two quick steps and you're ready. First, name the space your issues go to, after your team or project.",
    spaceKey: 'Key',
    spaceName: 'Space name',
    spaceTitle: 'Finish setting up your organization',
    statuses: 'Statuses',
    statusName: 'Status name',
    toDo: 'To Do',
  },
  ru: {
    addDemoData: 'Добавить пример',
    addStatus: 'Добавить статус',
    backlog: 'Бэклог',
    board: 'Новая доска',
    boardName: 'Название доски',
    close: 'Закрыть',
    defaultBoardName: 'Знакомство',
    deleteIssue: 'Удалить задачу',
    deleteStatus: 'Удалить статус',
    demoData: 'Пример задач',
    demoDescription:
      'Последний шаг: начните с пустой организации или добавьте несколько примеров задач, чтобы посмотреть, как работает Boards.',
    demoSpace: 'Пространство',
    demoTarget: 'Куда добавить задачи',
    demoTitle: 'Почти готово',
    done: 'Готово',
    finish: 'Завершить',
    inProgress: 'В работе',
    issue1: 'Откройте эту задачу: в ней описание, комментарии и история',
    issue2: 'Перетащите задачу в другую колонку, чтобы сменить статус',
    issue3: 'Перешлите сообщение боту @msgboard_bot в Telegram, и оно станет задачей',
    issue4: 'Назначьте задачу коллеге',
    issue5: 'Создайте первое пространство для настоящего проекта',
    issues: 'Задачи',
    issueStatus: 'Статус задачи',
    issueTitle: 'Название задачи',
    keyHint: 'Три буквы, с которых начинается ключ каждой задачи, например {key}-1.',
    keyWarning:
      'В пространстве уже есть задачи: {count}. Новый ключ изменит их ключи и ссылки, старые ссылки перестанут работать.',
    next: 'Далее',
    noDemoData: 'Без данных',
    noSpaces: 'В организации нет пространств, куда можно добавить пример.',
    review: 'На проверке',
    spaceDescription:
      'Два коротких шага, и можно начинать. Сначала назовите пространство, куда попадают задачи, по команде или проекту.',
    spaceKey: 'Ключ',
    spaceName: 'Название пространства',
    spaceTitle: 'Завершите настройку организации',
    statuses: 'Статусы',
    statusName: 'Название статуса',
    toDo: 'К выполнению',
  },
})

const demoChoices = [false, true]
const targets: DemoDataTarget[] = ['board', 'backlog']

const dialog = useTemplateRef('dialog')

const space = computed(() => props.setup.space)

let nextId = 0
const draftStatus = (name: string, category: StatusCategory): DraftStatus => ({
  category,
  id: ++nextId,
  name,
})

const initialStatuses = [
  draftStatus(t('toDo'), 'Created'),
  draftStatus(t('inProgress'), 'InProgress'),
  draftStatus(t('review'), 'Review'),
  draftStatus(t('done'), 'Completed'),
]

const draftIssue = (title: string, status: DraftStatus): DraftIssue => ({
  id: ++nextId,
  statusId: status.id,
  title,
})

const [toDo, inProgress, review, done] = initialStatuses as [
  DraftStatus,
  DraftStatus,
  DraftStatus,
  DraftStatus,
]

const state = reactive({
  addDemo: false,
  boardName: t('defaultBoardName'),
  demoSpaceKey: space.value?.key ?? props.spaces[0]?.key ?? '',
  issues: [
    draftIssue(t('issue1'), toDo),
    draftIssue(t('issue2'), inProgress),
    draftIssue(t('issue3'), toDo),
    draftIssue(t('issue4'), review),
    draftIssue(t('issue5'), done),
  ],
  keyEdited: false,
  spaceKey: space.value?.key ?? '',
  spaceName: space.value?.name ?? '',
  statuses: initialStatuses,
  step: (space.value ? 'space' : 'demo') as 'demo' | 'space',
  target: 'board' as DemoDataTarget,
})

// The space step renames the space, so the select shows its new name and key.
const spaceOptions = computed(() =>
  props.spaces.map((item) =>
    item.key === space.value?.key
      ? { label: state.spaceName, value: state.spaceKey.toUpperCase() }
      : { label: item.name, value: item.key },
  ),
)

const statusOptions = computed(() =>
  state.statuses.map((status, index) => ({ label: status.name, value: String(index) })),
)

const statusIndexOf = (issue: DraftIssue) =>
  Math.max(
    0,
    state.statuses.findIndex((status) => status.id === issue.statusId),
  )

const setIssueStatus = (issue: DraftIssue, index: number) => {
  issue.statusId = state.statuses[index]!.id
}

const addStatus = () => {
  state.statuses.push(draftStatus('', 'InProgress'))
}

const deleteStatus = (index: number) => {
  state.statuses.splice(index, 1)
}

// Until the key is typed by hand, it follows the name: its first three Latin letters.
const suggestKey = (name: string) => {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '')
  if (!state.keyEdited && letters.length >= 3) {
    state.spaceKey = letters.slice(0, 3)
  }
}

const editKey = (key: string) => {
  state.keyEdited = true
  state.spaceKey = key.toUpperCase()
}

const renameAction = useApiAction(props.deps.renameSpace)
const addDemoDataAction = useApiAction(props.deps.addDemoData)
const completeAction = useApiAction(props.deps.complete)

const pending = computed(
  () =>
    renameAction.pending.value || addDemoDataAction.pending.value || completeAction.pending.value,
)
const message = computed(
  () =>
    renameAction.message.value ?? addDemoDataAction.message.value ?? completeAction.message.value,
)

const renameSpace = async () => {
  const current = space.value!
  const unchanged = current.name === state.spaceName && current.key === state.spaceKey
  const renamed =
    unchanged ||
    (await renameAction.execute({
      color: current.color,
      key: current.key,
      name: state.spaceName.trim(),
      newKey: state.spaceKey,
    }))
  if (renamed) {
    state.demoSpaceKey = state.spaceKey
    state.step = 'demo'
    if (!unchanged) {
      await props.onSpaceRenamed()
    }
  }
}

const finish = async (demoDataAdded: boolean) => {
  if (await completeAction.execute({ demoDataAdded })) {
    dialog.value?.close()
    await props.onCompleted()
  }
}

const addDemoData = async () => {
  const added = await addDemoDataAction.execute({
    boardName: state.boardName.trim(),
    issues: state.issues.map((issue) => ({
      statusIndex: statusIndexOf(issue),
      title: issue.title.trim(),
    })),
    spaceKey: state.demoSpaceKey,
    statuses: state.statuses.map(({ category, name }) => ({ category, name: name.trim() })),
    target: state.target,
  })
  if (added) {
    await finish(true)
  }
}

const submit = async () => {
  if (pending.value) {
    return
  }
  if (state.step === 'space') {
    await renameSpace()
  } else if (props.spaces.length && state.addDemo) {
    await addDemoData()
  } else {
    await finish(false)
  }
}

onMounted(() => dialog.value?.open())
</script>

<style scoped>
.setup-warning {
  align-items: flex-start;
  background: var(--color-warning-soft);
  border-radius: var(--radius-control);
  color: var(--color-warning);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-2) var(--space-3);
}

.setup-warning-icon {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.setup-demo {
  display: grid;
  gap: var(--space-5);
}

.setup-list {
  border: 0;
  display: grid;
  gap: var(--space-2);
  margin: 0;
  min-width: 0;
  padding: 0;
}

.setup-list legend {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-1);
  padding: 0;
}

.setup-row {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  /* The select keeps room for its longest label, the title takes the rest. */
  grid-template-columns: minmax(0, 1fr) 10rem auto;
}

.setup-row-backlog {
  grid-template-columns: minmax(0, 1fr) auto;
}

.setup-add {
  justify-self: start;
}
</style>
