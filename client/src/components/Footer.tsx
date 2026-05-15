import { Music2, Instagram, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[oklch(3%_0.002_240)] border-t border-[oklch(18%_0.006_240)]">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(73%_0.16_78)] to-[oklch(48%_0.13_70)] flex items-center justify-center">
                <Music2 className="w-5 h-5 text-[oklch(4.5%_0.002_240)]" />
              </div>
              <span className="font-display font-bold text-lg text-[oklch(96%_0.008_80)]">
                DJ Producción <span className="text-primary">CDMX</span>
              </span>
            </div>
            <p className="text-[oklch(55%_0.01_240)] text-sm leading-relaxed max-w-xs">
              Servicio profesional de DJ, producción musical e iluminación para eventos en la Ciudad de México. Hacemos que tu evento sea inolvidable.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://wa.me/5215500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-[oklch(18%_0.006_240)] flex items-center justify-center text-[oklch(55%_0.01_240)] hover:text-primary hover:border-primary transition-all duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/djproduccioncdmx"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-[oklch(18%_0.006_240)] flex items-center justify-center text-[oklch(55%_0.01_240)] hover:text-primary hover:border-primary transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-[oklch(96%_0.008_80)] mb-4 text-sm uppercase tracking-widest">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Servicios", href: "/#servicios" },
                { label: "Precios", href: "/#precios" },
                { label: "Catálogo", href: "/catalogo" },
                { label: "Blog", href: "/blog" },
                { label: "Contratar", href: "/#contratar" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[oklch(55%_0.01_240)] hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-[oklch(96%_0.008_80)] mb-4 text-sm uppercase tracking-widest">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-[oklch(55%_0.01_240)]">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>Ciudad de México, México</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[oklch(55%_0.01_240)]">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+5215500000000" className="hover:text-primary transition-colors">
                  +52 55 0000 0000
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[oklch(55%_0.01_240)]">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:contacto@djproduccioncdmx.com" className="hover:text-primary transition-colors">
                  contacto@djproduccioncdmx.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[oklch(18%_0.006_240)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[oklch(40%_0.008_240)]">
            © {year} DJ Producción CDMX. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-[oklch(40%_0.008_240)]">
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
