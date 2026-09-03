<template>
  <form
    class="permissions-editor"
    @submit.prevent="submit">
    <p
      v-if="viewModel.member.isOwner"
      class="muted">
      Owner permissions are read-only.
    </p>
    <fieldset :disabled="viewModel.member.isOwner">
      <legend>Administration</legend>
      <p class="muted section-description">Controls organization-level management tools.</p>
      <div class="permission-grid">
        <label
          v-for="permission in ADMIN_PERMISSION_OPTIONS"
          :key="permission.key"
          class="permission-option">
          <input
            v-model="state.draft.admin[permission.key]"
            type="checkbox" />
          <span>{{ permission.label }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset :disabled="viewModel.member.isOwner">
      <legend>Organization access</legend>
      <p class="muted section-description">These permissions apply to every space.</p>
      <div class="read-permission">
        <strong>Read</strong>
        <label class="permission-option">
          <input
            aria-label="Read organization"
            :checked="state.draft.global.canRead || globalReadInherited"
            :disabled="globalReadInherited"
            :title="globalReadInherited ? 'Inherited' : undefined"
            type="checkbox"
            @change="state.draft.global.canRead = !state.draft.global.canRead" />
          <span>Read organization</span>
        </label>
      </div>
      <div class="read-permission">
        <strong>Retro</strong>
        <label class="permission-option">
          <input
            v-model="state.draft.global.canCreateRetros"
            type="checkbox" />
          <span>Create retros</span>
        </label>
      </div>
      <PermissionTable
        :on-toggle="toggleGlobal"
        :rows="globalPermissionRows" />
    </fieldset>

    <fieldset :disabled="viewModel.member.isOwner">
      <legend>Direct space access</legend>
      <p class="muted section-description">Adds permissions for individual spaces.</p>
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
            Default
          </span>
        </summary>
        <div class="direct-permissions">
          <div class="read-permission">
            <strong>Read</strong>
            <label class="permission-option">
              <input
                :aria-label="`Read ${space.name}`"
                :checked="
                  state.draft.direct[space.id]!.canRead ||
                  directPermissionTables[space.id]!.readInherited
                "
                :disabled="directPermissionTables[space.id]!.readInherited"
                :title="directPermissionTables[space.id]!.readInherited ? 'Inherited' : undefined"
                type="checkbox"
                @change="
                  state.draft.direct[space.id]!.canRead = !state.draft.direct[space.id]!.canRead
                " />
              <span>Read space</span>
            </label>
          </div>
          <PermissionTable
            :label-suffix="` in ${space.name}`"
            :on-toggle="(key) => toggleDirect(space.id, key)"
            :rows="directPermissionTables[space.id]!.rows" />
        </div>
      </details>
    </fieldset>

    <p
      v-if="saved"
      class="form-success">
      Permissions saved.
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
        {{ submitting ? 'Saving…' : 'Save permissions' }}
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

@media (max-width: 760px) {
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
