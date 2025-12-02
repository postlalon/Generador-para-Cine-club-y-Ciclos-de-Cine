import { GoogleGenAI, Type } from "@google/genai";
import { Movie, ThemeStyle } from "../types";
import { FONT_OPTIONS } from "../constants";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON strings from Markdown
const cleanJSON = (text: string) => {
  try {
    // Remove markdown code blocks
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Sometimes the model adds text before or after
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse error", e);
    return null;
  }
};

/**
 * Generates a creative name for the film cycle based on genre and description.
 */
export const generateCycleTitle = async (genre: string, context: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `
      Actúa como un director creativo de un cineclub 'underground'.
      Genera un título corto, impactante y artístico (máximo 4 palabras) para un ciclo de cine.
      Género: ${genre}.
      Contexto: ${context}.
      Estilo: ${genre === 'horror' ? 'Terrorífico, sangriento, impactante' : 'Futurista, filosófico, abstracto'}.
      Solo devuelve el título, nada más. Sin comillas.
      Ejemplo si fuera terror mexicano: "Grito Mexa".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating cycle title:", error);
    return "Ciclo de Cine";
  }
};

/**
 * Analyzes an uploaded movie poster to extract info and determine specific style.
 * Uses semantic analysis for fonts and contrast logic for colors.
 */
export const analyzePosterImage = async (base64Image: string): Promise<Partial<Movie>> => {
  try {
    const ai = getAI();
    // Strip the data:image/ part if present for the API
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    const fontOptionsList = FONT_OPTIONS.map(f => `"${f.value}" (${f.label})`).join(', ');

    const prompt = `
      Analiza este póster de película. Actúa como un diseñador gráfico experto.
      
      TAREA 1: Extracción de Información
      Extrae: 
      - Título
      - Director (Nombre del director)
      - Año
      - Duración (estimada si no se ve)
      - Sinopsis: MÁXIMO 169 CARACTERES. Tono culto y atrapante.

      TAREA 2: Inteligencia Visual (NO ALEATORIO)
      1. ANALISIS SEMÁNTICO (Fuente):
         - Determina el género y "mood" del cartel (ej. Terror Slasher, Drama Romántico, Sci-Fi Retro).
         - Selecciona la MEJOR fuente de esta lista EXACTA que coincida con ese mood: [${fontOptionsList}].
      
      2. EXTRACCIÓN DE PALETA (Colores):
         - Muestrea los colores dominantes de la imagen.
         - 'bg': El color predominante oscuro (o claro si es estilo suizo) para el fondo.
         - 'title': Color de alto contraste para el título principal.
         - 'subtitle': Color complementario para subtítulos.
         - 'description': Color legible para texto largo (blanco roto, gris claro, etc).
         - 'time': Color llamativo (neon/acento) para la hora.
      
      Devuelve JSON estrictamente con este schema:
      {
        "title": string,
        "director": string,
        "year": string,
        "duration": string,
        "synopsis": string,
        "visualStyle": {
          "font": string (de la lista),
          "palette": {
            "bg": string (hex),
            "title": string (hex),
            "subtitle": string (hex),
            "description": string (hex),
            "duration": string (hex),
            "time": string (hex)
          }
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = cleanJSON(response.text);
    return {
      title: data?.title,
      director: data?.director,
      year: data?.year,
      duration: data?.duration,
      synopsis: data?.synopsis,
      visualStyle: data?.visualStyle
    };
  } catch (error) {
    console.error("Error analyzing poster:", error);
    return {};
  }
};

/**
 * Uses Google Search Grounding to find movie details if the user only provides a title.
 */
export const searchMovieDetails = async (title: string): Promise<Partial<Movie>> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Busca información sobre la película "${title}". Necesito el Director, Año exacto, Duración (ej. 1h 30m) y una sinopsis muy breve (máximo 169 caracteres) en Español.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const formattingResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Basado en esta información: "${response.text}".
        Devuelve un JSON con: director, year, duration, synopsis (max 169 chars).
      `,
      config: {
        responseMimeType: "application/json"
      }
    });

    return cleanJSON(formattingResponse.text) || {};

  } catch (error) {
    console.error("Error searching movie details:", error);
    return {};
  }
};

/**
 * Generates a custom visual theme (Tailwind classes) based on a description.
 */
export const generateThemeFromDescription = async (description: string): Promise<ThemeStyle | null> => {
  try {
    const ai = getAI();
    const prompt = `
      Eres un diseñador gráfico experto en carteles de cine.
      Genera un objeto JSON con clases de Tailwind CSS para definir la estética visual de un cartel basado en esta descripción: "${description}".
      
      Debes elegir las clases que mejor representen la "vibra" (colores, fuentes).
      
      Las fuentes disponibles son: 'font-horror', 'font-scifi', 'font-display', 'font-serif', 'font-body'.

      Output Schema:
      {
        "fontTitle": string (class name),
        "fontBody": "font-body",
        "bg": string (tailwind bg color class, e.g. 'bg-purple-950'),
        "text": string (primary text color class, high contrast, e.g. 'text-yellow-400'),
        "textSecondary": string (secondary text color class, e.g. 'text-purple-200'),
        "accent": string (border color class, e.g. 'border-yellow-500'),
        "gradient": string (tailwind gradient classes, e.g. 'from-purple-950 via-black to-purple-950'),
        "button": string (button styling classes)
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return cleanJSON(response.text) as ThemeStyle;
  } catch (error) {
    console.error("Error generating theme:", error);
    return null;
  }
}

