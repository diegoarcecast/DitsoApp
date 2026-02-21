# Ditsö - Estado del Backend

## 🚀 Estado Actual: BACKEND CORE FUNCIONAL

**Última actualización:** Febrero 2026

---

## ✅ Módulos Backend Implementados

| Módulo | Estado | Endpoints |
|--------|--------|-----------|
| Autenticación (Auth) | ✅ Completo | 3 |
| Transacciones | ✅ Completo | 5 |
| Presupuestos Quincenales/Mensuales | ✅ Completo | 7 |
| Categorías | ✅ Completo | 2 |
| Deudas | ⬜ Pendiente | — |
| Metas | ⬜ Pendiente | — |

**Total endpoints activos: 17**

---

## ✅ Módulos Frontend Implementados (DitsoApp)

| Módulo | Archivos | Estado |
|--------|----------|--------|
| Login | `LoginScreen.tsx` | ✅ Funcional |
| Registro | `RegisterScreen.tsx` | ✅ Funcional |
| Dashboard | `DashboardScreen.tsx` | ✅ Funcional |
| Transacciones | `TransactionsScreen.tsx` | ✅ Funcional |
| Presupuesto | `BudgetScreen.tsx` | ✅ Funcional |
| Navegación con Tabs | `AppNavigator.tsx` | ✅ Funcional |
| Autenticación global | `AuthContext.tsx` | ✅ Funcional |
| Servicios API | `authService`, `transactionService`, `budgetService`, `categoryService` | ✅ Funcional |

---

## 📊 API Endpoints Detalle

### Auth Controller (3)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión → devuelve JWT |
| POST | `/api/auth/refresh` | Refrescar access token |

### Transactions Controller (5)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions` | Listar todas (filtros: `from`, `to`) |
| GET | `/api/transactions/{id}` | Obtener por ID |
| POST | `/api/transactions` | Crear transacción |
| PUT | `/api/transactions/{id}` | Actualizar |
| DELETE | `/api/transactions/{id}` | Eliminar (soft delete) |

### Budgets Controller (7) 🇨🇷 Innovación Quincenal

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/budgets` | Listar todos |
| GET | `/api/budgets/active` | Presupuesto activo con gastos en tiempo real |
| GET | `/api/budgets/{id}` | Obtener por ID |
| POST | `/api/budgets` | Crear presupuesto (Quincenal o Mensual) |
| PUT | `/api/budgets/{budgetId}/items/{itemId}` | Actualizar límite de categoría |
| PATCH | `/api/budgets/{id}/deactivate` | Desactivar presupuesto |
| DELETE | `/api/budgets/{id}` | Eliminar (soft delete) |

### Categories Controller (2)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar todas (predefinidas + personalizadas) |
| GET | `/api/categories/by-type/{type}` | Filtrar por `Income` o `Expense` |

---

## 💡 Características del Módulo de Presupuestos

### Lógica Quincenal/Mensual

```csharp
// Cálculo automático de fechas de fin
Quincenal: startDate + 15 días
Mensual:   startDate + 1 mes
```

### Cálculo de Gastos por Categoría (tiempo real)

- **SpentAmount**: Suma de gastos en el período para esa categoría
- **RemainingAmount**: LimitAmount − SpentAmount
- **PercentageUsed**: (SpentAmount / LimitAmount) × 100

### Ejemplo de Response — `/api/budgets/active`

```json
{
  "id": 1,
  "period": "Quincenal",
  "startDate": "2026-02-01T00:00:00",
  "endDate": "2026-02-15T23:59:59",
  "isActive": true,
  "items": [
    {
      "id": 1,
      "categoryId": 3,
      "categoryName": "Comida",
      "categoryIcon": "restaurant",
      "limitAmount": 50000,
      "spentAmount": 32500,
      "remainingAmount": 17500,
      "percentageUsed": 65.0
    }
  ]
}
```

---

## 🏗️ Arquitectura

```
Ditso/                              ← Backend (.NET 9)
├── Ditso.API/                      4 Controllers, Program.cs
│   ├── AuthController              3 endpoints
│   ├── TransactionsController      5 endpoints
│   ├── BudgetsController           7 endpoints 🇨🇷
│   └── CategoriesController        2 endpoints
│
├── Ditso.Application/              DTOs + Interfaces
│   ├── DTOs/
│   │   ├── Auth/                   4 DTOs
│   │   ├── Transactions/           3 DTOs
│   │   └── Budgets/                4 DTOs
│   └── Interfaces/
│       ├── IAuthService
│       ├── ITransactionService
│       └── IBudgetService
│
├── Ditso.Infrastructure/           Servicios + DbContext
│   ├── Services/
│   │   ├── AuthService
│   │   ├── TransactionService
│   │   └── BudgetService
│   └── Data/
│       └── DitsoDbContext
│
└── Ditso.Domain/                   Entidades + Enums
    ├── Entities/                   10 entidades
    ├── Enums/                      3 enums
    └── Common/                     BaseEntity

