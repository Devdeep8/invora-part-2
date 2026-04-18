import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { defineConfig } from "prisma/config";

// Load .env (same logic as app.config.js)
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath))
  for (const key in envConfig) {
    if (process.env[key] === undefined) {
      process.env[key] = envConfig[key]
    }
  }
}

// Build DATABASE_URL dynamically
const dbHost = process.env.DB_WRITE_HOST || '127.0.0.1'
const dbPort = process.env.DB_PORT || '5432'
const dbUser = process.env.DB_USERNAME || 'postgres'
const dbPass = process.env.DB_PASSWORD || 'postgres'
const dbName = process.env.DB_NAME || 'invoiceso_db' // Updated default to match your .env

const databaseUrl = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?schema=public&connection_limit=10&pool_timeout=30`

export default defineConfig({
  // UPDATED PATHS to match src/prisma/
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});