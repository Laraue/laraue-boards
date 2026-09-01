<template>
  <QueryState
    :data="data"
    error-title="Could not load retros"
    loading-text="Loading retros…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: retros }">
      <section class="retro-list-page">
        <div class="title-row">
          <div class="page-heading">
            <RetroIcon class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>Retro</h1>
            </div>
          </div>
          <div class="title-actions">
            <button
              class="primary"
              :disabled="starting"
              type="button"
              @click="start(null)">
              <Plus />
              <span class="btn-label">Start retro</span>
            </button>
          </div>
        </div>

        <div
          v-if="retros.length"
          class="retro-rows">
          <div
            v-for="retro in retros"
            :key="retro.id"
            class="retro-row-item">
            <NuxtLink
              class="retro-row"
              :to="organizationRoutes.retro(retro.id)">
              <strong class="retro-name">{{ retro.name }}</strong>
              <span
                class="retro-status"
                :class="{ 'retro-status--active': !retro.finished }">
                {{ retro.finished ? 'Finished' : 'Active' }}
              </span>
              <span class="muted retro-meta">{{ retro.cardCount }} cards</span>
              <span class="muted retro-meta">{{ formatDate(retro.createdAt) }}</span>
            </NuxtLink>
            <button
              v-if="retro.openActionCount > 0"
              class="secondary small continue-btn"
              :disabled="starting"
              type="button"
              @click="start(retro)">
              Continue from here ({{ retro.openActionCount }})
            </button>
          </div>
        </div>
        <AppEmptyState
          v-else
          hint="A retro is a shared board where the team collects what went well, what hurt, and what to do next."
          title="No retros yet" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { Plus } from '@lucide/vue'

import { RetroIcon } from '~/constants/icons'
import type { RetroListPageDeps } from '~/sections/retro/retro-list/RetroListPage.deps'
import type { RetroListItemViewModel } from '~/sections/retro/retro-list/RetroListPage.types'

const props = defineProps<{
  deps: RetroListPageDeps
  onOpen: (retroId: string) => Promise<void> | void
}>()

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useQuery('retros', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)

const { execute: startRetro, pending: starting } = useAction(props.deps.startRetro, {
  onSuccess: ({ retroId }) => props.onOpen(retroId),
})

const formatDate = (value: string) => new Date(value).toLocaleDateString()

// Nothing is carried over unless the team says so by continuing from a specific retro.
const start = (basedOn: null | RetroListItemViewModel) => {
  void startRetro({
    basedOnRetroId: basedOn?.id ?? null,
    name: new Date().toLocaleDateString(),
  })
}

useHead({ title: 'Retro' })
</script>

<style scoped>
.retro-list-page {
  align-content: start;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(0, 1fr);
}

.retro-rows {
  display: grid;
  gap: var(--space-2);
}

.retro-row-item {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.retro-row-item .retro-row {
  flex: 1;
  min-width: 0;
}

.continue-btn {
  white-space: nowrap;
}

.retro-row {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  transition: var(--transition-press);
}

.retro-row:hover {
  border-color: var(--color-accent);
}

.retro-row:active {
  translate: 0 var(--press-offset);
}

.retro-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.retro-status {
  background: color-mix(in srgb, var(--color-chart-done) 14%, transparent);
  border-radius: var(--radius-pill);
  color: var(--color-chart-done);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  padding: 2px 8px;
}

.retro-status--active {
  background: color-mix(in srgb, var(--color-chart-2) 14%, transparent);
  color: var(--color-chart-2);
}

.retro-meta {
  font-size: var(--font-size-caption);
}
</style>
