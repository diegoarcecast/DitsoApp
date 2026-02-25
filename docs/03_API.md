# 03 - Documentación de API REST de Ditsö

## 1. Convenciones generales

- Base route de controladores: `api/[controller]` (excepto `FinancialHealthController`, que usa `api/financial-health`). Fuente: Ditso/Ditso.API/Controllers/*.cs.
- Autenticación por JWT Bearer en endpoints protegidos con `[Authorize]`. Fuente: Ditso/Ditso.API/Controllers/*.cs; Ditso/Ditso.API/Program.cs.
- Serialización de enums como strings en JSON. Fuente: Ditso/Ditso.API/Program.cs.

## 2. Endpoints por módulo

## 2.1 Auth (`/api/auth`)

| Método | Ruta | Parámetros | Request body | Response | Auth | Archivo |
|---|---|---|---|---|---|---|
| POST | `/api/auth/login` | - | `LoginRequestDto { email, password }` | `LoginResponseDto { accessToken, refreshToken, user }` | No | `AuthController.Login` |
| POST | `/api/auth/register` | - | `RegisterRequestDto { email, password, fullName }` | `UserDto` (201) | No | `AuthController.Register` |
| POST | `/api/auth/refresh` | - | `string` con refresh token | `LoginResponseDto` | No | `AuthController.RefreshToken` |
| PUT | `/api/auth/profile` | - | `UpdateProfileRequestDto { fullName }` | `UserDto` | Sí | `AuthController.UpdateProfile` |
| PUT | `/api/auth/change-password` | - | `ChangePasswordRequestDto { currentPassword, newPassword, confirmPassword }` | `204 NoContent` | Sí | `AuthController.ChangePassword` |

Fuente: Ditso/Ditso.API/Controllers/AuthController.cs; Ditso/Ditso.Application/DTOs/Auth/*.cs.

## 2.2 Transactions (`/api/transactions`)

| Método | Ruta | Parámetros | Request body | Response | Auth | Archivo |
|---|---|---|---|---|---|---|
| GET | `/api/transactions` | Query: `from`, `to` (opcionales) | - | `IEnumerable<TransactionDto>` | Sí | `TransactionsController.GetAll` |
| GET | `/api/transactions/{id}` | Route: `id` | - | `TransactionDto` / 404 | Sí | `TransactionsController.GetById` |
| POST | `/api/transactions` | - | `CreateTransactionDto` | `TransactionDto` (201) | Sí | `TransactionsController.Create` |
| PUT | `/api/transactions/{id}` | Route: `id` | `UpdateTransactionDto` | `TransactionDto` | Sí | `TransactionsController.Update` |
| DELETE | `/api/transactions/{id}` | Route: `id` | - | `204 NoContent` / 404 | Sí | `TransactionsController.Delete` |

Fuente: Ditso/Ditso.API/Controllers/TransactionsController.cs; Ditso/Ditso.Application/DTOs/Transactions/TransactionDtos.cs.

## 2.3 Budgets (`/api/budgets`)

| Método | Ruta | Parámetros | Request body | Response | Auth | Archivo |
|---|---|---|---|---|---|---|
| GET | `/api/budgets` | - | - | `IEnumerable<BudgetDto>` | Sí | `BudgetsController.GetAll` |
| GET | `/api/budgets/suggested-distribution` | Query: `totalAmount` | - | `IEnumerable<SuggestedDistributionItemDto>` | Sí | `BudgetsController.GetSuggestedDistribution` |
| GET | `/api/budgets/active-categories` | Query: `type` (`Income`/`Expense`) | - | `IEnumerable<ActiveCategoryDto>` | Sí | `BudgetsController.GetActiveCategories` |
| GET | `/api/budgets/active` | - | - | `BudgetDto` / 404 | Sí | `BudgetsController.GetActive` |
| GET | `/api/budgets/{id}` | Route: `id` | - | `BudgetDto` / 404 | Sí | `BudgetsController.GetById` |
| POST | `/api/budgets` | - | `CreateBudgetDto` | `BudgetDto` (201) | Sí | `BudgetsController.Create` |
| PUT | `/api/budgets/{budgetId}/items/{itemId}` | Route: `budgetId`, `itemId` | `UpdateBudgetItemDto` | `BudgetDto` | Sí | `BudgetsController.UpdateItem` |
| PUT | `/api/budgets/{id}` | Route: `id` | `UpdateBudgetDto` | `BudgetDto` | Sí | `BudgetsController.UpdateBudget` |
| POST | `/api/budgets/{budgetId}/items` | Route: `budgetId` | `AddBudgetItemDto` | `BudgetDto` | Sí | `BudgetsController.AddItem` |
| DELETE | `/api/budgets/{budgetId}/items/{itemId}` | Route: `budgetId`, `itemId` | `RemoveBudgetItemDto` (body) | `BudgetDto` o `409` por reasignación faltante | Sí | `BudgetsController.RemoveItem` |
| PATCH | `/api/budgets/{id}/deactivate` | Route: `id` | - | `204 NoContent` / 404 | Sí | `BudgetsController.Deactivate` |
| DELETE | `/api/budgets/{id}` | Route: `id` | - | `204 NoContent` / 404 | Sí | `BudgetsController.Delete` |

Fuente: Ditso/Ditso.API/Controllers/BudgetsController.cs; Ditso/Ditso.Application/DTOs/Budgets/BudgetDtos.cs.

## 2.4 Categories (`/api/categories`)

| Método | Ruta | Parámetros | Request body | Response | Auth | Archivo |
|---|---|---|---|---|---|---|
| GET | `/api/categories` | - | - | lista de categorías (predefinidas + personalizadas) | Sí | `CategoriesController.GetAll` |
| GET | `/api/categories/by-type/{type}` | Route: `type` | - | lista filtrada por tipo | Sí | `CategoriesController.GetByType` |
| POST | `/api/categories` | - | `CreateCategoryRequest { name, type, icon? }` | categoría creada (201) | Sí | `CategoriesController.Create` |
| DELETE | `/api/categories/{id}` | Route: `id` | - | `204 NoContent` / error de validación | Sí | `CategoriesController.Delete` |

Fuente: Ditso/Ditso.API/Controllers/CategoriesController.cs.

## 2.5 Reports (`/api/reports`)

| Método | Ruta | Parámetros | Request body | Response | Auth | Archivo |
|---|---|---|---|---|---|---|
| GET | `/api/reports/summary` | Query: `startDate`, `endDate` | - | `PeriodReportDto` | Sí | `ReportsController.GetSummary` |
| GET | `/api/reports/monthly` | Query: `year` (opcional) | - | `List<MonthlyDataPointDto>` | Sí | `ReportsController.GetMonthly` |

Fuente: Ditso/Ditso.API/Controllers/ReportsController.cs; Ditso/Ditso.Application/DTOs/Reports/ReportDtos.cs.

## 2.6 Financial Health (`/api/financial-health`)

| Método | Ruta | Parámetros | Request body | Response | Auth | Archivo |
|---|---|---|---|---|---|---|
| GET | `/api/financial-health` | Query opcional: `startDate`, `endDate` | - | `FinancialHealthDto` | Sí | `FinancialHealthController.GetHealth` |

Fuente: Ditso/Ditso.API/Controllers/FinancialHealthController.cs; Ditso/Ditso.Application/DTOs/FinancialHealth/FinancialHealthDto.cs.

## 2.7 Files (`/api/files`)

| Método | Ruta | Parámetros | Request body | Response | Auth | Archivo |
|---|---|---|---|---|---|---|
| POST | `/api/files/upload` | - | `multipart/form-data` campo `file` | `FileUploadResponseDto` | Sí | `FilesController.Upload` |
| GET | `/api/files/{id}` | Route: `id` | - | binario del archivo / 404 | Sí | `FilesController.GetFile` |
| DELETE | `/api/files/{id}` | Route: `id` | - | `204 NoContent` / 404 | Sí | `FilesController.DeleteFile` |

Fuente: Ditso/Ditso.API/Controllers/FilesController.cs; Ditso/Ditso.Application/DTOs/Files/FileDtos.cs.

## 2.8 Admin (`/api/admin`)

> Todos los endpoints requieren rol `Admin`.

| Método | Ruta | Parámetros | Request body | Response | Auth | Archivo |
|---|---|---|---|---|---|---|
| GET | `/api/admin/audit-logs` | Query: `page`, `pageSize`, `action`, `userId` | - | listado paginado de auditoría | JWT + rol Admin | `AdminController.GetAuditLogs` |
| GET | `/api/admin/users` | - | - | listado de usuarios | JWT + rol Admin | `AdminController.GetAllUsers` |
| PUT | `/api/admin/users/{id}/role` | Route: `id` | `ChangeRoleRequest { role }` | mensaje de confirmación | JWT + rol Admin | `AdminController.ChangeUserRole` |
| PUT | `/api/admin/users/{id}/status` | Route: `id` | - | mensaje + estado | JWT + rol Admin | `AdminController.ToggleUserStatus` |

Fuente: Ditso/Ditso.API/Controllers/AdminController.cs.

## 3. Códigos de error observados

- `400 BadRequest`: validaciones de negocio/entrada (ej. tipo inválido, monto inválido, credenciales/estado). Fuente: Ditso/Ditso.API/Controllers/*.cs.
- `401 Unauthorized`: login inválido o refresh inválido/expirado. Fuente: Ditso/Ditso.API/Controllers/AuthController.cs; Ditso/Ditso.Infrastructure/Services/AuthService.cs.
- `404 NotFound`: recursos no encontrados (transacciones, presupuestos, archivos, categorías). Fuente: Ditso/Ditso.API/Controllers/*.cs.
- `409 Conflict`: eliminación de ítem de presupuesto con transacciones sin reasignación. Fuente: Ditso/Ditso.API/Controllers/BudgetsController.cs.
- `500`: errores no controlados en servicios/infraestructura. Fuente: Ditso/Ditso.API/Controllers/*.cs.
