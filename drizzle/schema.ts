import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  source: varchar("source", { length: 100 }).default("landing"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Event Bookings ───────────────────────────────────────────────────────────
export const eventBookings = mysqlTable("event_bookings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  eventType: mysqlEnum("eventType", ["interior", "exterior"]).notNull(),
  hours: int("hours").notNull().default(5),
  people: int("people").notNull(),
  address: text("address").notNull(),
  packageType: mysqlEnum("packageType", ["dj", "premium"]).notNull().default("dj"),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  extraPeopleCharge: decimal("extraPeopleCharge", { precision: 10, scale: 2 }).default("0"),
  extraHoursCharge: decimal("extraHoursCharge", { precision: 10, scale: 2 }).default("0"),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }).default("1500"),
  depositPaid: boolean("depositPaid").default(false),
  paymentId: varchar("paymentId", { length: 200 }),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventBooking = typeof eventBookings.$inferSelect;
export type InsertEventBooking = typeof eventBookings.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  category: mysqlEnum("category", ["cabina", "mesa_dj", "accesorio"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  dimensions: varchar("dimensions", { length: 200 }),
  color: varchar("color", { length: 100 }),
  tags: json("tags").$type<string[]>().default([]),
  images: json("images").$type<string[]>().default([]),
  amazonLink: varchar("amazonLink", { length: 1000 }),
  deliveryOptions: json("deliveryOptions").$type<{
    cdmxFree: boolean;
    cdmxPaid: boolean;
    cdmxPrice: number;
    interior: boolean;
  }>().default({ cdmxFree: false, cdmxPaid: true, cdmxPrice: 200, interior: true }),
  stock: int("stock").default(1),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderType: mysqlEnum("orderType", ["product", "event_deposit"]).notNull(),
  productId: int("productId"),
  eventBookingId: int("eventBookingId"),
  buyerName: varchar("buyerName", { length: 200 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  buyerPhone: varchar("buyerPhone", { length: 20 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("MXN"),
  paymentId: varchar("paymentId", { length: 200 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  deliveryOption: varchar("deliveryOption", { length: 100 }),
  deliveryAddress: text("deliveryAddress"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: varchar("featuredImage", { length: 1000 }),
  images: json("images").$type<string[]>().default([]),
  tags: json("tags").$type<string[]>().default([]),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  authorId: int("authorId"),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: varchar("metaDescription", { length: 300 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ─── Blocked Dates (Calendar) ─────────────────────────────────────────────────
export const blockedDates = mysqlTable("blocked_dates", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD
  reason: varchar("reason", { length: 200 }),
  eventBookingId: int("eventBookingId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlockedDate = typeof blockedDates.$inferSelect;
export type InsertBlockedDate = typeof blockedDates.$inferInsert;
