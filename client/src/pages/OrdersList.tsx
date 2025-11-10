import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function OrdersList() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders = [] } = trpc.orders.list.useQuery();

  useEffect(() => {
    if (!loading && (!user || user.role !== "manager")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "in_progress": return "En cours";
      case "completed": return "Complétée";
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes commandes</h1>
          <p className="text-gray-600 mt-2">Suivi de toutes vos commandes d'assemblage</p>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="border-cyan-200">
              <CardContent className="pt-6 text-center text-gray-600">
                Aucune commande pour le moment
              </CardContent>
            </Card>
          ) : (
            orders.map((order: any) => (
              <Card key={order.id} className="border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/manager/orders/${order.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {Array.isArray(order.bikes) ? order.bikes.length : 0} type(s) de vélo(s)
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
