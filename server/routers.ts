import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb, getDbMode } from "./db";
import * as mysqlSchema from "../drizzle/schema";
import * as sqliteSchema from "../drizzle/sqlite-schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import slugify from "slugify";

// ─── Schema helper ────────────────────────────────────────────────────────────
// Returns the correct table references depending on the DB mode
function getSchema() {
  const mode = getDbMode();
  if (mode === "sqlite") return sqliteSchema;
  return mysqlSchema;
}

// ─── Sanitize helpers ─────────────────────────────────────────────────────────
function sanitizeText(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers for server-side safety
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acceso restringido a administradores" });
  }
  return next({ ctx });
});

// ─── Leads Router ─────────────────────────────────────────────────────────────
const leadsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/),
        phone: z.string().min(10).max(15).regex(/^[0-9+\-\s()]+$/),
        email: z.string().email().max(320).toLowerCase(),
        source: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const sanitized = {
        name: sanitizeText(input.name),
        phone: sanitizeText(input.phone),
        email: sanitizeText(input.email),
        source: input.source ?? "landing",
      };

      await (db as any).insert(s.leads).values(sanitized);

      // Notify owner
      await notifyOwner({
        title: "Nuevo lead recibido",
        content: `Nombre: ${sanitized.name}\nTeléfono: ${sanitized.phone}\nCorreo: ${sanitized.email}`,
      }).catch(() => { });
      return { success: true };
    }),

  list: adminProcedure.query(async () => {
    const db = await getDb();
    const s = getSchema();
    return (db as any).select().from(s.leads).orderBy(desc(s.leads.createdAt));
  }),
});