/**
 * Suggests a gradient palette based on an abstract mood.
 */
export const suggestGradient = async (context: string): Promise<{start: string, via: string, end: string} | null> => {
  try {
    const ai = getAI();
    const prompt = `
      Genera una paleta de 3 colores hexadecimales para un degradado de póster de cine artístico y llamativo.
      Contexto visual y películas: "${context}".
      Si el contexto es oscuro/terror, usa tonos rojos/negros. Si es sci-fi, neones/azules. Si es drama, tonos cálidos o sepia.
      Devuelve JSON estrictamente: { "start": "#hex", "via": "#hex", "end": "#hex" }.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return cleanJSON(response.text);
  } catch (error) {
    console.error("Error suggesting gradient:", error);
    return null;
  }
};

/**
 * Suggests a solid color based on context.
 */
export const suggestSolidColor = async (context: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const prompt = `
      Sugiere UN SOLO color hexadecimal de fondo que represente perfectamente esta vibra de películas: "${context}".
      Debe ser un color que funcione bien como fondo de cartel (generalmente oscuro o muy saturado).
      Devuelve JSON: { "color": "#hex" }.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const data = cleanJSON(response.text);
    return data?.color || null;
  } catch (error) {
    console.error("Error suggesting solid color:", error);
    return null;
  }
};

/**
 * Suggests a font from the available list based on context.
 */
export const suggestFont = async (context: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const options = FONT_OPTIONS.map(f => f.value).join(', ');
    const prompt = `
      Actúa como un director de arte. Recomienda la mejor tipografía para este ciclo de cine:
      Contexto y Películas: "${context}".

      IMPORTANTE:
      - Si las películas son de época o elegantes, usa 'font-serif' o 'font-cinzel'.
      - Si son de acción o modernas, usa 'font-anton' o 'font-oswald'.
      - Si son retro, usa 'font-lobster' o 'font-pacifico'.
      - Si es terror CLÁSICO, 'font-metal'. Si es terror moderno, 'font-horror'.
      - NO elijas siempre 'font-horror' a menos que sea explícitamente sangriento.
      
      Elige UNA sola de las siguientes opciones exactas: 
      [${options}]
      
      Devuelve SOLO el valor de la fuente (ej. 'font-horror'). Nada más.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let suggestion = response.text.trim().replace(/['"`]/g, '').replace(/\n/g, '').trim(); 
    
    // Validate it's one of ours
    const found = FONT_OPTIONS.find(f => suggestion.includes(f.value));
    
    if (found) {
        return found.value;
    } else {
        // Fallback random instead of hardcoded default to ensure variety if AI fails slightly
        const randomIndex = Math.floor(Math.random() * FONT_OPTIONS.length);
        return FONT_OPTIONS[randomIndex].value;
    }
  } catch (error) {
    console.error("Error suggesting font:", error);
    return null;
  }
}