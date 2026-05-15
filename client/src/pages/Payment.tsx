import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Clock, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type PaymentStatus = "idle" | "loading" | "ready" | "error";

// ─── Event Deposit Payment ─────────────────────────────────────────────────────
export function EventPayment({ params }: { params: { bookingId: string } }) {
  const bookingId = parseInt(params.bookingId);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);

  const { data: booking } = trpc.events.getById.useQuery({ id: bookingId });
  const createOrder = trpc.orders.create.useMutation();

  useEffect(() => {
    if (!booking || status !== "idle") return;
    initPayment();
  }, [booking]);

  async function initPayment() {
    if (!booking) return;
    setStatus("loading");
    try {
      // Create order record
      const orderResult = await createOrder.mutateAsync({
        orderType: "event_deposit",
        eventBookingId: booking.id,
        buyerName: booking.name,
        buyerEmail: booking.email,
        buyerPhone: booking.phone,
        amount: 1500,
        deliveryOption: "event_deposit",
      });

      // Create MP preference
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderResult.orderId,
          title: `Anticipo DJ Producción CDMX - ${booking.name}`,
          amount: 1500,
          buyerEmail: booking.email,
          backUrl: window.location.origin,
        }),
      });

      if (!res.ok) throw new Error("Error al crear preferencia");
      const data = await res.json();
      setPreferenceId(data.preferenceId);
      setInitPoint(data.sandboxInitPoint || data.initPoint);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error("Error al inicializar el pago. Intenta de nuevo.");
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(4.5%_0.002_240)]">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container max-w-lg">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold text-[oklch(96%_0.008_80)] mb-2">
              Anticipo de Evento
            </h1>
            <p className="text-[oklch(55%_0.01_240)] text-sm">
              Confirma tu fecha con un anticipo de $1,500 MXN
            </p>
          </div>

          {booking && (
            <div className="p-5 rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] mb-6">
              <h3 className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
                Resumen de tu evento
              </h3>
              <div className="space-y-1.5 text-sm text-[oklch(70%_0.01_240)]">
                <div className="flex justify-between">
                  <span>Cliente</span><span className="text-[oklch(90%_0.008_80)]">{booking.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha</span>
                  <span className="text-[oklch(90%_0.008_80)]">
                    {new Date(booking.eventDate).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Paquete</span>
                  <span className="text-[oklch(90%_0.008_80)] capitalize">{booking.packageType}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-[oklch(20%_0.006_240)] pt-2 mt-2">
                  <span>Total estimado</span>
                  <span className="text-primary">${Number(booking.totalPrice).toLocaleString("es-MX")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Anticipo a pagar ahora</span>
                  <span className="text-primary font-bold">$1,500</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] text-center">
            {status === "loading" && (
              <div className="py-8">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                <p className="text-[oklch(55%_0.01_240)] text-sm">Preparando tu pago...</p>
              </div>
            )}
            {status === "ready" && initPoint && (
              <div>
                <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-[oklch(96%_0.008_80)] mb-2">
                  Pago listo
                </h3>
                <p className="text-[oklch(55%_0.01_240)] text-sm mb-6">
                  Serás redirigido a Mercado Pago para completar tu pago de forma segura.
                </p>
                <a
                  href={initPoint}
                  className="btn-gold inline-block px-8 py-3.5 rounded-full text-sm font-semibold"
                >
                  Pagar $1,500 con Mercado Pago
                </a>
                <p className="text-xs text-[oklch(40%_0.008_240)] mt-4">
                  Pago seguro procesado por Mercado Pago · Tarjeta, transferencia o efectivo
                </p>
              </div>
            )}
            {status === "error" && (
              <div className="py-8">
                <XCircle className="w-10 h-10 text-[oklch(55%_0.22_25)] mx-auto mb-3" />
                <p className="text-[oklch(70%_0.01_240)] text-sm mb-4">Error al inicializar el pago.</p>
                <button onClick={initPayment} className="btn-gold px-6 py-2.5 rounded-full text-sm font-semibold">
                  Reintentar
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Payment Result Pages ──────────────────────────────────────────────────────
function PaymentResultPage({ type }: { type: "success" | "failure" | "pending" }) {
  const icons = {
    success: <CheckCircle2 className="w-16 h-16 text-[oklch(55%_0.18_145)]" />,
    failure: <XCircle className="w-16 h-16 text-[oklch(55%_0.22_25)]" />,
    pending: <Clock className="w-16 h-16 text-[oklch(70%_0.18_60)]" />,
  };
  const titles = {
    success: "¡Pago exitoso!",
    failure: "Pago fallido",
    pending: "Pago pendiente",
  };
  const messages = {
    success: "Tu anticipo fue procesado correctamente. Te contactaremos pronto para confirmar los detalles de tu evento.",
    failure: "Hubo un problema con tu pago. Por favor intenta de nuevo o contáctanos por WhatsApp.",
    pending: "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
  };

  return (
    <div className="min-h-screen bg-[oklch(4.5%_0.002_240)]">
      <Navbar />
      <main className="pt-24 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-6"
        >
          <div className="flex justify-center mb-6">{icons[type]}</div>
          <h1 className="font-display text-3xl font-bold text-[oklch(96%_0.008_80)] mb-3">
            {titles[type]}
          </h1>
          <p className="text-[oklch(60%_0.01_240)] text-sm leading-relaxed mb-8">
            {messages[type]}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" className="btn-gold px-6 py-3 rounded-full text-sm font-semibold">
              Volver al inicio
            </a>
            <a
              href="https://wa.me/5215500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full border border-[oklch(30%_0.008_240)] text-[oklch(70%_0.01_240)] hover:border-primary hover:text-primary transition-colors text-sm font-medium"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export function PaymentSuccess() { return <PaymentResultPage type="success" />; }
export function PaymentFailure() { return <PaymentResultPage type="failure" />; }
export function PaymentPending() { return <PaymentResultPage type="pending" />; }
