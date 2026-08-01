import diffSequencesModule from 'diff-sequences'

import type {
  IssueDescriptionDiffLine,
  IssueDescriptionDiffSpan,
} from '../../IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.types'

const diffSequences =
  (diffSequencesModule as typeof diffSequencesModule & { default?: typeof diffSequencesModule })
    .default ?? diffSequencesModule

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
  const oldWords = before.match(/[\p{L}\p{N}_]+|\s+|[^\s\p{L}\p{N}_]+/gu) ?? []
  const newWords = after.match(/[\p{L}\p{N}_]+|\s+|[^\s\p{L}\p{N}_]+/gu) ?? []
  const oldSpans: IssueDescriptionDiffSpan[] = []
  const newSpans: IssueDescriptionDiffSpan[] = []
  let oldIndex = 0
  let newIndex = 0

  const appendChanges = (oldEnd: number, newEnd: number) => {
    appendSpan(oldSpans, oldWords.slice(oldIndex, oldEnd).join(''), true)
    appendSpan(newSpans, newWords.slice(newIndex, newEnd).join(''), true)
    oldIndex = oldEnd
    newIndex = newEnd
  }

  diffSequences(
    oldWords.length,
    newWords.length,
    (oldWord, newWord) => oldWords[oldWord] === newWords[newWord],
    (length, oldCommon, newCommon) => {
      appendChanges(oldCommon, newCommon)
      appendSpan(oldSpans, oldWords.slice(oldIndex, oldIndex + length).join(''), false)
      appendSpan(newSpans, newWords.slice(newIndex, newIndex + length).join(''), false)
      oldIndex += length
      newIndex += length
    },
  )

  appendChanges(oldWords.length, newWords.length)

  return [oldSpans, newSpans] as const
}

export const diffLines = (before: string, after: string): IssueDescriptionDiffLine[] => {
  const oldLines = before ? before.replaceAll('\r\n', '\n').split('\n') : []
  const newLines = after ? after.replaceAll('\r\n', '\n').split('\n') : []
  const result: IssueDescriptionDiffLine[] = []
  let oldIndex = 0
  let newIndex = 0
  let hasUnchangedLines = false

  const appendChanges = (oldEnd: number, newEnd: number) => {
    if (oldIndex === oldEnd && newIndex === newEnd) {
      return
    }

    if (result.length && hasUnchangedLines) {
      result.push({ kind: 'separator', text: 'unchanged lines' })
    }

    for (; oldIndex < oldEnd; oldIndex++) {
      result.push({ kind: 'removed', oldLine: oldIndex + 1, text: oldLines[oldIndex]! })
    }

    for (; newIndex < newEnd; newIndex++) {
      result.push({ kind: 'added', newLine: newIndex + 1, text: newLines[newIndex]! })
    }

    hasUnchangedLines = false
  }

  diffSequences(
    oldLines.length,
    newLines.length,
    (oldLine, newLine) => oldLines[oldLine] === newLines[newLine],
    (length, oldCommon, newCommon) => {
      appendChanges(oldCommon, newCommon)
      oldIndex += length
      newIndex += length
      hasUnchangedLines ||= result.length > 0 && length > 0
    },
  )

  appendChanges(oldLines.length, newLines.length)

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
