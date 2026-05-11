import { logger } from '@farehunter/core'
import type {
  AirlineAdapter,
  AdapterHealthResult,
  FlightSearchInput,
  NormalizedFareResult,
} from '@farehunter/core'

export class AdapterRegistry {
  private readonly adapters = new Map<string, AirlineAdapter>()

  register(adapter: AirlineAdapter): void {
    this.adapters.set(adapter.name, adapter)
    logger.debug({ name: adapter.name }, 'AdapterRegistry: registered')
  }

  unregister(name: string): boolean {
    const removed = this.adapters.delete(name)
    if (removed) logger.debug({ name }, 'AdapterRegistry: unregistered')
    return removed
  }

  get(name: string): AirlineAdapter | undefined {
    return this.adapters.get(name)
  }

  getAll(): AirlineAdapter[] {
    return [...this.adapters.values()]
  }

  has(name: string): boolean {
    return this.adapters.has(name)
  }

  count(): number {
    return this.adapters.size
  }

  async searchAll(
    input: FlightSearchInput,
  ): Promise<Map<string, NormalizedFareResult[]>> {
    const results = new Map<string, NormalizedFareResult[]>()

    await Promise.all(
      this.getAll().map(async (adapter) => {
        try {
          const fares = await adapter.search(input)
          results.set(adapter.name, fares)
          logger.debug({ name: adapter.name, count: fares.length }, 'AdapterRegistry: search done')
        } catch (err) {
          logger.error({ name: adapter.name, err }, 'AdapterRegistry: search failed')
          results.set(adapter.name, [])
        }
      }),
    )

    return results
  }

  async healthCheckAll(): Promise<Map<string, AdapterHealthResult>> {
    const results = new Map<string, AdapterHealthResult>()

    await Promise.all(
      this.getAll().map(async (adapter) => {
        try {
          const health = await adapter.healthCheck()
          results.set(adapter.name, health)
        } catch (err) {
          const error = err instanceof Error ? err.message : 'Unknown error'
          results.set(adapter.name, { isHealthy: false, error })
        }
      }),
    )

    return results
  }
}
