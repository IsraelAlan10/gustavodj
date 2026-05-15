import { motion } from "framer-motion";
import { Music2, Zap, Lightbulb, Flame, Wind, Sparkles } from "lucide-react";

const services = [
  {
    icon: Music2,
    title: "DJ Profesional",
    description:
      "Mezclas en vivo con equipos de última generación. Géneros adaptados a tu evento: salsa, cumbia, electrónica, pop, reggaetón y más.",
  },
  {
    icon: Zap,
    title: "Producción Musical",
    description:
      "Sonido envolvente con bocinas de alta potencia, subwoofers y sistemas de audio profesional para cualquier tamaño de espacio.",
  },
  {
    icon: Lightbulb,
    title: "Iluminación",
    description:
      "Cabezas robóticas, lasers, luces LED y efectos visuales que transforman cualquier espacio en una experiencia única.",
  },
  {
    icon: Flame,
    title: "Pirotecnia",
    description:
      "Chisperos, efectos de fuego y pirotecnia de interior para momentos épicos: primer baile, brindis o entradas especiales.",
  },
  {
    icon: Wind,
    title: "Máquinas CO₂",
    description:
      "Cañones de CO₂ y máquinas de humo para crear atmósferas dramáticas y efectos visuales de alto impacto en tu evento.",
  },
  {
    icon: Sparkles,
    title: "Paquete Premium",
    description:
      "La experiencia completa: 4 bocinas, lasers, cabezas robóticas, máquinas de humo, chisperos y todo lo necesario para un evento de lujo.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ServicesSection() {
  return (
    <section id="servicios" className="section-padding bg-[oklch(4.5%_0.002_240)]" aria-label="Servicios">
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
            Lo que ofrecemos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl md:text-5xl font-bold text-[oklch(96%_0.008_80)] mb-4"
          >
            Servicios de{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Producción
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
            Cada evento es único. Personalizamos cada detalle para crear una experiencia sonora y visual que supere tus expectativas.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.title}
                variants={cardVariants}
                className="card-hover group relative p-7 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] hover:border-primary/40"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-[oklch(96%_0.008_80)] mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-[oklch(60%_0.01_240)] leading-relaxed">
                  {service.description}
                </p>
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 15%, transparent)" }} />
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
