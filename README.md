# 🐷 PorkyGym — Guía del equipo

Plataforma de gestión de gimnasio.
**Backend:** Django 5 + Django REST Framework · **Frontend:** React + Vite · **BD:** PostgreSQL

Este README explica: instalación, acceso por IP local, variables de entorno,
subida a GitHub y cómo dejarlo listo para producción.

## Docker Compose (desarrollo local)

Desde la raíz del repositorio puedes levantar todo el stack con PostgreSQL, backend y frontend:

```bash
copy .env.example .env
# Edita .env con tus valores locales.
docker compose up --build
```

En Linux/macOS usa `cp .env.example .env`. El Compose local toma su configuración
de ese archivo en la raíz; no necesita `Backend/.env` ni `Fronted/.env`.

Esto levanta:
- PostgreSQL en `localhost:5432`
- Django en `http://localhost:8000`
- Vite en `http://localhost:3000`

La base de datos se inicializa automáticamente con la migración del backend. Si el backend no encuentra la DB al arrancar, Docker lo esperará hasta que PostgreSQL quede saludable.

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
│   │   ├── settings.py         # Configuración (dotenv, hosts, CORS, estáticos)
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

Las plantillas son específicas para cada contexto:

- [`.env.example`](./.env.example): variables del Compose local. Cópiala como
  `.env` en la raíz. Compose configura Django, PostgreSQL, Brevo y la URL de
  API que usa Vite. Dentro de Docker, el host de PostgreSQL es `postgres`;
  el Compose fija ese host y el puerto interno `5432`.
- [`Backend/.env.example`](./Backend/.env.example): configuración para ejecutar
  Django directamente fuera de Compose. En ese caso `DB_HOST=localhost` y
  `DB_PORT=5432` corresponden a PostgreSQL local.
- [`Fronted/.env.example`](./Fronted/.env.example): `VITE_API_URL` al ejecutar
  Vite directamente en el host. En Compose local, `VITE_API_URL` viene de la
  plantilla raíz.
- [`.env.production.example`](./.env.production.example): referencia para las
  variables de runtime del Compose de producción. En el servidor, el vault o
  el orquestador debe inyectarlas; GitHub Actions solo publica las imágenes.

| Variable | Local Compose | Producción Compose | Uso |
|---|---|---|---|
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | `.env` raíz | vault/entorno del servidor | Creación y conexión a PostgreSQL. |
| `SECRET_KEY` | `.env` raíz | vault/entorno del servidor | Firma de Django y JWT. |
| `DEBUG` | `.env` raíz | Fijado a `True` en el Compose actual | Modo de depuración de Django. |
| `FRONTEND_URL` | `.env` raíz | vault/entorno del servidor | Enlaces de recuperación. |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` | `.env` raíz | Opcionales; vault/entorno del servidor | Envío de correos de recuperación. |
| `VITE_API_URL` | `.env` raíz | `/api` al compilar la imagen | URL base pública de la API para el navegador. |
| `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` | Django usa valores locales por defecto | vault/entorno del servidor | Hosts y orígenes aceptados en producción. |
| `IMAGE_TAG`, `HTTP_PORT` | No se usan | Opcionales; por defecto `latest` y `80` | Selección de imágenes y puerto publicado. |

---

## 6. Producción

El workflow [publish-images.yml](./.github/workflows/publish-images.yml) publica
las imágenes al hacer push a `main`. El workflow usa `GITHUB_TOKEN` para
publicarlas; la visibilidad de los paquetes se configura una sola vez desde
GitHub Packages, no se cambia en cada ejecución. El Compose de producción no
construye imágenes ni obtiene secretos desde GitHub Actions.

En el servidor, configura las variables indicadas en
[`.env.production.example`](./.env.production.example) desde el vault o entorno
protegido. Si se usa un archivo de entorno, mantenlo fuera del repositorio y
con permisos restringidos; luego:

```bash
docker compose --env-file /ruta/segura/porkygym.env \
  -f docker-compose.production.yml pull
docker compose --env-file /ruta/segura/porkygym.env \
  -f docker-compose.production.yml up -d
```

PostgreSQL conserva datos en un volumen y el backend aplica migraciones antes
de iniciar Gunicorn. El Compose actual usa `DEBUG=True`; TLS puede terminar en
el proxy externo y el tráfico interno entre ese proxy y el Compose puede ser
HTTP. El frontend enruta `/api/`, `/admin/` y `/static/` hacia el backend.
Define `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` y `FRONTEND_URL` con los dominios
que correspondan. Para despliegues reproducibles, establece `IMAGE_TAG` con
el SHA publicado en GHCR en vez de usar `latest`.

---

## 7. Git y GitHub

### Reglas de oro

1. **Nunca** hagas `git add .` a ciegas: mira `git status` primero.
2. `.env`, `venv/`, `__pycache__/`, `*.sqlite3`, `node_modules/` → **jamás**.
3. Los `.env.example` y `.env.production.example` → **siempre**.
4. Si un secreto se llega a subir, borrar el `.gitignore` **no** lo borra del
   historial: hay que **rotar esa clave/contraseña** y limpiar el historial.

### Integración continua (GitHub Actions)

El workflow [publish-images.yml](./.github/workflows/publish-images.yml) publica
las imágenes del backend y frontend en GHCR al hacer push a `main`, o al
ejecutarlo manualmente desde GitHub Actions. No es un workflow de pruebas ni
se ejecuta en cada Pull Request.

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
