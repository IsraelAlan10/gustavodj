import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import PricingSection from "@/components/sections/PricingSection";
import CTASection from "@/components/sections/CTASection";
import LeadFormSection from "@/components/sections/LeadFormSection";
import BookingFormSection from "@/components/sections/BookingFormSection";
import FAQSection from "@/components/sections/FAQSection";
import ReviewsSection from "@/components/sections/ReviewsSection";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Gustavo Delgadillo — Servicio de DJ, Música y Producción de Eventos</title>
        <meta name="description" content="Servicio profesional de DJ, producción musical e iluminación para eventos en CDMX. Paquetes desde $5,500. Reserva tu fecha ahora." />
        <meta name="keywords" content="DJ CDMX, DJ profesional Ciudad de México, producción musical eventos, renta equipo DJ, bodas DJ, quinceañeras DJ, iluminación eventos" />
        <meta property="og:title" content="DJ Producción Mexico" />
        <meta property="og:description" content="Servicio profesional de DJ, producción musical e iluminación para eventos en Mexico" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://djproduccioncdmx.com" />
      </Helmet>
      <div className="min-h-screen bg-[oklch(4.5%_0.002_240)]">
        <Navbar />
        <main>
          <HeroSection />
          <ServicesSection />
          <PricingSection />
          <CTASection />
          <BookingFormSection />
          <LeadFormSection />
          <ReviewsSection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
