import { createTranslator } from './translator'

// Compile-time regression cases; this function is never executed.
export const assertTranslationTypes = () => {
  // @ts-expect-error Every supported language is required.
  createTranslator({ en: { save: 'Save' } }, 'en')
  // @ts-expect-error Every key in English must also exist in Russian.
  createTranslator({ en: { cancel: 'Cancel', save: 'Save' }, ru: { save: 'Сохранить' } }, 'ru')
  const { t } = createTranslator({ en: { save: 'Save' }, ru: { save: 'Сохранить' } }, 'en')
  // @ts-expect-error Unknown keys are rejected.
  t('missing')
}
