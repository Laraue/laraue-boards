<template>
  <div class="shell">
    <aside :class="{ open: state.sidebarOpen }">
      <NuxtLink
        class="logo"
        :to="organizationRoutes.issues()">
        <img
          alt=""
          class="logo-mark"
          :src="laraueLogoUrl" />
        <span>Laraue Boards</span>
      </NuxtLink>
      <div
        class="organization"
        @click="state.sidebarOpen = false">
        <NuxtLink
          :aria-label="`${t('switchOrganization')}. ${t('currentOrganization')}: ${viewModel.organization.name}`"
          class="organization-select"
          data-tour="organization-switcher"
          :title="t('switchOrganization')"
          to="/organizations">
          <span
            class="entity-avatar"
            :style="{ background: viewModel.organization.color }">
            {{ viewModel.organization.initial }}
          </span>
          <span class="organization-name">
            {{ viewModel.organization.name }}
          </span>
          <ChevronsUpDown class="organization-switch-icon" />
        </NuxtLink>
      </div>
      <nav
        :aria-label="t('mainNavigation')"
        @click="state.sidebarOpen = false">
        <NuxtLink
          :class="{
            active: active('organizations-organizationKey-issues'),
          }"
          data-tour="all-issues"
          :to="organizationRoutes.issues()">
          <ClipboardList />
          {{ t('allIssues') }}
        </NuxtLink>
        <NuxtLink
          :class="{ active: active('organizations-organizationKey-history') }"
          :to="organizationRoutes.history()">
          <History />
          {{ t('history') }}
        </NuxtLink>
        <div
          class="nav-title"
          data-tour="spaces">
          {{ t('spaces') }}
        </div>
        <p
          v-if="viewModel.spaces.length === 0"
          class="nav-hint">
          {{ t('spaceHint') }}
        </p>
        <div
          v-for="space in viewModel.spaces"
          :key="space.key"
          class="space-group">
          <NuxtLink
            :class="{ active: spaceActive(space) }"
            :to="organizationRoutes.space(space.key)">
            <SpaceIcon :style="{ color: space.color }" />
            {{ space.name }}
          </NuxtLink>
        </div>
        <NuxtLink
          v-if="viewModel.organization.canCreateSpaces"
          exact-active-class="active"
          :to="organizationRoutes.newSpace()">
          <Plus />
          {{ t('createSpace') }}
        </NuxtLink>
        <div class="sidebar-bottom">
          <NuxtLink
            v-if="adminHome"
            :class="{ active: within('organizations-organizationKey-admin') }"
            data-tour="organization-settings"
            :to="adminHome">
            <Settings />
            {{ t('admin') }}
          </NuxtLink>
          <NuxtLink
            :class="{ active: within('organizations-organizationKey-retro') }"
            :to="organizationRoutes.retros()">
            <RetroIcon />
            {{ t('retro') }}
            <span class="muted nav-badge">{{ t('alpha') }}</span>
          </NuxtLink>
          <a
            :aria-label="t('documentationNewTab')"
            class="sidebar-documentation"
            :href="docsPath(locale)"
            rel="noopener noreferrer"
            target="_blank">
            <BookOpen />
            {{ t('documentation') }}
          </a>
        </div>
      </nav>
      <div class="sidebar-footer">
        <AppPopover class="sidebar-user-menu">
          <template #trigger="{ open, toggle }">
            <button
              :aria-expanded="open"
              aria-haspopup="true"
              class="sidebar-user"
              :class="{ active: open || within('organizations-organizationKey-account') }"
              type="button"
              @click="toggle">
              <span
                class="avatar"
                :style="{ background: viewModel.user.color }">
                {{ viewModel.user.initials }}
              </span>
              <span class="sidebar-user-info">
                <strong>{{ viewModel.user.name }}</strong>
                <small class="muted">
                  {{ viewModel.user.tariffName || t('tariffUnavailable') }}
                </small>
              </span>
            </button>
          </template>
          <template #default="{ close }">
            <div
              class="user-menu"
              @click="closeUserMenu(close)">
              <NuxtLink
                class="user-menu-item"
                to="/account">
                <Globe />
                <span>
                  <strong>{{ t('yourAccount') }}</strong>
                  <small class="muted">{{ t('yourAccountHint') }}</small>
                </span>
              </NuxtLink>
              <NuxtLink
                class="user-menu-item"
                :to="organizationRoutes.account()">
                <Building2 />
                <span>
                  <strong>{{ t('youIn', { organization: viewModel.organization.name }) }}</strong>
                  <small class="muted">
                    {{ t('youInHint', { organization: viewModel.organization.name }) }}
                  </small>
                </span>
              </NuxtLink>
              <button
                class="user-menu-item danger"
                type="button"
                @click="props.onLogout">
                <LogOut />
                <strong>{{ t('logOut') }}</strong>
              </button>
            </div>
          </template>
        </AppPopover>
      </div>
    </aside>
    <Transition name="fade">
      <button
        v-if="state.sidebarOpen"
        :aria-label="t('closeMenu')"
        class="scrim"
        @click="state.sidebarOpen = false" />
    </Transition>
    <main>
      <button
        v-if="!state.sidebarOpen"
        :aria-label="t('openMenu')"
        class="icon-btn mobile-menu-button"
        type="button"
        @click="state.sidebarOpen = true">
        <Menu />
      </button>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Building2,
  ChevronsUpDown,
  ClipboardList,
  Globe,
  History,
  LogOut,
  Menu,
  Plus,
  Settings,
} from '@lucide/vue'

