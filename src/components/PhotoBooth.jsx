import React, { useState } from 'react';
import { Settings, Eye, X, Camera } from 'lucide-react';
import { PhotoBoothProvider } from './photobooth/PhotoBoothContext';
import LivePreview from './photobooth/LivePreview';
import CaptureStation from './photobooth/CaptureStation';
import ConfigurationPanel from './photobooth/ConfigurationPanel';

const PhotoBoothContent = () => {
    const [showConfig, setShowConfig] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Toggle logic: prevent both from being open on mobile (optional, but cleaner)
    const toggleConfig = () => {
        setShowConfig(!showConfig);
        if (showPreview) setShowPreview(false);
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
        if (showConfig) setShowConfig(false);
    };

    return (
        <div className="h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-zinc-950 text-white overflow-hidden font-sans selection:bg-rose-500/30">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-900 z-50 shrink-0">
                <button
                    onClick={toggleConfig}
                    className={`p-2 rounded-full transition-colors ${showConfig ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    {showConfig ? <X size={20} /> : <Settings size={20} />}
                </button>

                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-zinc-300">
                    <Camera size={16} className="text-rose-500" />
                    <span>Studio Booth</span>
                </div>

                <button
                    onClick={togglePreview}
                    className={`p-2 rounded-full transition-colors ${showPreview ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    {showPreview ? <X size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {/* Live Preview: Mobile Overlay / Desktop Col */}
            <LivePreview
                className={`
                    ${showPreview ? 'fixed inset-0 z-40 bg-zinc-950 pt-20 flex flex-col' : 'hidden'} 
                    lg:flex lg:static lg:col-span-3 lg:pt-8 lg:bg-transparent
                `}
            />

            {/* Capture Station: Main View */}
            <CaptureStation
                className={`
                    flex-1 lg:col-span-6 
                    ${(showConfig || showPreview) ? 'hidden lg:flex' : 'flex'} 
                `}
            />

            {/* Configuration Panel: Mobile Overlay / Desktop Col */}
            <ConfigurationPanel
                className={`
                    ${showConfig ? 'fixed inset-0 z-40 bg-zinc-950 pt-16 flex flex-col' : 'hidden'}
                    lg:flex lg:static lg:col-span-3 lg:pt-0 lg:bg-zinc-950
                `}
            />
        </div>
    );
};

const PhotoBooth = () => {
    return (
        <PhotoBoothProvider>
            <PhotoBoothContent />
        </PhotoBoothProvider>
    );
};

export default PhotoBooth;
