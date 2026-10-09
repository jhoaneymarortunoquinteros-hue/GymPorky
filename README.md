# 🐷 PorkyGym — Guía del equipo

Plataforma de gestión de gimnasio.
**Backend:** Django 5 + Django REST Framework · **Frontend:** React + Vite · **BD:** PostgreSQL

Este README explica: instalación, acceso por IP local, variables de entorno,
subida a GitHub y cómo dejarlo listo para producción.

---

## 1. Estructura del proyecto

```
proys1-beta32/
├── .env.example                # Plantilla de variables de entorno  ✅ se sube a Git
├── .env.production.example     # Plantilla para producción           ✅ se sube a Git
├── .gitignore                  # Qué NO se sube                      ✅ se sube a Git
├── README.md                   # Este archivo                        ✅ se sube a Git
│
├── Backend/
│   ├── manage.py
│   ├── requirements.txt        # Dependencias de Python (con versiones fijadas)
│   ├── .env                    # TU configuración local             ❌ NUNCA se sube
│   ├── porkygym_backend/
│   │   ├── settings.py         # Configuración (dotenv, hosts, CORS, SSL)
│   │   └── urls.py             # Rutas raíz        ⚠️ no modificar sin avisar
│   ├── api/                    # Lógica de la API   ⚠️ no modificar sin avisar
│   └── venv/                   # Entorno virtual    ❌ NUNCA se sube
│
└── Fronted/                    # Frontend React + Vite (ojo: se llama "Fronted")
    ├── .env                    # Variables del frontend             ❌ NUNCA se sube
    ├── .env.example            # Plantilla del frontend             ✅ se sube a Git
    └── src/
```

**Regla de oro:** los archivos `.env` son personales. Los `.env.example` son
públicos. `settings.py` ya no guarda secretos: todo sale de variables de entorno.

---

## 2. Requisitos

| Herramienta | Versión mínima | Comprobar |
|---|---|---|
| Python | 3.10+ (probado con 3.10 y 3.14) | `python --version` |
| PostgreSQL | 13+ | `psql --version` |
| Node.js / npm | 18+ | `node --version` |
| Git | 2.x | `git --version` |

---

## 3. Backend — primera instalación

### Windows (PowerShell)

```powershell
cd Backend

# 1) Entorno virtual (solo la primera vez; si ya existe la carpeta venv, omite)
python -m venv venv

# 2) Activarlo
.\venv\Scripts\Activate.ps1

# 3) Dependencias
pip install -r requirements.txt

# 4) Tu archivo de configuración local (no se sube a Git)
copy ..\.env.example .env

# 5) Generar TU secret key y pegarla en Backend\.env (clave SECRET_KEY)
python -c "from django.core.security import get_random_secret_key; print(get_random_secret_key())"

# 6) Base de datos
python manage.py migrate

# 7) Verificar que todo carga
python manage.py check          # debe decir: "System check identified no issues (0 silenced)."

# 8) Arrancar escuchando en TODAS las interfaces (localhost + IP local)
python manage.py runserver 0.0.0.0:8000
```

<details>
<summary>Linux / macOS</summary>

```bash
cd Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
python -c "from django.core.security import get_random_secret_key; print(get_random_secret_key())"
python manage.py migrate
python manage.py check
python manage.py runserver 0.0.0.0:8000
```
</details>

> ⚠️ Si PowerShell bloquea la activación:
> `Set-ExecutionPolicy -Scope Process RemoteSigned`

**¿Por qué `0.0.0.0:8000`?** Porque `runserver` (sin argumentos) solo escucha
en `127.0.0.1`, es decir, solo en tu propia máquina. Con `0.0.0.0` el servidor
acepta conexiones desde cualquier IP de la red local.

Comprobación rápida: abre <http://127.0.0.1:8000/admin/>

---

## 4. Frontend

```powershell
cd Fronted
npm install
npm run dev
```

`npm run dev` ya está configurado con `--host=0.0.0.0 --port=3000`, así que el
frontend se puede abrir desde otra PC en `http://TU_IP:3000`.

### La variable `VITE_API_URL` (muy importante)

El frontend necesita saber **a qué backend llamar**:

| Situación | `VITE_API_URL` en `Fronted/.env` |
|---|---|
| Frontend y backend en la **misma máquina** | no hace falta definirla (usa `http://127.0.0.1:8000/api`) |
| Abres el frontend **desde otra PC** | `http://IP_DEL_BACKEND:8000/api` |

Crear/editar `Fronted/.env`:

```dotenv
VITE_API_URL=http://192.168.1.10:8000/api
```

> Vite lee los `.env` **al arrancar**: después de cambiarlo hay que reiniciar
> `npm run dev`. Usa la IP de la máquina que levanta el backend, no la tuya.

### Escenario completo en la red local