import { RetroIcon, SpaceIcon } from '~/constants/icons'
import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.types'
import { docsPath } from '~/sections/docs/docsPaths'

const props = defineProps<{
  onLogout: () => void
  viewModel: AppLayoutData
}>()
const route = useRoute<OrganizationRouteName>()
const organizationRoutes = useOrganizationRoutes()
const state = reactive({ sidebarOpen: false })
const { locale, t } = useI18n({
  en: {
    admin: 'Admin',
    allIssues: 'All issues',
    alpha: 'alpha',
    closeMenu: 'Close menu',
    createSpace: 'Create space',
    currentOrganization: 'Current organization',
    documentation: 'Documentation',
    documentationNewTab: 'Documentation (opens in a new tab)',
    history: 'History',
    logOut: 'Log out',
    mainNavigation: 'Main navigation',
    openMenu: 'Open menu',
    retro: 'Retro',
    spaceHint: 'A space groups the boards and issues of one project.',
    spaces: 'Spaces',
    switchOrganization: 'Switch organization',
    tariffUnavailable: 'Tariff unavailable',
    youIn: 'You in {organization}',
    youInHint: 'Profile, plan, transactions, API keys. Only in {organization}',
    yourAccount: 'Your Laraue account',
    yourAccountHint: 'Sign-in methods, language and theme. In all organizations',
  },
  ru: {
    admin: 'Админка',
    allIssues: 'Все задачи',
    alpha: 'альфа',
    closeMenu: 'Закрыть меню',
    createSpace: 'Создать раздел',
    currentOrganization: 'Текущая организация',
    documentation: 'Документация',
    documentationNewTab: 'Документация (откроется в новой вкладке)',
    history: 'История',
    logOut: 'Выйти',
    mainNavigation: 'Главная навигация',
    openMenu: 'Открыть меню',
    retro: 'Ретро',
    spaceHint: 'В разделе собраны доски и задачи проекта.',
    spaces: 'Разделы',
    switchOrganization: 'Сменить организацию',
    tariffUnavailable: 'Тариф недоступен',
    youIn: 'Вы в организации {organization}',
    youInHint: 'Профиль, тариф, транзакции, API-ключи. Только в {organization}',
    yourAccount: 'Ваш аккаунт Laraue',
    yourAccountHint: 'Способы входа, язык и тема. Во всех организациях',
  },
})
const active = (name: OrganizationRouteName) => route.name === name
const within = (name: OrganizationRouteName) =>
  typeof route.name === 'string' && route.name.startsWith(name)
const adminHome = computed(() => {
  const organization = props.viewModel.organization
  if (organization.canUpdate) {
    return organizationRoutes.admin()
  }
  if (organization.canManage) {
    return organizationRoutes.permissions()
  }
  if (organization.canManageAttributes) {
    return organizationRoutes.attributes()
  }
  if (organization.canMassMove) {
    return organizationRoutes.dataMovement()
  }
  if (organization.canViewBilling) {
    return organizationRoutes.adminTransactions()
  }
  return undefined
})
const spaceActive = (space: AppLayoutData['spaces'][number]) =>
  within('organizations-organizationKey-spaces-spaceKey') &&
  route.params.spaceKey !== undefined &&
  route.params.spaceKey === space.key
const closeUserMenu = (close: () => void) => {
  close()
  state.sidebarOpen = false
}
</script>

<style scoped>
.shell {
  --layout-content-padding: var(--space-6);

  align-items: start;
  background: var(--color-workspace);
  border-inline: 1px solid var(--color-divider);
  box-shadow: var(--shadow-workspace);
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  margin-inline: auto;
  max-width: var(--workspace-max-width);
  min-height: 100dvh;
}

aside {
  background: var(--color-surface);
  border-right: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow-y: auto;
  padding: var(--space-4) var(--space-3);
  position: sticky;
  top: 0;
  width: 100%;
  /* Sticky makes the sidebar its own stacking context, so the user menu inside it can only be
     above the page's own layers if the sidebar is. */
  z-index: 30;
}

