import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { TrialDataProvider } from "@/contexts/TrialDataContext";
import { PresentationModeProvider } from "@/contexts/PresentationModeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PresentationModeProvider>
        <TrialDataProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </TrialDataProvider>
      </PresentationModeProvider>
    </QueryClientProvider>
  );
}

export default App;
