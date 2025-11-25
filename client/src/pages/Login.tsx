import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Loader2, Wrench, Users } from "lucide-react";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Gestion de l'Assemblage de Vélos Decathlon
            </p>
          </div>

          {/* Login Options Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Manager Login Card */}
            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-cyan-500" />
                  <CardTitle>Gestionnaire de Succursale</CardTitle>
                </div>
                <CardDescription>
                  Se connecter en tant que gestionnaire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-semibold">Accès à:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Gestion des types de vélos</li>
                    <li>• Création de commandes</li>
                    <li>• Suivi des commandes</li>
                    <li>• Réception des factures</li>
                  </ul>
                </div>
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => (window.location.href = getLoginUrl("signIn"))}
                >
                  Se connecter
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => (window.location.href = getLoginUrl("signUp"))}
                >
                  Créer un compte
                </Button>
              </CardContent>
            </Card>

            {/* Mechanic Login Card */}
            <Card className="border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Wrench className="w-6 h-6 text-orange-500" />
                  <CardTitle>Mécanicien</CardTitle>
                </div>
                <CardDescription>
                  Se connecter en tant que mécanicien
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-semibold">Accès à:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Notifications de commandes</li>
                    <li>• Exécution des commandes</li>
                    <li>• Génération de factures</li>
                    <li>• Gestion des factures</li>
                  </ul>
                </div>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => (window.location.href = getLoginUrl("signIn"))}
                >
                  Se connecter
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => (window.location.href = getLoginUrl("signUp"))}
                >
                  Créer un compte
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
