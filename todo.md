# DJ Producción CDMX — Project TODO

## Fase 2: Esquema DB y estructura
- [x] Definir y migrar tablas: leads, events, products, orders, blog_posts, bookings
- [x] Crear helpers en server/db.ts para cada entidad
- [x] Configurar estilos globales: paleta oscura/dorada, tipografía refinada, tokens CSS

## Fase 3: Estilos globales
- [x] Paleta de colores: fondo oscuro (#0A0A0A), dorado (#C9A84C), blanco roto (#F5F0E8)
- [x] Tipografía: Playfair Display (headings) + Inter (body)
- [x] Tokens CSS en index.css
- [x] Animaciones base (framer-motion)

## Fase 4: Landing Page
- [x] Sección Hero con headline y CTA principal
- [x] Sección Servicios (DJ, producción, iluminación, pirotecnia)
- [x] Sección Precios: Paquete DJ $5,500 y Premium $7,500 (5 hrs)
- [x] Cargos adicionales por número de personas (100-200: +$3,000 / 200-300: +$5,500 / 300+: +$7,500)
- [x] Hora extra $1,200
- [x] Sección FAQs (acordeón)
- [x] CTAs: WhatsApp, Instagram, Amazon
- [x] Navbar con links de navegación
- [x] Footer con redes sociales y datos de contacto

## Fase 5: Formularios
- [x] Formulario de leads (nombre, teléfono, correo) con validación Zod
- [x] Formulario de contratación de eventos (nombre, teléfono, correo, fecha, tipo, horas, personas, dirección)
- [x] Cálculo dinámico de precio según número de personas y horas extra
- [x] Notificación automática al dueño al recibir lead
- [x] Notificación automática al dueño al recibir solicitud de evento

## Fase 6: Catálogo de productos
- [x] Página de catálogo con grid de productos
- [x] Filtros por categoría (cabinas, mesas DJ), color, tags
- [x] Página de detalle de producto: nombre, precio, descripción, medidas, fotos, tags, color, link Amazon
- [x] Opciones de entrega: domicilio CDMX / cotizar interior de república
- [x] Botón "Comprar en Amazon" si tiene link

## Fase 7: Mercado Pago
- [x] Integración Mercado Pago Checkout Pro
- [x] Cobro de anticipo $1,500 para eventos
- [x] Cobro de productos del catálogo
- [x] Webhook para confirmar pagos
- [x] Registro de órdenes en DB

## Fase 8: Panel de administrador
- [x] Login seguro con rol admin (protectedProcedure + adminProcedure)
- [x] Dashboard: registro de ventas ordenado por artículo
- [x] CRUD de productos del catálogo (agregar, editar, eliminar)
- [x] Upload de imágenes de productos a S3
- [x] Gestión de entradas del blog

## Fase 9: Blog y Calendario
- [x] Blog: listado de artículos con imagen destacada
- [x] Detalle de artículo con soporte de imágenes y videos embebidos
- [x] Crear/editar/eliminar artículos desde el admin
- [x] Upload de imágenes y videos del blog a S3
- [x] Calendario de disponibilidad para reservas de eventos
- [x] Lógica para bloquear fechas ya reservadas

## Fase 10: SEO, Analytics e integraciones
- [x] Meta tags dinámicos (react-helmet-async)
- [x] Open Graph tags
- [x] sitemap.xml
- [x] robots.txt
- [x] Estructura semántica HTML (h1, article, section, etc.)
- [x] Google Analytics (GA4) via Umami en index.html
- [x] Hotjar: listo para agregar snippet en index.html
- [x] Sección de reseñas Google Business (placeholders listos para API)
- [x] JSON-LD LocalBusiness structured data

## Fase 11: Pruebas y entrega
- [x] Tests Vitest para routers principales (17 tests passing)
- [x] Revisión responsive (mobile, tablet, desktop)
- [x] Checkpoint final
- [x] Entrega al usuario
