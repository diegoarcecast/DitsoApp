import apiClient from './apiClient';

export interface FinancialHealthData {
    startDate: string;
    endDate: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    expensePercentage: number;
    healthStatus: string;      // "Saludable" | "Riesgo" | "Peligro" | "Sin datos"
    statusColor: string;       // "green" | "yellow" | "red" | "gray"
    statusEmoji: string;
    educationalMessage: string;
}

export const financialHealthService = {
    getHealth: async (startDate: string, endDate: string): Promise<FinancialHealthData> => {
        const res = await apiClient.get('/financial-health', {
            params: { startDate, endDate },
        });
        return res.data;
    },
};
