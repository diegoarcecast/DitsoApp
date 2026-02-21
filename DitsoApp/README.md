# Ditsö Mobile App 📱

Aplicación móvil de finanzas personales para Costa Rica 🇨🇷  
**Stack**: Expo (React Native) + TypeScript + .NET 9 Backend

---

## 🚀 Ejecutar el Proyecto

### 1. Iniciar el Backend

```powershell
cd C:\Users\diego\OneDrive\Documents\ProyectoUniversidad\Ditso
dotnet run --project Ditso.API --urls "http://0.0.0.0:5200"
```

> Swagger disponible en: http://localhost:5200

### 2. Iniciar el Frontend

```powershell
cd C:\Users\diego\OneDrive\Documents\ProyectoUniversidad\DitsoApp
npm start
```

- Presiona `w` → Abre en navegador
- Presiona `a` → Android (requiere emulador)
- Escanea QR con **Expo Go** en tu iPhone

---

## 📱 Pantallas Implementadas

| Pantalla | Archivo | Estado |
|----------|---------|--------|
| Login | `LoginScreen.tsx` | ✅ Funcional |
| Registro | `RegisterScreen.tsx` | ✅ Funcional |
| Home (legacy) | `HomeScreen.tsx` | ✅ Reemplazado por Dashboard |
| Dashboard | `DashboardScreen.tsx` | ✅ Funcional |
| Transacciones | `TransactionsScreen.tsx` | ✅ Funcional |
| Presupuesto | `BudgetScreen.tsx` | ✅ Funcional |

---

## 🗂️ Estructura del Proyecto

```
DitsoApp/
├── src/
│   ├── screens/          # 5 pantallas principales
│   ├── components/       # Button, Input, ProgressBar
│   ├── services/         # apiClient, auth, budget, category, transaction, storage
│   ├── contexts/         # AuthContext
│   ├── navigation/       # AppNavigator (Stack + BottomTabs)
│   ├── theme/            # Colores, tipografía, espaciado
│   ├── types/            # Tipos TypeScript globales
│   └── utils/            # iconUtils
├── App.tsx
├── app.json              # Nombre: Ditsö
└── package.json
```

---

## 🔗 Conexión con el Backend

La app se conecta a: `http://localhost:5200/api`

Para conectar desde **iPhone** usando Tailscale, ver: [CONFIGURACION_RED.md](./CONFIGURACION_RED.md)

---

## 🎨 Tema

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | `#16A34A` | Verde financiero (crecimiento) |
| Secondary | `#0F172A` | Azul profundo institucional |
| Accent | `#F59E0B` | Dorado (elementos clave) |
| Error | `#DC2626` | Gastos / errores |
