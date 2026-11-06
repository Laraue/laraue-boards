import type { StorageQuotaError } from '#infrastructure/api/getInvalidInputError'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import { useFormatters } from '#layers/workspace/app/shared/composables/useFormatters'

/** The text for an upload refused because the organization's storage is full, in the user's language:
 * the backend's own text is English only. */
export const useStorageQuotaMessage = () => {
  const { t } = useI18n({
    en: {
      full: 'The organization’s storage is full: {used} of {quota} used, and the files need {required}. Delete attachments, or get more storage on the billing page: upgrade the plan or add storage to it.',
    },
    ru: {
      full: 'Хранилище организации заполнено: занято {used} из {quota}, а файлам нужно {required}. Удалите вложения или увеличьте хранилище на странице тарифа: перейдите на платный тариф или добавьте к нему место.',
    },
  })
  const { formatStorageSize } = useFormatters()

  return (error: StorageQuotaError) =>
    t('full', {
      quota: formatStorageSize(error.quotaBytes),
      required: formatStorageSize(error.requiredBytes),
      used: formatStorageSize(error.usedBytes),
    })
}
