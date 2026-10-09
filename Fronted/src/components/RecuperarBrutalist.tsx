import React, { useState } from 'react';

// Mismo API URL y mensajeDeError que LoginBrutalist.
const API_URL: string = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

const mensajeDeError = (data: any): string => {
  if (!data) return 'Error del servidor.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.error) return Array.isArray(data.error) ? data.error.join('. ') : String(data.error);
  for (const key of Object.keys(data)) {
    const v = data[key];
    if (Array.isArray(v) && v.length > 0) return `${key}: ${v.join(', ')}`;
    if (typeof v === 'string' && v) return `${key}: ${v}`;
  }
  return 'Error del servidor.';
};

interface RecuperarBrutalistProps {
  onEnviado: (mensaje: string) => void;
  onVolver: () => void;
}

// Pantalla "Olvidé mi contraseña" con el sistema visual brutalist.
// Lógica 1:1 con el RecuperarForm original de App.tsx:
//   POST ${API_URL}/auth/solicitar-reset/  con { email: email.trim() }
//   - ok + data.debug_link  -> muestra el enlace directo (entorno de pruebas)
//   - ok                    -> onEnviado(data.mensaje) y vuelve al login
//   - error                 -> mensaje de error (+ debug_link si viene)
export const RecuperarBrutalist: React.FC<RecuperarBrutalistProps> = ({
  onEnviado,
  onVolver,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debugLink, setDebugLink] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebugLink(null);
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/auth/solicitar-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      // Si el servidor no devuelve JSON (p. ej. una página de error HTML),
      // no revienta: lo tratamos como error con su código HTTP.
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok && data) {
        if (data.debug_link) {
          setDebugLink(data.debug_link);
        } else {
          onEnviado(data.mensaje || 'Revisa tu correo para continuar.');
        }
      } else {
        setError(
          data
            ? mensajeDeError(data)
            : `Error del servidor (HTTP ${response.status}).`
        );
        if (data?.debug_link) setDebugLink(data.debug_link);
      }
    } catch {
      setError('Error al conectar con el servidor de Django. Asegúrate de que está corriendo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-[#111111] text-[#e5e2e1] min-h-[calc(100vh-42px)] flex flex-col justify-center items-center p-5 md:p-16 selection:bg-[#E2FF00] selection:text-[#111111] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <div className="w-full max-w-[440px] flex flex-col items-center relative z-10">
        <header className="mb-8 w-full text-center">
          <h1 className="font-bebas text-[64px] md:text-[80px] text-[#E2FF00] tracking-tight uppercase text-center leading-none drop-shadow-[0_0_20px_rgba(226,255,0,0.15)]">
            RECUPERAR CONTRASEÑA
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6 bg-[#0e0e0e] p-8 border border-[#F5F5F5]/10 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          {error && (
            <div className="p-3 bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs font-montserrat font-semibold">
              {error}
            </div>
          )}

          {debugLink && (
            <div className="p-4 bg-[#E2FF00]/10 border border-[#E2FF00]/40 text-xs font-montserrat">
              <p className="text-[#E2FF00] font-semibold mb-1">
                Mientras se arregla el envío de correos, usa este enlace directo:
              </p>
              <a
                href={debugLink}
                className="underline break-all text-[#e5e2e1] hover:text-[#E2FF00]"
              >
                {debugLink}
              </a>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <p className="font-inter text-sm text-[#c6c9ab]">
              Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <div>
              <label
                className="font-montserrat text-xs text-[#c6c9ab] uppercase tracking-widest font-bold"
                htmlFor="recup-email"
              >
                Correo electrónico
              </label>
              <input
                id="recup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                autoComplete="email"
                required
                className="w-full bg-transparent border-0 border-b-2 border-[#F5F5F5]/20 px-0 py-3 font-inter text-base text-[#FFFFFF] focus:ring-0 focus:border-[#E2FF00] outline-none transition-colors placeholder:text-[#c6c9ab]/40"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="mt-3 w-full bg-[#E2FF00] text-[#111111] font-bebas text-3xl py-3.5 uppercase hover:bg-white transition-all duration-200 flex justify-center items-center gap-2 group cursor-pointer shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
            >
              <span>{cargando ? 'ENVIANDO...' : 'ENVIAR ENLACE'}</span>
              {!cargando && (
                <span className="material-symbols-outlined text-2xl group-hover:translate-x-1.5 transition-transform">
                  arrow_forward
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onVolver}
              className="mt-1 font-montserrat text-xs uppercase tracking-widest text-[#c6c6c7] hover:text-[#E2FF00] transition-colors cursor-pointer"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
