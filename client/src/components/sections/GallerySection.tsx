import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

type VideoTile = { type: "video"; videoId: string; label: string };
type PhotoTile = { type: "photo"; src: string; alt: string };
type Tile = VideoTile | PhotoTile;

function VideoTile({ videoId, label }: { videoId: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] group cursor-pointer w-full h-full"
      style={{ aspectRatio: "16/9" }}
      onClick={() => setOpen(true)}
    >
      {open ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-7 h-7 text-black ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="inline-block text-xs font-medium bg-black/60 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              {label}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function PhotoTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] group w-full h-full"
      style={{ aspectRatio: "16/9" }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

const tiles: Tile[] = [
  { type: "video", videoId: "Lp7lkUm4NpM", label: "Ver video del evento" },
  { type: "photo", src: "/gallery-1.jpg", alt: "DJ en evento exterior con cabina dorada" },
  { type: "photo", src: "/gallery3.jpg", alt: "Setup profesional en Club France con mesa Denon DJ" },
  { type: "video", videoId: "EBnIbsNcci0", label: "Ver otro evento" },
];

export default function GallerySection() {
  return (
    <section id="galeria" className="section-padding bg-[oklch(3%_0.002_240)]" aria-label="Galería de eventos">
      <div className="container">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-medium text-primary tracking-widest uppercase mb-3"
          >
            Nuestro trabajo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl md:text-5xl font-bold text-[oklch(96%_0.008_80)] mb-4"
          >
            Eventos{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Reales
            </span>
          </motion.h2>
          <div className="divider-gold" />
          <p className="text-[oklch(55%_0.01_240)] text-sm mt-4">
            Cada evento es único. Aquí un vistazo a lo que creamos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tiles.map((tile, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {tile.type === "video" ? (
                <VideoTile videoId={tile.videoId} label={tile.label} />
              ) : (
                <PhotoTile src={tile.src} alt={tile.alt} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
