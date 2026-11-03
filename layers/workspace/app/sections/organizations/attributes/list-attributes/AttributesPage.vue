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
            <template v-if="state.order">
              <BaseButton
                :disabled="reordering"
                @click="state.order = undefined">
                {{ t('cancel') }}
              </BaseButton>
              <BaseButton
                :disabled="reordering"
                variant="primary"
                @click="saveOrder">
                {{ reordering ? t('saving') : t('saveOrder') }}
              </BaseButton>
            </template>
            <template v-else>
              <BaseButton
                v-if="attributes.length > 1"
                @click="state.order = [...attributes]">
                <IconArrowsSort />
                {{ t('changeOrder') }}
              </BaseButton>
              <BaseButton
                :to="organizationRoutes.newAttribute()"
                variant="primary">
                <IconPlus />
                {{ t('newAttribute') }}
              </BaseButton>
            </template>
          </template>
        </BaseSectionHeader>
        <template v-if="state.order">
          <p class="muted order-hint">{{ t('orderHint') }}</p>
          <DragDropProvider
            :plugins="defaultPreset.plugins"
            :sensors="sensors"
            @drag-end="handleDragEnd">
            <BaseList>
              <AttributeOrderRow
                v-for="(attribute, index) in state.order"
                :id="attribute.id"
                :key="attribute.id"
                :color="attribute.color"
                :disabled="reordering"
                :index="index"
                :name="attribute.name" />
            </BaseList>
          </DragDropProvider>
        </template>
        <BaseList v-else-if="attributes.length">
          <BaseListRow
            v-for="attribute in attributes"
            :key="attribute.id"
            :to="organizationRoutes.attribute(attribute.id)">
            <template #leading>
              <AttributeIcon :style="{ color: attribute.color }" />
            </template>
            {{ attribute.name }}
            <template #trailing>
              <BaseBadge
                v-if="!attribute.isEnabled"
                variant="outline">
                {{ t('off') }}
              </BaseBadge>
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
import { defaultPreset, PointerActivationConstraints } from '@dnd-kit/dom'
import { arrayMove } from '@dnd-kit/helpers'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import type { DragEndEvent } from '@dnd-kit/vue'
import { isSortable } from '@dnd-kit/vue/sortable'
import { IconArrowsSort, IconPlus } from '@tabler/icons-vue'
import { reactive } from 'vue'

import { useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseBadge from '#layers/core/app/ui/components/BaseBadge.vue'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseEmptyState from '#layers/core/app/ui/components/BaseEmptyState.vue'
import BaseList from '#layers/core/app/ui/components/BaseList.vue'
import BaseListRow from '#layers/core/app/ui/components/BaseListRow.vue'
import BaseSectionHeader from '#layers/core/app/ui/components/BaseSectionHeader.vue'
import type {
  AttributeListItem,
  AttributesPageDeps,
} from '#layers/workspace/app/sections/organizations/attributes/list-attributes/AttributesPage.deps'
import AttributeOrderRow from '#layers/workspace/app/sections/organizations/attributes/list-attributes/components/AttributeOrderRow/AttributeOrderRow.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { AttributeIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: AttributesPageDeps
  organizationRoutes: OrganizationRoutes
}>()

const { t } = useI18n({
  en: {
    attributes: 'Attributes',
    cancel: 'Cancel',
    changeOrder: 'Change order',
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
    off: 'Off',
    orderHint: 'Forms, cards and filters show attributes in this order, in every space and epic.',
    saveOrder: 'Save order',
    saving: 'Saving…',
    text: 'Text',
  },
  ru: {
    attributes: 'Атрибуты',
    cancel: 'Отмена',
    changeOrder: 'Изменить порядок',
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
    off: 'Выключен',
    orderHint:
      'В этом порядке атрибуты показываются в формах, на карточках и в фильтрах во всех пространствах и эпиках.',
    saveOrder: 'Сохранить порядок',
    saving: 'Сохранение…',
    text: 'Текст',
  },
})

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

// The attributes in the order being edited; undefined while the list is just shown.
const state = reactive<{ order: AttributeListItem[] | undefined }>({ order: undefined })

const { execute: reorder, pending: reordering } = useApiAction(props.deps.reorder)

const sensors = [
  PointerSensor.configure({
    activationConstraints: (event) =>
      event.pointerType === 'touch'
        ? [new PointerActivationConstraints.Delay({ tolerance: 5, value: 250 })]
        : [new PointerActivationConstraints.Distance({ value: 6 })],
    preventActivation: () => false,
  }),
  KeyboardSensor,
]

const handleDragEnd = (event: DragEndEvent) => {
  const source = event.operation.source
  if (state.order && !event.canceled && isSortable(source)) {
    state.order = arrayMove(state.order, source.initialIndex, source.index)
  }
}

const saveOrder = async () => {
  if (
    state.order &&
    (await reorder({ attributeIds: state.order.map((attribute) => attribute.id) }))
  ) {
    state.order = undefined
    await refresh()
  }
}
</script>

<style scoped>
.attributes-page > .base-section-header {
  margin-bottom: var(--space-4);
}

.order-hint {
  margin: 0 0 var(--space-3);
}
</style>
