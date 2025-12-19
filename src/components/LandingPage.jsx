import React from 'react';
import { Camera, Sparkles, Zap, Share2, ArrowRight, Aperture } from 'lucide-react';
import { usePhotoBooth } from './photobooth/PhotoBoothContext';

const LandingPage = ({ onStart, initialShowGallery = false, navigationSource = 'landing' }) => {
    const { galleryImages, clearGallery } = usePhotoBooth();
    const [showGallery, setShowGallery] = React.useState(initialShowGallery);
    const [showHowItWorks, setShowHowItWorks] = React.useState(false);

    const handlePrint = (imgUrl) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const content = `
            <html>
                <head>
                    <title>Print Photo</title>
                    <style>
                        @page { size: landscape; margin: 0; }
                        body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                        img { height: 100%; width: auto; object-fit: contain; }
                    </style>
                </head>
                <body>
                    <img src="${imgUrl}" onload="window.print(); setTimeout(() => { window.frameElement.remove(); }, 1000);" />
                </body>
            </html>
        `;

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();
    };

    const steps = [
        {
            icon: <Zap size={32} className="text-amber-400" />,
            title: "Configure",
            desc: "Choose from our preset layouts or upload your own custom frame."
        },
        {
            icon: <Camera size={32} className="text-rose-500" />,
            title: "Capture",
            desc: "Strike a pose! Our automatic timer will guide you through the shots."
        },
        {
            icon: <Sparkles size={32} className="text-purple-400" />,
            title: "Customize",
            desc: "Add personal flair with stickers, text, and drawing tools."
        },
        {
            icon: <Share2 size={32} className="text-blue-400" />,
            title: "Print & Share",
            desc: "Download as PDF/Image or print directly. Your moments are auto-saved!"
        }
    ];

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">

            {/* Nav / Header */}
            <nav className="absolute top-0 left-0 w-full p-6 lg:p-12 flex justify-between items-center z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Camera size={24} fill="currentColor" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">Potobooth</span>
                </div>
                <button
                    onClick={() => setShowGallery(true)}
                    className="hidden lg:block text-sm font-bold bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full border border-white/10 transition-all backdrop-blur-md"
                >
                    Gallery ({galleryImages.length})
                </button>
            </nav>

            {/* How It Works Modal */}
            {showHowItWorks && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setShowHowItWorks(false)} />
                    <div className="relative z-10 w-full max-w-5xl flex flex-col p-6 lg:p-12">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">How it Works</h2>
                                <p className="text-zinc-400 font-medium">Simple steps to capture your memories</p>
                            </div>
                            <button
                                onClick={() => setShowHowItWorks(false)}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors"
                            >
                                <ArrowRight size={24} className="rotate-180" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {steps.map((step, i) => (
                                <div key={i} className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl flex flex-col gap-4 text-left hover:bg-zinc-900 transition-colors">
                                    <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center shadow-inner">
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                    <div className="mt-auto pt-4 flex gap-1">
                                        <div className="h-1 w-8 bg-rose-500 rounded-full"></div>
                                        <div className="h-1 w-2 bg-zinc-800 rounded-full"></div>
                                        <div className="h-1 w-2 bg-zinc-800 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => { setShowHowItWorks(false); onStart(); }}
                                className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-rose-600/20"
                            >
                                Get Started Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Modal */}
            {showGallery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setShowGallery(false)} />
                    <div className="relative z-10 w-full max-w-7xl h-[95vh] flex flex-col p-6 lg:p-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Gallery</h2>
                                <p className="text-zinc-400 font-medium">Your captured moments ({galleryImages.length})</p>
                            </div>
                            <div className="flex gap-4">
                                {galleryImages.length > 0 && (
                                    <button
                                        onClick={clearGallery}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-colors"
                                    >
                                        Clear Gallery
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowGallery(false);
                                        if (navigationSource === 'photobooth') {
                                            // User came from photobooth, do nothing (stay on landing)
                                        }
                                    }}
                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors"
                                    title={navigationSource === 'photobooth' ? 'Back to Landing' : 'Close'}
                                >
                                    <ArrowRight size={24} className="rotate-180" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {galleryImages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center">
                                        <Camera size={40} className="opacity-50" />
                                    </div>
                                    <p className="text-xl font-medium">No photos yet. Start a session!</p>
                                    <button
                                        onClick={() => { setShowGallery(false); onStart(); }}
                                        className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors"
                                    >
                                        Start Session
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pb-12">
                                    {galleryImages.map((img, i) => (
                                        <div key={i} className="group relative bg-zinc-900 p-2 rounded-2xl shadow-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                                            <div className="aspect-[1/2] rounded-xl overflow-hidden relative">
                                                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-contain bg-zinc-950" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <a
                                                        href={img}
                                                        download={`photobooth-gallery-${i}.png`}
                                                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                                        title="Download"
                                                    >
                                                        <Share2 size={20} />
                                                    </a>
                                                    <button
                                                        onClick={() => handlePrint(img)}
                                                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                                        title="Print"
                                                    >
                                                        <Zap size={20} fill="currentColor" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Hero Content */}
            <main className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center gap-8 max-w-4xl">

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl animate-fade-in-up">
                    <Sparkles size={14} className="text-amber-400" fill="currentColor" />
                    <span className="text-xs font-bold tracking-widest uppercase text-zinc-300">Premium Photo Experience</span>
                </div>

                <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-2xl">
                    CAPTURE YOUR <br />
                    <span className="text-rose-500 inline-block transform hover:scale-105 transition-transform duration-500 cursor-default selection:bg-rose-500/30">MOMENT</span>
                </h1>

                <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl font-medium leading-relaxed">
                    Create stunning photo strips with our powerful editor.
                    Customize layouts, add stickers & text, use your own templates, and print instantly.
                </p>

                <div className="flex flex-col lg:flex-row gap-4 w-full justify-center mt-4">
                    <button
                        onClick={onStart}
                        className="group relative px-8 py-5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg rounded-2xl transition-all shadow-2xl shadow-rose-600/20 hover:shadow-rose-600/40 hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-12 group-hover:animate-shine"></div>
                        <span className="flex items-center justify-center gap-3">
                            Start Session <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <button
                        onClick={() => setShowHowItWorks(true)}
                        className="px-8 py-5 bg-zinc-900/50 hover:bg-zinc-800 text-white font-bold text-lg rounded-2xl border border-zinc-700 backdrop-blur-sm transition-all hover:-translate-y-1"
                    >
                        How it works
                    </button>
                </div>

            </main>

            {/* Feature Pills */}
            <div className="absolute bottom-12 left-0 w-full overflow-hidden">
                <div className="flex justify-center gap-4 lg:gap-12 opacity-50 px-6 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg"><Aperture size={16} /></div>
                        <div className="text-xs font-bold uppercase tracking-wider">High Res Output</div>
                    </div>
                    <div className="hidden lg:block w-px h-8 bg-zinc-800"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg"><Zap size={16} /></div>
                        <div className="text-xs font-bold uppercase tracking-wider">Custom Templates</div>
                    </div>
                    <div className="hidden lg:block w-px h-8 bg-zinc-800"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg"><Share2 size={16} /></div>
                        <div className="text-xs font-bold uppercase tracking-wider">Print Ready PDF</div>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-rose-500/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

        </div>
    );
};

export default LandingPage;
