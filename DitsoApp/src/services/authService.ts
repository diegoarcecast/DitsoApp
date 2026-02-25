import apiClient from './apiClient';
import { storage } from './storage';
import { LoginRequest, RegisterRequest, AuthResponse, User, UpdateProfileRequest, ChangePasswordRequest } from '../types';

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        await storage.setItem('accessToken', response.data.accessToken);
        await storage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<void> {
        await apiClient.post('/auth/register', data);
    },

    async logout(): Promise<void> {
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
    },

    async getStoredToken(): Promise<string | null> {
        return await storage.getItem('accessToken');
    },

    async updateProfile(data: UpdateProfileRequest): Promise<User> {
        const response = await apiClient.put<User>('/auth/profile', data);
        return response.data;
    },

    async changePassword(data: ChangePasswordRequest): Promise<void> {
        await apiClient.put('/auth/change-password', data);
    },
};
