import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function InvoiceCreation() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role !== "mechanic")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/mechanic/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Créer une facture</h1>
        </div>

        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>Génération de facture</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Interface de création de facture à venir</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
