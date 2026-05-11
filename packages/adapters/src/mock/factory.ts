import { MockAirlineAdapter } from './adapter.js'

export class MockAdapterFactory {
  static create(name = 'mock'): MockAirlineAdapter {
    return new MockAirlineAdapter(name)
  }

  static createNamed(names: string[]): MockAirlineAdapter[] {
    return names.map((n) => new MockAirlineAdapter(n))
  }
}
