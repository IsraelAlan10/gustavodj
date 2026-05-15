import { motion } from "framer-motion";
import { Check, MessageCircle, Users } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5215500000000?text=Hola%2C%20me%20interesa%20cotizar%20para%20el%20interior%20de%20la%20rep%C3%BAblica";

const packages = [
  {
    name: "Paquete DJ",
    price: "$5,500",
    hours: "5 horas",
    extraHour: "$1,200 / hr extra",
    highlight: false,
    badge: null,
    features: [
      "Servicio de DJ profesional",
      "Cabina de mezclas",
      "Sistema de bocinas",
      "Luces de ambiente",
      "5 horas de servicio",
      "Hora extra $1,200",
      "Repertorio personalizado",
      "Cobertura CDMX",
    ],
  },
  {
    name: "Paquete Premium",
    price: "$7,500",
    hours: "5 horas",
    extraHour: "$1,200 / hr extra",
    highlight: true,
    badge: "Más popular",
    features: [
      "Todo lo del Paquete DJ",
      "4 bocinas profesionales",
      "Cabezas robóticas",
      "Lasers de alta potencia",
      "Máquinas de humo",
      "Chisperos / pirotecnia",
      "Máquinas CO₂",
      "Hora extra $1,200",
    ],
  },
];

const peopleCharges = [
  { range: "10 – 100 personas", charge: "Precio base", extra: "" },
  { range: "100 – 200 personas", charge: "+$3,000", extra: "adicionales" },
  { range: "200 – 300 personas", charge: "+$5,500", extra: "adicionales" },
  { range: "300+ personas", charge: "+$7,500", extra: "adicionales" },
];

export default function PricingSection() {
  return (
    <section id="precios" className="section-padding bg-[oklch(3%_0.002_240)]" aria-label="Precios">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium text-primary tracking-widest uppercase mb-3"
          >
            Inversión
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl md:text-5xl font-bold text-[oklch(96%_0.008_80)] mb-4"
          >
            Precios{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              transparentes
            </span>
          </motion.h2>
          <div className="divider-gold" />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[oklch(60%_0.01_240)] max-w-xl mx-auto mt-4"
          >
            Precios para la Ciudad de México. Para eventos al interior de la república, contáctanos para cotización personalizada.
          </motion.p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                pkg.highlight
                  ? "bg-[oklch(7%_0.003_240)] border-primary/50 shadow-[0_0_40px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
                  : "bg-[oklch(7%_0.003_240)] border-[oklch(18%_0.006_240)]"
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[oklch(73%_0.16_78)] to-[oklch(58%_0.16_73)] text-[oklch(4.5%_0.002_240)] tracking-wide">
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-[oklch(96%_0.008_80)] mb-1">
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-3">
                  <span
                    className="font-display text-4xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {pkg.price}
                  </span>
                  <span className="text-[oklch(55%_0.01_240)] text-sm">/ {pkg.hours}</span>
                </div>
                <p className="text-xs text-[oklch(50%_0.01_240)] mt-1">{pkg.extraHour}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-[oklch(75%_0.01_240)]">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contratar"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#contratar")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`block w-full text-center py-3.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  pkg.highlight
                    ? "btn-gold"
                    : "border border-primary/50 text-primary hover:bg-primary/8"
                }`}
              >
                Contratar este paquete
              </a>
            </motion.div>
          ))}
        </div>

        {/* People charges table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[oklch(96%_0.008_80)]">
              Cargos por número de personas
            </h3>
          </div>
          <div className="rounded-2xl border border-[oklch(18%_0.006_240)] overflow-hidden">
            {peopleCharges.map((row, i) => (
              <div
                key={row.range}
                className={`flex items-center justify-between px-6 py-4 ${
                  i < peopleCharges.length - 1 ? "border-b border-[oklch(18%_0.006_240)]" : ""
                } ${i % 2 === 0 ? "bg-[oklch(7%_0.003_240)]" : "bg-[oklch(5.5%_0.002_240)]"}`}
              >
                <span className="text-sm text-[oklch(75%_0.01_240)]">{row.range}</span>
                <span className={`text-sm font-semibold ${i === 0 ? "text-primary" : "text-[oklch(80%_0.13_80)]"}`}>
                  {row.charge} {row.extra && <span className="font-normal text-[oklch(55%_0.01_240)]">{row.extra}</span>}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interior CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 text-center"
        >
          <p className="text-[oklch(55%_0.01_240)] text-sm mb-4">
            ¿Tu evento es fuera de la CDMX?
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[oklch(30%_0.008_240)] text-[oklch(75%_0.01_240)] hover:border-primary hover:text-primary transition-all duration-200 text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Cotizar al interior de la república
          </a>
        </motion.div>
      </div>
    </section>
  );
}
