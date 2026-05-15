import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, CalendarDays, FileText, Users,
  ShoppingBag, LogOut, Menu, X, Plus, Pencil, Trash2,
  CheckCircle2, XCircle, Clock, Upload, Eye, EyeOff
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

type AdminTab = "dashboard" | "leads" | "events" | "products" | "orders" | "blog";

// ─── Auth Guard ────────────────────────────────────────────────────────────────
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[oklch(4.5%_0.002_240)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[oklch(4.5%_0.002_240)] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-[oklch(96%_0.008_80)] mb-2">
            Panel de Administrador
          </h1>
          <p className="text-[oklch(55%_0.01_240)] text-sm">Inicia sesión para acceder al panel.</p>
        </div>
        <a href={getLoginUrl()} className="btn-gold px-8 py-3.5 rounded-full text-sm font-semibold">
          Iniciar sesión
        </a>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[oklch(4.5%_0.002_240)] flex flex-col items-center justify-center gap-4 px-4">
        <XCircle className="w-12 h-12 text-[oklch(55%_0.22_25)]" />
        <p className="text-[oklch(70%_0.01_240)]">No tienes permisos de administrador.</p>
        <a href="/" className="text-sm text-primary hover:underline">Volver al inicio</a>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Users },
  { id: "events", label: "Eventos", icon: CalendarDays },
  { id: "products", label: "Productos", icon: Package },
  { id: "orders", label: "Órdenes", icon: ShoppingBag },
  { id: "blog", label: "Blog", icon: FileText },
];

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: leads } = trpc.leads.list.useQuery();
  const { data: events } = trpc.events.list.useQuery();
  const { data: orders } = trpc.orders.list.useQuery();

  const stats = [
    { label: "Leads totales", value: leads?.length ?? 0, color: "var(--primary)" },
    { label: "Eventos solicitados", value: events?.length ?? 0, color: "oklch(60% 0.18 240)" },
    { label: "Órdenes", value: orders?.length ?? 0, color: "oklch(55% 0.18 145)" },
    {
      label: "Ingresos confirmados",
      value: `$${(orders ?? []).filter(o => o.paymentStatus === "approved").reduce((s, o) => s + Number(o.amount), 0).toLocaleString("es-MX")}`,
      color: "oklch(73% 0.16 78)",
    },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[oklch(96%_0.008_80)] mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)]">
            <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-[oklch(50%_0.01_240)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div className="rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[oklch(18%_0.006_240)]">
          <h3 className="font-semibold text-[oklch(90%_0.008_80)] text-sm">Últimos eventos</h3>
        </div>
        <div className="divide-y divide-[oklch(12%_0.004_240)]">
          {(events ?? []).slice(0, 5).map((ev) => (
            <div key={ev.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[oklch(85%_0.01_80)]">{ev.name}</div>
                <div className="text-xs text-[oklch(45%_0.008_240)]">
                  {new Date(ev.eventDate).toLocaleDateString("es-MX")} · {ev.packageType.toUpperCase()}
                </div>
              </div>
              <StatusBadge status={ev.status} />
            </div>
          ))}
          {!events?.length && (
            <div className="px-5 py-6 text-center text-xs text-[oklch(40%_0.008_240)]">Sin eventos aún</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pendiente", color: "oklch(70% 0.18 60)", bg: "oklch(70% 0.18 60 / 0.1)" },
    confirmed: { label: "Confirmado", color: "oklch(55% 0.18 145)", bg: "oklch(55% 0.18 145 / 0.1)" },
    cancelled: { label: "Cancelado", color: "oklch(55% 0.22 25)", bg: "oklch(55% 0.22 25 / 0.1)" },
    approved: { label: "Aprobado", color: "oklch(55% 0.18 145)", bg: "oklch(55% 0.18 145 / 0.1)" },
    rejected: { label: "Rechazado", color: "oklch(55% 0.22 25)", bg: "oklch(55% 0.22 25 / 0.1)" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

// ─── Leads Tab ─────────────────────────────────────────────────────────────────
function LeadsTab() {
  const { data: leads, isLoading } = trpc.leads.list.useQuery();
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[oklch(96%_0.008_80)] mb-6">Leads</h2>
      <div className="rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[oklch(18%_0.006_240)]">
                {["Nombre", "Teléfono", "Correo", "Fuente", "Fecha"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[oklch(50%_0.01_240)] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[oklch(12%_0.004_240)]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-[oklch(40%_0.008_240)]">Cargando...</td></tr>
              ) : (leads ?? []).map((lead) => (
                <tr key={lead.id} className="hover:bg-[oklch(9%_0.003_240)] transition-colors">
                  <td className="px-4 py-3 text-[oklch(85%_0.01_80)]">{lead.name}</td>
                  <td className="px-4 py-3 text-[oklch(65%_0.01_240)]">{lead.phone}</td>
                  <td className="px-4 py-3 text-[oklch(65%_0.01_240)]">{lead.email}</td>
                  <td className="px-4 py-3 text-[oklch(50%_0.01_240)]">{lead.source ?? "landing"}</td>
                  <td className="px-4 py-3 text-[oklch(45%_0.008_240)] text-xs">
                    {new Date(lead.createdAt).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              ))}
              {!isLoading && !leads?.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-[oklch(40%_0.008_240)]">Sin leads aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Events Tab ────────────────────────────────────────────────────────────────
function EventsTab() {
  const { data: events, isLoading, refetch } = trpc.events.list.useQuery();
  const updateStatus = trpc.events.updateStatus.useMutation({ onSuccess: () => { refetch(); toast.success("Estado actualizado"); } });

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[oklch(96%_0.008_80)] mb-6">Eventos</h2>
      <div className="rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[oklch(18%_0.006_240)]">
                {["Cliente", "Fecha", "Paquete", "Personas", "Total", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[oklch(50%_0.01_240)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[oklch(12%_0.004_240)]">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-[oklch(40%_0.008_240)]">Cargando...</td></tr>
              ) : (events ?? []).map((ev) => (
                <tr key={ev.id} className="hover:bg-[oklch(9%_0.003_240)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-[oklch(85%_0.01_80)]">{ev.name}</div>
                    <div className="text-xs text-[oklch(45%_0.008_240)]">{ev.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[oklch(65%_0.01_240)]">
                    {new Date(ev.eventDate).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-primary capitalize">{ev.packageType}</td>
                  <td className="px-4 py-3 text-[oklch(65%_0.01_240)]">{ev.people}</td>
                  <td className="px-4 py-3 text-primary font-semibold">
                    ${Number(ev.totalPrice).toLocaleString("es-MX")}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={ev.status}
                      onChange={(e) => updateStatus.mutate({ id: ev.id, status: e.target.value as any })}
                      className="text-xs bg-[oklch(12%_0.004_240)] border border-[oklch(22%_0.006_240)] text-[oklch(75%_0.01_240)] rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmar</option>
                      <option value="cancelled">Cancelar</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!isLoading && !events?.length && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-[oklch(40%_0.008_240)]">Sin eventos aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const { data: products, isLoading, refetch } = trpc.products.list.useQuery();
  const deleteProduct = trpc.products.delete.useMutation({ onSuccess: () => { refetch(); toast.success("Producto eliminado"); } });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-[oklch(96%_0.008_80)]">Productos</h2>
        <button
          onClick={() => { setEditId(null); setShowForm(true); }}
          className="btn-gold px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />Agregar producto
        </button>
      </div>

      {showForm && (
        <ProductForm
          editId={editId}
          onClose={() => { setShowForm(false); setEditId(null); refetch(); }}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-[oklch(7%_0.003_240)] animate-pulse" />
          ))
        ) : (products ?? []).map((p) => (
          <div key={p.id} className="p-4 rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold text-sm text-[oklch(90%_0.008_80)] line-clamp-1">{p.name}</div>
                <div className="text-xs text-[oklch(50%_0.01_240)] capitalize">{p.category}</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => { setEditId(p.id); setShowForm(true); }}
                  className="p-1.5 rounded-lg border border-[oklch(22%_0.006_240)] text-[oklch(55%_0.01_240)] hover:text-primary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { if (confirm("¿Eliminar este producto?")) deleteProduct.mutate({ id: p.id }); }}
                  className="p-1.5 rounded-lg border border-[oklch(22%_0.006_240)] text-[oklch(55%_0.01_240)] hover:text-[oklch(55%_0.22_25)] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-primary font-bold">${Number(p.price).toLocaleString("es-MX")}</div>
            {p.dimensions && <div className="text-xs text-[oklch(45%_0.008_240)] mt-1">{p.dimensions}</div>}
          </div>
        ))}
        {!isLoading && !products?.length && (
          <div className="col-span-full text-center py-12 text-xs text-[oklch(40%_0.008_240)]">
            Sin productos. Agrega el primero.
          </div>
        )}
      </div>
    </div>
  );
}

function ProductForm({ editId, onClose }: { editId: number | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"cabina" | "mesa_dj" | "accesorio">("cabina");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [color, setColor] = useState("");
  const [amazonLink, setAmazonLink] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const createProduct = trpc.products.create.useMutation({ onSuccess: () => { toast.success("Producto creado"); onClose(); } });
  const updateProduct = trpc.products.update.useMutation({ onSuccess: () => { toast.success("Producto actualizado"); onClose(); } });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setImages((prev) => [...prev, data.url]);
    } catch { toast.error("Error al subir imagen"); }
    finally { setUploading(false); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name, price: parseFloat(price), category, description, dimensions, color,
      amazonLink: amazonLink || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      images,
      deliveryOptions: { cdmxFree: false, cdmxPaid: true, cdmxPrice: 200, interior: true },
    };
    if (editId) updateProduct.mutate({ id: editId, ...data });
    else createProduct.mutate(data);
  }

  return (
    <div className="mb-6 p-6 rounded-xl bg-[oklch(7%_0.003_240)] border border-primary/30">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[oklch(90%_0.008_80)]">{editId ? "Editar" : "Nuevo"} producto</h3>
        <button onClick={onClose} className="text-[oklch(45%_0.008_240)] hover:text-[oklch(70%_0.01_240)]"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="admin-label">Nombre *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="admin-input" placeholder="Nombre del producto" />
        </div>
        <div>
          <label className="admin-label">Precio (MXN) *</label>
          <input value={price} onChange={e => setPrice(e.target.value)} required type="number" min="0" step="0.01" className="admin-input" placeholder="0.00" />
        </div>
        <div>
          <label className="admin-label">Categoría *</label>
          <select value={category} onChange={e => setCategory(e.target.value as any)} className="admin-input">
            <option value="cabina">Cabina</option>
            <option value="mesa_dj">Mesa DJ</option>
            <option value="accesorio">Accesorio</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Medidas</label>
          <input value={dimensions} onChange={e => setDimensions(e.target.value)} className="admin-input" placeholder="120x80x100 cm" />
        </div>
        <div>
          <label className="admin-label">Color</label>
          <input value={color} onChange={e => setColor(e.target.value)} className="admin-input" placeholder="Negro mate" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="admin-input resize-none" placeholder="Descripción del producto..." />
        </div>
        <div>
          <label className="admin-label">Tags (separados por coma)</label>
          <input value={tags} onChange={e => setTags(e.target.value)} className="admin-input" placeholder="profesional, cabina, dj" />
        </div>
        <div>
          <label className="admin-label">Link de Amazon</label>
          <input value={amazonLink} onChange={e => setAmazonLink(e.target.value)} type="url" className="admin-input" placeholder="https://amazon.com.mx/..." />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Imágenes</label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-[oklch(25%_0.008_240)] text-[oklch(65%_0.01_240)] hover:border-primary hover:text-primary transition-colors text-xs">
              {uploading ? <><div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />Subiendo...</> : <><Upload className="w-3.5 h-3.5" />Subir imagen</>}
              <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={uploading} />
            </label>
            {images.map((img, i) => (
              <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[oklch(22%_0.006_240)]">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[oklch(22%_0.006_240)] text-[oklch(65%_0.01_240)] text-xs hover:border-[oklch(35%_0.008_240)] transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="btn-gold px-5 py-2 rounded-lg text-xs font-semibold">
            {(createProduct.isPending || updateProduct.isPending) ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const { data: orders, isLoading } = trpc.orders.list.useQuery();

  const grouped = (orders ?? []).reduce<Record<string, typeof orders>>((acc, o) => {
    const key = o.orderType;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(o);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[oklch(96%_0.008_80)] mb-6">Registro de Ventas</h2>
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-8">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            {type === "event_deposit" ? "Anticipos de eventos" : "Ventas de productos"}
          </h3>
          <div className="rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[oklch(18%_0.006_240)]">
                    {["#", "Cliente", "Correo", "Monto", "Estado", "Fecha"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[oklch(50%_0.01_240)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[oklch(12%_0.004_240)]">
                  {(items ?? []).map((o) => (
                    <tr key={o!.id} className="hover:bg-[oklch(9%_0.003_240)] transition-colors">
                      <td className="px-4 py-3 text-[oklch(45%_0.008_240)] text-xs">#{o!.id}</td>
                      <td className="px-4 py-3 text-[oklch(85%_0.01_80)]">{o!.buyerName}</td>
                      <td className="px-4 py-3 text-[oklch(55%_0.01_240)] text-xs">{o!.buyerEmail}</td>
                      <td className="px-4 py-3 text-primary font-semibold">
                        ${Number(o!.amount).toLocaleString("es-MX")}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={o!.paymentStatus} /></td>
                      <td className="px-4 py-3 text-[oklch(45%_0.008_240)] text-xs">
                        {new Date(o!.createdAt).toLocaleDateString("es-MX")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
      {!isLoading && !orders?.length && (
        <div className="text-center py-12 text-xs text-[oklch(40%_0.008_240)]">Sin órdenes aún</div>
      )}
    </div>
  );
}

// ─── Blog Tab ──────────────────────────────────────────────────────────────────
function BlogTab() {
  const { data: posts, isLoading, refetch } = trpc.blog.list.useQuery({ published: undefined as any });
  const deletePost = trpc.blog.delete.useMutation({ onSuccess: () => { refetch(); toast.success("Artículo eliminado"); } });
  const updatePost = trpc.blog.update.useMutation({ onSuccess: () => { refetch(); toast.success("Artículo actualizado"); } });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-[oklch(96%_0.008_80)]">Blog</h2>
        <button
          onClick={() => { setEditId(null); setShowForm(true); }}
          className="btn-gold px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />Nuevo artículo
        </button>
      </div>

      {showForm && (
        <BlogPostForm
          editId={editId}
          onClose={() => { setShowForm(false); setEditId(null); refetch(); }}
        />
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[oklch(7%_0.003_240)] animate-pulse" />
          ))
        ) : (posts ?? []).map((post) => (
          <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-[oklch(7%_0.003_240)] border border-[oklch(18%_0.006_240)]">
            {post.featuredImage && (
              <img src={post.featuredImage} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[oklch(90%_0.008_80)] line-clamp-1">{post.title}</div>
              <div className="text-xs text-[oklch(45%_0.008_240)]">
                {post.published ? `Publicado ${new Date(post.publishedAt!).toLocaleDateString("es-MX")}` : "Borrador"}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updatePost.mutate({ id: post.id, published: !post.published })}
                className="p-1.5 rounded-lg border border-[oklch(22%_0.006_240)] text-[oklch(55%_0.01_240)] hover:text-primary transition-colors"
                title={post.published ? "Despublicar" : "Publicar"}
              >
                {post.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setEditId(post.id); setShowForm(true); }}
                className="p-1.5 rounded-lg border border-[oklch(22%_0.006_240)] text-[oklch(55%_0.01_240)] hover:text-primary transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { if (confirm("¿Eliminar este artículo?")) deletePost.mutate({ id: post.id }); }}
                className="p-1.5 rounded-lg border border-[oklch(22%_0.006_240)] text-[oklch(55%_0.01_240)] hover:text-[oklch(55%_0.22_25)] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && !posts?.length && (
          <div className="text-center py-12 text-xs text-[oklch(40%_0.008_240)]">Sin artículos. Crea el primero.</div>
        )}
      </div>
    </div>
  );
}

function BlogPostForm({ editId, onClose }: { editId: number | null; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState("");

  const createPost = trpc.blog.create.useMutation({ onSuccess: () => { toast.success("Artículo creado"); onClose(); } });
  const updatePost = trpc.blog.update.useMutation({ onSuccess: () => { toast.success("Artículo actualizado"); onClose(); } });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setFeaturedImage(data.url);
    } catch { toast.error("Error al subir imagen"); }
    finally { setUploading(false); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title, excerpt, content,
      featuredImage: featuredImage || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      published,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDesc || undefined,
    };
    if (editId) updatePost.mutate({ id: editId, ...data });
    else createPost.mutate(data);
  }

  return (
    <div className="mb-6 p-6 rounded-xl bg-[oklch(7%_0.003_240)] border border-primary/30">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[oklch(90%_0.008_80)]">{editId ? "Editar" : "Nuevo"} artículo</h3>
        <button onClick={onClose} className="text-[oklch(45%_0.008_240)] hover:text-[oklch(70%_0.01_240)]"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="admin-label">Título *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required className="admin-input" placeholder="Título del artículo" />
        </div>
        <div>
          <label className="admin-label">Extracto</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className="admin-input resize-none" placeholder="Breve descripción para SEO y listados..." />
        </div>
        <div>
          <label className="admin-label">Contenido * (HTML o texto)</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} required rows={10} className="admin-input resize-y font-mono text-xs" placeholder="<p>Contenido del artículo...</p>" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Tags</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className="admin-input" placeholder="dj, música, eventos" />
          </div>
          <div>
            <label className="admin-label">Imagen destacada</label>
            <label className="cursor-pointer flex items-center gap-2 admin-input">
              {uploading ? "Subiendo..." : featuredImage ? "Cambiar imagen" : "Subir imagen"}
              <input type="file" accept="image/*,video/*" className="sr-only" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Meta título (SEO)</label>
            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="admin-input" placeholder="Título para Google" />
          </div>
          <div>
            <label className="admin-label">Meta descripción (SEO)</label>
            <input value={metaDesc} onChange={e => setMetaDesc(e.target.value)} className="admin-input" placeholder="Descripción para Google" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4 accent-primary" />
          <label htmlFor="published" className="text-sm text-[oklch(70%_0.01_240)]">Publicar inmediatamente</label>
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[oklch(22%_0.006_240)] text-[oklch(65%_0.01_240)] text-xs hover:border-[oklch(35%_0.008_240)] transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={createPost.isPending || updatePost.isPending} className="btn-gold px-5 py-2 rounded-lg text-xs font-semibold">
            {(createPost.isPending || updatePost.isPending) ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  const tabComponents: Record<AdminTab, React.ReactNode> = {
    dashboard: <DashboardTab />,
    leads: <LeadsTab />,
    events: <EventsTab />,
    products: <ProductsTab />,
    orders: <OrdersTab />,
    blog: <BlogTab />,
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[oklch(3%_0.002_240)] flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-[oklch(5%_0.002_240)] border-r border-[oklch(12%_0.004_240)] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>
          <div className="p-5 border-b border-[oklch(12%_0.004_240)]">
            <div className="font-display text-lg font-bold text-primary">DJ Producción</div>
            <div className="text-xs text-[oklch(45%_0.008_240)] mt-0.5">Panel de administrador</div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-[oklch(55%_0.01_240)] hover:bg-[oklch(8%_0.003_240)] hover:text-[oklch(75%_0.01_240)]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-[oklch(12%_0.004_240)]">
            <div className="px-3 py-2 mb-1">
              <div className="text-xs font-medium text-[oklch(70%_0.01_240)]">{user?.name}</div>
              <div className="text-xs text-[oklch(40%_0.008_240)]">{user?.email}</div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[oklch(55%_0.01_240)] hover:bg-[oklch(8%_0.003_240)] hover:text-[oklch(55%_0.22_25)] transition-all"
            >
              <LogOut className="w-4 h-4" />Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 border-b border-[oklch(12%_0.004_240)] flex items-center gap-3 px-5">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[oklch(55%_0.01_240)] hover:text-[oklch(75%_0.01_240)]">
              <Menu className="w-5 h-5" />
            </button>
            <a href="/" className="text-xs text-[oklch(45%_0.008_240)] hover:text-primary transition-colors ml-auto">
              Ver sitio →
            </a>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tabComponents[activeTab]}
            </motion.div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
