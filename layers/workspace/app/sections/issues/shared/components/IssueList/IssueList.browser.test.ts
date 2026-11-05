import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'
import type { BoardSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/BoardSelect/BoardSelect.deps'
import type { StatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps'
import type { SpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps'
import { createOrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

import type { MoveIssuesDialogDeps } from './components/move-issues-dialog/MoveIssuesDialog.deps'
import type { IssueListDeps, IssueListQuickEditDeps } from './IssueList.deps'
import type { IssueListItem } from './IssueList.types'
import IssueList from './IssueList.vue'

const issueOf = (issueKey: string, title: string): IssueListItem => ({
  assignee: 'Ada',
  assigneeColor: '#111',
  assigneeInitial: 'A',
  blocked: false,
  boardColor: '#222',
  boardName: 'Roadmap',
  canMove: true,
  issueKey,
  spaceColor: '#333',
  spaceName: 'Product',
  status: 'To do',
  statusColor: '#444',
  time: '2026-01-01T10:00:00Z',
  title,
})

const issues = [issueOf('ISS-1', 'First issue'), issueOf('ISS-2', 'Second issue')]

const responsiveIssues: IssueListItem[] = [
  {
    ...issues[0]!,
    attributes: [
      { color: '#123456', kind: 'text', name: 'Project', value: 'Long attribute '.repeat(12) },
      { color: '#123456', kind: 'text', name: 'Team', value: 'Product development' },
      { color: '#123456', kind: 'text', name: 'Priority', value: 'High' },
    ],
    boardName: 'Long board name '.repeat(8),
    source: { keyName: null, kind: 'web' },
    spaceKey: 'product',
    spaceName: 'Long space name '.repeat(8),
    status: 'Long status name '.repeat(8),
    title: 'VeryLongUnbrokenIssueTitle'.repeat(15),
  },
  { ...issues[1]!, canMove: false, status: null },
]

const createDeps = (overrides: Partial<MoveIssuesDialogDeps> = {}): IssueListDeps => ({
  moveIssuesDialog: {
    boardSelect: {
      loadBoards: vi.fn<BoardSelectDeps['loadBoards']>(async () => [
        { label: 'Sprint board', value: '12' },
      ]),
    },
    moveIssues: vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => {}),
    spaceSelect: {
      loadSpaces: vi.fn<SpaceSelectDeps['loadSpaces']>(async () => [
        { label: 'Product', value: '7' },
      ]),
    },
    statusSelect: {
      loadStatuses: vi.fn<StatusSelectDeps['loadStatuses']>(async () => [
        { label: 'To do', value: '3' },
        { label: 'Done', value: '4' },
      ]),
    },
    ...overrides,
  },
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: IssueListDeps,
  onMoved: () => void = vi.fn<() => void>(),
  listIssues: IssueListItem[] = issues,
) => {
  currentWrapper = await mountSuspended(IssueList, {
    attachTo: document.body,
    props: {
      deps,
      emptyText: 'No issues yet.',
      filtering: false,
      hasNextPage: false,
      issues: listIssues,
      onMoved,
      onUpdatePage: vi.fn<(value: number) => void>(),
      organizationRoutes: createOrganizationRoutes('acme-ab12'),
      page: 1,
    },
    route: '/organizations/acme-ab12/issues',
  })
  return currentWrapper
}

const dialog = () => page.getByRole('dialog')

const rowAction = async (index: number, name: string) => {
  await page.getByRole('button', { name: 'Issue actions' }).nth(index).click()
  await page.getByRole('menuitem', { exact: true, name }).last().click()
}

it('loads inline choices on opening and keeps the current status after a failed save', async () => {
  const deps = createDeps()
  const loadStatuses = vi.fn<StatusSelectDeps['loadStatuses']>(async () => [
    { label: 'To do', value: '3' },
    { label: 'Done', value: '4' },
  ])
  deps.quickEdit = {
    assigneeSelect: {
      loadAssignees: vi.fn<IssueListQuickEditDeps['assigneeSelect']['loadAssignees']>(async () => [
        { color: '#111', initials: 'A', isCurrentUser: false, label: 'Ada', value: 'ada' },
      ]),
    },
    saveAssignee: vi.fn<IssueListQuickEditDeps['saveAssignee']>(async () => {}),
    saveStatus: vi.fn<IssueListQuickEditDeps['saveStatus']>(async () => {
      throw new ApiError(400, 'Status cannot be changed.')
    }),
    statusSelect: { loadStatuses },
  }
  const onMoved = vi.fn<() => void>()
  await mount(deps, onMoved, [
    { ...issues[0]!, assigneeId: 'ada', boardId: '12', spaceKey: 'product', statusId: '3' },
  ])
  expect(loadStatuses).not.toHaveBeenCalled()
  expect(deps.quickEdit.assigneeSelect.loadAssignees).not.toHaveBeenCalled()
  await page.getByRole('combobox', { exact: true, name: 'Status' }).click()
  await page.getByRole('option', { exact: true, name: 'Done' }).click()
  await expect.element(page.getByRole('alert')).toBeInTheDocument()
  expect(deps.quickEdit.saveStatus).toHaveBeenCalledWith({ issueKey: 'ISS-1', statusId: '4' })
  await expect
    .element(page.getByRole('combobox', { exact: true, name: 'Status' }))
    .toHaveTextContent('To do')
  expect(onMoved).not.toHaveBeenCalled()
  await page.getByRole('combobox', { exact: true, name: 'Assignee' }).click()
  await expect.element(page.getByRole('option', { exact: true, name: 'Ada' })).toBeInTheDocument()
  expect(deps.quickEdit.assigneeSelect.loadAssignees).toHaveBeenCalledOnce()
})

const chooseDestination = async () => {
  await dialog().getByLabelText('Space').click()
  await expect.element(page.getByRole('option', { name: 'Product' })).toBeInTheDocument()
  await page.getByRole('option', { name: 'Product' }).click()
  await dialog().getByLabelText('Board').click()
  await expect.element(page.getByRole('option', { name: 'Sprint board' })).toBeInTheDocument()
  await page.getByRole('option', { name: 'Sprint board' }).click()
  await dialog().getByLabelText('Status').click()
  await expect.element(page.getByRole('option', { name: 'To do' })).toBeInTheDocument()
  await page.getByRole('option', { name: 'To do' }).click()
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the empty text when there are no issues', async () => {
  await mount(createDeps(), vi.fn<() => void>(), [])

  await expect.element(page.getByText('No issues yet.')).toBeInTheDocument()
})

it('shows a date rather than a clock time for an issue created today', async () => {
  const time = new Date().toISOString()
  const wrapper = await mount(createDeps(), vi.fn<() => void>(), [{ ...issues[0]!, time }])

  expect(wrapper.get('time').attributes('datetime')).toBe(time)
  expect(wrapper.get('time').text()).not.toContain(String(new Date(time).getFullYear()))
  expect(wrapper.get('time').text()).not.toMatch(/^\d{1,2}:\d{2}$/)
})

it.each([390, 1440])('only shows checkboxes in selection mode at %ipx', async (width) => {
  const wrapper = await mount(createDeps())
  wrapper.element.setAttribute('style', `width: ${width}px`)
  const keyOffset = () => {
    const row = wrapper.get('.issue-list-row').element
    return (
      wrapper.get('.issue-key').element.getBoundingClientRect().left -
      row.getBoundingClientRect().left -
      Number.parseFloat(getComputedStyle(row).paddingLeft) -
      Number.parseFloat(getComputedStyle(row).borderLeftWidth)
    )
  }

  await userEvent.hover(wrapper.get('.issue-list-row').element)
  await userEvent.tab()
  expect(page.getByRole('checkbox', { name: 'Select issue' }).all()).toHaveLength(0)
  await vi.waitFor(() => expect(keyOffset()).toBeCloseTo(0))
  await rowAction(0, 'Select issue')
  await expect.element(page.getByRole('checkbox', { name: 'Select issue' }).first()).toBeChecked()
  await vi.waitFor(() => expect(keyOffset()).toBeGreaterThan(0))
  await page.getByRole('button', { exact: true, name: 'Clear' }).click()
  expect(page.getByRole('checkbox', { name: 'Select issue' }).all()).toHaveLength(0)
  await vi.waitFor(() => expect(keyOffset()).toBeCloseTo(0))
})

it('shows Backlog with the same status indicator when the API has no board status', async () => {
  const wrapper = await mount(createDeps(), vi.fn<() => void>(), [{ ...issues[0]!, status: null }])

  await expect.element(page.getByText('Backlog', { exact: true })).toBeVisible()
  expect(wrapper.find('.issue-status .issue-status-indicator').exists()).toBe(true)
})

it('only offers checkboxes for movable issues and leaves selection mode when the last is cleared', async () => {
  await mount(createDeps(), vi.fn<() => void>(), [issues[0]!, { ...issues[1]!, canMove: false }])

  await rowAction(0, 'Select issue')
  expect(page.getByRole('checkbox', { name: 'Select issue' }).all()).toHaveLength(1)
  await expect.element(page.getByText('1 selected')).toBeInTheDocument()
  await page.getByRole('checkbox', { name: 'Select issue' }).click()
  expect(page.getByRole('checkbox', { name: 'Select issue' }).all()).toHaveLength(0)
})

it.each([320, 390, 768, 1024, 1440])(
  'keeps long issue content and controls inside a %ipx list, including the backlog',
  async (width) => {
    const wrapper = await mount(createDeps(), vi.fn<() => void>(), responsiveIssues)
    const container = wrapper.get('.issue-list-container').element
    container.setAttribute('style', `width: ${width}px`)

    const expectContentToFit = () => {
      const bounds = container.getBoundingClientRect()
      expect(container.scrollWidth).toBeLessThanOrEqual(width + 1)
      for (const element of container.querySelectorAll(
        '.issue-key, .issue-content, .issue-title, .issue-time, .issue-status, .issue-person, .issue-attributes, .issue-location, .row-actions',
      )) {
        const rect = element.getBoundingClientRect()
        expect(rect.left).toBeGreaterThanOrEqual(bounds.left)
        expect(rect.right).toBeLessThanOrEqual(bounds.right + 1)
      }
      for (const row of container.querySelectorAll('.issue-list-row')) {
        const key = row.querySelector('.issue-key')!
        expect(key.getBoundingClientRect().left).toBeCloseTo(
          row.getBoundingClientRect().left +
            Number.parseFloat(getComputedStyle(row).paddingLeft) +
            Number.parseFloat(getComputedStyle(row).borderLeftWidth),
        )
      }
      for (const row of container.querySelectorAll('.issue-list-row:has(.row-actions button)')) {
        const actions = row.querySelector('.row-actions button')!
        const created = row.querySelector('.issue-created')!
        const padding = Number.parseFloat(getComputedStyle(row).paddingRight)
        expect(created.getBoundingClientRect().right).toBeLessThanOrEqual(
          actions.getBoundingClientRect().left - Number.parseFloat(getComputedStyle(row).columnGap),
        )
        expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(
          row.getBoundingClientRect().right - padding + 1,
        )
      }
    }

    await vi.waitFor(expectContentToFit)
    expect(wrapper.findAll('.attribute-label')).toHaveLength(3)
    expect(page.getByRole('button', { name: 'Attributes' }).all()).toHaveLength(0)
    expect(wrapper.get('.issue-attributes').element.getBoundingClientRect().top).toBeGreaterThan(
      wrapper.get('.issue-content').element.getBoundingClientRect().bottom,
    )
    await wrapper.setProps({
      hideLocation: true,
      hideStatus: true,
      issues: [{ ...wrapper.props('issues')[0]!, status: null }],
    })
    await vi.waitFor(expectContentToFit)
    expect(wrapper.find('.issue-location').exists()).toBe(false)
    expect(wrapper.find('.issue-status').exists()).toBe(false)
    expect(wrapper.findAll('.attribute-label')).toHaveLength(3)
  },
)

it.each([1024, 1440])(
  'centers desktop metadata beside the title and attributes at %ipx',
  async (width) => {
    const wrapper = await mount(createDeps(), vi.fn<() => void>(), responsiveIssues)
    wrapper.get('.issue-list-container').element.setAttribute('style', `width: ${width}px`)
    const row = wrapper.get('.issue-list-row').element
    const title = row.querySelector('.issue-content')!.getBoundingClientRect()
    const attributes = row.querySelector('.issue-attributes')!.getBoundingClientRect()
    const location = row.querySelector('.issue-location')!.getBoundingClientRect()
    expect(attributes.right).toBeLessThan(location.left)
    for (const control of row.querySelectorAll(
      '.issue-location, .issue-status, .issue-person, .issue-created, .row-actions',
    )) {
      const rect = control.getBoundingClientRect()
      expect(rect.top + rect.height / 2).toBeCloseTo((title.top + attributes.bottom) / 2)
    }
  },
)

it.each([320, 390, 768])(
  'wraps the title under its key and aligns the mobile footer at %ipx',
  async (width) => {
    const wrapper = await mount(createDeps(), vi.fn<() => void>(), responsiveIssues)
    wrapper.get('.issue-list-container').element.setAttribute('style', `width: ${width}px`)
    const titleRange = document.createRange()
    titleRange.selectNodeContents(wrapper.get('.issue-title').element)
    const lines = Array.from(titleRange.getClientRects()).filter((rect) => rect.width > 0)
    expect(lines.length).toBeGreaterThan(1)
    expect(lines[1]!.left).toBeCloseTo(
      wrapper.get('.issue-content').element.getBoundingClientRect().left,
    )
    const element: Element = wrapper.element
    const controls = element.querySelectorAll(
      '.issue-list-row:first-child :is(.issue-person, .issue-created, .row-actions)',
    )
    expect(
      new Set(
        Array.from(controls, (control) => {
          const rect = control.getBoundingClientRect()
          return rect.top + rect.height / 2
        }),
      ).size,
    ).toBe(1)
    expect(wrapper.get('.issue-status').element.getBoundingClientRect().top).toBeLessThan(
      wrapper.get('.issue-footer').element.getBoundingClientRect().top,
    )
  },
)

it('moves a single issue through its row action without touching the selection', async () => {
  const moveIssues = vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => {})
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveIssues }), onMoved)

  await rowAction(1, 'Select issue')
  await rowAction(0, 'Move to board')
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveIssues).toHaveBeenCalledWith({ issueKeys: ['ISS-1'], statusId: '3' })
  expect(onMoved).toHaveBeenCalledTimes(1)
})

