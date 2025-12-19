import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Type } from 'lucide-react';

const GOOGLE_FONTS = [
    "Abril Fatface", "Acme", "Alegreya", "Alegreya Sans", "Amatic SC", "Amiri", "Anton", "Archivo", "Archivo Black",
    "Arimo", "Arvo", "Asap", "Asap Condensed", "Assistant", "Barlow", "Barlow Condensed", "Bebas Neue", "Bitter",
    "Bowlby One SC", "Bree Serif", "Cabin", "Cairo", "Cardo", "Catamaran", "Caveat", "Chakra Petch", "Cinzel", "Comfortaa",
    "Comic Neue", "Concert One", "Cormorant Garamond", "Crete Round", "Crimson Text", "Cuprum", "Dancing Script", "Darker Grotesque",
    "Didact Gothic", "DM Sans", "DM Serif Display", "Dosis", "EB Garamond", "Eczar", "El Messiri", "Exo", "Exo 2",
    "Fira Sans", "Fira Sans Condensed", "Fjalla One", "Francois One", "Frank Ruhl Libre", "Fredoka One", "Garamond", "Gloria Hallelujah",
    "Great Vibes", "Heebo", "Hind", "Hind Madurai", "Hind Siliguri", "IBM Plex Mono", "IBM Plex Sans", "IBM Plex Sans Condensed",
    "IBM Plex Serif", "Inconsolata", "Indie Flower", "Inter", "Josefin Sans", "Josefin Slab", "Kanit", "Karla", "Kaushan Script",
    "Lato", "Libre Baskerville", "Libre Franklin", "Lilita One", "Lobster", "Lora", "M PLUS Rounded 1c", "Manrope", "Maven Pro",
    "Merriweather", "Merriweather Sans", "Modak", "Montserrat", "Mukta", "Muli", "Nanum Gothic", "Neuton", "Noto Sans",
    "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Noto Sans TC", "Noto Serif", "Noto Serif JP", "Noto Serif KR", "Noto Serif SC",
    "Noto Serif TC", "Nunito", "Nunito Sans", "Old Standard TT", "Open Sans", "Orbitron", "Oswald", "Outfit", "Overpass",
    "Oxygen", "Pacifico", "Passion One", "Pathway Gothic One", "Patrick Hand", "Patua One", "Play", "Playfair Display",
    "Poppins", "Prata", "Prompt", "PT Sans", "PT Sans Caption", "PT Sans Narrow", "PT Serif", "Public Sans", "Quicksand",
    "Rajdhani", "Raleway", "Red Hat Display", "Righteous", "Roboto", "Roboto Condensed", "Roboto Mono", "Roboto Slab",
    "Rokkitt", "Rubik", "Russo One", "Sacramento", "Sarala", "Satisfy", "Shadows Into Light", "Shrikhand", "Signika",
    "Slabo 27px", "Source Code Pro", "Source Sans Pro", "Source Serif Pro", "Space Grotesk", "Space Mono", "Spectral", "Staatliches",
    "Tajawal", "Teko", "Titillium Web", "Ubuntu", "Ubuntu Condensed", "Ubuntu Mono", "Varela Round", "Vollkorn", "Work Sans",
    "Yanone Kaffeesatz", "Yellowtail", "Zilla Slab"
];

const loadFont = (fontFamily) => {
    if (!fontFamily) return;
    const linkId = `font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
};

const FontPicker = ({ selectedFont, onFontChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load the currently selected font on mount/update
    useEffect(() => {
        if (selectedFont) {
            loadFont(selectedFont);
        }
    }, [selectedFont]);

    const filteredFonts = GOOGLE_FONTS.filter(font =>
        font.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="flex items-center justify-between w-full bg-black border border-zinc-800 hover:border-zinc-700 rounded-lg p-2 cursor-pointer transition-colors group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        <Type size={16} />
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Font Family</span>
                        <span className="text-xs text-zinc-200 truncate font-medium" style={{ fontFamily: selectedFont }}>
                            {selectedFont || 'Select Font'}
                        </span>
                    </div>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[300px] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search fonts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors placeholder:text-zinc-600"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                        {filteredFonts.length === 0 ? (
                            <div className="py-4 text-center text-xs text-zinc-500 italic">
                                No fonts found
                            </div>
                        ) : (
                            filteredFonts.map(font => (
                                <button
                                    key={font}
                                    onClick={() => {
                                        onFontChange(font);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    onMouseEnter={() => loadFont(font)} // Preload on hover
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${selectedFont === font
                                            ? 'bg-rose-500/10 text-rose-500'
                                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                                        }`}
                                >
                                    <span
                                        className="text-sm truncate mr-2"
                                        style={{ fontFamily: font }}
                                    >
                                        {font}
                                    </span>
                                    {selectedFont === font && <Check size={14} />}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="p-2 border-t border-zinc-800 bg-zinc-950 text-[10px] text-zinc-600 text-center">
                        {filteredFonts.length} fonts available
                    </div>
                </div>
            )}
        </div>
    );
};

export default FontPicker;
