import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

/** The names of the attributes the issues have values for that the status's board doesn't use - what
 * moving them there would keep or drop (BRD-179). */
export const getUnusedAttributesForStatus = async (
  client: ApiClient,
  { issueKeys, statusId }: { issueKeys: string[]; statusId: string },
): Promise<string[]> => {
  const attributes = await request(
    client.POST('/api/issues/status/unused-attributes', {
      body: { issueKeys, statusId: Number(statusId) },
    }),
  )
  return attributes.map((attribute) => attribute.name)
}
