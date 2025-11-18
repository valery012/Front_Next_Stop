import React, { useState, useEffect } from 'react';
import { AgentChat } from './components/Agent/AgentChat';
import { CreatePlaceForm } from './components/Places/CreatePlaceForm';
import { PlaceDetailsModal } from './components/Places/PlaceDetailsModal';
import { NotificationBell } from './components/Notifications/NotificationBell';
import { NotificationsPanel } from './components/Notifications/NotificationsPanel';
import type { User, Place } from './types';
import { apiGetSolicitudesPendientes, apiGetSolicitudesAceptadas } from './services/api';
import './App.css';

type PageType = 'landing' | 'login' | 'home' | 'profile' | 'moderator' | 'admin';

// Normaliza estados del backend (PENDIENTE/ACEPTADO/RECHAZADO) a valores usados en UI
function mapStatus(s?: string | null): 'pending' | 'approved' | 'rejected' {
  const u = (s || '').toString().toUpperCase();
  if (u === 'PENDIENTE' || u === 'PENDING' || u === '') return 'pending';
  if (u === 'ACEPTADO' || u === 'ACCEPTED' || u === 'APPROVED') return 'approved';
  if (u === 'RECHAZADO' || u === 'REJECTED') return 'rejected';
  try {
    // fallback: si viene en minúsculas u otro formato
    return (s as any)?.toLowerCase?.() ?? 'pending';
  } catch {
    return 'pending';
  }
}

