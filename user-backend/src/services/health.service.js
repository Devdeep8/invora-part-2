import { BaseService } from '@/src/lib/base.service.js'
import config from '@/src/configs/app.config.js'

export class HealthService extends BaseService {
  async run() {
    let dbStatus = 'disconnected'
    let dbLatency = null
    let dbError = null

    try {
      const start = Date.now()
      
      // Prisma 7 adapter safe check (avoid $queryRaw issues)
      await this.db.user.findFirst()
      
      dbLatency = Date.now() - start
      dbStatus = 'connected'
    } catch (error) {
      this.logger.error('Health check DB failed', { 
        errorMessage: error?.message,
        errorCode: error?.code,
      })
      dbError = error?.message || 'Unknown error'
    }

    const isHealthy = dbStatus === 'connected'

    return {
      status: isHealthy ? 'ok' : 'error',
      service: config.get('app.name'),
      env: config.get('env'),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
          latency: dbLatency ? `${dbLatency}ms` : null,
          error: dbError,
        },
      },
    }
  }
}

export default HealthService