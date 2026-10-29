import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const aliases = [
  ['#layers/core', 'layers/core'],
  ['#layers/site', 'layers/site'],
  ['#layers/docs', 'layers/docs'],
  ['#layers/workspace', 'layers/workspace'],
  ['#infrastructure', 'infrastructure'],
  ['#server', 'server'],
  ['~~', '.'],
  ['@@', '.'],
  ['~', 'app'],
  ['@', 'app'],
]
// Each area is a Nuxt layer. Areas share only the core layer: the UI kit, the public shell and the
// common host modules.
const allowed = {
  common: ['common', 'ui', 'contracts', 'infrastructure'],
  contracts: ['contracts'],
  docs: ['docs', 'shell', 'common', 'ui', 'contracts', 'infrastructure'],
  infrastructure: ['infrastructure', 'contracts'],
  server: ['server', 'contracts', 'infrastructure'],
  shell: ['shell', 'common', 'ui', 'contracts', 'infrastructure'],
  site: ['site', 'shell', 'common', 'ui', 'contracts', 'infrastructure'],
  ui: ['ui'],
  workspace: ['workspace', 'common', 'ui', 'contracts', 'infrastructure'],
}
const moduleExports = new Set([
  'defineArticle',
  'defineBreadcrumb',
  'defineQuestion',
  'defineSoftwareApp',
  'defineWebPage',
  'useGtag',
  'useLocaleHead',
  'useLocalePath',
  'useSchemaOrg',
  'useSwitchLocalePath',
])

function area(filename) {
  const parts = relative(projectRoot, filename).replaceAll('\\', '/').split('/')
  if (parts[0] === 'server') {
    return 'server'
  }
  if (parts[0] === 'infrastructure') {
    return 'infrastructure'
  }
  if (parts[0] !== 'layers') {
    return undefined
  }
  const [, layer, folder, section] = parts
  if (layer === 'core') {
    if (folder === 'app' && section === 'ui') {
      return 'ui'
    }
    return folder === 'app' && section === 'public-shell' ? 'shell' : 'common'
  }
  if (layer === 'docs' && folder === 'server') {
    return 'server'
  }
  if (layer === 'docs' && folder === 'shared') {
    return 'contracts'
  }
  return ['site', 'docs', 'workspace'].includes(layer) ? layer : undefined
}

function localPath(source, filename) {
  for (const [alias, directory] of aliases) {
    if (source === alias || source.startsWith(`${alias}/`)) {
      return resolve(projectRoot, directory, source.slice(alias.length + 1))
    }
  }
  if (source.startsWith('.')) {
    return resolve(dirname(filename), source)
  }
  return isAbsolute(source) ? source : undefined
}

export default {
  create(context) {
    const from = area(context.filename)
    if (!from) {
      return {}
    }

    function inspect(node, source, specifiers = []) {
      if (typeof source?.value !== 'string') {
        context.report({ messageId: 'dynamic', node })
        return
      }
      const value = source.value
      if (
        ['server', 'contracts', 'infrastructure'].includes(from) &&
        (value === '#app' || value.startsWith('#app/') || value === 'nuxt/app')
      ) {
        context.report({ data: { from, to: 'Nuxt client runtime' }, messageId: 'boundary', node })
        return
      }
      if (value === '#imports' || value === '#components') {
        const client = !['server', 'contracts', 'infrastructure'].includes(from)
        const explicit =
          client &&
          specifiers.length > 0 &&
          specifiers.every((specifier) => {
            if (specifier.type !== 'ImportSpecifier') {
              return false
            }
            const name = specifier.imported.name ?? specifier.imported.value
            return value === '#imports'
              ? from !== 'ui' && moduleExports.has(name)
              : /^Nuxt[A-Z]/.test(name) || name === 'ClientOnly'
          })
        if (!explicit) {
          context.report({ messageId: 'registry', node })
        }
        return
      }
      const target = localPath(value, context.filename)
      const importer = relative(projectRoot, context.filename).replaceAll('\\', '/')
      if (
        from === 'workspace' &&
        !context.filename.endsWith('.test.ts') &&
        // Routes and layouts read the current organization and pass its links down.
        !/^layers\/workspace\/app\/(pages|layouts)\//.test(importer) &&
        target &&
        relative(projectRoot, target).replaceAll('\\', '/').replace(/\.ts$/, '') ===
          'layers/workspace/app/shared/composables/useOrganizationRoutes'
      ) {
        context.report({ messageId: 'routeContext', node })
        return
      }
      const to = target && area(target)
      if (to && !allowed[from].includes(to)) {
        context.report({ data: { from, to }, messageId: 'boundary', node })
      }
    }

    return {
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          inspect(node, node.arguments[0])
        }
        if (node.callee.type === 'Identifier' && node.callee.name === 'resolveComponent') {
          context.report({ messageId: 'registry', node })
        }
      },
      ExportAllDeclaration: (node) => inspect(node, node.source),
      ExportNamedDeclaration: (node) => node.source && inspect(node, node.source),
      ImportDeclaration: (node) => inspect(node, node.source, node.specifiers),
      ImportExpression: (node) => inspect(node, node.source),
      TSExternalModuleReference: (node) => inspect(node, node.expression),
      TSImportType: (node) => inspect(node, node.source ?? node.argument?.literal ?? node.argument),
    }
  },
  meta: {
    messages: {
      boundary: '{{from}} cannot import {{to}}. Move shared code to an allowed common module.',
      dynamic: 'Use a literal module path so its import boundary can be validated.',
      registry:
        'Import dependencies from their files; registries are only for Nuxt built-ins and external module exports.',
      routeContext:
        'Pass organizationRoutes from the route or layout instead of reading the current organization here.',
    },
    schema: [],
    type: 'problem',
  },
}
