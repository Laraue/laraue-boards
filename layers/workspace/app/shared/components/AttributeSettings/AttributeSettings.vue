<!-- Override and Reset only change the form; the page's Save saves them. -->
<template>
  <section
    :aria-labelledby="headingId"
    class="settings-section">
    <BaseSectionHeader
      :id="headingId"
      :description="description"
      :title="t('attributes')">
      <template
        v-if="modelValue.overridden"
        #badge>
        <BaseBadge variant="outline">{{ t('overridden') }}</BaseBadge>
      </template>
      <template
        v-if="canEdit && view.attributes.length"
        #actions>
        <BaseButton
          v-if="modelValue.overridden"
          :disabled="disabled"
          @click="reset">
          <IconArrowBackUp />
          {{ t('reset') }}
        </BaseButton>
        <BaseButton
          v-else
          :disabled="disabled"
          @click="override">
          <IconPencil />
          {{ t('override') }}
        </BaseButton>
      </template>
    </BaseSectionHeader>
    <p
      v-if="!view.attributes.length"
      class="muted">
      {{ t('noAttributes') }}
    </p>
    <template v-else>
      <div>
        <div
          aria-hidden="true"
          class="attribute-grid attribute-grid-header">
          <span />
          <span>{{ t('enabled') }}</span>
          <span>{{ t('showOnCard') }}</span>
        </div>
        <BaseList>
          <div
            v-for="attribute in shown"
            :key="attribute.id"
            class="attribute-grid attribute-row">
            <span class="attribute-name">
              <AttributeIcon :style="{ color: attribute.color }" />
              {{ attribute.name }}
            </span>
            <BaseCheckbox
              v-model="attribute.isEnabled"
              class="attribute-check"
              :disabled="!editable">
              <span class="visually-hidden">{{ t('enabled') }}: {{ attribute.name }}</span>
            </BaseCheckbox>
            <BaseCheckbox
              class="attribute-check"
              :disabled="!editable || !attribute.isEnabled"
              :model-value="attribute.isEnabled && attribute.showOnCard"
              @update:model-value="attribute.showOnCard = $event">
              <span class="visually-hidden">{{ t('showOnCard') }}: {{ attribute.name }}</span>
            </BaseCheckbox>
          </div>
        </BaseList>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { IconArrowBackUp, IconPencil } from '@tabler/icons-vue'
import { computed, useId } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseBadge from '#layers/core/app/ui/components/BaseBadge.vue'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseCheckbox from '#layers/core/app/ui/components/BaseCheckbox.vue'
import BaseList from '#layers/core/app/ui/components/BaseList.vue'
import BaseSectionHeader from '#layers/core/app/ui/components/BaseSectionHeader.vue'
import type {
  AttributeSettingItem,
  AttributeSettingsDraft,
  AttributeSettingsView,
} from '#layers/workspace/app/shared/components/AttributeSettings/AttributeSettings.types'
import { AttributeIcon } from '#layers/workspace/app/shared/constants/icons'

const props = defineProps<{
  canEdit: boolean
  description: string
  disabled?: boolean
  view: AttributeSettingsView
}>()

const modelValue = defineModel<AttributeSettingsDraft>({ required: true })

const { t } = useI18n({
  en: {
    attributes: 'Attributes',
    enabled: 'Available',
    noAttributes: 'The organization has no attributes yet.',
    overridden: 'Overridden',
    override: 'Override',
    reset: 'Reset to inherited',
    showOnCard: 'Shown on cards',
  },
  ru: {
    attributes: 'Атрибуты',
    enabled: 'Доступен',
    noAttributes: 'В организации пока нет атрибутов.',
    overridden: 'Переопределены',
    override: 'Переопределить',
    reset: 'Вернуть унаследованные',
    showOnCard: 'На карточках',
  },
})

const headingId = useId()

const editable = computed(() => props.canEdit && !props.disabled && modelValue.value.overridden)

const shown = computed<AttributeSettingItem[]>(() =>
  modelValue.value.overridden ? modelValue.value.attributes : props.view.inherited.attributes,
)

// Starts from the settings in effect: own ones, or the inherited.
const override = () => {
  modelValue.value = {
    attributes: props.view.attributes.map((attribute) => ({ ...attribute })),
    overridden: true,
  }
}

const reset = () => {
  modelValue.value = { attributes: [], overridden: false }
}
</script>

<style scoped>
.attribute-grid {
  align-items: center;
  column-gap: var(--space-2);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 7.5rem 7.5rem;
  padding-inline: var(--space-4);
}

.attribute-grid-header {
  color: var(--color-muted);
  justify-items: center;
  padding-bottom: var(--space-2);
  text-align: center;
}

.attribute-row {
  min-height: 2.75rem;
}

.attribute-row + .attribute-row {
  border-top: 1px solid var(--color-divider);
}

.attribute-name {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  min-width: 0;
  overflow-wrap: anywhere;
}

.attribute-check {
  justify-self: center;
}
</style>
