import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

const leadSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre demasiado largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "Solo se permiten letras y espacios"),
  phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "Teléfono demasiado largo")
    .regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido"),
  email: z
    .string()
    .email("Correo electrónico inválido")
    .max(320, "Correo demasiado largo")
    .toLowerCase(),
});

type LeadForm = z.infer<typeof leadSchema>;

export default function LeadFormSection() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadForm>({ resolver: zodResolver(leadSchema) });

  const createLead = trpc.leads.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      reset();
    },
    onError: (err) => {
      toast.error("Ocurrió un error. Intenta de nuevo.");
      console.error(err);
    },
  });

  const onSubmit = (data: LeadForm) => {
    createLead.mutate(data);
  };

  return (
    <section id="contacto" className="section-padding bg-[oklch(3%_0.002_240)]" aria-label="Formulario de contacto">
      <div className="container">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs font-medium text-primary tracking-widest uppercase mb-3"
            >
              Cotización gratuita
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-3xl md:text-4xl font-bold text-[oklch(96%_0.008_80)] mb-3"
            >
              ¿Listo para tu evento?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[oklch(55%_0.01_240)] text-sm"
            >
              Déjanos tus datos y te contactamos en menos de 24 horas.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)]"
          >
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-[oklch(96%_0.008_80)] mb-2">
                  ¡Mensaje recibido!
                </h3>
                <p className="text-[oklch(55%_0.01_240)] text-sm mb-6">
                  Te contactaremos pronto para hablar sobre tu evento.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">
                    Nombre completo *
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-[oklch(10%_0.004_240)] border text-[oklch(90%_0.008_80)] placeholder-[oklch(35%_0.008_240)] outline-none transition-all duration-200 ${
                      errors.name
                        ? "border-[oklch(55%_0.22_25)] focus:border-[oklch(55%_0.22_25)]"
                        : "border-[oklch(20%_0.006_240)] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-[oklch(65%_0.22_25)]">{errors.name.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">
                    Teléfono *
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    autoComplete="tel"
                    placeholder="55 1234 5678"
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-[oklch(10%_0.004_240)] border text-[oklch(90%_0.008_80)] placeholder-[oklch(35%_0.008_240)] outline-none transition-all duration-200 ${
                      errors.phone
                        ? "border-[oklch(55%_0.22_25)] focus:border-[oklch(55%_0.22_25)]"
                        : "border-[oklch(20%_0.006_240)] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-[oklch(65%_0.22_25)]">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">
                    Correo electrónico *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-[oklch(10%_0.004_240)] border text-[oklch(90%_0.008_80)] placeholder-[oklch(35%_0.008_240)] outline-none transition-all duration-200 ${
                      errors.email
                        ? "border-[oklch(55%_0.22_25)] focus:border-[oklch(55%_0.22_25)]"
                        : "border-[oklch(20%_0.006_240)] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-[oklch(65%_0.22_25)]">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || createLead.isPending}
                  className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createLead.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Solicitar cotización
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-[oklch(40%_0.008_240)]">
                  Tus datos están protegidos y nunca serán compartidos con terceros.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
