import convict from 'convict'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load .env manually first
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath))
  for (const key in envConfig) {
    // ONLY set if not already defined (Docker env vars take priority!)
    if (process.env[key] === undefined) {
      process.env[key] = envConfig[key]
    }
  }
}

const config = convict({
  app: {
    name: {
      doc: 'Name of the service',
      format: String,
      default: 'phachankoun-user-service',
      env: 'APP_NAME'
    }
  },
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'staging', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 8002,
    env: 'PORT'
  },
  log: {
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    }
  },
  db: {
    name: {
      doc: 'Database name',
      format: String,
      default: 'phachankoun',
      env: 'DB_NAME'
    },
    username: {
      doc: 'Database user',
      format: String,
      default: 'postgres',
      env: 'DB_USERNAME'
    },
    password: {
      doc: 'Database password',
      format: '*',
      default: 'postgres',
      env: 'DB_PASSWORD'
    },
    host: {
      doc: 'Database host',
      format: String,
      default: '127.0.0.1',
      env: 'DB_WRITE_HOST'
    },
    port: {
      doc: 'Database port',
      format: 'port',
      default: 5432,
      env: 'DB_PORT'
    },
    poolSize: {
      doc: 'Connection pool size',
      format: 'int',
      default: 10
    },
    poolTimeout: {
      doc: 'Pool timeout in seconds',
      format: 'int',
      default: 30
    }
  },
  redis: {
    host: {
      doc: 'Redis host',
      format: String,
      default: '127.0.0.1',
      env: 'REDIS_DB_HOST'
    },
    port: {
      doc: 'Redis port',
      format: 'port',
      default: 6379,
      env: 'REDIS_DB_PORT'
    },
    password: {
      doc: 'Redis password',
      format: '*',
      default: '',
      env: 'REDIS_DB_PASSWORD'
    }
  },
  jwt: {
    secret: {
      doc: 'JWT secret key',
      format: String,
      default: 'change-me-in-production',
      env: 'JWT_SECRET'
    },
    expiry: {
      doc: 'Access token expiry',
      format: String,
      default: '15m',
      env: 'JWT_EXPIRY'
    },
    refreshExpiry: {
      doc: 'Refresh token expiry',
      format: String,
      default: '7d',
      env: 'JWT_REFRESH_EXPIRY'
    }
  },
  bcrypt: {
    saltRounds: {
      doc: 'Bcrypt salt rounds',
      format: 'int',
      default: 10,
      env: 'BCRYPT_SALT_ROUNDS'
    }
  }
})

// Validate config
config.validate({ allowed: 'strict' })

// Build DATABASE_URL for Prisma
function buildDatabaseUrl() {
  const db = config.get('db')
  return `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}?schema=public&connection_limit=${db.poolSize}&pool_timeout=${db.poolTimeout}`
}

// Set DATABASE_URL for Prisma to use
process.env.DATABASE_URL = buildDatabaseUrl()

export default config