export type IssueAttributeLabel = {
  color: string
  // Dates and date-times come in ISO 8601.
  kind: 'date' | 'dateTime' | 'text'
  name: string
  value: string
}
