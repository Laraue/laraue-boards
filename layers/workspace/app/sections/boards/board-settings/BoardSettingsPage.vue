<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconSettings"
        :on-refresh="refresh"
        :parents="[
          {
            color: data?.spaceColor,
            icon: SpaceIcon,
            label: data?.spaceName ?? spaceKey,
            to: organizationRoutes.space(spaceKey),
          },
          {
            color: data?.color,
            icon: BoardIcon,
            label: data?.name ?? t('board'),
            to: organizationRoutes.board(spaceKey, boardId),
          },
        ]"
        :title="t('settings')">
        <template
          v-if="data?.canUpdate"
          #actions>
          <BaseButton
            :disabled="removing"
            :form="formId"
            :loading="saving"
            type="submit"
            variant="primary">
            <IconCheck />
            {{ t('save') }}
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
        <section class="settings-page">
          <BoardSettingsForm
            :id="formId"
            :error="saveMessage || removeMessage || null"
            :on-update="(input) => save(page, input)"
            :submitting="saving || removing"
            :view-model="page" />
          <AttributeSettings
            v-if="!page.isDefault"
            v-model="state.attributeSettings"
            :can-edit="page.canUpdate"
            :description="attributesDescription(page)"
            :disabled="saving || removing"
            :view="page.attributeSettings" />
          <BaseDangerZone
            v-if="page.canDelete"
            :description="t('deleteDescription')"
            :title="t('deleteBoard')">
            <BaseButton
              :disabled="saving"
              :loading="removing"
              variant="danger"
              @click="remove">
              <IconTrash />
              {{ t('deleteBoard') }}
            </BaseButton>
          </BaseDangerZone>
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconCheck, IconSettings, IconTrash } from '@tabler/icons-vue'
import { reactive, useId, watch } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseDangerZone from '#layers/core/app/ui/components/BaseDangerZone.vue'
import { useConfirm } from '#layers/core/app/ui/composables/useConfirm'
import type {
  BoardSettingsPageData,
  BoardSettingsPageDeps,
} from '#layers/workspace/app/sections/boards/board-settings/BoardSettingsPage.deps'
import type { BoardSettingsFormInput } from '#layers/workspace/app/sections/boards/board-settings/components/BoardSettingsForm.types'
import BoardSettingsForm from '#layers/workspace/app/sections/boards/board-settings/components/BoardSettingsForm.vue'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import type { AttributeSettingsDraft } from '#layers/workspace/app/shared/components/AttributeSettings/AttributeSettings.types'
import AttributeSettings from '#layers/workspace/app/shared/components/AttributeSettings/AttributeSettings.vue'
import {
  toAttributeSettingsDraft,
  toAttributeSettingsSave,
} from '#layers/workspace/app/shared/components/AttributeSettings/attributeSettingsDraft'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { BoardIcon, SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  boardId: string
  deps: BoardSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onSaved: () => Promise<void> | void
  organizationRoutes: OrganizationRoutes
  spaceKey: string
}>()

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    attributesFollowOrganization: 'Same as the organization.',
    attributesFollowSpace: 'Same as the space.',
    attributesOwn: 'Changes in the space and the organization don’t apply here.',
    board: 'Board',
    deleteBoard: 'Delete board',
    deleteConfirm: 'Delete this board?',
    deleteDescription: 'Deletes the board for every member. This cannot be undone.',
    loadError: 'Could not load board',
    loading: 'Loading board…',
    save: 'Save',
    settings: 'Board settings',
  },
  ru: {
    attributesFollowOrganization: 'Как в организации.',
    attributesFollowSpace: 'Как в пространстве.',
    attributesOwn: 'Изменения в пространстве и организации сюда не доходят.',
    board: 'Доска',
    deleteBoard: 'Удалить доску',
    deleteConfirm: 'Удалить эту доску?',
    deleteDescription: 'Удаляет доску для всех участников. Отменить нельзя.',
    loadError: 'Не удалось загрузить доску',
    loading: 'Загрузка доски…',
    save: 'Сохранить',
    settings: 'Настройки доски',
  },
})

const formId = `board-settings-${useId()}`

const attributesDescription = (page: BoardSettingsPageData) => {
  if (state.attributeSettings.overridden) {
    return t('attributesOwn')
  }
  return page.attributeSettings.inherited.source === 'space'
    ? t('attributesFollowSpace')
    : t('attributesFollowOrganization')
}

const state = reactive<{ attributeSettings: AttributeSettingsDraft }>({
  attributeSettings: { attributes: [], overridden: false },
})

const { data, message, pending, refresh } = await useApiQuery(
  () => `board-settings:${props.boardId}`,
  (signal) => props.deps.view({ boardId: props.boardId, signal, spaceKey: props.spaceKey }),
)

watch(
  data,
  (value) => {
    if (value) {
      state.attributeSettings = toAttributeSettingsDraft(value.attributeSettings, 'board')
    }
  },
  { immediate: true },
)

const {
  execute: saveSettings,
  message: saveMessage,
  pending: saving,
} = useApiAction(props.deps.save)
const {
  execute: removeBoard,
  message: removeMessage,
  pending: removing,
} = useApiAction(props.deps.remove)

const save = async (page: BoardSettingsPageData, input: BoardSettingsFormInput): Promise<void> => {
  const saved = await saveSettings({
    // The backlog always follows its space.
    attributeSettings: page.isDefault
      ? null
      : toAttributeSettingsSave(page.attributeSettings, 'board', state.attributeSettings),
    boardId: props.boardId,
    ...input,
  })
  if (saved) {
    await props.onSaved()
  }
}

const remove = async (): Promise<void> => {
  if (
    (await confirm({ danger: true, title: t('deleteConfirm') })) &&
    (await removeBoard({ boardId: props.boardId }))
  ) {
    await props.onDeleted()
  }
}
</script>
