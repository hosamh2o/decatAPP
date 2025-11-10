import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function NotificationsList() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: notifications = [] } = trpc.notifications.list.useQuery();

  useEffect(() => {
    if (!loading && (!user || user.role !== "mechanic")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order_created": return "bg-blue-100 text-blue-800";
      case "order_completed": return "bg-green-100 text-green-800";
      case "invoice_sent": return "bg-purple-100 text-purple-800";
      case "invoice_paid": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Vos notifications de commandes et factures</p>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="border-cyan-200">
              <CardContent className="pt-6 text-center text-gray-600">
                Aucune notification
              </CardContent>
            </Card>
          ) : (
            notifications.map((notif: any) => (
              <Card key={notif.id} className={`border-cyan-200 ${notif.isRead ? "opacity-50" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{notif.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{notif.body}</p>
                    </div>
                    <Badge className={getTypeColor(notif.type)}>{notif.type}</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
