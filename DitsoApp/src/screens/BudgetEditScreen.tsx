/**
 * BudgetEditScreen — Edición del presupuesto activo con sincronización en tiempo real.
 *
 * Reglas de sincronización:
 *   Al cambiar TotalAmount → recalcula LimitAmount de todos los ítems (proporcional a su %)
 *   Al cambiar item.limitAmount → recalcula item.percentage
 *   Al cambiar item.percentage → recalcula item.limitAmount
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, Modal,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { Budget, BudgetItem, Category } from '../types';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';
import { iconToEmoji } from '../utils/iconUtils';

// ─── Local edit state per item ────────────────────────────────────────────────
interface EditableItem {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    limitAmountStr: string;   // string while editing
    percentageStr: string;    // string while editing
    isIncome: boolean;
    isSystemCategory: boolean;
}

function toEditable(item: BudgetItem): EditableItem {
    return {
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryIcon: item.categoryIcon,
        limitAmountStr: String(Math.round(item.limitAmount)),
        percentageStr: String(item.percentage.toFixed(1)),
        isIncome: item.isIncome,
        isSystemCategory: item.isSystemCategory,
    };
}

// ─── Summary helpers ──────────────────────────────────────────────────────────
const formatCRC = (n: number) => '₡' + Math.round(n).toLocaleString('es-CR');

function computeSummary(items: EditableItem[], totalStr: string) {
    const total = parseFloat(totalStr) || 0;
    const assigned = items
        .filter(i => !i.isSystemCategory)
        .reduce((s, i) => s + (parseFloat(i.limitAmountStr) || 0), 0);
    const pctSum = items
        .filter(i => !i.isSystemCategory)
        .reduce((s, i) => s + (parseFloat(i.percentageStr) || 0), 0);
    return { total, assigned, unassigned: total - assigned, pctSum };
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function BudgetEditScreen({ route, navigation }: any) {
    const budgetId: number = route?.params?.budgetId;

    const [budget, setBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Header edit
    const [nameStr, setNameStr] = useState('');
    const [totalStr, setTotalStr] = useState('');

    // Items edit
    const [items, setItems] = useState<EditableItem[]>([]);

    // Add-category modal — create new category
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatEmoji, setNewCatEmoji] = useState('📦');
    const [newCatType, setNewCatType] = useState<'Income' | 'Expense'>('Expense');
    const [newItemAmount, setNewItemAmount] = useState('0');
    const [addingSaving, setAddingSaving] = useState(false);

    // Reassign modal
    const [reassignModalVisible, setReassignModalVisible] = useState(false);
    const [pendingRemoveItemId, setPendingRemoveItemId] = useState<number | null>(null);
    const [reassignTargetId, setReassignTargetId] = useState<number | null>(null);

    const loadBudget = useCallback(async () => {
        try {
            const b = budgetId
                ? await budgetService.getById(budgetId)
                : await budgetService.getActive();
            if (!b) { Alert.alert('Sin presupuesto', 'No hay presupuesto activo.'); navigation.goBack(); return; }
            setBudget(b);
            setNameStr(b.name ?? '');
            setTotalStr(String(Math.round(b.totalAmount)));
            setItems(b.items.map(toEditable));
        } catch {
            Alert.alert('Error', 'No se pudo cargar el presupuesto.');
        } finally {
            setLoading(false);
        }
    }, [budgetId]);

    useEffect(() => { loadBudget(); }, [loadBudget]);

    // ── Sync: when TotalAmount changes, recalculate all item amounts ──────────
    const handleTotalChange = (val: string) => {
        setTotalStr(val);
        const newTotal = parseFloat(val) || 0;
        if (newTotal <= 0) return;

        setItems(prev => prev.map(item => {
            if (item.isSystemCategory) return item;
            const pct = parseFloat(item.percentageStr) || 0;
            const newLimit = Math.round(newTotal * pct / 100);
            return { ...item, limitAmountStr: String(newLimit) };
        }));
    };

    // ── Sync: when item LimitAmount changes, recalculate its percentage ───────
    const handleAmountChange = (index: number, val: string) => {
        const total = parseFloat(totalStr) || 0;
        setItems(prev => prev.map((item, i) => {
            if (i !== index) return item;
            const amt = parseFloat(val) || 0;
            const pct = total > 0 ? (amt / total * 100) : 0;
            return { ...item, limitAmountStr: val, percentageStr: pct.toFixed(1) };
        }));
    };

    // ── Sync: when item Percentage changes, recalculate its amount ────────────
    const handlePercentageChange = (index: number, val: string) => {
        const total = parseFloat(totalStr) || 0;
        setItems(prev => prev.map((item, i) => {
            if (i !== index) return item;
            const pct = parseFloat(val) || 0;
            const amt = Math.round(total * pct / 100);
            return { ...item, percentageStr: val, limitAmountStr: String(amt) };
        }));
    };

    // ── Save all changes ──────────────────────────────────────────────────────
    const handleSave = async () => {
        const total = parseFloat(totalStr) || 0;
        if (total <= 0) { Alert.alert('Error', 'El monto total debe ser mayor a 0.'); return; }
        if (!budget) return;

        setSaving(true);
        try {
            // Build items payload — only non-system items
            const itemsPayload = items
                .filter(i => !i.isSystemCategory)
                .map(i => ({ itemId: i.id, limitAmount: parseFloat(i.limitAmountStr) || 0 }));

            const updated = await budgetService.updateBudget(budget.id, {
                name: nameStr.trim() || undefined,
                totalAmount: total !== budget.totalAmount ? total : undefined,
                items: itemsPayload,
            });

            setBudget(updated);
            setItems(updated.items.map(toEditable));
            Alert.alert('✅ Guardado', 'Presupuesto actualizado correctamente.');
            navigation.goBack();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? 'No se pudo guardar el presupuesto.';
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    };

    // ── Remove item ───────────────────────────────────────────────────────────
    const handleRemovePress = (itemId: number) => {
        setPendingRemoveItemId(itemId);
        setReassignTargetId(null);
        setReassignModalVisible(true);
    };

    const handleReassignAndRemove = async (reassignId?: number) => {
        if (!budget || pendingRemoveItemId == null) return;
        setReassignModalVisible(false);
        setSaving(true);
        try {
            const updated = await budgetService.removeItem(
                budget.id,
                pendingRemoveItemId,
                { reassignToCategoryId: reassignId }
            );
            setBudget(updated);
            setItems(updated.items.map(toEditable));
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? 'No se pudo eliminar la categoría.';
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
            setPendingRemoveItemId(null);
        }
    };

    // ── Add item — creates new category then adds to budget ──────────────────
    const openAddModal = () => {
        setNewCatName('');
        setNewCatEmoji('📦');
        setNewCatType('Expense');
        setNewItemAmount('0');
        setAddModalVisible(true);
    };

    const handleAddItem = async () => {
        if (!budget) return;
        const trimmed = newCatName.trim();
        if (!trimmed) { Alert.alert('Error', 'Ingresa un nombre para la categoría.'); return; }
        const amt = newCatType === 'Income' ? 0 : (parseFloat(newItemAmount) || 0);

        setAddingSaving(true);
        try {
            // 1) Create the category in the catalog
            const newCat = await categoryService.create({
                name: trimmed,
                type: newCatType,
                icon: newCatEmoji,
            });
            // 2) Add it to the budget
            const updated = await budgetService.addItem(budget.id, {
                categoryId: newCat.id,
                limitAmount: amt,
                isIncome: newCatType === 'Income',
            });
            setBudget(updated);
            setItems(updated.items.map(toEditable));
            setAddModalVisible(false);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? 'No se pudo agregar la categoría.';
            Alert.alert('Error', msg);
        } finally {
            setAddingSaving(false);
        }
    };

    // ─── Summary ──────────────────────────────────────────────────────────────
    const { total, assigned, unassigned, pctSum } = computeSummary(items, totalStr);
    const isOverBudget = assigned > total + 0.5;
    const isOverPct = pctSum > 100.5;

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const expenseItems = items.filter(i => !i.isIncome && !i.isSystemCategory);
    const incomeItems = items.filter(i => i.isIncome && !i.isSystemCategory);

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
                        <Text style={s.backBtn}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>✏️ Editar Presupuesto</Text>
                    <TouchableOpacity
                        style={[s.saveBtn, saving && { opacity: 0.5 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? <ActivityIndicator color={colors.white} size="small" />
                            : <Text style={s.saveBtnText}>Guardar</Text>
                        }
                    </TouchableOpacity>
                </View>

                <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
                    {/* ── §1 Resumen en tiempo real ── */}
                    <View style={[s.summaryCard, isOverBudget ? s.summaryDanger : isOverPct ? s.summaryWarn : null]}>
                        <View style={s.summaryRow}>
                            <Text style={s.summaryLabel}>Total asignado</Text>
                            <Text style={[s.summaryValue, isOverBudget ? { color: colors.expense } : null]}>
                                {formatCRC(assigned)}
                            </Text>
                        </View>
                        <View style={s.summaryRow}>
                            <Text style={s.summaryLabel}>Sin asignar</Text>
                            <Text style={[s.summaryValue, { color: unassigned >= 0 ? colors.income : colors.expense }]}>
                                {formatCRC(unassigned)}
                            </Text>
                        </View>
                        <View style={s.summaryRow}>
                            <Text style={s.summaryLabel}>% Total</Text>
                            <Text style={[s.summaryValue, pctSum > 100 ? { color: colors.expense } : null]}>
                                {pctSum.toFixed(1)}%
                            </Text>
                        </View>
                        {isOverBudget && (
                            <Text style={s.warnText}>⚠️ El total asignado excede el presupuesto.</Text>
                        )}
                        {!isOverBudget && isOverPct && (
                            <Text style={s.warnText}>⚠️ La suma de porcentajes supera el 100%.</Text>
                        )}
                    </View>

                    {/* ── §2 Datos del presupuesto ── */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>📋 Datos del presupuesto</Text>

                        <Text style={s.fieldLabel}>Nombre (opcional)</Text>
                        <TextInput
                            style={s.input}
                            value={nameStr}
                            onChangeText={setNameStr}
                            placeholder="Ej: Quincena febrero"
                            placeholderTextColor={colors.gray400}
                        />

                        <Text style={s.fieldLabel}>Monto total (₡)</Text>
                        <TextInput
                            style={[s.input, s.inputLarge]}
                            value={totalStr}
                            onChangeText={handleTotalChange}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.gray400}
                        />
                        <Text style={s.fieldHint}>
                            Al cambiar el monto total, los montos de categorías se recalculan automáticamente.
                        </Text>
                    </View>

                    {/* ── §3 Categorías de gasto ── */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>💸 Categorías de gasto</Text>
                        {expenseItems.length === 0 && (
                            <Text style={s.emptyText}>Sin categorías de gasto.</Text>
                        )}
                        {expenseItems.map((item, idx) => {
                            const globalIdx = items.findIndex(i => i.id === item.id);
                            return (
                                <ItemRow
                                    key={item.id}
                                    item={item}
                                    onAmountChange={v => handleAmountChange(globalIdx, v)}
                                    onPercentageChange={v => handlePercentageChange(globalIdx, v)}
                                    onRemove={() => handleRemovePress(item.id)}
                                />
                            );
                        })}
                    </View>

                    {/* ── §4 Categorías de ingreso planificado ── */}
                    {incomeItems.length > 0 && (
                        <View style={s.card}>
                            <Text style={s.cardTitle}>💰 Ingresos planificados</Text>
                            {incomeItems.map((item) => {
                                const globalIdx = items.findIndex(i => i.id === item.id);
                                return (
                                    <ItemRow
                                        key={item.id}
                                        item={item}
                                        onAmountChange={v => handleAmountChange(globalIdx, v)}
                                        onPercentageChange={v => handlePercentageChange(globalIdx, v)}
                                        onRemove={() => handleRemovePress(item.id)}
                                    />
                                );
                            })}
                        </View>
                    )}

                    {/* ── §5 Botón agregar categoría ── */}
                    <TouchableOpacity style={s.addBtn} onPress={openAddModal}>
                        <Text style={s.addBtnText}>+ Agregar categoría</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Modal: Nueva categoría ── */}
            <Modal visible={addModalVisible} animationType="slide" transparent onRequestClose={() => setAddModalVisible(false)}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={s.modalOverlay}>
                        <View style={s.modalSheet}>
                            <Text style={s.modalTitle}>Nueva categoría</Text>

                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Tipo: Gasto / Ingreso */}
                                <View style={s.typeRow}>
                                    <TouchableOpacity
                                        style={[s.typeBtn, newCatType === 'Expense' && s.typeBtnActive]}
                                        onPress={() => { setNewCatType('Expense'); setNewItemAmount('0'); }}
                                    >
                                        <Text style={[s.typeBtnText, newCatType === 'Expense' && s.typeBtnTextActive]}>💸 Gasto</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[s.typeBtn, newCatType === 'Income' && s.typeBtnIncomeActive]}
                                        onPress={() => setNewCatType('Income')}
                                    >
                                        <Text style={[s.typeBtnText, newCatType === 'Income' && s.typeBtnTextActive]}>💰 Ingreso</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Emoji + Nombre */}
                                <View style={s.emojiNameRow}>
                                    <TextInput
                                        style={s.emojiInput}
                                        value={newCatEmoji}
                                        onChangeText={setNewCatEmoji}
                                        placeholder="📦"
                                        maxLength={2}
                                    />
                                    <TextInput
                                        style={[s.input, { flex: 1 }]}
                                        value={newCatName}
                                        onChangeText={setNewCatName}
                                        placeholder="Nombre de la categoría"
                                        placeholderTextColor={colors.gray400}
                                        autoFocus
                                    />
                                </View>

                                {/* Monto solo para gastos */}
                                {newCatType === 'Expense' && (
                                    <>
                                        <Text style={[s.fieldLabel, { marginTop: spacing.md }]}>Monto asignado (₡)</Text>
                                        <TextInput
                                            style={s.input}
                                            value={newItemAmount}
                                            onChangeText={setNewItemAmount}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={colors.gray400}
                                        />
                                        <Text style={s.fieldHint}>Puedes dejarlo en 0 y asignar el % más adelante.</Text>
                                    </>
                                )}
                                {newCatType === 'Income' && (
                                    <Text style={s.incomeHint}>
                                        💡 Las categorías de ingreso no tienen monto asignado — se registran al agregar transacciones.
                                    </Text>
                                )}

                                <View style={s.modalBtns}>
                                    <TouchableOpacity
                                        style={s.cancelBtn}
                                        onPress={() => setAddModalVisible(false)}
                                    >
                                        <Text style={s.cancelText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[s.primaryBtn, addingSaving && { opacity: 0.5 }]}
                                        onPress={handleAddItem}
                                        disabled={addingSaving}
                                    >
                                        {addingSaving
                                            ? <ActivityIndicator color={colors.white} size="small" />
                                            : <Text style={s.primaryBtnText}>Agregar</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>


            {/* ── Modal: Reasignación al eliminar ── */}
            <Modal visible={reassignModalVisible} animationType="fade" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalSheet}>
                        <Text style={s.modalTitle}>Eliminar categoría</Text>
                        <Text style={s.modalDesc}>
                            Esta categoría puede tener transacciones en el período actual.
                            Si es así, debes reasignarlas a otra categoría antes de eliminarla.
                        </Text>
                        <Text style={[s.fieldLabel, { marginTop: spacing.md }]}>Reasignar transacciones a:</Text>
                        <ScrollView style={{ maxHeight: 160, marginBottom: spacing.md }}>
                            {items
                                .filter(i => i.id !== pendingRemoveItemId && !i.isSystemCategory)
                                .map(i => (
                                    <TouchableOpacity
                                        key={i.id}
                                        style={[s.catOption, reassignTargetId === i.categoryId && s.catOptionActive]}
                                        onPress={() => setReassignTargetId(i.categoryId)}
                                    >
                                        <Text style={s.catOptionIcon}>{iconToEmoji(i.categoryIcon)}</Text>
                                        <Text style={[s.catOptionName, reassignTargetId === i.categoryId && { color: colors.white }]}>
                                            {i.categoryName}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </ScrollView>
                        <View style={s.modalBtns}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => setReassignModalVisible(false)}>
                                <Text style={s.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.dangerBtn]}
                                onPress={() => handleReassignAndRemove(reassignTargetId ?? undefined)}
                            >
                                <Text style={s.primaryBtnText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Item Row Component ────────────────────────────────────────────────────────
function ItemRow({ item, onAmountChange, onPercentageChange, onRemove }: {
    item: EditableItem;
    onAmountChange: (v: string) => void;
    onPercentageChange: (v: string) => void;
    onRemove: () => void;
}) {
    return (
        <View style={s.itemRow}>
            <View style={s.itemHeader}>
                <Text style={s.itemIcon}>{iconToEmoji(item.categoryIcon)}</Text>
                <Text style={s.itemName}>{item.categoryName}</Text>
                <TouchableOpacity onPress={onRemove} hitSlop={8} style={s.removeBtn}>
                    <Text style={s.removeBtnText}>✕</Text>
                </TouchableOpacity>
            </View>
            <View style={s.itemFields}>
                <View style={s.fieldGroup}>
                    <Text style={s.fieldLabel}>Monto (₡)</Text>
                    <TextInput
                        style={s.itemInput}
                        value={item.limitAmountStr}
                        onChangeText={onAmountChange}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.gray400}
                    />
                </View>
                <View style={s.fieldGroup}>
                    <Text style={s.fieldLabel}>%</Text>
                    <TextInput
                        style={[s.itemInput, s.pctInput]}
                        value={item.percentageStr}
                        onChangeText={onPercentageChange}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.gray400}
                    />
                </View>
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    },
    backBtn: { color: colors.white, fontSize: 14, fontWeight: '600' },
    headerTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
    saveBtn: {
        backgroundColor: colors.white + '30', borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: 6,
    },
    saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },

    // Summary card
    summaryCard: {
        backgroundColor: colors.white, borderRadius: borderRadius.lg,
        padding: spacing.md, ...(shadows.small as object),
        borderLeftWidth: 4, borderLeftColor: colors.income,
    },
    summaryDanger: { borderLeftColor: colors.expense, backgroundColor: '#fff5f5' },
    summaryWarn: { borderLeftColor: colors.warning, backgroundColor: '#fffbeb' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    summaryLabel: { ...(typography.bodySmall as object), color: colors.textSecondary },
    summaryValue: { ...(typography.bodySmall as object), fontWeight: '700', color: colors.text },
    warnText: { fontSize: 12, color: colors.warning, marginTop: spacing.xs, fontWeight: '600' },

    // Cards
    card: {
        backgroundColor: colors.white, borderRadius: borderRadius.lg,
        padding: spacing.md, ...(shadows.small as object), gap: spacing.sm,
    },
    cardTitle: { ...(typography.bodySmall as object), fontWeight: '700', color: colors.text, marginBottom: spacing.xs },

    // Fields
    fieldLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
    fieldHint: { fontSize: 11, color: colors.gray400, fontStyle: 'italic' },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        ...(typography.body as object), color: colors.text,
    },
    inputLarge: { fontSize: 22, fontWeight: 'bold' },

    // Item row
    itemRow: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        padding: spacing.sm, gap: spacing.xs,
    },
    itemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    itemIcon: { fontSize: 18 },
    itemName: { flex: 1, ...(typography.bodySmall as object), fontWeight: '600', color: colors.text },
    removeBtn: { padding: 4 },
    removeBtnText: { color: colors.expense, fontWeight: '700', fontSize: 14 },
    itemFields: { flexDirection: 'row', gap: spacing.md },
    fieldGroup: { flex: 1 },
    itemInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.sm, paddingVertical: 6,
        ...(typography.bodySmall as object), color: colors.text,
    },
    pctInput: { maxWidth: 70 },

    // Add button
    addBtn: {
        backgroundColor: colors.primary + '15', borderRadius: borderRadius.lg,
        borderWidth: 1, borderColor: colors.primary + '40', borderStyle: 'dashed',
        paddingVertical: spacing.md, alignItems: 'center',
    },
    addBtnText: { ...(typography.bodySmall as object), color: colors.primary, fontWeight: '700' },

    emptyText: { ...(typography.bodySmall as object), color: colors.textSecondary, fontStyle: 'italic' },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg, paddingBottom: spacing.xxl,
    },
    modalTitle: { ...(typography.h3 as object), color: colors.text, marginBottom: spacing.md },
    modalDesc: { ...(typography.bodySmall as object), color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 20 },
    modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },

    catOption: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        padding: spacing.sm, marginBottom: spacing.xs,
    },
    catOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catOptionIcon: { fontSize: 18 },
    catOptionName: { flex: 1, ...(typography.bodySmall as object), color: colors.text, fontWeight: '600' },
    catOptionType: { ...(typography.caption as object), color: colors.textSecondary },

    cancelBtn: {
        flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    cancelText: { ...(typography.bodySmall as object), color: colors.textSecondary, fontWeight: '600' },
    primaryBtn: {
        flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.md,
        backgroundColor: colors.primary, alignItems: 'center',
    },
    dangerBtn: {
        flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.md,
        backgroundColor: colors.expense, alignItems: 'center',
    },
    primaryBtnText: { ...(typography.bodySmall as object), color: colors.white, fontWeight: '700' },

    // ── Nueva categoría — modal styles ────────────────────────────────────────
    typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    typeBtn: {
        flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    typeBtnActive: { backgroundColor: colors.expense, borderColor: colors.expense },
    typeBtnIncomeActive: { backgroundColor: colors.income, borderColor: colors.income },
    typeBtnText: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text },
    typeBtnTextActive: { color: colors.white },
    emojiNameRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
    emojiInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        width: 52, height: 48, textAlign: 'center', fontSize: 24,
    },
    incomeHint: {
        ...(typography.bodySmall as object), color: colors.income,
        backgroundColor: colors.income + '15', borderRadius: borderRadius.md,
        padding: spacing.sm, marginTop: spacing.sm, lineHeight: 20,
    },
});
