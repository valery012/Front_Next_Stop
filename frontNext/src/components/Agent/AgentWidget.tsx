import React from 'react';

export const AgentWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Agente IA</h2>
        <span className="text-sm text-gray-500">Visual (placeholder)</span>
      </div>

      <p className="text-gray-600 mb-4">
        Aquí podrás interactuar con el agente de inteligencia artificial. Por ahora es solo una interfaz visual; la conexión con el agente se configurará más adelante.
      </p>

      <div className="border border-dashed border-gray-200 rounded-lg p-4 mb-4 text-center text-gray-400">
        <svg className="mx-auto mb-2 h-10 w-10 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.567-3 3.5S10.343 15 12 15s3-1.567 3-3.5S13.657 8 12 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 19.2c1.9-5.6 7.1-8 11.4-8s9.5 2.4 11.4 8" />
        </svg>
        <div>Interfaz de agente — pendiente integración</div>
      </div>

      <div className="flex flex-col gap-2">
        <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90">Abrir agente</button>
        <button className="w-full border border-gray-200 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Historial de conversaciones</button>
      </div>
    </div>
  );
};

export default AgentWidget;
