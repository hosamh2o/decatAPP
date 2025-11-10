import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function PushNotificationSettings() {
  const { isSupported, isSubscribed, isLoading, error, subscribe, unsubscribe } =
    usePushNotifications();
  const [showMessage, setShowMessage] = useState(false);

  const handleToggle = async () => {
    setShowMessage(false);
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const success = await subscribe();
      if (success) {
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      }
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-sm">Notifications Push</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Les notifications push ne sont pas supportées par votre navigateur.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cyan-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Notifications Push</CardTitle>
            <CardDescription>
              Recevez des alertes en temps réel sur vos commandes
            </CardDescription>
          </div>
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-cyan-500" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {showMessage && isSubscribed && (
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">
              Notifications activées avec succès!
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {isSubscribed ? 'Notifications activées' : 'Notifications désactivées'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isSubscribed
                ? 'Vous recevrez des alertes en temps réel'
                : 'Activez les notifications pour rester informé'}
            </p>
          </div>
          <Button
            onClick={handleToggle}
            disabled={isLoading}
            variant={isSubscribed ? 'destructive' : 'default'}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : isSubscribed ? (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Désactiver
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Activer
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-blue-900">📢 Vous serez notifié de:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✓ Création de nouvelles commandes</li>
            <li>✓ Changements d'état des commandes</li>
            <li>✓ Génération de factures</li>
            <li>✓ Messages importants du système</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
