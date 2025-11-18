import React from 'react';

type NavigationProps = {
  onOpenAgent?: () => void;
};

export const Navigation: React.FC<NavigationProps> = ({ onOpenAgent }) => {
  return (
    <nav className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-500 via-orange-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
              📍
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Next Stop</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAgent}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Agente IA
            </button>

            <button className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all">
              Comenzar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
