import { baseUrl } from '@/config/apiConfig';
import axios from 'axios';

const api = axios.create({
	baseURL: `${baseUrl}/v1`,
	withCredentials: true,
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Check if the error is due to an expired access token
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = (originalRequest._retry || 0) + 1;
			if (originalRequest._retry > 3) {
				return Promise.reject(error);
			}

			try {
				// Attempt to refresh the token
				await api.post('/auth/refresh-token');
				console.log('Token refreshed successfully');
				return api(originalRequest);
			} catch (refreshError) {
				console.error('Failed to refresh token:', refreshError);
				// Clear cookies and redirect to login page
				document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
				document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
				window.location.href = '/login';
			}
		}

		return Promise.reject(error);
	}
);

export const login = (credentials: { email: string; password: string }) =>
	api.post('/auth/login', credentials);

export const getDashboardData = () => api.get('/dashboard/data');

export default api;