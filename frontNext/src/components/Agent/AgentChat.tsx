import React, { useState, useEffect, useRef } from 'react';

// Tipos locales para mensajes mock
type MessageType = 'user' | 'agent' | 'cards' | 'error';

interface ChatMessage {
  id: string;
  type: MessageType;
  text?: string;
  cards?: Array<{
    id: string | number;
    title: string;
    description?: string;
    status?: string;
  }>;
  createdAt: string; // ISO timestamp
}

// Mensajes iniciales de ejemplo (visual solamente)
const initialMessages: ChatMessage[] = [
  {
    id: 'm1',
    type: 'agent',
    text: 'Hola, soy Maya 👋 Tu guía IA especializada en turismo alternativo. ¿Qué te gustaría descubrir hoy?',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm2',
    type: 'cards',
    cards: [
      { id: 1, title: 'Palacio de la Música Catalana - Azotea', description: 'Acceso exclusivo a la azotea con vistas únicas del Eixample. Solo disponible en visitas guiadas especiales.', status: 'ACCEPTED' },
      { id: 2, title: 'Palacio de la Músicaaaaa kasjs - Azotea', description: 'Acceso exclusivo a la azotea con vistas únicas del Eixample. Solo disponible en visitas guiadas especiales.', status: 'ACCEPTED' },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const AgentChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [suggestions] = useState<string[]>([
    'Lugares ocultos en Barcelona',
    'Experiencias nocturnas únicas',
    'Rutas culturales alternativas',
    'Eventos especiales este mes'
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto scroll al final cuando cambien los mensajes
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const now = new Date().toISOString();
    const userMsg: ChatMessage = { id: crypto.randomUUID(), type: 'user', text: input.trim(), createdAt: now };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input.trim();
    setInput('');
    setSending(true);

    try {
      // Importar dinámicamente para evitar errores de build
      const { sendToAgent } = await import('../../services/agentService');
      const response = await sendToAgent(userInput);

      if (response.type === 'cards' && Array.isArray(response.data)) {
        const cardsMsg: ChatMessage = {
          id: crypto.randomUUID(),
          type: 'cards',
          cards: response.data.map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            title: item.nombre || item.name || item.title || 'Sin título',
            description: item.descripcion || item.description || '',
            status: item.estado || item.status || '',
          })),
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, cardsMsg]);
      } else if (response.type === 'error') {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          type: 'error',
          text: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMsg]);
      } else {
        const textMsg: ChatMessage = {
          id: crypto.randomUUID(),
          type: 'agent',
          text: typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2),
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, textMsg]);
      }
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'error',
        text: error.message || 'Error de conexión con el agente IA',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    setTimeout(() => handleSend(), 50);
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  /*
    ✅ INTEGRACIÓN COMPLETADA:
    - El componente ahora usa agentService.ts para conectar con el backend real
    - Normaliza respuestas tipo 'cards', 'text' y 'error'
    - Maneja errores de conexión con mensajes descriptivos
    
    MEJORAS FUTURAS OPCIONALES:
    - AbortController para cancelar peticiones largas
    - Persistencia de historial en localStorage
    - Indicador de progreso más granular (streaming)
    - Reconexión automática si el agente está offline
  */

  return (
    <div className={
      'flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 backdrop-blur-sm transition-[height] duration-300 ' +
      (minimized ? 'h-[72px]' : 'h-[80vh]')
    }>
      {/* Header */}
      <div className="relative">
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600" />
        <div className="px-6 py-4 flex items-center justify-between bg-white/90">
          <div className="flex items-center gap-4">
          <div className="relative w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-700 bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200">
            <div className="absolute inset-0 rounded-full ring-2 ring-indigo-300/40 animate-pulse" />
            Maya
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-gray-800">Maya · Guía IA</span>
            <span className="text-xs text-gray-500">Turismo alternativo y lugares ocultos</span>
          </div>
        </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMinimized(m => !m)}
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 transition"
              aria-label={minimized ? 'Expandir chat' : 'Minimizar chat'}
            >
              {minimized ? 'Expandir' : 'Minimizar'}
            </button>
          </div>
      </div>
      </div>

      {/* Mensajes */}
      {!minimized && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-gradient-to-b from-gray-50 to-white"
          aria-live="polite"
        >
          {messages.map(msg => {
            if (msg.type === 'cards' && msg.cards) {
              return (
                <div key={msg.id} className="space-y-4">
                  {msg.cards.map(card => (
                    <div
                      key={card.id}
                      className="group relative bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition"
                    >
                      <div className="absolute -left-1 top-4 h-8 w-1 rounded bg-gradient-to-b from-indigo-500 to-purple-500" />
                      <h3 className="font-semibold text-gray-800 flex items-start gap-2 text-sm">
                        <span className="text-lg">🧭</span>
                        <span>{card.title}</span>
                      </h3>
                      {card.description && (
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                          <span className="font-semibold text-indigo-600">Descripción:</span> {card.description}
                        </p>
                      )}
                      {card.status && (
                        <p className="text-xs mt-2">
                          <span className="font-semibold text-purple-600">Estado:</span> {card.status}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div
                key={msg.id}
                className={
                  msg.type === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <div
                  className={
                    'relative max-w-[72%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed ' +
                    (msg.type === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow'
                      : msg.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm')
                  }
                >
                  {msg.type !== 'user' && msg.type !== 'error' && (
                    <span className="absolute -left-2 top-3 h-6 w-1 rounded bg-gradient-to-b from-purple-500 to-indigo-500" />
                  )}
                  {msg.text}
                  <div className="mt-1 text-[10px] opacity-60 select-none">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-xs text-gray-500 shadow-sm flex items-center gap-2" aria-label="El agente está escribiendo">
              <span className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
              </span>
              <span>Escribiendo...</span>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Input */}
      {!minimized && (
      <div className="border-t border-gray-200 bg-white px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 mb-1">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestion(s)}
              className="text-[10px] px-2 py-1 rounded-full border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 transition"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 text-sm px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          placeholder="Pregunta sobre lugares ocultos..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); if (e.key === 'Enter' && e.ctrlKey) handleSend(); }}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-5 py-2 rounded-md text-xs font-semibold shadow hover:brightness-110 disabled:opacity-50"
        >
          Enviar
        </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default AgentChat;
