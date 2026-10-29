import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import tsParser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from './import-boundaries.mjs'

RuleTester.describe = describe
RuleTester.it = it

const root = fileURLToPath(new URL('../../', import.meta.url))
const workspace = resolve(root, 'layers/workspace/app/example.ts')
const site = resolve(root, 'layers/site/app/example.ts')
const docs = resolve(root, 'layers/docs/app/example.ts')
const common = resolve(root, 'layers/core/app/api/example.ts')
const shell = resolve(root, 'layers/core/app/public-shell/example.ts')
const ui = resolve(root, 'layers/core/app/ui/components/example.ts')
const docsServer = resolve(root, 'layers/docs/server/docs/page.ts')
const boundary = [{ messageId: 'boundary' }]

new RuleTester({ languageOptions: { parser: tsParser } }).run('import-boundaries', rule, {
  invalid: [
    {
      code: "import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'",
      errors: [{ messageId: 'routeContext' }],
      filename: workspace,
    },
    {
      code: "import { useOrganizationRoutes } from '../shared/composables/useOrganizationRoutes.ts'",
      errors: [{ messageId: 'routeContext' }],
      filename: resolve(root, 'layers/workspace/app/sections/example.ts'),
    },
    { code: "import Page from '#layers/site/app/Page.vue'", errors: boundary, filename: workspace },
    { code: "import Page from '#layers/workspace/app/Page.vue'", errors: boundary, filename: site },
    { code: "import Page from '../../workspace/app/Page.vue'", errors: boundary, filename: site },
    { code: "import Page from '#layers/site/app/Page.vue'", errors: boundary, filename: docs },
    { code: "import Page from '#layers/docs/app/Page.vue'", errors: boundary, filename: shell },
    {
      code: "import type { Issue } from '#layers/workspace/app/Issue'",
      errors: boundary,
      filename: common,
    },
    { code: "export * from '@@/layers/site/app/Page'", errors: boundary, filename: workspace },
    {
      code: "import Page from '#layers/workspace/app/../../site/app/Page'",
      errors: boundary,
      filename: workspace,
    },
    {
      code: "const page = import('#layers/docs/app/Page.vue')",
      errors: boundary,
      filename: workspace,
    },
    {
      code: "type Page = typeof import('#layers/docs/app/Page.vue')",
      errors: boundary,
      filename: workspace,
    },
    {
      code: "const page = require('#layers/site/app/Page.vue')",
      errors: boundary,
      filename: workspace,
    },
    { code: "import api from '#server/api'", errors: boundary, filename: site },
    { code: "import Page from '#layers/docs/app/Page'", errors: boundary, filename: docsServer },
    { code: "import { useState } from '#app'", errors: boundary, filename: docsServer },
    {
      code: "import { useState } from 'nuxt/app'",
      errors: boundary,
      filename: resolve(root, 'infrastructure/api/client.ts'),
    },
    {
      code: "import api from '#infrastructure/api/client'",
      errors: boundary,
      filename: resolve(root, 'layers/docs/shared/types.ts'),
    },
    {
      code: "import type { Locale } from '#layers/core/app/i18n/translator'",
      errors: boundary,
      filename: ui,
    },
    {
      code: "import Header from '../../public-shell/SiteHeader.vue'",
      errors: boundary,
      filename: ui,
    },
    {
      code: 'const page = import(pagePath)',
      errors: [{ messageId: 'dynamic' }],
      filename: workspace,
    },
    {
      code: "import { useApiClient } from '#imports'",
      errors: [{ messageId: 'registry' }],
      filename: site,
    },
    {
      code: "import { WorkspacePage } from '#components'",
      errors: [{ messageId: 'registry' }],
      filename: site,
    },
    {
      code: "import * as components from '#components'",
      errors: [{ messageId: 'registry' }],
      filename: site,
    },
    {
      code: "import { useSiteConfig } from '#imports'",
      errors: [{ messageId: 'registry' }],
      filename: ui,
    },
    {
      code: "import { useGtag } from '#imports'",
      errors: [{ messageId: 'registry' }],
      filename: docsServer,
    },
    {
      code: "const Page = resolveComponent('WorkspacePage')",
      errors: [{ messageId: 'registry' }],
      filename: workspace,
    },
  ],
  valid: [
    {
      code: "import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'",
      filename: resolve(root, 'layers/workspace/app/pages/example.vue'),
    },
    {
      code: "import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'",
      filename: resolve(root, 'layers/workspace/app/layouts/default.vue'),
    },
    {
      code: "import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'",
      filename: workspace,
    },
    {
      code: "import Button from '#layers/core/app/ui/components/BaseButton.vue'",
      filename: workspace,
    },
    { code: "import { locales } from '#layers/core/app/i18n/translator'", filename: site },
    { code: "import Header from '#layers/core/app/public-shell/SiteHeader.vue'", filename: docs },
    { code: "import { useLocalePath } from '#imports'", filename: site },
    { code: "import Button from '../components/BaseButton.vue'", filename: ui },
    { code: "import { NuxtLink } from '#components'", filename: ui },
    { code: "import { useGtag } from '#imports'", filename: site },
    { code: "import type { DocPage } from '../shared/DocsContent.types'", filename: docs },
    { code: "const issue = import('./sections/issues/Issue.vue')", filename: workspace },
    { code: "import type { DocPage } from '../../shared/DocsContent.types'", filename: docsServer },
  ],
})
