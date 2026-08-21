import { diffArrays, diffWordsWithSpace } from 'diff'

import type {
  IssueDescriptionDiffLine,
  IssueDescriptionDiffSpan,
} from '../../IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.types'

const appendSpan = (spans: IssueDescriptionDiffSpan[], text: string, changed: boolean) => {
  if (!text) {
    return
  }

  const previous = spans.at(-1)

  if (previous?.changed === changed) {
    previous.text += text
  } else {
    spans.push({ changed, text })
  }
}

const diffWords = (before: string, after: string) => {
  const oldSpans: IssueDescriptionDiffSpan[] = []
  const newSpans: IssueDescriptionDiffSpan[] = []

  for (const change of diffWordsWithSpace(before, after)) {
    if (!change.added) {
      appendSpan(oldSpans, change.value, change.removed)
    }

    if (!change.removed) {
      appendSpan(newSpans, change.value, change.added)
    }
  }

  return [oldSpans, newSpans] as const
}

export const diffLines = (before: string, after: string): IssueDescriptionDiffLine[] => {
  const oldLines = before ? before.replaceAll('\r\n', '\n').split('\n') : []
  const newLines = after ? after.replaceAll('\r\n', '\n').split('\n') : []
  const result: IssueDescriptionDiffLine[] = []
  let oldIndex = 0
  let newIndex = 0
  let hasUnchangedLines = false

  for (const change of diffArrays(oldLines, newLines)) {
    if (!change.added && !change.removed) {
      oldIndex += change.count
      newIndex += change.count
      hasUnchangedLines ||= result.length > 0
      continue
    }

    if (result.length && hasUnchangedLines) {
      result.push({ kind: 'separator', text: 'unchanged lines' })
    }

    hasUnchangedLines = false

    for (const text of change.value) {
      if (change.removed) {
        result.push({ kind: 'removed', oldLine: ++oldIndex, text })
      } else {
        result.push({ kind: 'added', newLine: ++newIndex, text })
      }
    }
  }

  let removed: IssueDescriptionDiffLine[] = []
  let added: IssueDescriptionDiffLine[] = []

  const highlightChanges = () => {
    for (let index = 0; index < Math.min(removed.length, added.length); index++) {
      const [oldSpans, newSpans] = diffWords(removed[index]!.text, added[index]!.text)
      removed[index]!.spans = oldSpans
      added[index]!.spans = newSpans
    }

    removed = []
    added = []
  }

  for (const line of result) {
    if (line.kind === 'separator') {
      highlightChanges()
    } else if (line.kind === 'removed') {
      removed.push(line)
    } else {
      added.push(line)
    }
  }

  highlightChanges()

  return result
}
