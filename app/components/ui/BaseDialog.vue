<!-- A modal form on the native <dialog>: a title, optional description, the fields, and the actions
     at the bottom. The browser handles focus, Escape and the backdrop. Open and close it through
     the exposed open() and close(); the actions slot's submit button emits `submit`. -->
<template>
  <dialog
    ref="dialog"
    :aria-describedby="description ? `${id}-description` : undefined"
    :aria-labelledby="`${id}-title`"
    class="base-dialog"
    @close="emit('close')">
    <form
      class="base-dialog-form"
      @submit.prevent="emit('submit')">
      <header class="base-dialog-header">
        <h2
          :id="`${id}-title`"
          class="base-dialog-title">
          {{ title }}
        </h2>
        <p
          v-if="description"
          :id="`${id}-description`"
          class="base-dialog-description">
          {{ description }}
        </p>
      </header>
      <slot />
      <div
        v-if="$slots.actions"
        class="dialog-actions">
        <slot name="actions" />
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
defineProps<{ description?: string; title: string }>()

const emit = defineEmits<{ close: []; submit: [] }>()

const id = useId()
const dialog = useTemplateRef('dialog')

defineExpose({
  close: () => dialog.value?.close(),
  open: () => dialog.value?.showModal(),
})
</script>

<style scoped>
.base-dialog-header {
  display: grid;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
}

.base-dialog-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-heading);
  margin: 0;
}

.base-dialog-description {
  color: var(--color-muted);
}

/* Field labels in a dialog read as quiet captions above their controls. */
.base-dialog-form :deep(label:not(.base-checkbox)) {
  color: var(--color-muted);
  font-weight: 400;
  margin: var(--space-4) 0 var(--space-2);
}

.base-dialog-form :deep(label:not(.base-checkbox):first-of-type) {
  margin-top: 0;
}
</style>
