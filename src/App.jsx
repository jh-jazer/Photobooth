import React, { useState } from 'react';
import PhotoBooth from './components/PhotoBooth';
import LandingPage from './components/LandingPage';

function App() {
    const [view, setView] = useState('landing');

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-rose-500/30">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

            <div className="relative z-10 w-full h-full">
                {view === 'landing' && <LandingPage onStart={() => setView('booth')} />}
                {view === 'booth' && <PhotoBooth />}
            </div>
        </div>
    );
}

export default App;
