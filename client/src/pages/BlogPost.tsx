import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function renderMedia(url: string) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("youtu.be/")[1]?.split("?")[0];
    return <iframe className="w-full aspect-video rounded-2xl border border-[oklch(18%_0.006_240)] shadow-lg" src={`https://www.youtube.com/embed/${videoId}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
  }
  if (url.includes("spotify.com")) {
    const embedUrl = url.replace("spotify.com/", "spotify.com/embed/");
    return <iframe className="w-full h-[152px] rounded-2xl shadow-lg" src={embedUrl} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />;
  }
  if (url.includes("soundcloud.com")) {
    return <iframe className="w-full h-[166px] rounded-2xl shadow-lg" scrolling="no" frameBorder="no" allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23d4af37&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`} />;
  }
  // Fallback iframe or link
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
      Ver contenido multimedia externo
    </a>
  );
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [, navigate] = useLocation();
  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug: params.slug });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[oklch(4.5%_0.002_240)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[oklch(4.5%_0.002_240)] flex flex-col items-center justify-center gap-4">
        <p className="text-[oklch(55%_0.01_240)]">Artículo no encontrado.</p>
        <button onClick={() => navigate("/blog")} className="text-primary hover:underline text-sm">
          Volver al blog
        </button>
      </div>
    );
  }

  // Format content to respect line breaks if it doesn't have block HTML tags
  const hasHtml = /<[a-z][\s\S]*>/i.test(post.content);
  const formattedContent = hasHtml ? post.content : post.content.replace(/\n/g, '<br />');

  return (
    <div className="min-h-screen bg-[oklch(4.5%_0.002_240)]">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container max-w-3xl">
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-sm text-[oklch(55%_0.01_240)] hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </button>

          {/* Featured media */}
          {(post.mediaUrl || post.featuredImage) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {post.mediaUrl ? (
                renderMedia(post.mediaUrl)
              ) : (
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border border-[oklch(18%_0.006_240)]">
                  <img src={post.featuredImage!} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {(post.tags as string[])?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {((post.tags as string[]) ?? []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-[oklch(12%_0.004_240)] border border-[oklch(22%_0.006_240)] text-[oklch(55%_0.01_240)]">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[oklch(96%_0.008_80)] mb-4 leading-tight">
              {post.title}
            </h1>
            {post.publishedAt && (
              <div className="flex items-center gap-2 text-sm text-[oklch(50%_0.01_240)]">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-sm md:prose-base max-w-none
              prose-headings:font-display prose-headings:text-[oklch(96%_0.008_80)]
              prose-p:text-[oklch(65%_0.01_240)] prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[oklch(85%_0.01_80)]
              prose-img:rounded-xl prose-img:border prose-img:border-[oklch(18%_0.006_240)]
              prose-blockquote:border-primary prose-blockquote:text-[oklch(60%_0.01_240)]
              prose-code:text-primary prose-code:bg-[oklch(10%_0.004_240)] prose-code:px-1 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
