export type ApiResponse<Data, Error = unknown> =
  | { data: Data; error?: never; response: Response }
  | { data?: never; error: Error; response: Response }

export const isErrorResponse = <Data, Error>(
  response: ApiResponse<Data, Error> | undefined,
): response is { data?: never; error: Error; response: Response } =>
  // A failed response with an empty body (a bare 401 or 404) has no `error` value at all, so the
  // HTTP status decides - otherwise it would look like a success without data.
  response !== undefined && (response.error !== undefined || !response.response.ok)

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
