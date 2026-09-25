import { assert, test } from 'vitest'

import { useI18n, useLocale } from '~/composables/useI18n'

test('translates, interpolates and pluralizes English and Russian messages', () => {
  const { t, tp } = useI18n({
    en: {
      apples: 'apple | apples',
      greeting: 'Hello, {name}',
      title: 'Boards',
    },
    ru: {
      apples: 'яблоко | яблока | яблок',
      greeting: 'Привет, {name}',
      title: 'Доски',
    },
  })

  assert.equal(t('title'), 'Boards')
  assert.equal(t('greeting', { name: 'Ada' }), 'Hello, Ada')
  assert.equal(tp('apples', 2), '2 apples')

  useLocale().value = 'ru'

  assert.equal(t('title'), 'Доски')
  assert.equal(tp('apples', 5), '5 яблок')
})
