import { motion } from "framer-motion";
import { MessageCircle, Instagram, ShoppingCart } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5215500000000?text=Hola%2C%20me%20interesa%20contratar%20sus%20servicios";
const INSTAGRAM_URL = "https://instagram.com/djproduccioncdmx";
const AMAZON_URL = "https://amazon.com.mx/s?k=cabinas+dj+mesas+dj";

const ctaItems = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    description: "Cotización inmediata",
    href: WHATSAPP_URL,
    color: "#25D366",
    bgColor: "oklch(55% 0.18 145 / 0.1)",
    borderColor: "oklch(55% 0.18 145 / 0.3)",
    hoverBg: "oklch(55% 0.18 145 / 0.15)",
  },
  {
    icon: Instagram,
    label: "Instagram",
    description: "Síguenos y ve nuestro trabajo",
    href: INSTAGRAM_URL,
    color: "#E1306C",
    bgColor: "oklch(55% 0.22 0 / 0.1)",
    borderColor: "oklch(55% 0.22 0 / 0.3)",
    hoverBg: "oklch(55% 0.22 0 / 0.15)",
  },
  {
    icon: ShoppingCart,
    label: "Amazon",
    description: "Compra equipo en Amazon",
    href: AMAZON_URL,
    color: "#FF9900",
    bgColor: "oklch(70% 0.18 60 / 0.1)",
    borderColor: "oklch(70% 0.18 60 / 0.3)",
    hoverBg: "oklch(70% 0.18 60 / 0.15)",
  },
];

export default function CTASection() {
  return (
    <section className="py-20 bg-[oklch(3%_0.002_240)]" aria-label="Redes sociales y contacto">
      <div className="container">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl font-bold text-[oklch(96%_0.008_80)] mb-3"
          >
            Conéctate con nosotros
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[oklch(55%_0.01_240)] text-sm"
          >
            Estamos disponibles para responder tus preguntas y ayudarte a planear tu evento perfecto.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
          {ctaItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-200 text-center"
                style={{
                  background: item.bgColor,
                  borderColor: item.borderColor,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: item.bgColor, border: `1px solid ${item.borderColor}` }}
                >
                  <Icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <div>
                  <div className="font-semibold text-[oklch(90%_0.008_80)] text-sm">{item.label}</div>
                  <div className="text-xs text-[oklch(55%_0.01_240)] mt-0.5">{item.description}</div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
