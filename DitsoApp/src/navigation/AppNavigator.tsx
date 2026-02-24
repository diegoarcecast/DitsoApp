import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import BalanceScreen from '../screens/BalanceScreen';
import BudgetOnboardingScreen from '../screens/BudgetOnboardingScreen';
import BudgetEditScreen from '../screens/BudgetEditScreen';
import { budgetService } from '../services/budgetService';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
    return (
        <Text style={{ fontSize: 22, opacity: focused === true ? 1 : 0.5 }}>
            {emoji}
        </Text>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray500,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: colors.border,
                    paddingBottom: 4,
                    paddingTop: 4,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Transacciones"
                component={TransactionsScreen}
                options={{
                    title: 'Transacciones',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Presupuesto"
                component={BudgetScreen}
                options={{
                    title: 'Presupuesto',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Balance"
                component={BalanceScreen}
                options={{
                    title: 'Balance',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🧠" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}

/**
 * AuthedRoot: shown when the user is authenticated.
 * Checks for an active budget; if none found, shows the onboarding screen.
 */
function AuthedRoot() {
    const [checkingBudget, setCheckingBudget] = useState(true);
    const [hasBudget, setHasBudget] = useState(false);

    const checkBudget = async () => {
        setCheckingBudget(true);
        try {
            const budget = await budgetService.getActive();
            setHasBudget(budget !== null);
        } catch {
            setHasBudget(false);
        } finally {
            setCheckingBudget(false);
        }
    };

    useEffect(() => { checkBudget(); }, []);

    if (checkingBudget) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 14 }}>
                    Verificando tu presupuesto…
                </Text>
            </View>
        );
    }

    if (!hasBudget) {
        return (
            <BudgetOnboardingScreen onBudgetCreated={() => setHasBudget(true)} />
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
                name="BudgetEdit"
                component={BudgetEditScreen}
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated, loading } = useAuth();

    const isLoadingValue: boolean = loading === true;
    const isAuthValue: boolean = isAuthenticated === true;

    if (isLoadingValue) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthValue === false ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{ headerShown: true, title: 'Registro' }}
                        />
                    </>
                ) : (
                    <Stack.Screen name="Main" component={AuthedRoot} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
