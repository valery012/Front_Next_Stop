/**
 * DTOs (Data Transfer Objects) para contratos con microservicios.
 * Ajusta estos tipos según las respuestas reales de tu backend.
 */

// ========== Auth Service ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserDTO;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

// ========== Users Service ==========
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
}

// ========== Places Service ==========
export interface PlaceDTO {
  id: string;
  name: string;
  description?: string;
  category: string;
  photoUrl?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  rating?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string; // User ID
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePlaceRequest {
  name: string;
  description?: string;
  category: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'; // Opcional, default PENDING
  address?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
}

export interface UpdatePlaceRequest {
  name?: string;
  description?: string;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
}

// ========== Notifications Service ==========
export interface NotificationDTO {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

// ========== Moderation Service ==========
export interface ModerationActionRequest {
  placeId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ModerationActionResponse {
  placeId: string;
  status: 'approved' | 'rejected';
  moderatedBy: string;
  moderatedAt: string;
}

export interface DashboardStatsDTO {
  totalPlaces: number;
  pendingPlaces: number;
  approvedPlaces: number;
  rejectedPlaces: number;
  totalUsers?: number;
}

// ========== Requests (Solicitudes) ==========
export interface RequestDTO {
  id: string;
  placeId: string;
  createdBy: string; // userId
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // adminId
}

export interface RequestActionResponse {
  id: string; // requestId
  status: 'approved' | 'rejected';
  reason?: string;
  reviewedBy: string;
  reviewedAt: string;
}

// ========== Solicitudes (Microservicio Flask) ==========
// Representa la entidad que vive en la tabla 'solicitudes'
export interface SolicitudDTO {
  id: number;
  nombre: string;
  categoria: string;
  ubicacion: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  user_email?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateSolicitudRequest {
  nombre: string;
  categoria: string;
  ubicacion: string;
  user_email?: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
}
