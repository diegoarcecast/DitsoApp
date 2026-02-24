import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { financialHealthService, FinancialHealthData } from '../services/financialHealthService';
import { ProgressBar } from '../components/ProgressBar';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date) => d.toISOString().split('T')[0]; // "2026-02-01"

const formatDate = (d: Date) =>
    d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatCRC = (amount: number) =>
    '₡' + amount.toLocaleString('es-CR', { minimumFractionDigits: 0 });

/** Calcula la quincena actual según el día de hoy */
function getCurrentBiweek(): { start: Date; end: Date } {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    if (today.getDate() <= 15) {
        return {
            start: new Date(year, month, 1),
            end: new Date(year, month, 15),
        };
    }
    return {
        start: new Date(year, month, 16),
        end: new Date(year, month + 1, 0), // último día del mes
    };
}

/** Retorna el primer y último día del mes actual */
function getCurrentMonth(): { start: Date; end: Date } {
    const today = new Date();
    return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    };
}

// ─── Paleta por estado ────────────────────────────────────────────────────────

const statusPalette: Record<string, { bg: string; border: string; text: string }> = {
    green: { bg: '#ECFDF5', border: '#16A34A', text: '#065F46' },
    yellow: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
    red: { bg: '#FEF2F2', border: '#DC2626', text: '#991B1B' },
    gray: { bg: '#F8FAFC', border: '#CBD5E1', text: '#475569' },
};

