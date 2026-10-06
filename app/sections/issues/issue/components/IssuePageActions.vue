<template>
  <div class="issue-page-actions">
    <DeleteActionMenu
      :disabled="saving"
      :label="t('deleteIssue')"
      :loading="deleting"
      :on-delete="onDelete" />
    <BaseButton
      :aria-label="t('saveChanges')"
      :disabled="!canSave || deleting"
      :form="formId"
      :loading="saving"
      type="submit"
      variant="primary">
      <IconCheck />
      <span class="save-label">{{ t('saveChanges') }}</span>
      <span class="save-label-mobile">{{ t('save') }}</span>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue'

defineProps<{
  canSave: boolean
  deleting: boolean
  formId: string
  onDelete: () => Promise<void> | void
  saving: boolean
}>()

const { t } = useI18n({
  en: {
    deleteIssue: 'Delete issue',
    save: 'Save',
    saveChanges: 'Save changes',
  },
  ru: {
    deleteIssue: 'Удалить задачу',
    save: 'Сохранить',
    saveChanges: 'Сохранить изменения',
  },
})
</script>

<style scoped>
.issue-page-actions {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.save-label-mobile {
  display: none;
}

@media (max-width: 767px) {
  .save-label {
    display: none;
  }

  .save-label-mobile {
    display: block;
  }
}
</style>
