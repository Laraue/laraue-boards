import type { ApiClient } from '#infrastructure/api/client'
import { createIssuePageDeps } from '~/sections/issues/issue/deps-impl'

import type { BoardPageDeps } from '../BoardPage.deps'
import { createLoadMoreBoardIssues } from './loadMoreBoardIssues'
import { createMoveBoardIssue } from './moveBoardIssue'
import { createMoveIssueToBacklog } from './moveIssueToBacklog'
import { createSearchBoardIssues } from './searchBoardIssues'
import { createViewBoardPage } from './viewBoardPage'

export const createBoardPageDeps = (client: ApiClient): BoardPageDeps => ({
  issueDialog: createIssuePageDeps(client),
  loadMoreBoardIssues: createLoadMoreBoardIssues(client),
  moveBoardIssue: createMoveBoardIssue(client),
  moveIssueToBacklog: createMoveIssueToBacklog(client),
  searchBoardIssues: createSearchBoardIssues(client),
  view: createViewBoardPage(client),
})
