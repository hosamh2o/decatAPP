import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Loader2, Wrench, Users } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "manager") {
      setLocation("/manager/dashboard");
      return null;
    } else if (user.role === "mechanic") {
      setLocation("/mechanic/dashboard");
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-cyan-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          {isAuthenticated && (
            <Button variant="outline" onClick={logout}>
              Déconnexion
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Gestion de l'Assemblage de Vélos Decathlon
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Plateforme collaborative pour les succursales Decathlon et les mécaniciens
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Manager Card */}
            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-cyan-500" />
                  <CardTitle>Gestionnaire de Succursale</CardTitle>
                </div>
                <CardDescription>
                  Gérez vos commandes d'assemblage de vélos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Créer et gérer les types de vélos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Soumettre des commandes d'assemblage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Suivre l'état des commandes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Recevoir et télécharger les factures
                  </li>
                </ul>
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => setLocation("/manager/login")}
                >
                  Se connecter en tant que Gestionnaire
                </Button>
              </CardContent>
            </Card>

            {/* Mechanic Card */}
            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Wrench className="w-6 h-6 text-cyan-500" />
                  <CardTitle>Mécanicien</CardTitle>
                </div>
                <CardDescription>
                  Gérez l'assemblage et la facturation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Recevoir les notifications de commandes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Scanner les codes-barres des vélos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Générer des factures PDF professionnelles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Gérer l'historique des factures
                  </li>
                </ul>
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => setLocation("/mechanic/login")}
                >
                  Se connecter en tant que Mécanicien
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="border-cyan-200 bg-cyan-50/50">
            <CardHeader>
              <CardTitle className="text-lg">À propos</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-2">
              <p>
                Cette plateforme facilite la gestion de l'assemblage des vélos entre les 7 succursales Decathlon de Paris et le mécanicien indépendant Housamaddine ALCHAZLY.
              </p>
              <p>
                Avec des notifications en temps réel, la gestion des codes-barres et la génération automatique de factures, le processus d'assemblage et de facturation devient plus efficace et transparent.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-200 bg-white/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>Decathlon Bike Assembly Management System © 2025</p>
        </div>
      </footer>
    </div>
  );
}
