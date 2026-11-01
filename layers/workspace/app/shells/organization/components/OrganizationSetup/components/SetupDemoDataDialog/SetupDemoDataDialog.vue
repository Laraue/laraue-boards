<!-- The last window of the organization setup: finish empty, or with demo issues on a new board or in the
     backlog. The fields show only when demo data is chosen, and the window widens for them. -->
<template>
  <BaseDialog
    ref="dialog"
    :close-label="t('close')"
    :description="t('description')"
    :size="state.addDemo ? 'wide' : 'default'"
    :title="t('title')"
    @submit="submit">
    <div
      v-if="spaces.length"
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

      <template v-if="state.addDemo">
        <BaseFieldGroup>
          <BaseField
            id="setup-demo-space"
            :label="t('space')">
            <BaseSelect
              id="setup-demo-space"
              v-model="state.spaceKey"
              :disabled="pending"
              :options="spaces.map((space) => ({ label: space.name, value: space.key }))" />
          </BaseField>
          <BaseField :label="t('target')">
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
          v-if="state.target === 'board'"
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
              @click="state.statuses.splice(index, 1)">
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

        <fieldset class="setup-list">
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
      </template>
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
      <BaseButton
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
import { IconPlus, IconTrash } from '@tabler/icons-vue'
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

import type { DemoDataTarget, SetupDemoDataDialogDeps } from './SetupDemoDataDialog.deps'

type DraftStatus = { category: StatusCategory; id: number; name: string }
// An issue points at its status by the draft's id, so it survives deleting another status.
type DraftIssue = { id: number; statusId: number; title: string }

const props = defineProps<{
  // The space the demo issues go to unless another is picked.
  defaultSpaceKey: string
  deps: SetupDemoDataDialogDeps
  onCompleted: () => Promise<void> | void
  spaces: Array<{ key: string; name: string }>
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
    description:
      'Last step: start with an empty organization, or add a few example issues to see how Boards works.',
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
    noDemoData: 'No data',
    noSpaces: 'The organization has no spaces to add demo data to.',
    review: 'Review',
    space: 'Space',
    statuses: 'Statuses',
    statusName: 'Status name',
    target: 'Add issues to',
    title: 'Almost done',
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
    description:
      'Последний шаг: начните с пустой организации или добавьте несколько примеров задач, чтобы посмотреть, как работает Boards.',
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
    noDemoData: 'Без данных',
    noSpaces: 'В организации нет пространств, куда можно добавить пример.',
    review: 'На проверке',
    space: 'Пространство',
    statuses: 'Статусы',
    statusName: 'Название статуса',
    target: 'Куда добавить задачи',
    title: 'Почти готово',
    toDo: 'К выполнению',
  },
})

const demoChoices = [false, true]
const targets: DemoDataTarget[] = ['board', 'backlog']

const dialog = useTemplateRef('dialog')

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
  issues: [
    draftIssue(t('issue1'), toDo),
    draftIssue(t('issue2'), inProgress),
    draftIssue(t('issue3'), toDo),
    draftIssue(t('issue4'), review),
    draftIssue(t('issue5'), done),
  ],
  spaceKey: props.defaultSpaceKey || props.spaces[0]?.key || '',
  statuses: initialStatuses,
  target: 'board' as DemoDataTarget,
})

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

const addDemoDataAction = useApiAction(props.deps.addDemoData)
const completeAction = useApiAction(props.deps.complete)

const pending = computed(() => addDemoDataAction.pending.value || completeAction.pending.value)
const message = computed(() => addDemoDataAction.message.value ?? completeAction.message.value)

const addDemoData = () =>
  addDemoDataAction.execute({
    boardName: state.boardName.trim(),
    issues: state.issues.map((issue) => ({
      statusIndex: statusIndexOf(issue),
      title: issue.title.trim(),
    })),
    spaceKey: state.spaceKey,
    statuses: state.statuses.map(({ category, name }) => ({ category, name: name.trim() })),
    target: state.target,
  })

const submit = async () => {
  if (pending.value) {
    return
  }
  const demoDataAdded = props.spaces.length > 0 && state.addDemo
  if (demoDataAdded && !(await addDemoData())) {
    return
  }
  if (await completeAction.execute({ demoDataAdded })) {
    dialog.value?.close()
    await props.onCompleted()
  }
}

onMounted(() => dialog.value?.open())
</script>

<style scoped>
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
