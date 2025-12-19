import React, { useState, useEffect } from 'react';
import PhotoBooth from './components/PhotoBooth';
import LandingPage from './components/LandingPage';
import { Camera, Sparkles, X } from 'lucide-react';

import { PhotoBoothProvider } from './components/photobooth/PhotoBoothContext';

function App() {
    const [view, setView] = useState('landing');
    const [shouldOpenGallery, setShouldOpenGallery] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    const handleStartSession = () => {
        // Show loading
        setIsLoading(true);

        // Check if first visit
        const hasVisited = localStorage.getItem('photobooth_visited');

        // Show loading for 3 seconds
        setTimeout(() => {
            setIsLoading(false);
            setView('booth');

            // Show welcome modal if first visit
            if (!hasVisited) {
                setShowWelcome(true);
                localStorage.setItem('photobooth_visited', 'true');
            }
        }, 3000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden relative">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

                {/* Loading Content */}
                <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in duration-500">
                    <div className="relative">
                        {/* Spinning Ring */}
                        <div className="w-24 h-24 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                        {/* Camera Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Camera size={40} className="text-rose-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Setting Up POTOBOOTH</h2>
                        <p className="text-zinc-400 font-medium">Preparing your experience...</p>
                    </div>
                    {/* Progress Dots */}
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PhotoBoothProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-rose-500/30">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

                {/* Welcome Modal */}
                {showWelcome && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-rose-500/20 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-zinc-400 hover:text-white" />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <Sparkles size={40} className="text-white" fill="currentColor" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Welcome to POTOBOOTH!</h2>
                                    <p className="text-rose-400 text-sm font-semibold italic mt-3">Hey! Edyiy here, thanks for supporting this project!</p>
                                </div>

                                <div className="space-y-3 text-left w-full bg-white/5 rounded-2xl p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">1</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Choose Your Style</h3>
                                            <p className="text-sm text-zinc-400">Pick from preset designs or upload custom templates</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">2</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Capture Moments</h3>
                                            <p className="text-sm text-zinc-400">Take photos with filters, stickers, and text</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">3</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Save & Share</h3>
                                            <p className="text-sm text-zinc-400">Download or print your photo strips</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowWelcome(false)}
                                    className="w-full py-4 bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 rounded-xl font-bold text-lg uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02]"
                                >
                                    Let's Get Started!
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dev Tool: Show Welcome Modal */}
                <button
                    onClick={() => setShowWelcome(true)}
                    className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg transition-all hover:scale-105"
                    title="Dev Tool: Show Welcome Modal"
                >
                    👋 Welcome
                </button>

                <div className="relative z-10 w-full h-full">
                    {view === 'landing' && (
                        <LandingPage
                            onStart={handleStartSession}
                            initialShowGallery={shouldOpenGallery}
                            navigationSource={shouldOpenGallery ? 'photobooth' : 'landing'}
                        />
                    )}
                    {view === 'booth' && (
                        <PhotoBooth
                            onHome={(openGallery = false) => {
                                setShouldOpenGallery(openGallery);
                                setView('landing');
                            }}
                        />
                    )}
                </div>
            </div>
        </PhotoBoothProvider>
    );
}

export default App;
