

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Movie, CycleSettings, CycleTheme, ThemeStyle, CustomColors } from './types';
import { generateCycleTitle, analyzePosterImage, searchMovieDetails, generateThemeFromDescription, suggestGradient, suggestFont, suggestSolidColor } from './services/geminiService';
import PosterPreview from './components/PosterPreview';
import { THEMES, FONT_OPTIONS } from './constants';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';

// Icons
const IconMagic = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M2 7h6"/><path d="M19 17v4"/><path d="M15 17v4"/><path d="M13 21h6"/></svg>;
const IconSearch = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconDownload = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const IconUpload = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const IconPalette = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.093 0-.679.5-1.25 1.125-1.25H16c3.25 0 6-2.625 6-6 0-3.313-2.625-6-6-6z"/></svg>;
const IconSettings = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconDice = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/></svg>;
const IconLetterCase = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;

const getRandomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

const App: React.FC = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'movies' | 'customize'>('general');
  const [themePrompt, setThemePrompt] = useState('');
  
  // View Toggle for Individual Posters
  const [individualViewMode, setIndividualViewMode] = useState<'story' | 'feed'>('story');

  const [settings, setSettings] = useState<CycleSettings>({
    title: 'Nombre del Ciclo',
    subtitle: 'Subtítulo y Contexto',
    theme: 'classic',
    venue: 'Lugar donde se proyectará',
    organizerLogo: null,
    venueLogo: null,
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    title: '', director: '', year: '', date: '', time: '19:00', duration: '', synopsis: '', posterImage: null
  });

  // Manual Styling Overrides
  const [customColors, setCustomColors] = useState<CustomColors | undefined>(undefined);

  // --- REFS ---
  const generalPosterRef = useRef<HTMLDivElement>(null);
  const storyPosterRefs = useRef<(HTMLDivElement | null)[]>([]);

  // --- EFFECTS ---
  // Manual Font Injection to fix html-to-image CORS issues
  useEffect(() => {
    const fetchFonts = async () => {
      // Check if already injected to avoid duplicates
      if (document.getElementById('manual-google-fonts')) return;

      const fontUrl = "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Anton&family=Bebas+Neue&family=Cinzel:wght@400;700&family=Creepster&family=Lobster&family=Metal+Mania&family=Montserrat:wght@400;700&family=Orbitron:wght@400;700&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Raleway:wght@400;700&family=Roboto:wght@400;700&display=swap";
      
      try {
        const response = await fetch(fontUrl);
        const cssText = await response.text();
        
        const style = document.createElement('style');
        style.id = 'manual-google-fonts';
        style.textContent = cssText;
        document.head.appendChild(style);
      } catch (error) {
        console.error("Error loading fonts manually:", error);
      }
    };
    
    fetchFonts();
  }, []);

  // --- DERIVED ---
  const currentThemeStyle: ThemeStyle = 
    settings.theme === 'custom' && settings.customThemeStyle 
      ? settings.customThemeStyle 
      : THEMES[settings.theme] || THEMES.horror;

  // --- HANDLERS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof CycleSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateTitle = async () => {
    setLoading(true);
    try {
      const generated = await generateCycleTitle(settings.theme === 'custom' ? themePrompt || 'Cine alternativo' : settings.theme, settings.subtitle || 'Cine de culto');
      setSettings(prev => ({ ...prev, title: generated }));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomTheme = async () => {
    if (!themePrompt) return;
    setLoading(true);
    try {
      const generatedTheme = await generateThemeFromDescription(themePrompt);
      if (generatedTheme) {
        setSettings(prev => ({
          ...prev,
          theme: 'custom',
          customThemeStyle: generatedTheme
        }));
        setCustomColors(undefined);
      }
    } finally {
      setLoading(false);
    }
  };

  const ensureCustomColors = (): CustomColors => {
    if (!customColors) {
      const defaults: CustomColors = {
        bg: '#000000',
        backgroundType: 'gradient',
        gradient: { start: '#000000', via: '#1a1a1a', end: '#000000' },
        font: currentThemeStyle.fontTitle,
        colorTitle: '#ffffff',
        colorSubtitle: '#f1f1f1',
        colorDescription: '#d1d5db',
        colorDuration: '#9ca3af',
        colorTime: '#e50914',
        titleScale: 1,
        titleTracking: '-0.05em'
      };
      setCustomColors(defaults);
      return defaults;
    }
    return customColors;
  };

  const getStyleContext = () => {
    const movieTitles = movies.map(m => m.title).join(', ');
    return `${settings.title} ${settings.subtitle} (${settings.theme}). Movies: ${movieTitles}`;
  };

  const handleSuggestGradient = async () => {
    setLoading(true);
    try {
      const gradient = await suggestGradient(getStyleContext());
      if (gradient) {
        const current = ensureCustomColors();
        setCustomColors({
          ...current,
          backgroundType: 'gradient',
          gradient: gradient 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestSolid = async () => {
    setLoading(true);
    try {
      const color = await suggestSolidColor(getStyleContext());
      if (color) {
        const current = ensureCustomColors();
        setCustomColors({
          ...current,
          backgroundType: 'solid',
          bg: color
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRandomSolid = () => {
    const current = ensureCustomColors();
    setCustomColors({
      ...current,
      backgroundType: 'solid',
      bg: getRandomHex()
    });
  };

  const handleRandomGradient = () => {
    const current = ensureCustomColors();
    setCustomColors({
      ...current,
      backgroundType: 'gradient',
      gradient: {
        start: getRandomHex(),
        via: getRandomHex(),
        end: getRandomHex()
      }
    });
  };

  const handleSuggestFont = async () => {
    setLoading(true);
    try {
      const font = await suggestFont(getStyleContext());
      if (font) {
        const current = ensureCustomColors();
        setCustomColors({
          ...current,
          font: font 
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleMoviePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        setNewMovie(prev => ({ ...prev, posterImage: base64 }));
        
        // Analyze image with Gemini
        const analysis = await analyzePosterImage(base64);
        setNewMovie(prev => ({ ...prev, ...analysis }));
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearchMovie = async () => {
    if (!newMovie.title) return;
    setLoading(true);
    try {
      const details = await searchMovieDetails(newMovie.title);
      setNewMovie(prev => ({ ...prev, ...details }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = () => {
    if (newMovie.title && newMovie.date) {
      setMovies([...movies, newMovie as Movie]);
      setNewMovie({ title: '', director: '', year: '', date: '', time: '19:00', duration: '', synopsis: '', posterImage: null });
    }
  };

  const handleApplyDetectedStyle = () => {
    if (newMovie.visualStyle && newMovie.visualStyle.palette) {
       const palette = newMovie.visualStyle.palette;
       setCustomColors({
         bg: palette.bg,
         backgroundType: 'gradient',
         gradient: {
            start: palette.bg,
            via: palette.bg, // Simplified to solid-ish gradient or could calculate darker
            end: '#000000'
         },
         font: newMovie.visualStyle.font,
         colorTitle: palette.title,
         colorSubtitle: palette.subtitle,
         colorDescription: palette.description,
         colorDuration: palette.duration,
         colorTime: palette.time,
         titleScale: 1,
         titleTracking: '0em'
       });
       setActiveTab('customize');
    }
  }

  // Helper for generating PNG blob
  const generateBlob = async (element: HTMLElement): Promise<Blob | null> => {
     if (!element) return null;
     await document.fonts.ready;
     await new Promise(resolve => setTimeout(resolve, 100));
     
     const dataUrl = await toPng(element, { 
        cacheBust: false, 
        pixelRatio: 2, 
        backgroundColor: null,
        filter: (node) => {
           if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
             return false;
           }
           return true;
        }
      });
      
      const res = await fetch(dataUrl);
      return res.blob();
  };

  const handleDownload = async (element: HTMLElement | null, filename: string) => {
    if (!element) return;
    try {
      const blob = await generateBlob(element);
      if(blob) {
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.download = `${filename}.png`;
         link.href = url;
         link.click();
         URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download failed", err);
      alert("Error creating image.");
    }
  };

  const handleDownloadZIP = async () => {
    // If no posters are available, do nothing
    if(!generalPosterRef.current && movies.length === 0) return;
    setLoading(true);

    try {
      const zip = new JSZip();
      const safeTitle = settings.title.replace(/[^a-z0-9]/gi, '_');
      const folderName = `CineClub_Pack_${safeTitle}`;
      const folder = zip.folder(folderName);
      
      if(folder) {
         // 1. General Poster
         if (generalPosterRef.current) {
            const blob = await generateBlob(generalPosterRef.current);
            if(blob) folder.file("00_Cartel_General.png", blob);
         }

         // 2. Individual Posters
         // We iterate through movies to get the correct index and title
         for (let i = 0; i < movies.length; i++) {
            const ref = storyPosterRefs.current[i];
            
            // Check if ref exists
            if (ref) {
              const blob = await generateBlob(ref);
              const sanitizedMovieTitle = movies[i].title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
              
              // Appending view mode to filename to be clear what format was downloaded (Feed vs Story)
              const formatSuffix = individualViewMode === 'story' ? 'Story_9x16' : 'Post_4x5';
              
              if(blob) folder.file(`Poster_${i+1}_${sanitizedMovieTitle}_${formatSuffix}.png`, blob);
            }
         }

         // Generate and Save
         const content = await zip.generateAsync({ type: "blob" });
         const url = URL.createObjectURL(content);
         const link = document.createElement('a');
         link.download = `${safeTitle}_Assets.zip`;
         link.href = url;
         link.click();
         URL.revokeObjectURL(url);
      }

    } catch(err) {
      console.error("ZIP Generation failed", err);
      alert("Error generando el archivo ZIP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${customColors?.bg && customColors.backgroundType === 'solid' ? '' : currentThemeStyle.bg} text-stone-200 transition-colors duration-500`} style={customColors?.bg && customColors.backgroundType === 'solid' ? {backgroundColor: customColors.bg} : {}}>
      
      {/* LEFT SIDEBAR: INPUTS */}
      <div className="w-full md:w-1/3 lg:w-96 flex flex-col border-r border-white/10 bg-stone-900/50 backdrop-blur-sm h-screen overflow-y-auto z-20">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-tighter text-white">CineClub Guajolote <span className={customColors?.colorTitle ? '' : currentThemeStyle.text} style={customColors?.colorTitle ? {color: customColors.colorTitle} : {}}>Generador</span></h1>
          <p className="text-xs text-stone-500 mt-1">Automatizardo de Posters co IA</p>
          <p className="text-[10px] text-stone-600 mt-2">App diseñado e idea original por <a href="https://www.instagram.com/postlalon/" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-200 transition-colors">@postlalon</a></p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 p-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === 'general' ? 'bg-white/5 text-white' : 'text-stone-500 hover:text-white'}`}
          >
            <IconSettings className="mx-auto mb-1" /> General
          </button>
           <button 
            onClick={() => setActiveTab('movies')}
            className={`flex-1 p-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === 'movies' ? 'bg-white/5 text-white' : 'text-stone-500 hover:text-white'}`}
          >
            <IconUpload className="mx-auto mb-1" /> Películas
          </button>
          <button 
            onClick={() => setActiveTab('customize')}
            className={`flex-1 p-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === 'customize' ? 'bg-white/5 text-white' : 'text-stone-500 hover:text-white'}`}
          >
            <IconPalette className="mx-auto mb-1" /> Personalizar
          </button>
        </div>

        {/* Forms */}
        <div className="p-6 space-y-6">
          
          {/* --- TAB: GENERAL SETTINGS --- */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fadeIn">
               {/* Theme Selector */}
               <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">Estética del Ciclo (AI)</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {(['horror', 'scifi', 'classic'] as CycleTheme[]).map(t => (
                    <button 
                      key={t}
                      onClick={() => {
                        setSettings({...settings, theme: t});
                        setCustomColors(undefined); // Reset manual overrides
                      }}
                      className={`py-2 text-xs font-bold uppercase border ${settings.theme === t && !customColors ? `${currentThemeStyle.text} ${currentThemeStyle.accent} bg-white/5` : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}
                    >
                      {t}
                    </button>
                  ))}
                  <button 
                     onClick={() => {
                        setSettings({...settings, theme: 'custom'});
                        setCustomColors(undefined);
                     }}
                     className={`py-2 text-xs font-bold uppercase border ${settings.theme === 'custom' && !customColors ? `${currentThemeStyle.text} ${currentThemeStyle.accent} bg-white/5` : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}
                  >
                    AI Custom
                  </button>
                </div>

                {/* Custom Theme Generator Input */}
                <div className="bg-black/20 p-3 rounded border border-white/10">
                  <label className="block text-[10px] uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1">
                    <IconPalette /> Generador de Estilo Mágico
                  </label>
                  <div className="flex gap-2">
                     <input 
                      placeholder="Ej. Cyberpunk Mexicano, Cine Noir..."
                      value={themePrompt}
                      onChange={(e) => setThemePrompt(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <button 
                      onClick={handleGenerateCustomTheme}
                      disabled={loading || !themePrompt}
                      className="bg-purple-700 hover:bg-purple-600 text-white p-2 rounded disabled:opacity-50"
                      title="Generar estilo visual"
                    >
                       {loading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div> : <IconMagic />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Title Generation */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-stone-500">Nombre del Ciclo</label>
                <div className="flex gap-2">
                  <input 
                    value={settings.title}
                    onChange={(e) => setSettings({...settings, title: e.target.value})}
                    className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
                  />
                  <button 
                    onClick={handleGenerateTitle}
                    disabled={loading}
                    className={`${currentThemeStyle.button} p-2 rounded transition-colors disabled:opacity-50`}
                    title="Generate with AI"
                  >
                    <IconMagic />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-stone-500">Subtítulo / Contexto</label>
                <input 
                  value={settings.subtitle}
                  onChange={(e) => setSettings({...settings, subtitle: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
                />
              </div>

               <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-stone-500">Sede (Texto)</label>
                <input 
                  value={settings.venue}
                  onChange={(e) => setSettings({...settings, venue: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Logos */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs uppercase tracking-wider text-stone-500 mb-3">Logotipos</p>
                <div className="grid grid-cols-2 gap-2">
                  {['organizerLogo', 'venueLogo'].map((field) => (
                    <div key={field} className="relative aspect-square bg-black/30 border border-white/10 rounded hover:border-white/30 transition-colors group cursor-pointer overflow-hidden">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleLogoUpload(e, field as keyof CycleSettings)} accept="image/*" />
                      {settings[field as keyof CycleSettings] ? (
                        <img src={settings[field as keyof CycleSettings] as string} className="w-full h-full object-contain p-2" />
                      ) : (
                         <div className="flex flex-col items-center justify-center h-full text-stone-600">
                           <IconUpload />
                           <span className="text-[9px] mt-1 uppercase">{field === 'organizerLogo' ? 'Impulsa' : 'Sede'}</span>
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

           {/* --- TAB: CUSTOMIZE (Manual Colors/Fonts) --- */}
           {activeTab === 'customize' && (
             <div className="space-y-6 animate-fadeIn">
                <div className="bg-amber-900/20 p-4 rounded border border-amber-500/20 text-xs text-amber-200">
                  <p>Configuración manual: anula el tema automático de la IA.</p>
                </div>

                <div className="space-y-4">
                  {/* FONT SELECTOR */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">Tipografía Principal</label>
                    <div className="flex gap-2">
                      <select 
                        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm"
                        value={customColors?.font || currentThemeStyle.fontTitle}
                        onChange={(e) => {
                          const current = ensureCustomColors();
                          setCustomColors({...current, font: e.target.value});
                        }}
                      >
                        {FONT_OPTIONS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleSuggestFont}
                        disabled={loading}
                        className="bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-500/30 text-indigo-200 px-3 rounded"
                        title="Sugerir Fuente AI"
                      >
                         {loading ? <div className="w-3 h-3 animate-spin border rounded-full border-t-transparent"></div> : <IconMagic />}
                      </button>
                    </div>
                    {/* FONT SIZE SLIDER */}
                     <div className="mt-3">
                        <label className="block text-[10px] uppercase tracking-wider text-stone-400 mb-1">Tamaño del Título: {customColors?.titleScale || 1}x</label>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="2.5" 
                          step="0.1"
                          value={customColors?.titleScale || 1}
                          onChange={(e) => {
                             const current = ensureCustomColors();
                             setCustomColors({...current, titleScale: parseFloat(e.target.value)});
                          }}
                          className="w-full cursor-pointer h-1 bg-white/20 rounded-lg appearance-none"
                        />
                     </div>
                     {/* FONT SPACING (TRACKING) SLIDER */}
                     <div className="mt-3">
                        <label className="block text-[10px] uppercase tracking-wider text-stone-400 mb-1 flex justify-between">
                            <span>Espaciado del Título (Tracking)</span>
                            <span className="text-white">{customColors?.titleTracking || '-0.05em'}</span>
                        </label>
                        <input 
                          type="range" 
                          min="-0.2" 
                          max="1.0" 
                          step="0.05"
                          value={parseFloat((customColors?.titleTracking || '-0.05').replace('em', ''))}
                          onChange={(e) => {
                             const current = ensureCustomColors();
                             setCustomColors({...current, titleTracking: `${e.target.value}em`});
                          }}
                          className="w-full cursor-pointer h-1 bg-white/20 rounded-lg appearance-none"
                        />
                     </div>
                  </div>

                  {/* BACKGROUND PICKER */}
                  <div>
                     <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">Fondo</label>
                     <div className="flex bg-black/40 rounded p-1 mb-3">
                        <button 
                          onClick={() => {
                            const current = ensureCustomColors();
                            setCustomColors({...current, backgroundType: 'solid'});
                          }}
                          className={`flex-1 py-1 text-xs font-bold uppercase rounded ${customColors?.backgroundType === 'solid' ? 'bg-white/10 text-white' : 'text-stone-500'}`}
                        >
                          Sólido
                        </button>
                        <button 
                          onClick={() => {
                             const current = ensureCustomColors();
                             setCustomColors({...current, backgroundType: 'gradient'});
                          }}
                          className={`flex-1 py-1 text-xs font-bold uppercase rounded ${customColors?.backgroundType === 'gradient' || !customColors ? 'bg-white/10 text-white' : 'text-stone-500'}`}
                        >
                          Gradiente
                        </button>
                     </div>

                     {customColors?.backgroundType === 'solid' ? (
                       <div className="bg-black/20 p-2 rounded space-y-2">
                          <div className="flex items-center gap-2">
                              <input type="color" className="bg-transparent cursor-pointer h-8 w-full"
                                value={customColors?.bg || '#000000'}
                                onChange={(e) => {
                                   const current = ensureCustomColors();
                                   setCustomColors({...current, bg: e.target.value, backgroundType: 'solid'});
                                }}
                              />
                          </div>
                          <div className="flex gap-2">
                              <button onClick={handleSuggestSolid} disabled={loading} className="flex-1 bg-white/10 hover:bg-white/20 text-xs py-1 rounded flex items-center justify-center gap-1">
                                <IconMagic className="w-3 h-3"/> AI
                              </button>
                               <button onClick={handleRandomSolid} className="flex-1 bg-white/10 hover:bg-white/20 text-xs py-1 rounded flex items-center justify-center gap-1">
                                <IconDice className="w-3 h-3"/> Random
                              </button>
                          </div>
                       </div>
                     ) : (
                       <div className="space-y-2 bg-black/20 p-2 rounded">
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] w-8">In.</span>
                              <input type="color" className="bg-transparent cursor-pointer flex-1" 
                                value={customColors?.gradient?.start || '#000000'}
                                onChange={(e) => {
                                  const current = ensureCustomColors();
                                  setCustomColors({...current, gradient: { ...current.gradient!, start: e.target.value }});
                                }}
                              />
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] w-8">Med.</span>
                              <input type="color" className="bg-transparent cursor-pointer flex-1" 
                                value={customColors?.gradient?.via || '#1a1a1a'}
                                onChange={(e) => {
                                  const current = ensureCustomColors();
                                  setCustomColors({...current, gradient: { ...current.gradient!, via: e.target.value }});
                                }}
                              />
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] w-8">Fin</span>
                              <input type="color" className="bg-transparent cursor-pointer flex-1" 
                                 value={customColors?.gradient?.end || '#0000000'}
                                 onChange={(e) => {
                                    const current = ensureCustomColors();
                                    setCustomColors({...current, gradient: { ...current.gradient!, end: e.target.value }});
                                 }}
                              />
                          </div>
                          <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                              <button onClick={handleSuggestGradient} disabled={loading} className="flex-1 bg-white/10 hover:bg-white/20 text-xs py-1 rounded flex items-center justify-center gap-1">
                                <IconMagic className="w-3 h-3"/> AI
                              </button>
                               <button onClick={handleRandomGradient} className="flex-1 bg-white/10 hover:bg-white/20 text-xs py-1 rounded flex items-center justify-center gap-1">
                                <IconDice className="w-3 h-3"/> Random
                              </button>
                          </div>
                       </div>
                     )}
                  </div>

                  {/* SPECIFIC TEXT COLORS */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                     <p className="text-xs uppercase tracking-wider text-stone-500 mb-2">Colores de Texto</p>
                     
                     <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-400">Título</label>
                          <input type="color" className="w-full h-8 bg-transparent cursor-pointer" 
                            value={customColors?.colorTitle || '#ffffff'}
                            onChange={(e) => {
                               const current = ensureCustomColors();
                               setCustomColors({...current, colorTitle: e.target.value});
                            }}
                          />
                        </div>
                         <div>
                          <label className="text-[10px] text-stone-400">Subtítulos</label>
                          <input type="color" className="w-full h-8 bg-transparent cursor-pointer" 
                            value={customColors?.colorSubtitle || '#f1f1f1'}
                            onChange={(e) => {
                               const current = ensureCustomColors();
                               setCustomColors({...current, colorSubtitle: e.target.value});
                            }}
                          />
                        </div>
                         <div>
                          <label className="text-[10px] text-stone-400">Descripción</label>
                          <input type="color" className="w-full h-8 bg-transparent cursor-pointer" 
                            value={customColors?.colorDescription || '#d1d5db'}
                            onChange={(e) => {
                               const current = ensureCustomColors();
                               setCustomColors({...current, colorDescription: e.target.value});
                            }}
                          />
                        </div>
                         <div>
                          <label className="text-[10px] text-stone-400">Día y Hora</label>
                          <input type="color" className="w-full h-8 bg-transparent cursor-pointer" 
                            value={customColors?.colorTime || '#e50914'}
                            onChange={(e) => {
                               const current = ensureCustomColors();
                               setCustomColors({...current, colorTime: e.target.value});
                            }}
                          />
                        </div>
                         <div>
                          <label className="text-[10px] text-stone-400">Duración</label>
                          <input type="color" className="w-full h-8 bg-transparent cursor-pointer" 
                            value={customColors?.colorDuration || '#9ca3af'}
                            onChange={(e) => {
                               const current = ensureCustomColors();
                               setCustomColors({...current, colorDuration: e.target.value});
                            }}
                          />
                        </div>
                     </div>
                  </div>
                  
                  {/* Reset */}
                  <div className="flex gap-2 pt-4">
                     <button 
                      onClick={() => setCustomColors(undefined)}
                      className="w-full border border-white/20 hover:bg-white/10 text-stone-400 text-[10px] py-2 rounded uppercase tracking-wider"
                    >
                      Reset Todo
                    </button>
                  </div>

                </div>
             </div>
           )}

          {/* --- TAB: MOVIES --- */}
          {activeTab === 'movies' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* New Movie Form */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold uppercase text-white mb-2">Agregar Película</h3>
                
                {/* Poster Upload */}
                <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-stone-500 hover:border-white/40 hover:text-white transition-colors relative cursor-pointer overflow-hidden group">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleMoviePosterUpload} accept="image/*" />
                  {newMovie.posterImage ? (
                    <img src={newMovie.posterImage} className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <IconUpload />
                      <span className="text-xs mt-2">Subir Póster (AI Analysis)</span>
                    </>
                  )}
                  {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                </div>
                
                {/* AI Detected Style Button */}
                {newMovie.visualStyle && (
                  <button 
                    onClick={handleApplyDetectedStyle}
                    className="w-full bg-gradient-to-r from-purple-800 to-indigo-900 text-white text-xs py-2 rounded flex items-center justify-center gap-2 border border-white/20 hover:brightness-110"
                  >
                     <IconPalette className="w-3 h-3" /> Aplicar Estilo Detectado del Póster
                  </button>
                )}

                {/* Title & Search */}
                <div className="flex gap-2">
                  <input 
                    placeholder="Título de la película"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                    className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
                  />
                  <button onClick={handleSearchMovie} disabled={loading} className="bg-white/10 hover:bg-white/20 p-2 rounded text-white" title="Search Info">
                    <IconSearch />
                  </button>
                </div>
                
                {/* Director */}
                <input 
                  placeholder="Director (e.g. Guillermo del Toro)"
                  value={newMovie.director}
                  onChange={(e) => setNewMovie({...newMovie, director: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                   <input 
                    placeholder="Año (e.g. 2022)"
                    value={newMovie.year}
                    onChange={(e) => setNewMovie({...newMovie, year: e.target.value})}
                    className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
                  />
                   <input 
                    placeholder="Duración (e.g. 1h 37m)"
                    value={newMovie.duration}
                    onChange={(e) => setNewMovie({...newMovie, duration: e.target.value})}
                    className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <input 
                    placeholder="Día (e.j. 1 Dic Lunes)"
                    value={newMovie.date}
                    onChange={(e) => setNewMovie({...newMovie, date: e.target.value})}
                    className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none placeholder:text-[10px]"
                  />
                   <input 
                    placeholder="Hora (e.g. 19:00)"
                    type="time"
                    value={newMovie.time}
                    onChange={(e) => setNewMovie({...newMovie, time: e.target.value})}
                    className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
                  />
                </div>

                <textarea 
                  placeholder="Sinopsis, descripción. (NO MAS DE 169 CARACTERES PARA MEJOR DISEÑO)"
                  value={newMovie.synopsis}
                  onChange={(e) => setNewMovie({...newMovie, synopsis: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none h-20"
                />

                <button 
                  onClick={handleAddMovie}
                  className={`w-full ${currentThemeStyle.button} py-2 rounded text-sm font-bold uppercase tracking-wide`}
                >
                  Agregar a Cartelera
                </button>
              </div>

              {/* Movie List */}
              <div className="space-y-2">
                {movies.map((m, idx) => (
                  <div key={idx} className="flex gap-3 bg-black/20 p-2 rounded border border-white/5 items-center">
                    <div className="w-10 h-14 bg-stone-800 shrink-0">
                      {m.posterImage && <img src={m.posterImage} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{m.title}</p>
                      <p className="text-stone-500 text-xs">{m.date}</p>
                    </div>
                    <button onClick={() => setMovies(movies.filter((_, i) => i !== idx))} className="text-stone-600 hover:text-red-500 p-1">×</button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* RIGHT: PREVIEW AREA */}
      <div className="flex-1 bg-stone-900 overflow-y-auto overflow-x-hidden p-8 flex flex-col items-center gap-12 relative">
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         
         {/* Top Actions Bar */}
         <div className="w-full max-w-5xl flex justify-end">
            <button 
                onClick={handleDownloadZIP}
                disabled={loading}
                className="flex items-center gap-2 text-xs bg-emerald-600 text-white px-4 py-2 rounded font-bold hover:bg-emerald-500 transition-colors shadow-lg disabled:opacity-50"
              >
                {loading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div> : <IconDownload />} 
                Descargar Todo (ZIP)
            </button>
         </div>

         {/* Section: General Poster */}
         <div className="w-full max-w-5xl flex flex-col items-center">
            <div className="flex justify-between w-full items-center mb-4 max-w-[600px]">
              <h2 className="text-stone-400 uppercase tracking-widest text-sm font-bold">Cartel General</h2>
              <button 
                onClick={() => handleDownload(generalPosterRef.current, `${settings.title || 'Ciclo'} - Cartel General`)}
                className="flex items-center gap-2 text-xs bg-white text-black px-3 py-1 rounded font-bold hover:bg-stone-200 transition-colors"
              >
                <IconDownload /> PNG
              </button>
            </div>
            <div className="shadow-2xl shadow-black">
              <PosterPreview 
                ref={generalPosterRef}
                settings={settings} 
                movies={movies} 
                type="list" 
                themeStyle={currentThemeStyle}
                customColors={customColors}
              />
            </div>
         </div>

         {/* Section: Individual Posters */}
         <div className="w-full max-w-6xl">
           <div className="flex justify-between items-center border-t border-white/10 pt-8 mb-6 max-w-4xl mx-auto">
              <h2 className="text-stone-400 uppercase tracking-widest text-sm font-bold">Individual Posters</h2>
              
              {/* Toggle for View Mode */}
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                 <button 
                  onClick={() => setIndividualViewMode('story')}
                  className={`px-4 py-1 rounded text-xs font-bold uppercase ${individualViewMode === 'story' ? 'bg-white text-black' : 'text-stone-500 hover:text-white'}`}
                 >
                   Story (9:16)
                 </button>
                 <button 
                  onClick={() => setIndividualViewMode('feed')}
                  className={`px-4 py-1 rounded text-xs font-bold uppercase ${individualViewMode === 'feed' ? 'bg-white text-black' : 'text-stone-500 hover:text-white'}`}
                 >
                   Post (4:5)
                 </button>
              </div>
           </div>

           <div className="flex flex-wrap justify-center gap-8">
             {movies.map((movie, idx) => (
               <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="shadow-xl shadow-black transform hover:scale-[1.02] transition-transform duration-300">
                    <PosterPreview 
                      ref={el => { storyPosterRefs.current[idx] = el; }}
                      settings={settings} 
                      movies={movies} 
                      type={individualViewMode} // Dynamic type based on toggle
                      targetMovie={movie}
                      themeStyle={currentThemeStyle}
                      customColors={customColors}
                    />
                  </div>
                  <button 
                    onClick={() => handleDownload(storyPosterRefs.current[idx], `${settings.title || 'Ciclo'} - ${movie.title} - ${individualViewMode === 'story' ? 'Story' : 'Post'}`)}
                    className="text-stone-500 hover:text-white text-xs flex items-center gap-1 mt-2"
                  >
                    <IconDownload /> Descargar
                  </button>
               </div>
             ))}
             {movies.length === 0 && <div className="text-stone-600 italic">Agrega películas para ver los carteles individuales...</div>}
           </div>
         </div>

      </div>

    </div>
  );
};

export default App;