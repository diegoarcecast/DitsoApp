// Paleta financiera premium DITSÖ
export const colors = {
    // Marca principal
    primary: '#16A34A',       // Verde financiero moderno (crecimiento, identidad CR, fintech)
    secondary: '#0F172A',     // Azul profundo institucional (seguridad, profesionalismo)
    accent: '#F59E0B',        // Dorado moderno (riqueza, exito financiero, elementos clave)
    white: '#FFFFFF',

    // Fondos
    background: '#F8FAFC',    // Gris ultra claro (limpio, reduce fatiga visual)
    surface: '#FFFFFF',       // Blanco puro

    // Texto
    text: '#0F172A',          // Gris oscuro moderno
    textSecondary: '#64748B', // Gris medio

    // Bordes / UI
    border: '#E2E8F0',

    // Estados
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#0EA5E9',

    // Presupuesto (semaforo financiero)
    budgetGreen: '#16A34A',
    budgetYellow: '#F59E0B',
    budgetRed: '#DC2626',

    // Transacciones
    income: '#16A34A',        // Verde = ingreso
    expense: '#DC2626',       // Rojo = gasto

    // Grises (escala Tailwind Slate)
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: 'normal' as const,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: 'normal' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: 'normal' as const,
        lineHeight: 16,
    },
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    medium: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    large: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },
};

export const theme = {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
};

export type Theme = typeof theme;
