import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

const dbPath = process.env.DATABASE_URL || "/media/mchmb00e/USB_APP/app_commons/database.db"
const sqlite = new Database(dbPath)

export const db = drizzle(sqlite)