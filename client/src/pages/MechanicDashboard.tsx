import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell, Wrench, FileText, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function MechanicDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: orders = [] } = trpc.orders.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();
  const { data: notifications = [] } = trpc.notifications.list.useQuery();

  useEffect(() => {
    if (!loading && (!user || user.role !== "mechanic")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const inProgressOrders = orders.filter((o: any) => o.status === "in_progress").length;
  const completedOrders = orders.filter((o: any) => o.status === "completed").length;
  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;
  const totalInvoices = invoices.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord du Mécanicien</h1>
          <p className="text-gray-600 mt-2">Bienvenue, <span className="font-semibold">{user.name}</span></p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Commandes en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{inProgressOrders}</div>
              <p className="text-xs text-gray-500 mt-1">À assembler</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Commandes complétées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
              <p className="text-xs text-gray-500 mt-1">À facturer</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unreadNotifications}</div>
              <p className="text-xs text-gray-500 mt-1">Non lues</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Factures émises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalInvoices}</div>
              <p className="text-xs text-gray-500 mt-1">Au total</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/mechanic/notifications")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <Bell className="w-6 h-6 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Voir les nouvelles commandes des succursales</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/mechanic/invoices")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Factures</CardTitle>
                <FileText className="w-6 h-6 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Gérer et consulter l'historique des factures</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
