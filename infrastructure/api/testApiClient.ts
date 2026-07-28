import { createApiClient } from '#infrastructure/api/client'

export const TEST_API_BASE_URL = 'https://api.test'

export const createTestApiClient = (
  respond: (request: Request, path: string) => unknown = () => ({}),
) => {
  const requests: Request[] = []
  const client = createApiClient({
    baseUrl: TEST_API_BASE_URL,
    fetch: async (input, init) => {
      const request = input instanceof Request ? input : new Request(input, init)
      requests.push(request)
      const result = respond(request, new URL(request.url).pathname)
      return result instanceof Response ? result : Response.json(result)
    },
  })

  return {
    client,
    paths: () => requests.map((request) => new URL(request.url).pathname),
    requests,
  }
}
