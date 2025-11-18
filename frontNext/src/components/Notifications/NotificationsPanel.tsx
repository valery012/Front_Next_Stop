import React from 'react';
import type { Notification } from '../../services/notificationsService';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  onClose,
}) => {
  const unreadNotifications = notifications.filter(n => n.estado === 'pendiente');
  const readNotifications = notifications.filter(n => n.estado === 'leida');

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays}d`;
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return 'Reciente';
    }
  };

  const getTypeIcon = (tipo: string) => {
    if (tipo.includes('approved') || tipo.includes('created')) {
      return (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  const renderNotification = (notif: Notification) => (
    <div
      key={notif.id}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
        notif.estado === 'pendiente' ? 'bg-purple-50/30' : ''
      }`}
    >
      <div className="flex gap-3">
        {getTypeIcon(notif.tipo)}
        <div className="flex-1 min-w-0">
          <p className={`text-sm mb-1 ${notif.estado === 'pendiente' ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {notif.mensaje}
          </p>
          <p className="text-xs text-gray-500">{formatDate(notif.created_at)}</p>
        </div>
        <div className="flex items-start gap-1">
          {notif.estado === 'pendiente' && (
            <button
              onClick={() => onMarkAsRead(notif.id)}
              className="p-1 rounded hover:bg-gray-200 transition"
              title="Marcar como leída"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(notif.id)}
            className="p-1 rounded hover:bg-red-100 transition"
            title="Eliminar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            title="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-600 font-medium">No tienes notificaciones</p>
              <p className="text-sm text-gray-500 mt-1">Te avisaremos cuando haya novedades</p>
            </div>
          ) : (
            <>
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Nuevas</p>
                  </div>
                  {unreadNotifications.map(renderNotification)}
                </div>
              )}

              {readNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Anteriores</p>
                  </div>
                  {readNotifications.map(renderNotification)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
