import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardTypeOptions,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

// Props tipadas estrictamente — sin extends TextInputProps para evitar
// que props con tipos ambiguos lleguen al componente nativo
interface InputProps {
    label?: string;
    error?: string;
    isPassword?: boolean;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    keyboardType?: KeyboardTypeOptions;
    editable?: boolean;
    style?: ViewStyle | TextStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    isPassword,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    editable,
    style,
}) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Coerciones estrictas a boolean primitivo — Hermes en iOS requiere
    // exactamente `true` o `false`, nunca undefined, null ni string
    const isPasswordValue: boolean = isPassword === true;
    const editableValue: boolean = editable !== false;
    const secureEntry: boolean = isPasswordValue === true && showPassword === false;

    return (
        <View style={styles.container}>
            {label != null && label.length > 0 ? (
                <Text style={styles.label}>{label}</Text>
            ) : null}

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, error != null ? styles.inputError : null, style]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    placeholderTextColor={colors.gray400}
                    secureTextEntry={secureEntry}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={editableValue}
                    underlineColorAndroid="transparent"
                />

                {isPasswordValue === true ? (
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword((prev) => !prev)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.passwordToggleText}>
                            {showPassword === true ? '👁️' : '👁️‍🗨️'}
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {error != null && error.length > 0 ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...(typography.bodySmall as object),
        color: colors.text,
        marginBottom: spacing.xs,
        fontWeight: '600',
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        ...(typography.body as object),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        color: colors.text,
        minHeight: 48,
    },
    inputError: {
        borderColor: colors.error,
    },
    passwordToggle: {
        position: 'absolute',
        right: spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    passwordToggleText: {
        fontSize: 20,
    },
    errorText: {
        ...(typography.caption as object),
        color: colors.error,
        marginTop: spacing.xs,
    },
});
