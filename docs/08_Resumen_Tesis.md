# 08 - Resumen técnico-académico para tesis (Ditsö)

## 1. Síntesis arquitectónica

El sistema Ditsö presenta una implementación por capas, compuesta por los proyectos `Domain`, `Application`, `Infrastructure` y `API`, lo que favorece la separación de responsabilidades y la mantenibilidad del software. La capa de dominio concentra entidades y reglas estructurales; la capa de aplicación define contratos y DTOs; infraestructura materializa persistencia y servicios; y la API expone capacidades mediante HTTP REST. Fuente: Ditso/Ditso.sln; Ditso/Ditso.Domain/Entities/*.cs; Ditso/Ditso.Application/Interfaces/*.cs; Ditso/Ditso.Infrastructure/Services/*.cs; Ditso/Ditso.API/Controllers/*.cs.

## 2. Implementación backend

El backend se desarrolló en ASP.NET Core (.NET 9), con inyección de dependencias para resolver servicios de autenticación, transacciones, presupuestos, reportes y salud financiera. Adicionalmente, se incorporaron Swagger para documentación de API, Serilog para trazabilidad de peticiones y EF Core para acceso a SQL Server. Fuente: Ditso/Ditso.API/Program.cs; Ditso/Ditso.API/Ditso.API.csproj; Ditso/Ditso.Infrastructure/Services/*.cs; Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs.

## 3. Modelo de datos y persistencia

La persistencia se estructura alrededor de entidades financieras y de control (`User`, `Transaction`, `Budget`, `Category`, `RefreshToken`, `File`, `AuditLog`, entre otras), con relaciones explícitas de propiedad y dependencias por claves foráneas. El modelo implementa soft delete, índices compuestos para consultas frecuentes y manejo automático de timestamps, elementos que fortalecen el control de ciclo de vida de los datos. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs; Ditso/Ditso.Domain/Common/BaseEntity.cs; Ditso/Ditso.Domain/Entities/*.cs.

## 4. Seguridad

La seguridad de Ditsö se fundamenta en autenticación JWT, uso de refresh tokens persistidos y revocables, hash de contraseñas con BCrypt y autorización basada en roles para capacidades administrativas. El sistema valida además ownership de recursos por usuario autenticado en múltiples operaciones y aplica restricciones de seguridad para carga de archivos (tipo MIME y tamaño máximo). Fuente: Ditso/Ditso.API/Program.cs; Ditso/Ditso.Infrastructure/Services/AuthService.cs; Ditso/Ditso.API/Controllers/AdminController.cs; Ditso/Ditso.API/Controllers/FilesController.cs.

## 5. Exposición de servicios (API)

La API REST cubre los dominios funcionales de autenticación, transacciones, presupuestos, categorías, reportes, salud financiera, archivos y administración. Los endpoints se estructuran mediante controladores especializados y devuelven respuestas tipadas a través de DTOs, con códigos HTTP diferenciados para validaciones de negocio, errores de autenticación y fallos del servidor. Fuente: Ditso/Ditso.API/Controllers/*.cs; Ditso/Ditso.Application/DTOs/**/*.cs.

## 6. Implementación frontend

El cliente móvil se implementa con Expo/React Native y TypeScript, con navegación híbrida Stack + Tabs, contexto de autenticación y servicios Axios para consumo de API. El diseño funcional incorpora pantallas para autenticación, gestión de transacciones, presupuestos, reportes, perfil y visualización de salud financiera, con validaciones de entrada en el cliente y recuperación de sesión mediante refresh token a nivel de interceptor HTTP. Fuente: DitsoApp/App.tsx; DitsoApp/src/navigation/AppNavigator.tsx; DitsoApp/src/contexts/AuthContext.tsx; DitsoApp/src/services/*.ts; DitsoApp/src/screens/*.tsx.

## 7. Validación y estado de pruebas

El repositorio documenta procedimientos de verificación manual de API, principalmente orientados a flujos CRUD y autenticación. No se evidencia una suite automatizada de pruebas unitarias o de integración dentro del código inspeccionado. En términos metodológicos, esto sugiere una línea de mejora para robustecer aseguramiento de calidad en fases posteriores. Fuente: Ditso/PRUEBAS_API.md; Ditso/ESTADO_BACKEND.md; salida de `rg --files | rg -i 'test|prueba|spec|xunit|nunit'`.

## 8. Consideraciones de cierre

Con base exclusivamente en la evidencia de código disponible, Ditsö constituye una solución integral de gestión financiera personal con enfoque en presupuestación por períodos, control transaccional y seguridad de acceso. Como aspectos pendientes para consolidación académica y productiva se identifican: automatización de pruebas, eventual endurecimiento de políticas CORS en producción y formalización de procesos CI/CD. Fuente: Ditso/Ditso.API/Program.cs; Ditso/PRUEBAS_API.md; Ditso/ESTADO_BACKEND.md.
