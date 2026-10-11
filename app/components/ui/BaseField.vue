<!-- A form field: a label, its control, an optional hint and an error. The control goes in the default
     slot and takes `id` and `describedby` from the slot props, so the label and the texts point at it;
     a control that is not a single input (a group of buttons) uses `labelId` for aria-labelledby.
     Spacing between fields and the side-by-side layout come from BaseFieldGroup. -->
<template>
  <div class="base-field">
    <label
      :id="`${fieldId}-label`"
      class="base-field-label"
      :for="fieldId">
      {{ label }}
    </label>
    <div class="base-field-control">
      <slot
        :id="fieldId"
        :describedby="describedby"
        :invalid="Boolean(error)"
        :label-id="`${fieldId}-label`" />
      <p
        v-if="hint"
        :id="`${fieldId}-hint`"
        class="base-field-hint">
        {{ hint }}
      </p>
      <p
        v-if="error"
        :id="`${fieldId}-error`"
        class="base-field-error">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error?: string; hint?: string; id?: string; label: string }>()

const generatedId = useId()
const fieldId = computed(() => props.id ?? generatedId)
const describedby = computed(
  () =>
    [props.hint && `${fieldId.value}-hint`, props.error && `${fieldId.value}-error`]
      .filter(Boolean)
      .join(' ') || undefined,
)
</script>

<style scoped>
.base-field {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

.base-field-label {
  font-weight: var(--font-weight-medium);
  margin: 0;
}

.base-field-control {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.base-field-hint,
.base-field-error {
  font-size: var(--font-size-sm);
  margin: 0;
}

.base-field-hint {
  color: var(--color-muted);
}

.base-field-error {
  color: var(--color-danger);
}
</style>
