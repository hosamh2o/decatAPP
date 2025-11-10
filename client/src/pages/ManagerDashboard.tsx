import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Package, Bell, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ManagerDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: orders = [] } = trpc.orders.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();
  const { data: notifications = [] } = trpc.notifications.list.useQuery();

  useEffect(() => {
    if (!loading && (!user || user.role !== "manager")) {
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

  const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
  const completedOrders = orders.filter((o: any) => o.status === "completed").length;
  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;

  const navigationItems = [
    { label: "Tableau de bord", href: "/manager/dashboard", icon: "📊" },
    { label: "Types de vélos", href: "/manager/bike-types", icon: "🚴" },
    { label: "Nouvelle commande", href: "/manager/new-order", icon: "📝" },
    { label: "Mes commandes", href: "/manager/orders", icon: "📦" },
    { label: "Factures reçues", href: "/manager/invoices", icon: "💰" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {user.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Succursale: <span className="font-semibold">{user.branchName}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Commandes en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{pendingOrders}</div>
              <p className="text-xs text-gray-500 mt-1">À traiter par le mécanicien</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Commandes complétées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
              <p className="text-xs text-gray-500 mt-1">Prêtes à être facturées</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total des commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <p className="text-xs text-gray-500 mt-1">Depuis le début</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unreadNotifications}</div>
              <p className="text-xs text-gray-500 mt-1">Non lues</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card 
            className="border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/manager/bike-types")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Gérer les types de vélos</CardTitle>
                <Package className="w-6 h-6 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Ajouter, modifier ou supprimer les types de vélos disponibles
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/manager/new-order")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Créer une commande</CardTitle>
                <Plus className="w-6 h-6 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Soumettre une nouvelle commande d'assemblage de vélos
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/manager/orders")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Mes commandes</CardTitle>
                <FileText className="w-6 h-6 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Suivre l'état de vos commandes d'assemblage
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/manager/invoices")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Factures</CardTitle>
                <Bell className="w-6 h-6 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Consulter et télécharger vos factures
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-cyan-200 bg-cyan-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Comment ça marche?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              1. <strong>Configurez vos types de vélos</strong> - Définissez les types de vélos disponibles et leurs prix d'assemblage
            </p>
            <p>
              2. <strong>Créez une commande</strong> - Sélectionnez les vélos à assembler et scannez les codes-barres
            </p>
            <p>
              3. <strong>Suivez votre commande</strong> - Recevez des notifications en temps réel sur l'état d'avancement
            </p>
            <p>
              4. <strong>Recevez la facture</strong> - Téléchargez la facture PDF une fois l'assemblage terminé
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
