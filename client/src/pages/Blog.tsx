import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery();

  return (
    <div className="min-h-screen bg-[oklch(4.5%_0.002_240)]">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-primary tracking-widest uppercase mb-3"
            >
              Contenido
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl md:text-5xl font-bold text-[oklch(96%_0.008_80)] mb-4"
            >
              Blog &{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Noticias
              </span>
            </motion.h1>
            <div className="divider-gold" />
            <p className="text-[oklch(55%_0.01_240)] text-sm mt-4">
              Consejos, tendencias y novedades del mundo DJ y producción de eventos.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-[oklch(7%_0.003_240)] h-72 animate-pulse" />
              ))}
            </div>
          ) : (posts ?? []).length === 0 ? (
            <div className="text-center py-20 text-[oklch(45%_0.008_240)] text-sm">
              Próximamente publicaremos artículos. ¡Vuelve pronto!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(posts ?? []).map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="card-hover group rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] overflow-hidden flex flex-col"
                >
                  {post.featuredImage ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-[oklch(10%_0.004_240)] flex items-center justify-center">
                      <span className="font-display text-4xl text-[oklch(20%_0.006_240)]">DJ</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    {(post.tags as string[])?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {((post.tags as string[]) ?? []).slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[oklch(12%_0.004_240)] text-[oklch(50%_0.01_240)]">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-display text-lg font-semibold text-[oklch(96%_0.008_80)] mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-xs text-[oklch(55%_0.01_240)] line-clamp-3 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[oklch(12%_0.004_240)]">
                      <span className="flex items-center gap-1.5 text-xs text-[oklch(45%_0.008_240)]">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      </span>
                      <Link href={`/blog/${post.slug}`} className="text-xs text-primary hover:underline font-medium">
                        Leer más →
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
