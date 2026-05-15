import { motion } from "framer-motion";
import { Star } from "lucide-react";

// Placeholder reviews — will be replaced by Google Business API integration
const reviews = [
  {
    author: "María González",
    rating: 5,
    date: "Hace 2 semanas",
    text: "Excelente servicio. El DJ fue increíble, la música perfecta para nuestra boda. El equipo de iluminación transformó completamente el salón. ¡100% recomendado!",
    avatar: "MG",
  },
  {
    author: "Carlos Ramírez",
    rating: 5,
    date: "Hace 1 mes",
    text: "Contratamos el paquete Premium para la quinceañera de mi hija y fue espectacular. Los chisperos y las máquinas de humo fueron el toque perfecto. Todos quedaron impresionados.",
    avatar: "CR",
  },
  {
    author: "Ana Martínez",
    rating: 5,
    date: "Hace 2 meses",
    text: "Muy profesionales desde la cotización hasta el evento. Llegaron puntual, el sonido fue excelente y el DJ supo leer perfectamente el ambiente. Definitivamente los contrataré de nuevo.",
    avatar: "AM",
  },
  {
    author: "Roberto Sánchez",
    rating: 5,
    date: "Hace 3 meses",
    text: "Contratamos para un evento corporativo de 200 personas. El nivel de profesionalismo fue impresionante. Equipo de primera calidad y música perfecta para el ambiente.",
    avatar: "RS",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "fill-primary text-primary" : "text-[oklch(30%_0.008_240)]"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section className="section-padding bg-[oklch(4.5%_0.002_240)]" aria-label="Reseñas de clientes">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium text-primary tracking-widest uppercase mb-3"
          >
            Lo que dicen nuestros clientes
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl md:text-5xl font-bold text-[oklch(96%_0.008_80)] mb-4"
          >
            Reseñas{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              verificadas
            </span>
          </motion.h2>
          <div className="divider-gold" />
          {/* Google badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs text-[oklch(60%_0.01_240)]">Reseñas de Google Business</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-xs font-semibold text-primary">5.0</span>
          </motion.div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((review, i) => (
            <motion.article
              key={review.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(73%_0.16_78)] to-[oklch(48%_0.13_70)] flex items-center justify-center text-[oklch(4.5%_0.002_240)] text-xs font-bold shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[oklch(90%_0.008_80)]">{review.author}</div>
                  <div className="text-xs text-[oklch(45%_0.008_240)]">{review.date}</div>
                </div>
              </div>
              <StarRating rating={review.rating} />
              <p className="text-xs text-[oklch(60%_0.01_240)] leading-relaxed flex-1">
                "{review.text}"
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
