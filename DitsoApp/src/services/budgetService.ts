import apiClient from './apiClient';
import { Budget, CreateBudgetRequest } from '../types';

export const budgetService = {
    async getAll(): Promise<Budget[]> {
        const response = await apiClient.get<Budget[]>('/budgets');
        return response.data;
    },

    async getActive(): Promise<Budget | null> {
        try {
            const response = await apiClient.get<Budget>('/budgets/active');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async getById(id: number): Promise<Budget> {
        const response = await apiClient.get<Budget>(`/budgets/${id}`);
        return response.data;
    },

    async create(data: CreateBudgetRequest): Promise<Budget> {
        const response = await apiClient.post<Budget>('/budgets', data);
        return response.data;
    },

    async updateItem(budgetId: number, itemId: number, limitAmount: number): Promise<Budget> {
        const response = await apiClient.put<Budget>(
            `/budgets/${budgetId}/items/${itemId}`,
            { limitAmount }
        );
        return response.data;
    },

    async deactivate(id: number): Promise<void> {
        await apiClient.patch(`/budgets/${id}/deactivate`);
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/budgets/${id}`);
    },
};
