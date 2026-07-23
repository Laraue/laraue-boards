import type { ActionResult } from './apiResult'
import { getInvalidInputError } from './getInvalidInputError'
import { tryRequest } from './tryRequest'

type ActionResponse<Data> =
  | { data: Data; response: Response }
  | { error: unknown; response: Response }

export const executeAction = async <RawData, Data>({
  map,
  request,
}: {
  map: (data: RawData) => Data | undefined
  request: () => Promise<ActionResponse<RawData> | undefined>
}): Promise<ActionResult<Data>> => {
  const response = await tryRequest(request)

  if (response && 'data' in response) {
    const data = map(response.data)
    if (data !== undefined) {
      return { data, status: 'success' }
    }
    return { code: 0, status: 'error' }
  }
  if (response?.response.status === 400) {
    return { message: getInvalidInputError(response.error).message, status: 'validation-error' }
  }
  return { code: response?.response.status ?? 0, status: 'error' }
}
