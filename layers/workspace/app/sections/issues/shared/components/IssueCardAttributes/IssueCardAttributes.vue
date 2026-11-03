<!-- The attribute values on an issue card, as small labels tinted with the attribute's color; the
     attribute's name is in the native title - a board renders too many cards for tooltip components. -->
<template>
  <ul
    v-if="attributes.length"
    class="card-attributes">
    <li
      v-for="attribute in attributes"
      :key="attribute.name"
      class="card-attribute"
      :style="{ '--attribute-color': attribute.color }"
      :title="`${attribute.name}: ${display(attribute)}`">
      {{ display(attribute) }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { IssueCardAttribute } from '#layers/workspace/app/sections/issues/shared/components/IssueCardAttributes/IssueCardAttributes.types'
import { useFormatters } from '#layers/workspace/app/shared/composables/useFormatters'

defineProps<{ attributes: IssueCardAttribute[] }>()

const { formatDate, formatDateTime } = useFormatters()

const display = (attribute: IssueCardAttribute) => {
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
.card-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.card-attribute {
  /* A wash of the attribute's color, and its color pulled toward the text color for the label, so
     both read in light and dark themes. */
  background: color-mix(in srgb, var(--attribute-color) 14%, transparent);
  border-radius: var(--radius-small);
  color: color-mix(in srgb, var(--attribute-color) 55%, var(--color-text));
  font-size: var(--font-size-sm);
  line-height: 1.5;
  max-width: 100%;
  overflow: hidden;
  padding: 1px var(--space-2);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
