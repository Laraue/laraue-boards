<template>
  <QueryState
    :data="data"
    error-title="Could not load organizations"
    loading-text="Loading organizations…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: organizations }">
      <section class="org-picker">
        <div class="picker-card">
          <div class="logo">
            <img
              alt=""
              class="logo-mark"
              src="/favicon.svg" />
            <span>Laraue Boards</span>
          </div>
          <h1>Choose an organization</h1>
          <p class="muted">Select where you want to work today.</p>
          <div class="org-list">
            <div
              v-for="organization in organizations"
              :key="organization.id"
              class="org-row">
              <button
                class="org-choice"
                :data-tour="organization.isPersonal ? 'personal-organization' : undefined"
                :disabled="selecting || leaving"
                type="button"
                @click="select(organization.id, organization.key)">
                <span
                  class="entity-avatar"
                  :style="{ background: organization.color }">
                  {{ organization.initial }}
                </span>
                <span>
                  <strong>{{ organization.name }}</strong>
                  <small class="muted">{{ organization.description }}</small>
                </span>
              </button>
              <button
                v-if="organization.canLeave"
                :aria-label="`Leave ${organization.name}`"
                class="icon-btn danger"
                :disabled="selecting || leaving"
                title="Leave organization"
                type="button"
                @click="leave(organization.id, organization.name)">
                <LogOut />
              </button>
            </div>
            <AppEmptyState
              v-if="organizations.length === 0"
              hint="An organization is your workspace — it holds your spaces, boards, and issues. Create one for yourself or your team, or open a teammate's invitation link to join theirs."
              title="No organizations yet" />
          </div>
          <NuxtLink
            class="secondary"
            data-tour="create-organization"
            to="/organizations/new">
            <Plus />
            Create organization
          </NuxtLink>
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
import { LogOut, Plus } from '@lucide/vue'

import type { OrganizationPickerPageDeps } from '~/sections/organizations/select-organization/OrganizationPickerPage.deps'
import { useOrganizationTour } from '~/sections/organizations/select-organization/useOrganizationTour'

const props = defineProps<{
  deps: OrganizationPickerPageDeps
  onSelected: (organizationKey: string) => Promise<void> | void
}>()

useHead({ title: 'Organizations' })

const { data, message, pending, refresh } = await useQuery(
  'organization-picker',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)

useOrganizationTour(data, props.deps.tour)

const {
  execute: selectOrganization,
  message: selectMessage,
  pending: selecting,
} = useAction(props.deps.select)

const {
  execute: leaveOrganization,
  message: leaveMessage,
  pending: leaving,
} = useAction(props.deps.leave, { onSuccess: async () => refresh() })

const select = async (organizationId: string, organizationKey: string): Promise<void> => {
  const selected = await selectOrganization({ organizationId })
  if (selected) {
    await props.onSelected(organizationKey)
  }
}

const leave = (id: string, name: string): void => {
  if (!selecting.value && !leaving.value && confirm(`Leave ${name}?`)) {
    void leaveOrganization({ id })
  }
}
</script>

<style scoped>
.org-picker {
  display: grid;
  min-height: 100dvh;
  padding: var(--space-6);
  place-items: center;
}

.picker-card {
  width: min(var(--form-page-max-width), 100%);
}

.picker-card > .logo {
  margin-bottom: 48px;
}

.org-list {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-6) 0 var(--space-4);
}

.org-choice {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--color-text);
  display: flex;
  flex: 1;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-4);
  text-align: left;
  transition: var(--transition-press);
}

.org-row {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  overflow: hidden;
  transition: var(--transition-press);
}

.org-row > .icon-btn {
  align-self: stretch;
  border: 0;
  border-left: 1px solid var(--color-border);
  border-radius: 0;
  flex: 0 0 auto;
  height: auto;
  width: 56px;
}

.org-row:has(.org-choice:hover) {
  border-color: var(--color-accent);
}

.org-row:has(.org-choice:hover) > .icon-btn {
  border-left-color: var(--color-accent);
}

.org-choice:not(:disabled):active {
  translate: 0 var(--press-offset);
}

.org-choice > span:nth-child(2) {
  display: grid;
}
</style>
