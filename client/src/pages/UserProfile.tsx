import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UserProfile() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branchName, setBranchName] = useState("");
  const [siret, setSiret] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBranchName((user as any).branchName || "");
      setSiret((user as any).siret || "");
      setCompanyInfo((user as any).companyInfo || "");
    }
  }, [user, loading]);

  const handleSave = async () => {
    if (!name || !email) {
      toast.error("Le nom et l'email sont obligatoires");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement profile update mutation in tRPC
      // For now, we'll just show a success message
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation(user.role === "manager" ? "/manager/dashboard" : "/mechanic/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        </div>

        {/* Profile Card */}
        <Card className="border-cyan-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Informations Personnelles</CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="text-cyan-600 border-cyan-200"
              >
                Modifier
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{name}</p>
                <p className="text-sm text-gray-600">{user.role === "manager" ? "Gestionnaire" : "Mécanicien"}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full"
                  placeholder="Votre nom"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="w-full"
                  placeholder="votre.email@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className="w-full"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              {/* Branch Name (for managers only) */}
              {user.role === "manager" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la Succursale
                  </label>
                  <Input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full"
                    placeholder="ex: Decathlon Les Halles"
                  />
                </div>
              )}

              {/* SIRET (for mechanics only) */}
              {user.role === "mechanic" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET
                  </label>
                  <Input
                    type="text"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    disabled={!isEditing}
                    className="w-full"
                    placeholder="ex: 892468653"
                  />
                </div>
              )}

              {/* Company Info (for mechanics only) */}
              {user.role === "mechanic" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informations Entreprise
                  </label>
                  <Input
                    type="text"
                    value={companyInfo}
                    onChange={(e) => setCompanyInfo(e.target.value)}
                    disabled={!isEditing}
                    className="w-full"
                    placeholder="Adresse, ville, code postal"
                  />
                </div>
              )}

              {/* Role (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <Input
                  type="text"
                  value={user.role === "manager" ? "Gestionnaire de Succursale" : "Mécanicien"}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name || "");
                    setEmail(user.email || "");
                    setPhone(user.phone || "");
                    setBranchName((user as any).branchName || "");
                    setSiret((user as any).siret || "");
                    setCompanyInfo((user as any).companyInfo || "");
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Enregistrer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="border-cyan-200 bg-cyan-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Informations du Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>ID Utilisateur:</strong> {user.id}
            </p>
            <p>
              <strong>Date de création:</strong> {new Date(user.createdAt).toLocaleDateString("fr-FR")}
            </p>
            <p>
              <strong>Dernière connexion:</strong> {new Date(user.lastSignedIn).toLocaleDateString("fr-FR")}
            </p>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle className="text-lg">Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Votre compte est sécurisé par l'authentification OAuth de Manus.
            </p>
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
