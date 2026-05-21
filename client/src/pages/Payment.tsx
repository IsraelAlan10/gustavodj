import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Clock, CreditCard, ShoppingCart, Truck, MapPin, User, Mail, Phone, ArrowLeft } from "lucide-react";
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

export function ProductPayment({ params }: { params: { productId: string } }) {
  const productId = parseInt(params.productId);
  const [, navigate] = useLocation();
  
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"cdmxFree" | "cdmxPaid" | "interior">("cdmxPaid");
  const [address, setAddress] = useState("");
  
  const { data: product, isLoading: isProductLoading } = trpc.products.getById.useQuery({ id: productId });
  const createOrder = trpc.orders.create.useMutation();

  // Set default delivery option based on what product supports
  useEffect(() => {
    if (product) {
      const opts = product.deliveryOptions as { cdmxFree?: boolean; cdmxPaid?: boolean; interior?: boolean } | null;
      if (opts?.cdmxFree) {
        setDeliveryOption("cdmxFree");
      } else if (opts?.cdmxPaid) {
        setDeliveryOption("cdmxPaid");
      } else if (opts?.interior) {
        setDeliveryOption("interior");
      }
    }
  }, [product]);

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-[oklch(4.5%_0.002_240)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[oklch(4.5%_0.002_240)] flex flex-col items-center justify-center gap-4">
        <p className="text-[oklch(55%_0.01_240)]">Producto no encontrado.</p>
        <button onClick={() => navigate("/tienda")} className="text-primary hover:underline text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Volver a la tienda
        </button>
      </div>
    );
  }

  const deliveryOpts = product.deliveryOptions as { cdmxFree: boolean; cdmxPaid: boolean; cdmxPrice: number; interior: boolean } | null;
  
  // Calculate pricing
  const subtotal = Number(product.price);
  let shippingCost = 0;
  if (deliveryOption === "cdmxPaid" && deliveryOpts?.cdmxPaid) {
    shippingCost = Number(deliveryOpts.cdmxPrice);
  }
  const total = subtotal + shippingCost;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Por favor completa todos los campos de contacto");
      return;
    }
    if ((deliveryOption === "cdmxPaid" || deliveryOption === "cdmxFree") && !address) {
      toast.error("Por favor ingresa la dirección de entrega");
      return;
    }

    setStatus("loading");
    try {
      // Create order in db
      const orderResult = await createOrder.mutateAsync({
        orderType: "product",
        productId: product.id,
        buyerName: name,
        buyerEmail: email,
        buyerPhone: phone,
        amount: total,
        deliveryOption: deliveryOption === "cdmxFree" 
          ? "Entrega gratis CDMX (5km Estadio Azteca)" 
          : deliveryOption === "cdmxPaid" 
            ? "Entrega a domicilio CDMX" 
            : "Interior de la república (Cotizar envío)",
        deliveryAddress: deliveryOption !== "interior" ? address : "Cotizar interior de la república",
      });

      // Call server backend route for MP preference
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderResult.orderId,
          title: `${product.name} - DJ Producción CDMX`,
          amount: total,
          buyerEmail: email,
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
      toast.error("Error al procesar el pedido. Intenta de nuevo.");
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(4.5%_0.002_240)]">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container max-w-5xl">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(`/producto/${product.slug}`)}
            className="flex items-center gap-2 text-sm text-[oklch(55%_0.01_240)] hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al producto
          </button>

          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[oklch(96%_0.008_80)] mb-2">
              Completar Compra
            </h1>
            <p className="text-[oklch(55%_0.01_240)] text-sm">
              Ingresa tus datos para procesar el envío y pago de tu producto
            </p>
          </div>

          {status === "idle" && (
            <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] space-y-6">
                  <h2 className="font-display text-xl font-bold text-[oklch(90%_0.008_80)] border-b border-[oklch(18%_0.006_240)] pb-3">
                    1. Datos de Contacto
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[oklch(70%_0.01_240)] uppercase tracking-wider mb-2">
                        Nombre Completo *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(40%_0.008_240)]" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Juan Pérez"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[oklch(9%_0.003_240)] border border-[oklch(18%_0.006_240)] text-[oklch(90%_0.008_80)] placeholder-[oklch(40%_0.008_240)] focus:outline-none focus:border-primary transition-colors text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[oklch(70%_0.01_240)] uppercase tracking-wider mb-2">
                          Correo Electrónico *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(40%_0.008_240)]" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="juan@ejemplo.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[oklch(9%_0.003_240)] border border-[oklch(18%_0.006_240)] text-[oklch(90%_0.008_80)] placeholder-[oklch(40%_0.008_240)] focus:outline-none focus:border-primary transition-colors text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[oklch(70%_0.01_240)] uppercase tracking-wider mb-2">
                          Teléfono / WhatsApp *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(40%_0.008_240)]" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="5512345678"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[oklch(9%_0.003_240)] border border-[oklch(18%_0.006_240)] text-[oklch(90%_0.008_80)] placeholder-[oklch(40%_0.008_240)] focus:outline-none focus:border-primary transition-colors text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] space-y-6">
                  <h2 className="font-display text-xl font-bold text-[oklch(90%_0.008_80)] border-b border-[oklch(18%_0.006_240)] pb-3">
                    2. Método de Entrega
                  </h2>

                  <div className="space-y-3">
                    {deliveryOpts?.cdmxFree && (
                      <label
                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          deliveryOption === "cdmxFree"
                            ? "bg-[oklch(12%_0.004_240)] border-primary"
                            : "bg-[oklch(9%_0.003_240)] border-[oklch(18%_0.006_240)] hover:border-[oklch(30%_0.008_240)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryOption"
                          checked={deliveryOption === "cdmxFree"}
                          onChange={() => setDeliveryOption("cdmxFree")}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-semibold text-sm text-[oklch(90%_0.008_80)]">
                            <Truck className="w-4 h-4 text-green-500" />
                            <span>Entrega Gratis CDMX</span>
                          </div>
                          <p className="text-xs text-[oklch(55%_0.01_240)] mt-1">
                            Hasta 5km de distancia del Estadio Azteca.
                          </p>
                        </div>
                        <span className="text-sm font-bold text-green-500">Gratis</span>
                      </label>
                    )}

                    {deliveryOpts?.cdmxPaid && (
                      <label
                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          deliveryOption === "cdmxPaid"
                            ? "bg-[oklch(12%_0.004_240)] border-primary"
                            : "bg-[oklch(9%_0.003_240)] border-[oklch(18%_0.006_240)] hover:border-[oklch(30%_0.008_240)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryOption"
                          checked={deliveryOption === "cdmxPaid"}
                          onChange={() => setDeliveryOption("cdmxPaid")}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-semibold text-sm text-[oklch(90%_0.008_80)]">
                            <Truck className="w-4 h-4 text-primary" />
                            <span>Entrega a Domicilio CDMX</span>
                          </div>
                          <p className="text-xs text-[oklch(55%_0.01_240)] mt-1">
                            Envío seguro a tu ubicación dentro de la CDMX.
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          ${deliveryOpts.cdmxPrice.toLocaleString("es-MX")}
                        </span>
                      </label>
                    )}

                    {deliveryOpts?.interior && (
                      <label
                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          deliveryOption === "interior"
                            ? "bg-[oklch(12%_0.004_240)] border-primary"
                            : "bg-[oklch(9%_0.003_240)] border-[oklch(18%_0.006_240)] hover:border-[oklch(30%_0.008_240)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryOption"
                          checked={deliveryOption === "interior"}
                          onChange={() => setDeliveryOption("interior")}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-semibold text-sm text-[oklch(90%_0.008_80)]">
                            <MapPin className="w-4 h-4 text-[oklch(60%_0.01_240)]" />
                            <span>Interior de la República</span>
                          </div>
                          <p className="text-xs text-[oklch(55%_0.01_240)] mt-1">
                            El costo del envío se cotizará y pagará por separado via WhatsApp.
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[oklch(12%_0.004_240)] text-[oklch(60%_0.01_240)]">
                          Por cotizar
                        </span>
                      </label>
                    )}
                  </div>

                  {deliveryOption !== "interior" && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-[oklch(70%_0.01_240)] uppercase tracking-wider mb-2">
                        Dirección Completa de Entrega *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Calle y número, Colonia, Delegación/Municipio, Código Postal, Referencias adicionales."
                        className="w-full px-4 py-3 rounded-xl bg-[oklch(9%_0.003_240)] border border-[oklch(18%_0.006_240)] text-[oklch(90%_0.008_80)] placeholder-[oklch(40%_0.008_240)] focus:outline-none focus:border-primary transition-colors text-sm resize-none"
                      />
                    </div>
                  )}

                  {deliveryOption === "interior" && (
                    <div className="p-4 rounded-xl bg-[oklch(10%_0.01_60/0.1)] border border-[oklch(70%_0.18_60/0.15)] text-[oklch(70%_0.18_60)] text-xs leading-relaxed">
                      <strong>Nota sobre envíos nacionales:</strong> Pagarás únicamente el valor del producto ahora. Una vez confirmado el pago, nos pondremos en contacto contigo para cotizar el envío mediante una paquetería de tu confianza y coordinar la entrega.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] sticky top-28">
                  <h2 className="font-display text-xl font-bold text-[oklch(90%_0.008_80)] border-b border-[oklch(18%_0.006_240)] pb-3 mb-4">
                    Resumen del Pedido
                  </h2>

                  {/* Product card inside summary */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[oklch(9%_0.003_240)] border border-[oklch(18%_0.006_240)]">
                      {(product.images as string[])?.[0] ? (
                        <img
                          src={(product.images as string[])[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-[oklch(25%_0.008_240)]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[oklch(90%_0.008_80)] line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-primary font-bold mt-1">
                        ${subtotal.toLocaleString("es-MX")}
                      </p>
                      <p className="text-[10px] text-[oklch(45%_0.008_240)] uppercase mt-1">
                        Categoría: {product.category === "cabina" ? "Cabina" : product.category === "mesa_dj" ? "Mesa DJ" : "Accesorio"}
                      </p>
                    </div>
                  </div>

                  {/* Price calculations */}
                  <div className="space-y-3 border-t border-[oklch(18%_0.006_240)] pt-4 text-sm">
                    <div className="flex justify-between text-[oklch(60%_0.01_240)]">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString("es-MX")}</span>
                    </div>
                    <div className="flex justify-between text-[oklch(60%_0.01_240)]">
                      <span>Costo de envío</span>
                      <span>
                        {deliveryOption === "interior"
                          ? "Por cotizar"
                          : shippingCost === 0
                            ? "Gratis"
                            : `$${shippingCost.toLocaleString("es-MX")}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-display text-lg font-bold text-[oklch(90%_0.008_80)] border-t border-[oklch(18%_0.006_240)] pt-3 mt-1">
                      <span>Total</span>
                      <span className="text-primary">${total.toLocaleString("es-MX")}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-gold w-full py-4 rounded-xl text-sm font-semibold mt-6 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Proceder al Pago
                  </button>
                </div>
              </div>
            </form>
          )}

          {status !== "idle" && (
            <div className="p-8 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] max-w-lg mx-auto text-center">
              {status === "loading" && (
                <div className="py-8">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-[oklch(55%_0.01_240)] text-sm">Creando orden de pago...</p>
                </div>
              )}
              {status === "ready" && initPoint && (
                <div>
                  <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-[oklch(96%_0.008_80)] mb-2">
                    ¡Pago Listo!
                  </h3>
                  <p className="text-[oklch(55%_0.01_240)] text-sm mb-6">
                    Se ha generado tu orden de compra. Serás redirigido a Mercado Pago para completar tu pago de forma segura.
                  </p>
                  <a
                    href={initPoint}
                    className="btn-gold inline-block px-8 py-3.5 rounded-full text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Pagar ${total.toLocaleString("es-MX")} con Mercado Pago
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
                  <button onClick={() => setStatus("idle")} className="btn-gold px-6 py-2.5 rounded-full text-sm font-semibold">
                    Corregir datos y reintentar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function MockCheckout() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = parseInt(searchParams.get("orderId") || "0");
  const amount = searchParams.get("amount") || "0";
  const title = searchParams.get("title") || "Pedido";

  const updatePayment = trpc.orders.updatePayment.useMutation();
  const [loading, setLoading] = useState(false);

  async function handleSimulate(status: "approved" | "rejected" | "pending") {
    if (!orderId) {
      toast.error("ID de orden inválido");
      return;
    }
    setLoading(true);
    try {
      await updatePayment.mutateAsync({
        orderId,
        paymentId: `mock-pay-${Date.now()}`,
        paymentStatus: status,
      });

      if (status === "approved") {
        navigate(`/pago/exitoso?orderId=${orderId}`);
      } else if (status === "rejected") {
        navigate(`/pago/fallido?orderId=${orderId}`);
      } else {
        navigate(`/pago/pendiente?orderId=${orderId}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar estado del pago simulado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(4.5%_0.002_240)] flex items-center justify-center pt-24 pb-20">
      <div className="container max-w-md">
        <div className="p-8 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-500" />
          
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-lg">
              MP
            </div>
          </div>

          <h2 className="font-display text-xl font-bold text-[oklch(96%_0.008_80)] mb-1">
            Simulador de Mercado Pago
          </h2>
          <p className="text-[oklch(50%_0.01_240)] text-xs mb-6 uppercase tracking-wider">
            Modo Sandbox / Pruebas
          </p>

          <div className="p-4 rounded-xl bg-[oklch(9%_0.003_240)] border border-[oklch(18%_0.006_240)] mb-8 text-left space-y-2">
            <div className="text-xs text-[oklch(50%_0.01_240)] uppercase font-semibold">Detalles del Pago</div>
            <div className="text-sm font-semibold text-[oklch(90%_0.008_80)]">{title}</div>
            <div className="flex justify-between border-t border-[oklch(18%_0.006_240)] pt-2 mt-2">
              <span className="text-xs text-[oklch(60%_0.01_240)]">Monto a pagar</span>
              <span className="text-sm font-bold text-primary">${Number(amount).toLocaleString("es-MX")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[oklch(60%_0.01_240)]">Referencia</span>
              <span className="text-xs font-mono text-[oklch(60%_0.01_240)]">#{orderId}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-xs text-[oklch(50%_0.01_240)]">Procesando simulación...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => handleSimulate("approved")}
                className="w-full py-3 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Simular Pago Aprobado
              </button>
              <button
                onClick={() => handleSimulate("rejected")}
                className="w-full py-3 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Simular Pago Simulado Rechazado
              </button>
              <button
                onClick={() => handleSimulate("pending")}
                className="w-full py-3 rounded-xl text-xs font-semibold bg-yellow-600 hover:bg-yellow-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Simular Pago Pendiente
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl text-xs text-[oklch(50%_0.01_240)] hover:text-[oklch(70%_0.01_240)] transition-colors mt-2"
              >
                Cancelar y regresar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentSuccess() { return <PaymentResultPage type="success" />; }
export function PaymentFailure() { return <PaymentResultPage type="failure" />; }
export function PaymentPending() { return <PaymentResultPage type="pending" />; }
