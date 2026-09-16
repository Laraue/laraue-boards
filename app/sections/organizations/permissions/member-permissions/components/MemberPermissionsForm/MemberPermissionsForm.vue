<template>
  <form
    class="permissions-editor"
    @submit.prevent="submit">
    <p
      v-if="viewModel.member.isOwner"
      class="muted">
      {{ t('ownerReadonly') }}
    </p>
    <fieldset :disabled="viewModel.member.isOwner">
      <legend>{{ t('administration') }}</legend>
      <p class="muted section-description">{{ t('administrationDescription') }}</p>
      <div class="permission-grid">
        <label
          v-for="permission in ADMIN_PERMISSION_OPTIONS"
          :key="permission.key"
          class="permission-option">
          <input
            v-model="state.draft.admin[permission.key]"
            type="checkbox" />
          <span>{{ t(permission.label) }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset :disabled="viewModel.member.isOwner">
      <legend>{{ t('organizationAccess') }}</legend>
      <p class="muted section-description">{{ t('organizationAccessDescription') }}</p>
      <div class="product-section">
        <h3>{{ t('boards') }}</h3>
        <div class="read-permission">
          <strong>{{ t('read') }}</strong>
          <label class="permission-option">
            <input
              :aria-label="t('readOrganization')"
              :checked="state.draft.global.canRead || globalReadInherited"
              :disabled="globalReadInherited"
              :title="globalReadInherited ? t('inherited') : undefined"
              type="checkbox"
              @change="state.draft.global.canRead = !state.draft.global.canRead" />
            <span>{{ t('readOrganization') }}</span>
          </label>
        </div>
        <PermissionTable
          :on-toggle="toggleGlobal"
          :rows="globalPermissionRows" />
      </div>
      <div class="product-section">
        <h3>{{ t('retro') }}</h3>
        <div class="read-permission">
          <strong>{{ t('access') }}</strong>
          <label class="permission-option">
            <input
              v-model="state.draft.global.canManageRetros"
              :aria-label="t('manageRetrosOrganization')"
              type="checkbox" />
            <span>{{ t('manageRetros') }}</span>
          </label>
        </div>
      </div>
    </fieldset>

    <fieldset :disabled="viewModel.member.isOwner">
      <legend>{{ t('directSpaceAccess') }}</legend>
      <p class="muted section-description">{{ t('directSpaceAccessDescription') }}</p>
      <details
        v-for="space in viewModel.spaces"
        :key="space.id"
        class="space-permissions">
        <summary>
          <ChevronRight class="disclosure-icon" />
          <SpaceIcon :style="{ color: space.color }" />
          <strong>{{ space.name }}</strong>
          <span
            v-if="space.isDefault"
            class="muted">
            {{ t('default') }}
          </span>
        </summary>
        <div class="direct-permissions">
          <div class="product-section">
            <h3>{{ t('boards') }}</h3>
            <div class="read-permission">
              <strong>{{ t('read') }}</strong>
              <label class="permission-option">
                <input
                  :aria-label="`${t('read')} ${space.name}`"
                  :checked="
                    state.draft.direct[space.id]!.canRead ||
                    directPermissionTables[space.id]!.readInherited
                  "
                  :disabled="directPermissionTables[space.id]!.readInherited"
                  :title="
                    directPermissionTables[space.id]!.readInherited ? t('inherited') : undefined
                  "
                  type="checkbox"
                  @change="
                    state.draft.direct[space.id]!.canRead = !state.draft.direct[space.id]!.canRead
                  " />
                <span>{{ t('readSpace') }}</span>
              </label>
            </div>
            <PermissionTable
              :label-suffix="` ${t('in')} ${space.name}`"
              :on-toggle="(key) => toggleDirect(space.id, key)"
              :rows="directPermissionTables[space.id]!.rows" />
          </div>
          <div class="product-section">
            <h3>{{ t('retro') }}</h3>
            <div class="read-permission">
              <strong>{{ t('access') }}</strong>
              <label class="permission-option">
                <input
                  :aria-label="`${t('manageRetros')} ${t('in')} ${space.name}`"
                  :checked="
                    state.draft.direct[space.id]!.canManageRetros ||
                    state.draft.global.canManageRetros
                  "
                  :disabled="state.draft.global.canManageRetros"
                  :title="state.draft.global.canManageRetros ? t('inherited') : undefined"
                  type="checkbox"
                  @change="
                    state.draft.direct[space.id]!.canManageRetros =
                      !state.draft.direct[space.id]!.canManageRetros
                  " />
                <span>{{ t('manageRetros') }}</span>
              </label>
            </div>
          </div>
        </div>
      </details>
    </fieldset>

    <p
      v-if="saved"
      class="form-success">
      {{ t('permissionsSaved') }}
    </p>
    <p
      v-if="error"
      class="form-error">
      {{ error }}
    </p>
    <div
      v-if="!viewModel.member.isOwner"
      class="form-actions">
      <button
        class="primary"
        :disabled="submitting">
        {{ submitting ? t('saving') : t('savePermissions') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'

import { SpaceIcon } from '~/constants/icons'
import type {
  DirectSpacePermissions,
  GlobalPermissions,
  MemberPermissions,
  MemberPermissionsPageData,
} from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.types'

import PermissionTable from './components/PermissionTable.vue'
import {
  ADMIN_PERMISSION_OPTIONS,
  getDirectPermissionTables,
  getGlobalPermissionRows,
  isGlobalReadInherited,
} from './permissionTables'

const props = defineProps<{
  error: null | string
  onSubmit: (permissions: MemberPermissions) => Promise<void>
  saved: boolean
  submitting: boolean
  viewModel: MemberPermissionsPageData
}>()

const { t } = useI18n({
  en: {
    access: 'Access',
    administration: 'Administration',
    administrationDescription: 'Controls organization-level management tools.',
    boards: 'Boards',
    default: 'Default',
    deleteOrganization: 'Delete organization',
    directSpaceAccess: 'Direct space access',
    directSpaceAccessDescription: 'Adds permissions for individual spaces.',
    in: 'in',
    inherited: 'Inherited',
    manageAttributes: 'Manage attributes',
    manageMembers: 'Manage members and permissions',
    manageRetros: 'Manage retros',
    manageRetrosOrganization: 'Manage retros in organization',
    moveData: 'Move spaces and boards',
    organizationAccess: 'Organization access',
    organizationAccessDescription: 'These permissions apply to every space.',
    ownerReadonly: 'Owner permissions are read-only.',
    permissionsSaved: 'Permissions saved.',
    read: 'Read',
    readOrganization: 'Read organization',
    readSpace: 'Read space',
    retro: 'Retro',
    savePermissions: 'Save permissions',
    saving: 'Saving…',
    updateOrganization: 'Edit organization',
  },
  ru: {
    access: 'Доступ',
    administration: 'Администрирование',
    administrationDescription: 'Управление инструментами организации.',
    boards: 'Доски',
    default: 'По умолчанию',
    deleteOrganization: 'Удаление организации',
    directSpaceAccess: 'Прямой доступ к разделам',
    directSpaceAccessDescription: 'Добавляет права для отдельных разделов.',
    in: 'в',
    inherited: 'Унаследовано',
    manageAttributes: 'Управление атрибутами',
    manageMembers: 'Управление участниками и правами',
    manageRetros: 'Управление ретроспективами',
    manageRetrosOrganization: 'Управление ретроспективами в организации',
    moveData: 'Перемещение разделов и досок',
    organizationAccess: 'Доступ к организации',
    organizationAccessDescription: 'Эти права действуют для каждого раздела.',
    ownerReadonly: 'Права владельца доступны только для чтения.',
    permissionsSaved: 'Права сохранены.',
    read: 'Чтение',
    readOrganization: 'Чтение организации',
    readSpace: 'Чтение раздела',
    retro: 'Ретро',
    savePermissions: 'Сохранить права',
    saving: 'Сохранение…',
    updateOrganization: 'Изменение организации',
  },
})

const state = reactive({
  draft: structuredClone(toRaw(props.viewModel.permissions)),
})

const globalPermissionRows = computed(() => getGlobalPermissionRows(state.draft.global))

const globalReadInherited = computed(() => isGlobalReadInherited(globalPermissionRows.value))

const directPermissionTables = computed(() =>
  getDirectPermissionTables({
    globalRows: globalPermissionRows.value,
    permissions: state.draft,
    spaces: props.viewModel.spaces,
  }),
)

const toggleGlobal = (key: keyof GlobalPermissions) => {
  state.draft.global[key] = !state.draft.global[key]
}

const toggleDirect = (spaceId: string, key: keyof DirectSpacePermissions) => {
  const space = state.draft.direct[spaceId]
  if (space) {
    space[key] = !space[key]
  }
}

const submit = async () => {
  await props.onSubmit(structuredClone(toRaw(state.draft)))
}

watch(
  () => props.viewModel.permissions,
  (permissions) => {
    state.draft = structuredClone(toRaw(permissions))
  },
)
</script>

<style scoped>
.permissions-editor {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-6);
}

fieldset {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  margin: 0;
  padding: var(--space-4);
}

legend {
  font-weight: var(--font-weight-semibold);
  padding: 0 var(--space-2);
}

.section-description {
  margin-bottom: var(--space-4);
}

.permission-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.permission-option {
  align-items: center;
  display: flex;
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  margin: 0;
}

.read-permission {
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: flex;
  justify-content: space-between;
  padding: var(--space-3);
}

.read-permission + .read-permission {
  margin-top: var(--space-3);
}

.product-section + .product-section {
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-5);
  padding-top: var(--space-5);
}

.product-section h3 {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-3);
  text-transform: uppercase;
}

.space-permissions {
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3) 0;
}

.space-permissions:last-child {
  border-bottom: 0;
}

.space-permissions summary {
  align-items: center;
  border-radius: var(--radius-control);
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  list-style: none;
  padding: var(--space-2);
}

.space-permissions summary:hover {
  background: var(--color-hover);
}

.space-permissions summary::-webkit-details-marker {
  display: none;
}

.space-permissions .disclosure-icon {
  transition: transform var(--duration-fast) var(--ease-standard);
}

.space-permissions[open] .disclosure-icon {
  transform: rotate(90deg);
}

.direct-permissions {
  padding: var(--space-4) 0 var(--space-1) var(--space-6);
}

@media (max-width: 767px) {
  .permissions-editor {
    margin-top: var(--space-4);
  }

  .permission-grid {
    grid-template-columns: 1fr;
  }

  .direct-permissions {
    padding-left: 0;
  }
}
</style>
