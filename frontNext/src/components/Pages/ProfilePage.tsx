import React, { useState } from 'react';
import type { User } from '../../types';

const mockUser: User = {
  id: 'user123',
  name: 'Juan García',
  email: 'juan@example.com',
  role: 'user',
  avatar: 'https://via.placeholder.com/150',
};

export const ProfilePage: React.FC = () => {
  const [user] = useState<User>(mockUser);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Guardar' : 'Editar'}
            </button>
          </div>
          <div className="flex gap-8 items-start">
            <div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
              />
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Nombre</label>
                  <p className="text-lg text-gray-800">{user.name}</p>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Email</label>
                  <p className="text-lg text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Rol</label>
                  <p className="text-lg text-gray-800 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm font-semibold">LUGARES CREADOS</p>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm font-semibold">RESEÑAS</p>
              <p className="text-3xl font-bold text-green-600">48</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm font-semibold">SEGUIDORES</p>
              <p className="text-3xl font-bold text-purple-600">234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
