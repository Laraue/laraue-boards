<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: attributes }">
      <section class="attributes-page">
        <div class="title-row">
          <div class="page-heading">
            <Tags class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>{{ t('attributes') }}</h1>
            </div>
          </div>
          <NuxtLink
            :aria-label="t('newAttribute')"
            class="primary"
            :to="organizationRoutes.newAttribute()">
            <Plus />
            <span class="btn-label">{{ t('newAttribute') }}</span>
          </NuxtLink>
        </div>
        <p class="attributes-intro">
          {{ t('intro') }}
        </p>
        <div
          v-if="attributes.length"
          class="attribute-list">
          <NuxtLink
            v-for="attribute in attributes"
            :key="attribute.id"
            :to="organizationRoutes.attribute(attribute.id)">
            <span :style="{ background: attribute.color }" />
            <span class="attribute-name">
              <strong>{{ attribute.name }}</strong>
              <small class="muted">
                {{ typeLabels[attribute.type] }}
              </small>
            </span>
            <ChevronRight />
          </NuxtLink>
        </div>
        <AppEmptyState
          v-else
          :hint="t('emptyHint')"
          :title="t('emptyTitle')" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ChevronRight, Plus, Tags } from '@lucide/vue'

import type { AttributesPageDeps } from '~/sections/organizations/attributes/list-attributes/AttributesPage.deps'
import type { AttributeListItem } from '~/sections/organizations/attributes/list-attributes/AttributesPage.types'

const props = defineProps<{ deps: AttributesPageDeps }>()

const { t } = useI18n({
  en: {
    attributes: 'Attributes',
    date: 'Date',
    dateTime: 'Date and time',
    decimal: 'Decimal',
    emptyHint:
      'Attributes are your own fields on every issue — priority, client, environment, whatever your team tracks. Add one and it shows up in the issue form and in the filters.',
    emptyTitle: 'No attributes yet',
    integer: 'Integer',
    intro: 'Custom fields you can attach to issues, like Priority or Severity.',
    list: 'List',
    loadError: 'Could not load attributes',
    loading: 'Loading attributes…',
    newAttribute: 'New attribute',
    text: 'Text',
  },
  ru: {
    attributes: 'Атрибуты',
    date: 'Дата',
    dateTime: 'Дата и время',
    decimal: 'Десятичное число',
    emptyHint:
      'Атрибуты — это дополнительные поля задачи: приоритет, клиент, окружение и всё, что важно вашей команде. Они появятся в форме задачи и фильтрах.',
    emptyTitle: 'Атрибутов пока нет',
    integer: 'Целое число',
    intro: 'Дополнительные поля задач, например приоритет или важность.',
    list: 'Список',
    loadError: 'Не удалось загрузить атрибуты',
    loading: 'Загрузка атрибутов…',
    newAttribute: 'Новый атрибут',
    text: 'Текст',
  },
})

const organizationRoutes = useOrganizationRoutes()

const typeLabels = computed(
  () =>
    ({
      date: t('date'),
      dateTime: t('dateTime'),
      decimal: t('decimal'),
      integer: t('integer'),
      list: t('list'),
      text: t('text'),
    }) satisfies Record<AttributeListItem['type'], string>,
)

useHead(() => ({ title: t('attributes') }))

const { data, message, pending, refresh } = await useQuery(
  'organization-attributes',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)
</script>

<style scoped>
.attributes-intro {
  color: var(--color-muted);
  margin: var(--space-6) 0 var(--space-4);
}

.attribute-list {
  display: grid;
  gap: var(--space-2);
}

.attribute-list a {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto 1fr auto;
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  transition: var(--transition-press);
}

.attribute-list a:hover {
  background: var(--color-hover);
}

.attribute-list a:active {
  translate: 0 var(--press-offset);
}

.attribute-list a > .lucide:last-child {
  color: var(--color-muted);
}

.attribute-list a > span:first-child {
  border-radius: var(--radius-pill);
  height: 12px;
  width: 12px;
}

.attribute-name {
  display: grid;
  min-width: 0;
}

.attribute-name > * {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
