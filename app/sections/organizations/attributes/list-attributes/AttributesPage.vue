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
        <BaseSectionHeader :title="t('attributes')">
          <template #actions>
            <BaseButton
              :to="organizationRoutes.newAttribute()"
              variant="primary">
              <IconPlus />
              {{ t('newAttribute') }}
            </BaseButton>
          </template>
        </BaseSectionHeader>
        <BaseList v-if="attributes.length">
          <BaseListRow
            v-for="attribute in attributes"
            :key="attribute.id"
            :to="organizationRoutes.attribute(attribute.id)">
            <template #leading>
              <AttributeIcon :style="{ color: attribute.color }" />
            </template>
            {{ attribute.name }}
            <template #trailing>
              <span class="muted">{{ typeLabels[attribute.type] }}</span>
            </template>
          </BaseListRow>
        </BaseList>
        <BaseEmptyState
          v-else
          :hint="t('emptyHint')"
          :title="t('emptyTitle')" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'

import { AttributeIcon } from '~/constants/icons'
import type {
  AttributeListItem,
  AttributesPageDeps,
} from '~/sections/organizations/attributes/list-attributes/AttributesPage.deps'

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
    list: 'Список',
    loadError: 'Не удалось загрузить атрибуты',
    loading: 'Загрузка атрибутов…',
    newAttribute: 'Новый атрибут',
    text: 'Текст',
  },
})

const organizationRoutes = useOrganizationRoutes()

const typeLabels = {
  date: t('date'),
  dateTime: t('dateTime'),
  decimal: t('decimal'),
  integer: t('integer'),
  list: t('list'),
  text: t('text'),
} satisfies Record<AttributeListItem['type'], string>

useHead({ title: t('attributes') })

const { data, message, pending, refresh } = await useApiQuery('organization-attributes', (signal) =>
  props.deps.view({ signal }),
)
useViewRefresh(refresh)
</script>

<style scoped>
.attributes-page > .base-section-header {
  margin-bottom: var(--space-4);
}
</style>
