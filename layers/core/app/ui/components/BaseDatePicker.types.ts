export type BaseDatePickerLabels = {
  chooseMonth: string
  nextMonth: string
  nextYear: string
  nextYears: string
  openCalendar: string
  previousMonth: string
  previousYear: string
  previousYears: string
}

export type BaseDatePickerProps = {
  ariaLabelledby?: string
  disabled?: boolean
  labels: BaseDatePickerLabels
  locale: string
  max?: string
  min?: string
  withTime?: boolean
}
