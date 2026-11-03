<!-- Which attributes a space or a board uses and shows on cards (BRD-179), as a part of its settings
     form. It follows the settings above it - the organization's, or for a board its space's - until it
     gets its own; Override and Reset only change the form, the page's Save changes saves them. -->
<template>
  <section
    :aria-labelledby="headingId"
    class="attribute-settings">
    <BaseSectionHeader
      :id="headingId"
      :description="description"
      :title="t('attributes')">
      <template
        v-if="canEdit && view.attributes.length"
        #actions>
        <BaseButton
          v-if="modelValue.overridden"
          :disabled="disabled"
          @click="reset">
          {{ t('reset') }}
        </BaseButton>
        <BaseButton
          v-else
          :disabled="disabled"
          @click="override">
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
        <!-- The column names once, over the checkboxes; each checkbox names its row for screen readers. -->
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
import { computed, useId } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
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
  disabled?: boolean
  owner: 'board' | 'space'
  view: AttributeSettingsView
}>()

const modelValue = defineModel<AttributeSettingsDraft>({ required: true })

const { t } = useI18n({
  en: {
    attributes: 'Attributes',
    boardFollowsOrganization:
      'This board follows the organization’s attribute settings. Override them to choose its own attributes.',
    boardFollowsSpace:
      'This board follows its space’s attribute settings. Override them to choose its own attributes.',
    boardOwn:
      'This board has its own attribute settings: changes in the space or the organization don’t reach it.',
    enabled: 'Available',
    noAttributes: 'The organization has no attributes yet.',
    override: 'Override',
    reset: 'Reset to inherited',
    showOnCard: 'Shown on cards',
    spaceFollowsOrganization:
      'This space and its backlog follow the organization’s attribute settings. Override them to choose the space’s own attributes.',
    spaceOwn:
      'This space has its own attribute settings: changes in the organization don’t reach it. Its backlog follows them.',
  },
  ru: {
    attributes: 'Атрибуты',
    boardFollowsOrganization:
      'Доска следует настройкам атрибутов организации. Переопределите их, чтобы выбрать свои атрибуты.',
    boardFollowsSpace:
      'Доска следует настройкам атрибутов своего пространства. Переопределите их, чтобы выбрать свои атрибуты.',
    boardOwn:
      'У доски свои настройки атрибутов: изменения в пространстве и организации её не затрагивают.',
    enabled: 'Доступен',
    noAttributes: 'В организации пока нет атрибутов.',
    override: 'Переопределить',
    reset: 'Вернуть унаследованные',
    showOnCard: 'На карточках',
    spaceFollowsOrganization:
      'Пространство и его бэклог следуют настройкам атрибутов организации. Переопределите их, чтобы выбрать атрибуты пространства.',
    spaceOwn:
      'У пространства свои настройки атрибутов: изменения в организации его не затрагивают. Бэклог следует им.',
  },
})

const headingId = useId()

const editable = computed(() => props.canEdit && !props.disabled && modelValue.value.overridden)

// Own settings are edited in the draft; inherited ones are only shown.
const shown = computed<AttributeSettingItem[]>(() =>
  modelValue.value.overridden ? modelValue.value.attributes : props.view.inherited.attributes,
)

const description = computed(() => {
  if (props.owner === 'space') {
    return modelValue.value.overridden ? t('spaceOwn') : t('spaceFollowsOrganization')
  }
  if (modelValue.value.overridden) {
    return t('boardOwn')
  }
  return props.view.inherited.source === 'space'
    ? t('boardFollowsSpace')
    : t('boardFollowsOrganization')
})

// Starts from what the space or board shows now: its saved own settings, or what it inherits.
const override = () => {
  const ownSaved = props.view.source === (props.owner === 'space' ? 'space' : 'epic')
  const from = ownSaved ? props.view.attributes : props.view.inherited.attributes
  modelValue.value = { attributes: from.map((attribute) => ({ ...attribute })), overridden: true }
}

const reset = () => {
  modelValue.value = { attributes: [], overridden: false }
}
</script>

<style scoped>
/* Always follows other settings on its page: a line sets it apart, as between the board form's sections. */
.attribute-settings {
  border-top: 1px solid var(--color-divider);
  display: grid;
  gap: var(--space-3);
  padding-top: var(--space-5);
}

/* Name, then a narrow column per checkbox, the same in the header and every row. */
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

.visually-hidden {
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
