import { motion } from "framer-motion";
import { MessageCircle, Instagram, ChevronDown } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5215500000000?text=Hola%2C%20me%20interesa%20contratar%20sus%20servicios%20de%20DJ";
const INSTAGRAM_URL = "https://instagram.com/djproduccioncdmx";

export default function HeroSection() {
  const scrollToServices = () => {
    document.querySelector("#servicios")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Inicio"
    >
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-[oklch(4.5%_0.002_240)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--primary) 35%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 60px, color-mix(in srgb, var(--primary) 15%, transparent) 60px, color-mix(in srgb, var(--primary) 15%, transparent) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, color-mix(in srgb, var(--primary) 15%, transparent) 60px, color-mix(in srgb, var(--primary) 15%, transparent) 61px)",
        }}
      />

      {/* Animated orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 70%)",
          top: "10%",
          right: "-10%",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 70%)",
          bottom: "5%",
          left: "-5%",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Content */}
      <div className="relative z-10 container text-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/8 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary tracking-widest uppercase">
            Servicio Profesional de DJ · CDMX
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
        >
          <span className="text-[oklch(96%_0.008_80)]">Música que</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, var(--gold-300), var(--primary), var(--gold-700))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            transforma
          </span>
          <br />
          <span className="text-[oklch(96%_0.008_80)]">tu evento</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="text-lg md:text-xl text-[oklch(65%_0.01_240)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Producción musical, DJ profesional e iluminación de alto impacto para bodas, quinceañeras, corporativos y todo tipo de eventos en México.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <a
            href="#contratar"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contratar")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-gold px-8 py-4 rounded-full text-base font-semibold shadow-lg w-full sm:w-auto"
          >
            Reservar mi Fecha
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-8 py-4 rounded-full border border-[oklch(30%_0.008_240)] text-[oklch(85%_0.01_80)] hover:border-primary hover:text-primary transition-all duration-200 text-base font-medium w-full sm:w-auto justify-center"
          >
            <MessageCircle className="w-5 h-5" />
            Cotizar por WhatsApp
          </a>
        </motion.div>

        {/* Social CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-6 mb-16"
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[oklch(55%_0.01_240)] hover:text-primary transition-colors"
          >
            <Instagram className="w-4 h-4" />
            <span>@djproduccioncdmx</span>
          </a>
          <span className="w-px h-4 bg-[oklch(25%_0.008_240)]" />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[oklch(55%_0.01_240)] hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp directo</span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[
            { value: "500+", label: "Eventos realizados" },
            { value: "10+", label: "Años de experiencia" },
            { value: "5★", label: "Calificación promedio" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-xs text-[oklch(50%_0.01_240)] mt-1 leading-tight">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[oklch(40%_0.008_240)] hover:text-primary transition-colors"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-label="Ir a servicios"
      >
        <span className="text-xs tracking-widest uppercase">Descubrir</span>
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    </section>
  );
}
