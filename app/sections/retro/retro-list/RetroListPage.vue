<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="RetroIcon"
        :title="t('retro')">
        <template
          v-if="data?.canCreate"
          #actions>
          <BaseIconButton
            :label="t('start')"
            :loading="starting"
            @click="start(null)">
            <IconPlus />
          </BaseIconButton>
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
      <template #default="{ data: listing }">
        <section class="retro-list-page">
          <div
            v-if="listing.retros.length"
            class="retro-rows">
            <div
              v-for="retro in listing.retros"
              :key="retro.id"
              class="retro-row-item">
              <NuxtLink
                class="retro-row"
                :to="organizationRoutes.retro(retro.id)">
                <strong class="retro-name">{{ retro.name }}</strong>
                <span
                  class="retro-status"
                  :class="{ 'retro-status--active': !retro.finished }">
                  {{ retro.finished ? t('finished') : t('active') }}
                </span>
                <span class="muted retro-meta">{{ tp('cards', retro.cardCount) }}</span>
                <span
                  v-if="retro.openActionCount > 0"
                  class="muted retro-meta">
                  {{ tp('openActions', retro.openActionCount) }}
                </span>
                <span class="muted retro-meta">{{ formatLocalDate(retro.createdAt) }}</span>
              </NuxtLink>
              <div
                v-if="(listing.canCreate && retro.openActionCount > 0) || retro.canManage"
                class="retro-row-actions">
                <button
                  v-if="listing.canCreate && retro.openActionCount > 0"
                  class="secondary small"
                  :disabled="starting"
                  :title="t('continueTitle', { name: retro.name })"
                  type="button"
                  @click="start(retro)">
                  {{ t('continue') }}
                </button>
                <button
                  v-if="retro.canManage"
                  :aria-label="t('delete')"
                  class="icon-btn small"
                  :disabled="removing"
                  :title="t('delete')"
                  type="button"
                  @click="remove(retro)">
                  <IconTrash />
                </button>
              </div>
            </div>
          </div>
          <BaseEmptyState
            v-else
            :hint="t('emptyHint')"
            :title="t('empty')" />
          <PaginationControl
            :has-next-page="listing.hasNextPage"
            :page="page"
            @update:page="updatePage" />
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconPlus, IconTrash } from '@tabler/icons-vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import { RetroIcon } from '~/constants/icons'
import type {
  RetroListItemViewModel,
  RetroListPageDeps,
} from '~/sections/retro/retro-list/RetroListPage.deps'

const props = defineProps<{
  deps: RetroListPageDeps
  onOpen: (retroId: string) => Promise<void> | void
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  routeQuery: LocationQuery
}>()

const confirm = useConfirm()
const { t, tp } = useI18n({
  en: {
    active: 'Active',
    cards: 'card|cards',
    continue: 'Continue',
    continueTitle: 'Start a new retro carrying the open actions of {name}',
    delete: 'Delete retro',
    deleteConfirm: 'Delete "{name}" with all its notes and votes?',
    empty: 'No retros yet',
    emptyHint:
      'A retro is a shared board where the team collects what went well, what hurt, and what to do next.',
    finished: 'Finished',
    loadError: 'Could not load retros',
    loading: 'Loading retros…',
    openActions: 'open action|open actions',
    retro: 'Retro',
    start: 'Start retro',
  },
  ru: {
    active: 'Активна',
    cards: 'карточка|карточки|карточек',
    continue: 'Продолжить',
    continueTitle: 'Начать новую ретроспективу с открытыми действиями из «{name}»',
    delete: 'Удалить ретроспективу',
    deleteConfirm: 'Удалить «{name}» со всеми заметками и голосами?',
    empty: 'Ретроспектив пока нет',
    emptyHint:
      'Ретроспектива — это общая доска, где команда собирает удачи, проблемы и следующие шаги.',
    finished: 'Завершена',
    loadError: 'Не удалось загрузить ретроспективы',
    loading: 'Загрузка ретроспектив…',
    openActions: 'открытое действие|открытых действия|открытых действий',
    retro: 'Ретроспектива',
    start: 'Начать ретроспективу',
  },
})

const organizationRoutes = useOrganizationRoutes()

const page = computed(() => Math.max(1, Number(props.routeQuery.page) || 1))

const { data, message, pending, refresh } = await useApiQuery(
  () => `retros:${page.value}`,
  (signal) => props.deps.view({ page: page.value, signal }),
)

const { execute: startRetro, pending: starting } = useApiAction(props.deps.startRetro)
const { execute: removeRetro, pending: removing } = useApiAction(props.deps.removeRetro)
const { formatLocalDate } = useFormatters()

// Nothing is carried over unless the team says so by continuing from a specific retro.
// Deleting a retro takes its whole board with it and cannot be undone.
const remove = async (retro: RetroListItemViewModel) => {
  if (!(await confirm({ danger: true, title: t('deleteConfirm', { name: retro.name }) }))) {
    return
  }
  if (await removeRetro({ retroId: retro.id })) {
    await refresh()
  }
}

const updatePage = (value: number) => {
  const nextQuery: LocationQueryRaw = { ...props.routeQuery }
  if (value > 1) {
    nextQuery.page = String(value)
  } else {
    delete nextQuery.page
  }
  void props.onUpdateQuery(nextQuery)
}

const start = async (basedOn: null | RetroListItemViewModel) => {
  const started = await startRetro({
    basedOnRetroId: basedOn?.id ?? null,
    name: formatLocalDate(new Date()),
  })
  if (started) {
    await props.onOpen(started.value)
  }
}
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  padding-right: var(--space-3);
}

.retro-row-item:hover {
  border-color: var(--color-accent);
}

.retro-row-item .retro-row {
  background: transparent;
  border: 0;
  flex: 1;
  min-width: 0;
}

.retro-row-actions {
  display: flex;
  gap: var(--space-2);
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
}

.retro-row:hover {
  border-color: var(--color-accent);
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
  border-radius: var(--radius-full);
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

@media (max-width: 767px) {
  .retro-row-item {
    align-items: stretch;
    flex-direction: column;
    padding-right: 0;
  }

  .retro-row {
    flex-wrap: wrap;
    row-gap: var(--space-1);
  }

  .retro-name {
    flex-basis: 100%;
    overflow: visible;
    white-space: normal;
  }

  .retro-row-actions {
    justify-content: flex-end;
    padding: 0 var(--space-4) var(--space-3);
  }
}
</style>
