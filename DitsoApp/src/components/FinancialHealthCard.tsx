import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FinancialHealthData } from '../services/financialHealthService';
import { ProgressBar } from './ProgressBar';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';

interface Props {
    data: FinancialHealthData | null;
    loading: boolean;
    onViewDetail?: () => void;
}

const statusPalette: Record<string, { bg: string; border: string; text: string; barColor: string }> = {
    green: { bg: '#ECFDF5', border: '#16A34A', text: '#065F46', barColor: '#16A34A' },
    yellow: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', barColor: '#F59E0B' },
    red: { bg: '#FEF2F2', border: '#DC2626', text: '#991B1B', barColor: '#DC2626' },
    gray: { bg: '#F8FAFC', border: '#CBD5E1', text: '#475569', barColor: '#CBD5E1' },
};

const formatCRC = (amount: number) =>
    '₡' + amount.toLocaleString('es-CR', { minimumFractionDigits: 0 });

export function FinancialHealthCard({ data, loading, onViewDetail }: Props) {
    if (loading) {
        return (
            <View style={[styles.card, { backgroundColor: colors.gray100 }]}>
                <Text style={styles.loadingText}>Calculando salud financiera…</Text>
            </View>
        );
    }

    if (!data) return null;

    const palette = statusPalette[data.statusColor] ?? statusPalette.gray;

    return (
        <View style={[styles.card, { backgroundColor: palette.bg, borderColor: palette.border }]}>
            {/* Title row */}
            <View style={styles.row}>
                <Text style={styles.title}>🧠 Balance Inteligente</Text>
                <Text style={styles.statusBadge}>
                    {data.statusEmoji} {data.healthStatus}
                </Text>
            </View>

            {/* Amounts */}
            <View style={styles.amountsRow}>
                <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>↑ Ingresos</Text>
                    <Text style={[styles.amountValue, { color: colors.income }]}>
                        {formatCRC(data.totalIncome)}
                    </Text>
                </View>
                <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>↓ Gastos</Text>
                    <Text style={[styles.amountValue, { color: colors.expense }]}>
                        {formatCRC(data.totalExpense)}
                    </Text>
                </View>
                <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Balance</Text>
                    <Text style={[styles.amountValue, { color: data.balance >= 0 ? colors.income : colors.expense }]}>
                        {formatCRC(data.balance)}
                    </Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={styles.barRow}>
                <ProgressBar percentage={Math.min(data.expensePercentage, 100)} />
                <Text style={[styles.pctLabel, { color: palette.text }]}>
                    {data.expensePercentage.toFixed(1)}% gastado
                </Text>
            </View>

            {/* Educational message */}
            <Text style={[styles.message, { color: palette.text }]}>{data.educationalMessage}</Text>

            {/* CTA */}
            {onViewDetail != null && (
                <TouchableOpacity onPress={onViewDetail} style={styles.linkBtn}>
                    <Text style={[styles.linkText, { color: palette.border }]}>Ver detalle →</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1.5,
        padding: spacing.lg,
        ...(shadows.small as object),
    },
    loadingText: {
        ...(typography.bodySmall as object),
        color: colors.textSecondary,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        ...(typography.bodySmall as object),
        fontWeight: '700',
        color: colors.text,
    },
    statusBadge: {
        ...(typography.bodySmall as object),
        fontWeight: '600',
    },
    amountsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    amountItem: {
        flex: 1,
        alignItems: 'center',
    },
    amountLabel: {
        ...(typography.caption as object),
        color: colors.textSecondary,
    },
    amountValue: {
        ...(typography.bodySmall as object),
        fontWeight: '600',
        marginTop: 2,
    },
    barRow: {
        marginBottom: spacing.sm,
    },
    pctLabel: {
        ...(typography.caption as object),
        marginTop: 4,
    },
    message: {
        ...(typography.caption as object),
        fontStyle: 'italic',
        lineHeight: 18,
    },
    linkBtn: {
        marginTop: spacing.sm,
        alignSelf: 'flex-end',
    },
    linkText: {
        ...(typography.bodySmall as object),
        fontWeight: '600',
    },
});
