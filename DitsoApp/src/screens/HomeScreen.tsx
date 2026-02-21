import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';

export default function HomeScreen() {
    const { user, signOut } = useAuth();
    const userName: string = user?.fullName ?? 'Usuario';

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Bienvenido a Ditsö 🇨🇷</Text>
                <Text style={styles.subtitle}>{'Hola, ' + userName}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🎯 Presupuesto Activo</Text>
                    <Text style={styles.cardSubtitle}>Próximamente...</Text>
                    <Text style={styles.cardDescription}>
                        Aquí verás tu presupuesto quincenal o mensual actual
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💰 Transacciones Recientes</Text>
                    <Text style={styles.cardSubtitle}>Próximamente...</Text>
                    <Text style={styles.cardDescription}>
                        Tus últimos ingresos y gastos aparecerán aquí
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Resumen Financiero</Text>
                    <Text style={styles.cardSubtitle}>Próximamente...</Text>
                    <Text style={styles.cardDescription}>
                        Balance, gastos por categoría y más
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Cerrar Sesión"
                    variant="outline"
                    onPress={signOut}
                    fullWidth={true}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        padding: spacing.lg,
        paddingTop: spacing.xxl,
    },
    title: {
        ...(typography.h2 as object),
        color: colors.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...(typography.body as object),
        color: colors.white,
        opacity: 0.9,
    },
    content: {
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        ...(typography.h3 as object),
        color: colors.text,
        marginBottom: spacing.xs,
    },
    cardSubtitle: {
        ...(typography.body as object),
        color: colors.secondary,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    cardDescription: {
        ...(typography.bodySmall as object),
        color: colors.textSecondary,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
});
