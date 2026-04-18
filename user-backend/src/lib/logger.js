import pino from 'pino'
import config from '@/src/configs/app.config.js'

const isDev = config.get('env') === 'development'
const isTest = config.get('env') === 'test'

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'authorization', 'cookie']

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(sanitize)

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
      result[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitize(value)
    } else {
      result[key] = value
    }
  }
  return result
}

const logger = pino({
  level: isTest ? 'silent' : config.get('log.level'),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label }
    },
    log(object) {
      return sanitize(object)
    },
  },
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty', // Keep this simple, installing pino-pretty fixes it
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
})

export default logger