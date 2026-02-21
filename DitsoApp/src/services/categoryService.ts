import apiClient from './apiClient';
import { Category } from '../types';

export interface CreateCategoryRequest {
    name: string;
    type: 'Income' | 'Expense';
    icon?: string;
}

export const categoryService = {
    async getAll(): Promise<Category[]> {
        const response = await apiClient.get<Category[]>('/categories');
        return response.data;
    },

    async getByType(type: 'Income' | 'Expense'): Promise<Category[]> {
        const response = await apiClient.get<Category[]>(`/categories/by-type/${type}`);
        return response.data;
    },

    async create(data: CreateCategoryRequest): Promise<Category> {
        const response = await apiClient.post<Category>('/categories', data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/categories/${id}`);
    },
};