it('moves every selected issue and clears the selection afterwards', async () => {
  const moveIssues = vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => {})

  await mount(createDeps({ moveIssues }))

  await rowAction(0, 'Select issue')
  await page.getByLabelText('Select issue').nth(1).click()
  await page.getByRole('button', { name: 'Move to board' }).first().click()
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveIssues).toHaveBeenCalledWith({ issueKeys: ['ISS-1', 'ISS-2'], statusId: '3' })
  await expect.element(page.getByText('2 selected')).not.toBeInTheDocument()
})

it('keeps the dialog open and shows the message when moving fails', async () => {
  const moveIssues = vi
    .fn<MoveIssuesDialogDeps['moveIssues']>()
    .mockRejectedValue(new ApiError(400, 'These issues can no longer be moved.'))
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveIssues }), onMoved)

  await rowAction(0, 'Move to board')
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .toBeInTheDocument()
  expect(onMoved).not.toHaveBeenCalled()
})

it('drops the failure message as soon as the destination changes', async () => {
  const moveIssues = vi
    .fn<MoveIssuesDialogDeps['moveIssues']>()
    .mockRejectedValue(new ApiError(400, 'These issues can no longer be moved.'))

  await mount(createDeps({ moveIssues }))

  await rowAction(0, 'Move to board')
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()
  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .toBeInTheDocument()

  await dialog().getByLabelText('Status').click()
  await page.getByRole('option', { name: 'Done' }).click()

  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .not.toBeInTheDocument()
})

it('marks a blocked issue', async () => {
  const wrapper = await mount(createDeps(), vi.fn<() => void>(), [
    {
      ...issueOf('ISS-1', 'Waits for the API'),
      blocked: true,
      source: { keyName: null, kind: 'web' },
    },
    issueOf('ISS-2', 'Build the API'),
  ])

  await expect.element(page.getByText('Build the API')).toBeInTheDocument()
  expect(page.getByRole('img', { name: 'Blocked' }).all()).toHaveLength(1)
  expect(wrapper.get('.issue-key').element.nextElementSibling?.className).toBe('issue-title')
  expect(wrapper.get('.issue-title').element.firstElementChild?.className).toBe('issue-blocked')
  expect(
    wrapper.get('time').element.previousElementSibling?.classList.contains('issue-source-icon'),
  ).toBe(true)
  expect(wrapper.find('.issue-content .issue-source-icon').exists()).toBe(false)
})
