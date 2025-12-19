import React from 'react';
import { Settings, Eye, X, Camera, Heart, ArrowRight, Share2, Zap, Trash2 } from 'lucide-react';
import { usePhotoBooth } from './photobooth/PhotoBoothContext';
import LivePreview from './photobooth/LivePreview';
import CaptureStation from './photobooth/CaptureStation';
import ConfigurationPanel from './photobooth/ConfigurationPanel';

const PhotoBooth = ({ onHome }) => {
    const {
        isDonationPopupOpen, setIsDonationPopupOpen,
        donationStep, setDonationStep,
        showConfig, setShowConfig,
        showPreview, setShowPreview,
        galleryImages, clearGallery
    } = usePhotoBooth();

    const [showGallery, setShowGallery] = React.useState(false);

    // Batch print function for 4 strips on landscape paper
    const printBatch = (startIndex) => {
        const batch = galleryImages.slice(startIndex, startIndex + 4);
        if (batch.length === 0) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @page {
                        size: landscape;
                        margin: 0.5in;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .batch-container {
                        display: flex;
                        gap: 0.25in;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                    }
                    .strip-wrapper {
                        position: relative;
                        width: 2in;
                    }
                    .strip {
                        width: 100%;
                        height: auto;
                        display: block;
                    }
                    .cutting-line {
                        position: absolute;
                        right: -0.125in;
                        top: 0;
                        bottom: 0;
                        width: 0;
                        border-right: 2px dashed #999;
                    }
                    .strip-wrapper:last-child .cutting-line {
                        display: none;
                    }
                </style>
            </head>
            <body>
                <div class="batch-container">
                    ${batch.map(img => `
                        <div class="strip-wrapper">
                            <img src="${img}" class="strip" />
                            <div class="cutting-line"></div>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `);
        iframeDoc.close();

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        };
    };

    // Delete individual image from gallery
    const deleteImage = (index) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            const newGallery = galleryImages.filter((_, i) => i !== index);
            // Update localStorage directly since we don't have setGalleryImages exposed
            try {
                localStorage.setItem('photobooth_gallery', JSON.stringify(newGallery));
                // Force re-render by closing and reopening gallery
                setShowGallery(false);
                setTimeout(() => setShowGallery(true), 0);
            } catch (e) {
                console.warn('Failed to update gallery');
            }
        }
    };

    // Share image with confirmation
    const shareImage = (img, index) => {
        if (window.confirm('Download this image to share?')) {
            const link = document.createElement('a');
            link.href = img;
            link.download = `photobooth-${Date.now()}.png`;
            link.click();
        }
    };


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
        <div className="h-screen w-full flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-1 bg-slate-950 text-white overflow-hidden font-sans selection:bg-rose-500/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
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
                    <span>Potobooth</span>
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
                    lg:flex lg:static lg:col-span-3 lg:pt-8 lg:bg-transparent lg:overflow-hidden lg:opacity-100 lg:pointer-events-auto lg:h-full
                `}
            />

            {/* Capture Station: Main View */}
            <CaptureStation onHome={onHome} setShowGallery={setShowGallery}
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

            {/* Gallery Modal */}
            {showGallery && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
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
                                    onClick={() => setShowGallery(false)}
                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors"
                                    title="Close"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {galleryImages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center">
                                        <Camera size={40} className="opacity-50" />
                                    </div>
                                    <p className="text-xl font-medium">No photos yet. Start capturing!</p>
                                </div>
                            ) : (
                                <div className="space-y-8 pb-12">
                                    {Array.from({ length: Math.ceil(galleryImages.length / 4) }, (_, groupIndex) => {
                                        const startIndex = groupIndex * 4;
                                        const groupImages = galleryImages.slice(startIndex, startIndex + 4);
                                        const isComplete = groupImages.length === 4;

                                        return (
                                            <div key={groupIndex} className="space-y-4">
                                                {/* Batch Print Button for complete rows */}
                                                {isComplete && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-zinc-500 font-medium">Row {groupIndex + 1}</span>
                                                        <button
                                                            onClick={() => printBatch(startIndex)}
                                                            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all flex items-center gap-2"
                                                        >
                                                            <Zap size={16} fill="currentColor" />
                                                            Print 4 Strips
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Image Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                                    {groupImages.map((img, i) => {
                                                        const globalIndex = startIndex + i;
                                                        return (
                                                            <div key={globalIndex} className="group relative bg-zinc-900 p-2 rounded-2xl shadow-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                                                                <div className="aspect-[1/2] rounded-xl overflow-hidden relative">
                                                                    <img src={img} alt={`Gallery ${globalIndex}`} className="w-full h-full object-contain bg-zinc-950" />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                        <button
                                                                            onClick={() => shareImage(img, globalIndex)}
                                                                            className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                                                            title="Share"
                                                                        >
                                                                            <Share2 size={20} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteImage(globalIndex)}
                                                                            className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={20} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

export default PhotoBooth;
