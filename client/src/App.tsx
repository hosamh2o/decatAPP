import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import ManagerDashboard from "./pages/ManagerDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";
import BikeTypesManagement from "./pages/BikeTypesManagement";
import NewOrder from "./pages/NewOrder";
import OrdersList from "./pages/OrdersList";
import OrderDetails from "./pages/OrderDetails";
import InvoicesList from "./pages/InvoicesList";
import InvoiceDetails from "./pages/InvoiceDetails";
import OrderExecution from "./pages/OrderExecution";
import InvoiceCreation from "./pages/InvoiceCreation";
import NotificationsList from "./pages/NotificationsList";
import UserProfile from "./pages/UserProfile";
import MechanicLogin from "./pages/MechanicLogin";
import ManagerLogin from "./pages/ManagerLogin";
import Analytics from "./pages/Analytics";
import AnalyticsWithExport from "./pages/AnalyticsWithExport";

function Router() {
  return (
    <Switch>
      <Route path={"\\"} component={Login} />
      <Route path={"/manager/dashboard"} component={ManagerDashboard} />
      <Route path={"/manager/bike-types"} component={BikeTypesManagement} />
      <Route path={"/manager/new-order"} component={NewOrder} />
      <Route path={"/manager/orders"} component={OrdersList} />
      <Route path={"/manager/orders/:id"} component={OrderDetails} />
      <Route path={"/manager/invoices"} component={InvoicesList} />
      <Route path={"/manager/invoices/:id"} component={InvoiceDetails} />
      
      <Route path={"/mechanic/dashboard"} component={MechanicDashboard} />
      <Route path={"/mechanic/notifications"} component={NotificationsList} />
      <Route path={"/mechanic/orders/:id/execute"} component={OrderExecution} />
      <Route path={"/mechanic/orders/:id/invoice"} component={InvoiceCreation} />
      <Route path={"/mechanic/invoices"} component={InvoicesList} />
      <Route path={"/mechanic/invoices/:id"} component={InvoiceDetails} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/mechanic/login"} component={MechanicLogin} />
      <Route path={"/manager/login"} component={ManagerLogin} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/analytics-export"} component={AnalyticsWithExport} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
