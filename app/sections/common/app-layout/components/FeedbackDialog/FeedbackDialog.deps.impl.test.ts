import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createFeedbackDialogDeps } from './FeedbackDialog.deps.impl'

test('sends the trimmed message with its type and where it was written', async () => {
  const { client, paths, requests } = createTestApiClient(() => ({ feedbackId: 1 }))

  await createFeedbackDialogDeps(client).send({
    browser: 'Firefox',
    contact: '',
    locale: 'ru',
    message: '  Cards jump after a move  ',
    page: 'https://boards.laraue.com/organizations/acme/issues',
    type: 'bug',
  })

  assert.deepEqual(paths(), ['/api/feedback'])
  assert.deepEqual(await requests[0]!.json(), {
    context: {
      browser: 'Firefox',
      locale: 'ru',
      page: 'https://boards.laraue.com/organizations/acme/issues',
    },
    message: 'Cards jump after a move',
    type: 'Bug',
  })
})

test('cuts a page URL the feedback service would reject', async () => {
  const { client, requests } = createTestApiClient(() => ({ feedbackId: 1 }))

  await createFeedbackDialogDeps(client).send({
    browser: 'Firefox',
    contact: '',
    locale: 'en',
    message: 'Idea',
    page: `https://boards.laraue.com/?q=${'a'.repeat(3000)}`,
    type: 'idea',
  })

  const body = (await requests[0]!.json()) as { context: { page: string }; type: string }
  assert.equal(body.context.page.length, 2048)
  assert.equal(body.type, 'Idea')
})

test('sends the preferred contact when the user gave one', async () => {
  const { client, requests } = createTestApiClient(() => ({ feedbackId: 1 }))

  await createFeedbackDialogDeps(client).send({
    browser: 'Firefox',
    contact: ' ada@example.com ',
    locale: 'en',
    message: 'Question',
    page: 'https://boards.laraue.com/',
    type: 'question',
  })

  const body = (await requests[0]!.json()) as { context: Record<string, string> }
  assert.equal(body.context.contact, 'ada@example.com')
})
