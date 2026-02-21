# Ditsö API - Ejemplos de Prueba

## 📋 Información General

- **Base URL**: `http://localhost:5200`
- **Swagger UI**: `http://localhost:5200`
- **Autenticación**: JWT Bearer Token

---

## 🔐 Autenticación

### 1. Registrar Usuario

```bash
curl -X POST http://localhost:5200/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"usuario@ejemplo.com\",\"password\":\"Password123!\",\"fullName\":\"Tu Nombre\"}"
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "fullName": "Tu Nombre",
  "role": "User"
}
```

---

### 2. Iniciar Sesión

```bash
curl -X POST http://localhost:5200/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"usuario@ejemplo.com\",\"password\":\"Password123!\"}"
```

**Respuesta esperada:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "base64token...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "fullName": "Tu Nombre",
    "role": "User"
  }
}
```

> ⚠️ **Guarda el `accessToken`** — lo necesitas en todas las peticiones siguientes.

---

### 3. Refrescar Token

```bash
curl -X POST http://localhost:5200/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "\"TU_REFRESH_TOKEN_AQUI\""
```

---

## 📁 Categorías

### 4. Obtener Todas las Categorías

```bash
curl -X GET http://localhost:5200/api/categories \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

**Respuesta esperada:**
```json
[
  { "id": 1, "name": "Salario",    "icon": "wallet",      "type": "Income",  "isCustom": false },
  { "id": 2, "name": "Otro Ingreso","icon": "cash",       "type": "Income",  "isCustom": false },
  { "id": 3, "name": "Comida",     "icon": "restaurant",  "type": "Expense", "isCustom": false },
  { "id": 4, "name": "Vivienda",   "icon": "home",        "type": "Expense", "isCustom": false },
  { "id": 5, "name": "Transporte", "icon": "car",         "type": "Expense", "isCustom": false },
  { "id": 6, "name": "Salud",      "icon": "medkit",      "type": "Expense", "isCustom": false },
  { "id": 7, "name": "Entretenimiento","icon": "game-controller","type": "Expense","isCustom": false },
  { "id": 8, "name": "Otros",      "icon": "ellipsis",    "type": "Expense", "isCustom": false }
]
```

### 5. Filtrar Categorías por Tipo

```bash
# Solo gastos
curl -X GET http://localhost:5200/api/categories/by-type/Expense \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"

# Solo ingresos
curl -X GET http://localhost:5200/api/categories/by-type/Income \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

## 💰 Transacciones

### 6. Crear Ingreso (Salario Quincenal)

```bash
curl -X POST http://localhost:5200/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d "{\"categoryId\":1,\"amount\":300000,\"type\":\"Income\",\"date\":\"2026-02-01T00:00:00\",\"description\":\"Salario 1ra quincena febrero\"}"
```

### 7. Crear Gasto (Comida)

```bash
curl -X POST http://localhost:5200/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d "{\"categoryId\":3,\"amount\":12500,\"type\":\"Expense\",\"date\":\"2026-02-03T20:30:00\",\"description\":\"Almuerzo Soda María\"}"
```

### 8. Obtener Todas las Transacciones

```bash
curl -X GET http://localhost:5200/api/transactions \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 9. Filtrar por Fecha

```bash
curl -X GET "http://localhost:5200/api/transactions?from=2026-02-01&to=2026-02-28" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 10. Obtener por ID

```bash
curl -X GET http://localhost:5200/api/transactions/1 \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 11. Actualizar Transacción

```bash
curl -X PUT http://localhost:5200/api/transactions/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d "{\"amount\":15000,\"description\":\"Almuerzo actualizado\"}"
```

### 12. Eliminar Transacción (Soft Delete)

```bash
curl -X DELETE http://localhost:5200/api/transactions/2 \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

## 🎯 Presupuestos

### 13. Crear Presupuesto Quincenal

```bash
curl -X POST http://localhost:5200/api/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d "{\"period\":\"Quincenal\",\"startDate\":\"2026-02-01T00:00:00\",\"items\":[{\"categoryId\":3,\"limitAmount\":50000},{\"categoryId\":5,\"limitAmount\":20000}]}"
```

### 14. Obtener Presupuesto Activo

```bash
curl -X GET http://localhost:5200/api/budgets/active \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

