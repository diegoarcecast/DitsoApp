import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

// Props tipadas estrictamente — sin extends TouchableOpacityProps
// para evitar que props con tipos ambiguos lleguen al componente nativo
interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant,
    loading,
    fullWidth,
    disabled,
    style,
}) => {
    // Coerciones estrictas a boolean primitivo
    const variantValue: ButtonVariant = variant === 'secondary' || variant === 'outline'
        ? variant
        : 'primary';
    const loadingValue: boolean = loading === true;
    const fullWidthValue: boolean = fullWidth === true;
    const disabledValue: boolean = disabled === true;
    const isDisabled: boolean = disabledValue === true || loadingValue === true;

    const getButtonStyle = () => {
        if (variantValue === 'secondary') return styles.secondaryButton;
        if (variantValue === 'outline') return styles.outlineButton;
        return styles.primaryButton;
    };

    const getTextStyle = () => {
        if (variantValue === 'outline') return styles.outlineText;
        return styles.buttonText;
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                fullWidthValue === true ? styles.fullWidth : null,
                isDisabled === true ? styles.disabled : null,
                style,
            ]}
            disabled={isDisabled}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {loadingValue === true ? (
                <ActivityIndicator
                    color={variantValue === 'outline' ? colors.primary : colors.white}
                />
            ) : (
                <Text style={[styles.text, getTextStyle()]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    fullWidth: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    secondaryButton: {
        backgroundColor: colors.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...(typography.body as object),
        fontWeight: '600',
    },
    buttonText: {
        color: colors.white,
    },
    outlineText: {
        color: colors.primary,
    },
});
