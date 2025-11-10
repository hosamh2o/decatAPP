import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function InvoicesList() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "manager" && user.role !== "mechanic"))) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "sent": return "Envoyée";
      case "paid": return "Payée";
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600 mt-2">Gestion de vos factures</p>
        </div>

        <div className="space-y-4">
          {invoices.length === 0 ? (
            <Card className="border-cyan-200">
              <CardContent className="pt-6 text-center text-gray-600">
                Aucune facture pour le moment
              </CardContent>
            </Card>
          ) : (
            invoices.map((invoice: any) => (
              <Card key={invoice.id} className="border-cyan-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/manager/invoices/${invoice.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{invoice.invoiceNumber}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                      <p className="text-lg font-semibold mt-2">{(invoice.totalAmount / 100).toFixed(2)}€</p>
                    </div>
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
