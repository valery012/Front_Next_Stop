/**
 * API de conexión a microservicios usando ENDPOINTS + httpClient.
 * Incluye métodos listos para usar en componentes.
 */

import { ENDPOINTS } from '../config/endpoints';
import { httpGet, httpPost, httpPut, httpDelete } from './httpClient';
import type {
  LoginResponse,
  RefreshTokenResponse,
  UserDTO,
  UpdateUserRequest,
  PlaceDTO,
  CreatePlaceRequest,
  UpdatePlaceRequest,
  NotificationDTO,
  ModerationActionResponse,
  DashboardStatsDTO,
  RequestDTO,
  RequestActionResponse,
  SolicitudDTO,
  CreateSolicitudRequest,
} from '../types/dto';

// Bases
const AUTH_BASE = ENDPOINTS.AUTH;           // Si tu login vive en USERS, cambia a ENDPOINTS.USERS
const USERS_BASE = ENDPOINTS.USERS;
const PLACES_BASE = ENDPOINTS.PLACES;
const NOTIF_BASE = ENDPOINTS.NOTIFICATIONS;
const ADMIN_BASE = ENDPOINTS.MODERATION;    // Admin/Moderación
// Micro específico de solicitudes (Flask)
const SOLICITUDES_BASE = ENDPOINTS.REQUESTS;
const REQUESTS_BASE = ENDPOINTS.REQUESTS; // Alias para requests

// ========== AUTH ==========
export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  // TODO: Conectar con Auth microservicio real (puerto 8085)
  // return httpPost<LoginResponse>(`${AUTH_BASE}/auth/login`, { email, password }, { useAuth: false });
  
  // ⚠️ TEMPORAL: Login simulado hasta conectar con Auth
  
  const users = await apiGetAllUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  // Simular generación de token (en producción debe venir del backend)
  const mockToken = btoa(`${user.id}:${Date.now()}`);
  
  // Guardar en localStorage para que httpClient lo use
  localStorage.setItem('accessToken', mockToken);
  localStorage.setItem('userId', user.id);
  
  return {
    accessToken: mockToken,
    user: user as any // Cast temporal hasta que se implemente auth real
  };
}

export async function apiRefresh(refreshToken: string): Promise<RefreshTokenResponse> {
  // Si el backend no tiene refresh token, remover esta función
  return httpPost<RefreshTokenResponse>(
    `${AUTH_BASE}/api/users/refresh`,
    { refreshToken },
    { useAuth: false }
  );
}

export async function apiLogout(): Promise<void> {
  // Limpiar localStorage local
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
}

// ========== USERS ==========
export async function apiGetMyProfile(): Promise<UserDTO> {
  const userId = localStorage.getItem('userId');
  if (!userId) throw new Error('No hay sesión activa');
  return httpGet<UserDTO>(`${USERS_BASE}/api/users/${userId}`);
}

export async function apiUpdateMyProfile(data: UpdateUserRequest): Promise<UserDTO> {
  const userId = localStorage.getItem('userId');
  if (!userId) throw new Error('No hay sesión activa');
  return httpPut<UserDTO>(`${USERS_BASE}/api/users/${userId}`, data);
}

export async function apiGetUserById(id: string): Promise<UserDTO> {
  return httpGet<UserDTO>(`${USERS_BASE}/api/users/${id}`);
}

export async function apiGetAllUsers(): Promise<UserDTO[]> {
  return httpGet<UserDTO[]>(`${USERS_BASE}/api/users`);
}

// ========== PLACES ==========
export async function apiGetPlaces(params?: { category?: string; status?: 'pending' | 'approved' | 'rejected' }): Promise<PlaceDTO[]> {
  // Backend usa /api/places directamente y status es PENDING/ACCEPTED/REJECTED
  let url = `${PLACES_BASE}/api/places`;
  if (params?.status === 'pending') url = `${PLACES_BASE}/api/places/pending`;
  if (params?.status === 'approved') url = `${PLACES_BASE}/api/places/accepted`;
  if (params?.status === 'rejected') url = `${PLACES_BASE}/api/places/rejected`;
  return httpGet<PlaceDTO[]>(url, { useAuth: false });
}

export async function apiGetPlaceById(id: string): Promise<PlaceDTO> {
  return httpGet<PlaceDTO>(`${PLACES_BASE}/api/places/${id}`, { useAuth: false });
}

// NOTA: Los usuarios NO crean lugares directamente.
// Deben crear SOLICITUDES que el admin aprueba.
// Ver apiCreateSolicitud() más abajo.

export async function apiUpdatePlace(id: string, data: UpdatePlaceRequest): Promise<PlaceDTO> {
  return httpPut<PlaceDTO>(`${PLACES_BASE}/api/places/${id}`, data, { useAuth: false });
}

export async function apiDeletePlace(id: string): Promise<void> {
  return httpDelete<void>(`${PLACES_BASE}/api/places/${id}`, { useAuth: false });
}

export async function apiAcceptPlace(id: string): Promise<void> {
  // Endpoint dedicado del microservicio de lugares
  return httpPost<void>(`${PLACES_BASE}/api/places/${id}/accept`, undefined, { useAuth: false });
}