| Desde | Frontend | Backend | Backend levantado con |
|---|---|---|---|
| La misma PC | <http://localhost:3000> | <http://127.0.0.1:8000> | `runserver 0.0.0.0:8000` |
| Otra PC | <http://192.168.1.10:3000> | <http://192.168.1.10:8000> | `runserver 0.0.0.0:8000` |

### Obtener tu IP local

```powershell
# Windows
ipconfig          # "IPv4 Address"  -> 192.168.x.x
```
```bash
# Linux
ip a             # o: hostname -I
# macOS
ipconfig getifaddr en0
```

### Abrir el puerto en el firewall (Windows, solo la 1.ª vez)

```powershell
netsh advfirewall firewall add rule name="PorkyGym Django 8000" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="PorkyGym Vite 3000"   dir=in action=allow protocol=TCP localport=3000
```

---

## 5. Variables de entorno

Se definen en `Backend/.env` (desarrollo) y se leen en `settings.py` con
`python-dotenv`. Copia siempre desde `.env.example`.

| Variable | Obligatoria | Desarrollo | Producción | Descripción |
|---|---|---|---|---|
| `SECRET_KEY` | **Sí** | clave propia | clave **distinta** y larga | Firma de sesiones/tokens. Si se filtra, rótala. |
| `DEBUG` | No | `True` | `False` | `True` muestra errores detallados (nunca en producción). |
| `ALLOWED_HOSTS` | No | `*` | `tu-dominio.com` | Hosts válidos. `*` = cualquier IP (dev). Prohibido en prod. |
| `CORS_ALLOW_ALL_ORIGINS` | No | `True` | `False` | Permite llamadas desde cualquier origen (IP local incluida). |
| `CORS_ALLOWED_ORIGINS` | No | lista local | `https://tu-dominio.com` | Se usa solo si lo anterior es `False`. Comas. |
| `CSRF_TRUSTED_ORIGINS` | No | `http://localhost:3000,...` | `https://tu-dominio.com` | Orígenes de confianza para el admin. Con esquema. |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | **Sí** | tus datos locales | credenciales fuertes | PostgreSQL. |
| `DB_HOST` / `DB_PORT` | No | `localhost` / `5432` | según servidor | Conexión a la BD. |
| `FRONTEND_URL` | No | `http://localhost:3000` | `https://tu-dominio.com` | Enlaces de recuperación de contraseña. |
| `BREVO_API_KEY` | No | clave dev | clave prod | Correos de recuperación (API de Brevo). |
| `BREVO_SENDER_EMAIL` | No | tu correo | `no-reply@dominio.com` | Remitente. |
| `SECURE_SSL_REDIRECT` | No | `False` | `True` | Redirige todo a HTTPS. |
| `SESSION_COOKIE_SECURE` / `CSRF_COOKIE_SECURE` | No | `False` | `True` | Cookies solo por HTTPS. |
| `SECURE_HSTS_SECONDS` | No | `0` | `31536000` | "Solo HTTPS" en el navegador (1 año). |
| `SECURE_PROXY_SSL_HEADER` | No | `False` | `True` solo con Nginx delante | Indica a Django que confíe en `X-Forwarded-Proto`. |
| `SECURE_HSTS_INCLUDE_SUBDOMAINS` / `SECURE_HSTS_PRELOAD` | No | `False` | `True` (si aplica) | HSTS avanzado. `False` si algún subdominio no tiene HTTPS. |

Frontend (`Fronted/.env`):

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_API_URL` | No | URL base de la API. Ej.: `http://192.168.1.10:8000/api` |

---

## 6. Producción

> 📖 **Guía completa paso a paso:** [`deploy/README.md`](deploy/README.md)
> (Nginx + certbot + Gunicorn + systemd + backups + actualizaciones).
>
> Archivos de soporte:
> | Archivo | Para qué |
> |---|---|
> | `deploy/gunicorn.conf.py` | Servidor WSGI (bind, workers, logs) |
> | `deploy/porkygym.service` | Servicio de systemd (`systemctl restart porkygym`) |
> | `deploy/nginx-porkygym.conf` | Proxy inverso, HTTPS y estáticos |
> | `.env.production.example` | Plantilla de variables de producción |

### 1. Configurar el entorno

```powershell
copy .env.production.example Backend\.env
notepad Backend\.env        # rellena TODOS los valores REALES
```

### 2. Verificar antes de publicar

```powershell
cd Backend
python manage.py check --deploy    # debe quedar SIN warnings
python manage.py migrate
python manage.py collectstatic --noinput
```

### Checklist de seguridad

- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` nueva, larga y distinta a la de desarrollo
- [ ] `ALLOWED_HOSTS` solo con dominios reales (**sin `*`**)
- [ ] `CORS_ALLOW_ALL_ORIGINS=False` + orígenes reales en `CORS_ALLOWED_ORIGINS`
- [ ] `CSRF_TRUSTED_ORIGINS` con `https://` y el dominio exacto
- [ ] Credenciales de PostgreSQL fuertes (nada de `postgres/postgres`)
- [ ] HTTPS activo y bloque `SECURE_*` completo
- [ ] `python manage.py check --deploy` → **0 warnings**
- [ ] `Backend/.env` fuera de Git y con permisos restrictivos (`chmod 600 Backend/.env`)
- [ ] Copia de seguridad de la base de datos programada

