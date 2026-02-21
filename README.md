# Ditsö 🇨🇷

Aplicación de finanzas personales diseñada para la realidad costarricense (salarios quincenales).

## 📁 Estructura del Repositorio

```
DitsoApp/   → Frontend móvil (Expo / React Native / TypeScript)
Ditso/      → Backend API  (.NET 9 / Clean Architecture / SQL Server)
```

## 🚀 Cómo Ejecutar

### Backend

```powershell
cd Ditso
# 1. Configura tu appsettings.Development.json con tu connection string y JWT key
# 2. Crea la base de datos
dotnet ef database update --project Ditso.Infrastructure --startup-project Ditso.API
# 3. Corre el servidor
dotnet run --project Ditso.API --urls "http://0.0.0.0:5200"
```
> Swagger disponible en: `http://localhost:5200`

### Frontend

```powershell
cd DitsoApp
npm install
npm start
```
- `w` → Navegador
- Escanea el QR con **Expo Go** en tu iPhone

## 🔧 Configuración Local (Backend)

Crea el archivo `Ditso/Ditso.API/appsettings.Development.json` (no se sube a GitHub):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR\\SQLEXPRESS;Database=DitsoDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "SecretKey": "TU_CLAVE_SECRETA_DE_AL_MENOS_32_CARACTERES",
    "Issuer": "DitsoAPI",
    "Audience": "DitsoApp"
  }
}
```

## 📱 Pantallas

| Pantalla | Descripción |
|----------|-------------|
| Login / Registro | Autenticación con JWT |
| Dashboard | Resumen financiero del período |
| Transacciones | Lista, filtros y creación |
| Presupuesto | Presupuesto quincenal/mensual con semáforo |

## 🏗️ Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Expo 52, React Native, TypeScript |
| Backend | .NET 9, ASP.NET Core, Entity Framework Core |
| Base de Datos | SQL Server (LocalDB / SQL Express) |
| Autenticación | JWT (Access + Refresh tokens) |

## 🌟 Innovación Principal

Sistema de **presupuestos quincenales** — único en el mercado costarricense, diseñado para la forma en que realmente se cobran los salarios en Costa Rica.
