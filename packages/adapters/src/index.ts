export { MockAirlineAdapter, MockAdapterFactory, generateFares, findRouteProfile } from './mock/index.js'
export type { RouteProfile, AirlineProfile } from './mock/index.js'

export { AdapterRegistry } from './registry.js'
export { AdapterError } from './errors.js'
export type { AdapterErrorCode } from './errors.js'

export { FlightSearchInputSchema } from './types.js'
export type { AirlineAdapter, AdapterHealthResult, FlightSearchInput, NormalizedFareResult } from './types.js'
