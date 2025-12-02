
export interface Movie {
  id: string;
  title: string;
  year: string;
  director: string;
  duration: string;
  synopsis: string; // The "Reason for projection" or description
  posterImage: string | null; // Base64 string
  date: string;
  time: string;
  visualStyle?: {
    font: string;
    palette: {
      bg: string;
      title: string;
      subtitle: string;
      description: string;
      duration: string;
      time: string;
    };
  };
}

export interface ThemeStyle {
  fontTitle: string;
  fontBody: string;
  bg: string;
  text: string;
  textSecondary: string;
  accent: string;
  gradient: string;
  button: string;
}

export interface CustomColors {
  bg: string;
  backgroundType: 'solid' | 'gradient';
  gradient?: { start: string; via: string; end: string };
  font: string;
  
  // Specific Editable Variables
  colorTitle: string;       // color_titulo
  colorSubtitle: string;    // color_subtitulos
  colorDescription: string; // color_descripcion
  colorDuration: string;    // color_duracion
  colorTime: string;        // color_hora

  // New
  titleScale?: number;
}

export type CycleTheme = 'horror' | 'scifi' | 'classic' | 'custom' | string;

export interface CycleSettings {
  title: string;
  subtitle: string; // e.g., "Crónicas de Horror"
  theme: CycleTheme;
  customThemeStyle?: ThemeStyle; // Stores the AI generated style if theme is 'custom'
  venue: string; // "Sede"
  organizerLogo: string | null; // "Colectivo Impulsor"
  venueLogo: string | null; // "Espacio Anfitrión"
}

export interface GeminiResponse {
  text: string;
}
