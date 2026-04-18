import Redis from 'ioredis'
import config from '@/src/configs/app.config.js'

const redis = new Redis({
  host: config.get('redis.host'),
  port: config.get('redis.port'),
  // If password is empty (local dev without pass), ioredis needs undefined, not empty string
  password: config.get('redis.password') || undefined, 
  maxRetriesPerRequest: 3
})

redis.on('connect', () => console.log('✅ Redis connected'))
redis.on('error', (err) => console.error('❌ Redis Error:', err.message))

export default redis