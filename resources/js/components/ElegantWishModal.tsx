import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { 
    Download, 
    Printer, 
    X, 
    Sparkles, 
    Type, 
    Layout, 
    Check, 
    Heart, 
    BookOpen
} from 'lucide-react';

interface ElegantWishModalProps {
    isOpen: boolean;
    onClose: () => void;
    wish: {
        name: string;
        message: string;
        created_at: string;
    } | null;
    coupleNames?: {
        bride: string;
        groom: string;
        date: string;
    };
}

type ThemeKey = 'ivory' | 'midnight' | 'emerald' | 'rose';
type FormatKey = 'square' | 'portrait';
type FontKey = 'serif' | 'script';

interface ThemeConfig {
    name: string;
    cardBg: string;
    text: string;
    accent: string;
    border: string;
    quoteColor: string;
    accentBg: string;
    patternColor: string;
}

const THEMES: Record<ThemeKey, ThemeConfig> = {
    ivory: {
        name: 'Ivory Silk',
        cardBg: '#FCF9F3',
        text: '#2C2B29',
        accent: '#B8976C',
        border: 'border-amber-200/60',
        quoteColor: '#E6DCCF',
        accentBg: 'bg-[#B8976C]/10',
        patternColor: '#B8976C'
    },
    midnight: {
        name: 'Midnight Gold',
        cardBg: '#0D0E15',
        text: '#EDEAE4',
        accent: '#D4AF37',
        border: 'border-amber-500/30',
        quoteColor: '#1F2232',
        accentBg: 'bg-[#D4AF37]/10',
        patternColor: '#D4AF37'
    },
    emerald: {
        name: 'Royal Emerald',
        cardBg: '#0A251E',
        text: '#F5F2EC',
        accent: '#C79380',
        border: 'border-[#C79380]/40',
        quoteColor: '#123A30',
        accentBg: 'bg-[#C79380]/15',
        patternColor: '#C79380'
    },
    rose: {
        name: 'Rose Copper',
        cardBg: '#FAF0EF',
        text: '#432E2A',
        accent: '#D17C64',
        border: 'border-[#D17C64]/40',
        quoteColor: '#F2DEDB',
        accentBg: 'bg-[#D17C64]/10',
        patternColor: '#D17C64'
    }
};

