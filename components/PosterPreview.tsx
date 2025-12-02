
import React, { forwardRef } from 'react';
import { Movie, CycleSettings, ThemeStyle, CustomColors } from '../types';

interface PosterProps {
  settings: CycleSettings;
  movies: Movie[];
  type: 'story' | 'feed' | 'list'; // 'story' is vertical 9:16, 'feed' is 4:5, 'list' is the summary
  targetMovie?: Movie; // Only for 'story' and 'feed' type
  themeStyle: ThemeStyle;
  customColors?: CustomColors;
}

const PosterPreview = forwardRef<HTMLDivElement, PosterProps>(({ settings, movies, type, targetMovie, themeStyle, customColors }, ref) => {
  const theme = themeStyle;
  
  // Resolve Font
  const fontClass = customColors?.font || theme.fontTitle;
  
  // Resolve Specific Colors with Fallbacks
  const colorTitle = customColors?.colorTitle || '#ffffff';
  const colorSubtitle = customColors?.colorSubtitle || '#f1f1f1';
  const colorDescription = customColors?.colorDescription || '#d1d5db'; // gray-300
  const colorDuration = customColors?.colorDuration || '#9ca3af'; // gray-400
  const colorTime = customColors?.colorTime || '#e50914';
  
  const titleScale = customColors?.titleScale || 1;

  // Background Logic
  let backgroundStyle: React.CSSProperties = {
    backgroundColor: '#1a1a1a', // Default dark
  };
  let bgClass = '';

  const useGradient = customColors?.backgroundType === 'gradient';
  const useSolid = customColors?.backgroundType === 'solid';

  if (useGradient && customColors?.gradient) {
    const { start, via, end } = customColors.gradient;
    backgroundStyle = { background: `linear-gradient(to bottom, ${start}, ${via}, ${end})` };
  } else if (useSolid && customColors?.bg) {
    backgroundStyle = { backgroundColor: customColors.bg };
  } else if (!customColors) {
    // Fallback to theme classes if no custom overrides
    bgClass = theme.bg;
  } else {
    // Custom colors exist but incomplete config, fallback to solid
     backgroundStyle = { backgroundColor: customColors.bg || '#000000' };
  }

  // Common Shadow Styles for Text
  const textShadowStyle = { textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' };
  const titleShadowStyle = { textShadow: '0 5px 5px rgba(0,0,0,0.8)' }; // Matches General Poster Style
  
  // New Black Stroke Style for Time (Simulated with text-shadow for html2canvas compatibility)
  const timeShadowStyle = { 
    textShadow: `
      -1px -1px 0 #000,  
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000,
      -2px 0 0 #000,
      2px 0 0 #000,
      0 -2px 0 #000,
      0 2px 0 #000,
      2px 2px 4px rgba(0,0,0,0.8)
    `
  };

  // Common Subtitle Style (Matched to General Poster)
  const subtitleStyleClass = `${theme.fontBody} uppercase tracking-[0.3em] font-bold`;

  // --- 1. FEED FORMAT (4:5) ---
  if (type === 'feed' && targetMovie) {
    // Base size for Feed was text-5xl which is 3rem (48px)
    const titleFontSize = `${3 * titleScale}rem`;

    return (
      <div 
        ref={ref}
        className={`portrait-container relative flex flex-col justify-start overflow-hidden p-6 ${bgClass}`}
        style={{ 
          width: '400px', 
          aspectRatio: '4/5', 
          borderRadius: '20px',
          border: '2px solid #4a4a4a',
          fontFamily: "'Roboto', sans-serif",
          ...backgroundStyle
        }}
      >
         {/* Background Fallback if theme class used and not custom */}
         {!customColors && (
           <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-90 z-0 pointer-events-none`}></div>
        )}

        <div className="relative z-10 w-full flex flex-col justify-start items-center flex-grow content-wrapper text-[#e0e0e0]">
            {/* Header: Title/Logo */}
            <header className="text-center flex flex-col items-center mb-4 mt-8">
                <h1 
                  className={`${fontClass} leading-none tracking-tighter`} 
                  style={{ color: colorTitle, ...titleShadowStyle, fontSize: titleFontSize }}
                >
                  {settings.title}
                </h1>
            </header>
            
            {/* Date */}
            <h3 className={`day-title ${fontClass} text-[1.6rem] mt-2 tracking-[0.05em]`} style={{ color: colorTime }}>
               {targetMovie.date}
            </h3>

            {/* Subtitle / Day Theme */}
            <h4 className={`day-theme-title ${subtitleStyleClass} text-[0.9rem] text-center`} style={{...textShadowStyle, color: colorSubtitle }}>
               {settings.subtitle}
            </h4>

            {/* Venue Text - Moved Here */}
            <p className={`text-[0.65rem] uppercase tracking-widest opacity-80 mt-1 mb-6 text-center`} style={{ color: colorSubtitle }}>
               {settings.venue}
            </p>

            {/* Main Content: Poster + Info */}
            <main className="w-full flex-grow flex items-center justify-center">
                <section className="flex flex-row items-center justify-center gap-5 w-full">
                    <div className="poster-container rounded bg-[#2d2d2d] flex-shrink-0" style={{ width: '130px', height: '195px' }}>
                        {targetMovie.posterImage ? (
                           <img src={targetMovie.posterImage} alt={targetMovie.title} className="poster-image rounded w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-white/30">NO POSTER</div>
                        )}
                    </div>
                    <div className="text-left flex flex-col justify-center h-full w-44 movie-info-block">
                        <div>
                            <h4 className="movie-title font-bold text-[1.1rem] leading-[1.2]" style={{ color: colorTitle }}>
                              <i>{targetMovie.title}</i> {targetMovie.year && `(${targetMovie.year})`}
                            </h4>
                            <p className="text-xs mt-1" style={{ color: colorDuration }}>Duración: {targetMovie.duration}</p>
                            {targetMovie.director && (
                                <p className="text-[10px] text-white/60 uppercase tracking-wide mt-1" style={{ color: colorDuration }}>
                                  Dir. {targetMovie.director}
                                </p>
                            )}
                            <p className="movie-description mt-2 text-[0.8rem] leading-[1.3]" style={{ color: colorDescription }}>
                              {targetMovie.synopsis}
                            </p>
                        </div>
                        {/* Time at bottom of text block */}
                        <p className={`movie-time ${fontClass} mt-4 text-[1.5rem] italic text-center`} style={{ ...timeShadowStyle, color: colorTime }}>
                           {targetMovie.time} hrs
                        </p>
                    </div>
                </section>
            </main>
        </div>
      </div>
    );
  }

  // --- 2. STORY FORMAT (9:16) ---
  if (type === 'story' && targetMovie) {
    // Base size for Story was text-6xl which is 3.75rem (60px)
    const titleFontSize = `${3.75 * titleScale}rem`;

    return (
      <div 
        ref={ref}
        className={`story-container relative flex flex-col overflow-hidden p-4 ${bgClass}`}
        style={{ 
          width: '380px', 
          aspectRatio: '9/16',
          borderRadius: '20px',
          border: '2px solid #4a4a4a',
          fontFamily: "'Roboto', sans-serif",
          padding: '1rem 0.5rem',
          ...backgroundStyle
        }}
      >
        {/* Background Fallback */}
        {!customColors && (
           <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-90 z-0 pointer-events-none`}></div>
        )}

        <div className="relative z-10 flex-grow flex flex-col justify-between px-4 content-wrapper text-[#e0e0e0]">
            <main>
                {/* Header Logo Area */}
                <header className="text-center flex flex-col items-center mb-6 mt-12">
                     <h1 
                        className={`${fontClass} leading-none tracking-tighter`} 
                        style={{ color: colorTitle, ...titleShadowStyle, fontSize: titleFontSize }}
                     >
                       {settings.title}
                     </h1>
                </header>

                <section className="px-2">
                    <div className="text-center mb-6">
                        <h3 className={`text-xl day-title ${fontClass} tracking-[0.05em]`} style={{ color: colorTime }}>
                          {targetMovie.date}
                        </h3>
                         {/* Subtitle / Day Theme */}
                        <h4 className={`text-lg day-theme-title ${subtitleStyleClass} mt-2`} style={{...textShadowStyle, color: colorSubtitle }}>
                          {settings.subtitle}
                        </h4>
                        {/* Venue Text - Moved Here */}
                        <p className={`text-[0.75rem] uppercase tracking-widest opacity-80 mt-2`} style={{ color: colorSubtitle }}>
                           {settings.venue}
                        </p>
                    </div>
                    
                    <div className="flex flex-row items-start gap-3 max-w-2xl mx-auto">
                        <div className="poster-container rounded bg-[#2d2d2d] flex-shrink-0" style={{ width: '143px', height: '215px' }}>
                             {targetMovie.posterImage ? (
                                <img src={targetMovie.posterImage} alt={targetMovie.title} className="poster-image rounded w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-white/30">NO POSTER</div>
                              )}
                        </div>
                        <div className="flex-grow text-left pr-4">
                            <h4 className="movie-title font-bold text-[1.1rem] leading-[1.15]" style={{ color: colorTitle }}>
                              <i>{targetMovie.title}</i> {targetMovie.year && `(${targetMovie.year})`}
                            </h4>
                             {targetMovie.director && (
                                <p className="text-[10px] text-white/60 uppercase tracking-wide mt-1 mb-1" style={{ color: colorDuration }}>
                                  Dir. {targetMovie.director}
                                </p>
                            )}
                            <p className="movie-description mt-2 text-[0.75rem] leading-[1.3] text-justify" style={{ color: colorDescription }}>
                               {targetMovie.synopsis}
                            </p>
                            <p className="text-xs mt-3" style={{ color: colorDuration }}>Duración: {targetMovie.duration}</p>
                            
                            {/* Time Display - Moved Here */}
                            <p className={`${fontClass} text-[1.4rem] mt-4 italic text-center`} style={{ ...timeShadowStyle, color: colorTime }}>
                              {targetMovie.time} hrs
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="text-center mb-2 mt-auto">
                <div className="flex flex-row justify-around items-center w-full mx-auto gap-x-1">
                     <div className="flex flex-col items-center">
                          <h5 className="text-sm sede-text font-display shadow-black drop-shadow-sm" style={{ color: colorSubtitle }}>Impulsa</h5>
                          {settings.organizerLogo ? (
                             <img src={settings.organizerLogo} alt="Org" className="h-20 w-auto object-contain" />
                          ) : <div className="h-20 w-16 bg-white/5 rounded flex items-center justify-center text-[9px] text-white/30">LOGO</div>}
                      </div>
                      
                      {/* Sede moved to right, Curaduría removed */}
                      <div className="flex flex-col items-center">
                          <h5 className="text-sm sede-text font-display shadow-black drop-shadow-sm" style={{ color: colorSubtitle }}>Sede</h5>
                          {settings.venueLogo ? (
                             <img src={settings.venueLogo} alt="Venue" className="h-20 w-auto object-contain" />
                          ) : <div className="h-20 w-16 bg-white/5 rounded flex items-center justify-center text-[9px] text-white/30">LOGO</div>}
                      </div>
                </div>
            </footer>
        </div>
      </div>
    );
  }

  // --- 3. GENERAL LIST FORMAT (Variable Height) ---
  // Base size for List was text-7xl which is 4.5rem (72px)
  const titleFontSize = `${4.5 * titleScale}rem`;

  return (
    <div 
      ref={ref}
      // Fixed Width, but Height Auto to allow expansion without limit and shrinking for few movies
      className={`w-[600px] h-auto flex-shrink-0 relative overflow-hidden flex flex-col p-8 ${bgClass} ${theme.textSecondary}`}
      style={{ ...backgroundStyle }}
    >
      {/* Background Fallback */}
      {!customColors && (
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-90 z-0`}></div>
      )}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full min-h-[600px]">
        {/* Main Title */}
        <div className="text-center mb-6 pb-4 border-b-2 border-white/10">
           <h1 
             className={`${fontClass} leading-[0.85] mb-2`}
             style={{ color: colorTitle, ...titleShadowStyle, fontSize: titleFontSize }}
           >
            {settings.title}
          </h1>
          <h2 className={`${subtitleStyleClass} text-2xl`} style={{ color: colorSubtitle }}>
            {settings.subtitle}
          </h2>
          <div className="mt-2 text-xs font-bold text-white/50 bg-white/5 inline-block px-3 py-1 rounded-full uppercase tracking-wider">
            {settings.venue}
          </div>
        </div>

        {/* List of Movies - Vertical Stack Layout (No Grid limit) */}
        <div className="flex-1 flex flex-col justify-start gap-4 mb-8">
          {movies.length === 0 && <div className="text-center opacity-30 mt-20 text-xl">Agrega películas...</div>}
          
          <div className="flex flex-col gap-4">
            {movies.map((movie, idx) => (
              <div key={idx} className="flex gap-4 items-start group bg-black/20 p-2 rounded border border-transparent hover:border-white/10 transition-colors">
                <div className={`shrink-0 bg-black shadow-lg overflow-hidden relative border border-white/10 w-20 aspect-[2/3]`}>
                    {movie.posterImage && <img src={movie.posterImage} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className={`${fontClass} text-2xl uppercase leading-none`}
                        style={{ color: colorTime }}
                      >
                         {movie.date}
                      </span>
                    </div>
                    
                    <h3 className={`${theme.fontBody} text-xl font-bold leading-tight truncate`} style={{ color: colorTitle }}>
                      {movie.title}
                    </h3>
                    
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: colorDuration }}>
                       {movie.year && <span>{movie.year} • </span>} {movie.time} hrs • {movie.duration}
                    </p>
                    {movie.director && (
                      <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1" style={{ color: colorDescription }}>
                         Dir. {movie.director}
                      </p>
                    )}
                    
                    <p className="text-xs leading-tight" style={{ color: colorDescription }}>
                      {movie.synopsis}
                    </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Pushed to bottom of content flow */}
        <div className="mt-auto pt-4 border-t border-white/20">
             <div className="flex justify-around items-end w-full pt-2">
                {settings.organizerLogo && (
                  <div className="flex flex-col items-center">
                    <img src={settings.organizerLogo} alt="Org" className="h-20 w-auto object-contain filter grayscale contrast-125 opacity-80" />
                  </div>
                )}
                {settings.venueLogo && (
                  <div className="flex flex-col items-center">
                    <img src={settings.venueLogo} alt="Venue" className="h-20 w-auto object-contain opacity-80" />
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
});

PosterPreview.displayName = 'PosterPreview';
export default PosterPreview;
