import React, { useState } from 'react';
import type { User } from '../../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
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
        const savedUsers = localStorage.getItem('users');
        const users = savedUsers ? JSON.parse(savedUsers) : [];

        const existingUser = users.find((u: User) => u.email === email);
        if (existingUser) {
          alert('El email ya está registrado');
          setIsLoading(false);
          return;
        }

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
            
            // Crear usuario para localStorage con los datos del microservicio
            const newUser: User = {
              id: createdUser.id,
              email: createdUser.email,
              password,
              name: createdUser.name,
              role: 'user',
              createdAt: new Date(createdUser.createdAt || Date.now()),
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            onLogin(newUser);
          } else {
            throw new Error('Error al crear usuario en el servidor');
          }
        } catch (error) {
          console.warn('⚠️ Microservicio no disponible, usando solo localStorage:', error);
          
          // Fallback: guardar solo en localStorage si el microservicio falla
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            password,
            name,
            role: 'user',
            createdAt: new Date(),
          };

          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          onLogin(newUser);
        }
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-orange-500"></div>
              <span className="text-sm font-semibold text-purple-400">Welcome to</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Next{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Stop
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Descubre lugares ocultos que nadie conoce. Explora, comparte y encuentra tu próxima aventura.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-orange-500"></div>
              </div>
              <div>
                <h3 className="font-semibold text-white">Comunidad Global</h3>
                <p className="text-sm text-gray-400">Conecta con exploradores de todo el mundo</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-orange-500"></div>
              </div>
              <div>
                <h3 className="font-semibold text-white">Recomendaciones IA</h3>
                <p className="text-sm text-gray-400">Obtén sugerencias personalizadas basadas en tus preferencias</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-orange-500"></div>
              </div>
              <div>
                <h3 className="font-semibold text-white">Mapas Interactivos</h3>
                <p className="text-sm text-gray-400">Visualiza ubicaciones exactas de cada lugar</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Bienvenido' : 'Únete a Next Stop'}</h2>
              <p className="text-gray-300 text-sm">
                {isLogin ? 'Continúa explorando lugares increíbles' : 'Comienza tu aventura ahora'}
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
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
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
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
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
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Procesando...
                  </span>
                ) : isLogin ? (
                  'Iniciar Sesión'
                ) : (
                  'Crear Cuenta'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="w-full border border-white/20 hover:border-purple-500 text-white/80 hover:text-white font-medium py-3 px-4 rounded-lg transition bg-white/5 hover:bg-white/10"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </form>

            <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-white/10">
              <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">Credenciales de Demo</p>
              <div className="space-y-2 text-xs text-white/70">
                <div>
                  <span className="text-white/50">Usuario:</span>{' '}
                  <span className="font-mono text-purple-400">demo@test.com</span>
                </div>
                <div>
                  <span className="text-white/50">Contraseña:</span>{' '}
                  <span className="font-mono text-purple-400">123456</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <span className="text-white/50">Moderador:</span>{' '}
                  <span className="font-mono text-orange-400">mod@test.com</span>
                </div>
                <div>
                  <span className="text-white/50">Contraseña:</span>{' '}
                  <span className="font-mono text-orange-400">123456</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
