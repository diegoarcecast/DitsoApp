# 📱 Conexión iPhone — Ditsö App

## ¿Por qué Tailscale?

En el proyecto anterior (`ProyectoTFG/FinanzasPersonalesMobile`) se usaba **Tailscale** para conectar el iPhone al backend. Se recomienda seguir usándolo.

### Ventajas
✅ Funciona desde **cualquier lugar** (no necesitas estar en la misma WiFi)  
✅ Conexión **segura y cifrada**  
✅ Funciona en **datos móviles (4G/5G)**  
✅ **No requiere configurar firewall o puertos**  
✅ Siempre usa la **misma IP** (ejemplo: `100.88.32.12`)

---

## 🚀 Configuración Paso a Paso

### 1. Instalar Tailscale

**En tu PC (Windows):**
1. Descarga: https://tailscale.com/download/windows
2. Instala, abre e inicia sesión

**En tu iPhone:**
1. Descarga **Tailscale** desde App Store
2. Inicia sesión con la **misma cuenta** que en tu PC
3. Activa la conexión

---

### 2. Obtener tu IP de Tailscale

**Opción A — Desde la app:**
- Click en el ícono de Tailscale (bandeja del sistema) → **"This Device"** → copia la IP

**Opción B — Desde PowerShell:**
```powershell
ipconfig | findstr "100\."
# Resultado ejemplo: 100.88.32.12
```

---

### 3. Actualizar apiClient.ts

Abre: `C:\Users\diego\OneDrive\Documents\ProyectoUniversidad\DitsoApp\src\services\apiClient.ts`

```typescript
// Línea 13 — Cambia por tu IP de Tailscale:
const TAILSCALE_IP = '100.88.32.12'; // ⚠️ CAMBIAR

// Línea 22 — Modo de conexión:
const CONNECTION_MODE = 'tailscale'; // ✅ Ya configurado
```

---

### 4. Reiniciar Expo

```powershell
cd C:\Users\diego\OneDrive\Documents\ProyectoUniversidad\DitsoApp

# Detén Expo si está corriendo (Ctrl+C), luego:
npm start -- --clear
```

---

### 5. Conectar iPhone

1. En Expo verás un **código QR**
2. Abre **Expo Go** en tu iPhone
3. Escanea el QR → la app abre automáticamente

---

### 6. Verificar Conexión

En los logs de la app deberías ver:
```
🔗 API URL: http://100.88.32.12:5200/api
📱 Plataforma: ios
🌐 Modo: tailscale
```

Prueba hacer **Login** con un usuario registrado. Si entra al Dashboard ✅

---

## 🔧 Alternativa: IP Local (Solo Misma WiFi)

```powershell
# 1. Obtén tu IP local
ipconfig
# Busca "IPv4 Address" de tu WiFi (ejemplo: 192.168.1.145)
```

En `apiClient.ts`:
```typescript
const LOCAL_IP = '192.168.1.145';
const CONNECTION_MODE = 'local';
```

> ⚠️ Tu iPhone debe estar en la **misma red WiFi** que tu PC. Si cambias de red, actualiza la IP.

---

## 🐛 Troubleshooting

| Error | Solución |
|-------|----------|
| `Network request failed` | Verifica que el backend esté corriendo (`http://localhost:5200`) y que Tailscale esté conectado en ambos dispositivos |
| `Could not connect to development server` | Verifica que Tailscale esté **activo** en el iPhone. Reinicia Expo con `npm start -- --clear` |
| Backend en puerto incorrecto | Corre el backend así: `dotnet run --project Ditso.API --urls "http://0.0.0.0:5200"` |

---

## 📊 Comparación de Opciones

| Método | Ventajas | Desventajas |
|--------|----------|-------------|
| **Tailscale** | ✅ Cualquier lugar<br>✅ IP fija<br>✅ Seguro | Requiere instalar Tailscale |
| **IP Local** | ✅ Sin instalación extra | Solo misma WiFi<br>IP puede cambiar |
| **Localhost** | ✅ Simple para web | Solo funciona en navegador |

> 💡 **Para la defensa del TFG se recomienda Tailscale** — funciona aunque no estés en la misma red que el evaluador.
