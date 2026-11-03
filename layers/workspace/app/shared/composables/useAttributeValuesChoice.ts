import { useI18n } from '#layers/core/app/i18n/useI18n'
import { useConfirm } from '#layers/core/app/ui/composables/useConfirm'

/** Asks what to do with the values of attributes the destination board doesn't use (BRD-179):
 * resolves true to drop them, false to keep them - also when nothing is affected or the question is
 * dismissed, since keeping loses nothing. */
export const useAttributeValuesChoice = () => {
  const confirm = useConfirm()
  const { t } = useI18n({
    en: {
      description:
        'The destination board doesn’t use {names}. Kept values stay on the issues and can still be changed or cleared; dropped ones are removed and recorded in the issues’ history.',
      drop: 'Drop values',
      keep: 'Keep values',
      title: 'Keep values of unused attributes?',
    },
    ru: {
      description:
        'Доска назначения не использует {names}. Сохранённые значения останутся в задачах, их можно изменить или очистить; удалённые исчезнут и попадут в историю задач.',
      drop: 'Удалить значения',
      keep: 'Сохранить значения',
      title: 'Сохранить значения неиспользуемых атрибутов?',
    },
  })

  return async (attributeNames: string[]): Promise<boolean> =>
    attributeNames.length > 0 &&
    confirm({
      action: t('drop'),
      cancel: t('keep'),
      danger: true,
      description: t('description', { names: attributeNames.join(', ') }),
      title: t('title'),
    })
}
