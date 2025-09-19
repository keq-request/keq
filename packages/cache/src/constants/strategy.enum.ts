// export enum Strategy {
//   STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
//   NETWORK_FIRST = 'network-first',
//   NETWORK_ONLY = 'network-only',
//   CATCH_FIRST = 'cache-first',
// }

import { cacheFirst } from '~/strategies/cache-first'
import { networkFirst } from '~/strategies/network-first'
import { networkOnly } from '~/strategies/network-only'
import { staleWhileRevalidate } from '~/strategies/stale-while-revalidate'

export const Strategy = {
  STALE_WHILE_REVALIDATE: staleWhileRevalidate,
  NETWORK_FIRST: networkFirst,
  NETWORK_ONLY: networkOnly,
  CATCH_FIRST: cacheFirst,
}
