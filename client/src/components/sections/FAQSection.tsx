import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "¿Cuántas personas pueden asistir al evento?",
    a: "Atendemos eventos desde 10 hasta más de 300 personas. El precio base cubre hasta 100 asistentes. Para grupos más grandes aplicamos cargos adicionales: 100–200 personas +$3,000, 200–300 personas +$5,500, y más de 300 personas +$7,500.",
  },
  {
    q: "¿El servicio es para espacios abiertos o cerrados?",
    a: "Trabajamos tanto en espacios interiores (salones de fiestas, restaurantes, hoteles) como exteriores (jardines, terrazas, haciendas). Adaptamos el equipo de sonido e iluminación según las características del espacio.",
  },
  {
    q: "¿Qué tipo de eventos atienden?",
    a: "Bodas, quinceañeras, cumpleaños, graduaciones, eventos corporativos, fiestas temáticas, reuniones familiares y cualquier celebración que requiera música y producción de calidad.",
  },
  {
    q: "¿Cuál es el tiempo mínimo de servicio?",
    a: "Nuestros paquetes incluyen 5 horas de servicio. Si necesitas más tiempo, cada hora adicional tiene un costo de $1,200.",
  },
  {
    q: "¿Cómo funciona el proceso de reserva?",
    a: "Completa el formulario de contratación o contáctanos por WhatsApp. Una vez confirmada la disponibilidad, se solicita un anticipo de $1,500 vía Mercado Pago para asegurar tu fecha. El saldo restante se liquida el día del evento.",
  },
  {
    q: "¿Hacen eventos fuera de la CDMX?",
    a: "Sí, atendemos eventos en el interior de la república. El costo de traslado se cotiza por separado según la distancia y logística. Contáctanos por WhatsApp para una cotización personalizada.",
  },
  {
    q: "¿Qué incluye el Paquete Premium?",
    a: "El Paquete Premium ($7,500 por 5 horas) incluye: DJ profesional, 4 bocinas de alta potencia, cabezas robóticas, lasers, máquinas de humo, chisperos y máquinas de CO₂. Es la experiencia completa para eventos de alto impacto.",
  },
  {
    q: "¿Puedo elegir la música para mi evento?",
    a: "¡Por supuesto! Trabajamos con una lista de preferencias musicales que nos compartes con anticipación. También podemos adaptarnos en tiempo real a las solicitudes de los asistentes durante el evento.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faqs" className="section-padding bg-[oklch(4.5%_0.002_240)]" aria-label="Preguntas frecuentes">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs font-medium text-primary tracking-widest uppercase mb-3"
            >
              Dudas frecuentes
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-4xl md:text-5xl font-bold text-[oklch(96%_0.008_80)] mb-4"
            >
              Preguntas{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                frecuentes
              </span>
            </motion.h2>
            <div className="divider-gold" />
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  openIndex === i
                    ? "border-primary/40 bg-[oklch(7%_0.003_240)]"
                    : "border-[oklch(18%_0.006_240)] bg-[oklch(6%_0.003_240)]"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span className="font-medium text-[oklch(90%_0.008_80)] text-sm md:text-base leading-snug">
                    {faq.q}
                  </span>
                  <span className="shrink-0 w-7 h-7 rounded-full border border-[oklch(25%_0.008_240)] flex items-center justify-center">
                    {openIndex === i ? (
                      <Minus className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-[oklch(55%_0.01_240)]" />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-5">
                        <p className="text-sm text-[oklch(60%_0.01_240)] leading-relaxed border-t border-[oklch(15%_0.005_240)] pt-4">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
