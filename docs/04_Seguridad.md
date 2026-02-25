# 04 - Seguridad del sistema Ditsö

## 1. Autenticación JWT

- El backend configura autenticación JWT Bearer en `Program.cs`. Fuente: Ditso/Ditso.API/Program.cs.
- Se valida emisor, audiencia, expiración y firma (`ValidateIssuer`, `ValidateAudience`, `ValidateLifetime`, `ValidateIssuerSigningKey`). Fuente: Ditso/Ditso.API/Program.cs.
- La clave se obtiene de configuración `Jwt:SecretKey` y se usa `HmacSha256`. Fuente: Ditso/Ditso.API/Program.cs; Ditso/Ditso.Infrastructure/Services/AuthService.cs.
- Claims generados: `NameIdentifier`, `Email`, `Name`, `Role`. Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs.

## 2. Refresh tokens

- En login exitoso se emite `accessToken` + `refreshToken`. Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs.
- El refresh token se persiste en tabla `RefreshTokens` con expiración a 30 días (`ExpiresAt`) y estado de revocación (`IsRevoked`). Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs; Ditso/Ditso.Domain/Entities/RefreshToken.cs.
- En `/api/auth/refresh`, el token actual se revoca y se emite uno nuevo. Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs; Ditso/Ditso.API/Controllers/AuthController.cs.
- Existe índice único para evitar duplicidad de tokens. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 3. Protección de contraseñas

- Registro: hash de contraseña con BCrypt (`HashPassword`). Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs.
- Login/cambio de contraseña: validación con BCrypt (`Verify`). Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs.
- Cambio de contraseña actualiza hash en `User.PasswordHash`. Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs.

## 4. Autorización y control de acceso

- Endpoints protegidos con `[Authorize]` en controladores funcionales. Fuente: Ditso/Ditso.API/Controllers/TransactionsController.cs; Ditso/Ditso.API/Controllers/BudgetsController.cs; Ditso/Ditso.API/Controllers/CategoriesController.cs; Ditso/Ditso.API/Controllers/ReportsController.cs; Ditso/Ditso.API/Controllers/FinancialHealthController.cs; Ditso/Ditso.API/Controllers/FilesController.cs.
- Control de acceso por rol en módulo administrativo con `[Authorize(Roles = "Admin")]`. Fuente: Ditso/Ditso.API/Controllers/AdminController.cs.
- En múltiples endpoints se valida ownership por `UserId` extraído desde claim JWT. Fuente: Ditso/Ditso.API/Controllers/*.cs; Ditso/Ditso.Infrastructure/Services/TransactionService.cs; Ditso/Ditso.API/Controllers/FilesController.cs.

## 5. Seguridad de datos y consistencia

- Soft delete aplicado por `IsDeleted` + filtros globales para evitar exposición de datos eliminados. Fuente: Ditso/Ditso.Domain/Common/BaseEntity.cs; Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.
- `Transaction.RowVersion` usa control de concurrencia optimista. Fuente: Ditso/Ditso.Domain/Entities/Transaction.cs; Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 6. Auditoría

- Existe entidad `AuditLog` con `Action`, `EntityType`, `EntityId`, `UserId`, `Timestamp`. Fuente: Ditso/Ditso.Domain/Entities/AuditLog.cs.
- `AuthService` registra eventos de perfil y contraseña en `AuditLogs`. Fuente: Ditso/Ditso.Infrastructure/Services/AuthService.cs.
- Módulo Admin expone consulta de logs de auditoría. Fuente: Ditso/Ditso.API/Controllers/AdminController.cs.

## 7. Seguridad de archivos

- Carga de archivos restringida a tipos MIME: `image/jpeg`, `image/png`, `image/webp`, `image/heic`. Fuente: Ditso/Ditso.API/Controllers/FilesController.cs.
- Límite de tamaño: 10 MB (`RequestSizeLimit` y validación explícita). Fuente: Ditso/Ditso.API/Controllers/FilesController.cs.
- Descarga y eliminación sólo permitidas al propietario (`entity.UserId == userId`). Fuente: Ditso/Ditso.API/Controllers/FilesController.cs.

## 8. Seguridad en frontend

- Interceptor agrega `Authorization: Bearer <token>` automáticamente. Fuente: DitsoApp/src/services/apiClient.ts.
- Ante `401`, intenta refresh en `/auth/refresh`, reintenta petición y actualiza almacenamiento de tokens. Fuente: DitsoApp/src/services/apiClient.ts.
- Tokens se guardan en `AsyncStorage` o `localStorage` según plataforma. Fuente: DitsoApp/src/services/storage.ts; DitsoApp/src/services/authService.ts.

## 9. Hallazgos y pendientes

- CORS está abierto (`AllowAnyOrigin`, `AllowAnyMethod`, `AllowAnyHeader`), adecuado para desarrollo pero sensible para producción. Fuente: Ditso/Ditso.API/Program.cs.
- No se identificó política explícita de rotación/invalidación masiva de tokens ni blacklisting adicional fuera del flag `IsRevoked`. Pendiente por confirmar en el repositorio (archivo probable: servicio de autenticación adicional en `Ditso/Ditso.Infrastructure/Services/`).
