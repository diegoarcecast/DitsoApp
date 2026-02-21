import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Usamos AsyncStorage en lugar de expo-secure-store porque:
// - expo-secure-store no es compatible con la nueva arquitectura de Expo Go SDK 54
// - AsyncStorage ya está instalado y funciona correctamente en iOS, Android y Web
// - Para producción con datos realmente sensibles, se puede migrar a SecureStore
//   una vez que sea 100% compatible con la nueva arquitectura

class Storage {
    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, String(value));
        } else {
            await AsyncStorage.setItem(key, String(value));
        }
    }

    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        } else {
            return await AsyncStorage.getItem(key);
        }
    }

    async removeItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    }
}

export const storage = new Storage();
