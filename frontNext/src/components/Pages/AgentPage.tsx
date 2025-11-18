import React from 'react';
import { AgentChat } from '../Agent/AgentChat';

export const AgentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <AgentChat />
      </div>
    </div>
  );
};

export default AgentPage;
