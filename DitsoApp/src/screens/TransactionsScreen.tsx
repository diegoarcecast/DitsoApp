import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { Transaction, Category } from '../types';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';
import { iconToEmoji } from '../utils/iconUtils';

type FilterType = 'All' | 'Income' | 'Expense';

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filter, setFilter] = useState<FilterType>('All');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Form state
    const [formAmount, setFormAmount] = useState<string>('');
    const [formType, setFormType] = useState<'Income' | 'Expense'>('Expense');
    const [formCategoryId, setFormCategoryId] = useState<number | null>(null);
    const [formDescription, setFormDescription] = useState<string>('');

    const loadData = useCallback(async () => {
        try {
            const [txs, cats] = await Promise.all([
                transactionService.getAll(),
                categoryService.getAll(),
            ]);
            setTransactions(txs);
            setCategories(cats);
        } catch {
            Alert.alert('Error', 'No se pudieron cargar las transacciones.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const onRefresh = () => { setRefreshing(true); loadData(); };

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
    };

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

        setSubmitting(true);
        try {
            await transactionService.create({
                amount: amount,
                type: formType,
                categoryId: formCategoryId,
                date: new Date().toISOString().slice(0, 10),
                description: formDescription.trim().length > 0 ? formDescription.trim() : undefined,
            });
            setModalVisible(false);
            resetForm();
            loadData();
        } catch {
            Alert.alert('Error', 'No se pudo crear la transacción.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(c => c.type === formType);

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={styles.txCard}>
            <View style={[styles.txDot, { backgroundColor: item.type === 'Income' ? colors.income : colors.expense }]} />
            <View style={styles.txInfo}>
                <Text style={styles.txCategory}>{item.categoryName}</Text>
                {item.description != null && item.description.length > 0 ? (
                    <Text style={styles.txDesc}>{item.description}</Text>
                ) : null}
                <Text style={styles.txDate}>{item.date.slice(0, 10)}</Text>
            </View>
            <Text style={[styles.txAmount, { color: item.type === 'Income' ? colors.income : colors.expense }]}>
                {item.type === 'Income' ? '+' : '-'}{formatCRC(item.amount)}
            </Text>
        </View>
    );

    if (loading === true) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

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
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Modal nueva transacción */}
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
                        <Text style={styles.modalTitle}>Nueva Transacción</Text>

                        {/* Tipo */}
                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeBtn, formType === 'Expense' ? styles.typeBtnExpense : null]}
                                onPress={() => { setFormType('Expense'); setFormCategoryId(null); }}
                            >
                                <Text style={[styles.typeBtnText, formType === 'Expense' ? { color: colors.white } : null]}>
                                    ↓ Gasto
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, formType === 'Income' ? styles.typeBtnIncome : null]}
                                onPress={() => { setFormType('Income'); setFormCategoryId(null); }}
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
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                            {filteredCategories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catChip, formCategoryId === cat.id ? styles.catChipActive : null]}
                                    onPress={() => setFormCategoryId(cat.id)}
                                >
                                    <Text style={styles.catIcon}>{iconToEmoji(cat.icon)}</Text>
                                    <Text style={[styles.catName, formCategoryId === cat.id ? { color: colors.white } : null]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

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
                                style={[styles.submitBtn, submitting === true ? styles.submitBtnDisabled : null]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting === true
                                    ? <ActivityIndicator color={colors.white} />
                                    : <Text style={styles.submitText}>Guardar</Text>
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
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        backgroundColor: colors.gray100,
    },
    filterBtnActive: { backgroundColor: colors.primary },
    filterText: { ...(typography.bodySmall as object), color: colors.textSecondary, fontWeight: '600' },
    filterTextActive: { color: colors.white },

    listContent: { padding: spacing.md, gap: spacing.sm },
    emptyContainer: { flex: 1 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyText: { ...(typography.h3 as object), color: colors.text },
    emptySubText: { ...(typography.bodySmall as object), color: colors.textSecondary, marginTop: spacing.xs },

    txCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        ...(shadows.small as object),
    },
    txDot: { width: 10, height: 10, borderRadius: 5 },
    txInfo: { flex: 1 },
    txCategory: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text },
    txDesc: { ...(typography.caption as object), color: colors.textSecondary },
    txDate: { ...(typography.caption as object), color: colors.gray400, marginTop: 2 },
    txAmount: { ...(typography.body as object), fontWeight: 'bold' },

    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...(shadows.large as object),
    },
    fabText: { color: colors.white, fontSize: 28, lineHeight: 30, fontWeight: '300' },

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

    fieldLabel: { ...(typography.bodySmall as object), fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
    amountInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        fontSize: 24, fontWeight: 'bold', color: colors.text,
        marginBottom: spacing.md,
    },
    catScroll: { marginBottom: spacing.md },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: spacing.sm,
        backgroundColor: colors.white,
    },
    catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catIcon: { fontSize: 16 },
    catName: { ...(typography.bodySmall as object), color: colors.text },
    descInput: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        ...(typography.body as object), color: colors.text,
        marginBottom: spacing.lg,
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
