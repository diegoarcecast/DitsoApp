# Ditsö 🇨🇷 - Documentación Técnica y Manual de Instalación

Ditsö es una plataforma de finanzas personales diseñada para la realidad financiera costarricense, permitiendo una gestión presupuestaria adaptada a ciclos de pago quincenales y mensuales. Este proyecto se entrega como parte de un Trabajo Final de Graduación (TFG).

---

## 🔗 Repositorio Git
El código fuente completo (Monorepo) se encuentra disponible en GitHub:
**[https://github.com/diegoarcecast/DitsoApp](https://github.com/diegoarcecast/DitsoApp)**

---

## 📂 Estructura del Proyecto
```
ProyectoUniversidad/
├── Ditso/           → Backend (ASP.NET Core / .NET 9)
├── DitsoApp/        → Frontend (React Native / Expo)
└── database_schema.sql → Script SQL para creación de Base de Datos
```

---

## 🛠️ Requisitos Previos
* **Backend:** .NET 9 SDK, SQL Server (Express o LocalDB).
* **Frontend:** Node.js v18+, Expo Go (en dispositivo móvil).
* **IDE Recomendado:** VS Code con extensiones de C# y React Native.

---

## 📄 Base de Datos (Script SQL)
Para instalar la base de datos desde cero, utilice el archivo **`database_schema.sql`** incluido en la raíz del proyecto. Este script crea todas las tablas, relaciones, índices y una auditoría mediante triggers T-SQL.

---

## 🚀 Guía de Instalación y Ejecución

### 1. Preparación del Backend (.NET)
1. Navegue a la carpeta del backend:
   ```bash
   cd Ditso
   ```
2. Restaure las dependencias:
   ```bash
   dotnet restore
   ```
3. **Configuración Local:** Cree `Ditso.API/appsettings.Development.json` con sus credenciales:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=TU_SERVIDOR\\SQLEXPRESS;Database=DitsoDB;Trusted_Connection=True;TrustServerCertificate=True"
     },
     "Jwt": {
       "SecretKey": "TU_CLAVE_SECRETA_PERSONAL_32_CARACTERES",
       "Issuer": "DitsoAPI",
       "Audience": "DitsoApp"
     }
   }
   ```
4. Aplique las migraciones (opcional si usa el script SQL):
   ```bash
   dotnet ef database update --project Ditso.Infrastructure --startup-project Ditso.API
   ```
5. Inicie el servidor:
   ```bash
   dotnet run --project Ditso.API --urls "http://0.0.0.0:5200"
   ```

### 2. Preparación del Frontend (React Native)
1. Navegue a la carpeta del app:
   ```bash
   cd DitsoApp
   ```
2. Instale los paquetes del proyecto:
   ```bash
   npm install
   ```
3. Inicie el entorno de desarrollo:
   ```bash
   npx expo start
   ```
4. Escanee el código QR con la app **Expo Go** en su smartphone (conectado a la misma red Wifi).

---

## 🛡️ Características Implementadas (Cumplimiento TFG)
* **Seguridad:** Autenticación JWT con Access y Refresh Tokens. Hasheo de contraseñas con BCrypt.
* **Trazabilidad:** Sistema de Auditoría (AuditLog) integrado mediante Triggers T-SQL y Entity Framework.
* **Gestión Documental:** Módulo de adjuntos para comprobantes de transacciones (imágenes/fotos).
* **Reportería:** Análisis dinámico de gastos por período y evolución anual con gráficos nativos.
* **Arquitectura:** Clean Architecture con separación de responsabilidades (Domain, Application, Infrastructure, API).
* **Roles (RBAC):** Control de acceso administrativo para visualización de logs de auditoría y gestión de usuarios.

---

## 🧪 Verificación de Calidad
* **Backend:** `dotnet build` reporta 0 errores.
* **Frontend:** TypeScript `npx tsc --noEmit` reporta 0 errores.
* **Base de Datos:** Verificada contra SQL Server 2022 y Azure SQL.

---
© 2026 - Proyecto de Graduación. Desarrollado por Diego Arce.
