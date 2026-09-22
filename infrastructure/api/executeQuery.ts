import type { QueryResult } from './apiResult'
import { isErrorResponse, tryRequest, type ApiResponse } from './tryRequest'

type QueryResponse<Data> = ApiResponse<Data>

export const executeQuery = async <RawData, Data>({
  map,
  request,
}: {
  map: (data: RawData) => Data | undefined
  request: () => Promise<QueryResponse<RawData> | undefined>
}): Promise<QueryResult<Data>> => {
  const response = await tryRequest(request)

  if (!response) {
    return { code: 0, status: 'error' }
  }
  if (isErrorResponse(response)) {
    return { code: response.response.status, status: 'error' }
  }
  const data = map(response.data)
  return data === undefined ? { code: 404, status: 'error' } : { data, status: 'success' }
}
