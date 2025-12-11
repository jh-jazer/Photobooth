import React, { useState } from 'react';
import { Settings, Eye, X, Camera, Heart } from 'lucide-react';
import { usePhotoBooth, PhotoBoothProvider } from './photobooth/PhotoBoothContext';
import LivePreview from './photobooth/LivePreview';
import CaptureStation from './photobooth/CaptureStation';
import ConfigurationPanel from './photobooth/ConfigurationPanel';

const PhotoBoothContent = () => {
    const [showConfig, setShowConfig] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const {
        isDonationPopupOpen, setIsDonationPopupOpen,
        donationStep, setDonationStep
    } = usePhotoBooth();

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
                    ${showPreview ? 'fixed inset-0 z-40 bg-zinc-950 pt-20 flex flex-col' : 'fixed top-0 left-[-200vw] h-0 overflow-hidden opacity-0 pointer-events-none flex flex-col'} 
                    lg:flex lg:static lg:col-span-3 lg:pt-8 lg:bg-transparent lg:h-auto lg:overflow-visible lg:opacity-100 lg:pointer-events-auto
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

            {/* Donation Popup */}
            {isDonationPopupOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsDonationPopupOpen(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {donationStep === 'prompt' ? (
                            <div className="text-center space-y-4">
                                <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Heart size={24} className="fill-current" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Did you like it?</h3>
                                <p className="text-zinc-400">
                                    If you enjoyed using our photobooth, please consider supporting us!
                                </p>
                                <button
                                    onClick={() => setDonationStep('qr')}
                                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-900/20"
                                >
                                    Donate Here
                                </button>
                                <button
                                    onClick={() => setIsDonationPopupOpen(false)}
                                    className="text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
                                >
                                    No thanks
                                </button>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <h3 className="text-lg font-bold text-white">Scan to Donate</h3>
                                <div className="bg-white p-2 rounded-xl inline-block">
                                    <img src={`${import.meta.env.BASE_URL}qr.jpg`} alt="Donation QR Code" className="w-48 h-48 object-contain" />
                                </div>
                                <p className="text-sm text-zinc-400">Thank you for your support!</p>
                                <a
                                    href={`${import.meta.env.BASE_URL}qr.jpg`}
                                    download="donate-qr.jpg"
                                    className="inline-block text-xs font-bold text-rose-500 hover:text-rose-400 underline underline-offset-4 mt-2"
                                >
                                    Save QR Image
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
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