type Preset = 'biweek' | 'month' | 'custom';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BalanceScreen() {
    const biweek = getCurrentBiweek();

    const [startDate, setStartDate] = useState<Date>(biweek.start);
    const [endDate, setEndDate] = useState<Date>(biweek.end);
    const [preset, setPreset] = useState<Preset>('biweek');

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [data, setData] = useState<FinancialHealthData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─── Fetch ──────────────────────────────────────────────────────────────

    const fetchHealth = useCallback(async (start: Date, end: Date) => {
        setLoading(true);
        setError(null);
        try {
            const result = await financialHealthService.getHealth(toISO(start), toISO(end));
            setData(result);
        } catch {
            setError('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial al abrir la pantalla
    React.useEffect(() => {
        fetchHealth(startDate, endDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Presets ─────────────────────────────────────────────────────────────

    const applyPreset = (p: Preset) => {
        setPreset(p);
        let start: Date, end: Date;
        if (p === 'biweek') {
            ({ start, end } = getCurrentBiweek());
        } else if (p === 'month') {
            ({ start, end } = getCurrentMonth());
        } else {
            return; // custom: solo cambia el label
        }
        setStartDate(start);
        setEndDate(end);
        fetchHealth(start, end);
    };

    // ─── Pickers ─────────────────────────────────────────────────────────────

    const onStartChange = (_: DateTimePickerEvent, selected?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selected) {
            const newStart = selected > endDate ? endDate : selected;
            setStartDate(newStart);
            setPreset('custom');
        }
    };

    const onEndChange = (_: DateTimePickerEvent, selected?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selected) {
            const newEnd = selected < startDate ? startDate : selected;
            setEndDate(newEnd);
            setPreset('custom');
        }
    };

    const handleApply = () => fetchHealth(startDate, endDate);

    // ─── Render ──────────────────────────────────────────────────────────────

    const palette = data ? (statusPalette[data.statusColor] ?? statusPalette.gray) : statusPalette.gray;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🧠 Balance Inteligente</Text>
                <Text style={styles.headerSub}>Analiza tu salud financiera en cualquier período</Text>
            </View>

            {/* Presets */}
            <View style={styles.presetRow}>
                {(['biweek', 'month', 'custom'] as Preset[]).map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.presetBtn, preset === p && styles.presetBtnActive]}
                        onPress={() => applyPreset(p)}
                    >
                        <Text style={[styles.presetText, preset === p && styles.presetTextActive]}>
                            {p === 'biweek' ? 'Quincena' : p === 'month' ? 'Este mes' : 'Personalizado'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Date selectors */}
            <View style={styles.dateCard}>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
                    <Text style={styles.dateBtnLabel}>Desde</Text>
                    <Text style={styles.dateBtnValue}>📅 {formatDate(startDate)}</Text>
                </TouchableOpacity>

                <View style={styles.dateSeparator} />

                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
                    <Text style={styles.dateBtnLabel}>Hasta</Text>
                    <Text style={styles.dateBtnValue}>📅 {formatDate(endDate)}</Text>
                </TouchableOpacity>
            </View>

            {/* Apply button (only when custom) */}
            {preset === 'custom' && (
                <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                    <Text style={styles.applyBtnText}>Calcular →</Text>
                </TouchableOpacity>
            )}

            {/* DateTimePickers */}
            {showStartPicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    maximumDate={endDate}
                    onChange={onStartChange}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                    onChange={onEndChange}
                />
            )}

            {/* Result */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Calculando…</Text>
                </View>
            ) : error != null ? (
                <View style={styles.errorCard}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={handleApply}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : data != null ? (
                <View style={[styles.resultCard, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                    {/* Status badge */}
                    <View style={styles.statusRow}>
                        <Text style={styles.statusEmoji}>{data.statusEmoji}</Text>
                        <View>
                            <Text style={[styles.statusLabel, { color: palette.text }]}>{data.healthStatus}</Text>
                            <Text style={styles.statusPeriod}>
                                {formatDate(new Date(data.startDate))} — {formatDate(new Date(data.endDate))}
                            </Text>
                        </View>
                    </View>

                    {/* Amounts grid */}
                    <View style={styles.amountsGrid}>
                        <View style={styles.amountBox}>
                            <Text style={styles.amountLabel}>↑ Ingresos</Text>
                            <Text style={[styles.amountValue, { color: colors.income }]}>
                                {formatCRC(data.totalIncome)}
                            </Text>
                        </View>
                        <View style={styles.amountBox}>
                            <Text style={styles.amountLabel}>↓ Gastos</Text>
                            <Text style={[styles.amountValue, { color: colors.expense }]}>
                                {formatCRC(data.totalExpense)}
                            </Text>
                        </View>
                        <View style={[styles.amountBox, styles.amountBoxFull]}>
                            <Text style={styles.amountLabel}>Balance neto</Text>
                            <Text style={[styles.amountValueLarge, {
                                color: data.balance >= 0 ? colors.income : colors.expense
                            }]}>
                                {formatCRC(data.balance)}
                            </Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.barSection}>
                        <View style={styles.barLabels}>
                            <Text style={styles.barLabelText}>Porcentaje de gasto</Text>
                            <Text style={[styles.barLabelPct, { color: palette.text }]}>
                                {data.expensePercentage.toFixed(1)}%
                            </Text>
                        </View>
                        <ProgressBar percentage={Math.min(data.expensePercentage, 100)} />
                        <View style={styles.barLegend}>
                            <Text style={styles.legendText}>🟢 ≤70%</Text>
                            <Text style={styles.legendText}>🟡 71–90%</Text>
                            <Text style={styles.legendText}>🔴 &gt;90%</Text>
                        </View>
                    </View>

                    {/* Educational message */}
                    <View style={[styles.messageBox, { borderLeftColor: palette.border }]}>
                        <Text style={[styles.messageText, { color: palette.text }]}>
                            {data.educationalMessage}
                        </Text>
                    </View>
                </View>
            ) : null}
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing.xl },

    header: {
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
    },
    headerTitle: { ...(typography.h2 as object), color: colors.white, fontSize: 22 },
    headerSub: { ...(typography.bodySmall as object), color: 'rgba(255,255,255,0.7)', marginTop: 4 },

    presetRow: {
        flexDirection: 'row',
        margin: spacing.md,
        gap: spacing.sm,
    },
    presetBtn: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    presetBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    presetText: {
        ...(typography.caption as object),
        fontWeight: '600',
        color: colors.textSecondary,
    },
    presetTextActive: { color: colors.white },

    dateCard: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        overflow: 'hidden',
        ...(shadows.small as object),
    },
    dateBtn: {
        flex: 1,
        padding: spacing.md,
        alignItems: 'center',
    },
    dateBtnLabel: { ...(typography.caption as object), color: colors.textSecondary },
    dateBtnValue: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text, marginTop: 4 },
    dateSeparator: { width: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

    applyBtn: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    applyBtnText: { ...(typography.body as object), color: colors.white, fontWeight: '600' },

    center: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
    loadingText: { ...(typography.bodySmall as object), color: colors.textSecondary },

    errorCard: {
        margin: spacing.md,
        backgroundColor: '#FEF2F2',
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
    errorText: { ...(typography.bodySmall as object), color: colors.error, textAlign: 'center' },
    retryBtn: {
        marginTop: spacing.md,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    retryText: { ...(typography.bodySmall as object), color: colors.white, fontWeight: '600' },

    resultCard: {
        margin: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1.5,
        padding: spacing.lg,
        ...(shadows.medium as object),
    },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
    statusEmoji: { fontSize: 40 },
    statusLabel: { fontSize: 20, fontWeight: 'bold' },
    statusPeriod: { ...(typography.caption as object), color: colors.textSecondary, marginTop: 2 },

    amountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    amountBox: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    amountBoxFull: { minWidth: '100%' },
    amountLabel: { ...(typography.caption as object), color: colors.textSecondary },
    amountValue: { ...(typography.body as object), fontWeight: '700', marginTop: 4 },
    amountValueLarge: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },

    barSection: { marginBottom: spacing.md },
    barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    barLabelText: { ...(typography.caption as object), color: colors.textSecondary },
    barLabelPct: { ...(typography.caption as object), fontWeight: '700' },
    barLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
    legendText: { ...(typography.caption as object), color: colors.textSecondary },

    messageBox: {
        borderLeftWidth: 3,
        paddingLeft: spacing.md,
        paddingVertical: spacing.sm,
    },
    messageText: { ...(typography.bodySmall as object), fontStyle: 'italic', lineHeight: 20 },
});
