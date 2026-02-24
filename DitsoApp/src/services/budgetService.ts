import apiClient from './apiClient';
import {
    Budget, CreateBudgetRequest, UpdateBudgetRequest,
    AddBudgetItemRequest, RemoveBudgetItemRequest,
    SuggestedDistributionItem, ActiveCategory,
} from '../types';

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
            if (error.response?.status === 404) return null;
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

    /** Edita el presupuesto: nombre, monto total (recalcula ítems), fechas o ítems en bloque. */
    async updateBudget(id: number, data: UpdateBudgetRequest): Promise<Budget> {
        const response = await apiClient.put<Budget>(`/budgets/${id}`, data);
        return response.data;
    },

    /** Actualiza un ítem con limitAmount o percentage (el backend elige cuál). */
    async updateItem(
        budgetId: number,
        itemId: number,
        data: { limitAmount?: number; percentage?: number }
    ): Promise<Budget> {
        const response = await apiClient.put<Budget>(`/budgets/${budgetId}/items/${itemId}`, data);
        return response.data;
    },

    /** Agrega una categoría nueva al presupuesto existente. */
    async addItem(budgetId: number, data: AddBudgetItemRequest): Promise<Budget> {
        const response = await apiClient.post<Budget>(`/budgets/${budgetId}/items`, data);
        return response.data;
    },

    /** Elimina una categoría del presupuesto. Si tiene transacciones, requiere reassignToCategoryId. */
    async removeItem(budgetId: number, itemId: number, data: RemoveBudgetItemRequest): Promise<Budget> {
        const response = await apiClient.delete<Budget>(
            `/budgets/${budgetId}/items/${itemId}`,
            { data }
        );
        return response.data;
    },

    async getSuggestedDistribution(totalAmount: number): Promise<SuggestedDistributionItem[]> {
        const response = await apiClient.get<SuggestedDistributionItem[]>(
            `/budgets/suggested-distribution?totalAmount=${totalAmount}`
        );
        return response.data;
    },

    /** Categorías válidas del presupuesto activo para registrar transacciones. */
    async getActiveCategories(type: 'Income' | 'Expense'): Promise<ActiveCategory[]> {
        const response = await apiClient.get<ActiveCategory[]>(
            `/budgets/active-categories?type=${type}`
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
