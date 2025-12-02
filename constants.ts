import { ThemeStyle } from './types';

export const THEMES: Record<string, ThemeStyle> = {
  horror: {
    fontTitle: 'font-horror',
    fontBody: 'font-body',
    bg: 'bg-black',
    text: 'text-red-600',
    textSecondary: 'text-stone-300',
    accent: 'border-red-700',
    gradient: 'from-black via-red-950 to-black',
    button: 'bg-red-800 hover:bg-red-700 text-white'
  },
  scifi: {
    fontTitle: 'font-scifi',
    fontBody: 'font-body',
    bg: 'bg-slate-950',
    text: 'text-cyan-400',
    textSecondary: 'text-slate-300',
    accent: 'border-cyan-600',
    gradient: 'from-slate-950 via-cyan-950 to-slate-950',
    button: 'bg-cyan-700 hover:bg-cyan-600 text-white'
  },
  classic: {
    fontTitle: 'font-display',
    fontBody: 'font-body',
    bg: 'bg-stone-900',
    text: 'text-amber-500',
    textSecondary: 'text-stone-300',
    accent: 'border-amber-600',
    gradient: 'from-stone-900 via-stone-800 to-stone-900',
    button: 'bg-amber-700 hover:bg-amber-600 text-white'
  }
};

export const FONT_OPTIONS = [
  { label: 'Terror (Creepster)', value: 'font-horror' },
  { label: 'Futurista (Orbitron)', value: 'font-scifi' },
  { label: 'Impacto (Bebas Neue)', value: 'font-display' },
  { label: 'Elegante (Playfair)', value: 'font-serif' },
  { label: 'Moderno (Montserrat)', value: 'font-body' },
  { label: 'Póster Bold (Anton)', value: 'font-anton' },
  { label: 'Cinemático (Cinzel)', value: 'font-cinzel' },
  { label: 'Clásico (Abril Fatface)', value: 'font-abril' },
  { label: 'Urbano (Oswald)', value: 'font-oswald' },
  { label: 'Retro (Lobster)', value: 'font-lobster' },
  { label: 'Manuscrito (Pacifico)', value: 'font-pacifico' },
  { label: 'Limpio (Raleway)', value: 'font-raleway' },
];