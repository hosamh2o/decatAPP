import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function BikeTypesManagement() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [price, setPrice] = useState("");

  const { data: bikeTypes = [], refetch } = trpc.bikeTypes.list.useQuery();
  const createMutation = trpc.bikeTypes.create.useMutation();
  const deleteMutation = trpc.bikeTypes.delete.useMutation();

  useEffect(() => {
    if (!loading && (!user || user.role !== "manager")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const handleCreate = async () => {
    if (!name || !nameFr || !price) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name,
        nameFr,
        price: Math.round(parseFloat(price) * 100),
      });
      setName("");
      setNameFr("");
      setPrice("");
      refetch();
      toast.success("Type de vélo créé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
      toast.success("Type de vélo supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gérer les types de vélos</h1>
          <p className="text-gray-600 mt-2">Ajouter et gérer les types de vélos disponibles</p>
        </div>

        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>Ajouter un nouveau type de vélo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Nom du type (ex: Vélo enfant)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Nom en français" value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
            <Input placeholder="Prix en €" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full bg-cyan-500 hover:bg-cyan-600">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Ajouter
            </Button>
          </CardContent>
        </Card>

        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>Types de vélos existants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bikeTypes.map((type: any) => (
                <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{type.nameFr}</p>
                    <p className="text-sm text-gray-600">{(type.price / 100).toFixed(2)}€</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(type.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
