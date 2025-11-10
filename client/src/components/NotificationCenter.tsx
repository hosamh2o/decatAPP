import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Bell, X, Check, Loader2 } from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  body?: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications, isLoading, refetch } = trpc.push.getNotifications.useQuery();
  const { data: unreadCount } = trpc.push.getUnreadCount.useQuery();
  const markAsReadMutation = trpc.push.markNotificationAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Auto-refetch notifications every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
        return '📦';
      case 'order_completed':
        return '✅';
      case 'invoice_sent':
        return '📄';
      case 'invoice_paid':
        return '💰';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_created':
        return 'border-blue-200 bg-blue-50';
      case 'order_completed':
        return 'border-green-200 bg-green-50';
      case 'invoice_sent':
        return 'border-purple-200 bg-purple-50';
      case 'invoice_paid':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount && unreadCount.count > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount.count}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        {notification.body && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification</p>
              </div>
            )}
          </div>

          {notifications && notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                Voir toutes les notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
