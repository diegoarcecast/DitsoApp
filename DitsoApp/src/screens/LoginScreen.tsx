import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, spacing, typography } from '../theme';

export default function LoginScreen({ navigation }: any) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<string | undefined>(undefined);
    const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

    const validate = (): boolean => {
        let valid: boolean = true;

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
        } else {
            setPasswordError(undefined);
        }

        return valid;
    };

    const handleLogin = async () => {
        if (validate() === false) return;

        setLoading(true);
        try {
            await signIn({ email: email.trim(), password: password });
        } catch (error: any) {
            Alert.alert(
                'Error de Login',
                error?.response?.data?.message ?? 'Credenciales inválidas. Por favor intenta de nuevo.'
            );
        } finally {
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
                    <Image
                        source={require('../../assets/Ditso.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.subtitle}>Tu aliado financiero 🇨🇷</Text>
                </View>

                <View style={styles.form}>
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
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(text: string) => {
                            setPassword(text);
                            setPasswordError(undefined);
                        }}
                        error={passwordError}
                        isPassword={true}
                        editable={true}
                    />

                    <Button
                        title="Iniciar Sesión"
                        onPress={handleLogin}
                        loading={loading}
                        fullWidth={true}
                        style={styles.loginButton}
                    />

                    <Button
                        title="Crear Cuenta"
                        variant="outline"
                        onPress={() => navigation.navigate('Register')}
                        fullWidth={true}
                    />
                </View>

                <Text style={styles.footer}>
                    {'Sistema de presupuestos quincenales\nDiseñado para Costa Rica 🇨🇷'}
                </Text>
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
        marginBottom: spacing.xxl,
    },
    logo: {
        width: '85%',
        height: 200,
        marginBottom: spacing.sm,
        alignSelf: 'center',
    },
    subtitle: {
        ...(typography.body as object),
        color: colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        marginBottom: spacing.xl,
    },
    loginButton: {
        marginBottom: spacing.md,
    },
    footer: {
        ...(typography.caption as object),
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
});
