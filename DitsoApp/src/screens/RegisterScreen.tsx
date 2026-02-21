import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, spacing, typography } from '../theme';

export default function RegisterScreen({ navigation }: any) {
    const { signUp } = useAuth();
    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [fullNameError, setFullNameError] = useState<string | undefined>(undefined);
    const [emailError, setEmailError] = useState<string | undefined>(undefined);
    const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);

    const validate = (): boolean => {
        let valid: boolean = true;

        if (fullName.trim().length === 0) {
            setFullNameError('El nombre es requerido');
            valid = false;
        } else {
            setFullNameError(undefined);
        }

        if (email.trim().length === 0) {
            setEmailError('El email es requerido');
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Email inválido');
            valid = false;
        } else {
            setEmailError(undefined);
        }

        if (password.length === 0) {
            setPasswordError('La contraseña es requerida');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Mínimo 6 caracteres');
            valid = false;
        } else {
            setPasswordError(undefined);
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Las contraseñas no coinciden');
            valid = false;
        } else {
            setConfirmPasswordError(undefined);
        }

        return valid;
    };

    const handleRegister = async () => {
        if (validate() === false) return;

        setLoading(true);
        try {
            await signUp({
                fullName: fullName.trim(),
                email: email.trim(),
                password: password,
            });
        } catch (error: any) {
            Alert.alert(
                'Error de Registro',
                error?.response?.data?.message ?? 'No se pudo crear la cuenta. Por favor intenta de nuevo.'
            );
            setLoading(false);
        }
    };

    const behaviorValue = Platform.OS === 'ios' ? 'padding' : 'height';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={behaviorValue}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Unidos a Ditsö</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Nombre Completo"
                        placeholder="Juan Pérez"
                        value={fullName}
                        onChangeText={(text: string) => {
                            setFullName(text);
                            setFullNameError(undefined);
                        }}
                        error={fullNameError}
                        isPassword={false}
                        editable={true}
                    />

                    <Input
                        label="Email"
                        placeholder="tu@email.com"
                        value={email}
                        onChangeText={(text: string) => {
                            setEmail(text);
                            setEmailError(undefined);
                        }}
                        error={emailError}
                        keyboardType="email-address"
                        isPassword={false}
                        editable={true}
                    />

                    <Input
                        label="Contraseña"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChangeText={(text: string) => {
                            setPassword(text);
                            setPasswordError(undefined);
                        }}
                        error={passwordError}
                        isPassword={true}
                        editable={true}
                    />

                    <Input
                        label="Confirmar Contraseña"
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChangeText={(text: string) => {
                            setConfirmPassword(text);
                            setConfirmPasswordError(undefined);
                        }}
                        error={confirmPasswordError}
                        isPassword={true}
                        editable={true}
                    />

                    <Button
                        title="Crear Cuenta"
                        onPress={handleRegister}
                        loading={loading}
                        fullWidth={true}
                        style={styles.registerButton}
                    />

                    <Button
                        title="Ya tengo cuenta"
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        fullWidth={true}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        ...(typography.h1 as object),
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...(typography.body as object),
        color: colors.textSecondary,
    },
    form: {
        marginBottom: spacing.xl,
    },
    registerButton: {
        marginBottom: spacing.md,
    },
});