**Respuesta esperada:**
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
      "limitAmount": 50000,
      "spentAmount": 32500,
      "remainingAmount": 17500,
      "percentageUsed": 65.0
    }
  ]
}
```

### 15. Listar Todos los Presupuestos

```bash
curl -X GET http://localhost:5200/api/budgets \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 16. Actualizar Límite de Categoría en Presupuesto

```bash
curl -X PUT http://localhost:5200/api/budgets/1/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d "{\"limitAmount\":60000}"
```

### 17. Desactivar Presupuesto

```bash
curl -X PATCH http://localhost:5200/api/budgets/1/deactivate \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 18. Eliminar Presupuesto (Soft Delete)

```bash
curl -X DELETE http://localhost:5200/api/budgets/1 \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

## ✅ Flujo Completo en PowerShell

```powershell
# 1. Registrar usuario
$register = Invoke-RestMethod -Method Post -Uri "http://localhost:5200/api/auth/register" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"usuario@ejemplo.com","password":"Password123!","fullName":"Diego Rodriguez"}'

# 2. Login y obtener token
$login = Invoke-RestMethod -Method Post -Uri "http://localhost:5200/api/auth/login" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"usuario@ejemplo.com","password":"Password123!"}'

$token = $login.accessToken

# 3. Ver categorías
$categories = Invoke-RestMethod -Method Get -Uri "http://localhost:5200/api/categories" `
  -Headers @{"Authorization"="Bearer $token"}
$categories | ConvertTo-Json

# 4. Crear ingreso
$tx = Invoke-RestMethod -Method Post -Uri "http://localhost:5200/api/transactions" `
  -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} `
  -Body '{"categoryId":1,"amount":300000,"type":"Income","date":"2026-02-01T00:00:00","description":"Salario febrero"}'

# 5. Crear presupuesto quincenal
$budget = Invoke-RestMethod -Method Post -Uri "http://localhost:5200/api/budgets" `
  -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} `
  -Body '{"period":"Quincenal","startDate":"2026-02-01T00:00:00","items":[{"categoryId":3,"limitAmount":50000},{"categoryId":5,"limitAmount":20000}]}'

# 6. Ver presupuesto activo
$activeBudget = Invoke-RestMethod -Method Get -Uri "http://localhost:5200/api/budgets/active" `
  -Headers @{"Authorization"="Bearer $token"}
$activeBudget | ConvertTo-Json -Depth 5
```

---

## 📌 Referencia Rápida de Endpoints (18 total)

| Módulo | Método | Endpoint | Descripción |
|--------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/register` | Registrar usuario |
| | POST | `/api/auth/login` | Iniciar sesión |
| | POST | `/api/auth/refresh` | Refrescar token |
| **Categories** | GET | `/api/categories` | Listar todas |
| | GET | `/api/categories/by-type/{type}` | Filtrar por tipo |
| **Transactions** | GET | `/api/transactions` | Listar (filtros: from, to) |
| | GET | `/api/transactions/{id}` | Obtener por ID |
| | POST | `/api/transactions` | Crear |
| | PUT | `/api/transactions/{id}` | Actualizar |
| | DELETE | `/api/transactions/{id}` | Eliminar (soft) |
| **Budgets** | GET | `/api/budgets` | Listar todos |
| | GET | `/api/budgets/active` | Presupuesto activo |
| | GET | `/api/budgets/{id}` | Obtener por ID |
| | POST | `/api/budgets` | Crear |
| | PUT | `/api/budgets/{budgetId}/items/{itemId}` | Actualizar límite |
| | PATCH | `/api/budgets/{id}/deactivate` | Desactivar |
| | DELETE | `/api/budgets/{id}` | Eliminar (soft) |

> **Notas:** Montos en colones (₡). Fechas en ISO 8601. Soft delete = no se borra físicamente.

---

**🚀 API:** `http://localhost:5200` | **📚 Swagger:** `http://localhost:5200`
