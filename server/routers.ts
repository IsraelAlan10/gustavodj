import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import {
  leads,
  eventBookings,
  products,
  orders,
  blogPosts,
  blockedDates,
} from "../drizzle/schema";
import { eq, desc, and, like, inArray } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import slugify from "slugify";


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
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const sanitized = {
        name: sanitizeText(input.name),
        phone: sanitizeText(input.phone),
        email: sanitizeText(input.email),
        source: input.source ?? "landing",
      };
      await db.insert(leads).values(sanitized);
      // Notify owner
      await notifyOwner({
        title: "Nuevo lead recibido",
        content: `Nombre: ${sanitized.name}\nTeléfono: ${sanitized.phone}\nCorreo: ${sanitized.email}`,
      }).catch(() => {});
      return { success: true };
    }),

  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(leads).orderBy(desc(leads.createdAt));
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
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

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
        eventDate: new Date(input.eventDate),
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

      const [result] = await db.insert(eventBookings).values(sanitized).$returningId();
      const bookingId = result.id;

      // Notify owner
      await notifyOwner({
        title: "Nueva solicitud de evento",
        content: `Cliente: ${sanitized.name}\nFecha: ${sanitized.eventDate.toLocaleDateString("es-MX")}\nPaquete: ${sanitized.packageType.toUpperCase()}\nPersonas: ${sanitized.people}\nTotal estimado: $${totalPrice.toLocaleString("es-MX")}`,
      }).catch(() => {});

      return { success: true, bookingId, totalPrice, depositAmount: 1500 };
    }),

  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(eventBookings).orderBy(desc(eventBookings.createdAt));
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(eventBookings).where(eq(eventBookings.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(eventBookings).set({ status: input.status }).where(eq(eventBookings.id, input.id));
      return { success: true };
    }),

  getBlockedDates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(blockedDates);
  }),

  blockDate: adminProcedure
    .input(z.object({ date: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(blockedDates).values({ date: input.date, reason: input.reason }).onDuplicateKeyUpdate({ set: { reason: input.reason } });
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
      if (!db) return [];
      const conditions = [eq(products.active, true)];
      if (input?.category) conditions.push(eq(products.category, input.category));
      return db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(desc(products.createdAt));
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(products).where(eq(products.slug, input.slug)).limit(1);
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
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const slug = slugify(input.name, { lower: true, strict: true });
      await db.insert(products).values({
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
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, price, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (price !== undefined) updateData.price = price.toString();
      if (rest.name) updateData.name = sanitizeText(rest.name);
      await db.update(products).set(updateData).where(eq(products.id, id));
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(products).set({ active: false }).where(eq(products.id, input.id));
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
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [result] = await db.insert(orders).values({
        ...input,
        amount: input.amount.toString(),
        buyerName: sanitizeText(input.buyerName),
        buyerEmail: sanitizeText(input.buyerEmail),
      }).$returningId();
      return { success: true, orderId: result.id };
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
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(orders).set({
        paymentId: input.paymentId,
        paymentStatus: input.paymentStatus,
      }).where(eq(orders.id, input.orderId));

      // If event deposit approved, mark booking as confirmed
      if (input.paymentStatus === "approved") {
        const order = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
        if (order[0]?.orderType === "event_deposit" && order[0].eventBookingId) {
          await db.update(eventBookings).set({ depositPaid: true, status: "confirmed" })
            .where(eq(eventBookings.id, order[0].eventBookingId));
        }
      }
      return { success: true };
    }),

  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
    return result[0] ?? null;
  }),
});

// ─── Blog Router ──────────────────────────────────────────────────────────────
const blogRouter = router({
  list: publicProcedure
    .input(z.object({ published: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.published !== undefined) {
        conditions.push(eq(blogPosts.published, input.published));
      } else {
        conditions.push(eq(blogPosts.published, true));
      }
      return db.select().from(blogPosts).where(and(...conditions)).orderBy(desc(blogPosts.publishedAt));
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, input.slug)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3).max(500),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(10),
        featuredImage: z.string().url().optional().or(z.literal("")),
        images: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().default(false),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const slug = slugify(input.title, { lower: true, strict: true });
      const sanitizedContent = sanitizeHtml(input.content);
      await db.insert(blogPosts).values({
        title: sanitizeText(input.title),
        slug,
        excerpt: input.excerpt ? sanitizeText(input.excerpt) : null,
        content: sanitizedContent,
        featuredImage: input.featuredImage || null,
        images: input.images ?? [],
        tags: input.tags ?? [],
        published: input.published,
        publishedAt: input.published ? new Date() : null,
        authorId: ctx.user.id,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
      });
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
        images: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, content, title, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (title) updateData.title = sanitizeText(title);
      if (content) updateData.content = sanitizeHtml(content);
      if (rest.published) updateData.publishedAt = new Date();
      await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
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