// Extrae categoría desde descripciones antiguas tipo: "Categoría: X - Ubicación: ..."
function deriveCategoryFromDescription(desc?: string | null): string | null {
  if (!desc) return null;
  const match = desc.match(/categor[ií]a\s*:\s*([^\-\n\r]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

// Normaliza categorías a las usadas por la app
function normalizeCategory(raw?: string | null): string | null {
  if (!raw) return null;
  const s = raw
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // quitar acentos

  const map: Record<string, string> = {
    restaurante: 'restaurant',
    restaurantes: 'restaurant',
    restaurant: 'restaurant',
    comida: 'restaurant',
    hotel: 'hotel',
    hoteles: 'hotel',
    natural: 'natural',
    naturaleza: 'natural',
    parque: 'natural',
    parques: 'natural',
    viewpoint: 'viewpoint',
    mirador: 'viewpoint',
    miradores: 'viewpoint',
    // compat historica
    museum: 'viewpoint', // si existiera, puedes cambiar a 'museum' si deseas chip propio
    museo: 'viewpoint',
    museos: 'viewpoint',
  };
  return map[s] || s;
}

// Landing Page Component
function LandingPage({ onNavigate }: { onNavigate: (page: 'login') => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">Next Stop</h1>
          </div>
          <button 
            onClick={() => onNavigate('login')} 
            className="bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full px-6 py-2 font-semibold hover:shadow-lg transition"
          >
            Comenzar
          </button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Columna de texto */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
              <span className="text-sm font-semibold text-orange-700">Descubre lugares auténticos</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Tu guía de lugares <br />
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                ocultos y especiales
              </span>
            </h2>
            <p className="text-xl text-slate-600 md:max-w-xl md:mx-0 mx-auto mb-8">
              Únete a una comunidad de exploradores que descubren gemas escondidas fuera de las rutas turísticas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
              <button
                onClick={() => onNavigate('login')}
                className="bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full text-lg px-8 py-3 font-semibold hover:shadow-lg transition"
              >
                Explorar ahora
              </button>
              <button className="border-2 border-slate-300 text-slate-700 rounded-full text-lg px-8 py-3 font-semibold hover:bg-slate-50 transition">
                Ver demo
              </button>
            </div>
          </div>

          {/* Columna de imagen */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-orange-200/50 to-purple-200/50 rounded-3xl blur-2xl" aria-hidden="true"></div>
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
              alt="Paisaje inspirador de viaje"
              className="relative w-full rounded-3xl shadow-xl ring-1 ring-slate-200 object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <h3 className="text-4xl font-bold text-center text-slate-900 mb-16">¿Por qué Next Stop?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { key: 'gem', title: 'Descubre Gemas Ocultas', desc: 'Accede a una base de datos creciente de lugares auténticos.' },
            { key: 'users', title: 'Comunidad Global', desc: 'Conecta con viajeros de todo el mundo.' },
            { key: 'ai', title: 'Recomendaciones con IA', desc: 'Obtén sugerencias personalizadas.' },
            { key: 'map', title: 'Mapas Interactivos', desc: 'Visualiza lugares con coordenadas GPS precisas.' },
            { key: 'search', title: 'Filtros Avanzados', desc: 'Busca por categoría, ubicación y más.' },
            { key: 'shield', title: 'Contenido Verificado', desc: 'Cada lugar es revisado por moderadores.' },
          ].map((f) => (
            <div key={f.key} className="p-8 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center mb-4">
                {/* Iconos minimalistas con stroke blanco */}
                {f.key === 'gem' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 3 3 9 12 21 21 9 12 3"/>
                    <path d="M12 3l0 18"/>
                    <path d="M3 9l18 0"/>
                  </svg>
                )}
                {f.key === 'users' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="8" r="3"/>
                    <path d="M4 19c0-3 2.5-5 5-5"/>
                    <circle cx="17" cy="9" r="2.5"/>
                    <path d="M14 19c.3-2.2 2-3.8 4-4"/>
                  </svg>
                )}
                {f.key === 'ai' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 3l-6 9h5l-1 9 6-10h-5l1-8z"/>
                  </svg>
                )}
                {f.key === 'map' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/>
                    <path d="M9 4v14M15 6v14"/>
                  </svg>
                )}
                {f.key === 'search' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="5"/>
                    <path d="M16 16l5 5"/>
                  </svg>
                )}
                {f.key === 'shield' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                )}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h4>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Login Page Component
function LoginPage({ onLogin, onBack }: { onLogin: (user: User) => void; onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      if (isLogin) {
        const savedUsers = localStorage.getItem('users');
        const users = savedUsers ? JSON.parse(savedUsers) : [];
        const user = users.find((u: User) => u.email === email && u.password === password);
        if (user) {
          onLogin(user);
        } else {
          alert('Credenciales inválidas');
        }
      } else {
        // Registro de nuevo usuario
        try {
          // Intentar registrar en el microservicio primero
          const response = await fetch('http://localhost:8083/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              name: name,
              Email: email,
              gender: 'no especificado',
            }),
          });

          if (response.ok) {
            const createdUser = await response.json();
            console.log('✅ Usuario creado en microservicio:', createdUser);
            
            const newUser: User = {
              id: createdUser.id,
              email: createdUser.email,
              password,
              name: createdUser.name,
              role: 'user',
              createdAt: new Date(createdUser.createdAt || Date.now()),
            };

            const savedUsers = localStorage.getItem('users');
            const users = savedUsers ? JSON.parse(savedUsers) : [];
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            onLogin(newUser);
          } else {
            throw new Error('Error al crear usuario en el servidor');
          }
        } catch (error) {
          console.warn('⚠️ Microservicio no disponible, usando solo localStorage:', error);
          
          // Fallback: guardar solo en localStorage
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            password,
            name,
            role: 'user',
            createdAt: new Date(),
          };
          const savedUsers = localStorage.getItem('users');
          const users = savedUsers ? JSON.parse(savedUsers) : [];
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          onLogin(newUser);
        }
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Botón de regresar */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition"
            title="Volver al inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-sm font-medium">Volver al inicio</span>
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Bienvenido' : 'Únete a Next Stop'}</h2>
            <p className="text-gray-300 text-sm">
              {isLogin ? 'Continúa explorando' : 'Comienza tu aventura'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition focus:outline-none"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="w-full border border-white/20 text-white/80 font-medium py-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Home Page Component
function HomePage({ user, places, onNavigate, onLogout, onAddPlace }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const approvedPlaces = places.filter((p: Place) => p.status === 'approved');
  const filteredPlaces = selectedCategory ? approvedPlaces.filter((p: Place) => p.category === selectedCategory) : approvedPlaces;

  // Estado de notificaciones
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Polling de notificaciones
  React.useEffect(() => {
    if (!user?.email) {
      console.log('📧 No hay email de usuario, omitiendo polling de notificaciones');
      return;
    }
    console.log('🔔 Iniciando polling de notificaciones para:', user.email);
    let disposed = false;

    const loadNotifications = async () => {
      try {
        console.log('📥 Cargando notificaciones para:', user.email);
        const { getNotificationsByUser } = await import('./services/notificationsService');
        const notifs = await getNotificationsByUser(user.email);
        if (disposed) return;
        console.log('✅ Notificaciones recibidas:', notifs);
        setNotifications(notifs);
        const unread = notifs.filter((n: any) => n.estado === 'pendiente').length;
        console.log('🔢 Notificaciones no leídas:', unread);
        setUnreadCount(unread);
      } catch (error) {
        console.error('❌ Error cargando notificaciones:', error);
      }
    };

    // Cargar inmediatamente
    loadNotifications();

    // Polling cada 30 segundos
    const intervalId = setInterval(loadNotifications, 30000);

    // Recargar al hacer foco en la ventana
    const handleFocus = () => loadNotifications();
    window.addEventListener('focus', handleFocus);

    return () => {
      disposed = true;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.email]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const { markNotificationAsRead, getNotificationsByUser } = await import('./services/notificationsService');
      await markNotificationAsRead(notificationId);
      const updated = await getNotificationsByUser(user.email);
      setNotifications(updated);
      setUnreadCount(updated.filter((n: any) => n.estado === 'pendiente').length);
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      const { deleteNotification, getNotificationsByUser } = await import('./services/notificationsService');
      await deleteNotification(notificationId);
      const updated = await getNotificationsByUser(user.email);
      setNotifications(updated);
      setUnreadCount(updated.filter((n: any) => n.estado === 'pendiente').length);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  // Mapeo de etiquetas amigables por categoría conocida
  const categoryLabels: Record<string, string> = {
    restaurant: 'Restaurantes',
    hotel: 'Hoteles',
    natural: 'Naturales',
    viewpoint: 'Miradores',
  };

  // Lista base de categorías soportadas por la app
  const defaultCategories = ['restaurant', 'hotel', 'natural', 'viewpoint'];

  // Categorías disponibles: unión de dinámicas (datos) + base, sin duplicados
  const dynamicCats = approvedPlaces
    .map((p: Place) => (p.category || '').toString().trim().toLowerCase())
    .filter(Boolean);
  const availableCategories = Array.from(new Set([...defaultCategories, ...dynamicCats]))
    .map((value) => ({ value, label: categoryLabels[value] || (value.charAt(0).toUpperCase() + value.slice(1)) }));

  // Si la categoría seleccionada ya no existe en los datos, resetear a "Todos"
  React.useEffect(() => {
    if (selectedCategory && !availableCategories.some(c => c.value === selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [approvedPlaces.length]);

  const firstName = (user?.name || '').trim().split(' ')[0] || user?.name || 'Usuario';
  const initial = firstName?.charAt(0)?.toUpperCase() || 'U';

  // Crear lugar modal state
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const handleCreateSubmit = async (data: { name: string; description: string; category: string; latitude: number; longitude: number; imageUrl?: string }) => {
    setIsSubmitting(true);
    
    try {
      // Importar dinámicamente el servicio API de solicitudes
      const { apiCreateSolicitud } = await import('./services/api');

      await apiCreateSolicitud({
        nombre: data.name,
        categoria: data.category,
        ubicacion: data.description,
        user_email: user.email,
        latitude: data.latitude,
        longitude: data.longitude,
        photo_url: data.imageUrl || undefined,
      });

      setShowCreate(false);
      setToast({ type: 'success', message: '✓ Solicitud enviada para revisión por el administrador' });
      setTimeout(() => setToast(null), 4000);
    } catch (error: any) {
      console.error('Error creando solicitud:', error);
      setToast({ 
        type: 'error', 
        message: `Error al enviar solicitud: ${error.message || 'Intenta nuevamente'}` 
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">Next Stop</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('profile')}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition"
              title="Ir a mi perfil"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white text-sm font-bold">
                {initial}
              </span>
              <span className="text-left leading-tight">
                <span className="block text-sm font-semibold text-gray-900 group-hover:text-purple-700">{firstName}</span>
                <span className="block text-[11px] text-gray-500">Mi perfil</span>
              </span>
            </button>

            {/* Notificaciones */}
            <NotificationBell unreadCount={unreadCount} onClick={() => setShowNotifications(true)} />

            {user.role === 'moderator' && (
              <button onClick={() => onNavigate('moderator')} className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold">
                Panel Moderador
              </button>
            )}

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Bienvenida personalizada */}
      <div className="bg-gradient-to-r from-orange-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <p className="text-sm text-slate-700">
            Hola, <span className="font-semibold bg-gradient-to-r from-orange-600 to-purple-700 bg-clip-text text-transparent">{firstName}</span>. ¡Bienvenido de nuevo!
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Lugares Aprobados</h2>

        <div className="mb-10 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow hover:shadow-md transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Crear lugar
          </button>
          <p className="text-sm text-gray-600">Los lugares nuevos se envían como <span className="font-medium text-purple-600">pendientes</span> para moderación.</p>
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setShowCreate(false)} />
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Nuevo Lugar</h3>
                <button
                  onClick={() => !isSubmitting && setShowCreate(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <CreatePlaceForm onSubmit={handleCreateSubmit} />
            </div>
          </div>
        )}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}> 
              {toast.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              )}
              <span>{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 text-xs uppercase tracking-wide opacity-70 hover:opacity-100">Cerrar</button>
            </div>
          </div>
        )}

        <div className="mb-12 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-semibold transition ${selectedCategory === null ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Todos
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full font-semibold transition ${selectedCategory === cat.value ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title={`Filtrar por ${cat.label}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place: Place) => (
              <div
                key={place.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                onClick={() => setSelectedPlace(place)}
                title="Ver detalles"
              >
                <img src={place.imageUrl || (place.photos && place.photos[0]) || 'https://via.placeholder.com/400x250'} alt={place.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{place.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{place.description.substring(0, 100)}...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">{place.category}</span>
                    <span className="text-xs text-gray-500">Por {place.creatorName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay lugares en esta categoría</p>
          </div>
        )}

        {selectedPlace && (
          <PlaceDetailsModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
        )}

        {showNotifications && (
          <NotificationsPanel
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </main>
    </div>
  );
}

// Profile Page Component
function ProfilePage({ user, places, onNavigate, onLogout }: any) {
  const [solicitudes, setSolicitudes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadSolicitudes = async () => {
      try {
        // Cargar solo las solicitudes del usuario actual
        const response = await fetch(`http://localhost:5007/solicitudes/usuario/${user.email}`);
        const solicitudesUsuario = await response.json();
        setSolicitudes(solicitudesUsuario);
      } catch (error) {
        console.error('Error cargando solicitudes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSolicitudes();
  }, [user.email]);

  // Mapear solicitudes a formato de Place para reutilizar el renderizado
  const pendingPlaces = solicitudes
    .filter(s => s.estado === 'pendiente')
    .map(s => ({
      id: `sol-${s.id}`,
      name: s.nombre,
      description: `Categoría: ${s.categoria} - Ubicación: ${s.ubicacion}`,
      category: s.categoria,
      status: 'pending'
    }));

  const approvedPlaces = solicitudes
    .filter(s => s.estado === 'aceptada')
    .map(s => ({
      id: `sol-${s.id}`,
      name: s.nombre,
      description: `Categoría: ${s.categoria} - Ubicación: ${s.ubicacion}`,
      category: s.categoria,
      status: 'approved'
    }));

  const rejectedPlaces = solicitudes
    .filter(s => s.estado === 'rechazada')
    .map(s => ({
      id: `sol-${s.id}`,
      name: s.nombre,
      description: `Categoría: ${s.categoria} - Ubicación: ${s.ubicacion}`,
      category: s.categoria,
      status: 'rejected'
    }));

  const userPlaces = [...pendingPlaces, ...approvedPlaces, ...rejectedPlaces];
  const approvedCount = approvedPlaces.length;

  const renderStatusBadge = (status: string) => {
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'approved':
        return <span className={base + ' bg-green-100 text-green-700 border border-green-200'}>Aprobado</span>;
      case 'pending':
        return <span className={base + ' bg-yellow-100 text-yellow-700 border border-yellow-200'}>Pendiente</span>;
      case 'rejected':
        return <span className={base + ' bg-red-100 text-red-700 border border-red-200'}>Rechazado</span>;
      default:
        return <span className={base + ' bg-gray-100 text-gray-600 border border-gray-200'}>{status}</span>;
    }
  };

  const renderPlacesSection = (title: string, items: Place[], accent: string) => (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-semibold text-gray-800`}>{title}</h3>
        <span className={`text-sm font-medium ${accent}`}>{items.length} lugar(es)</span>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No hay lugares en esta categoría.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pl: Place) => (
            <div key={pl.id} className="bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200 flex flex-col">
              {pl.photos && pl.photos.length > 0 ? (
                <div className="h-40 overflow-hidden rounded-t-lg bg-gray-100">
                  <img
                    src={pl.photos[0]}
                    alt={pl.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center bg-gray-100 rounded-t-lg text-gray-400 text-sm">Sin imagen</div>
              )}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">{pl.name}</h4>
                  {pl.status && renderStatusBadge(pl.status)}
                </div>
                {pl.category && (
                  <span className="text-xs uppercase tracking-wide text-purple-600 font-medium">{pl.category}</span>
                )}
                {pl.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{pl.description}</p>
                )}
              </div>
              <div className="px-4 pb-4 mt-auto">
                <div className="flex flex-wrap gap-1">
                  {(pl.photos || []).slice(1,4).map((p,i) => (
                    <img
                      key={i}
                      src={p}
                      alt={pl.name + ' extra'}
                      className="w-10 h-10 object-cover rounded border border-gray-200"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus lugares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">Next Stop</h1>
          <div className="flex gap-3 items-center">
            <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md hover:bg-gray-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="font-medium">Volver</span>
            </button>
            <button onClick={onLogout} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span className="font-medium">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-1"><strong>Email:</strong> {user.email}</p>
              <p className="text-gray-600"><strong>Rol:</strong> {user.role === 'moderator' ? 'Moderador' : 'Usuario'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
              <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{userPlaces.length}</div>
                <p className="text-xs font-medium text-purple-700">Creados</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                <p className="text-xs font-medium text-green-700">Aprobados</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100">
                <div className="text-2xl font-bold text-yellow-600">{pendingPlaces.length}</div>
                <p className="text-xs font-medium text-yellow-700">Pendientes</p>
              </div>
            </div>
          </div>
        </div>

        {renderPlacesSection('Pendientes de Revisión', pendingPlaces, 'text-yellow-600')}
        {renderPlacesSection('Aprobados', approvedPlaces, 'text-green-600')}
        {renderPlacesSection('Rechazados', rejectedPlaces, 'text-red-600')}
      </main>
    </div>
  );
}

// Moderator Dashboard Component
function ModeratorDashboard({ user, places, onUpdatePlace, onNavigate, onLogout }: any) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const pendingPlaces = places.filter((p: Place) => p.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-600">Panel Moderador</h1>
          <div className="flex gap-3 items-center">
            <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md hover:bg-gray-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="font-medium">Volver</span>
            </button>
            <button onClick={onLogout} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">{places.length}</div>
            <p className="text-gray-600">Total de Lugares</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-yellow-600">{pendingPlaces.length}</div>
            <p className="text-gray-600">Pendientes</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600">{places.filter((p: Place) => p.status === 'approved').length}</div>
            <p className="text-gray-600">Aprobados</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-red-600">{places.filter((p: Place) => p.status === 'rejected').length}</div>
            <p className="text-gray-600">Rechazados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Por Revisar ({pendingPlaces.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingPlaces.length > 0 ? (
                pendingPlaces.map((place: Place) => (
                  <button
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      selectedPlace?.id === place.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{place.name}</p>
                    <p className="text-sm text-gray-600">{place.category}</p>
                  </button>
                ))
              ) : (
                <p className="text-gray-500">No hay lugares pendientes</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedPlace ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                {selectedPlace.imageUrl && (
                  <img 
                    src={selectedPlace.imageUrl} 
                    alt={selectedPlace.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedPlace.name}</h3>
                <p className="text-gray-600 mb-4">{selectedPlace.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><strong>Categoría:</strong> {selectedPlace.category}</div>
                  <div><strong>Creador:</strong> {selectedPlace.creatorName}</div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      onUpdatePlace({ ...selectedPlace, status: 'approved' });
                      setSelectedPlace(null);
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => {
                      onUpdatePlace({ ...selectedPlace, status: 'rejected' });
                      setSelectedPlace(null);
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Selecciona un lugar para revisar</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ user, places, onUpdatePlace, onNavigate, onLogout }: any) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [solPend, setSolPend] = useState<any[]>([]);
  const [solAcep, setSolAcep] = useState<any[]>([]);
  const [solRech, setSolRech] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'usuarios'>('solicitudes');

  const mapSolicitudToPlace = (s: any): Place => ({
    id: String(s.id),
    name: s.nombre,
    description: s.ubicacion ? `Ubicación: ${s.ubicacion}` : '',
    category: s.categoria,
    createdBy: '',
    creatorName: '',
    createdAt: new Date(),
    status: s.estado === 'pendiente' ? 'pending' : s.estado === 'aceptada' ? 'approved' : 'rejected',
    imageUrl: s.photo_url || undefined,
  });

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const { apiGetSolicitudesPendientes, apiGetSolicitudesAceptadas, apiGetSolicitudesRechazadas } = await import('./services/api');
      const [p, a, r] = await Promise.all([
        apiGetSolicitudesPendientes().catch(() => []),
        apiGetSolicitudesAceptadas().catch(() => []),
        apiGetSolicitudesRechazadas().catch(() => []),
      ]);
      setSolPend(p);
      setSolAcep(a);
      setSolRech(r);
    } catch (e) {
      console.error('Error cargando solicitudes:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Intentar cargar desde el backend primero
      const { apiGetAllUsers } = await import('./services/api');
      const usersFromBackend = await apiGetAllUsers();
      
      // Mapear UserDTO a User si es necesario
      const mappedUsers: User[] = usersFromBackend.map((dto: any) => ({
        id: dto.id || dto.userId,
        name: dto.name || dto.username || 'Sin nombre',
        email: dto.email,
        password: '***', // No mostrar password
        role: dto.role || 'user',
        createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      }));
      
      setAllUsers(mappedUsers);
      console.log('✅ Usuarios cargados desde backend:', mappedUsers.length);
    } catch (backendError) {
      console.warn('⚠️ Backend no disponible, usando localStorage como fallback:', backendError);
      
      // Fallback: cargar desde localStorage
      try {
        const savedUsers = localStorage.getItem('users');
        const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
        setAllUsers(users);
        console.log('✅ Usuarios cargados desde localStorage:', users.length);
      } catch (localError) {
        console.error('❌ Error cargando usuarios desde localStorage:', localError);
        setAllUsers([]);
      }
    }
  };

  useEffect(() => {
    loadSolicitudes();
    loadUsers();
    const id = window.setInterval(() => {
      loadSolicitudes();
      loadUsers();
    }, 10000);
    const onFocus = () => {
      loadSolicitudes();
      loadUsers();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const pendingPlaces = solPend.map(mapSolicitudToPlace);
  const allRequests = [...solPend, ...solAcep, ...solRech].map(mapSolicitudToPlace);

  const handleApprove = async (place: Place) => {
    try {
      const { apiAprobarSolicitud } = await import('./services/api');
      await apiAprobarSolicitud(parseInt(String(place.id), 10));
      await loadSolicitudes();
    } catch (e) {
      console.warn('Fallo al aprobar solicitud:', e);
    } finally {
      setSelectedPlace(null);
    }
  };

  const handleReject = async (place: Place) => {
    try {
      const { apiRechazarSolicitud } = await import('./services/api');
      await apiRechazarSolicitud(parseInt(String(place.id), 10));
      await loadSolicitudes();
    } catch (e) {
      console.warn('Fallo al rechazar solicitud:', e);
    } finally {
      setSelectedPlace(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">Admin Panel</h1>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowAgentChat(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition"
              title="Abrir Agente IA"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 8h10M7 12h6M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H9L5 6v12a2 2 0 0 0 2 2Z" />
              </svg>
              <span className="text-sm font-medium">Agente IA</span>
            </button>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user.name}</span> · <span className="text-purple-600 font-semibold">Administrador</span>
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span className="font-medium">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('solicitudes')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'solicitudes'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Gestión de Solicitudes
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'usuarios'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Gestión de Usuarios
            </button>
          </div>
        </div>

        {activeTab === 'solicitudes' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Solicitudes</h2>
              <p className="text-gray-600">Revisa y modera las solicitudes de lugares enviadas por los usuarios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-yellow-500">
            <div className="text-4xl font-bold text-yellow-600">{pendingPlaces.length}</div>
            <p className="text-gray-600 font-medium">Pendientes de Revisión</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-green-500">
            <div className="text-4xl font-bold text-green-600">{solAcep.length}</div>
            <p className="text-gray-600 font-medium">Aprobadas</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-red-500">
            <div className="text-4xl font-bold text-red-600">{solRech.length}</div>
            <p className="text-gray-600 font-medium">Rechazadas</p>
          </div>
        </div>

        {/* Solicitudes Pendientes */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Solicitudes Pendientes
            <span className="text-sm font-normal text-gray-500">({pendingPlaces.length})</span>
          </h3>
          
          {pendingPlaces.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <p className="font-medium">No hay solicitudes pendientes</p>
              <p className="text-sm mt-1">Todas las solicitudes han sido revisadas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPlaces.map((place: Place) => (
                <div key={place.id} className="bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200 overflow-hidden">
                  <div className="grid md:grid-cols-12 gap-4">
                    {/* Image preview */}
                    <div className="md:col-span-2">
                      {place.imageUrl || (place.photos && place.photos.length > 0) ? (
                        <img
                          src={place.imageUrl || (place.photos ? place.photos[0] : '')}
                          alt={place.name}
                          className="w-full h-32 md:h-40 object-cover rounded-l-lg"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Sin+Imagen'; }}
                        />
                      ) : (
                        <div className="w-full h-32 md:h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded-l-lg">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="md:col-span-7 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{place.name}</h4>
                          {place.category && (
                            <span className="inline-block mt-1 text-xs uppercase tracking-wide text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
                              {place.category}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                          Pendiente
                        </span>
                      </div>

                      {place.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{place.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {place.createdBy && (
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="8" r="4"/>
                              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                            </svg>
                            ID: {place.createdBy}
                          </span>
                        )}
                        {place.photos && place.photos.length > 1 && (
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="9" cy="9" r="2"/>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                            {place.photos.length} fotos
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 p-5 bg-gray-50 flex flex-col justify-center gap-3">
                      <button
                        onClick={() => handleApprove(place)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleReject(place)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        Rechazar
                      </button>
                      <button
                        onClick={() => setSelectedPlace(place)}
                        className="w-full text-sm text-gray-600 hover:text-purple-600 font-medium transition"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Historial Completo */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            Historial de Solicitudes
            <span className="text-sm font-normal text-gray-500">({allRequests.length} total)</span>
          </h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allRequests.map((place: Place) => (
                    <tr key={place.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{place.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs uppercase text-purple-600 font-medium">{place.category || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {place.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {place.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                            Pendiente
                          </span>
                        )}
                        {place.status === 'approved' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            Aprobado
                          </span>
                        )}
                        {place.status === 'rejected' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                            Rechazado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {place.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(place)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleReject(place)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
          </>
        )}

        {/* Sección de Usuarios */}
        {activeTab === 'usuarios' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h2>
              <p className="text-gray-600">Administra todos los usuarios registrados en la plataforma.</p>
              <button
                onClick={loadUsers}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-600 text-white font-semibold hover:shadow-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                </svg>
                Dame los usuarios creados
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-blue-500">
                <div className="text-4xl font-bold text-blue-600">{allUsers.length}</div>
                <p className="text-gray-600 font-medium">Total de Usuarios</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-green-500">
                <div className="text-4xl font-bold text-green-600">{allUsers.filter(u => u.role === 'user').length}</div>
                <p className="text-gray-600 font-medium">Usuarios Regulares</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-purple-500">
                <div className="text-4xl font-bold text-purple-600">{allUsers.filter(u => u.role === 'moderator' || u.role === 'admin').length}</div>
                <p className="text-gray-600 font-medium">Moderadores/Admins</p>
              </div>
            </div>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Lista de Usuarios
                <span className="text-sm font-normal text-gray-500">({allUsers.length} total)</span>
              </h3>

              {allUsers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                  </svg>
                  <p className="font-medium">No hay usuarios registrados</p>
                  <p className="text-sm mt-1">Haz clic en "Dame los usuarios creados" para cargar la lista.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map((u: User) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center text-white font-semibold">
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{u.name || 'Sin nombre'}</div>
                                  <div className="text-xs text-gray-500">ID: {u.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{u.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                u.role === 'admin' 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : u.role === 'moderator'
                                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                {u.role === 'admin' ? 'Administrador' : u.role === 'moderator' ? 'Moderador' : 'Usuario'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                                PENDING
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Modal de detalles */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedPlace(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedPlace.name}</h3>
                <button onClick={() => setSelectedPlace(null)} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {selectedPlace.category && (
                <span className="inline-block mb-4 text-xs uppercase tracking-wide text-purple-600 font-medium bg-purple-50 px-3 py-1.5 rounded">
                  {selectedPlace.category}
                </span>
              )}

              {selectedPlace.description && (
                <p className="text-gray-700 mb-6">{selectedPlace.description}</p>
              )}

              {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Imágenes ({selectedPlace.photos.length})</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPlace.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${selectedPlace.name} ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Error'; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(selectedPlace)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  Aprobar Lugar
                </button>
                <button
                  onClick={() => handleReject(selectedPlace)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  Rechazar Lugar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agente IA */}
      {showAgentChat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-3xl">
            <div className="absolute -top-3 right-0 flex gap-2">
              <button
                onClick={() => setShowAgentChat(false)}
                className="inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-gray-700 shadow border border-gray-200 hover:bg-white"
                title="Cerrar"
              >
                Cerrar ✕
              </button>
            </div>
            <AgentChat />
          </div>
        </div>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setCurrentPage('home');
      } catch (e) {
        console.error('Error loading user:', e);
      }
    }

    // NO usar MOCK_PLACES: siempre partir de array vacío para forzar sincronización desde backend
    // El efecto de sincronización se encargará de cargar los datos reales
    setPlaces([]);
    localStorage.removeItem('places'); // Limpiar localStorage para evitar datos obsoletos

    // Initialize demo users if they don't exist OR update if admin is missing
    const savedUsers = localStorage.getItem('users');
    const demoUsers: User[] = [
      {
        id: 'demo1',
        name: 'Demo User',
        email: 'demo@test.com',
        password: '123456',
        role: 'user',
        createdAt: new Date(),
      },
      {
        id: 'mod1',
        name: 'Moderator',
        email: 'mod@test.com',
        password: '123456',
        role: 'moderator',
        createdAt: new Date(),
      },
      {
        id: 'admin1',
        name: 'Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date(),
      },
    ];
    
    if (!savedUsers) {
      localStorage.setItem('users', JSON.stringify(demoUsers));
    } else {
      // Check if admin exists, if not add it
      try {
        const existingUsers: User[] = JSON.parse(savedUsers);
        const hasAdmin = existingUsers.some(u => u.role === 'admin');
        if (!hasAdmin) {
          existingUsers.push(demoUsers[2]); // Add admin user
          localStorage.setItem('users', JSON.stringify(existingUsers));
        }
      } catch (e) {
        localStorage.setItem('users', JSON.stringify(demoUsers));
      }
    }
  }, []);

  // Sincroniza lugares desde el backend (para admin y usuarios normales)
  useEffect(() => {
    if (!currentUser) return;
    let disposed = false;

    const sync = async () => {
      try {
        console.log('🔄 Sincronizando lugares desde backend...', { page: currentPage, role: currentUser.role });
        const { apiGetPlaces } = await import('./services/api');
        
        // Traer lugares desde backend (pending y approved)
        // NOTA: /rejected no está implementado en el backend todavía, así que por ahora solo traemos pending y approved
        const [pending, approved] = await Promise.all([
          apiGetPlaces({ status: 'pending' }).catch(() => []),
          apiGetPlaces({ status: 'approved' }).catch(() => []),
        ]);
        if (disposed) return;
        
        const allPlaces = [...pending, ...approved];
        console.log('✅ Lugares obtenidos:', { pending: pending.length, approved: approved.length, total: allPlaces.length });
        const normalized = allPlaces.map((p: any) => {
          const cat = normalizeCategory(p.category) || normalizeCategory(deriveCategoryFromDescription(p.description));
          const imageUrl = p.photoUrl || p.imageUrl || (p.photos && p.photos[0]) || undefined;
          console.log(`🖼️ Lugar "${p.name}": photoUrl=${p.photoUrl}, imageUrl final=${imageUrl}`);
          return {
            ...p,
            category: cat || p.category,
            imageUrl,
            status: mapStatus(p.status),
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          } as Place;
        });
        
        setPlaces(normalized);
        localStorage.setItem('places', JSON.stringify(normalized));
      } catch (e) {
        console.error('❌ Sincronización de lugares fallida:', e);
      }
    };

    // Cargar inmediatamente al entrar
    sync();
    
    // Si es admin, hacer polling cada 10s y al enfocar
    if (currentUser.role === 'admin' && currentPage === 'admin') {
      const id = window.setInterval(sync, 10000);
      const onFocus = () => sync();
      window.addEventListener('focus', onFocus);

      return () => {
        disposed = true;
        window.clearInterval(id);
        window.removeEventListener('focus', onFocus);
      };
    }

    return () => { disposed = true; };
  }, [currentPage, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Limpiar localStorage de lugares para forzar sincronización desde backend
    localStorage.removeItem('places');
    setPlaces([]); // Reset estado
    // Redirect based on role
    if (user.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('landing');
  };

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleUpdatePlace = (updatedPlace: Place) => {
    const updatedPlaces = places.map((p) => (p.id === updatedPlace.id ? updatedPlace : p));
    setPlaces(updatedPlaces);
    localStorage.setItem('places', JSON.stringify(updatedPlaces));
  };

  // Render correct page
  if (!currentUser && currentPage === 'landing') {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />;
  }

  if (currentPage === 'profile') {
    return <ProfilePage user={currentUser} places={places} onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  if (currentPage === 'moderator' && currentUser.role === 'moderator') {
    return <ModeratorDashboard user={currentUser} places={places} onUpdatePlace={handleUpdatePlace} onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  if (currentPage === 'admin' && currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} places={places} onUpdatePlace={handleUpdatePlace} onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  // Default to home page
  const handleAddPlace = (place: Place) => {
    const newPlaces = [...places, place];
    setPlaces(newPlaces);
    localStorage.setItem('places', JSON.stringify(newPlaces));
    // Si estamos en moderador, refrescar vista manteniendo la página
    if (currentPage === 'moderator') {
      // Forzar re-render navegando y volviendo (opcional)
      setCurrentPage('home');
      setTimeout(() => setCurrentPage('moderator'), 0);
    }
  };

  return (
    <HomePage
      user={currentUser}
      places={places}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onAddPlace={handleAddPlace}
    />
  );
}
