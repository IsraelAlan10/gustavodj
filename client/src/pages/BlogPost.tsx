import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

          {/* Featured image */}
          {post.featuredImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video rounded-2xl overflow-hidden mb-8"
            >
              <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
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
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
