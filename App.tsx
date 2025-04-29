import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import Home from "@/pages/Home";
import PlayerRegistration from "@/pages/PlayerRegistration";
import PlayerList from "@/pages/PlayerList";
import FixtureList from "@/pages/FixtureList";
import AdminResults from "@/pages/AdminResults";

function Router() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/register" component={PlayerRegistration} />
          <Route path="/players" component={PlayerList} />
          <Route path="/fixtures" component={FixtureList} />
          <Route path="/admin/results" component={AdminResults} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
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
