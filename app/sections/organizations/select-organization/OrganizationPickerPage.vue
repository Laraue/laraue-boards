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
            <button
              v-for="organization in organizations"
              :key="organization.id"
              class="org-choice"
              :disabled="selecting"
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
              <ChevronRight />
            </button>
            <p
              v-if="organizations.length === 0"
              class="empty">
              No organizations yet.
            </p>
          </div>
          <NuxtLink
            class="secondary"
            to="/organizations/new">
            <Plus />
            Create organization
          </NuxtLink>
          <p
            v-if="selectMessage"
            class="form-error">
            {{ selectMessage }}
          </p>
        </div>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ChevronRight, Plus } from '@lucide/vue'

import type { OrganizationPickerPageDeps } from '~/sections/organizations/select-organization/OrganizationPickerPage.deps'

const props = defineProps<{
  deps: OrganizationPickerPageDeps
  onSelected: (organizationKey: string) => Promise<void> | void
}>()

useHead({ title: 'Organizations' })

const { data, message, pending, refresh } = await useQuery(
  'organization-picker',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)

const {
  execute: selectOrganization,
  message: selectMessage,
  pending: selecting,
} = useAction(props.deps.select)

const select = async (organizationId: string, organizationKey: string): Promise<void> => {
  const selected = await selectOrganization({ organizationId })
  if (selected) {
    await props.onSelected(organizationKey)
  }
}
</script>

<style scoped>
.org-picker {
  display: grid;
  min-height: 100vh;
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  text-align: left;
  transition: var(--transition-press);
  width: 100%;
}

.org-choice:hover {
  border-color: var(--color-accent);
}

.org-choice:not(:disabled):active {
  translate: 0 var(--press-offset);
}

.org-choice > span:nth-child(2) {
  display: grid;
}

.org-choice > .lucide {
  color: var(--color-muted);
  margin-left: auto;
}
</style>
