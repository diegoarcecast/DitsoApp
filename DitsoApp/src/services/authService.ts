import apiClient from './apiClient';
import { storage } from './storage';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types';

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);

        // Guardar tokens de forma segura
        await storage.setItem('accessToken', response.data.accessToken);
        await storage.setItem('refreshToken', response.data.refreshToken);

        return response.data;
    },

    async register(data: RegisterRequest): Promise<void> {
        await apiClient.post('/auth/register', data);
    },

    async logout(): Promise<void> {
        // Eliminar tokens
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
    },

    async getStoredToken(): Promise<string | null> {
        return await storage.getItem('accessToken');
    },
};
