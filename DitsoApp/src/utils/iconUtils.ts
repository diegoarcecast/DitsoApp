/**
 * Mapeo de nombres de íconos (Material/FontAwesome) → emoji
 * Compatible con los nombres que usa el backend de la app.
 */
const ICON_MAP: Record<string, string> = {
    // Gastos
    'shopping-cart': '🛒',
    'shopping': '🛍️',
    'food': '🍔',
    'restaurant': '🍽️',
    'fastfood': '🍟',
    'local-pizza': '🍕',
    'local-cafe': '☕',
    'coffee': '☕',
    'home': '🏠',
    'house': '🏠',
    'home-repair-service': '🔧',
    'lightbulb': '💡',
    'bolt': '⚡',
    'electric-bolt': '⚡',
    'water': '💧',
    'local-gas-station': '⛽',
    'gas': '⛽',
    'directions-car': '🚗',
    'car': '🚗',
    'commute': '🚌',
    'train': '🚆',
    'flight': '✈️',
    'local-hospital': '🏥',
    'medical-services': '💊',
    'health-and-safety': '🏥',
    'fitness-center': '🏋️',
    'sports': '⚽',
    'school': '📚',
    'book': '📖',
    'local-library': '📚',
    'movie': '🎬',
    'local-movies': '🎬',
    'music-note': '🎵',
    'headset': '🎧',
    'phone': '📱',
    'smartphone': '📱',
    'computer': '💻',
    'devices': '💻',
    'pets': '🐾',
    'child-care': '👶',
    'people': '👥',
    'person': '👤',
    'card-giftcard': '🎁',
    'celebration': '🎉',
    'savings': '💰',
    'account-balance': '🏦',
    'credit-card': '💳',
    'attach-money': '💵',
    'money': '💵',
    'trending-up': '📈',
    'work': '💼',
    'business': '🏢',
    'star': '⭐',
    'favorite': '❤️',
    'thumb-up': '👍',
    'more-horiz': '•••',
    'other': '📦',
    // Ingresos
    'salary': '💼',
    'freelance': '🖥️',
    'investment': '📈',
    'dividend': '💹',
    'rent': '🏘️',
    // Genérico
    'category': '📦',
    'label': '🏷️',
    'sell': '🏷️',
};

/**
 * Convierte un nombre de ícono a emoji.
 * Si no hay mapeo, devuelve el emoji de categoría genérico.
 */
export function iconToEmoji(icon: string): string {
    if (!icon) return '📦';
    // Si ya es un emoji (longitud de 1-2 puntos de código Unicode), lo devuelve tal cual
    if ([...icon].length <= 2 && icon.codePointAt(0)! > 127) return icon;
    const key = icon.toLowerCase().replace(/_/g, '-');
    return ICON_MAP[key] ?? '📦';
}