aside .logo {
  padding: var(--space-1) var(--space-2) var(--space-5);
}

aside > nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: var(--space-4);
}

aside > nav a,
aside > nav button {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: flex;
  gap: var(--space-2);
  height: var(--control-height);
  margin: 2px 0;
  padding: var(--space-2) var(--space-3);
  text-align: left;
  text-decoration: none;
  transition: var(--transition-press);
  width: 100%;
}

/* Retro is still finding its shape, so the sidebar says so out loud. */
.nav-badge {
  border: 1px solid currentcolor;
  border-radius: var(--radius-pill);
  font-size: var(--font-size-caption);
  margin-left: auto;
  padding: 0 var(--space-2);
}

aside > nav a:hover,
aside > nav button:hover {
  background: var(--color-soft);
  color: var(--color-text);
}

aside > nav a:active,
aside > nav button:active {
  translate: 0 var(--press-offset);
}

aside > nav a.active,
aside > nav button.active {
  background: var(--color-accent-soft);
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

.nav-hint {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  line-height: 1.4;
  padding: 0 var(--space-3) var(--space-2);
}

.nav-title {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  padding: var(--space-5) var(--space-3) var(--space-2);
  text-transform: uppercase;
}

main {
  display: grid;
  grid-column: 2;
  height: 100dvh;
  min-width: 0;
  overflow: auto;
  padding: var(--layout-content-padding);
  position: relative;
  width: 100%;
}

main > :deep(*) {
  min-width: 0;
}

main :deep(.page-load-state) {
  min-height: 0;
  padding: 0;
}

.mobile-menu-button {
  display: none;
}

.mobile-menu-button:hover {
  background: var(--color-hover);
}

.scrim {
  background: #10182880;
  border: 0;
  border-radius: 0;
  inset: 0;
  position: fixed;
  z-index: 29;
}

.sidebar-footer {
  border-top: 1px solid var(--color-divider);
  display: grid;
  gap: var(--space-2);
  padding-top: var(--space-3);
}

.sidebar-footer .sidebar-user-menu {
  --app-popover-width: 300px;

  width: 100%;
}

.sidebar-user {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-2);
  text-align: left;
  transition: var(--transition-press);
  width: 100%;
}

.sidebar-user.active {
  background: var(--color-soft);
}

.user-menu {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-2);
}

.user-menu-item {
  align-items: flex-start;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2);
  text-align: left;
  text-decoration: none;
}

.user-menu-item:hover {
  background: var(--color-hover);
}

.user-menu-item > svg {
  flex: none;
  height: 18px;
  margin-top: 1px;
  width: 18px;
}

.user-menu-item > span {
  display: grid;
  gap: 2px;
}

.user-menu-item small {
  font-size: var(--font-size-small);
}

.user-menu-item.danger {
  border-radius: 0 0 var(--radius-control) var(--radius-control);
  border-top: 1px solid var(--color-divider);
  color: var(--color-danger);
}

.sidebar-user:hover {
  background: var(--color-soft);
}

.sidebar-user:active {
  translate: 0 var(--press-offset);
}

/* Retro and the docs live together at the bottom, away from the settings block. */
.sidebar-bottom {
  display: grid;
  gap: var(--space-1);
  margin-top: auto;
  padding-top: var(--space-6);
}

.sidebar-user-info {
  display: grid;
  flex: 1;
  min-width: 0;
}

.sidebar-user strong,
.sidebar-user small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization {
  align-items: center;
  background: var(--color-soft);
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  min-width: 0;
  position: relative;
  width: 100%;
}

.organization-select {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: inherit;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  text-decoration: none;
  transition: var(--transition-press);
  width: 100%;
}

.organization-select:hover {
  border-color: var(--color-border);
}

.organization-select:active {
  translate: 0 var(--press-offset);
}

.organization-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-switch-icon {
  color: var(--color-muted);
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .shell {
    --layout-content-padding: var(--space-3);

    border-inline: 0;
    box-shadow: none;
    display: block;
    padding: 0;
  }

  :global(body:has(aside.open)) {
    overflow: hidden;
  }

  aside {
    border-radius: 0;
    height: 100dvh;
    inset: 0 auto 0 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    position: fixed;
    transform: translateX(-100%);
    transition: transform var(--duration-base) var(--ease-standard);
    width: 280px;
    z-index: 30;
  }

  aside.open {
    box-shadow: 0 0 40px #00000059;
    transform: none;
  }

  main {
    grid-column: auto;
    width: 100%;
  }

  main :deep(.page-heading) {
    padding-left: calc(var(--icon-btn-size) + var(--space-2));
  }

  .mobile-menu-button {
    display: inline-flex;
    left: var(--layout-content-padding);
    position: absolute;
    top: calc(var(--layout-content-padding) + var(--space-1));
    z-index: 28;
  }
}
</style>
