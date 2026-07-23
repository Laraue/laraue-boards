const ERROR_MESSAGES: Record<number, string> = {
  401: 'Sign in to continue.',
  403: 'You do not have permission to do this.',
  404: 'Not found.',
  409: 'This conflicts with existing data.',
  429: 'Too many requests. Try again shortly.',
  500: 'Server error. Try again.',
}

export const getErrorMessage = (code: number): string =>
  ERROR_MESSAGES[code] ?? 'Could not complete the request.'
