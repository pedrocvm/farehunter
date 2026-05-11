export type AdapterErrorCode =
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'NETWORK_ERROR'
  | 'BLOCKED'
  | 'UNKNOWN'

export class AdapterError extends Error {
  readonly adapterName: string
  readonly code: AdapterErrorCode
  override readonly cause: Error | undefined

  constructor(message: string, adapterName: string, code: AdapterErrorCode, cause?: Error) {
    super(message)
    this.name = 'AdapterError'
    this.adapterName = adapterName
    this.code = code
    this.cause = cause
  }

  isRetryable(): boolean {
    return this.code === 'RATE_LIMITED' || this.code === 'TIMEOUT' || this.code === 'NETWORK_ERROR'
  }
}
