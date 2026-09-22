export type ApiResponse<Data, Error = unknown> =
  | { data: Data; error?: never; response: Response }
  | { data?: never; error: Error; response: Response }

export const isErrorResponse = <Data, Error>(
  response: ApiResponse<Data, Error> | undefined,
): response is { data?: never; error: Error; response: Response } => response?.error !== undefined

export const tryRequest = async <Response>(
  request: () => Promise<Response>,
): Promise<Response | undefined> => {
  try {
    return await request()
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause
    }
    // client throws are local action failures; preserve causes if diagnostics need them.
    return undefined
  }
}
