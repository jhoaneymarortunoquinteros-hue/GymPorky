# Frontend PorkyGym

## Desarrollo local

Para ejecutar Vite directamente, instala dependencias y arranca el servidor:

```bash
npm install
npm run dev
```

Vite usa `VITE_API_URL` para conectarse al backend. Copia `.env.example` como
`.env` si necesitas cambiar la URL; por defecto apunta a
`http://127.0.0.1:8000/api`.

## Docker Compose

El Compose local usa el `.env` de la raíz para configurar `VITE_API_URL`.
El Compose de producción compila la aplicación con `/api` y Nginx reenvía
esa ruta al backend, por lo que el frontend no requiere credenciales.