// ─── Events Router ────────────────────────────────────────────────────────────
const eventsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(200),
        phone: z.string().min(10).max(20).regex(/^[0-9+\-\s()]+$/),
        email: z.string().email().max(320).toLowerCase(),
        eventDate: z.string().datetime(),
        eventType: z.enum(["interior", "exterior"]),
        hours: z.number().int().min(5).max(24),
        people: z.number().int().min(10).max(5000),
        address: z.string().min(5).max(500),
        packageType: z.enum(["dj", "premium"]),
        notes: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const mode = getDbMode();

      // Price calculation
      const basePrice = input.packageType === "premium" ? 7500 : 5500;
      const extraHours = Math.max(0, input.hours - 5);
      const extraHoursCharge = extraHours * 1200;

      let extraPeopleCharge = 0;
      if (input.people > 300) extraPeopleCharge = 7500;
      else if (input.people > 200) extraPeopleCharge = 5500;
      else if (input.people > 100) extraPeopleCharge = 3000;

      const totalPrice = basePrice + extraHoursCharge + extraPeopleCharge;

      const sanitized = {
        name: sanitizeText(input.name),
        phone: sanitizeText(input.phone),
        email: sanitizeText(input.email),
        eventDate: mode === "sqlite" ? input.eventDate : new Date(input.eventDate),
        eventType: input.eventType,
        hours: input.hours,
        people: input.people,
        address: sanitizeText(input.address),
        packageType: input.packageType,
        basePrice: basePrice.toString(),
        extraPeopleCharge: extraPeopleCharge.toString(),
        extraHoursCharge: extraHoursCharge.toString(),
        totalPrice: totalPrice.toString(),
        depositAmount: "1500",
        notes: input.notes ? sanitizeText(input.notes) : null,
      };

      if (mode === "sqlite") {
        const result = (db as any).insert(s.eventBookings).values(sanitized).returning({ id: s.eventBookings.id }).get();
        const bookingId = result.id;

        await notifyOwner({
          title: "Nueva solicitud de evento",
          content: `Cliente: ${sanitized.name}\nFecha: ${input.eventDate}\nPaquete: ${sanitized.packageType.toUpperCase()}\nPersonas: ${sanitized.people}\nTotal estimado: $${totalPrice.toLocaleString("es-MX")}`,
        }).catch(() => { });

        return { success: true, bookingId, totalPrice, depositAmount: 1500 };
      } else {
        const [result] = await (db as any).insert(s.eventBookings).values(sanitized).$returningId();
        const bookingId = result.id;

        await notifyOwner({
          title: "Nueva solicitud de evento",
          content: `Cliente: ${sanitized.name}\nFecha: ${(sanitized.eventDate as Date).toLocaleDateString("es-MX")}\nPaquete: ${sanitized.packageType.toUpperCase()}\nPersonas: ${sanitized.people}\nTotal estimado: $${totalPrice.toLocaleString("es-MX")}`,
        }).catch(() => { });

        return { success: true, bookingId, totalPrice, depositAmount: 1500 };
      }
    }),

  list: adminProcedure.query(async () => {
    const db = await getDb();
    const s = getSchema();
    return (db as any).select().from(s.eventBookings).orderBy(desc(s.eventBookings.createdAt));
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    const s = getSchema();
    const mode = getDbMode();
    if (mode === "sqlite") {
      return (db as any).select().from(s.eventBookings).where(eq(s.eventBookings.id, input.id)).limit(1).get() ?? null;
    }
    const result = await (db as any).select().from(s.eventBookings).where(eq(s.eventBookings.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      await (db as any).update(s.eventBookings).set({ status: input.status }).where(eq(s.eventBookings.id, input.id));
      return { success: true };
    }),

  getBlockedDates: publicProcedure.query(async () => {
    const db = await getDb();
    const s = getSchema();
    return (db as any).select().from(s.blockedDates);
  }),

  blockDate: adminProcedure
    .input(z.object({ date: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const mode = getDbMode();

      if (mode === "sqlite") {
        // SQLite: INSERT OR REPLACE
        const existing = (db as any).select().from(s.blockedDates).where(eq(s.blockedDates.date, input.date)).limit(1).get();
        if (existing) {
          (db as any).update(s.blockedDates).set({ reason: input.reason }).where(eq(s.blockedDates.date, input.date)).run();
        } else {
          (db as any).insert(s.blockedDates).values({ date: input.date, reason: input.reason }).run();
        }
      } else {
        await (db as any).insert(s.blockedDates).values({ date: input.date, reason: input.reason }).onDuplicateKeyUpdate({ set: { reason: input.reason } });
      }
      return { success: true };
    }),
});

// ─── Products Router ──────────────────────────────────────────────────────────
const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.enum(["cabina", "mesa_dj", "accesorio"]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const conditions = [eq(s.products.active, true)];
      if (input?.category) conditions.push(eq(s.products.category, input.category) as any);
      return (db as any)
        .select()
        .from(s.products)
        .where(and(...conditions))
        .orderBy(desc(s.products.createdAt));
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    const s = getSchema();
    const mode = getDbMode();
    if (mode === "sqlite") {
      return (db as any).select().from(s.products).where(eq(s.products.slug, input.slug)).limit(1).get() ?? null;
    }
    const result = await (db as any).select().from(s.products).where(eq(s.products.slug, input.slug)).limit(1);
    return result[0] ?? null;
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    const s = getSchema();
    const mode = getDbMode();
    if (mode === "sqlite") {
      return (db as any).select().from(s.products).where(eq(s.products.id, input.id)).limit(1).get() ?? null;
    }
    const result = await (db as any).select().from(s.products).where(eq(s.products.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(300),
        category: z.enum(["cabina", "mesa_dj", "accesorio"]),
        price: z.number().positive(),
        description: z.string().max(5000).optional(),
        dimensions: z.string().max(200).optional(),
        color: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
        amazonLink: z.string().url().optional().or(z.literal("")),
        deliveryOptions: z.object({
          cdmxFree: z.boolean(),
          cdmxPaid: z.boolean(),
          cdmxPrice: z.number(),
          interior: z.boolean(),
        }).optional(),
        stock: z.number().int().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const slug = slugify(input.name, { lower: true, strict: true });
      await (db as any).insert(s.products).values({
        name: sanitizeText(input.name),
        slug,
        category: input.category,
        price: input.price.toString(),
        description: input.description ? sanitizeText(input.description) : null,
        dimensions: input.dimensions ?? null,
        color: input.color ?? null,
        tags: input.tags ?? [],
        images: input.images ?? [],
        amazonLink: input.amazonLink || null,
        deliveryOptions: input.deliveryOptions ?? { cdmxFree: false, cdmxPaid: true, cdmxPrice: 200, interior: true },
        stock: input.stock ?? 1,
      });
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2).max(300).optional(),
        price: z.number().positive().optional(),
        description: z.string().max(5000).optional(),
        dimensions: z.string().max(200).optional(),
        color: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
        amazonLink: z.string().url().optional().or(z.literal("")),
        deliveryOptions: z.object({
          cdmxFree: z.boolean(),
          cdmxPaid: z.boolean(),
          cdmxPrice: z.number(),
          interior: z.boolean(),
        }).optional(),
        stock: z.number().int().min(0).optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const { id, price, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (price !== undefined) updateData.price = price.toString();
      if (rest.name) updateData.name = sanitizeText(rest.name);
      await (db as any).update(s.products).set(updateData).where(eq(s.products.id, id));
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    const s = getSchema();
    await (db as any).update(s.products).set({ active: false }).where(eq(s.products.id, input.id));
    return { success: true };
  }),
});

