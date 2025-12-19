import React, { useState } from 'react';
import PhotoBooth from './components/PhotoBooth';
import LandingPage from './components/LandingPage';

import { PhotoBoothProvider } from './components/photobooth/PhotoBoothContext';

function App() {
    const [view, setView] = useState('landing');
    const [shouldOpenGallery, setShouldOpenGallery] = useState(false);

    return (
        <PhotoBoothProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-rose-500/30">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

                <div className="relative z-10 w-full h-full">
                    {view === 'landing' && (
                        <LandingPage
                            onStart={() => {
                                setShouldOpenGallery(false);
                                setView('booth');
                            }}
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
