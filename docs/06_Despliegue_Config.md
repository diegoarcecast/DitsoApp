# 06 - Despliegue y configuración de Ditsö

## 1. Backend ASP.NET Core

## 1.1 Configuración base (`appsettings.json`)

Archivo con secciones:

- `Logging` (niveles por categoría).
- `ConnectionStrings:DefaultConnection` (SQL Server).
- `Jwt` (`SecretKey`, `Issuer`, `Audience`, `ExpireMinutes`).
- `AllowedHosts`.

Fuente: Ditso/Ditso.API/appsettings.json.

## 1.2 Variables y entorno de ejecución

- En `launchSettings.json` se define `ASPNETCORE_ENVIRONMENT=Development` para perfiles `http` y `https`. Fuente: Ditso/Ditso.API/Properties/launchSettings.json.
- Puertos de desarrollo: `http://localhost:5168` y `https://localhost:7067`. Fuente: Ditso/Ditso.API/Properties/launchSettings.json.

## 1.3 Registro de servicios y runtime

- `Program.cs` registra controladores, Swagger, EF Core SQL Server, autenticación JWT, autorización y CORS. Fuente: Ditso/Ditso.API/Program.cs.
- Logging configurado con Serilog a consola y archivo `logs/ditso-.txt` con rolling diario. Fuente: Ditso/Ditso.API/Program.cs.

## 1.4 Dependencias backend

- Framework target: `.NET 9` (`net9.0`). Fuente: Ditso/Ditso.API/Ditso.API.csproj.
- Paquetes relevantes: `Microsoft.AspNetCore.Authentication.JwtBearer`, `Swashbuckle`, `Serilog.AspNetCore`, `EFCore.Design`. Fuente: Ditso/Ditso.API/Ditso.API.csproj.

## 2. Base de datos

- Conexión con SQL Server via `UseSqlServer(ConnectionStrings:DefaultConnection)`. Fuente: Ditso/Ditso.API/Program.cs.
- Estructura de datos definida por EF Core (`DitsoDbContext`) y migraciones en `Ditso.Infrastructure/Data/Migrations`. Fuente: Ditso/Ditso.Infrastructure/Data/DitsoDbContext.cs; Ditso/Ditso.Infrastructure/Data/Migrations/*.
- Existen scripts SQL (`database_schema.sql`, `seed_categories.sql`) para apoyo de instalación/seed. Fuente: Ditso/database_schema.sql; Ditso/seed_categories.sql; database_schema.sql.

## 3. Frontend Expo/React Native

## 3.1 Configuración general

- Archivo `app.json` contiene metadatos de la app y plugins (ej. DateTimePicker). Fuente: DitsoApp/app.json.
- `package.json` define scripts de ejecución (`start`, `android`, `ios`, `web`) y dependencias. Fuente: DitsoApp/package.json.

## 3.2 Configuración de API

- `apiClient.ts` define `API_URL` por plataforma (web usa localhost, móvil usa IP local hardcodeada). Fuente: DitsoApp/src/services/apiClient.ts.
- Existe guía de red para uso con Tailscale o IP local en `CONFIGURACION_RED.md`. Fuente: DitsoApp/CONFIGURACION_RED.md.

## 4. Procedimiento de ejecución documentado en repositorio

- README raíz describe pasos: restaurar backend, configurar appsettings, correr migraciones y ejecutar API en `http://0.0.0.0:5200`. Fuente: README.md.
- README de frontend describe inicio Expo y conexión con backend. Fuente: DitsoApp/README.md.

## 5. Parámetros críticos para despliegue

- **JWT SecretKey**: obligatoria y de longitud suficiente (el ejemplo en repo es placeholder). Fuente: Ditso/Ditso.API/appsettings.json; Ditso/Ditso.API/Program.cs.
- **Connection string**: debe reemplazarse por servidor real. Fuente: Ditso/Ditso.API/appsettings.json.
- **CORS**: actualmente abierto para todos los orígenes; en producción debe restringirse. Fuente: Ditso/Ditso.API/Program.cs.
- **IP móvil**: `LOCAL_IP` requiere ajuste manual para entorno real de pruebas móviles. Fuente: DitsoApp/src/services/apiClient.ts.

## 6. Elementos no confirmados

- Pipeline CI/CD automatizado no identificado en el repositorio. Pendiente por confirmar en el repositorio (archivo probable: `.github/workflows/*` o scripts de despliegue).
- Contenerización (Dockerfile/compose) no identificada. Pendiente por confirmar en el repositorio (archivo probable: `Dockerfile` en raíz o en `Ditso/`).
