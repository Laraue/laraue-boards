import { assert, test } from 'vitest'

import { useI18n } from '~/composables/useI18n'

test('translates and pluralizes English and Russian messages', () => {
  const { locale, setLocale, t, tp } = useI18n({
    en: {
      apples: 'apple | apples',
      title: 'Boards',
    },
    ru: {
      apples: 'яблоко | яблока | яблок',
      title: 'Доски',
    },
  })

  assert.equal(t('title'), 'Boards')
  assert.equal(tp('apples', 2), '2 apples')

  setLocale('ru')

  assert.equal(locale.value, 'ru')
  assert.equal(t('title'), 'Доски')
  assert.equal(tp('apples', 2), '2 яблока')
})
