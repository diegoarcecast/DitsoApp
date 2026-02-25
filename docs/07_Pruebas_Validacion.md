# 07 - Pruebas y validación de Ditsö

## 1. Evidencia de pruebas existente en el repositorio

- Se identificó un documento de pruebas manuales de API con ejemplos `curl` y flujo PowerShell (`PRUEBAS_API.md`). Fuente: Ditso/PRUEBAS_API.md.
- Se identificó documentación de estado backend con validaciones funcionales y pendientes (`ESTADO_BACKEND.md`). Fuente: Ditso/ESTADO_BACKEND.md.

## 2. Tipo de pruebas observadas

## 2.1 Pruebas manuales de API

El repositorio contiene casos manuales para:

- Registro/login/refresh.
- CRUD de transacciones.
- CRUD de presupuestos.
- Consulta de categorías.

Fuente: Ditso/PRUEBAS_API.md.

## 2.2 Pruebas automatizadas

No se identificaron proyectos de pruebas automáticas (`xUnit`, `NUnit`, `MSTest`, `Jest`, etc.) en el árbol de archivos analizado. Fuente: salida de `rg --files | rg -i 'test|prueba|spec|xunit|nunit'`.

## 3. Validaciones de entrada y negocio (backend)

### 3.1 Autenticación

- Login falla con credenciales inválidas o usuario inactivo. Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs.
- Registro valida unicidad de email. Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs; Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- Cambio de contraseña valida contraseña actual. Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs.

### 3.2 Presupuestos

- `totalAmount` debe ser mayor a 0 en distribución sugerida. Fuente: Ditso/Ditso.API/Controllers/BudgetsController.cs.
- `type` en categorías activas sólo admite `Income` o `Expense`. Fuente: Ditso/Ditso.API/Controllers/BudgetsController.cs.
- No permite crear transacciones sin presupuesto activo o con categoría fuera del presupuesto activo. Fuente: Ditso/Ditso.Infrastructure/Services/TransactionService.cs.
- Eliminación de ítem con transacciones exige `ReassignToCategoryId`; de lo contrario, retorna conflicto. Fuente: Ditso/Ditso.Infrastructure/Services/BudgetService.cs; Ditso/Ditso.API/Controllers/BudgetsController.cs.

### 3.3 Categorías

- Tipo de categoría validado por enum.
- Evita duplicados por nombre/tipo para contexto de usuario/predefinidas.
- Impide eliminar categorías con transacciones asociadas.

Fuente: Ditso/Ditso.API/Controllers/CategoriesController.cs.

### 3.4 Archivos

- Valida archivo no vacío, tamaño máximo 10MB, MIME permitido.
- Valida ownership para descarga/eliminación.

Fuente: Ditso/Ditso.API/Controllers/FilesController.cs.

## 4. Manejo de errores

- Controladores implementan `try/catch` y retornan mensajes estructurados (`message`) para `400`, `401`, `404`, `409`, `500`. Fuente: Ditso/Ditso.API/Controllers/*.cs.
- Logging de errores y eventos funcionales mediante `ILogger` y Serilog request logging. Fuente: Ditso/Ditso.API/Controllers/*.cs; Ditso/Ditso.API/Program.cs.

## 5. Validaciones de modelo

- DTO `UpdateProfileRequestDto` usa `[Required]` y `[MaxLength]`.
- DTO `ChangePasswordRequestDto` usa `[Required]`, `[MinLength]`, `[Compare]`.

Fuente: Ditso/Ditso.Application/DTOs/Auth/ProfileDtos.cs.

## 6. Validaciones frontend

- Formularios en pantallas realizan controles de montos, fechas y selección de categoría antes de enviar a backend. Fuente: DitsoApp/src/screens/TransactionsScreen.tsx; DitsoApp/src/screens/BudgetOnboardingScreen.tsx; DitsoApp/src/screens/BudgetEditScreen.tsx.
- Manejo de errores de red mediante interceptor Axios y mensajes de UI. Fuente: DitsoApp/src/services/apiClient.ts; DitsoApp/src/screens/*.tsx.

## 7. Brechas observadas

- No hay suite automatizada de pruebas unitarias/integración/E2E en el código actual. Pendiente por confirmar en el repositorio (archivo probable: proyectos `*.Tests` o carpeta `tests/`).
- No se identificó evidencia de pipeline de validación automática de calidad (CI). Pendiente por confirmar en el repositorio (archivo probable: `.github/workflows/*`).
