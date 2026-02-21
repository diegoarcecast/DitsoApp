import apiClient from './apiClient';
import { Transaction, CreateTransactionRequest } from '../types';

export const transactionService = {
    async getAll(from?: string, to?: string): Promise<Transaction[]> {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const response = await apiClient.get<Transaction[]>(`/transactions?${params.toString()}`);
        return response.data;
    },

    async getById(id: number): Promise<Transaction> {
        const response = await apiClient.get<Transaction>(`/transactions/${id}`);
        return response.data;
    },

    async create(data: CreateTransactionRequest): Promise<Transaction> {
        const response = await apiClient.post<Transaction>('/transactions', data);
        return response.data;
    },

    async update(id: number, data: Partial<CreateTransactionRequest>): Promise<Transaction> {
        const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/transactions/${id}`);
    },
};
