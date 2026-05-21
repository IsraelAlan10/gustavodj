import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Truck, MapPin, Tag, ExternalLink, ShoppingCart, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const WHATSAPP_BASE = "https://wa.me/5215500000000?text=Hola%2C%20me%20interesa%20el%20producto%3A%20";

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const [activeImg, setActiveImg] = useState(0);
  const [, navigate] = useLocation();

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({ slug: params.slug });

  if (isLoading) {
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
        <Link href="/tienda" className="text-primary hover:underline text-sm">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const images = (product.images as string[]) ?? [];
  const tags = (product.tags as string[]) ?? [];
  const delivery = product.deliveryOptions as { cdmxFree: boolean; cdmxPaid: boolean; cdmxPrice: number; interior: boolean } | null;

  return (
    <div className="min-h-screen bg-[oklch(4.5%_0.002_240)]">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/tienda")}
            className="flex items-center gap-2 text-sm text-[oklch(55%_0.01_240)] hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="aspect-square rounded-2xl overflow-hidden bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] mb-4"
              >
                {images[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-20 h-20 text-[oklch(25%_0.008_240)]" />
                  </div>
                )}
              </motion.div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImg === i ? "border-primary" : "border-[oklch(18%_0.006_240)]"
                      }`}
                    >
                      <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="mb-2">
                <span className="text-xs font-medium text-primary uppercase tracking-widest">
                  {product.category === "cabina" ? "Cabina" : product.category === "mesa_dj" ? "Mesa DJ" : "Accesorio"}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-[oklch(96%_0.008_80)] mb-3">
                {product.name}
              </h1>

              <div className="font-display text-4xl font-bold text-primary mb-6">
                ${Number(product.price).toLocaleString("es-MX")}
              </div>

              {product.description && (
                <p className="text-[oklch(65%_0.01_240)] text-sm leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* Specs */}
              {(product.dimensions || product.color) && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {product.dimensions && (
                    <div className="p-3 rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)]">
                      <div className="text-xs text-[oklch(45%_0.008_240)] mb-1">Medidas</div>
                      <div className="text-sm text-[oklch(85%_0.01_80)]">{product.dimensions}</div>
                    </div>
                  )}
                  {product.color && (
                    <div className="p-3 rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)]">
                      <div className="text-xs text-[oklch(45%_0.008_240)] mb-1">Color</div>
                      <div className="text-sm text-[oklch(85%_0.01_80)]">{product.color}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-[oklch(12%_0.004_240)] border border-[oklch(22%_0.006_240)] text-[oklch(55%_0.01_240)]">
                      <Tag className="w-3 h-3" />{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Delivery */}
              {delivery && (
                <div className="p-5 rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] mb-6">
                  <h3 className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
                    Opciones de entrega
                  </h3>
                  <div className="space-y-2.5">
                    {delivery.cdmxFree && (
                      <div className="flex items-center gap-2.5 text-sm text-[oklch(70%_0.01_240)]">
                        <Truck className="w-4 h-4 text-[oklch(55%_0.18_145)]" />
                        <span>Entrega gratis en CDMX (hasta 5km del Estadio Azteca)</span>
                      </div>
                    )}
                    {delivery.cdmxPaid && !delivery.cdmxFree && (
                      <div className="flex items-center gap-2.5 text-sm text-[oklch(70%_0.01_240)]">
                        <Truck className="w-4 h-4 text-primary" />
                        <span>Entrega a domicilio CDMX: ${delivery.cdmxPrice}</span>
                      </div>
                    )}
                    {delivery.interior && (
                      <div className="flex items-center gap-2.5 text-sm text-[oklch(70%_0.01_240)]">
                        <MapPin className="w-4 h-4 text-[oklch(55%_0.01_240)]" />
                        <span>Interior de la república: cotizar por WhatsApp</span>
                      </div>
                    )}
                    <div className="text-xs text-[oklch(45%_0.008_240)] mt-2">
                      Bodegas en Querétaro y Guadalajara · Muebles a la medida disponibles
                    </div>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/pago/producto/${product.id}`)}
                  className="btn-gold flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Comprar ahora
                </button>
                {product.amazonLink && (
                  <a
                    href={product.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold border border-[oklch(70%_0.18_60/0.5)] text-[oklch(70%_0.18_60)] hover:bg-[oklch(70%_0.18_60/0.08)] transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver en Amazon
                  </a>
                )}
                <a
                  href={`${WHATSAPP_BASE}${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-4 rounded-xl text-sm border border-[oklch(20%_0.006_240)] text-[oklch(55%_0.01_240)] hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Cotizar
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
