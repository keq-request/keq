import { KeqContext, KeqSharedContext } from 'keq'
import { CacheEntry } from '~/cache-entry'
import { StrategyOptions } from '~/types/strategies-options'


export async function cacheContext(opts: StrategyOptions, context: KeqContext | KeqSharedContext): Promise<CacheEntry | undefined> {
  if (!context.response) return
  if (opts.exclude && (await opts.exclude(context.response))) return

  const key = opts.key
  const storage = opts.storage

  const entry = await CacheEntry.build({
    key: key,
    response: context.response,
    ttl: opts.ttl,
  })
  storage.set(entry)

  return entry
}
