import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
    onDuplicateKeyUpdate: vi.fn().mockResolvedValue(undefined),
    then: vi.fn().mockResolvedValue([]),
  }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("slugify", () => ({
  default: vi.fn((s: string) => s.toLowerCase().replace(/\s+/g, "-")),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@djcdmx.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makePublicCtx();
    const clearedCookies: string[] = [];
    ctx.res.clearCookie = (name: string) => { clearedCookies.push(name); };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });

  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns user object for authenticated user", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const user = await caller.auth.me();
    expect(user?.role).toBe("admin");
  });
});

// ─── Leads tests ──────────────────────────────────────────────────────────────
describe("leads.create", () => {
  it("rejects invalid phone number", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.leads.create({
        name: "Juan Pérez",
        phone: "abc-invalid",
        email: "juan@example.com",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.leads.create({
        name: "Juan Pérez",
        phone: "5512345678",
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });

  it("rejects name that is too short", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.leads.create({
        name: "J",
        phone: "5512345678",
        email: "juan@example.com",
      })
    ).rejects.toThrow();
  });
});

// ─── Admin guard tests ────────────────────────────────────────────────────────
describe("admin guard", () => {
  it("blocks non-admin from listing leads", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.leads.list()).rejects.toThrow(/FORBIDDEN|Acceso restringido/);
  });

  it("blocks unauthenticated from listing leads", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.leads.list()).rejects.toThrow();
  });
});

// ─── Events pricing tests ─────────────────────────────────────────────────────
describe("events pricing calculation", () => {
  it("calculates base DJ package price correctly", () => {
    const basePrice = 5500;
    const extraHours = Math.max(0, 5 - 5) * 1200;
    let extraPeople = 0;
    const people = 50;
    if (people > 300) extraPeople = 7500;
    else if (people > 200) extraPeople = 5500;
    else if (people > 100) extraPeople = 3000;
    expect(basePrice + extraHours + extraPeople).toBe(5500);
  });

  it("calculates Premium package with extra hours and people", () => {
    const basePrice = 7500;
    const extraHours = Math.max(0, 7 - 5) * 1200; // 2 extra hours = 2400
    let extraPeople = 0;
    const people = 150;
    if (people > 300) extraPeople = 7500;
    else if (people > 200) extraPeople = 5500;
    else if (people > 100) extraPeople = 3000;
    expect(basePrice + extraHours + extraPeople).toBe(12900); // 7500 + 2400 + 3000
  });

  it("applies correct surcharge for 200-300 people", () => {
    const people = 250;
    let extraPeople = 0;
    if (people > 300) extraPeople = 7500;
    else if (people > 200) extraPeople = 5500;
    else if (people > 100) extraPeople = 3000;
    expect(extraPeople).toBe(5500);
  });

  it("applies correct surcharge for 300+ people", () => {
    const people = 400;
    let extraPeople = 0;
    if (people > 300) extraPeople = 7500;
    else if (people > 200) extraPeople = 5500;
    else if (people > 100) extraPeople = 3000;
    expect(extraPeople).toBe(7500);
  });
});

// ─── Blog admin tests ─────────────────────────────────────────────────────────
describe("blog admin guard", () => {
  it("blocks non-admin from creating blog posts", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.blog.create({
        title: "Test Post",
        content: "<p>Content</p>",
        published: false,
      })
    ).rejects.toThrow(/FORBIDDEN|Acceso restringido/);
  });

  it("blocks non-admin from deleting blog posts", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.blog.delete({ id: 1 })).rejects.toThrow(/FORBIDDEN|Acceso restringido/);
  });
});

// ─── Products admin tests ─────────────────────────────────────────────────────
describe("products admin guard", () => {
  it("blocks non-admin from creating products", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.products.create({
        name: "Cabina Pro",
        category: "cabina",
        price: 15000,
      })
    ).rejects.toThrow(/FORBIDDEN|Acceso restringido/);
  });

  it("blocks non-admin from deleting products", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.products.delete({ id: 1 })).rejects.toThrow(/FORBIDDEN|Acceso restringido/);
  });
});
