import apiClient from './apiClient';
import { PeriodReport, MonthlyDataPoint } from '../types';

export const reportService = {
    /**
     * Reporte de gastos por categoría en un período.
     * GET /api/reports/summary?startDate=&endDate=
     */
    async getSummary(startDate: Date, endDate: Date): Promise<PeriodReport> {
        const fmt = (d: Date) => d.toISOString().split('T')[0];
        const response = await apiClient.get<PeriodReport>(
            `/reports/summary?startDate=${fmt(startDate)}&endDate=${fmt(endDate)}`
        );
        return response.data;
    },

    /**
     * Evolución mensual (12 puntos) para un año.
     * GET /api/reports/monthly?year=
     */
    async getMonthly(year?: number): Promise<MonthlyDataPoint[]> {
        const y = year ?? new Date().getFullYear();
        const response = await apiClient.get<MonthlyDataPoint[]>(
            `/reports/monthly?year=${y}`
        );
        return response.data;
    },
};
