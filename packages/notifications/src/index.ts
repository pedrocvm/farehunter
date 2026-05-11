import { logger } from '@farehunter/core'
import type { Flight } from '@farehunter/core'

export interface NotificationChannel {
  name: string
  send(message: string, flight: Flight): Promise<void>
}

export class ConsoleNotificationChannel implements NotificationChannel {
  readonly name = 'console'

  async send(message: string, flight: Flight): Promise<void> {
    logger.info({ flight }, message)
  }
}
