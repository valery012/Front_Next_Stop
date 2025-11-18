/**
 * Servicio para comunicación con el Agente IA (Bridge API).
 * Conecta el frontend con el backend FastAPI + Gemini.
 */

export interface AgentResponse {
  type: 'cards' | 'text' | 'error';
  modulo?: string;
  data: any;
}

export interface AgentCard {
  id: string | number;
  title: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

/**
 * Envía un mensaje al agente IA y recibe respuesta estructurada.
 * 
 * @param message - Mensaje del usuario
 * @returns Respuesta del agente con tipo y datos
 * 
 * @example
 * const response = await sendToAgent('Muéstrame lugares ocultos en Barcelona');
 * if (response.type === 'cards') {
 *   // Renderizar tarjetas de lugares
 * }
 */
export async function sendToAgent(message: string): Promise<AgentResponse> {
  const base = import.meta.env.VITE_BRIDGE_API_URL || 'http://localhost:9000';
  
  try {
    const response = await fetch(`${base}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: AgentResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error comunicando con el agente:', error);
    return {
      type: 'error',
      data: error.message || 'Error de conexión con el agente IA'
    };
  }
}

/**
 * Obtiene el estado actual del agente IA.
 * 
 * @returns Estado del agente (online, precisión, etc.)
 */
export async function getAgentStatus(): Promise<{
  status: string;
  precision?: number;
  lugares?: number;
  conocimiento?: number;
}> {
  const base = import.meta.env.VITE_BRIDGE_API_URL || 'http://localhost:9000';
  
  try {
    const response = await fetch(`${base}/estado`);
    if (!response.ok) {
      throw new Error('No se pudo obtener el estado del agente');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo estado del agente:', error);
    return { status: 'offline' };
  }
}
