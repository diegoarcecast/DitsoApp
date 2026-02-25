import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import { Transaction, Budget } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';

// ─── helpers ────────────────────────────────────────────────────────────────

const formatCRC = (n: number) =>
    '₡' + n.toLocaleString('es-CR', { minimumFractionDigits: 0 });

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });

// ─── Financial status badge ──────────────────────────────────────────────────

function statusInfo(pct: number): { label: string; color: string; bg: string } {
    if (pct < 70) return { label: '🟢 Seguro', color: '#14532d', bg: '#dcfce7' };
    if (pct < 90) return { label: '🟡 Moderado', color: '#713f12', bg: '#fef9c3' };
    return { label: '🔴 En riesgo', color: '#7f1d1d', bg: '#fee2e2' };
}

// ─── Smart Balance recommendations (pure frontend) ──────────────────────────

function buildRecommendation(
    budget: Budget,
    totalSpent: number,
): { velocity: string; comparison: string; projection: string } {
    const now = new Date();
    const start = new Date(budget.startDate);
    const end = new Date(budget.endDate);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    const elapsed = Math.max(1, Math.round((now.getTime() - start.getTime()) / 86400000));
    const remaining = Math.max(0, totalDays - elapsed);

    const dailyRate = totalSpent / elapsed;
    const projected = dailyRate * totalDays;
    const budgetTotal = budget.totalAmount > 0
        ? budget.totalAmount
        : budget.items.reduce((s, i) => s + i.limitAmount, 0);

    const expectedByNow = budgetTotal * (elapsed / totalDays);
    const diffPct = budgetTotal > 0 ? ((totalSpent - expectedByNow) / budgetTotal) * 100 : 0;

    const velocity = `Gastas aprox. ${formatCRC(dailyRate)} por día.`;

    const comparison = diffPct > 10
        ? `Tus gastos actuales son más altos que el promedio esperado para este punto del período (+${Math.abs(diffPct).toFixed(0)}%).`
        : diffPct < -10
            ? `Tus gastos van por debajo del plan esperado (${Math.abs(diffPct).toFixed(0)}% menos). ¡Bien hecho!`
            : 'Vas dentro de lo esperado para este período.';

    const endBalance = budgetTotal - projected;
    const projection = endBalance >= 0
        ? `Si continúas así, terminarás el período con un saldo positivo de ${formatCRC(endBalance)}.`
        : `Proyección: podrías superar tu presupuesto por ${formatCRC(Math.abs(endBalance))} al final del período.`;

    return { velocity, comparison, projection };
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DashboardScreen({ navigation }: any) {
    const { user, signOut } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budget, setBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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
        } catch {
            setError('No se pudo conectar con el servidor.\nVerifica tu conexión y que el servidor esté activo.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = () => { setRefreshing(true); loadData(); };

    // ── Derived values ────────────────────────────────────────────────────────

    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Budget-scoped expense (transactions within budget period)
    const budgetSpent = budget
        ? transactions.filter(t => {
            const d = t.date.slice(0, 10);
            return t.type === 'Expense' && d >= budget.startDate.slice(0, 10) && d <= budget.endDate.slice(0, 10);
        }).reduce((s, t) => s + t.amount, 0)
        : 0;

    const budgetTotal = budget
        ? (budget.totalAmount > 0 ? budget.totalAmount : budget.items.reduce((s, i) => s + i.limitAmount, 0))
        : 0;

    const budgetPct = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;
    const budgetRemaining = budgetTotal - budgetSpent;

    const status = statusInfo(budgetPct);
    const reco = budget ? buildRecommendation(budget, budget.totalExpenses) : null;
    const recentTxs = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={s.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={s.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                    colors={[colors.primary]} tintColor={colors.primary} />
            }
        >
            {/* ── Header ── */}
            <View style={s.header}>
                <View>
                    <Text style={s.greeting}>¡Hola, {user?.fullName?.split(' ')[0] ?? 'Usuario'}! 👋</Text>
                    <Text style={s.headerSub}>Tu resumen financiero</Text>
                </View>
                <TouchableOpacity style={s.signOutBtn} onPress={signOut}>
                    <Text style={s.signOutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            {error && (
                <View style={s.errorCard}>
                    <Text style={s.errorIcon}>⚠️</Text>
                    <Text style={s.errorText}>{error}</Text>
                    <TouchableOpacity style={s.retryBtn} onPress={() => { setLoading(true); loadData(); }}>
                        <Text style={s.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ─── §1 — Resumen financiero ─── */}
            <View style={s.balanceCard}>
                <View style={s.balanceTop}>
                    <View>
                        <Text style={s.balanceLabel}>Balance disponible</Text>
                        <Text style={[s.balanceAmount, { color: (budget?.availableBalance ?? 0) >= 0 ? colors.income : colors.expense }]}>
                            {budget ? formatCRC(budget.availableBalance) : '₡0'}
                        </Text>
                    </View>
                    {budget && (
                        <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
                        </View>
                    )}
                </View>

                {/* 4 Indicadores */}
                <View style={s.indicatorsGrid}>
                    <View style={s.indicatorItem}>
                        <Text style={s.indicatorIcon}>💰</Text>
                        <Text style={s.indicatorValue}>{budget ? formatCRC(budget.plannedIncome) : '₡0'}</Text>
                        <Text style={s.indicatorLabel}>Ingresos planificados</Text>
                    </View>
                    <View style={s.indicatorItem}>
                        <Text style={s.indicatorIcon}>⭐</Text>
                        <Text style={[s.indicatorValue, { color: colors.primary }]}>
                            {budget ? formatCRC(budget.additionalIncome) : '₡0'}
                        </Text>
                        <Text style={s.indicatorLabel}>Ingresos adicionales</Text>
                    </View>
                    <View style={s.indicatorItem}>
                        <Text style={s.indicatorIcon}>💸</Text>
                        <Text style={[s.indicatorValue, { color: colors.expense }]}>
                            {budget ? formatCRC(budget.totalExpenses) : '₡0'}
                        </Text>
                        <Text style={s.indicatorLabel}>Gastos totales</Text>
                    </View>
                    <View style={s.indicatorItem}>
                        <Text style={s.indicatorIcon}>💚</Text>
                        <Text style={[s.indicatorValue, { color: (budget?.availableBalance ?? 0) >= 0 ? colors.income : colors.expense }]}>
                            {budget ? formatCRC(budget.availableBalance) : '₡0'}
                        </Text>
                        <Text style={s.indicatorLabel}>Balance neto</Text>
                    </View>
                </View>

                {budget && <ProgressBar percentage={budget.totalAmount > 0 ? (budget.totalExpenses / budget.totalAmount) * 100 : 0} />}
            </View>

            {/* ─── §2 — Presupuesto activo ─── */}
            {budget && (
                <View style={s.card}>
                    <Text style={s.cardTitle}>🎯 Presupuesto activo</Text>
                    <View style={s.budgetMeta}>
                        <Text style={s.budgetPeriod}>{budget.period}</Text>
                        <Text style={s.budgetDates}>
                            {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
                        </Text>
                    </View>
                    <View style={s.budgetAmounts}>
                        <View style={s.budgetAmtItem}>
                            <Text style={s.budgetAmtLabel}>Total</Text>
                            <Text style={s.budgetAmtValue}>{formatCRC(budgetTotal)}</Text>
                        </View>
                        <View style={s.budgetAmtItem}>
                            <Text style={s.budgetAmtLabel}>Gastado</Text>
                            <Text style={[s.budgetAmtValue, { color: colors.expense }]}>{formatCRC(budgetSpent)}</Text>
                        </View>
                        <View style={s.budgetAmtItem}>
                            <Text style={s.budgetAmtLabel}>Restante</Text>
                            <Text style={[s.budgetAmtValue, { color: budgetRemaining >= 0 ? colors.income : colors.expense }]}>
                                {formatCRC(budgetRemaining)}
                            </Text>
                        </View>
                    </View>
                    <ProgressBar percentage={budgetPct} />
                    <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('Presupuesto')}>
                        <Text style={s.linkText}>Ver detalles del presupuesto →</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ─── §3 — Balance Inteligente (solo lectura) ─── */}
            {budget && reco && (
                <View style={s.card}>
                    <Text style={s.cardTitle}>⚖️ Balance Inteligente</Text>
                    <Text style={s.recoSubtitle}>Análisis automático · Solo lectura</Text>

                    <View style={s.recoItem}>
                        <Text style={s.recoIcon}>⚡</Text>
                        <Text style={s.recoText}>{reco.velocity}</Text>
                    </View>
                    <View style={s.recoItem}>
                        <Text style={s.recoIcon}>📊</Text>
                        <Text style={s.recoText}>{reco.comparison}</Text>
                    </View>
                    {/* Insight de ingresos adicionales */}
                    {budget && budget.additionalIncome > 0 && (
                        <View style={[s.recoItem, s.recoHighlight]}>
                            <Text style={s.recoIcon}>⭐</Text>
                            <Text style={s.recoText}>
                                Has recibido {formatCRC(budget.additionalIncome)} en ingresos adicionales este período.
                                Tu capacidad financiera ha aumentado.
                            </Text>
                        </View>
                    )}
                    <View style={s.recoItem}>
                        <Text style={s.recoIcon}>🔭</Text>
                        <Text style={s.recoText}>{reco.projection}</Text>
                    </View>
                    {budgetPct < 90 && (
                        <View style={s.recoItem}>
                            <Text style={s.recoIcon}>✅</Text>
                            <Text style={s.recoText}>No se detectan riesgos financieros inmediatos.</Text>
                        </View>
                    )}

                    <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('Balance')}>
                        <Text style={s.linkText}>Ver análisis completo →</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ─── §4 — Últimas transacciones ─── */}
            <View style={s.card}>
                <View style={s.cardHeader}>
                    <Text style={s.cardTitle}>💰 Últimas transacciones</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Transacciones')}>
                        <Text style={s.linkText}>Ver todas →</Text>
                    </TouchableOpacity>
                </View>

                {recentTxs.length === 0 ? (
                    <Text style={s.emptyText}>Sin transacciones aún</Text>
                ) : (
                    recentTxs.map(tx => (
                        <View key={tx.id} style={s.txRow}>
                            <View style={s.txLeft}>
                                <Text style={s.txCategory}>{tx.categoryName}</Text>
                                <Text style={s.txDate}>{formatDate(tx.date)}</Text>
                            </View>
                            <View style={s.txRight}>
                                <Text style={[s.txAmount, { color: tx.type === 'Income' ? colors.income : colors.expense }]}>
                                    {tx.type === 'Income' ? '+' : '-'}{formatCRC(tx.amount)}
                                </Text>
                                <Text style={s.txType}>{tx.type === 'Income' ? 'Ingreso' : 'Gasto'}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            <View style={{ height: 20 }} />
        </ScrollView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { ...(typography.body as object), color: colors.textSecondary },

    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: { ...(typography.h2 as object), color: colors.white, fontSize: 20 },
    headerSub: { ...(typography.bodySmall as object), color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    signOutBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
    signOutText: { ...(typography.bodySmall as object), color: colors.white },

    errorCard: { margin: spacing.md, backgroundColor: '#FEF2F2', borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.error },
    errorIcon: { fontSize: 32, marginBottom: spacing.sm },
    errorText: { ...(typography.bodySmall as object), color: colors.error, textAlign: 'center' },
    retryBtn: { marginTop: spacing.md, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
    retryText: { ...(typography.bodySmall as object), color: colors.white, fontWeight: '600' },

    // §1 balance card
    balanceCard: {
        margin: spacing.md, marginTop: -spacing.md,
        backgroundColor: colors.white, borderRadius: borderRadius.xl,
        padding: spacing.lg, ...(shadows.medium as object),
    },
    balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
    balanceLabel: { ...(typography.bodySmall as object), color: colors.textSecondary },
    balanceAmount: { fontSize: 34, fontWeight: '800', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: borderRadius.full },
    statusText: { fontSize: 12, fontWeight: '700' },
    balanceRow: { flexDirection: 'row', marginTop: spacing.md, marginBottom: spacing.md },
    balanceItem: { flex: 1, alignItems: 'center' },
    balanceItemLabel: { ...(typography.caption as object), color: colors.textSecondary },
    balanceItemAmt: { ...(typography.bodySmall as object), fontWeight: '700', marginTop: 2 },
    divider: { width: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

    // Generic card
    card: {
        marginHorizontal: spacing.md, marginBottom: spacing.md,
        backgroundColor: colors.white, borderRadius: borderRadius.lg,
        padding: spacing.lg, ...(shadows.small as object),
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    cardTitle: { ...(typography.h3 as object), fontSize: 15, color: colors.text, marginBottom: spacing.sm },
    linkBtn: { marginTop: spacing.sm + 2 },
    linkText: { ...(typography.bodySmall as object), color: colors.primary, fontWeight: '600' },
    emptyText: { ...(typography.bodySmall as object), color: colors.textSecondary },

    // §2 budget card
    budgetMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    budgetPeriod: { ...(typography.bodySmall as object), fontWeight: '700', color: colors.text },
    budgetDates: { ...(typography.caption as object), color: colors.textSecondary },
    budgetAmounts: { flexDirection: 'row', marginBottom: spacing.sm },
    budgetAmtItem: { flex: 1, alignItems: 'center' },
    budgetAmtLabel: { ...(typography.caption as object), color: colors.textSecondary },
    budgetAmtValue: { ...(typography.bodySmall as object), fontWeight: '700', marginTop: 2 },

    // §1 — 4 indicators grid
    indicatorsGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        marginTop: spacing.md, marginBottom: spacing.sm, gap: spacing.sm,
    },
    indicatorItem: {
        flex: 1, minWidth: '45%', backgroundColor: colors.gray100,
        borderRadius: borderRadius.md, padding: spacing.sm, alignItems: 'center',
    },
    indicatorIcon: { fontSize: 20, marginBottom: 4 },
    indicatorValue: { ...(typography.bodySmall as object), fontWeight: '700', color: colors.text },
    indicatorLabel: { ...(typography.caption as object), color: colors.textSecondary, textAlign: 'center', marginTop: 2 },

    // §3 smart balance
    recoSubtitle: { ...(typography.caption as object), color: colors.textSecondary, marginTop: -4, marginBottom: spacing.md, fontStyle: 'italic' },
    recoItem: { flexDirection: 'row', gap: 10, marginBottom: spacing.sm, alignItems: 'flex-start' },
    recoHighlight: {
        backgroundColor: colors.primary + '15', borderRadius: borderRadius.md,
        padding: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.primary,
    },
    recoIcon: { fontSize: 15, marginTop: 1 },
    recoText: { flex: 1, ...(typography.bodySmall as object), color: colors.text, lineHeight: 20 },

    // §4 transactions
    txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    txLeft: { flex: 1 },
    txRight: { alignItems: 'flex-end' },
    txCategory: { ...(typography.bodySmall as object), color: colors.text, fontWeight: '500' },
    txDate: { ...(typography.caption as object), color: colors.textSecondary },
    txAmount: { ...(typography.bodySmall as object), fontWeight: '700' },
    txType: { ...(typography.caption as object), color: colors.textSecondary },
});

