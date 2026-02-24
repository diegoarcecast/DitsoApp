import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { Budget, Category } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';
import { iconToEmoji } from '../utils/iconUtils';
import { useNavigation } from '@react-navigation/native';

export default function BudgetScreen() {
    const navigation = useNavigation<any>();
    const [budget, setBudget] = useState<Budget | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Crear presupuesto
    const [creating, setCreating] = useState<boolean>(false);
    const [period, setPeriod] = useState<'Semanal' | 'Quincenal' | 'Mensual' | 'Personalizado'>('Quincenal');
    const [limits, setLimits] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Nueva categoría
    const [catModalVisible, setCatModalVisible] = useState<boolean>(false);
    const [newCatName, setNewCatName] = useState<string>('');
    const [newCatType, setNewCatType] = useState<'Income' | 'Expense'>('Expense');
    const [newCatEmoji, setNewCatEmoji] = useState<string>('📦');
    const [savingCat, setSavingCat] = useState<boolean>(false);

    const loadData = useCallback(async () => {
        try {
            const [activeBudget, cats] = await Promise.all([
                budgetService.getActive(),
                categoryService.getByType('Expense'),
            ]);
            setBudget(activeBudget);
            setCategories(cats);
        } catch {
            Alert.alert('Error', 'No se pudo cargar el presupuesto.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);
    const onRefresh = () => { setRefreshing(true); loadData(); };

    const handleCreateCategory = async () => {
        if (newCatName.trim().length === 0) {
            Alert.alert('Error', 'Ingresa un nombre para la categoría.');
            return;
        }
        setSavingCat(true);
        try {
            await categoryService.create({
                name: newCatName.trim(),
                type: newCatType,
                icon: newCatEmoji,
            });
            setCatModalVisible(false);
            setNewCatName('');
            setNewCatEmoji('📦');
            // Recargar categorías
            const cats = await categoryService.getByType('Expense');
            setCategories(cats);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? 'No se pudo crear la categoría.';
            Alert.alert('Error', msg);
        } finally {
            setSavingCat(false);
        }
    };

    const formatCRC = (amount: number) =>
        '₡' + amount.toLocaleString('es-CR', { minimumFractionDigits: 0 });

    const handleDeactivate = () => {
        if (budget == null) return;
        Alert.alert(
            'Desactivar presupuesto',
            '¿Estás seguro? Esto cerrará el período actual.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desactivar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await budgetService.deactivate(budget.id);
                            setBudget(null);
                        } catch {
                            Alert.alert('Error', 'No se pudo desactivar el presupuesto.');
                        }
                    },
                },
            ]
        );
    };

    const handleCreate = async () => {
        const items = categories
            .filter(c => limits[c.id] != null && parseFloat(limits[c.id]) > 0)
            .map(c => ({ categoryId: c.id, limitAmount: parseFloat(limits[c.id]), isIncome: false }));

        if (items.length === 0) {
            Alert.alert('Error', 'Asigna un límite a al menos una categoría.');
            return;
        }

        const totalAmount = items.reduce((s, i) => s + i.limitAmount, 0);
        const today = new Date();
        const startDate = today.toISOString().slice(0, 10);

        setSubmitting(true);
        try {
            const newBudget = await budgetService.create({ period, startDate, totalAmount, items });
            setBudget(newBudget);
            setCreating(false);
            setLimits({});
        } catch {
            Alert.alert('Error', 'No se pudo crear el presupuesto.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading === true) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={0}
            >
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
                    <View style={styles.headerBar}>
                        <Text style={styles.headerTitle}>🎯 Presupuesto</Text>
                    </View>

                    {budget != null && creating === false ? (
                        // --- Presupuesto activo ---
                        <View style={styles.content}>
                            <View style={styles.card}>
                                <View style={styles.budgetTopRow}>
                                    <View>
                                        <Text style={styles.periodLabel}>{budget.period}</Text>
                                        <Text style={styles.dateRange}>
                                            {budget.startDate.slice(0, 10)} → {budget.endDate.slice(0, 10)}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                        <TouchableOpacity
                                            style={styles.editBtn}
                                            onPress={() => navigation.navigate('BudgetEdit', { budgetId: budget.id })}
                                        >
                                            <Text style={styles.editBtnText}>✏️ Editar</Text>
                                        </TouchableOpacity>
                                        <View style={[styles.activeBadge]}>
                                            <Text style={styles.activeBadgeText}>● Activo</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Resumen total */}
                                {(() => {
                                    const total = budget.items.reduce((s, i) => s + i.limitAmount, 0);
                                    const spent = budget.items.reduce((s, i) => s + i.spentAmount, 0);
                                    const pct = total > 0 ? (spent / total) * 100 : 0;
                                    return (
                                        <View style={styles.totalBlock}>
                                            <View style={styles.totalRow}>
                                                <Text style={styles.totalLabel}>Total gastado</Text>
                                                <Text style={styles.totalPct}>{Math.round(pct)}%</Text>
                                            </View>
                                            <ProgressBar percentage={pct} />
                                            <Text style={styles.totalDetail}>
                                                {formatCRC(spent)} de {formatCRC(total)}
                                            </Text>
                                        </View>
                                    );
                                })()}
                            </View>

                            {/* ── Gastos por categoría ── */}
                            {budget.items.some(i => !i.isIncome) && (
                                <Text style={styles.sectionLabel}>Gastos por categoría</Text>
                            )}
                            {budget.items
                                .filter(i => !i.isIncome)
                                .map(item => (
                                    <View key={item.id} style={styles.itemCard}>
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemIcon}>{iconToEmoji(item.categoryIcon)}</Text>
                                            <Text style={styles.itemName}>{item.categoryName}</Text>
                                            <Text style={[
                                                styles.itemPct,
                                                { color: item.percentageUsed >= 90 ? colors.error : item.percentageUsed >= 70 ? colors.warning : colors.success }
                                            ]}>
                                                {Math.round(item.percentageUsed)}% usado
                                            </Text>
                                        </View>
                                        <ProgressBar percentage={item.percentageUsed} />
                                        <View style={styles.itemAmounts}>
                                            <Text style={styles.itemSpent}>{formatCRC(item.spentAmount)} gastado</Text>
                                            <Text style={styles.itemLimit}>
                                                límite: {formatCRC(item.limitAmount)}
                                                {item.percentage > 0 ? ` (${item.percentage.toFixed(1)}%)` : ''}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            }

                            {/* ── Ingresos por categoría ── */}
                            {budget.items.some(i => i.isIncome) && (
                                <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Ingresos</Text>
                            )}
                            {budget.items
                                .filter(i => i.isIncome)
                                .map(item => (
                                    <View key={item.id} style={[styles.itemCard, styles.incomeItemCard]}>
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemIcon}>{iconToEmoji(item.categoryIcon)}</Text>
                                            <Text style={styles.itemName}>{item.categoryName}</Text>
                                            <View style={styles.incomeChip}>
                                                <Text style={styles.incomeChipText}>Ingreso</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.incomeReceived}>
                                            {formatCRC(item.receivedAmount)} recibido
                                        </Text>
                                    </View>
                                ))
                            }




                            <TouchableOpacity style={styles.deactivateBtn} onPress={handleDeactivate}>
                                <Text style={styles.deactivateText}>Cerrar período actual</Text>
                            </TouchableOpacity>
                        </View>

                    ) : creating === true || budget == null ? (
                        // --- Crear presupuesto ---
                        <View style={styles.content}>
                            <View style={styles.card}>
                                <Text style={styles.createTitle}>
                                    {budget == null ? 'No hay presupuesto activo' : 'Nuevo presupuesto'}
                                </Text>
                                <Text style={styles.createSubtitle}>
                                    Crea un presupuesto para controlar tus gastos
                                </Text>

                                {/* Período */}
                                <Text style={styles.fieldLabel}>Período</Text>
                                <View style={styles.periodRow}>
                                    {(['Semanal', 'Quincenal', 'Mensual'] as const).map(p => (
                                        <TouchableOpacity
                                            key={p}
                                            style={[styles.periodBtn, period === p ? styles.periodBtnActive : null]}
                                            onPress={() => setPeriod(p)}
                                        >
                                            <Text style={[styles.periodBtnText, period === p ? { color: colors.white } : null]}>
                                                {p}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Límites por categoría */}
                                <Text style={styles.fieldLabel}>Límite por categoría (₡)</Text>
                                <Text style={styles.fieldHint}>Deja en 0 las categorías que no quieras incluir</Text>

                                {categories.map(cat => (
                                    <View key={cat.id} style={styles.catLimitRow}>
                                        <Text style={styles.catLimitIcon}>{iconToEmoji(cat.icon)}</Text>
                                        <Text style={styles.catLimitName}>{cat.name}</Text>
                                        <TextInput
                                            style={styles.catLimitInput}
                                            value={limits[cat.id] ?? ''}
                                            onChangeText={text => setLimits(prev => ({ ...prev, [cat.id]: text }))}
                                            placeholder="0"
                                            keyboardType="numeric"
                                            placeholderTextColor={colors.gray400}
                                        />
                                    </View>
                                ))}

                                {/* Botón agregar categoría */}
                                <TouchableOpacity
                                    style={styles.addCatBtn}
                                    onPress={() => setCatModalVisible(true)}
                                >
                                    <Text style={styles.addCatText}>+ Agregar categoría personalizada</Text>
                                </TouchableOpacity>

                                <View style={styles.createBtns}>
                                    {budget != null ? (
                                        <TouchableOpacity
                                            style={styles.cancelCreateBtn}
                                            onPress={() => setCreating(false)}
                                        >
                                            <Text style={styles.cancelCreateText}>Cancelar</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                    <TouchableOpacity
                                        style={[styles.createBtn, submitting === true ? styles.createBtnDisabled : null]}
                                        onPress={handleCreate}
                                        disabled={submitting}
                                    >
                                        {submitting === true
                                            ? <ActivityIndicator color={colors.white} />
                                            : <Text style={styles.createBtnText}>Crear Presupuesto</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) : null}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal nueva categoría */}
            <Modal
                visible={catModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCatModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Nueva categoría</Text>

                        {/* Tipo */}
                        <Text style={styles.fieldLabel}>Tipo</Text>
                        <View style={styles.typeRow}>
                            {(['Expense', 'Income'] as const).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.typeBtn,
                                        newCatType === t
                                            ? (t === 'Expense' ? styles.typeBtnExpense : styles.typeBtnIncome)
                                            : null,
                                    ]}
                                    onPress={() => setNewCatType(t)}
                                >
                                    <Text style={[
                                        styles.typeBtnText,
                                        newCatType === t ? { color: colors.white } : null,
                                    ]}>
                                        {t === 'Expense' ? '↓ Gasto' : '↑ Ingreso'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Nombre */}
                        <Text style={styles.fieldLabel}>Nombre</Text>
                        <TextInput
                            style={styles.catNameInput}
                            value={newCatName}
                            onChangeText={setNewCatName}
                            placeholder="Ej: Mascotas, Gym..."
                            placeholderTextColor={colors.gray400}
                            autoCorrect={false}
                        />

                        {/* Emoji */}
                        <Text style={styles.fieldLabel}>Emoji</Text>
                        <TextInput
                            style={styles.emojiInput}
                            value={newCatEmoji}
                            onChangeText={setNewCatEmoji}
                            placeholder="📦"
                            placeholderTextColor={colors.gray400}
                        />

                        {/* Botones */}
                        <View style={styles.modalBtns}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => { setCatModalVisible(false); setNewCatName(''); setNewCatEmoji('📦'); }}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitBtn, savingCat === true ? styles.submitBtnDisabled : null]}
                                onPress={handleCreateCategory}
                                disabled={savingCat}
                            >
                                {savingCat === true
                                    ? <ActivityIndicator color={colors.white} />
                                    : <Text style={styles.submitText}>Guardar</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerBar: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
    },
    headerTitle: { ...(typography.h2 as object), color: colors.white, fontSize: 20 },

    content: { padding: spacing.md, gap: spacing.md },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...(shadows.medium as object),
    },

    budgetTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
    periodLabel: { ...(typography.h3 as object), color: colors.text },
    dateRange: { ...(typography.caption as object), color: colors.textSecondary, marginTop: 2 },
    activeBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    activeBadgeText: { ...(typography.caption as object), color: '#059669', fontWeight: '600' },

    totalBlock: { marginTop: spacing.sm },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    totalLabel: { ...(typography.bodySmall as object), color: colors.textSecondary },
    totalPct: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text },
    totalDetail: { ...(typography.caption as object), color: colors.textSecondary, marginTop: spacing.xs },

    sectionLabel: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.textSecondary, marginTop: spacing.sm },

    itemCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...(shadows.small as object),
    },
    itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
    itemIcon: { fontSize: 20 },
    itemName: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text, flex: 1 },
    itemPct: { ...(typography.bodySmall as object), fontWeight: 'bold' },
    itemAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
    itemSpent: { ...(typography.caption as object), color: colors.text },
    itemLimit: { ...(typography.caption as object), color: colors.textSecondary },

    deactivateBtn: {
        padding: spacing.md, borderRadius: borderRadius.md,
        borderWidth: 1, borderColor: colors.error, alignItems: 'center',
        marginTop: spacing.sm,
    },
    deactivateText: { ...(typography.bodySmall as object), color: colors.error, fontWeight: '600' },

    editBtn: {
        backgroundColor: colors.primary + '18',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary + '50',
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
    },
    editBtnText: { ...(typography.caption as object), color: colors.primary, fontWeight: '700' },

    // ── Income item styles ───────────────────────────────────────────────────
    incomeItemCard: {
        borderLeftWidth: 3,
        borderLeftColor: colors.income,
    },
    incomeChip: {
        backgroundColor: colors.income + '20',
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
    },
    incomeChipText: {
        fontSize: 11, color: colors.income, fontWeight: '700',
    },
    incomeReceived: {
        ...(typography.h3 as object),
        color: colors.income,
        marginTop: spacing.xs,
    },

    createTitle: { ...(typography.h3 as object), color: colors.text, marginBottom: spacing.xs },
    createSubtitle: { ...(typography.bodySmall as object), color: colors.textSecondary, marginBottom: spacing.lg },

    fieldLabel: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
    fieldHint: { ...(typography.caption as object), color: colors.textSecondary, marginBottom: spacing.sm },

    periodRow: { flexDirection: 'row', gap: spacing.sm },
    periodBtn: {
        flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    periodBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    periodBtnText: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text },

    catLimitRow: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    catLimitIcon: { fontSize: 20 },
    catLimitName: { ...(typography.bodySmall as object), color: colors.text, flex: 1 },
    catLimitInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm, paddingVertical: 4,
        width: 100, textAlign: 'right',
        ...(typography.body as object), color: colors.text,
    },

    createBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    cancelCreateBtn: {
        flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    cancelCreateText: { ...(typography.body as object), color: colors.textSecondary },
    createBtn: {
        flex: 2, paddingVertical: spacing.md, borderRadius: borderRadius.md,
        backgroundColor: colors.primary, alignItems: 'center',
    },
    createBtnDisabled: { opacity: 0.6 },
    createBtnText: { ...(typography.body as object), color: colors.white, fontWeight: '600' },

    addCatBtn: {
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.md,
        borderStyle: 'dashed',
    },
    addCatText: { ...(typography.bodySmall as object), color: colors.primary, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: colors.gray300,
        alignSelf: 'center', marginBottom: spacing.md,
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
    catNameInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        ...(typography.body as object), color: colors.text,
        marginBottom: spacing.md,
    },
    emojiInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        fontSize: 28, color: colors.text, textAlign: 'center',
        marginBottom: spacing.lg, width: 80,
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
