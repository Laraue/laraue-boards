<!-- The bar at the top of an organization page: where the page is, its title and its own actions.
     Each page renders it, so its title and actions come with the page's own data. -->
<template>
  <header class="app-header page-header">
    <div class="page-header-start">
      <button
        :aria-label="t('openMenu')"
        class="header-btn page-header-menu"
        type="button"
        @click="sidebarOpen = true">
        <Menu />
      </button>
      <!-- A phone has no room for the path, so it keeps the way back up it. -->
      <NuxtLink
        v-if="back"
        :aria-label="t('backTo', { page: back.label })"
        class="header-btn page-header-back"
        :to="back.to">
        <ArrowLeft />
      </NuxtLink>
      <nav
        v-if="parents?.length"
        :aria-label="t('breadcrumbs')"
        class="page-header-path">
        <template
          v-for="parent in parents"
          :key="parent.label">
          <NuxtLink :to="parent.to">{{ parent.label }}</NuxtLink>
          <span aria-hidden="true">/</span>
        </template>
      </nav>
      <h1 v-if="title">{{ title }}</h1>
      <!-- What the page offers, in the path's own style: "Board / + Add issue". -->
      <template v-if="$slots.default">
        <span
          aria-hidden="true"
          class="page-header-separator">
          /
        </span>
        <span class="page-header-next">
          <slot />
        </span>
      </template>
    </div>
    <div class="page-header-actions">
      <span class="page-header-preferences">
        <AppHeaderPreferences />
        <NuxtLink
          :aria-label="t('yourAccount')"
          class="header-btn"
          to="/account">
          <CircleUser />
        </NuxtLink>
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ArrowLeft, CircleUser, Menu } from '@lucide/vue'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  parents?: Array<{ label: string; to: RouteLocationRaw }>
  // Left out only by the layout's stand-in for pages without their own header.
  title?: string
}>()

if (props.title !== undefined) {
  useHead({ title: () => props.title })
}
const back = computed(() => props.parents?.at(-1))
const sidebarOpen = useSidebarOpen()
const { t } = useI18n({
  en: {
    backTo: 'Back to {page}',
    breadcrumbs: 'Breadcrumbs',
    openMenu: 'Open menu',
    yourAccount: 'Your Laraue account',
  },
  ru: {
    backTo: 'Назад: {page}',
    breadcrumbs: 'Навигационная цепочка',
    openMenu: 'Открыть меню',
    yourAccount: 'Ваш аккаунт Laraue',
  },
})
</script>

<style scoped>
/* Out to the scrolling area's edges; a sticky box stops at its padding, so it moves past it. */
.page-header {
  flex: none;
  margin: calc(-1 * var(--layout-content-padding, 0px))
    calc(-1 * var(--layout-content-padding, 0px)) var(--layout-content-padding, 0px);
  top: calc(-1 * var(--layout-content-padding, 0px));
}

.page-header-start {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.page-header-path {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  flex: 0 1 auto;
  font-size: var(--font-size-body);
  gap: var(--space-2);
  min-width: 0;
}

.page-header-path a {
  color: inherit;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-header-path a:hover {
  color: var(--color-text);
}

.page-header-separator {
  color: var(--color-muted);
}

.page-header-next {
  display: flex;
  flex: none;
  gap: var(--space-4);
}

.page-header-next :deep(:is(a, button)) {
  align-items: center;
  background: none;
  border: 0;
  color: var(--color-muted);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: var(--space-1);
  padding: 0;
  text-decoration: none;
  text-underline-offset: 3px;
  white-space: nowrap;
}

/* Like the prototype's back link: no surface, the accent and an underline on hover. */
.page-header-next :deep(:is(a, button):hover) {
  color: var(--color-accent);
  text-decoration: underline;
}

.page-header-next :deep(:is(a, button):disabled) {
  cursor: default;
  opacity: 0.6;
  text-decoration: none;
}

.page-header-next :deep(:is(a, button) > svg) {
  height: 14px;
  width: 14px;
}

h1 {
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.01em;
}

.page-header-actions {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--space-2);
  margin-left: auto;
}

.page-header-preferences {
  display: contents;
}

.page-header-menu,
.page-header-back {
  display: none;
}

@media (max-width: 767px) {
  .page-header {
    padding-left: var(--space-2);
  }

  .page-header-menu,
  .page-header-back {
    display: inline-flex;
  }

  /* Language, theme and the account come with the menu instead. */
  .page-header-preferences {
    display: none;
  }

  /* A phone has room for the title only. */
  .page-header-path {
    display: none;
  }

  /* A phone keeps the actions' icons. */
  .page-header-next :deep(.btn-label) {
    display: none;
  }
}
</style>
