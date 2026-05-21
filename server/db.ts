import { eq, sql } from "drizzle-orm";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { InsertUser, users as mysqlUsers } from "../drizzle/schema";
import * as sqliteSchema from "../drizzle/sqlite-schema";
import { ENV } from './_core/env';
import path from "path";
import { fileURLToPath } from "url";

// ─── Type for unified DB access ──────────────────────────────────────────────
type MysqlDb = ReturnType<typeof drizzleMysql>;
type SqliteDb = ReturnType<typeof drizzleSqlite>;

let _mysqlDb: MysqlDb | null = null;
let _sqliteDb: SqliteDb | null = null;
let _dbMode: "mysql" | "sqlite" | null = null;

// Get the project root for the SQLite file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SQLITE_PATH = path.join(PROJECT_ROOT, "local.db");

/**
 * Initialize SQLite database with all tables.
 * This creates the file on disk so data survives restarts.
 */
function initSqlite(): SqliteDb {
  console.log(`[Database] Using local SQLite database at: ${SQLITE_PATH}`);
  const sqlite = new Database(SQLITE_PATH);
  
  // Enable WAL mode for better concurrent access
  sqlite.pragma("journal_mode = WAL");
  
  // Create all tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT NOT NULL UNIQUE,
      name TEXT,
      email TEXT,
      loginMethod TEXT,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      lastSignedIn TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      source TEXT DEFAULT 'landing',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      eventDate TEXT NOT NULL,
      eventType TEXT NOT NULL CHECK(eventType IN ('interior', 'exterior')),
      hours INTEGER NOT NULL DEFAULT 5,
      people INTEGER NOT NULL,
      address TEXT NOT NULL,
      packageType TEXT NOT NULL DEFAULT 'dj' CHECK(packageType IN ('dj', 'premium')),
      basePrice TEXT NOT NULL,
      extraPeopleCharge TEXT DEFAULT '0',
      extraHoursCharge TEXT DEFAULT '0',
      totalPrice TEXT NOT NULL,
      depositAmount TEXT DEFAULT '1500',
      depositPaid INTEGER DEFAULT 0,
      paymentId TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK(category IN ('cabina', 'mesa_dj', 'accesorio')),
      price TEXT NOT NULL,
      description TEXT,
      dimensions TEXT,
      color TEXT,
      tags TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      amazonLink TEXT,
      deliveryOptions TEXT DEFAULT '{"cdmxFree":false,"cdmxPaid":true,"cdmxPrice":200,"interior":true}',
      stock INTEGER DEFAULT 1,
      active INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderType TEXT NOT NULL CHECK(orderType IN ('product', 'event_deposit')),
      productId INTEGER,
      eventBookingId INTEGER,
      buyerName TEXT NOT NULL,
      buyerEmail TEXT NOT NULL,
      buyerPhone TEXT,
      amount TEXT NOT NULL,
      currency TEXT DEFAULT 'MXN',
      paymentId TEXT,
      paymentStatus TEXT NOT NULL DEFAULT 'pending' CHECK(paymentStatus IN ('pending', 'approved', 'rejected', 'cancelled')),
      deliveryOption TEXT,
      deliveryAddress TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      content TEXT NOT NULL,
      featuredImage TEXT,
      mediaUrl TEXT,
      images TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      published INTEGER NOT NULL DEFAULT 0,
      publishedAt TEXT,
      authorId INTEGER,
      metaTitle TEXT,
      metaDescription TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blocked_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      reason TEXT,
      eventBookingId INTEGER,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  
  return drizzleSqlite(sqlite, { schema: sqliteSchema });
}

/**
 * Returns the database instance.
 * - If DATABASE_URL is set → MySQL (production)
 * - Otherwise → SQLite local file (dev, persistent!)
 */
export async function getDb(): Promise<MysqlDb | SqliteDb> {
  // MySQL (production)
  if (process.env.DATABASE_URL) {
    if (!_mysqlDb) {
      try {
        _mysqlDb = drizzleMysql(process.env.DATABASE_URL);
        _dbMode = "mysql";
        console.log("[Database] Connected to MySQL (production)");
      } catch (error) {
        console.warn("[Database] Failed to connect to MySQL:", error);
      }
    }
    if (_mysqlDb) return _mysqlDb;
  }

  // SQLite (local dev — persistent!)
  if (!_sqliteDb) {
    _sqliteDb = initSqlite();
    _dbMode = "sqlite";
  }
  return _sqliteDb;
}

/**
 * Check which DB mode we're running in
 */
export function getDbMode(): "mysql" | "sqlite" | null {
  return _dbMode;
}

// ─── User helpers ─────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();

  try {
    if (_dbMode === "sqlite") {
      const sqliteDb = db as SqliteDb;
      const existing = sqliteDb
        .select()
        .from(sqliteSchema.users)
        .where(eq(sqliteSchema.users.openId, user.openId))
        .limit(1)
        .get();

      const now = new Date().toISOString();

      if (existing) {
        // Update
        const updateData: Record<string, unknown> = { updatedAt: now, lastSignedIn: now };
        if (user.name !== undefined) updateData.name = user.name ?? null;
        if (user.email !== undefined) updateData.email = user.email ?? null;
        if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod ?? null;
        if (user.role !== undefined) updateData.role = user.role;
        else if (user.openId === ENV.ownerOpenId) updateData.role = "admin";
        
        sqliteDb
          .update(sqliteSchema.users)
          .set(updateData)
          .where(eq(sqliteSchema.users.openId, user.openId))
          .run();
      } else {
        // Insert
        const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
        sqliteDb
          .insert(sqliteSchema.users)
          .values({
            openId: user.openId,
            name: user.name ?? null,
            email: user.email ?? null,
            loginMethod: user.loginMethod ?? null,
            role,
            lastSignedIn: user.lastSignedIn?.toISOString?.() ?? now,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }
    } else {
      // MySQL path (unchanged)
      const mysqlDb = db as MysqlDb;
      const { users } = await import("../drizzle/schema");
      
      const values: InsertUser = { openId: user.openId };
      const updateSet: Record<string, unknown> = {};

      const textFields = ["name", "email", "loginMethod"] as const;
      type TextField = (typeof textFields)[number];

      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      };

      textFields.forEach(assignNullable);

      if (user.lastSignedIn !== undefined) {
        values.lastSignedIn = user.lastSignedIn;
        updateSet.lastSignedIn = user.lastSignedIn;
      }
      if (user.role !== undefined) {
        values.role = user.role;
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        values.role = 'admin';
        updateSet.role = 'admin';
      }

      if (!values.lastSignedIn) {
        values.lastSignedIn = new Date();
      }

      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }

      await mysqlDb.insert(users).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();

  if (_dbMode === "sqlite") {
    const sqliteDb = db as SqliteDb;
    return sqliteDb
      .select()
      .from(sqliteSchema.users)
      .where(eq(sqliteSchema.users.openId, openId))
      .limit(1)
      .get() ?? undefined;
  }

  const mysqlDb = db as MysqlDb;
  const { users } = await import("../drizzle/schema");
  const result = await mysqlDb.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
