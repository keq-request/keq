// export enum Strategy {
//   STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
//   NETWORK_FIRST = 'network-first',
//   NETWORK_ONLY = 'network-only',
//   CATCH_FIRST = 'cache-first',
// }

import { cacheFirst } from '~/strategies/cache-first.js'
import { networkFirst } from '~/strategies/network-first.js'
import { networkOnly } from '~/strategies/network-only.js'
import { staleWhileRevalidate } from '~/strategies/stale-while-revalidate.js'

export const Strategy = {
  STALE_WHILE_REVALIDATE: staleWhileRevalidate,
  NETWORK_FIRST: networkFirst,
  NETWORK_ONLY: networkOnly,
  CACHE_FIRST: cacheFirst,
}
