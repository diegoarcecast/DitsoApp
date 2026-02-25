import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../theme';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { SuggestedDistributionItem } from '../types';

type Period = 'Semanal' | 'Quincenal' | 'Mensual' | 'Personalizado';
type Mode = 'quick' | 'detailed';

const PERIODS: { label: string; value: Period }[] = [
    { label: 'Semanal', value: 'Semanal' },
    { label: 'Quincenal', value: 'Quincenal' },
    { label: 'Mensual', value: 'Mensual' },
    { label: 'Personalizado', value: 'Personalizado' },
];

interface Props {
    onBudgetCreated: () => void;
}

export default function BudgetOnboardingScreen({ onBudgetCreated }: Props) {
    const [mode, setMode] = useState<Mode>('quick');
    const [period, setPeriod] = useState<Period>('Quincenal');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [totalAmount, setTotalAmount] = useState('');
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingSugg, setLoadingSugg] = useState(false);

    const [suggested, setSuggested] = useState<SuggestedDistributionItem[]>([]);
    const [editedAmounts, setEditedAmounts] = useState<Record<number, string>>({});
    const [detailedItems, setDetailedItems] = useState<
        { categoryId: number; categoryName: string; categoryIcon: string; amount: string }[]
    >([]);

    // ── Add-category modal ───────────────────────────────────────────────────
    const [showCatModal, setShowCatModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatEmoji, setNewCatEmoji] = useState('📦');
    const [newCatAmount, setNewCatAmount] = useState('');
    const [savingCat, setSavingCat] = useState(false);

    const openCatModal = () => {
        setNewCatName('');
        setNewCatEmoji('📦');
        setNewCatAmount('');
        setShowCatModal(true);
    };

    const handleAddCategory = async () => {
        if (!newCatName.trim()) {
            Alert.alert('Nombre requerido', 'Ingresa un nombre para la categoría.');
            return;
        }
        setSavingCat(true);
        try {
            const created = await categoryService.create({
                name: newCatName.trim(),
                type: 'Expense',
                icon: newCatEmoji,
            });
            setDetailedItems(prev => [...prev, {
                categoryId: created.id,
                categoryName: created.name,
                categoryIcon: created.icon ?? newCatEmoji,
                amount: newCatAmount,
            }]);
            setShowCatModal(false);
        } catch {
            Alert.alert('Error', 'No se pudo crear la categoría.');
        } finally {
            setSavingCat(false);
        }
    };

    const removeDetailedItem = (idx: number) =>
        setDetailedItems(prev => prev.filter((_, i) => i !== idx));

    const formatDateLabel = (d: Date) =>
        d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });

    const calcEndDate = (start: Date, p: Period): Date => {
        const d = new Date(start);
        if (p === 'Semanal') { d.setDate(d.getDate() + 6); return d; }
        if (p === 'Quincenal') { d.setDate(d.getDate() + 14); return d; }
        if (p === 'Mensual') { d.setMonth(d.getMonth() + 1); d.setDate(d.getDate() - 1); return d; }
        return endDate;
    };

    useEffect(() => {
        if (period !== 'Personalizado') setEndDate(calcEndDate(startDate, period));
    }, [startDate, period]);

    const loadSuggested = async () => {
        const amt = parseFloat(totalAmount);
        if (!amt || amt <= 0) { Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero.'); return; }
        setLoadingSugg(true);
        try {
            const data = await budgetService.getSuggestedDistribution(amt);
            setSuggested(data);
            const init: Record<number, string> = {};
            data.forEach((i, idx) => { init[idx] = String(i.suggestedAmount); });
            setEditedAmounts(init);
            setDetailedItems(data.map(i => ({
                categoryId: i.categoryId,
                categoryName: i.categoryName,
                categoryIcon: i.categoryIcon,
                amount: String(i.suggestedAmount),
            })));
        } catch {
            Alert.alert('Error', 'No se pudo calcular la distribución.');
        } finally {
            setLoadingSugg(false);
        }
    };

    const totalAssigned = detailedItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const total = parseFloat(totalAmount) || 0;
    const remaining = total - totalAssigned;
    const remainingPct = total > 0 ? remaining / total : 1;
    const remainingColor = remaining < 0 ? colors.error : remainingPct < 0.10 ? colors.warning : colors.success;

    const buildItems = () => {
        if (mode === 'quick') {
            return suggested.map((s, idx) => ({
                categoryId: s.categoryId,
                limitAmount: parseFloat(editedAmounts[idx] || '0') || 0,
                isIncome: false,
            })).filter(i => i.categoryId > 0 && i.limitAmount > 0);
        }
        return detailedItems
            .map(i => ({ categoryId: i.categoryId, limitAmount: parseFloat(i.amount) || 0, isIncome: false }))
            .filter(i => i.categoryId > 0 && i.limitAmount > 0);
    };

    const handleCreate = async () => {
        const amt = parseFloat(totalAmount);
        if (!amt || amt <= 0) { Alert.alert('Monto inválido', 'Ingresa un monto total.'); return; }
        const items = buildItems();
        if (items.length === 0) { Alert.alert('Sin categorías', 'Agrega al menos una categoría con monto.'); return; }

        setLoading(true);
        try {
            await budgetService.create({
                period,
                startDate: startDate.toISOString().split('T')[0],
                customEndDate: period === 'Personalizado' ? endDate.toISOString().split('T')[0] : undefined,
                totalAmount: amt,
                items,
            });
            onBudgetCreated();
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo crear el presupuesto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerEmoji}>🎯</Text>
                <Text style={s.headerTitle}>Crea tu presupuesto</Text>
                <Text style={s.headerSub}>
                    Para comenzar, necesitas crear tu primer presupuesto. Esto permitirá calcular tu
                    balance, darte recomendaciones y ayudarte a controlar tus finanzas.
                </Text>
            </View>

            {/* Mode tabs */}
            <View style={s.modeTabs}>
                <TouchableOpacity
                    style={[s.modeTab, mode === 'quick' && s.modeTabActive]}
                    onPress={() => setMode('quick')}
                >
                    <Text style={[s.modeTabText, mode === 'quick' && s.modeTabTextActive]}>⚡ Rápido</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.modeTab, mode === 'detailed' && s.modeTabActive]}
                    onPress={() => setMode('detailed')}
                >
                    <Text style={[s.modeTabText, mode === 'detailed' && s.modeTabTextActive]}>📋 Detallado</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                keyboardShouldPersistTaps="handled"
            >

                {/* Period selector */}
                <Text style={s.label}>Tipo de ciclo</Text>
                <View style={s.pillRow}>
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p.value}
                            style={[s.pill, period === p.value && s.pillActive]}
                            onPress={() => setPeriod(p.value)}
                        >
                            <Text style={[s.pillText, period === p.value && s.pillTextActive]}>{p.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Start date */}
                <Text style={s.label}>Fecha de inicio</Text>
                <TouchableOpacity style={s.dateBtn} onPress={() => setShowStart(v => !v)}>
                    <Text style={s.dateBtnText}>📅 {formatDateLabel(startDate)}</Text>
                </TouchableOpacity>
                {showStart && (
                    <View style={s.datePickerContainer}>
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            themeVariant="light"
                            onChange={(event: DateTimePickerEvent, d?: Date) => {
                                if (Platform.OS === 'android') {
                                    setShowStart(false);
                                    if (event.type === 'set' && d) setStartDate(d);
                                } else {
                                    if (d) setStartDate(d);
                                }
                            }}
                            style={Platform.OS === 'ios' ? { height: 120 } : undefined}
                        />
                        {Platform.OS === 'ios' && (
                            <TouchableOpacity style={s.dateDoneBtn} onPress={() => setShowStart(false)}>
                                <Text style={s.dateDoneText}>Listo ✓</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* End date — only for Personalizado */}
                {period === 'Personalizado' ? (
                    <>
                        <Text style={s.label}>Fecha de fin</Text>
                        <TouchableOpacity style={s.dateBtn} onPress={() => setShowEnd(v => !v)}>
                            <Text style={s.dateBtnText}>📅 {formatDateLabel(endDate)}</Text>
                        </TouchableOpacity>
                        {showEnd && (
                            <View style={s.datePickerContainer}>
                                <DateTimePicker
                                    value={endDate}
                                    mode="date"
                                    minimumDate={startDate}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    themeVariant="light"
                                    onChange={(event: DateTimePickerEvent, d?: Date) => {
                                        if (Platform.OS === 'android') {
                                            setShowEnd(false);
                                            if (event.type === 'set' && d) setEndDate(d);
                                        } else {
                                            if (d) setEndDate(d);
                                        }
                                    }}
                                    style={Platform.OS === 'ios' ? { height: 120 } : undefined}
                                />
                                {Platform.OS === 'ios' && (
                                    <TouchableOpacity style={s.dateDoneBtn} onPress={() => setShowEnd(false)}>
                                        <Text style={s.dateDoneText}>Listo ✓</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </>
                ) : (
                    <Text style={s.endDateHint}>📌 Fin calculado: {formatDateLabel(endDate)}</Text>
                )}

                {/* Total amount */}
                <Text style={s.label}>Monto total disponible</Text>
                <TextInput
                    style={s.input}
                    keyboardType="numeric"
                    placeholder="₡ 0"
                    placeholderTextColor={colors.textSecondary}
                    value={totalAmount}
                    onChangeText={setTotalAmount}
                />

                {/* ── QUICK MODE ── */}
                {mode === 'quick' && (
                    <>
                        <TouchableOpacity
                            style={[s.calcBtn, loadingSugg && { opacity: 0.6 }]}
                            onPress={loadSuggested}
                            disabled={loadingSugg}
                        >
                            {loadingSugg
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={s.calcBtnText}>✨ Calcular distribución sugerida</Text>
                            }
                        </TouchableOpacity>

                        {suggested.length > 0 && (
                            <>
                                <Text style={s.sectionTitle}>Distribución sugerida (editable)</Text>
                                {suggested.map((item, idx) => (
                                    <View key={idx} style={s.categoryRow}>
                                        <View style={s.categoryLeft}>
                                            <Text style={s.categoryName}>{item.categoryName}</Text>
                                            <Text style={s.categoryPct}>{item.percentage}%</Text>
                                        </View>
                                        <TextInput
                                            style={s.categoryInput}
                                            keyboardType="numeric"
                                            value={editedAmounts[idx]}
                                            onChangeText={v => setEditedAmounts(prev => ({ ...prev, [idx]: v }))}
                                        />
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}

                {/* ── DETAILED MODE ── */}
                {mode === 'detailed' && (
                    <>
                        {/* Load from server (first time) */}
                        <TouchableOpacity
                            style={[s.calcBtn, loadingSugg && { opacity: 0.6 }]}
                            onPress={loadSuggested}
                            disabled={loadingSugg}
                        >
                            {loadingSugg
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={s.calcBtnText}>📂 {detailedItems.length === 0 ? 'Cargar categorías sugeridas' : 'Recargar sugeridas'}</Text>
                            }
                        </TouchableOpacity>

                        {/* Category rows */}
                        {detailedItems.length > 0 && (
                            <>
                                <Text style={s.sectionTitle}>Asignación por categoría</Text>
                                {detailedItems.map((item, idx) => {
                                    const pct = total > 0
                                        ? ((parseFloat(item.amount) || 0) / total * 100).toFixed(1)
                                        : '0.0';
                                    return (
                                        <View key={idx} style={s.categoryRow}>
                                            <Text style={s.categoryEmoji}>{item.categoryIcon}</Text>
                                            <View style={s.categoryLeft}>
                                                <Text style={s.categoryName}>{item.categoryName}</Text>
                                                <Text style={s.categoryPct}>{pct}%</Text>
                                            </View>
                                            <TextInput
                                                style={s.categoryInput}
                                                keyboardType="numeric"
                                                placeholder="₡ 0"
                                                placeholderTextColor={colors.textSecondary}
                                                value={item.amount}
                                                onChangeText={v => setDetailedItems(prev =>
                                                    prev.map((d, i) => i === idx ? { ...d, amount: v } : d)
                                                )}
                                            />
                                            <TouchableOpacity
                                                style={s.removeBtn}
                                                onPress={() => removeDetailedItem(idx)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <Text style={s.removeBtnText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </>
                        )}

                        {/* Add category button */}
                        <TouchableOpacity style={s.addCatBtn} onPress={openCatModal}>
                            <Text style={s.addCatText}>+ Agregar categoría</Text>
                        </TouchableOpacity>

                        {/* Running total indicator */}
                        {detailedItems.length > 0 && (
                            <>
                                <View style={[s.totalIndicator, { borderColor: remainingColor }]}>
                                    <Text style={s.totalIndicatorLabel}>Total asignado</Text>
                                    <Text style={[s.totalIndicatorValue, { color: colors.text }]}>
                                        ₡{totalAssigned.toLocaleString('es-CR')}
                                    </Text>
                                    <Text style={s.totalIndicatorLabel}>Restante</Text>
                                    <Text style={[s.totalIndicatorValue, { color: remainingColor, fontSize: 20 }]}>
                                        ₡{remaining.toLocaleString('es-CR')}
                                    </Text>
                                </View>

                                {remaining < 0 && (
                                    <View style={s.warningBanner}>
                                        <Text style={s.warningText}>
                                            ⚠️ La suma de tus categorías excede tu presupuesto disponible.
                                            Puedes ajustar las categorías o continuar.
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Create button */}
                <TouchableOpacity
                    style={[s.createBtn, loading && { opacity: 0.7 }]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={s.createBtnText}>Crear presupuesto 🚀</Text>
                    }
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* ── Add-category Modal ── */}
            <Modal visible={showCatModal} transparent animationType="slide" onRequestClose={() => setShowCatModal(false)}>
                <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowCatModal(false)} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={s.modalSheet}
                >
                    <View style={s.modalHandle} />
                    <Text style={s.modalTitle}>Nueva categoría de gasto</Text>

                    <Text style={s.modalLabel}>Emoji</Text>
                    <TextInput
                        style={s.modalEmojiInput}
                        value={newCatEmoji}
                        onChangeText={setNewCatEmoji}
                        maxLength={2}
                        placeholder="📦"
                    />

                    <Text style={s.modalLabel}>Nombre</Text>
                    <TextInput
                        style={s.modalInput}
                        value={newCatName}
                        onChangeText={setNewCatName}
                        placeholder="Ej: Transporte, Comida..."
                        placeholderTextColor={colors.textSecondary}
                        autoFocus
                    />

                    <Text style={s.modalLabel}>Monto asignado (opcional)</Text>
                    <TextInput
                        style={s.modalInput}
                        value={newCatAmount}
                        onChangeText={setNewCatAmount}
                        keyboardType="numeric"
                        placeholder="₡ 0"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <View style={s.modalBtns}>
                        <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowCatModal(false)}>
                            <Text style={s.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.modalSaveBtn, savingCat && { opacity: 0.6 }]}
                            onPress={handleAddCategory}
                            disabled={savingCat}
                        >
                            {savingCat
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={s.modalSaveText}>Agregar</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, padding: 24, paddingTop: 56, alignItems: 'center' },
    headerEmoji: { fontSize: 40, marginBottom: 8 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
    headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },

    modeTabs: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
    modeTab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    modeTabActive: { borderBottomWidth: 3, borderColor: colors.primary },
    modeTabText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
    modeTabTextActive: { color: colors.primary },

    scroll: { flex: 1 },
    scrollContent: { padding: 20 },

    label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
    pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    pillText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    pillTextActive: { color: '#fff' },

    dateBtn: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border },
    dateBtnText: { fontSize: 15, color: colors.text },
    endDateHint: { fontSize: 13, color: colors.textSecondary, marginTop: 6, fontStyle: 'italic' },

    input: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border, marginTop: 2 },

    calcBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
    calcBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 10 },
    categoryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: colors.border },
    categoryLeft: { flex: 1 },
    categoryName: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
    categoryPct: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    categoryInput: { width: 110, backgroundColor: colors.background, borderRadius: 8, padding: 8, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, textAlign: 'right' },

    totalIndicator: { borderWidth: 2, borderRadius: 16, padding: 16, marginTop: 16, alignItems: 'center', gap: 4 },
    totalIndicatorLabel: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    totalIndicatorValue: { fontSize: 18, fontWeight: '700' },

    warningBanner: { backgroundColor: '#FFF3CD', borderRadius: 12, padding: 14, marginTop: 12, borderLeftWidth: 4, borderLeftColor: colors.warning },
    warningText: { fontSize: 13, color: '#856404', lineHeight: 20 },

    datePickerContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 4,
        marginBottom: 4,
        overflow: 'hidden',
    },
    dateDoneBtn: {
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: '#f9f9f9',
    },
    dateDoneText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '700',
    },

    // Category row extras
    categoryEmoji: { fontSize: 20, marginRight: 2 },
    removeBtn: { padding: 4 },
    removeBtnText: { fontSize: 16, color: colors.error, fontWeight: '700' },

    // Add category button
    addCatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
    },
    addCatText: { fontSize: 14, color: colors.primary, fontWeight: '700' },

    // Add-category modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    modalSheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingTop: 12,
        gap: 4,
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 8 },
    modalLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 12, marginBottom: 4, textTransform: 'uppercase' },
    modalEmojiInput: {
        fontSize: 28,
        textAlign: 'center',
        borderWidth: 1, borderColor: colors.border, borderRadius: 12,
        padding: 10, backgroundColor: colors.background, width: 64,
    },
    modalInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: 12,
        padding: 12, fontSize: 15, color: colors.text, backgroundColor: colors.background,
    },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 8 },
    modalCancelBtn: {
        flex: 1, padding: 14, borderRadius: 12,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    modalCancelText: { fontSize: 15, color: colors.textSecondary, fontWeight: '600' },
    modalSaveBtn: {
        flex: 2, padding: 14, borderRadius: 12,
        backgroundColor: colors.primary, alignItems: 'center',
    },
    modalSaveText: { fontSize: 15, color: '#fff', fontWeight: '700' },

    createBtn: { backgroundColor: colors.success, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 24 },
    createBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