export async function apiRejectPlace(id: string): Promise<void> {
  // Endpoint dedicado del microservicio de lugares
  return httpPost<void>(`${PLACES_BASE}/api/places/${id}/reject`, undefined, { useAuth: false });
}

export async function apiGetMyPlaces(): Promise<PlaceDTO[]> {
  // Filtrar en frontend por userId o pedir al backend agregar endpoint
  const allPlaces = await apiGetPlaces();
  const userId = localStorage.getItem('userId');
  return allPlaces.filter(p => p.createdBy === userId);
}

// ========== NOTIFICATIONS ==========
export async function apiGetMyNotifications(): Promise<NotificationDTO[]> {
  return httpGet<NotificationDTO[]>(`${NOTIF_BASE}/notificaciones`);
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  return httpPost<void>(`${NOTIF_BASE}/notificaciones/${id}/leer`);
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  // Marcar todas como leídas iterando o agregar endpoint en backend
  const notifications = await apiGetMyNotifications();
  await Promise.all(notifications.map(n => apiMarkNotificationRead(n.id)));
}

// ========== ADMIN / MODERATION ==========
export async function apiGetPendingPlaces(): Promise<PlaceDTO[]> {
  return httpGet<PlaceDTO[]>(`${ADMIN_BASE}/api/v1/moderation/pending`);
}

export async function apiModeratePlace(placeId: string, action: 'approve' | 'reject', reason?: string): Promise<ModerationActionResponse> {
  return httpPost<ModerationActionResponse>(`${ADMIN_BASE}/api/v1/moderation/action`, { placeId, action, reason });
}

export async function apiGetDashboardStats(): Promise<DashboardStatsDTO> {
  return httpGet<DashboardStatsDTO>(`${ADMIN_BASE}/api/v1/moderation/stats`);
}

// ========== REQUESTS / SOLICITUDES ==========
export async function apiGetMyRequests(): Promise<RequestDTO[]> {
  return httpGet<RequestDTO[]>(`${REQUESTS_BASE}/api/v1/requests/my`);
}

export async function apiGetAllRequests(): Promise<RequestDTO[]> {
  return httpGet<RequestDTO[]>(`${REQUESTS_BASE}/api/v1/requests`);
}

export async function apiGetPendingRequests(): Promise<RequestDTO[]> {
  return httpGet<RequestDTO[]>(`${REQUESTS_BASE}/api/v1/requests/pending`);
}

export async function apiApproveRequest(requestId: string, reason?: string): Promise<RequestActionResponse> {
  return httpPost<RequestActionResponse>(`${REQUESTS_BASE}/api/v1/requests/${requestId}/approve`, { reason });
}

export async function apiRejectRequest(requestId: string, reason?: string): Promise<RequestActionResponse> {
  return httpPost<RequestActionResponse>(`${REQUESTS_BASE}/api/v1/requests/${requestId}/reject`, { reason });
}

// ========== SOLICITUDES (Flask) ==========
export async function apiCreateSolicitud(data: CreateSolicitudRequest): Promise<{ id?: number; mensaje?: string; error?: string; }>{
  // POST /solicitudes/ (el backend puede devolver solo mensaje y opcionalmente id)
  // No requiere autenticación, así que useAuth: false
  return httpPost<{ id?: number; mensaje?: string; error?: string; }>(`${SOLICITUDES_BASE}/solicitudes/`, data, { useAuth: false });
}

export async function apiGetSolicitudesPendientes(): Promise<SolicitudDTO[]> {
  return httpGet<SolicitudDTO[]>(`${SOLICITUDES_BASE}/solicitudes/pendientes`);
}

export async function apiGetSolicitudesAceptadas(): Promise<SolicitudDTO[]> {
  return httpGet<SolicitudDTO[]>(`${SOLICITUDES_BASE}/solicitudes/aceptadas`);
}

export async function apiGetSolicitudesRechazadas(): Promise<SolicitudDTO[]> {
  return httpGet<SolicitudDTO[]>(`${SOLICITUDES_BASE}/solicitudes/rechazadas`);
}

export async function apiAprobarSolicitud(id: number): Promise<{ mensaje?: string; error?: string; detalle?: string; }>{
  return httpPut<{ mensaje?: string; error?: string; detalle?: string; }>(`${SOLICITUDES_BASE}/solicitudes/${id}/aprobar`, {});
}

export async function apiRechazarSolicitud(id: number): Promise<{ mensaje?: string; error?: string; }>{
  return httpPut<{ mensaje?: string; error?: string; }>(`${SOLICITUDES_BASE}/solicitudes/${id}/rechazar`, {});
}

// Obtener solicitudes de un usuario específico (para mostrar en su perfil)
export async function apiGetSolicitudesByUser(userEmail: string, estado?: 'pendiente' | 'aceptada' | 'rechazada'): Promise<SolicitudDTO[]> {
  let url = `${SOLICITUDES_BASE}/solicitudes/usuario/${userEmail}`;
  if (estado) {
    url += `?estado=${estado}`;
  }
  return httpGet<SolicitudDTO[]>(url, { useAuth: false });
}
