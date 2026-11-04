<template>
  <BasePopover
    v-if="attributes.length && collapsed"
    align="end"
    class="attribute-summary"
    side="bottom">
    <template #trigger="{ open, toggle }">
      <BaseIconButton
        :aria-expanded="open"
        aria-haspopup="dialog"
        :label="t('attributes')"
        @click="toggle">
        <AttributeIcon />
      </BaseIconButton>
    </template>
    <dl class="attribute-details">
      <template
        v-for="attribute in attributes"
        :key="attribute.name">
        <dt>{{ attribute.name }}</dt>
        <dd>
          <IssueAttributeLabelValue
            :color="attribute.color"
            :title="describe(attribute)"
            :value="display(attribute)" />
        </dd>
      </template>
    </dl>
  </BasePopover>
  <ul
    v-else-if="attributes.length"
    class="attribute-labels">
    <li
      v-for="attribute in visible"
      :key="attribute.name">
      <IssueAttributeLabelValue
        :color="attribute.color"
        :title="describe(attribute)"
        :value="display(attribute)" />
    </li>
    <li v-if="hidden.length">
      <BaseTooltip :text="hidden.map(describe).join('\n')">
        <IssueAttributeLabelValue
          :aria-label="hidden.map(describe).join(', ')"
          class="attribute-label-more"
          color="var(--color-muted)"
          tabindex="0"
          :value="`+${hidden.length}`" />
      </BaseTooltip>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import BasePopover from '#layers/core/app/ui/components/BasePopover.vue'
import BaseTooltip from '#layers/core/app/ui/components/BaseTooltip.vue'
import type { IssueAttributeLabel } from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeLabels/IssueAttributeLabels.types'
import { useFormatters } from '#layers/workspace/app/shared/composables/useFormatters'
import { AttributeIcon } from '#layers/workspace/app/shared/constants/icons'

import IssueAttributeLabelValue from './IssueAttributeLabelValue.vue'

const props = defineProps<{
  attributes: IssueAttributeLabel[]
  collapsed?: boolean
  max?: number
}>()

const { t } = useI18n({
  en: { attributes: 'Attributes' },
  ru: { attributes: 'Атрибуты' },
})

const visible = computed(() => props.attributes.slice(0, props.max ?? props.attributes.length))
const hidden = computed(() => props.attributes.slice(visible.value.length))

const { formatDate, formatDateTime } = useFormatters()

const describe = (attribute: IssueAttributeLabel) => `${attribute.name}: ${display(attribute)}`

const display = (attribute: IssueAttributeLabel) => {
  switch (attribute.kind) {
    // A date has no time zone: read it as the local day, not UTC midnight.
    case 'date':
      return formatDate(`${attribute.value}T00:00:00`)
    case 'dateTime':
      return formatDateTime(attribute.value)
    default:
      return attribute.value
  }
}
</script>

<style scoped>
.attribute-details {
  align-items: center;
  display: grid;
  gap: var(--space-1) var(--space-3);
  grid-auto-rows: minmax(auto, auto);
  grid-template-columns: fit-content(8rem) minmax(0, 1fr);
  margin: 0;
  padding: var(--space-2);
}

.attribute-details dt {
  color: var(--color-muted);
  overflow-wrap: anywhere;
}

.attribute-details dd {
  margin: 0;
  min-width: 0;
}

.attribute-details :deep(.attribute-label) {
  overflow-wrap: anywhere;
  white-space: normal;
}

.attribute-labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.attribute-labels > li {
  max-width: 100%;
  min-width: 0;
}

.attribute-label-more {
  background: var(--color-soft);
  color: var(--color-muted);
  cursor: default;
  display: block;
}
</style>
