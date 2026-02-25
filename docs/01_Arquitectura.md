# 01 - Arquitectura del sistema Ditsö

## 1. Mapa inicial del repositorio (archivos relevantes)

```text
/workspace/DitsoApp
├── Ditso/                                   (backend .NET)
│   ├── Ditso.API/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── TransactionsController.cs
│   │   │   ├── BudgetsController.cs
│   │   │   ├── CategoriesController.cs
│   │   │   ├── ReportsController.cs
│   │   │   ├── FinancialHealthController.cs
│   │   │   ├── FilesController.cs
│   │   │   └── AdminController.cs
│   ├── Ditso.Application/
│   │   ├── Interfaces/
│   │   └── DTOs/
│   ├── Ditso.Domain/
│   │   ├── Entities/
│   │   ├── Enums/
│   │   └── Common/BaseEntity.cs
│   ├── Ditso.Infrastructure/
│   │   ├── Data/DitsoDbContext.cs
│   │   ├── Data/Migrations/
│   │   └── Services/
│   ├── database_schema.sql
│   └── PRUEBAS_API.md
├── DitsoApp/                                (frontend Expo/React Native)
│   ├── App.tsx
│   ├── app.json
│   └── src/
│       ├── navigation/AppNavigator.tsx
│       ├── contexts/AuthContext.tsx
│       ├── screens/
│       ├── services/
│       ├── components/
│       ├── theme/
│       └── types/index.ts
└── database_schema.sql
```

Fuente: salida del comando `find . -maxdepth 4 ... -type f -print | sort` ejecutado en la raíz del repositorio.

## 2. Tipo de arquitectura identificada

El backend implementa una arquitectura por capas con separación explícita en proyectos `Ditso.Domain`, `Ditso.Application`, `Ditso.Infrastructure` y `Ditso.API`. Fuente: Ditso/Ditso.sln; Ditso/Ditso.API/Ditso.API.csproj; Ditso/Ditso.Application/Ditso.Application.csproj; Ditso/Ditso.Infrastructure/Ditso.Infrastructure.csproj; Ditso/Ditso.Domain/Ditso.Domain.csproj.

## 3. Capas y responsabilidades

### 3.1 Capa Domain

Define entidades de negocio (`User`, `Transaction`, `Budget`, `Category`, `RefreshToken`, `AuditLog`, etc.), enumeraciones (`UserRole`, `TransactionType`, `BudgetPeriod`) y atributos comunes (`BaseEntity`). Fuente: Ditso/Ditso.Domain/Entities/*.cs; Ditso/Ditso.Domain/Enums/*.cs; Ditso/Ditso.Domain/Common/BaseEntity.cs.

### 3.2 Capa Application

Define contratos de servicios (`IAuthService`, `ITransactionService`, `IBudgetService`, `IReportService`, `IFinancialHealthService`) y DTOs de entrada/salida para API. Fuente: Ditso/Ditso.Application/Interfaces/*.cs; Ditso/Ditso.Application/DTOs/**/*.cs.

### 3.3 Capa Infrastructure

Implementa el acceso a datos mediante `DitsoDbContext` (Entity Framework Core) y la lógica de servicios (`AuthService`, `TransactionService`, `BudgetService`, `ReportService`, `FinancialHealthService`). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs; Ditso/Ditso.Infrastructure/Services/*.cs.

### 3.4 Capa API

Expone endpoints REST con controladores ASP.NET Core, configura DI, autenticación JWT, CORS, Swagger y logging con Serilog en `Program.cs`. Fuente: Ditso/Ditso.API/Program.cs; Ditso/Ditso.API/Controllers/*.cs.

### 3.5 Frontend móvil

Aplicación Expo/React Native con navegación Stack + Tabs, contexto de autenticación y servicios HTTP en Axios para consumir la API del backend. Fuente: DitsoApp/App.tsx; DitsoApp/src/navigation/AppNavigator.tsx; DitsoApp/src/contexts/AuthContext.tsx; DitsoApp/src/services/*.ts.

## 4. Dependencias entre capas

- `Ditso.API` referencia `Ditso.Application` y `Ditso.Infrastructure`. Fuente: Ditso/Ditso.API/Ditso.API.csproj.
- `Ditso.Infrastructure` depende de `Ditso.Application` (interfaces/DTOs) y `Ditso.Domain` (entidades). Fuente: Ditso/Ditso.Infrastructure/Services/*.cs; Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Ditso.Application` define contratos sin implementación de persistencia. Fuente: Ditso/Ditso.Application/Interfaces/*.cs.
- `Ditso.Domain` mantiene objetos de dominio sin dependencias a ASP.NET Core. Fuente: Ditso/Ditso.Domain/Entities/*.cs.

## 5. Flujo de datos (backend)

1. Cliente HTTP invoca endpoint en un Controller. Fuente: Ditso/Ditso.API/Controllers/*.cs.
2. Controller extrae `userId` desde claims JWT cuando aplica. Fuente: Ditso/Ditso.API/Controllers/AuthController.cs; Ditso/Ditso.API/Controllers/TransactionsController.cs; Ditso/Ditso.API/Controllers/BudgetsController.cs.
3. Controller delega en interfaz de aplicación inyectada por DI. Fuente: Ditso/Ditso.API/Program.cs; Ditso/Ditso.API/Controllers/*.cs.
4. Servicio de infraestructura ejecuta reglas de negocio y acceso EF Core. Fuente: Ditso/Ditso.Infrastructure/Services/*.cs.
5. `DitsoDbContext` persiste/consulta entidades SQL Server y aplica filtros globales `IsDeleted`. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
6. Controller retorna DTO/resultado HTTP (`Ok`, `Created`, `NoContent`, etc.). Fuente: Ditso/Ditso.API/Controllers/*.cs.

## 6. Middleware y pipeline

- Logging de solicitudes con `UseSerilogRequestLogging`. Fuente: Ditso/Ditso.API/Program.cs.
- CORS política `AllowAll`. Fuente: Ditso/Ditso.API/Program.cs.
- Middleware de autenticación/autorización JWT (`UseAuthentication`, `UseAuthorization`). Fuente: Ditso/Ditso.API/Program.cs.
- Mapeo de controladores con `MapControllers()`. Fuente: Ditso/Ditso.API/Program.cs.

## 7. Observaciones de arquitectura

- Existe serialización de enums como string para JSON. Fuente: Ditso/Ditso.API/Program.cs.
- No se identificó en el código un middleware global de excepciones custom; el manejo de errores está en controladores (`try/catch`). Pendiente por confirmar en el repositorio (archivo probable: `Ditso/Ditso.API/Middleware/*` o equivalente).
