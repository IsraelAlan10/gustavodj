import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Admin from "./pages/Admin";
import { EventPayment, ProductPayment, MockCheckout, PaymentSuccess, PaymentFailure, PaymentPending } from "./pages/Payment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tienda" component={Catalog} />
      <Route path="/producto/:slug" component={ProductDetail} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/admin" component={Admin} />
      <Route path="/pago/evento/:bookingId" component={EventPayment} />
      <Route path="/pago/producto/:productId" component={ProductPayment} />
      <Route path="/pago/mock-checkout" component={MockCheckout} />
      <Route path="/pago/exitoso" component={PaymentSuccess} />
      <Route path="/pago/fallido" component={PaymentFailure} />
      <Route path="/pago/pendiente" component={PaymentPending} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
