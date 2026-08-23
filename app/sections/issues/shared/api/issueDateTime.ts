const pad = (value: number) => String(value).padStart(2, '0')

export const toLocalIssueDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const localDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const localTime = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  return `${localDate}T${localTime}`
}

export const toUtcIssueDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  date.setSeconds(0, 0)
  return date.toISOString()
}
