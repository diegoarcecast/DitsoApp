import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import { Transaction, Budget } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';

export default function DashboardScreen({ navigation }: any) {
    const { user, signOut } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budget, setBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const [txs, activeBudget] = await Promise.all([
                transactionService.getAll(),
                budgetService.getActive(),
            ]);
            setTransactions(txs);
            setBudget(activeBudget);
        } catch (e) {
            setError('No se pudo conectar con el servidor.\nVerifica tu conexión y que el servidor esté activo.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const totalIncome = transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const formatCRC = (amount: number) =>
        '₡' + amount.toLocaleString('es-CR', { minimumFractionDigits: 0 });

    const recentTxs = transactions.slice(0, 5);

    const budgetTotal = budget
        ? budget.items.reduce((s, i) => s + i.limitAmount, 0)
        : 0;
    const budgetSpent = budget
        ? budget.items.reduce((s, i) => s + i.spentAmount, 0)
        : 0;
    const budgetPct = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;

    if (loading === true) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>¡Hola, {user?.fullName?.split(' ')[0] ?? 'Usuario'}! 👋</Text>
                    <Text style={styles.period}>Período actual</Text>
                </View>
                <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
                    <Text style={styles.signOutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            {error != null ? (
                <View style={styles.errorCard}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* Balance card */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text style={[
                    styles.balanceAmount,
                    { color: balance >= 0 ? colors.income : colors.expense }
                ]}>
                    {formatCRC(balance)}
                </Text>
                <View style={styles.balanceRow}>
                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceItemLabel}>↑ Ingresos</Text>
                        <Text style={[styles.balanceItemAmount, { color: colors.income }]}>
                            {formatCRC(totalIncome)}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceItemLabel}>↓ Gastos</Text>
                        <Text style={[styles.balanceItemAmount, { color: colors.expense }]}>
                            {formatCRC(totalExpense)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Budget card */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>🎯 Presupuesto activo</Text>
                {budget != null ? (
                    <>
                        <View style={styles.budgetHeader}>
                            <Text style={styles.budgetPeriod}>{budget.period}</Text>
                            <Text style={styles.budgetPct}>{Math.round(budgetPct)}% usado</Text>
                        </View>
                        <ProgressBar percentage={budgetPct} />
                        <Text style={styles.budgetDetail}>
                            {formatCRC(budgetSpent)} / {formatCRC(budgetTotal)}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Presupuesto')}
                            style={styles.linkBtn}
                        >
                            <Text style={styles.linkText}>Ver detalle →</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.emptyBudget}>
                        <Text style={styles.emptyText}>No hay presupuesto activo</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Presupuesto')}
                            style={styles.linkBtn}
                        >
                            <Text style={styles.linkText}>Crear presupuesto →</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Últimas transacciones */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>💰 Últimas transacciones</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Transacciones')}>
                        <Text style={styles.linkText}>Ver todas →</Text>
                    </TouchableOpacity>
                </View>

                {recentTxs.length === 0 ? (
                    <Text style={styles.emptyText}>Sin transacciones aún</Text>
                ) : (
                    recentTxs.map((tx) => (
                        <View key={tx.id} style={styles.txRow}>
                            <View style={styles.txLeft}>
                                <Text style={styles.txCategory}>{tx.categoryName}</Text>
                                <Text style={styles.txDate}>{tx.date.slice(0, 10)}</Text>
                            </View>
                            <Text style={[
                                styles.txAmount,
                                { color: tx.type === 'Income' ? colors.income : colors.expense }
                            ]}>
                                {tx.type === 'Income' ? '+' : '-'}{formatCRC(tx.amount)}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { ...(typography.body as object), color: colors.textSecondary },

    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: { ...(typography.h2 as object), color: colors.white, fontSize: 20 },
    period: { ...(typography.bodySmall as object), color: colors.white, opacity: 0.8 },
    signOutBtn: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    signOutText: { ...(typography.bodySmall as object), color: colors.white },

    errorCard: {
        margin: spacing.md,
        backgroundColor: '#FEF2F2',
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
    errorIcon: { fontSize: 32, marginBottom: spacing.sm },
    errorText: { ...(typography.bodySmall as object), color: colors.error, textAlign: 'center' },
    retryBtn: {
        marginTop: spacing.md,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    retryText: { ...(typography.bodySmall as object), color: colors.white, fontWeight: '600' },

    balanceCard: {
        margin: spacing.md,
        marginTop: -spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...(shadows.medium as object),
    },
    balanceLabel: { ...(typography.bodySmall as object), color: colors.textSecondary, textAlign: 'center' },
    balanceAmount: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginVertical: spacing.sm },
    balanceRow: { flexDirection: 'row', marginTop: spacing.sm },
    balanceItem: { flex: 1, alignItems: 'center' },
    balanceItemLabel: { ...(typography.caption as object), color: colors.textSecondary },
    balanceItemAmount: { ...(typography.body as object), fontWeight: '600', marginTop: 2 },
    divider: { width: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

    sectionCard: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...(shadows.small as object),
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { ...(typography.h3 as object), fontSize: 16, color: colors.text, marginBottom: spacing.md },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    budgetPeriod: { ...(typography.bodySmall as object), color: colors.textSecondary },
    budgetPct: { ...(typography.bodySmall as object), color: colors.text, fontWeight: '600' },
    budgetDetail: { ...(typography.caption as object), color: colors.textSecondary, marginTop: spacing.xs },
    emptyBudget: { alignItems: 'flex-start' },
    emptyText: { ...(typography.bodySmall as object), color: colors.textSecondary },
    linkBtn: { marginTop: spacing.sm },
    linkText: { ...(typography.bodySmall as object), color: colors.primary, fontWeight: '600' },

    txRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    txLeft: { flex: 1 },
    txCategory: { ...(typography.bodySmall as object), color: colors.text, fontWeight: '500' },
    txDate: { ...(typography.caption as object), color: colors.textSecondary },
    txAmount: { ...(typography.body as object), fontWeight: '600' },
});
