import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Music2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#precios", label: "Precios" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#faqs", label: "FAQs" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleAnchor = (href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      if (location !== "/") {
        window.location.href = "/" + href;
        return;
      }
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-[oklch(4.5%_0.002_240/0.95)] backdrop-blur-xl border-b border-[oklch(18%_0.006_240)]"
        : "bg-transparent"
        }`}
    >
      <nav className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo2.png"
            alt="Gustavo Delgadillo Logo"
            className="w-20 h-25 object-contain"
          />
          <span className="font-display font-bold text-lg tracking-tight text-[oklch(96%_0.008_80)] group-hover:text-primary transition-colors">
            Gustavo Delgadillo
            <span className="text-primary"> DJ y Cabinas</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.href.startsWith("#") ? (
                <button
                  onClick={() => handleAnchor(link.href)}
                  className="text-sm font-medium text-[oklch(75%_0.01_240)] hover:text-primary transition-colors duration-200 tracking-wide uppercase"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  href={link.href}
                  className="text-sm font-medium text-[oklch(75%_0.01_240)] hover:text-primary transition-colors duration-200 tracking-wide uppercase"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#contratar"
            onClick={(e) => { e.preventDefault(); handleAnchor("#contratar"); }}
            className="btn-gold px-5 py-2.5 rounded-full text-sm"
          >
            Contratar Ahora
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[oklch(75%_0.01_240)] hover:text-primary transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden overflow-hidden bg-[oklch(7%_0.003_240/0.98)] backdrop-blur-xl border-b border-[oklch(18%_0.006_240)]"
          >
            <ul className="container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("#") ? (
                    <button
                      onClick={() => handleAnchor(link.href)}
                      className="w-full text-left text-base font-medium text-[oklch(85%_0.01_80)] hover:text-primary transition-colors py-1"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block text-base font-medium text-[oklch(85%_0.01_80)] hover:text-primary transition-colors py-1"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="#contratar"
                  onClick={(e) => { e.preventDefault(); handleAnchor("#contratar"); }}
                  className="btn-gold w-full block text-center px-5 py-3 rounded-full text-sm"
                >
                  Contratar Ahora
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
