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

test('translates with the passed locale instead of the app locale', () => {
  const messages = {
    en: { title: 'Boards' },
    ru: { title: 'Доски' },
  }

  useLocale().value = 'en'
  const { t: russian } = useI18n(messages, 'ru')
  assert.equal(russian('title'), 'Доски')

  useLocale().value = 'ru'
  const { t: english } = useI18n(messages, 'en')
  assert.equal(english('title'), 'Boards')
})

test('falls back to the app locale when no locale is passed', () => {
  const { t } = useI18n({
    en: { title: 'Boards' },
    ru: { title: 'Доски' },
  })

  useLocale().value = 'en'
  assert.equal(t('title'), 'Boards')

  useLocale().value = 'ru'
  assert.equal(t('title'), 'Доски')
})
