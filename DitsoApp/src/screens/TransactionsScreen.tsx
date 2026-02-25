import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Modal, ActivityIndicator, Alert, RefreshControl,
    ScrollView, TextInput, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import { Transaction, ActiveCategory } from '../types';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';
import { iconToEmoji } from '../utils/iconUtils';

type FilterType = 'All' | 'Income' | 'Expense';

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeCategories, setActiveCategories] = useState<ActiveCategory[]>([]);
    const [filter, setFilter] = useState<FilterType>('All');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [loadingCats, setLoadingCats] = useState<boolean>(false);
    const [budgetStart, setBudgetStart] = useState<Date | null>(null);
    const [budgetEnd, setBudgetEnd] = useState<Date | null>(null);

    // ── Edit / Delete ───────────────────────────────────────────────
    /** ID de la transacción que se está editando (null = modo creación) */
    const [editingId, setEditingId] = useState<number | null>(null);
    /** Bottom-sheet de acciones (editar / eliminar) */
    const [actionsVisible, setActionsVisible] = useState<boolean>(false);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    // Form state
    const [formAmount, setFormAmount] = useState<string>('');
    const [formType, setFormType] = useState<'Income' | 'Expense'>('Expense');
    const [formCategoryId, setFormCategoryId] = useState<number | null>(null);
    const [formDescription, setFormDescription] = useState<string>('');
    const [formIsExtraIncome, setFormIsExtraIncome] = useState<boolean>(false);
    const [formDate, setFormDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

    const loadTransactions = useCallback(async () => {
        try {
            const txs = await transactionService.getAll();
            setTransactions(txs);
        } catch {
            Alert.alert('Error', 'No se pudieron cargar las transacciones.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const loadActiveCategories = useCallback(async (type: 'Income' | 'Expense') => {
        setLoadingCats(true);
        try {
            const cats = await budgetService.getActiveCategories(type);
            setActiveCategories(cats);
        } catch {
            setActiveCategories([]);
        } finally {
            setLoadingCats(false);
        }
    }, []);

    useEffect(() => { loadTransactions(); }, [loadTransactions]);

    useEffect(() => {
        if (!modalVisible) return;
        loadActiveCategories(formType);
        budgetService.getActive().then(b => {
            if (b) {
                setBudgetStart(new Date(b.startDate));
                setBudgetEnd(new Date(b.endDate));
                if (!editingId) {
                    const today = new Date();
                    const end = new Date(b.endDate);
                    setFormDate(today <= end ? today : end);
                }
            }
        }).catch(() => { });
    }, [modalVisible, formType, loadActiveCategories, editingId]);

    const onRefresh = () => { setRefreshing(true); loadTransactions(); };

    const filtered = filter === 'All'
        ? transactions
        : transactions.filter(t => t.type === filter);

    const formatCRC = (amount: number) =>
        '₡' + amount.toLocaleString('es-CR', { minimumFractionDigits: 0 });

    const resetForm = () => {
        setFormAmount('');
        setFormType('Expense');
        setFormCategoryId(null);
        setFormDescription('');
        setFormIsExtraIncome(false);
        setFormDate(new Date());
        setShowDatePicker(false);
        setEditingId(null);
    };

    // ── Open actions bottom-sheet ────────────────────────────────────
    const openActions = (tx: Transaction) => {
        setSelectedTx(tx);
        setActionsVisible(true);
    };

    // ── Open edit form ───────────────────────────────────────────────
    const openEditForm = (tx: Transaction) => {
        setActionsVisible(false);
        setEditingId(tx.id);
        setFormAmount(String(tx.amount));
        setFormType(tx.type as 'Income' | 'Expense');
        setFormCategoryId(tx.categoryId ?? null);
        setFormDescription(tx.description ?? '');
        setFormIsExtraIncome(tx.isExtraIncome ?? false);
        setFormDate(new Date(tx.date));
        setModalVisible(true);
    };

    // ── Delete ───────────────────────────────────────────────────────
    const handleDelete = () => {
        if (!selectedTx) return;
        Alert.alert(
            '🗑️ Eliminar transacción',
            `¿Seguro que deseas eliminar esta transacción de ${formatCRC(selectedTx.amount)}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setActionsVisible(false);
                        setDeleting(true);
                        try {
                            await transactionService.delete(selectedTx.id);
                            loadTransactions();
                        } catch {
                            Alert.alert('Error', 'No se pudo eliminar la transacción.');
                        } finally {
                            setDeleting(false);
                            setSelectedTx(null);
                        }
                    },
                },
            ]
        );
    };

    // ── Submit (create OR update) ────────────────────────────────────
    const handleSubmit = async () => {
        const amount = parseFloat(formAmount.replace(/,/g, ''));
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Error', 'Ingresa un monto válido mayor a 0.');
            return;
        }
        if (formCategoryId == null) {
            Alert.alert('Error', 'Selecciona una categoría.');
            return;
        }
        if (budgetStart && formDate < budgetStart) {
            Alert.alert('Fecha inválida', `La fecha debe ser igual o posterior al inicio del período: ${budgetStart.toLocaleDateString('es-CR')}.`);
            return;
        }
        if (budgetEnd) {
            const endOfDay = new Date(budgetEnd);
            endOfDay.setHours(23, 59, 59);
            if (formDate > endOfDay) {
                Alert.alert('Fecha inválida', `La fecha debe ser igual o anterior al fin del período: ${budgetEnd.toLocaleDateString('es-CR')}.`);
                return;
            }
        }

        const y = formDate.getFullYear();
        const m = String(formDate.getMonth() + 1).padStart(2, '0');
        const d = String(formDate.getDate()).padStart(2, '0');
        const payload = {
            amount,
            type: formType,
            categoryId: formCategoryId,
            date: `${y}-${m}-${d}`,
            description: formDescription.trim() || undefined,
            isExtraIncome: formType === 'Income' ? formIsExtraIncome : false,
        };

        setSubmitting(true);
        try {
            if (editingId != null) {
                await transactionService.update(editingId, payload);
            } else {
                await transactionService.create(payload);
            }
            setModalVisible(false);
            resetForm();
            loadTransactions();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? 'No se pudo guardar la transacción.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleTypeChange = (t: 'Income' | 'Expense') => {
        setFormType(t);
        setFormCategoryId(null);
        setFormIsExtraIncome(false);
    };

    const renderItem = ({ item }: { item: Transaction }) => (
        <TouchableOpacity
            style={styles.txCard}
            onPress={() => openActions(item)}
            activeOpacity={0.75}
        >
            <View style={[styles.txDot, { backgroundColor: item.type === 'Income' ? colors.income : colors.expense }]} />
            <View style={styles.txInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.txCategory}>{item.categoryName}</Text>
                    {item.isExtraIncome && (
                        <View style={styles.extraBadge}>
                            <Text style={styles.extraBadgeText}>Extra</Text>
                        </View>
                    )}
                </View>
                {item.description ? (
                    <Text style={styles.txDesc}>{item.description}</Text>
                ) : null}
                <Text style={styles.txDate}>{item.date.slice(0, 10)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={[styles.txAmount, { color: item.type === 'Income' ? colors.income : colors.expense }]}>
                    {item.type === 'Income' ? '+' : '-'}{formatCRC(item.amount)}
                </Text>
                <Text style={styles.txHint}>Toca para opciones</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const selectedCat = activeCategories.find(c => c.categoryId === formCategoryId);
    const isIngresoAdicional = selectedCat?.isSystemCategory ?? false;
    const isEditing = editingId != null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>💰 Transacciones</Text>
            </View>

            {/* Filtros */}
            <View style={styles.filterRow}>
                {(['All', 'Income', 'Expense'] as FilterType[]).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterBtn, filter === f ? styles.filterBtnActive : null]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f ? styles.filterTextActive : null]}>
                            {f === 'All' ? 'Todos' : f === 'Income' ? 'Ingresos' : 'Gastos'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {deleting && (
                <View style={styles.deletingBanner}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.deletingText}>Eliminando…</Text>
                </View>
            )}

            <FlatList
                data={filtered}
                keyExtractor={item => String(item.id)}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>💸</Text>
                        <Text style={styles.emptyText}>Sin transacciones</Text>
                        <Text style={styles.emptySubText}>Presiona + para agregar una</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }} activeOpacity={0.8}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* ── Acciones bottom-sheet ────────────────────────────── */}
            <Modal
                visible={actionsVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setActionsVisible(false)}
            >
                <TouchableOpacity
                    style={styles.actionsOverlay}
                    activeOpacity={1}
                    onPress={() => setActionsVisible(false)}
                >
                    <View style={styles.actionsSheet}>
                        <View style={styles.modalHandle} />
                        {selectedTx && (
                            <>
                                <Text style={styles.actionsTitle}>
                                    {selectedTx.type === 'Income' ? '↑' : '↓'} {selectedTx.categoryName}
                                </Text>
                                <Text style={styles.actionsAmount}>
                                    {formatCRC(selectedTx.amount)}
                                    {'  '}
                                    <Text style={styles.actionsDate}>{selectedTx.date.slice(0, 10)}</Text>
                                </Text>
                            </>
                        )}
                        <View style={styles.actionsBtns}>
                            <TouchableOpacity
                                style={[styles.actionBtn, { borderColor: colors.primary }]}
                                onPress={() => selectedTx && openEditForm(selectedTx)}
                            >
                                <Text style={[styles.actionBtnText, { color: colors.primary }]}>✏️  Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { borderColor: colors.expense }]}
                                onPress={handleDelete}
                            >
                                <Text style={[styles.actionBtnText, { color: colors.expense }]}>🗑️  Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.actionsCancelBtn} onPress={() => setActionsVisible(false)}>
                            <Text style={styles.actionsCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ── Modal crear / editar transacción ─────────────────── */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => { setModalVisible(false); resetForm(); }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>
                            {isEditing ? '✏️ Editar Transacción' : 'Nueva Transacción'}
                        </Text>

                        {/* Tipo */}
                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeBtn, formType === 'Expense' ? styles.typeBtnExpense : null]}
                                onPress={() => handleTypeChange('Expense')}
                            >
                                <Text style={[styles.typeBtnText, formType === 'Expense' ? { color: colors.white } : null]}>
                                    ↓ Gasto
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, formType === 'Income' ? styles.typeBtnIncome : null]}
                                onPress={() => handleTypeChange('Income')}
                            >
                                <Text style={[styles.typeBtnText, formType === 'Income' ? { color: colors.white } : null]}>
                                    ↑ Ingreso
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Monto */}
                        <Text style={styles.fieldLabel}>Monto (₡)</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={formAmount}
                            onChangeText={setFormAmount}
                            placeholder="0"
                            keyboardType="numeric"
                            placeholderTextColor={colors.gray400}
                        />

                        {/* Categorías */}
                        <Text style={styles.fieldLabel}>Categoría</Text>
                        {loadingCats ? (
                            <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: spacing.md }} />
                        ) : activeCategories.length === 0 ? (
                            <View style={styles.noCatBanner}>
                                <Text style={styles.noCatText}>
                                    ⚠️ No hay categorías de {formType === 'Income' ? 'ingreso' : 'gasto'} en tu presupuesto activo.
                                </Text>
                                <Text style={styles.noCatHint}>
                                    Agrégalas desde la pestaña <Text style={{ fontWeight: '700' }}>Presupuesto → Administrar categorías</Text>.
                                </Text>
                            </View>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                                {activeCategories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.categoryId}
                                        style={[styles.catChip, formCategoryId === cat.categoryId ? styles.catChipActive : null]}
                                        onPress={() => {
                                            setFormCategoryId(cat.categoryId);
                                            if (cat.isSystemCategory) setFormIsExtraIncome(true);
                                            else setFormIsExtraIncome(false);
                                        }}
                                    >
                                        <Text style={styles.catIcon}>{iconToEmoji(cat.icon)}</Text>
                                        <Text style={[styles.catName, formCategoryId === cat.categoryId ? { color: colors.white } : null]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Toggle Ingreso adicional */}
                        {formType === 'Income' && formCategoryId !== null && !isIngresoAdicional && (
                            <View style={styles.extraToggleRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.extraToggleLabel}>⭐ Ingreso adicional</Text>
                                    <Text style={styles.extraToggleHint}>Horas extra, freelance, regalo, reembolso…</Text>
                                </View>
                                <Switch
                                    value={formIsExtraIncome}
                                    onValueChange={setFormIsExtraIncome}
                                    trackColor={{ true: colors.primary }}
                                    thumbColor={formIsExtraIncome ? colors.white : colors.gray300}
                                />
                            </View>
                        )}
                        {isIngresoAdicional && (
                            <View style={styles.extraInfoBanner}>
                                <Text style={styles.extraInfoText}>
                                    ⭐ Este ingreso se registrará como <Text style={{ fontWeight: '700' }}>Ingreso Adicional</Text> y aumentará tu capacidad financiera.
                                </Text>
                            </View>
                        )}

                        {/* Fecha */}
                        <Text style={styles.fieldLabel}>Fecha</Text>
                        <TouchableOpacity
                            style={styles.datePickerBtn}
                            onPress={() => setShowDatePicker(v => !v)}
                        >
                            <Text style={styles.datePickerBtnText}>
                                📅 {formDate.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (() => {
                            const today = new Date();
                            const maxDate = budgetEnd ? (today < budgetEnd ? today : budgetEnd) : today;
                            const minDate = budgetStart ?? undefined;
                            return (
                                <View style={Platform.OS === 'ios' ? {
                                    backgroundColor: '#ffffff',
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    marginBottom: 8,
                                    overflow: 'hidden',
                                } : undefined}>
                                    <DateTimePicker
                                        value={formDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        minimumDate={minDate}
                                        maximumDate={maxDate}
                                        themeVariant="light"
                                        onChange={(event: DateTimePickerEvent, selected?: Date) => {
                                            if (Platform.OS === 'android') {
                                                setShowDatePicker(false);
                                                if (event.type === 'set' && selected) setFormDate(selected);
                                            } else {
                                                if (selected) setFormDate(selected);
                                            }
                                        }}
                                        style={Platform.OS === 'ios' ? { height: 120 } : undefined}
                                        locale="es-CR"
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity
                                            style={styles.datePickerDoneBtn}
                                            onPress={() => setShowDatePicker(false)}
                                        >
                                            <Text style={styles.datePickerDoneText}>Listo ✓</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })()}

                        {/* Descripción */}
                        <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
                        <TextInput
                            style={styles.descInput}
                            value={formDescription}
                            onChangeText={setFormDescription}
                            placeholder="Ej: Pago de supermercado"
                            placeholderTextColor={colors.gray400}
                            autoCorrect={false}
                        />

                        {/* Botones */}
                        <View style={styles.modalBtns}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => { setModalVisible(false); resetForm(); }}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitBtn, submitting ? styles.submitBtnDisabled : null]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting
                                    ? <ActivityIndicator color={colors.white} />
                                    : <Text style={styles.submitText}>{isEditing ? 'Actualizar' : 'Guardar'}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerBar: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: { ...(typography.h2 as object), color: colors.white, fontSize: 20 },

    filterRow: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        ...(shadows.small as object),
    },
    filterBtn: {
        flex: 1, paddingVertical: spacing.sm,
        borderRadius: borderRadius.md, alignItems: 'center',
        backgroundColor: colors.gray100,
    },
    filterBtnActive: { backgroundColor: colors.primary },
    filterText: { ...(typography.bodySmall as object), color: colors.textSecondary, fontWeight: '600' },
    filterTextActive: { color: colors.white },

    deletingBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: colors.white, paddingHorizontal: spacing.md,
        paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    deletingText: { fontSize: 13, color: colors.textSecondary },

    listContent: { padding: spacing.md, gap: spacing.sm },
    emptyContainer: { flex: 1 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyText: { ...(typography.h3 as object), color: colors.text },
    emptySubText: { ...(typography.bodySmall as object), color: colors.textSecondary, marginTop: spacing.xs },

    txCard: {
        backgroundColor: colors.white, borderRadius: borderRadius.lg,
        padding: spacing.md, flexDirection: 'row', alignItems: 'center',
        gap: spacing.md, ...(shadows.small as object),
    },
    txDot: { width: 10, height: 10, borderRadius: 5 },
    txInfo: { flex: 1 },
    txCategory: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text },
    txDesc: { ...(typography.caption as object), color: colors.textSecondary },
    txDate: { ...(typography.caption as object), color: colors.gray400, marginTop: 2 },
    txAmount: { ...(typography.body as object), fontWeight: 'bold' },
    txHint: { fontSize: 10, color: colors.gray400 },
    extraBadge: {
        backgroundColor: colors.accent + '30', borderRadius: 6,
        paddingHorizontal: 6, paddingVertical: 2,
    },
    extraBadgeText: { fontSize: 10, fontWeight: '700', color: colors.accent },

    fab: {
        position: 'absolute', bottom: spacing.xl, right: spacing.lg,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
        ...(shadows.large as object),
    },
    fabText: { color: colors.white, fontSize: 28, lineHeight: 30, fontWeight: '300' },

    // Actions bottom-sheet
    actionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    actionsSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg, paddingBottom: spacing.xxl,
    },
    actionsTitle: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 4 },
    actionsAmount: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
    actionsDate: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
    actionsBtns: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    actionBtn: {
        flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
        borderWidth: 1.5, alignItems: 'center',
    },
    actionBtnText: { fontSize: 15, fontWeight: '700' },
    actionsCancelBtn: {
        paddingVertical: spacing.md, borderRadius: borderRadius.md,
        backgroundColor: colors.gray100, alignItems: 'center',
    },
    actionsCancelText: { color: colors.textSecondary, fontWeight: '600' },

    // Create/Edit modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg, paddingBottom: spacing.xxl,
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: colors.gray300, alignSelf: 'center', marginBottom: spacing.md,
    },
    modalTitle: { ...(typography.h2 as object), fontSize: 20, color: colors.text, marginBottom: spacing.md },

    typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    typeBtn: {
        flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    typeBtnExpense: { backgroundColor: colors.expense, borderColor: colors.expense },
    typeBtnIncome: { backgroundColor: colors.income, borderColor: colors.income },
    typeBtnText: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text },

    fieldLabel: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
    amountInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: spacing.md,
    },

    noCatBanner: {
        backgroundColor: colors.warning + '20', borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.md,
        borderLeftWidth: 3, borderLeftColor: colors.warning,
    },
    noCatText: { fontSize: 13, color: colors.text, fontWeight: '600', marginBottom: 4 },
    noCatHint: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

    catScroll: { marginBottom: spacing.md },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        borderWidth: 1, borderColor: colors.border, borderRadius: 20,
        paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: spacing.sm,
        backgroundColor: colors.white,
    },
    catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catIcon: { fontSize: 16 },
    catName: { ...(typography.bodySmall as object), color: colors.text },

    extraToggleRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.gray100, borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.md,
    },
    extraToggleLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
    extraToggleHint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

    extraInfoBanner: {
        backgroundColor: colors.primary + '15', borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.md,
        borderLeftWidth: 3, borderLeftColor: colors.primary,
    },
    extraInfoText: { fontSize: 13, color: colors.text, lineHeight: 18 },

    descInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        ...(typography.body as object), color: colors.text, marginBottom: spacing.lg,
    },
    datePickerBtn: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        backgroundColor: colors.gray100, marginBottom: spacing.md,
    },
    datePickerBtnText: {
        ...(typography.body as object), color: colors.text, fontWeight: '600',
    },
    datePickerDoneBtn: {
        alignItems: 'center', paddingVertical: 8,
        borderTopWidth: 1, borderTopColor: colors.border,
        backgroundColor: '#f9f9f9',
    },
    datePickerDoneText: {
        ...(typography.bodySmall as object), color: colors.primary, fontWeight: '700',
    },
    modalBtns: { flexDirection: 'row', gap: spacing.md },
    cancelBtn: {
        flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    cancelText: { ...(typography.body as object), color: colors.textSecondary, fontWeight: '600' },
    submitBtn: {
        flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.md,
        backgroundColor: colors.primary, alignItems: 'center',
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitText: { ...(typography.body as object), color: colors.white, fontWeight: '600' },
});
