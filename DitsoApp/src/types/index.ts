export interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface Transaction {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    amount: number;
    type: 'Income' | 'Expense';
    date: string;
    description?: string;
    fileId?: number;
    isExtraIncome: boolean;
    createdAt: string;
}

export interface CreateTransactionRequest {
    categoryId: number;
    amount: number;
    type: 'Income' | 'Expense';
    date: string;
    description?: string;
    isExtraIncome?: boolean;
}

export interface Category {
    id: number;
    name: string;
    icon: string;
    type: 'Income' | 'Expense';
    isCustom: boolean;
}

/** Categoría válida para el presupuesto activo (la única que puede usarse al crear transacciones). */
export interface ActiveCategory {
    categoryId: number;
    budgetItemId: number;
    name: string;
    icon: string;
    isSystemCategory: boolean;
}

export interface Budget {
    id: number;
    name?: string;
    period: 'Semanal' | 'Quincenal' | 'Mensual' | 'Personalizado';
    startDate: string;
    endDate: string;
    isActive: boolean;
    totalAmount: number;
    items: BudgetItem[];
    createdAt: string;

    // ── Financial summary ─────────────────────────────────────
    plannedIncome: number;
    additionalIncome: number;
    totalIncome: number;
    totalExpenses: number;
    availableBalance: number;
    totalAssigned: number;
    unassigned: number;
}

export interface BudgetItem {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    limitAmount: number;
    /** Porcentaje que este ítem representa del TotalAmount del presupuesto (0-100). */
    percentage: number;
    spentAmount: number;
    receivedAmount: number;
    remainingAmount: number;
    percentageUsed: number;
    isIncome: boolean;
    isSystemCategory: boolean;
}

export interface CreateBudgetRequest {
    period: 'Semanal' | 'Quincenal' | 'Mensual' | 'Personalizado';
    startDate: string;
    customEndDate?: string;
    totalAmount: number;
    name?: string;
    items: {
        categoryId: number;
        limitAmount: number;
        isIncome: boolean;
        isSystemCategory?: boolean;
    }[];
}

/** Payload para editar el presupuesto completo (todos los campos son opcionales). */
export interface UpdateBudgetRequest {
    name?: string;
    totalAmount?: number;
    startDate?: string;
    endDate?: string;
    /** Lista de ítems a actualizar en bloque (solo ítems no-sistema). */
    items?: { itemId: number; limitAmount: number }[];
}

export interface AddBudgetItemRequest {
    categoryId: number;
    limitAmount: number;
    isIncome: boolean;
}

export interface RemoveBudgetItemRequest {
    /** ID de la categoría a la que se reasignan las transacciones del ítem eliminado. */
    reassignToCategoryId?: number;
}

export interface SuggestedDistributionItem {
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    percentage: number;
    suggestedAmount: number;
    isIncome: boolean;
}
