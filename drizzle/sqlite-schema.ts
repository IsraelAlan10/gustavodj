import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
  lastSignedIn: text("lastSignedIn").notNull().$defaultFn(() => new Date().toISOString()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  source: text("source").default("landing"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Event Bookings ───────────────────────────────────────────────────────────
export const eventBookings = sqliteTable("event_bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  eventDate: text("eventDate").notNull(),
  eventType: text("eventType", { enum: ["interior", "exterior"] }).notNull(),
  hours: integer("hours").notNull().default(5),
  people: integer("people").notNull(),
  address: text("address").notNull(),
  packageType: text("packageType", { enum: ["dj", "premium"] }).notNull().default("dj"),
  basePrice: text("basePrice").notNull(),
  extraPeopleCharge: text("extraPeopleCharge").default("0"),
  extraHoursCharge: text("extraHoursCharge").default("0"),
  totalPrice: text("totalPrice").notNull(),
  depositAmount: text("depositAmount").default("1500"),
  depositPaid: integer("depositPaid", { mode: "boolean" }).default(false),
  paymentId: text("paymentId"),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] }).default("pending").notNull(),
  notes: text("notes"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type EventBooking = typeof eventBookings.$inferSelect;
export type InsertEventBooking = typeof eventBookings.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category", { enum: ["cabina", "mesa_dj", "accesorio"] }).notNull(),
  price: text("price").notNull(),
  description: text("description"),
  dimensions: text("dimensions"),
  color: text("color"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  images: text("images", { mode: "json" }).$type<string[]>().default([]),
  amazonLink: text("amazonLink"),
  deliveryOptions: text("deliveryOptions", { mode: "json" }).$type<{
    cdmxFree: boolean;
    cdmxPaid: boolean;
    cdmxPrice: number;
    interior: boolean;
  }>().default({ cdmxFree: false, cdmxPaid: true, cdmxPrice: 200, interior: true }),
  stock: integer("stock").default(1),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderType: text("orderType", { enum: ["product", "event_deposit"] }).notNull(),
  productId: integer("productId"),
  eventBookingId: integer("eventBookingId"),
  buyerName: text("buyerName").notNull(),
  buyerEmail: text("buyerEmail").notNull(),
  buyerPhone: text("buyerPhone"),
  amount: text("amount").notNull(),
  currency: text("currency").default("MXN"),
  paymentId: text("paymentId"),
  paymentStatus: text("paymentStatus", { enum: ["pending", "approved", "rejected", "cancelled"] }).default("pending").notNull(),
  deliveryOption: text("deliveryOption"),
  deliveryAddress: text("deliveryAddress"),
  notes: text("notes"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featuredImage"),
  mediaUrl: text("mediaUrl"),
  images: text("images", { mode: "json" }).$type<string[]>().default([]),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  published: integer("published", { mode: "boolean" }).default(false).notNull(),
  publishedAt: text("publishedAt"),
  authorId: integer("authorId"),
  metaTitle: text("metaTitle"),
  metaDescription: text("metaDescription"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ─── Blocked Dates (Calendar) ─────────────────────────────────────────────────
export const blockedDates = sqliteTable("blocked_dates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  reason: text("reason"),
  eventBookingId: integer("eventBookingId"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type BlockedDate = typeof blockedDates.$inferSelect;
export type InsertBlockedDate = typeof blockedDates.$inferInsert;
