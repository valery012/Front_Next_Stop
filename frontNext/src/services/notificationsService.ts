import { httpClient } from './httpClient';

const NOTIFICATIONS_BASE_URL = 'http://localhost:5005';

export interface Notification {
	id: number;
	mensaje: string;
	tipo: string;
	estado: 'pendiente' | 'leida';
	user_email: string | null;
	place_id: number | null;
	created_at: string;
}

/**
 * Obtiene todas las notificaciones de un usuario por email
 */
export async function getNotificationsByUser(userEmail: string): Promise<Notification[]> {
	try {
		const response = await httpClient.get<Notification[]>(
			`${NOTIFICATIONS_BASE_URL}/notificaciones/usuario/${encodeURIComponent(userEmail)}`
		);
		return response;
	} catch (error) {
		console.error('Error obteniendo notificaciones:', error);
		return [];
	}
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
	try {
		await httpClient.put(`${NOTIFICATIONS_BASE_URL}/notificaciones/${notificationId}/leer`, {});
	} catch (error) {
		console.error('Error marcando notificación como leída:', error);
		throw error;
	}
}

/**
 * Elimina una notificación
 */
export async function deleteNotification(notificationId: number): Promise<void> {
	try {
		await httpClient.delete(`${NOTIFICATIONS_BASE_URL}/notificaciones/${notificationId}`);
	} catch (error) {
		console.error('Error eliminando notificación:', error);
		throw error;
	}
}

/**
 * Obtiene el conteo de notificaciones no leídas
 */
export async function getUnreadCount(userEmail: string): Promise<number> {
	try {
		const notifications = await getNotificationsByUser(userEmail);
		return notifications.filter(n => n.estado === 'pendiente').length;
	} catch (error) {
		console.error('Error obteniendo conteo de no leídas:', error);
		return 0;
	}
}
