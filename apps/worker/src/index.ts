import { Worker } from 'bullmq'
import { env } from '@farehunter/config'
import { logger } from '@farehunter/core'

const connection = { url: env.REDIS_URL }

const worker = new Worker(
  'fare-scan',
  (job) => {
    logger.info({ jobId: job.id, name: job.name }, 'Processing job')
    return Promise.resolve()
  },
  { connection },
)

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed')
})

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Job failed')
})

logger.info('Worker started, listening on queue: fare-scan')
