import type { Space } from './types'
import { mockSpaces } from './mock/spaces'

export const spaces: Space[] = mockSpaces

export function getSpaceById(id: string): Space | undefined {
  return spaces.find((s) => s.id === id)
}
