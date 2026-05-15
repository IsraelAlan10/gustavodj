import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CalendarDays, Loader2, CheckCircle2, Users, Clock, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const bookingSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(200),
  phone: z.string().min(10, "Teléfono inválido").max(20).regex(/^[0-9+\-\s()]+$/, "Solo números"),
  email: z.string().email("Correo inválido").max(320),
  eventDate: z.string().min(1, "Selecciona una fecha"),
  eventType: z.enum(["interior", "exterior"]),
  hours: z.number().int().min(5, "Mínimo 5 horas").max(24),
  people: z.number().int().min(10, "Mínimo 10 personas").max(5000),
  address: z.string().min(5, "Dirección requerida").max(500),
  packageType: z.enum(["dj", "premium"]),
  notes: z.string().max(1000).optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

function calcPrice(packageType: string, hours: number, people: number) {
  const base = packageType === "premium" ? 7500 : 5500;
  const extraHours = Math.max(0, hours - 5) * 1200;
  let extraPeople = 0;
  if (people > 300) extraPeople = 7500;
  else if (people > 200) extraPeople = 5500;
  else if (people > 100) extraPeople = 3000;
  return { base, extraHours, extraPeople, total: base + extraHours + extraPeople };
}

export default function BookingFormSection() {
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [, navigate] = useLocation();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { hours: 5, people: 50, packageType: "dj" },
  });

  const packageType = watch("packageType") ?? "dj";
  const hours = watch("hours") ?? 5;
  const people = watch("people") ?? 50;
  const pricing = calcPrice(packageType, Number(hours), Number(people));

  const createBooking = trpc.events.create.useMutation({
    onSuccess: (data) => {
      setBookingId(data.bookingId);
      setSubmitted(true);
    },
    onError: () => toast.error("Error al enviar la solicitud. Intenta de nuevo."),
  });

  const onSubmit = (data: BookingForm) => {
    const eventDate = new Date(data.eventDate + "T12:00:00.000Z").toISOString();
    createBooking.mutate({ ...data, eventDate });
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl text-sm bg-[oklch(10%_0.004_240)] border text-[oklch(90%_0.008_80)] placeholder-[oklch(35%_0.008_240)] outline-none transition-all duration-200 ${
      hasError
        ? "border-[oklch(55%_0.22_25)]"
        : "border-[oklch(20%_0.006_240)] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
    }`;

  const errorMsg = (msg?: string) =>
    msg ? <p className="mt-1.5 text-xs text-[oklch(65%_0.22_25)]">{msg}</p> : null;

  // Min date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <section id="contratar" className="section-padding bg-[oklch(4.5%_0.002_240)]" aria-label="Formulario de contratación">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs font-medium text-primary tracking-widest uppercase mb-3"
            >
              Reserva tu fecha
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-4xl md:text-5xl font-bold text-[oklch(96%_0.008_80)] mb-4"
            >
              Contrata tu{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--gold-300), var(--primary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                evento
              </span>
            </motion.h2>
            <div className="divider-gold" />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[oklch(55%_0.01_240)] text-sm mt-4"
            >
              Completa el formulario y asegura tu fecha con un anticipo de $1,500 vía Mercado Pago.
            </motion.p>
          </div>

          {submitted && bookingId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-8 rounded-2xl bg-[oklch(7%_0.003_240)] border border-primary/30"
            >
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-5" />
              <h3 className="font-display text-2xl font-bold text-[oklch(96%_0.008_80)] mb-3">
                ¡Solicitud recibida!
              </h3>
              <p className="text-[oklch(60%_0.01_240)] text-sm mb-2">
                Total estimado: <strong className="text-primary">${pricing.total.toLocaleString("es-MX")}</strong>
              </p>
              <p className="text-[oklch(60%_0.01_240)] text-sm mb-8">
                Para confirmar tu fecha, realiza el anticipo de <strong className="text-primary">$1,500</strong> vía Mercado Pago.
              </p>
              <button
                onClick={() => navigate(`/pago/evento/${bookingId}`)}
                className="btn-gold px-8 py-3.5 rounded-full text-sm font-semibold"
              >
                Pagar anticipo $1,500
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-2xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)]"
            >
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                {/* Personal info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">Nombre *</label>
                    <input {...register("name")} type="text" placeholder="Tu nombre completo" className={inputClass(!!errors.name)} />
                    {errorMsg(errors.name?.message)}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">Teléfono *</label>
                    <input {...register("phone")} type="tel" placeholder="55 1234 5678" className={inputClass(!!errors.phone)} />
                    {errorMsg(errors.phone?.message)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">Correo electrónico *</label>
                  <input {...register("email")} type="email" placeholder="tu@correo.com" className={inputClass(!!errors.email)} />
                  {errorMsg(errors.email?.message)}
                </div>

                {/* Package */}
                <div>
                  <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-3 uppercase tracking-wide">Paquete *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "dj", label: "Paquete DJ", price: "$5,500" },
                      { value: "premium", label: "Paquete Premium", price: "$7,500" },
                    ].map((pkg) => (
                      <label
                        key={pkg.value}
                        className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                          packageType === pkg.value
                            ? "border-primary bg-primary/8"
                            : "border-[oklch(20%_0.006_240)] hover:border-[oklch(35%_0.008_240)]"
                        }`}
                      >
                        <input {...register("packageType")} type="radio" value={pkg.value} className="sr-only" />
                        <div className="text-sm font-semibold text-[oklch(90%_0.008_80)]">{pkg.label}</div>
                        <div className="text-primary font-bold text-lg">{pkg.price}</div>
                        <div className="text-xs text-[oklch(50%_0.01_240)]">5 hrs base</div>
                      </label>
                    ))}
                  </div>
                  {errorMsg(errors.packageType?.message)}
                </div>

                {/* Date & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">Fecha del evento *</label>
                    <input {...register("eventDate")} type="date" min={minDate} className={inputClass(!!errors.eventDate)} style={{ colorScheme: "dark" }} />
                    {errorMsg(errors.eventDate?.message)}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">Tipo de espacio *</label>
                    <select {...register("eventType")} className={inputClass(!!errors.eventType)}>
                      <option value="" disabled>Seleccionar...</option>
                      <option value="interior">Interior (salón, hotel)</option>
                      <option value="exterior">Exterior (jardín, terraza)</option>
                    </select>
                    {errorMsg(errors.eventType?.message)}
                  </div>
                </div>

                {/* Hours & People */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">
                      <Clock className="inline w-3.5 h-3.5 mr-1" />Horas de servicio *
                    </label>
                    <Controller
                      name="hours"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min={5}
                          max={24}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                          className={inputClass(!!errors.hours)}
                        />
                      )}
                    />
                    {hours > 5 && (
                      <p className="text-xs text-primary mt-1">
                        +{hours - 5} hrs extra = +${((hours - 5) * 1200).toLocaleString("es-MX")}
                      </p>
                    )}
                    {errorMsg(errors.hours?.message)}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">
                      <Users className="inline w-3.5 h-3.5 mr-1" />Número de personas *
                    </label>
                    <Controller
                      name="people"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min={10}
                          max={5000}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                          className={inputClass(!!errors.people)}
                        />
                      )}
                    />
                    {people > 100 && (
                      <p className="text-xs text-primary mt-1">
                        Cargo adicional: +${pricing.extraPeople.toLocaleString("es-MX")}
                      </p>
                    )}
                    {errorMsg(errors.people?.message)}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">
                    <MapPin className="inline w-3.5 h-3.5 mr-1" />Dirección del evento *
                  </label>
                  <input {...register("address")} type="text" placeholder="Calle, número, colonia, alcaldía, CDMX" className={inputClass(!!errors.address)} />
                  {errorMsg(errors.address?.message)}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-[oklch(70%_0.01_240)] mb-1.5 uppercase tracking-wide">Notas adicionales</label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    placeholder="Preferencias musicales, detalles especiales, etc."
                    className={`${inputClass(false)} resize-none`}
                  />
                </div>

                {/* Price summary */}
                <div className="p-5 rounded-xl bg-[oklch(5%_0.002_240)] border border-primary/20">
                  <h4 className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Resumen de precio</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[oklch(70%_0.01_240)]">
                      <span>Paquete base ({packageType === "premium" ? "Premium" : "DJ"})</span>
                      <span>${pricing.base.toLocaleString("es-MX")}</span>
                    </div>
                    {pricing.extraHours > 0 && (
                      <div className="flex justify-between text-[oklch(70%_0.01_240)]">
                        <span>Horas extra ({hours - 5} hrs × $1,200)</span>
                        <span>+${pricing.extraHours.toLocaleString("es-MX")}</span>
                      </div>
                    )}
                    {pricing.extraPeople > 0 && (
                      <div className="flex justify-between text-[oklch(70%_0.01_240)]">
                        <span>Cargo por personas ({people} personas)</span>
                        <span>+${pricing.extraPeople.toLocaleString("es-MX")}</span>
                      </div>
                    )}
                    <div className="border-t border-[oklch(20%_0.006_240)] pt-2 flex justify-between font-bold text-[oklch(96%_0.008_80)]">
                      <span>Total estimado</span>
                      <span className="text-primary">${pricing.total.toLocaleString("es-MX")}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[oklch(55%_0.01_240)]">
                      <span>Anticipo para confirmar fecha</span>
                      <span className="text-primary font-semibold">$1,500</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createBooking.isPending}
                  className="btn-gold w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {createBooking.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Enviando solicitud...</>
                  ) : (
                    <><CalendarDays className="w-4 h-4" />Confirmar y pagar anticipo $1,500</>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
