// Vue templates and architectural import boundaries; general checks stay in oxlint + oxfmt.
import tsParser from '@typescript-eslint/parser'
import pluginVue from 'eslint-plugin-vue'

import importBoundaries from './tools/eslint/import-boundaries.mjs'

export default [
  {
    ignores: [
      '.nuxt/',
      '.output/',
      'dist/',
      'infrastructure/api/generated.ts',
      'infrastructure/api/retro.generated.ts',
      'infrastructure/api/billing.generated.ts',
    ],
  },

  ...pluginVue.configs['flat/base'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tsParser },
    },
    rules: {
      'vue/attributes-order': [
        'error',
        {
          alphabetical: true,
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'GLOBAL',
            'UNIQUE',
            'SLOT',
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'OTHER_ATTR',
            'EVENTS',
            'CONTENT',
          ],
        },
      ],
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': [
        'error',
        // Async setup must expose its public API before the first await (enforced by oxlint).
        { defineExposeLast: false, order: ['defineProps', 'defineEmits'] },
      ],
      'vue/no-undef-components': 'error',
      'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
    },
  },

  {
    files: ['{layers,server,infrastructure}/**/*.ts'],
    languageOptions: { parser: tsParser },
  },
  {
    files: ['{layers,server,infrastructure}/**/*.{ts,vue}'],
    plugins: {
      architecture: { rules: { 'import-boundaries': importBoundaries } },
    },
    rules: {
      'architecture/import-boundaries': 'error',
    },
  },
]
