<template>
  <nav
    :aria-label="t('breadcrumbs')"
    class="breadcrumbs">
    <ol>
      <li
        v-for="(crumb, index) in crumbs"
        :key="index">
        <NuxtLink
          v-if="crumb.to"
          :to="crumb.to">
          {{ crumb.label }}
        </NuxtLink>
        <span
          v-else
          :aria-current="index === crumbs.length - 1 ? 'page' : undefined">
          {{ crumb.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.deps'

const props = defineProps<{ viewModel: AppLayoutData }>()

type Crumb = { label: string; to?: RouteLocationRaw }

const route = useRoute<OrganizationRouteName>()
const routes = useOrganizationRoutes()
const pageTitle = useCurrentPageTitle()
// The page sets its title while it renders, after this header, so the server's HTML can't have it.
// It shows from mounting on, which keeps hydration identical to the server's HTML.
const mounted = ref(false)
onMounted(() => (mounted.value = true))
const { t } = useI18n({
  en: {
    admin: 'Admin',
    allIssues: 'All issues',
    attributes: 'Attributes',
    backlog: 'Backlog',
    board: 'Board',
    breadcrumbs: 'Breadcrumbs',
    permissions: 'Permissions',
    retro: 'Retro',
    youIn: 'You in {organization}',
  },
  ru: {
    admin: 'Админка',
    allIssues: 'Все задачи',
    attributes: 'Атрибуты',
    backlog: 'Бэклог',
    board: 'Доска',
    breadcrumbs: 'Навигационная цепочка',
    permissions: 'Права',
    retro: 'Ретро',
    youIn: 'Вы в организации {organization}',
  },
})

// The pages above the current one; the current one is named by its own title.
const parents = (): Crumb[] => {
  const name = String(route.name)
  const is = (prefix: string) => name.startsWith(`organizations-organizationKey-${prefix}`)
  const { boardId, spaceKey } = route.params as { boardId?: string; spaceKey?: string }

  if (is('issues-')) {
    return [{ label: t('allIssues'), to: routes.issues() }]
  }
  if (is('retro-')) {
    return [{ label: t('retro'), to: routes.retros() }]
  }
  if (is('spaces-spaceKey-') && spaceKey) {
    const space = props.viewModel.spaces.find((item) => item.key === spaceKey)
    const crumbs: Crumb[] = [{ label: space?.name ?? spaceKey, to: routes.space(spaceKey) }]
    if (is('spaces-spaceKey-backlog-')) {
      crumbs.push({ label: t('backlog'), to: routes.backlog(spaceKey) })
    }
    if (is('spaces-spaceKey-boardId-') && boardId) {
      crumbs.push({ label: t('board'), to: routes.board(spaceKey, boardId) })
    }
    return crumbs
  }
  if (is('admin')) {
    const crumbs: Crumb[] = [{ label: t('admin') }]
    if (is('admin-attributes-')) {
      crumbs.push({ label: t('attributes'), to: routes.attributes() })
    }
    if (is('admin-permissions-')) {
      crumbs.push({ label: t('permissions'), to: routes.permissions() })
    }
    return crumbs
  }
  if (is('account')) {
    return [{ label: t('youIn', { organization: props.viewModel.organization.name }) }]
  }
  return []
}

const crumbs = computed<Crumb[]>(() => [
  { label: props.viewModel.organization.name, to: routes.issues() },
  ...parents(),
  ...(mounted.value && pageTitle.value ? [{ label: pageTitle.value }] : []),
])
</script>

<style scoped>
.breadcrumbs {
  min-width: 0;
}

ol {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: 13px;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  min-width: 0;
  padding: 0;
}

li {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

li + li::before {
  content: '/';
}

a,
span {
  color: inherit;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

a:hover {
  color: var(--color-text);
}

li:last-child > span {
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

/* A phone has room for the current page only. */
@media (max-width: 767px) {
  li:not(:last-child) {
    display: none;
  }

  li + li::before {
    content: none;
  }
}
</style>
