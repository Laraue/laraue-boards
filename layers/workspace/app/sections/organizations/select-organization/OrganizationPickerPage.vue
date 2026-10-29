<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: organizations }">
      <section class="org-picker">
        <div class="picker-card">
          <BaseSectionHeader
            :description="t('selectWhere')"
            :title="t('chooseOrganization')" />
          <BaseList
            v-if="organizations.length"
            class="org-list">
            <BaseListRow
              v-for="organization in organizations"
              :key="organization.id"
              class="org-row"
              :data-tour="organization.isPersonal ? 'personal-organization' : undefined"
              :description="organization.description">
              <template #leading>
                <BaseAvatar
                  :color="organization.color"
                  :initials="organization.initial"
                  shape="square" />
              </template>
              <!-- The button covers the row, so the whole row picks the organization. -->
              <button
                class="org-choice"
                :disabled="selecting || leaving"
                type="button"
                @click="select(organization.id, organization.key)">
                {{ organization.name }}
              </button>
              <template #trailing>
                <BaseIconButton
                  v-if="organization.canLeave"
                  :disabled="selecting || leaving"
                  :label="`${t('leave')} ${organization.name}`"
                  :tooltip="t('leaveOrganization')"
                  @click="leave(organization.id, organization.name)">
                  <IconLogout />
                </BaseIconButton>
                <IconChevronRight class="org-chevron" />
              </template>
            </BaseListRow>
          </BaseList>
          <BaseEmptyState
            v-else
            class="org-list"
            :hint="t('emptyHint')"
            :title="t('emptyTitle')" />
          <BaseButton
            data-tour="create-organization"
            to="/organizations/new">
            <IconPlus />
            {{ t('createOrganization') }}
          </BaseButton>
          <p
            v-if="selectMessage || leaveMessage"
            class="form-error">
            {{ selectMessage || leaveMessage }}
          </p>
        </div>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { IconChevronRight, IconLogout, IconPlus } from '@tabler/icons-vue'

import { useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseAvatar from '#layers/core/app/ui/components/BaseAvatar.vue'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseEmptyState from '#layers/core/app/ui/components/BaseEmptyState.vue'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import BaseList from '#layers/core/app/ui/components/BaseList.vue'
import BaseListRow from '#layers/core/app/ui/components/BaseListRow.vue'
import BaseSectionHeader from '#layers/core/app/ui/components/BaseSectionHeader.vue'
import { useConfirm } from '#layers/core/app/ui/composables/useConfirm'
import type { OrganizationPickerPageDeps } from '#layers/workspace/app/sections/organizations/select-organization/OrganizationPickerPage.deps'
import { useOrganizationTour } from '#layers/workspace/app/sections/organizations/select-organization/useOrganizationTour'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'

const props = defineProps<{
  deps: OrganizationPickerPageDeps
  onSelected: (organizationKey: string) => Promise<void> | void
}>()

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    chooseOrganization: 'Choose an organization',
    createOrganization: 'Create organization',
    emptyHint:
      "An organization is your workspace — it holds your spaces, boards, and issues. Create one for yourself or your team, or open a teammate's invitation link to join theirs.",
    emptyTitle: 'No organizations yet',
    leave: 'Leave',
    leaveOrganization: 'Leave organization',
    loadError: 'Could not load organizations',
    loading: 'Loading organizations…',
    organizations: 'Organizations',
    selectWhere: 'Select where you want to work today.',
  },
  ru: {
    chooseOrganization: 'Выберите организацию',
    createOrganization: 'Создать организацию',
    emptyHint:
      'Организация объединяет ваши пространства, доски и задачи. Создайте организацию для себя или команды либо откройте ссылку-приглашение от коллеги, чтобы присоединиться.',
    emptyTitle: 'Организаций пока нет',
    leave: 'Покинуть',
    leaveOrganization: 'Покинуть организацию',
    loadError: 'Не удалось загрузить организации',
    loading: 'Загрузка организаций…',
    organizations: 'Организации',
    selectWhere: 'Выберите, где вы хотите работать сегодня.',
  },
})

useHead({ title: t('organizations') })

const { data, message, pending, refresh } = await useApiQuery('organization-picker', (signal) =>
  props.deps.view({ signal }),
)

useOrganizationTour(data, props.deps.tour)

const {
  execute: selectOrganization,
  message: selectMessage,
  pending: selecting,
} = useApiAction(props.deps.select)

const {
  execute: leaveOrganization,
  message: leaveMessage,
  pending: leaving,
} = useApiAction(props.deps.leave)

const select = async (organizationId: string, organizationKey: string): Promise<void> => {
  const selected = await selectOrganization({ organizationId })
  if (selected) {
    await props.onSelected(organizationKey)
  }
}

const leave = async (id: string, name: string): Promise<void> => {
  if (
    (await confirm({ action: t('leave'), danger: true, title: `${t('leave')} ${name}?` })) &&
    (await leaveOrganization({ id }))
  ) {
    await refresh()
  }
}
</script>

<style scoped>
.org-picker {
  display: grid;
  justify-items: center;
  padding: var(--space-8) var(--space-4);
}

.picker-card {
  width: min(var(--form-page-max-width), 100%);
}

.org-list {
  margin: var(--space-6) 0 var(--space-4);
}

.org-row {
  position: relative;
}

.org-row:has(.org-choice:hover:not(:disabled)) {
  background: var(--color-row-hover);
}

.org-choice {
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  padding: 0;
  text-align: left;
}

.org-choice::after {
  content: '';
  inset: 0;
  position: absolute;
}

.org-choice:focus-visible {
  box-shadow: none;
  outline: none;
}

.org-row:has(.org-choice:focus-visible) {
  box-shadow: var(--shadow-focus);
}

/* The end of the row sits above the row's button, so Leave takes its own clicks; the rest of it
   lets clicks through to the row. */
.org-row :deep(.base-list-row-trailing) {
  pointer-events: none;
  position: relative;
  z-index: 1;
}

.org-row :deep(.base-list-row-trailing button) {
  pointer-events: auto;
}

.org-chevron {
  color: var(--color-muted);
  height: var(--icon-size);
  width: var(--icon-size);
}
</style>
