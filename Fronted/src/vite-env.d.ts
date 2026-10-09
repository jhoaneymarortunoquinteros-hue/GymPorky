/// <reference types="vite/client" />

/**
 * Tipos para las variables de entorno de Vite (import.meta.env).
 *
 * Vite SOLO expone al navegador las variables con prefijo `VITE_` y solo las
 * que estén definidas en el momento de arrancar el servidor de desarrollo
 * (por eso hay que reiniciar `npm run dev` al cambiar un .env).
 *
 * El triple-slash de arriba trae los tipos oficiales de Vite; sin él,
 * TypeScript marcaría `import.meta.env` como un error.
 */
interface ImportMetaEnv {
  /**
   * URL base de la API Django, sin barra final.
   * Ejemplos:
   *   http://127.0.0.1:8000/api   (por defecto, no hace falta definirla)
   *   http://192.168.1.10:8000/api (cuando accedes desde otra máquina)
   * Se define en Fronted/.env, Fronted/.env.local o en el entorno del despliegue.
   */
  readonly VITE_API_URL?: string;
}