### Arrancar con Gunicorn (Linux)

```bash
cd Backend
source venv/bin/activate
pip install gunicorn
gunicorn porkygym_backend.wsgi:application --bind 127.0.0.1:8000 --workers 3
```

Detrás de **Nginx** (que termina el HTTPS) hay que poner
`SECURE_PROXY_SSL_HEADER=True` en el `.env` del servidor; si no, Django
redirigiría en bucle. Como alternativa a Gunicorn en Windows, se puede usar
`python manage.py runserver 0.0.0.0:8000 --insecure` solo para pruebas.

---

## 7. Git y GitHub

### Reglas de oro

1. **Nunca** hagas `git add .` a ciegas: mira `git status` primero.
2. `.env`, `venv/`, `__pycache__/`, `*.sqlite3`, `node_modules/` → **jamás**.
3. Los `.env.example` y `.env.production.example` → **siempre**.
4. Si un secreto se llega a subir, borrar el `.gitignore` **no** lo borra del
   historial: hay que **rotar esa clave/contraseña** y limpiar el historial.

### Integración continua (GitHub Actions)

`.github/workflows/ci.yml` se ejecuta solo en **cada push y cada Pull Request** y deja el check en verde/rojo:

| Job | Qué valida |
|---|---|
| **Backend · Django** | `manage.py check`, `makemigrations --check` (sin migraciones pendientes), `migrate` en una PostgreSQL 16 efímera y `manage.py test` |
| **Frontend · Vite + TypeScript** | `npm ci`, `npm run lint` (`tsc --noEmit`) y `npm run build` |

- **En CI no existe ningún `.env`**: las variables mínimas se inyectan con valores ficticios dentro del workflow (por eso `settings.py` solo exige lo que está documentado en `.env.example`).
- Si el workflow queda en rojo, **no se hace merge**.
- El estado se ve en la pestaña **Actions** del repositorio.

### Primer push

```powershell
git init
git add .
git status          # revisa: NO debe aparecer ningún .env ni venv/
git commit -m "Config: python-dotenv, hosts/CORS por IP local, .gitignore"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### Clonar (compañeros)

```powershell
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO\Backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy ..\.env.example .env        # luego editar con tus datos
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

---

## 8. Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `Bad Request (400)` / `Invalid HTTP_HOST header` | La IP no está en `ALLOWED_HOSTS` | Pon `ALLOWED_HOSTS=*` en `Backend/.env` y **reinicia** el servidor |
| `ImproperlyConfigured: Falta la variable 'X'` | No existe `Backend/.env` | `copy ..\.env.example .env` y rellénalo |
| El navegador bloquea con `No 'Access-Control-Allow-Origin'` | CORS no abierto o servidor desactualizado | `CORS_ALLOW_ALL_ORIGINS=True` y reinicia `runserver` |
| Funciona en tu PC, pero en otra "falla el login" | Frontend apunta a `127.0.0.1` | Define `VITE_API_URL=http://IP_BACKEND:8000/api` en `Fronted/.env` y reinicia `npm run dev` |
| `ModuleNotFoundError: No module named 'dotenv'` | Dependencias sin instalar | `pip install -r requirements.txt` |
| `django.db.utils.OperationalError` / `could not connect` | PostgreSQL caído o credenciales mal | Revisa `DB_*` en `Backend/.env` y que el servicio corra |
| El frontend no abre desde otra PC | Firewall o Vite sin `--host` | Abre los puertos 3000 y 8000; `npm run dev -- --host` |
| `runserver` no responde por la red | Arrancado sin `0.0.0.0` | `python manage.py runserver 0.0.0.0:8000` |
| `Address already in use` | Puerto 8000 ocupado | `python manage.py runserver 0.0.0.0:8001` |
| Cambios en `settings.py` no se aplican | Servidor no recargado | Reinicia `runserver` (los `.env` se leen solo al arrancar) |

---

## 9. Convenciones del equipo

- `Backend/porkygym_backend/urls.py` y `Backend/api/**` son **código
  compartido**: no se modifican sin avisar en el grupo.
- Nuevas variables de entorno → añadirlas a `.env.example` (y
  `.env.production.example` si aplica), documentarlas aquí y comentarlas en
  `settings.py`.
- Antes de cada push: `python manage.py check` (backend) y `npm run lint`
  (frontend, ejecuta `tsc --noEmit`). Además, **GitHub Actions** repite esas
  comprobaciones más `migrate`, tests y `npm run build` en cada push y PR:
  si la pestaña Actions está en rojo, no se hace merge.
