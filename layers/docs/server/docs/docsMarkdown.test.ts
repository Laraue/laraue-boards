import { assert, test } from 'vitest'

import { createDocsCatalog } from './docsCatalog'
import {
  parseDocsMarkdownPath,
  renderDocMarkdownCopy,
  renderLlmsFullTxt,
  renderLlmsTxt,
  siteOrigin,
} from './docsMarkdown'

const site = 'https://boards.example.com'

const file = (title: string, type: string, order: number, body = 'Text') =>
  `---\ntitle: ${title}\ndescription: About ${title}\ntype: ${type}\norder: ${order}\ncreatedAt: 2026-01-01\nupdatedAt: 2026-02-01\n---\n${body}`

const catalog = createDocsCatalog({
  'en/concepts/epics.md': file('Epics', 'documentation', 2),
  'en/concepts/index.md': file('Concepts', 'sectionDefinition', 2),
  'en/concepts/issues.md': file(
    'Issues',
    'documentation',
    1,
    [
      '## Where to save {#destination}',
      'See [epics](/documentation/concepts/epics#boards), [the home page](/documentation),',
      '[in Russian](/ru/documentation/concepts/issues), [the terms](/terms) and [Telegram](https://t.me/bot).',
      '![Video: saving a message](https://youtu.be/6s0JcGa7ylU)',
      '![A board](https://laraue.com/board.jpg)',
    ].join('\n'),
  ),
  'en/index.md': file('Home', 'rootSectionDefinition', 0),
  'en/pricing.md': file('Pricing', 'documentation', 9),
  'en/start/index.md': file('Start', 'sectionDefinition', 1),
  'ru/index.md': file('Главная', 'rootSectionDefinition', 0),
})

const issues = catalog.entry('en', ['concepts', 'issues'])!

test('reads a markdown copy address back to its page', () => {
  assert.deepEqual(parseDocsMarkdownPath('/documentation.md'), { locale: 'en', path: [] })
  assert.deepEqual(parseDocsMarkdownPath('/documentation/concepts/issues.md'), {
    locale: 'en',
    path: ['concepts', 'issues'],
  })
  assert.deepEqual(parseDocsMarkdownPath('/ru/documentation/concepts.md'), {
    locale: 'ru',
    path: ['concepts'],
  })
})

test('leaves addresses that are not markdown copies of docs pages', () => {
  assert.isUndefined(parseDocsMarkdownPath('/documentation/concepts/issues'))
  assert.isUndefined(parseDocsMarkdownPath('/organizations/x.md'))
  assert.isUndefined(parseDocsMarkdownPath('/de/documentation/concepts.md'))
  assert.isUndefined(parseDocsMarkdownPath('/documentation/../secret.md'))
})

test('starts the copy with the title, the description and the page address', () => {
  const copy = renderDocMarkdownCopy(issues, 'en', site)

  assert.isTrue(
    copy.startsWith(
      `# Issues\n\n> About Issues\n\nSource: ${site}/documentation/concepts/issues\n\n`,
    ),
  )
  assert.notInclude(copy, 'createdAt')
})

test('makes the links of the copy work outside the site', () => {
  const copy = renderDocMarkdownCopy(issues, 'en', site)

  assert.include(copy, `[epics](${site}/documentation/concepts/epics.md#boards)`)
  assert.include(copy, `[the home page](${site}/documentation.md)`)
  assert.include(copy, `[in Russian](${site}/ru/documentation/concepts/issues.md)`)
  assert.include(copy, `[the terms](${site}/terms)`)
  assert.include(copy, '[Telegram](https://t.me/bot)')
})

test('drops the explicit heading ids and turns videos into links', () => {
  const copy = renderDocMarkdownCopy(issues, 'en', site)

  assert.include(copy, '## Where to save\n')
  assert.include(copy, '[Video: saving a message](https://youtu.be/6s0JcGa7ylU)')
  assert.include(copy, '![A board](https://laraue.com/board.jpg)')
})

test('lists the English pages in llms.txt by section, in reading order', () => {
  const llms = renderLlmsTxt(catalog.tree('en'), site)

  assert.isTrue(llms.startsWith('# Laraue Boards\n\n> About Home\n\n'))
  assert.include(
    llms,
    [
      '## Overview',
      `- [Home](${site}/documentation.md): About Home`,
      `- [Pricing](${site}/documentation/pricing.md): About Pricing`,
    ].join('\n'),
  )
  assert.include(
    llms,
    [
      '## Concepts',
      `- [Concepts](${site}/documentation/concepts.md): About Concepts`,
      `- [Issues](${site}/documentation/concepts/issues.md): About Issues`,
      `- [Epics](${site}/documentation/concepts/epics.md): About Epics`,
    ].join('\n'),
  )
  assert.isBelow(llms.indexOf('## Start'), llms.indexOf('## Concepts'))
  assert.include(llms, `## Optional\n- [Документация на русском](${site}/ru/documentation.md)`)
  assert.notInclude(llms, 'Главная')
})

test('puts every English page into llms-full.txt', () => {
  const full = renderLlmsFullTxt(catalog.entries('en'), site)

  assert.deepEqual(
    [...full.matchAll(/^# (.+)$/gm)].map((match) => match[1]),
    ['Home', 'Start', 'Concepts', 'Issues', 'Epics', 'Pricing'],
  )
})

test('has no entry for an unknown page', () => {
  assert.isUndefined(catalog.entry('en', ['missing']))
  assert.isUndefined(catalog.entry('ru', ['concepts', 'issues']))
})

test('takes the trailing slash off the site address', () => {
  assert.equal(siteOrigin('https://boards.example.com/'), site)
  assert.equal(siteOrigin(site), site)
})
