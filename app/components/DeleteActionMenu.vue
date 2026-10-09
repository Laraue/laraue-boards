<template>
  <AppMenu align="end">
    <template #trigger>
      <IconButton :label="t('actions')">
        <IconDots />
      </IconButton>
    </template>
    <AppMenuItem
      :disabled="disabled"
      :loading="loading"
      variant="danger"
      @select="onDelete">
      <IconTrash />
      {{ label }}
    </AppMenuItem>
  </AppMenu>
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
