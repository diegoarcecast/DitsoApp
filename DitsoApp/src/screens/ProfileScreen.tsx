import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    // Editar nombre
    const [fullName, setFullName] = useState(user?.fullName ?? '');
    const [savingName, setSavingName] = useState(false);

    // Cambiar contraseña
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [savingPwd, setSavingPwd] = useState(false);

    const [nameSuccess, setNameSuccess] = useState(false);
    const [pwdSuccess, setPwdSuccess] = useState(false);

    const handleUpdateName = async () => {
        const trimmed = fullName.trim();
        if (!trimmed) return Alert.alert('Validación', 'El nombre no puede estar vacío.');
        setSavingName(true);
        setNameSuccess(false);
        try {
            await authService.updateProfile({ fullName: trimmed });
            setNameSuccess(true);
            Alert.alert('✅ Listo', 'Tu nombre fue actualizado correctamente.');
        } catch {
            Alert.alert('Error', 'No se pudo actualizar el nombre. Intenta de nuevo.');
        } finally {
            setSavingName(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPwd || !newPwd || !confirmPwd)
            return Alert.alert('Validación', 'Completa todos los campos.');
        if (newPwd.length < 6)
            return Alert.alert('Validación', 'La nueva contraseña debe tener al menos 6 caracteres.');
        if (newPwd !== confirmPwd)
            return Alert.alert('Validación', 'Las contraseñas nuevas no coinciden.');

        setSavingPwd(true);
        setPwdSuccess(false);
        try {
            await authService.changePassword({
                currentPassword: currentPwd,
                newPassword: newPwd,
                confirmPassword: confirmPwd,
            });
            setPwdSuccess(true);
            setCurrentPwd('');
            setNewPwd('');
            setConfirmPwd('');
            Alert.alert('✅ Listo', 'Contraseña cambiada exitosamente.');
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'No se pudo cambiar la contraseña.';
            Alert.alert('Error', msg);
        } finally {
            setSavingPwd(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut() },
            ]
        );
    };

    // Avatar: primera letra del nombre
    const avatarLetter = (user?.fullName ?? 'U')[0].toUpperCase();

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={s.screen} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
                {/* Header */}
                <View style={s.header}>
                    <View style={s.avatar}>
                        <Text style={s.avatarLetter}>{avatarLetter}</Text>
                    </View>
                    <Text style={s.name}>{user?.fullName ?? '-'}</Text>
                    <Text style={s.email}>{user?.email ?? '-'}</Text>
                    <View style={s.roleBadge}>
                        <Text style={s.roleText}>{user?.role ?? 'User'}</Text>
                    </View>
                </View>

                {/* Editar perfil */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>✏️ Editar perfil</Text>

                    <Text style={s.label}>Nombre completo</Text>
                    <TextInput
                        style={s.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Tu nombre"
                        placeholderTextColor={colors.textSecondary}
                        autoCapitalize="words"
                    />

                    <TouchableOpacity
                        style={[s.btn, savingName && { opacity: 0.6 }]}
                        onPress={handleUpdateName}
                        disabled={savingName}
                    >
                        {savingName
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={s.btnText}>Guardar nombre</Text>}
                    </TouchableOpacity>

                    {nameSuccess && <Text style={s.successText}>✅ Nombre actualizado</Text>}
                </View>

                {/* Cambiar contraseña */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>🔐 Cambiar contraseña</Text>

                    <Text style={s.label}>Contraseña actual</Text>
                    <TextInput
                        style={s.input}
                        value={currentPwd}
                        onChangeText={setCurrentPwd}
                        secureTextEntry
                        placeholder="••••••••"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={s.label}>Nueva contraseña</Text>
                    <TextInput
                        style={s.input}
                        value={newPwd}
                        onChangeText={setNewPwd}
                        secureTextEntry
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={s.label}>Confirmar nueva contraseña</Text>
                    <TextInput
                        style={s.input}
                        value={confirmPwd}
                        onChangeText={setConfirmPwd}
                        secureTextEntry
                        placeholder="Repetir contraseña"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <TouchableOpacity
                        style={[s.btn, savingPwd && { opacity: 0.6 }]}
                        onPress={handleChangePassword}
                        disabled={savingPwd}
                    >
                        {savingPwd
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={s.btnText}>Cambiar contraseña</Text>}
                    </TouchableOpacity>

                    {pwdSuccess && <Text style={s.successText}>✅ Contraseña actualizada</Text>}
                </View>

                {/* Info de la app */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>ℹ️ Acerca de Ditsö</Text>
                    <View style={s.infoRow}>
                        <Text style={s.infoLabel}>Versión</Text>
                        <Text style={s.infoValue}>1.0.0</Text>
                    </View>
                    <View style={s.infoRow}>
                        <Text style={s.infoLabel}>Plataforma</Text>
                        <Text style={s.infoValue}>{Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'}</Text>
                    </View>
                    <View style={s.infoRow}>
                        <Text style={s.infoLabel}>Stack</Text>
                        <Text style={s.infoValue}>Expo + .NET 9</Text>
                    </View>
                </View>

                {/* Cerrar sesión */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                    <Text style={s.logoutText}>🚪 Cerrar sesión</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.secondary,
        paddingTop: 60,
        paddingBottom: 32,
        alignItems: 'center',
        gap: 6,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    avatarLetter: { fontSize: 32, fontWeight: '800', color: '#fff' },
    name: { fontSize: 20, fontWeight: '700', color: '#fff' },
    email: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
    roleBadge: {
        marginTop: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    roleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        margin: 16,
        marginBottom: 0,
        padding: 16,
        elevation: 2,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 },
    label: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, marginTop: 8 },
    input: {
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    btn: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginTop: 14,
    },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    successText: { color: colors.primary, textAlign: 'center', marginTop: 8, fontWeight: '600' },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    infoLabel: { fontSize: 13, color: colors.textSecondary },
    infoValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
    logoutBtn: {
        margin: 16,
        marginTop: 20,
        backgroundColor: colors.white,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.error,
    },
    logoutText: { color: colors.error, fontWeight: '700', fontSize: 16 },
});
