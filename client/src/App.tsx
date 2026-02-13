import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster as ShadToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminProjectsPage from "@/pages/admin/AdminProjectsPage";
import AdminProjectEditPage from "@/pages/admin/AdminProjectEditPage";
import AdminEventsPage from "@/pages/admin/AdminEventsPage";
import AdminEventEditPage from "@/pages/admin/AdminEventEditPage";
import SuperAdminAdminsPage from "@/pages/admin/SuperAdminAdminsPage";
import { RouteTricolourLoader } from "@/components/RouteTricolourLoader";
import { useRouteLoader } from "@/hooks/use-route-loader";

function Router() {
  const { isRouteLoading } = useRouteLoader();

  return (
    <>
      <RouteTricolourLoader show={isRouteLoading} />
      <Switch>
        {/* Public */}
        <Route path="/" component={HomePage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/projects/:id" component={ProjectDetailPage} />
        <Route path="/events" component={EventsPage} />
        <Route path="/events/:id" component={EventDetailPage} />

        {/* Admin */}
        <Route path="/admin" component={AdminDashboardPage} />
        <Route path="/admin/projects" component={AdminProjectsPage} />
        <Route path="/admin/projects/:id" component={AdminProjectEditPage} />
        <Route path="/admin/events" component={AdminEventsPage} />
        <Route path="/admin/events/:id" component={AdminEventEditPage} />
        <Route path="/admin/admins" component={SuperAdminAdminsPage} />

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ShadToaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
