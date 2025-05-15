import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";
import Marketplace from "@/pages/Marketplace";
import Events from "@/pages/Events";
import Blog from "@/pages/Blog";
import Videos from "@/pages/Videos";
import Channels from "@/pages/Channels";
import Settings from "@/pages/Settings";
import AdminPage from "@/pages/AdminPage";

import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/chat" component={Chat} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/events" component={Events} />
      <Route path="/blog" component={Blog} />
      <Route path="/channels" component={Channels} />
      <Route path="/videos" component={Videos} />
      <Route path="/settings" component={Settings} />
      <Route path="/developer" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <MainLayout>
              <Router />
            </MainLayout>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
