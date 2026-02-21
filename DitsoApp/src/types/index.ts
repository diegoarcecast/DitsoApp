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
    amount: number;
    type: 'Income' | 'Expense';
    date: string;
    description?: string;
    fileId?: number;
    createdAt: string;
}

export interface CreateTransactionRequest {
    categoryId: number;
    amount: number;
    type: 'Income' | 'Expense';
    date: string;
    description?: string;
}

export interface Category {
    id: number;
    name: string;
    icon: string;
    type: 'Income' | 'Expense';
    isCustom: boolean;
}

export interface Budget {
    id: number;
    period: 'Quincenal' | 'Mensual';
    startDate: string;
    endDate: string;
    isActive: boolean;
    items: BudgetItem[];
    createdAt: string;
}

export interface BudgetItem {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    limitAmount: number;
    spentAmount: number;
    remainingAmount: number;
    percentageUsed: number;
}

export interface CreateBudgetRequest {
    period: 'Quincenal' | 'Mensual';
    startDate: string;
    items: {
        categoryId: number;
        limitAmount: number;
    }[];
}
