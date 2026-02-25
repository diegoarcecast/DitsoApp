# 02 - Modelo de datos de Ditsö

## 1. Tecnología y contexto

El modelo de datos se implementa con Entity Framework Core (`DbContext`) y SQL Server (`UseSqlServer`). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs; Ditso/Ditso.API/Program.cs.

## 2. Entidades y tablas identificadas

Las siguientes entidades están mapeadas en `DitsoDbContext` como `DbSet`: `Users`, `RefreshTokens`, `Categories`, `Transactions`, `Budgets`, `BudgetItems`, `Debts`, `Goals`, `Files`, `AuditLogs`. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 3. Campos principales por entidad

- **User**: `Email`, `PasswordHash`, `FullName`, `Role`, `IsActive` + campos base (`Id`, `CreatedAt`, `UpdatedAt`, `IsDeleted`). Fuente: Ditso/Ditso.Domain/Entities/User.cs; Ditso/Ditso.Domain/Common/BaseEntity.cs.
- **RefreshToken**: `UserId`, `Token`, `ExpiresAt`, `IsRevoked`, `CreatedAt`. Fuente: Ditso/Ditso.Domain/Entities/RefreshToken.cs.
- **Category**: `UserId`, `Name`, `Icon`, `Type`. Fuente: Ditso/Ditso.Domain/Entities/Category.cs.
- **Transaction**: `UserId`, `CategoryId`, `Amount`, `Type`, `Date`, `Description`, `FileId`, `RowVersion`, `IsExtraIncome`. Fuente: Ditso/Ditso.Domain/Entities/Transaction.cs.
- **Budget**: `UserId`, `Name`, `Period`, `StartDate`, `EndDate`, `IsActive`, `TotalAmount`. Fuente: Ditso/Ditso.Domain/Entities/Budget.cs.
- **BudgetItem**: `BudgetId`, `CategoryId`, `LimitAmount`, `IsIncome`, `IsSystemCategory`. Fuente: Ditso/Ditso.Domain/Entities/BudgetItem.cs.
- **Debt**: `UserId`, `Name`, `TotalAmount`, `PendingBalance`, `InterestRate`, `MonthlyPayment`, `NextDueDate`, `Creditor`. Fuente: Ditso/Ditso.Domain/Entities/Debt.cs.
- **Goal**: `UserId`, `Name`, `TargetAmount`, `CurrentAmount`, `TargetDate`, `Description`. Fuente: Ditso/Ditso.Domain/Entities/Goal.cs.
- **File**: `UserId`, `FileName`, `FilePath`, `FileSize`, `MimeType`, `UploadedAt`. Fuente: Ditso/Ditso.Domain/Entities/File.cs.
- **AuditLog**: `UserId`, `Action`, `EntityType`, `EntityId`, `Details`, `Timestamp`. Fuente: Ditso/Ditso.Domain/Entities/AuditLog.cs.

## 4. Claves primarias

Todas las entidades modeladas poseen PK sobre `Id`. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 5. Claves foráneas y relaciones

- `RefreshToken.UserId -> Users.Id` (cascade). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Category.UserId -> Users.Id` (nullable, cascade). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Transaction.UserId -> Users.Id` (NoAction). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Transaction.CategoryId -> Categories.Id` (NoAction). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Transaction.FileId -> Files.Id` (nullable, NoAction). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Budget.UserId -> Users.Id` (cascade). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `BudgetItem.BudgetId -> Budgets.Id` (cascade). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `BudgetItem.CategoryId -> Categories.Id` (NoAction). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Debt.UserId -> Users.Id` (cascade). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Goal.UserId -> Users.Id` (cascade). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `File.UserId -> Users.Id` (cascade). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `AuditLog.UserId -> Users.Id` (SetNull). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 6. Restricciones y reglas de esquema

- `Users.Email` requerido, longitud 255, índice único filtrado por `IsDeleted = 0`. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Users.PasswordHash` requerido, longitud 512. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Categories.Name` requerido (100), `Icon` requerido (50), `Type` enum como string. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Transactions.Amount` decimal(18,2), `Description` hasta 500, `RowVersion` para concurrencia, `IsExtraIncome` default false. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `BudgetItem.LimitAmount` decimal(18,2), `IsIncome` default false, `IsSystemCategory` default false. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Debts.InterestRate` decimal(5,2) y montos monetarios decimal(18,2). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Files.FilePath` requerido (500), `FileName` requerido (255), `MimeType` requerido (100). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `AuditLog.Action` y `EntityType` requeridos (100), `Details` hasta 1000. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 7. Índices relevantes

- `Transactions(UserId, Date)` y `Transactions(UserId, CategoryId)` filtrados por `IsDeleted = 0`. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Budgets(UserId, IsActive)` filtrado por `IsDeleted = 0`. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `RefreshTokens.Token` índice único. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `AuditLogs(UserId, Timestamp)` para consulta administrativa. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 8. Soft delete y timestamps

- Entidades heredadas de `BaseEntity` tienen `IsDeleted`, `CreatedAt`, `UpdatedAt`. Fuente: Ditso/Ditso.Domain/Common/BaseEntity.cs.
- El contexto aplica filtros globales para ocultar registros `IsDeleted = true` en entidades principales. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `SaveChanges`/`SaveChangesAsync` actualizan timestamps automáticamente. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 9. Datos semilla

Se insertan categorías predefinidas (incluida categoría de sistema "Ingresos Adicionales" con Id 9). Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
