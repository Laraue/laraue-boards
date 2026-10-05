<template>
  <AppPopover align="end">
    <template #trigger="{ open, toggle }">
      <IconButton
        :aria-expanded="open"
        aria-haspopup="dialog"
        :label="t('actions')"
        @click="toggle">
        <IconDots />
      </IconButton>
    </template>
    <template #default="{ close }">
      <div class="delete-menu">
        <BaseButton
          :disabled="disabled"
          :loading="loading"
          menu
          variant="danger"
          @click="
            () => {
              close()
              onDelete()
            }
          ">
          <IconTrash />
          {{ label }}
        </BaseButton>
      </div>
    </template>
  </AppPopover>
</template>

<script setup lang="ts">
import { IconDots, IconTrash } from '@tabler/icons-vue'

defineProps<{
  disabled?: boolean
  label: string
  loading?: boolean
  onDelete: () => Promise<void> | void
}>()

const { t } = useI18n({ en: { actions: 'Actions' }, ru: { actions: 'Действия' } })
</script>

<style scoped>
.delete-menu {
  padding: var(--space-1);
}
</style>
