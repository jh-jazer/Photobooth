import React from 'react';
import { Camera, Sparkles, Zap, Share2, ArrowRight, Aperture } from 'lucide-react';

const LandingPage = ({ onStart }) => {
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
                <button className="hidden lg:block text-sm font-bold bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full border border-white/10 transition-all backdrop-blur-md">
                    Gallery
                </button>
            </nav>

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
                    Professional grade lighting, instant filters, and high-resolution prints.
                    The modern photobooth experience re-imagined for your event.
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

                    <button className="px-8 py-5 bg-zinc-900/50 hover:bg-zinc-800 text-white font-bold text-lg rounded-2xl border border-zinc-700 backdrop-blur-sm transition-all hover:-translate-y-1">
                        How it works
                    </button>
                </div>

            </main>

            {/* Feature Pills */}
            <div className="absolute bottom-12 left-0 w-full overflow-hidden">
                <div className="flex justify-center gap-4 lg:gap-12 opacity-50 px-6 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg"><Aperture size={16} /></div>
                        <div className="text-xs font-bold uppercase tracking-wider">4K Quality</div>
                    </div>
                    <div className="hidden lg:block w-px h-8 bg-zinc-800"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg"><Zap size={16} /></div>
                        <div className="text-xs font-bold uppercase tracking-wider">Instant Print</div>
                    </div>
                    <div className="hidden lg:block w-px h-8 bg-zinc-800"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg"><Share2 size={16} /></div>
                        <div className="text-xs font-bold uppercase tracking-wider">Cloud Share</div>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-rose-500/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

        </div>
    );
};

export default LandingPage;
