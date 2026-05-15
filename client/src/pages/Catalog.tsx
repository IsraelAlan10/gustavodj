import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShoppingCart, Truck, MapPin, Tag, ExternalLink, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Category = "all" | "cabina" | "mesa_dj" | "accesorio";

const categoryLabels: Record<string, string> = {
  all: "Todos",
  cabina: "Cabinas",
  mesa_dj: "Mesas DJ",
  accesorio: "Accesorios",
};

function DeliveryBadge({ options }: { options: { cdmxFree: boolean; cdmxPaid: boolean; cdmxPrice: number; interior: boolean } | null }) {
  if (!options) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {options.cdmxFree && (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[oklch(55%_0.18_145/0.15)] border border-[oklch(55%_0.18_145/0.3)] text-[oklch(70%_0.18_145)]">
          <Truck className="w-3 h-3" />Envío gratis CDMX
        </span>
      )}
      {options.cdmxPaid && !options.cdmxFree && (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary">
          <Truck className="w-3 h-3" />${options.cdmxPrice} CDMX
        </span>
      )}
      {options.interior && (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[oklch(12%_0.004_240)] border border-[oklch(25%_0.008_240)] text-[oklch(55%_0.01_240)]">
          <MapPin className="w-3 h-3" />Cotizar interior
        </span>
      )}
    </div>
  );
}

export default function Catalog() {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = trpc.products.list.useQuery(
    category !== "all" ? { category } : undefined
  );

  const filtered = (products ?? []).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false) ||
      ((p.tags as string[]) ?? []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[oklch(4.5%_0.002_240)]">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-medium text-primary tracking-widest uppercase mb-3"
            >
              Tienda
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-4xl md:text-5xl font-bold text-[oklch(96%_0.008_80)] mb-4"
            >
              Catálogo de{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Productos
              </span>
            </motion.h1>
            <div className="divider-gold" />
            <p className="text-[oklch(55%_0.01_240)] text-sm mt-4 max-w-lg mx-auto">
              Cabinas y mesas DJ de alta calidad. Entrega en CDMX o cotiza envío al interior de la república.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(45%_0.008_240)]" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[oklch(10%_0.004_240)] border border-[oklch(20%_0.006_240)] text-[oklch(90%_0.008_80)] placeholder-[oklch(35%_0.008_240)] outline-none focus:border-primary transition-colors"
              />
            </div>
            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap">
              {(["all", "cabina", "mesa_dj", "accesorio"] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    category === cat
                      ? "bg-primary text-[oklch(4.5%_0.002_240)]"
                      : "border border-[oklch(20%_0.006_240)] text-[oklch(65%_0.01_240)] hover:border-primary hover:text-primary"
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] h-80 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[oklch(45%_0.008_240)] text-sm">No se encontraron productos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product, i) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="card-hover group rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-square bg-[oklch(10%_0.004_240)] relative overflow-hidden">
                    {(product.images as string[])?.[0] ? (
                      <img
                        src={(product.images as string[])[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-[oklch(25%_0.008_240)]" />
                      </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[oklch(4.5%_0.002_240/0.8)] text-primary border border-primary/30">
                        {categoryLabels[product.category]}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-[oklch(96%_0.008_80)] mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.color && (
                      <p className="text-xs text-[oklch(50%_0.01_240)] mb-2">Color: {product.color}</p>
                    )}
                    {product.description && (
                      <p className="text-xs text-[oklch(55%_0.01_240)] line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}

                    {/* Tags */}
                    {((product.tags as string[]) ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {((product.tags as string[]) ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-[oklch(12%_0.004_240)] text-[oklch(50%_0.01_240)]">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <DeliveryBadge options={product.deliveryOptions as any} />

                    <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                      <span className="font-display text-xl font-bold text-primary">
                        ${Number(product.price).toLocaleString("es-MX")}
                      </span>
                      <div className="flex gap-2">
                        {product.amazonLink && (
                          <a
                            href={product.amazonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-[oklch(20%_0.006_240)] text-[oklch(55%_0.01_240)] hover:text-[oklch(70%_0.18_60)] hover:border-[oklch(70%_0.18_60/0.5)] transition-colors"
                            title="Ver en Amazon"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Link
                          href={`/producto/${product.slug}`}
                          className="btn-gold px-3 py-2 rounded-lg text-xs font-semibold"
                        >
                          Ver más
                        </Link>
                      </div>
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
