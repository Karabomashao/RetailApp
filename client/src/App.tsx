import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Home from "@/pages/home";
import SalesEntry from "@/pages/sales-entry";
import InventoryEntry from "@/pages/inventory-entry";
import SalesDashboard from "@/pages/sales-dashboard";
import InventoryDashboard from "@/pages/inventory-dashboard";
import RetailMaths from "@/pages/retail-maths";
import RetailUniversity from "@/pages/retail-university";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-surface-light">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/sales" component={SalesEntry} />
            <Route path="/inventory" component={InventoryEntry} />
            <Route path="/sales-dashboard" component={SalesDashboard} />
            <Route path="/inventory-dashboard" component={InventoryDashboard} />
            <Route path="/retail-maths" component={RetailMaths} />
            <Route path="/retail-university" component={RetailUniversity} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Login} />
      ) : (
        <Route path="*" component={AuthenticatedApp} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
