import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/Dashboard";
import Admin from "@/pages/Admin";
import PdfTemplates from "@/pages/PdfTemplates";
import Login from "@/pages/Login";
import SharedProduct from "@/pages/SharedProduct";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,15%,18%)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/pdf-templates" component={PdfTemplates} />
      <Route path="/admin/pdf-templates/:id" component={PdfTemplates} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  const isPublicRoute = location.startsWith('/share/');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {isPublicRoute ? (
          <Switch>
            <Route path="/share/:token" component={SharedProduct} />
          </Switch>
        ) : (
          <ProtectedRoutes />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
