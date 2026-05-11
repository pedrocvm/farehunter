import { logger } from '@farehunter/core'
import type { NormalizedFareResult } from '@farehunter/core'

export interface NotificationChannel {
  name: string
  send(message: string, fare: NormalizedFareResult): Promise<void>
}

export class ConsoleNotificationChannel implements NotificationChannel {
  readonly name = 'console'

  send(message: string, fare: NormalizedFareResult): Promise<void> {
    logger.info({ fare }, message)
    return Promise.resolve()
  }
}
