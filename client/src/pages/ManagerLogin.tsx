import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { Loader2, Users, TrendingUp, Zap, BarChart3, Shield } from "lucide-react";

export default function ManagerLogin() {
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
    if (user.role === "manager") {
      setLocation("/manager/dashboard");
      return null;
    } else {
      setLocation("/");
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100">
      {/* Header */}
      <header className="border-b border-cyan-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>
            Retour
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Features */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-cyan-500" />
                  <h2 className="text-3xl font-bold text-gray-900">
                    Espace Gestionnaire
                  </h2>
                </div>
                <p className="text-gray-600 text-lg">
                  Gérez vos commandes d'assemblage de vélos
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-white/70 rounded-lg border border-cyan-200 hover:shadow-md transition-shadow">
                  <Zap className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestion Rapide</h3>
                    <p className="text-sm text-gray-600">Créez et soumettez des commandes en quelques clics</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white/70 rounded-lg border border-cyan-200 hover:shadow-md transition-shadow">
                  <BarChart3 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Suivi en Temps Réel</h3>
                    <p className="text-sm text-gray-600">Suivez l'état de vos commandes instantanément</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white/70 rounded-lg border border-cyan-200 hover:shadow-md transition-shadow">
                  <TrendingUp className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestion des Types</h3>
                    <p className="text-sm text-gray-600">Configurez les types de vélos et leurs tarifs</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white/70 rounded-lg border border-cyan-200 hover:shadow-md transition-shadow">
                  <Shield className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Factures Sécurisées</h3>
                    <p className="text-sm text-gray-600">Téléchargez vos factures PDF en toute sécurité</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-2xl font-bold text-cyan-600">100%</p>
                  <p className="text-xs text-gray-600">Transparent</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-2xl font-bold text-cyan-600">24/7</p>
                  <p className="text-xs text-gray-600">Disponible</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-2xl font-bold text-cyan-600">0</p>
                  <p className="text-xs text-gray-600">Erreurs</p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="flex flex-col gap-4">
              <Card className="border-cyan-300 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="text-2xl">Connexion Gestionnaire</CardTitle>
                  <CardDescription className="text-cyan-100">
                    Accédez à votre tableau de bord
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Bienvenue!</h3>
                    <p className="text-sm text-gray-600">
                      Connectez-vous avec votre compte Manus pour gérer votre succursale.
                    </p>
                  </div>

                  {/* Branch Info */}
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-cyan-900">📍 Succursale</p>
                    <p className="text-xs text-cyan-800">
                      Vous pouvez gérer les commandes pour votre succursale Decathlon à Paris.
                    </p>
                  </div>

                  {/* Login Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 text-lg"
                    onClick={() => setLocation("/manager/login")}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Se Connecter en tant que Gestionnaire
                  </Button>

                  {/* Help Text */}
                  <p className="text-xs text-center text-gray-500">
                    Besoin d'aide? Contactez l'administrateur système.
                  </p>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-cyan-200 bg-white/50">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Commandes en attente</span>
                      <span className="font-bold text-cyan-600">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Commandes complétées</span>
                      <span className="font-bold text-cyan-600">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Factures disponibles</span>
                      <span className="font-bold text-cyan-600">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