export default function ElegantWishModal({ isOpen, onClose, wish, coupleNames }: ElegantWishModalProps) {
    if (!isOpen || !wish) return null;

    const [activeTheme, setActiveTheme] = useState<ThemeKey>('ivory');
    const [activeFormat, setActiveFormat] = useState<FormatKey>('square');
    const [activeFont, setActiveFont] = useState<FontKey>('serif');
    const [showSubtitle, setShowSubtitle] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const theme = THEMES[activeTheme];

    // Couple Details Fallback
    const bride = coupleNames?.bride || 'Alaa';
    const groom = coupleNames?.groom || 'Mahmoud';
    const rawDate = coupleNames?.date || '2026-08-15 18:00:00';

    const formattedDate = () => {
        try {
            const date = new Date(rawDate.replace(' ', 'T'));
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return 'August 15, 2026';
        }
    };

    // Card dimensions based on aspect ratio
    const formatStyles = {
        square: 'w-[450px] h-[450px]',
        portrait: 'w-[450px] h-[560px]'
    };

    // Download High-Resolution Keepsake Card
    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);

        try {
            // Take a pixel-perfect snapshot using html-to-image
            // This captures the native browser-rendered DOM with perfect Arabic cursiveness, fonts, and RTL layouts!
            const dataUrl = await toPng(cardRef.current, {
                pixelRatio: 3, // Multiplies resolution for crystal-clear prints (e.g. 1350x1350px or 1350x1680px)
                backgroundColor: theme.cardBg,
                style: {
                    transform: 'none',
                    borderRadius: '0'
                },
                cacheBust: true
            });

            const link = document.createElement('a');
            link.download = `Keepsake_Wish_${wish.name.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating card image:', error);
            alert('Failed to generate card image. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Print Keepsake Card
    const handlePrint = () => {
        if (!cardRef.current) return;
        setIsPrinting(true);

        // Render clean dynamic printable frame
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Popup blocked! Please allow popups to print.');
            setIsPrinting(false);
            return;
        }

        const cardHtml = cardRef.current.outerHTML;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Wedding Wish Keepsake</title>
                    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Pinyon+Script&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script>
                        tailwind.config = {
                            theme: {
                                extend: {
                                    fontFamily: {
                                        serif: ['"Cormorant Garamond"', 'serif'],
                                        script: ['"Pinyon Script"', 'cursive'],
                                        sans: ['"Instrument Sans"', 'sans-serif'],
                                    }
                                }
                            }
                        }
                    </script>
                    <style>
                        body {
                            margin: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            background-color: #fff;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        @media print {
                            body {
                                background: none;
                            }
                            .no-print {
                                display: none;
                            }
                            .print-container {
                                box-shadow: none !important;
                                border: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container flex items-center justify-center p-8">
                        ${cardHtml}
                    </div>
                    <script>
                        // Wait briefly to ensure fonts render, then trigger print
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 1200);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
        setIsPrinting(false);
    };

    // Corner Ornament Vector Drawing (SVG)
    const CornerOrnament = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
        const rotationMap = {
            'top-left': 'rotate-0 top-6 left-6',
            'top-right': 'rotate-90 top-6 right-6',
            'bottom-left': '-rotate-90 bottom-6 left-6',
            'bottom-right': 'rotate-180 bottom-6 right-6'
        };

        return (
            <svg 
                className={`absolute w-12 h-12 pointer-events-none transition-colors duration-500 ${rotationMap[position]}`}
                viewBox="0 0 100 100" 
                fill="none" 
                stroke={theme.patternColor} 
                strokeWidth="1.5"
                opacity="0.35"
            >
                {/* Vintage organic botanical corner scroll */}
                <path d="M 10 10 C 35 10, 45 20, 45 45" />
                <path d="M 10 10 C 10 35, 20 45, 45 45" />
                <path d="M 15 15 C 25 15, 30 20, 30 30" />
                <path d="M 15 15 C 15 25, 20 30, 30 30" />
                <circle cx="45" cy="45" r="2.5" fill={theme.patternColor} />
                <circle cx="30" cy="30" r="1.5" fill={theme.patternColor} />
            </svg>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full flex flex-col md:flex-row border border-stone-200 animate-in fade-in zoom-in duration-300 max-h-[90vh]">
                
                {/* LEFT COLUMN: THE PREMIUM KEEPSAKE CARD PREVIEW */}
                <div className="flex-1 bg-stone-100 p-8 flex items-center justify-center overflow-auto border-b md:border-b-0 md:border-r border-stone-200">
                    <div className="scale-[0.8] sm:scale-90 md:scale-95 lg:scale-100 transition-all duration-300">
                        <div 
                            ref={cardRef}
                            data-card-capture="true"
                            className={`relative flex flex-col items-center justify-between p-12 transition-all duration-500 select-none shadow-xl ${formatStyles[activeFormat]}`}
                            style={{ 
                                backgroundColor: theme.cardBg, 
                                color: theme.text,
                                fontFamily: '"Cormorant Garamond", serif'
                            }}
                        >
                            {/* Decorative Borders */}
                            <div className={`absolute inset-4 border-2 border-double rounded-2xl pointer-events-none transition-colors duration-500 ${theme.border}`} />
                            <div className={`absolute inset-5 border border-dashed rounded-2xl pointer-events-none opacity-40 transition-colors duration-500 ${theme.border}`} />

                            {/* Corner Ornaments */}
                            <CornerOrnament position="top-left" />
                            <CornerOrnament position="top-right" />
                            <CornerOrnament position="bottom-left" />
                            <CornerOrnament position="bottom-right" />

                            {/* Giant Quote Background Icon */}
                            <div 
                                className="absolute top-[20%] text-9xl font-serif italic select-none pointer-events-none font-bold opacity-10 transition-colors duration-500"
                                style={{ color: theme.quoteColor }}
                            >
                                “
                            </div>

                            {/* Upper spacing / ornament */}
                            <div className="flex flex-col items-center gap-1.5 mt-4 z-10">
                                <span className={`text-[9px] uppercase tracking-[0.5em] font-semibold transition-colors duration-500`} style={{ color: theme.accent }}>
                                    A Wedding Blessing
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-[1px]" style={{ backgroundColor: theme.accent }} />
                                    <Heart className="w-2.5 h-2.5 fill-current" style={{ color: theme.accent }} />
                                    <div className="w-6 h-[1px]" style={{ backgroundColor: theme.accent }} />
                                </div>
                            </div>

                            {/* Dynamic Wish Message */}
                            <div className="flex-1 flex items-center justify-center px-4 py-8 z-10">
                                <p 
                                    data-wish-message="true"
                                    className={`text-center font-serif leading-relaxed italic ${
                                        activeFormat === 'square' 
                                            ? 'text-lg md:text-xl' 
                                            : 'text-xl md:text-2xl'
                                    } tracking-wide text-stone-800`}
                                    style={{ color: theme.text }}
                                >
                                    "{wish.message}"
                                </p>
                            </div>

                            {/* Sender Info & Couple Subtitle */}
                            <div className="w-full flex flex-col items-center gap-6 z-10 mb-4">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-40">With Love From</span>
                                    <span 
                                        data-wish-name="true"
                                        className={`transition-all duration-300 ${
                                            activeFont === 'script' 
                                                ? 'font-script text-4xl leading-none mt-1' 
                                                : 'font-serif text-2xl font-bold tracking-tight'
                                        }`}
                                        style={{ color: theme.accent }}
                                    >
                                        {wish.name}
                                    </span>
                                </div>

                                {showSubtitle && (
                                    <div className="flex flex-col items-center w-full gap-2">
                                        <div className="w-24 h-[0.5px] opacity-30" style={{ backgroundColor: theme.text }} />
                                        <span className="text-[8px] uppercase tracking-[0.4em] opacity-50 text-center">
                                            In Celebration of <span data-couple-bride="true">{bride}</span> & <span data-couple-groom="true">{groom}</span>
                                        </span>
                                        <span className="text-[7px] font-sans uppercase tracking-[0.3em] opacity-40">
                                            {formattedDate()}
                                        </span>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: KEEPSAKE CUSTOMIZER SETTINGS */}
                <div className="w-full md:w-[380px] p-8 flex flex-col justify-between overflow-y-auto bg-white max-h-full">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-serif text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
                                Keepsake Customizer <Sparkles className="w-4 h-4 text-amber-500 fill-amber-100" />
                            </h3>
                            <p className="text-xs text-stone-400 mt-1">Design a breath-taking card of this wedding wish.</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1 pr-1">
                        
                        {/* 1. Theme Presets Selection */}
                        <div className="space-y-3">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block font-serif">1. Luxury Palette Presets</span>
                            <div className="grid grid-cols-2 gap-2.5">
                                {(Object.keys(THEMES) as ThemeKey[]).map((themeKey) => {
                                    const item = THEMES[themeKey];
                                    const isActive = activeTheme === themeKey;
                                    return (
                                        <button
                                            key={themeKey}
                                            onClick={() => setActiveTheme(themeKey)}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-300 group ${
                                                isActive 
                                                    ? 'border-stone-800 bg-stone-50 ring-1 ring-stone-800' 
                                                    : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'
                                            }`}
                                        >
                                            <div 
                                                className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center shrink-0" 
                                                style={{ backgroundColor: item.cardBg }}
                                            >
                                                {isActive && <Check className="w-3 h-3 text-stone-500 stroke-[3]" style={{ color: themeKey === 'midnight' || themeKey === 'emerald' ? '#fff' : '#2C2B29' }} />}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-xs font-semibold text-stone-800 block leading-tight truncate">{item.name}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Format & Layout Presets */}
                        <div className="space-y-3">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block font-serif">2. Card Format & Aspect Ratio</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveFormat('square')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-serif tracking-wider uppercase transition-all ${
                                        activeFormat === 'square'
                                            ? 'border-stone-800 bg-stone-800 text-white font-semibold'
                                            : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:bg-stone-50'
                                    }`}
                                >
                                    <Layout className="w-3.5 h-3.5" /> Square (1:1)
                                </button>
                                <button
                                    onClick={() => setActiveFormat('portrait')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-serif tracking-wider uppercase transition-all ${
                                        activeFormat === 'portrait'
                                            ? 'border-stone-800 bg-stone-800 text-white font-semibold'
                                            : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:bg-stone-50'
                                    }`}
                                >
                                    <Layout className="w-3.5 h-3.5 rotate-90" /> Portrait (4:5)
                                </button>
                            </div>
                        </div>

                        {/* 3. Typography Styles */}
                        <div className="space-y-3">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block font-serif">3. Guest Name Signature Font</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveFont('script')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-serif tracking-wider uppercase transition-all ${
                                        activeFont === 'script'
                                            ? 'border-stone-800 bg-stone-800 text-white font-semibold'
                                            : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:bg-stone-50'
                                    }`}
                                >
                                    <Type className="w-3.5 h-3.5" /> Romantic Script
                                </button>
                                <button
                                    onClick={() => setActiveFont('serif')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-serif tracking-wider uppercase transition-all ${
                                        activeFont === 'serif'
                                            ? 'border-stone-800 bg-stone-800 text-white font-semibold'
                                            : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:bg-stone-50'
                                    }`}
                                >
                                    <Type className="w-3.5 h-3.5" /> Elegant Serif
                                </button>
                            </div>
                        </div>

                        {/* 4. Display Settings */}
                        <div className="space-y-3">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block font-serif">4. Layout Configurations</span>
                            <label className="flex items-center gap-3 p-3 bg-stone-50 border rounded-xl border-stone-200 cursor-pointer hover:bg-stone-100/50 transition-all select-none">
                                <input
                                    type="checkbox"
                                    checked={showSubtitle}
                                    onChange={(e) => setShowSubtitle(e.target.checked)}
                                    className="w-4 h-4 rounded text-stone-800 focus:ring-stone-500 border-stone-300 accent-stone-800"
                                />
                                <div className="flex-1">
                                    <span className="text-xs font-semibold text-stone-800 block">Show Wedding Couple & Date</span>
                                    <span className="text-[10px] text-stone-400">Include bride/groom names and date at bottom</span>
                                </div>
                            </label>
                        </div>

                    </div>

                    {/* ACTIONS BAR: DOWNLOAD & PRINT */}
                    <div className="mt-8 pt-4 border-t border-stone-200 space-y-2">
                        
                        {/* High-Resolution Photo Download */}
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-serif tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" /> 
                            {isDownloading ? 'Generating Keepsake...' : 'Download Keepsake Photo'}
                        </button>

                        {/* Printable Keppsake Document */}
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-600 text-xs font-serif tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Printer className="w-4 h-4" /> 
                            {isPrinting ? 'Opening Printer...' : 'Print Elegant Card'}
                        </button>
                        
                    </div>

                </div>

            </div>
        </div>
    );
}