DitsoApp/                           ← Frontend (Expo/React Native)
├── src/
│   ├── screens/                    Dashboard, Transactions, Budget, Login, Register
│   ├── components/                 Button, Input, ProgressBar
│   ├── services/                   apiClient, auth, budget, category, transaction, storage
│   ├── contexts/                   AuthContext
│   ├── navigation/                 AppNavigator (Stack + BottomTabs)
│   ├── theme/                      Colores, tipografía
│   ├── types/                      Tipos globales TypeScript
│   └── utils/                      iconUtils
└── app.json                        Nombre: Ditsö
```

---

## 🎯 Validaciones Implementadas

### Seguridad
- ✅ JWT en todos los endpoints protegidos
- ✅ Validación de ownership (cada usuario solo ve sus datos)
- ✅ BCrypt para contraseñas
- ✅ Soft delete para auditoría

### Negocio
- ✅ Validación de categorías existentes al crear transacción
- ✅ Email único por usuario
- ✅ Desactivación automática del presupuesto anterior al crear uno nuevo
- ✅ Cálculo automático de fechas de fin (quincenal/mensual)

---

## 📈 Métricas del Proyecto

| Métrica | Backend | Frontend |
|---------|---------|----------|
| Proyectos / Módulos | 4 proyectos .NET | 8 carpetas src/ |
| Entidades / Pantallas | 10 entidades | 5 pantallas |
| Controllers / Servicios | 4 controllers | 6 servicios |
| Endpoints / Componentes | 17 endpoints | 3 componentes |
| Tablas BD | 13 tablas | — |
| Categorías seed | 8 categorías | — |

---

## 🔄 Pendientes

### Backend
- [ ] **Deudas** — DebtService + DebtController
- [ ] **Metas** — GoalService + GoalController
- [ ] **Archivos** — FileService para adjuntar comprobantes
- [ ] **Middleware** — Global exception handler

### Frontend
- [ ] Módulo Balance Inteligente (diseñado, pendiente integración)
- [ ] Pantalla de Deudas
- [ ] Pantalla de Metas

### Testing
- [ ] Unit Tests (Backend)
- [ ] Integration Tests
- [ ] E2E Tests

---

## 🌟 Innovación Costarricense — Sistema Quincenal

El sistema de presupuestos está diseñado para la realidad costarricense donde los **salarios son quincenales**:

1. Usuario recibe ₡300,000 el 1 de febrero
2. Crea presupuesto quincenal: Comida ₡50,000 · Transporte ₡20,000
3. Sistema calcula automáticamente fin: 15 de febrero
4. En tiempo real muestra: ₡32,500 de ₡50,000 usados (65%)
5. El 16 de febrero inicia una nueva quincena

---

## ✅ Listo Para

- ✅ Integración completa Frontend ↔ Backend
- ✅ Pruebas con Swagger (`http://localhost:5200`)
- ✅ Demo para defensa académica en iPhone (ver CONFIGURACION_RED.md)

---

**API:** `http://localhost:5200` | **Swagger:** `http://localhost:5200`
