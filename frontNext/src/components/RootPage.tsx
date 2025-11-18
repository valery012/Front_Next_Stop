import React, { useState } from 'react';
import { Navigation } from './UI/Navigation';
import { HomePage } from './Pages/HomePage';
import { LandingPage } from './Pages/LandingPage';
import { LoginPage } from './Pages/LoginPage';
import { AgentPage } from './Pages/AgentPage';
import { ProfilePage } from './Pages/ProfilePage';
import { ModeratorDashboard } from './Pages/ModeratorDashboard';
import { useNotificationManager } from '../hooks/useNotificationManager';
import { ToastNotification } from './Notifications/ToastNotification';
import type { User } from '../types';

type PageType = 'landing' | 'login' | 'home' | 'profile' | 'moderator' | 'agent';

export const RootPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [isAuthenticated] = useState(false);
  const [currentUser] = useState<User | null>(null);
  const { notifications, removeNotification } = useNotificationManager();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'home':
        return isAuthenticated ? <HomePage /> : <LoginPage />;
      case 'profile':
        return isAuthenticated ? <ProfilePage /> : <LoginPage />;
      case 'agent':
        return isAuthenticated ? <AgentPage /> : <LoginPage />;
      case 'moderator':
        return isAuthenticated && currentUser?.role === 'moderator' ? (
          <ModeratorDashboard />
        ) : (
          <LoginPage />
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Navigation onOpenAgent={() => setCurrentPage('agent')} />}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Page Content */}
      {renderPage()}
    </div>
  );
};
