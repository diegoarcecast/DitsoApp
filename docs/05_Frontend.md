# 05 - Frontend de Ditsö (React Native / Expo)

## 1. Estructura del proyecto

La aplicación móvil utiliza Expo + React Native + TypeScript y se organiza en módulos de `screens`, `services`, `navigation`, `contexts`, `components`, `types` y `theme`. Fuente: DitsoApp/package.json; DitsoApp/README.md; DitsoApp/src/*.

Estructura principal observada:

- `App.tsx`: composición raíz con `AuthProvider` y `AppNavigator`. Fuente: DitsoApp/App.tsx.
- `src/navigation/AppNavigator.tsx`: navegación Stack + Bottom Tabs. Fuente: DitsoApp/src/navigation/AppNavigator.tsx.
- `src/contexts/AuthContext.tsx`: estado de sesión. Fuente: DitsoApp/src/contexts/AuthContext.tsx.
- `src/screens/*.tsx`: pantallas funcionales de usuario. Fuente: DitsoApp/src/screens/*.tsx.
- `src/services/*.ts`: capa de acceso a API y utilidades de almacenamiento. Fuente: DitsoApp/src/services/*.ts.

## 2. Pantallas identificadas

- `LoginScreen`, `RegisterScreen`. Fuente: DitsoApp/src/screens/LoginScreen.tsx; DitsoApp/src/screens/RegisterScreen.tsx.
- `DashboardScreen`, `TransactionsScreen`, `BudgetScreen`, `BalanceScreen`, `ReportsScreen`, `ProfileScreen`. Fuente: DitsoApp/src/screens/*.tsx.
- `BudgetOnboardingScreen` (flujo inicial de presupuesto) y `BudgetEditScreen`. Fuente: DitsoApp/src/screens/BudgetOnboardingScreen.tsx; DitsoApp/src/screens/BudgetEditScreen.tsx.
- `HomeScreen` permanece en el repositorio como pantalla legacy. Fuente: DitsoApp/src/screens/HomeScreen.tsx; DitsoApp/README.md.

## 3. Navegación

- Si no hay autenticación, se muestran `Login` y `Register` en stack público. Fuente: DitsoApp/src/navigation/AppNavigator.tsx.
- Si hay autenticación, se carga `AuthedRoot`; antes valida si existe presupuesto activo (`budgetService.getActive`). Fuente: DitsoApp/src/navigation/AppNavigator.tsx.
- Si no hay presupuesto activo, se redirige a `BudgetOnboardingScreen`. Fuente: DitsoApp/src/navigation/AppNavigator.tsx.
- Navegación principal autenticada: tabs `Dashboard`, `Transacciones`, `Presupuesto`, `Balance`, `Reportes`, `Perfil`. Fuente: DitsoApp/src/navigation/AppNavigator.tsx.

## 4. Contextos y manejo de estado

- `AuthContext` expone: `user`, `loading`, `signIn`, `signUp`, `signOut`, `isAuthenticated`. Fuente: DitsoApp/src/contexts/AuthContext.tsx.
- El estado de autenticación se mantiene en memoria (`useState`) y se actualiza tras login/logout. Fuente: DitsoApp/src/contexts/AuthContext.tsx.
- La persistencia de tokens ocurre en la capa de servicios (`authService` + `storage`). Fuente: DitsoApp/src/services/authService.ts; DitsoApp/src/services/storage.ts.

## 5. Comunicación con API

- Cliente HTTP basado en Axios con `baseURL` dependiente de plataforma (`localhost` en web e IP local en móvil). Fuente: DitsoApp/src/services/apiClient.ts.
- Interceptor request añade bearer token automáticamente. Fuente: DitsoApp/src/services/apiClient.ts.
- Interceptor response implementa refresh token ante `401` y reintenta la solicitud original. Fuente: DitsoApp/src/services/apiClient.ts.

Servicios de dominio disponibles:

- `authService`: login, register, updateProfile, changePassword, logout. Fuente: DitsoApp/src/services/authService.ts.
- `transactionService`: CRUD de transacciones. Fuente: DitsoApp/src/services/transactionService.ts.
- `budgetService`: gestión de presupuesto, ítems, categorías activas y distribución sugerida. Fuente: DitsoApp/src/services/budgetService.ts.
- `categoryService`: categorías por tipo y personalizadas. Fuente: DitsoApp/src/services/categoryService.ts.
- `reportService`: resumen por período y reporte mensual. Fuente: DitsoApp/src/services/reportService.ts.
- `financialHealthService`: semáforo financiero. Fuente: DitsoApp/src/services/financialHealthService.ts.
- `fileService`: carga/descarga/eliminación de comprobantes. Fuente: DitsoApp/src/services/fileService.ts.

## 6. Tipado y contratos

Los tipos TypeScript reflejan contratos de backend para usuario, autenticación, transacciones, categorías, presupuesto, reportes y perfil. Fuente: DitsoApp/src/types/index.ts.

## 7. Configuración frontend

- Nombre de aplicación configurado como Ditsö en `app.json`. Fuente: DitsoApp/app.json.
- Dependencias principales: Expo, React Navigation, Axios, AsyncStorage, DateTimePicker, etc. Fuente: DitsoApp/package.json.
- Documentación de conectividad de red para dispositivos físicos en `CONFIGURACION_RED.md`. Fuente: DitsoApp/CONFIGURACION_RED.md.

## 8. Observaciones y pendientes

- La carga inicial de sesión en `loadStoredAuth` actualmente no reconstruye usuario desde token almacenado (solo finaliza loading). Fuente: DitsoApp/src/contexts/AuthContext.tsx.
- No se identificó en el repositorio un sistema global formal de estado (Redux/Zustand); el estado se maneja con hooks/contexto y estado local de pantalla. Fuente: DitsoApp/src/contexts/AuthContext.tsx; DitsoApp/src/screens/*.tsx.
