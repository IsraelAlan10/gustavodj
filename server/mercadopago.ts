import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type { Request, Response } from "express";
import { getDb } from "./db";
import { orders, eventBookings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

function getClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token || token === "placeholder") return null;
  return new MercadoPagoConfig({ accessToken: token });
}

export async function createPreference(req: Request, res: Response) {
  try {
    const { orderId, title, amount, buyerEmail, backUrl } = req.body;

    if (!orderId || !title || !amount || !buyerEmail) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const client = getClient();
    if (!client) {
      console.warn("[MercadoPago] Access token not configured. Falling back to Mock Payment Gateway.");
      const mockCheckoutUrl = `/pago/mock-checkout?orderId=${orderId}&amount=${amount}&title=${encodeURIComponent(title)}`;
      return res.json({
        preferenceId: "mock-" + orderId,
        initPoint: mockCheckoutUrl,
        sandboxInitPoint: mockCheckoutUrl,
      });
    }

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [
          {
            id: String(orderId),
            title: String(title),
            quantity: 1,
            unit_price: Number(amount),
            currency_id: "MXN",
          },
        ],
        payer: { email: String(buyerEmail) },
        back_urls: {
          success: `${backUrl}/pago/exitoso?orderId=${orderId}`,
          failure: `${backUrl}/pago/fallido?orderId=${orderId}`,
          pending: `${backUrl}/pago/pendiente?orderId=${orderId}`,
        },
        auto_return: undefined,
        external_reference: String(orderId),
        notification_url: `${process.env.VITE_FRONTEND_FORGE_API_URL ?? ""}/api/mp/webhook`,
      },
    });

    return res.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    });
  } catch (err) {
    console.error("[MercadoPago] createPreference error:", err);
    return res.status(500).json({ error: "Error al crear preferencia de pago" });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const client = getClient();
    if (!client) return res.status(200).json({ ok: true });

    const { type, data } = req.body;

    if (type === "payment" && data?.id) {
      const paymentApi = new Payment(client);
      const payment = await paymentApi.get({ id: data.id });

      const orderId = parseInt(payment.external_reference ?? "0");
      if (!orderId) return res.status(200).json({ ok: true });

      const db = await getDb();
      if (!db) return res.status(200).json({ ok: true });

      const statusMap: Record<string, "pending" | "approved" | "rejected" | "cancelled"> = {
        approved: "approved",
        rejected: "rejected",
        cancelled: "cancelled",
        pending: "pending",
      };

      const paymentStatus = statusMap[payment.status ?? "pending"] ?? "pending";

      await db.update(orders).set({
        paymentId: String(data.id),
        paymentStatus,
      }).where(eq(orders.id, orderId));

      if (paymentStatus === "approved") {
        const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
        if (orderResult[0]?.orderType === "event_deposit" && orderResult[0].eventBookingId) {
          await db.update(eventBookings).set({ depositPaid: true, status: "confirmed" })
            .where(eq(eventBookings.id, orderResult[0].eventBookingId));
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[MercadoPago] webhook error:", err);
    return res.status(200).json({ ok: true }); // Always return 200 to MP
  }
}
