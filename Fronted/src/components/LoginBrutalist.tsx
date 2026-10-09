import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Base de la API: misma lógica que App.tsx (VITE_API_URL con respaldo local).
// Se duplica aquí a propósito para no tocar ni exportar nada del monolito.
const API_URL: string = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

// Extrae un mensaje legible de una respuesta de error DRF.
// Misma lógica que mensajeDeError() de App.tsx.
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

interface LoginBrutalistProps {
  mensajeInicio?: string;
  onIrARecuperar: () => void;
}

// Rediseño visual del login con el sistema IronTrack brutalista de estilo/.
// Lógica 1:1 con LoginForm de App.tsx: mismo endpoint, mismos tokens,
// mismo localStorage, mismo reload. Solo cambia el JSX/clases.
export const LoginBrutalist: React.FC<LoginBrutalistProps> = ({
  mensajeInicio,
  onIrARecuperar,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.reload();
      } else {
        setError(mensajeDeError(data));
      }
    } catch {
      setError('Error al conectar con el servidor de Django. Asegúrate de que está corriendo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-[#111111] text-[#e5e2e1] min-h-[calc(100vh-42px)] flex flex-col justify-center items-center p-5 md:p-16 selection:bg-[#E2FF00] selection:text-[#111111] relative overflow-hidden">
      {/* Trama brutalista de fondo (igual que estilo/LoginScreen) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <div className="w-full max-w-[440px] flex flex-col items-center relative z-10">
        <header className="mb-8 w-full flex justify-center text-center">
          <h1 className="font-bebas text-[72px] md:text-[84px] text-[#E2FF00] tracking-tight uppercase text-center leading-none drop-shadow-[0_0_20px_rgba(226,255,0,0.15)]">
            PORKY_GYM
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6 bg-[#0e0e0e] p-8 border border-[#F5F5F5]/10 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          {mensajeInicio && (
            <div className="p-3 bg-[#E2FF00]/10 border border-[#E2FF00]/60 text-[#E2FF00] text-xs font-montserrat font-semibold">
              {mensajeInicio}
            </div>
          )}
          {error && (
            <div className="p-3 bg-[#93000a]/40 border border-[#ffb4ab] text-[#ffb4ab] text-xs font-montserrat font-semibold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label
              className="font-montserrat text-xs text-[#c6c9ab] uppercase tracking-widest font-bold"
              htmlFor="login-username"
            >
              Usuario
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_usuario"
              autoComplete="username"
              required
              className="w-full bg-transparent border-0 border-b-2 border-[#F5F5F5]/20 px-0 py-3 font-inter text-base text-[#FFFFFF] focus:ring-0 focus:border-[#E2FF00] outline-none transition-colors placeholder:text-[#c6c9ab]/40"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="font-montserrat text-xs text-[#c6c9ab] uppercase tracking-widest font-bold"
              htmlFor="login-password"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={visible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-transparent border-0 border-b-2 border-[#F5F5F5]/20 px-0 py-3 pr-10 font-inter text-base text-[#FFFFFF] focus:ring-0 focus:border-[#E2FF00] outline-none transition-colors placeholder:text-[#c6c9ab]/40"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setVisible((v) => !v)}
                title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-[#c6c9ab] hover:text-[#E2FF00] cursor-pointer"
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end items-center mt-1">
            <button
              type="button"
              onClick={onIrARecuperar}
              className="font-inter text-sm text-[#E2FF00] hover:text-white transition-colors cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={cargando}
            className="mt-3 w-full bg-[#E2FF00] text-[#111111] font-bebas text-3xl py-3.5 uppercase hover:bg-white transition-all duration-200 flex justify-center items-center gap-2 group cursor-pointer shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
          >
            <span>{cargando ? 'INGRESANDO...' : 'INGRESAR'}</span>
            <span className="material-symbols-outlined text-2xl group-hover:translate-x-1.5 transition-transform">
              arrow_forward
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
