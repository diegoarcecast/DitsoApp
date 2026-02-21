import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

// IMPORTANTE: Cambia esta IP por la IP de tu computadora en la red local
// Para obtenerla en Windows: ipconfig (busca IPv4 Address)
// Para obtenerla en Mac/Linux: ifconfig (busca inet)
const LOCAL_IP = '192.168.0.164'; // IP local de la PC

// Usa localhost en web, IP local en mobile
const API_URL = Platform.OS === 'web'
    ? 'http://localhost:5200/api'
    : `http://${LOCAL_IP}:5200/api`;

console.log('🔗 API URL configurada:', API_URL);

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos timeout
});

// Request interceptor para agregar el token JWT
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor para manejar errores 401 (token expirado)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Log de errores para debugging (ignorar 404 que son casos normales)
        if (error.response) {
            if (error.response.status !== 404) {
                console.error('❌ API Error:', error.response.status, error.response.data);
            }
        } else if (error.request) {
            console.error('❌ Network Error: No response received');
            console.error('URL:', error.config?.url);
        } else {
            console.error('❌ Request Error:', error.message);
        }

        // Si el error es 401 y no es un retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await storage.getItem('refreshToken');

                if (refreshToken) {
                    // Intentar refrescar el token
                    const response = await axios.post(
                        `${API_URL}/auth/refresh`,
                        JSON.stringify(refreshToken),
                        {
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );

                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    // Guardar nuevos tokens
                    await storage.setItem('accessToken', accessToken);
                    await storage.setItem('refreshToken', newRefreshToken);

                    // Reintentar la petición original con el nuevo token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Si falla el refresh, eliminar tokens y redirigir a login
                await storage.removeItem('accessToken');
                await storage.removeItem('refreshToken');
                console.error('❌ Refresh token failed, redirecting to login');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
