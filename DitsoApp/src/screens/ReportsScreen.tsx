import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../theme';
import { reportService } from '../services/reportService';
import { iconToEmoji } from '../utils/iconUtils';
import { PeriodReport, MonthlyDataPoint } from '../types';

type TabType = 'periodo' | 'mensual';

const fmtCRC = (n: number) =>
    '₡' + Math.round(n).toLocaleString('es-CR');

const fmtDateLabel = (d: Date) =>
    d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ReportsScreen() {
    const [tab, setTab] = useState<TabType>('periodo');

    // Período
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });
    const [endDate, setEndDate] = useState(new Date());
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);

    const [periodReport, setPeriodReport] = useState<PeriodReport | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPeriod = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getSummary(startDate, endDate);
            setPeriodReport(data);
        } catch {
            setError('No se pudo cargar el reporte.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    const loadMonthly = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getMonthly();
            setMonthlyData(data);
        } catch {
            setError('No se pudo cargar el reporte mensual.');
        } finally {
            setLoading(false);
        }
    }, []);

    const maxBar = monthlyData.length > 0
        ? Math.max(...monthlyData.map(m => Math.max(m.totalExpense, m.totalIncome)), 1)
        : 1;

    return (
        <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerTitle}>📊 Reportes</Text>
                <Text style={s.headerSub}>Análisis de tu actividad financiera</Text>
            </View>

            {/* Tabs */}
            <View style={s.tabRow}>
                {(['periodo', 'mensual'] as TabType[]).map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[s.tabBtn, tab === t && s.tabBtnActive]}
                        onPress={() => setTab(t)}
                    >
                        <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                            {t === 'periodo' ? '📅 Por Período' : '📆 Evolución Anual'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── PERÍODO ── */}
            {tab === 'periodo' && (
                <View style={s.card}>
                    <Text style={s.sectionTitle}>Seleccionar período</Text>

                    <View style={s.dateRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.dateLabel}>Desde</Text>
                            <TouchableOpacity style={s.dateBtn} onPress={() => setShowStart(true)}>
                                <Text style={s.dateBtnText}>{fmtDateLabel(startDate)}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={s.dateLabel}>Hasta</Text>
                            <TouchableOpacity style={s.dateBtn} onPress={() => setShowEnd(true)}>
                                <Text style={s.dateBtnText}>{fmtDateLabel(endDate)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showStart && (
                        <View style={s.pickerWrap}>
                            <DateTimePicker
                                value={startDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                themeVariant="light"
                                onChange={(_: DateTimePickerEvent, d?: Date) => {
                                    if (Platform.OS === 'android') setShowStart(false);
                                    if (d) setStartDate(d);
                                }}
                                style={Platform.OS === 'ios' ? { height: 120 } : undefined}
                            />
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity style={s.pickerDone} onPress={() => setShowStart(false)}>
                                    <Text style={s.pickerDoneText}>Listo ✓</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    {showEnd && (
                        <View style={s.pickerWrap}>
                            <DateTimePicker
                                value={endDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                themeVariant="light"
                                onChange={(_: DateTimePickerEvent, d?: Date) => {
                                    if (Platform.OS === 'android') setShowEnd(false);
                                    if (d) setEndDate(d);
                                }}
                                style={Platform.OS === 'ios' ? { height: 120 } : undefined}
                            />
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity style={s.pickerDone} onPress={() => setShowEnd(false)}>
                                    <Text style={s.pickerDoneText}>Listo ✓</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <TouchableOpacity
                        style={[s.btn, loading && { opacity: 0.6 }]}
                        onPress={loadPeriod}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={s.btnText}>Generar reporte</Text>}
                    </TouchableOpacity>

                    {error && <Text style={s.errorText}>{error}</Text>}

                    {periodReport && (
                        <>
                            {/* Totales */}
                            <View style={s.totalsRow}>
                                <View style={[s.totalCard, { borderLeftColor: colors.primary }]}>
                                    <Text style={s.totalLabel}>Ingresos</Text>
                                    <Text style={[s.totalValue, { color: colors.primary }]}>
                                        {fmtCRC(periodReport.totalIncome)}
                                    </Text>
                                </View>
                                <View style={[s.totalCard, { borderLeftColor: colors.error }]}>
                                    <Text style={s.totalLabel}>Gastos</Text>
                                    <Text style={[s.totalValue, { color: colors.error }]}>
                                        {fmtCRC(periodReport.totalExpense)}
                                    </Text>
                                </View>
                                <View style={[s.totalCard, { borderLeftColor: colors.accent }]}>
                                    <Text style={s.totalLabel}>Balance</Text>
                                    <Text style={[s.totalValue, { color: periodReport.balance >= 0 ? colors.primary : colors.error }]}>
                                        {fmtCRC(periodReport.balance)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={s.savingsRate}>
                                💰 Tasa de ahorro: <Text style={{ fontWeight: '700' }}>{periodReport.savingsRate}%</Text>
                            </Text>

                            {/* Por categoría */}
                            {periodReport.byCategory.length > 0 && (
                                <>
                                    <Text style={s.sectionTitle}>Gastos por categoría</Text>
                                    {periodReport.byCategory.map((cat, i) => (
                                        <View key={i} style={s.catRow}>
                                            <Text style={s.catEmoji}>{iconToEmoji(cat.categoryIcon)}</Text>
                                            <View style={{ flex: 1 }}>
                                                <View style={s.catLabelRow}>
                                                    <Text style={s.catName}>{cat.categoryName}</Text>
                                                    <Text style={s.catPct}>{cat.percentage}%</Text>
                                                </View>
                                                {/* Barra nativa */}
                                                <View style={s.barBg}>
                                                    <View
                                                        style={[s.barFill, { width: `${Math.min(cat.percentage, 100)}%` }]}
                                                    />
                                                </View>
                                                <Text style={s.catAmount}>{fmtCRC(cat.totalExpense)}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </View>
            )}

            {/* ── MENSUAL ── */}
            {tab === 'mensual' && (
                <View style={s.card}>
                    <Text style={s.sectionTitle}>Evolución {new Date().getFullYear()}</Text>
                    <TouchableOpacity
                        style={[s.btn, loading && { opacity: 0.6 }]}
                        onPress={loadMonthly}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={s.btnText}>Cargar datos anuales</Text>}
                    </TouchableOpacity>

                    {error && <Text style={s.errorText}>{error}</Text>}

                    {monthlyData.length > 0 && (
                        <>
                            <View style={s.legendRow}>
                                <View style={s.legendItem}>
                                    <View style={[s.legendDot, { backgroundColor: colors.primary }]} />
                                    <Text style={s.legendText}>Ingresos</Text>
                                </View>
                                <View style={s.legendItem}>
                                    <View style={[s.legendDot, { backgroundColor: colors.error }]} />
                                    <Text style={s.legendText}>Gastos</Text>
                                </View>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={s.chartArea}>
                                    {monthlyData.map((m) => {
                                        const incH = (m.totalIncome / maxBar) * 120;
                                        const expH = (m.totalExpense / maxBar) * 120;
                                        return (
                                            <View key={m.month} style={s.chartCol}>
                                                <View style={s.barsBase}>
                                                    <View style={[s.bar, { height: incH || 2, backgroundColor: colors.primary, marginRight: 2 }]} />
                                                    <View style={[s.bar, { height: expH || 2, backgroundColor: colors.error }]} />
                                                </View>
                                                <Text style={s.monthLabel}>{m.monthName.slice(0, 3)}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                            {/* Tabla resumen */}
                            <View style={s.tableHeader}>
                                <Text style={[s.tableCell, { flex: 2 }]}>Mes</Text>
                                <Text style={[s.tableCell, { textAlign: 'right' }]}>Ingresos</Text>
                                <Text style={[s.tableCell, { textAlign: 'right' }]}>Gastos</Text>
                            </View>
                            {monthlyData.filter(m => m.totalIncome > 0 || m.totalExpense > 0).map(m => (
                                <View key={m.month} style={s.tableRow}>
                                    <Text style={[s.tableCell, { flex: 2 }]}>{m.monthName}</Text>
                                    <Text style={[s.tableCell, { color: colors.primary, textAlign: 'right' }]}>
                                        {fmtCRC(m.totalIncome)}
                                    </Text>
                                    <Text style={[s.tableCell, { color: colors.error, textAlign: 'right' }]}>
                                        {fmtCRC(m.totalExpense)}
                                    </Text>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.secondary, paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    tabRow: { flexDirection: 'row', margin: 16, backgroundColor: colors.white, borderRadius: 12, padding: 4, elevation: 2 },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabBtnActive: { backgroundColor: colors.primary },
    tabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    tabTextActive: { color: '#fff' },
    card: { backgroundColor: colors.white, borderRadius: 16, margin: 16, marginTop: 0, padding: 16, elevation: 2 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12, marginTop: 8 },
    dateRow: { flexDirection: 'row', marginBottom: 12 },
    dateLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
    dateBtn: { backgroundColor: colors.background, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border },
    dateBtnText: { fontSize: 13, color: colors.text },
    pickerWrap: { backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 12, padding: 8, borderWidth: 1, borderColor: colors.border },
    pickerDone: { alignItems: 'center', paddingVertical: 8 },
    pickerDoneText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
    btn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    errorText: { color: colors.error, textAlign: 'center', marginTop: 8 },
    totalsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
    totalCard: { flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 10, borderLeftWidth: 3 },
    totalLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
    totalValue: { fontSize: 13, fontWeight: '700' },
    savingsRate: { textAlign: 'center', marginTop: 10, fontSize: 13, color: colors.textSecondary },
    catRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    catEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
    catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    catName: { fontSize: 13, fontWeight: '600', color: colors.text },
    catPct: { fontSize: 13, fontWeight: '700', color: colors.primary },
    barBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
    barFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
    catAmount: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    legendRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: colors.textSecondary },
    chartArea: { flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 8, gap: 4 },
    chartCol: { alignItems: 'center', width: 36 },
    barsBase: { flexDirection: 'row', alignItems: 'flex-end', height: 120 },
    bar: { width: 10, borderRadius: 4 },
    monthLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 4 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 6, marginTop: 16, marginBottom: 4 },
    tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: `${colors.border}50` },
    tableCell: { flex: 1, fontSize: 12, color: colors.text },
});