// ─── Orders Router ────────────────────────────────────────────────────────────
const ordersRouter = router({
  create: publicProcedure
    .input(
      z.object({
        orderType: z.enum(["product", "event_deposit"]),
        productId: z.number().optional(),
        eventBookingId: z.number().optional(),
        buyerName: z.string().min(2).max(200),
        buyerEmail: z.string().email().max(320),
        buyerPhone: z.string().max(20).optional(),
        amount: z.number().positive(),
        deliveryOption: z.string().max(100).optional(),
        deliveryAddress: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const mode = getDbMode();
      const sanitized = {
        ...input,
        amount: input.amount.toString(),
        buyerName: sanitizeText(input.buyerName),
        buyerEmail: sanitizeText(input.buyerEmail),
        buyerPhone: input.buyerPhone ? sanitizeText(input.buyerPhone) : null,
      };

      if (mode === "sqlite") {
        const result = (db as any).insert(s.orders).values(sanitized).returning({ id: s.orders.id }).get();
        return { success: true, orderId: result.id };
      } else {
        const [result] = await (db as any).insert(s.orders).values(sanitized).$returningId();
        return { success: true, orderId: result.id };
      }
    }),

  updatePayment: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentId: z.string(),
        paymentStatus: z.enum(["pending", "approved", "rejected", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const mode = getDbMode();

      await (db as any).update(s.orders).set({
        paymentId: input.paymentId,
        paymentStatus: input.paymentStatus,
      }).where(eq(s.orders.id, input.orderId));

      // If event deposit approved, mark booking as confirmed
      if (input.paymentStatus === "approved") {
        if (mode === "sqlite") {
          const order = (db as any).select().from(s.orders).where(eq(s.orders.id, input.orderId)).limit(1).get();
          if (order?.orderType === "event_deposit" && order.eventBookingId) {
            (db as any).update(s.eventBookings).set({ depositPaid: true, status: "confirmed" })
              .where(eq(s.eventBookings.id, order.eventBookingId)).run();
          }
        } else {
          const order = await (db as any).select().from(s.orders).where(eq(s.orders.id, input.orderId)).limit(1);
          if (order[0]?.orderType === "event_deposit" && order[0].eventBookingId) {
            await (db as any).update(s.eventBookings).set({ depositPaid: true, status: "confirmed" })
              .where(eq(s.eventBookings.id, order[0].eventBookingId));
          }
        }
      }
      return { success: true };
    }),

  list: adminProcedure.query(async () => {
    const db = await getDb();
    const s = getSchema();
    return (db as any).select().from(s.orders).orderBy(desc(s.orders.createdAt));
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    const s = getSchema();
    const mode = getDbMode();
    if (mode === "sqlite") {
      return (db as any).select().from(s.orders).where(eq(s.orders.id, input.id)).limit(1).get() ?? null;
    }
    const result = await (db as any).select().from(s.orders).where(eq(s.orders.id, input.id)).limit(1);
    return result[0] ?? null;
  }),
});

// ─── Blog Router ──────────────────────────────────────────────────────────────
const blogRouter = router({
  list: publicProcedure
    .input(z.object({ published: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const conditions = [];
      if (input?.published !== undefined) {
        conditions.push(eq(s.blogPosts.published, input.published));
      } else {
        // Sin filtro: mostrar todos (para el admin)
      }
      return (db as any).select().from(s.blogPosts).where(and(...conditions)).orderBy(desc(s.blogPosts.publishedAt));
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    const s = getSchema();
    const mode = getDbMode();
    if (mode === "sqlite") {
      return (db as any).select().from(s.blogPosts).where(eq(s.blogPosts.slug, input.slug)).limit(1).get() ?? null;
    }
    const result = await (db as any).select().from(s.blogPosts).where(eq(s.blogPosts.slug, input.slug)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3).max(500),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(10),
        featuredImage: z.string().url().optional().or(z.literal("")),
        mediaUrl: z.string().url().optional().or(z.literal("")),
        images: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().default(false),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const s = getSchema();
      const mode = getDbMode();
      const slug = slugify(input.title, { lower: true, strict: true });
      const sanitizedContent = sanitizeHtml(input.content);
      const now = new Date().toISOString();

      const newPost = {
        title: sanitizeText(input.title),
        slug,
        excerpt: input.excerpt ? sanitizeText(input.excerpt) : null,
        content: sanitizedContent,
        featuredImage: input.featuredImage || null,
        mediaUrl: input.mediaUrl || null,
        images: input.images ?? [],
        tags: input.tags ?? [],
        published: input.published,
        publishedAt: input.published ? (mode === "sqlite" ? now : new Date()) : null,
        authorId: ctx.user.id,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
      };

      await (db as any).insert(s.blogPosts).values(newPost);
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).max(500).optional(),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(10).optional(),
        featuredImage: z.string().url().optional().or(z.literal("")),
        mediaUrl: z.string().url().optional().or(z.literal("")),
        images: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const s = getSchema();
      const mode = getDbMode();
      const { id, content, title, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (title) updateData.title = sanitizeText(title);
      if (content) updateData.content = sanitizeHtml(content);
      if (rest.published) updateData.publishedAt = mode === "sqlite" ? new Date().toISOString() : new Date();

      await (db as any).update(s.blogPosts).set(updateData).where(eq(s.blogPosts.id, id));
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    const s = getSchema();
    await (db as any).delete(s.blogPosts).where(eq(s.blogPosts.id, input.id));
    return { success: true };
  }),
});

// ─── Upload Router ────────────────────────────────────────────────────────────
const uploadRouter = router({
  getUploadUrl: adminProcedure
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("./storage");
      const key = `uploads/${Date.now()}-${input.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      // Return the key for the frontend to use after upload
      return { key, uploadPath: `/api/upload?key=${encodeURIComponent(key)}` };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  leads: leadsRouter,
  events: eventsRouter,
  products: productsRouter,
  orders: ordersRouter,
  blog: blogRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
