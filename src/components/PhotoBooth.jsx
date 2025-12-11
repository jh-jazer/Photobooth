import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, Trash2, ArrowRight, Play, Pause, Timer, Image as ImageIcon, Maximize2, Download, Printer, Upload } from 'lucide-react';
import { toPng } from 'html-to-image';
import { TEMPLATES, STRIP_DESIGNS } from '../constants';

export default function PhotoBooth({ onBack }) {
    const webcamRef = useRef(null);
    const stripRef = useRef(null);
    const fileInputRef = useRef(null);
    const [capturedImages, setCapturedImages] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [isFlashing, setIsFlashing] = useState(false);
    // Removed isReviewing state
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
    const [selectedDesign, setSelectedDesign] = useState(STRIP_DESIGNS[0]);

    // Base Style State
    const [bgColor, setBgColor] = useState('');
    const [bgImage, setBgImage] = useState(null);
    const bgFileInputRef = useRef(null);

    // Header State
    const [headerText, setHeaderText] = useState('');
    const [headerFont, setHeaderFont] = useState('font-sans');
    const [headerSize, setHeaderSize] = useState('text-xl');
    const [headerTracking, setHeaderTracking] = useState('tracking-normal');

    // Footer State
    const [footerText, setFooterText] = useState('');
    const [footerFont, setFooterFont] = useState('font-sans');
    const [footerSize, setFooterSize] = useState('text-[10px]');
    const [footerTracking, setFooterTracking] = useState('tracking-normal');
    const [footerOffsetY, setFooterOffsetY] = useState(0);

    // Timer/Shutter State
    const [timerDuration, setTimerDuration] = useState(3);
    const [isContinuous, setIsContinuous] = useState(false);
    const [isCapturingLoop, setIsCapturingLoop] = useState(false);

    const maxPhotos = selectedTemplate?.count || 4;

    const startCaptureSeries = () => {
        if (isContinuous) {
            setIsCapturingLoop(true);
        } else {
            setCountdown(timerDuration);
        }
    };

    const stopCaptureSeries = () => {
        setIsCapturingLoop(false);
        setCountdown(null);
    };

    // Capture logic
    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setCapturedImages(prev => [...prev, imageSrc]);
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 150);
            }
        }
    }, [webcamRef]);

    // Capture Loop Logic
    useEffect(() => {
        if (!isCapturingLoop) return;

        if (capturedImages.length >= maxPhotos) {
            setIsCapturingLoop(false);
            return;
        }

        if (countdown === null) {
            setCountdown(timerDuration);
        }
    }, [isCapturingLoop, capturedImages.length, maxPhotos, countdown, timerDuration]);

    // Handle Countdown Tick
    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCountdown(null);
            capture();
        }
    }, [countdown, capture]);

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const remainingSlots = maxPhotos - capturedImages.length;
        if (remainingSlots <= 0) {
            alert("Maximum photos reached!");
            return;
        }

        const filesToProcess = files.slice(0, remainingSlots);

        Promise.all(filesToProcess.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        })).then(images => {
            setCapturedImages(prev => [...prev, ...images]);
        });

        event.target.value = '';
    };

    const handleBgUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => setBgImage(e.target.result);
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const retake = () => {
        setCapturedImages([]);
        setIsCapturingLoop(false);
        setCountdown(null);
    };

    // Download/Print Logic
    const downloadStrip = useCallback(async () => {
        if (stripRef.current === null) return;
        try {
            // Temporarily scale up for better quality capture
            const originalTransform = stripRef.current.style.transform;
            stripRef.current.style.transform = 'scale(1)';

            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });

            // Restore scale
            stripRef.current.style.transform = originalTransform;

            const link = document.createElement('a');
            link.download = 'photobooth-strip.png';
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
        }
    }, [stripRef]);

    const printStrip = useCallback(async () => {
        if (stripRef.current === null) return;
        try {
            // Temporarily scale up for better quality capture
            const originalTransform = stripRef.current.style.transform;
            stripRef.current.style.transform = 'scale(1)';

            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });

            // Restore scale
            stripRef.current.style.transform = originalTransform;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Photo Strip</title>
                        <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                            img { max-height: 100%; max-width: 100%; }
                        </style>
                    </head>
                    <body>
                        <img src="${dataUrl}" onload="window.print();window.close()" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        } catch (err) {
            console.error(err);
        }
    }, [stripRef]);

    return (
        <div className="h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-zinc-950 text-white overflow-hidden font-sans selection:bg-rose-500/30 overflow-y-auto lg:overflow-y-hidden">

            {/* COL 1: LIVE STRIP PREVIEW (Span 3) */}
            <div className="hidden lg:flex lg:col-span-3 items-center justify-center p-8 relative overflow-hidden border-r border-zinc-900 bg-transparent">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                {/* Live Preview Label - Fixed Position */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 bg-zinc-950/50 px-3 py-1 rounded-full backdrop-blur-sm border border-zinc-800">
                    <Maximize2 size={12} /> Live Preview
                </div>

                {/* Live Output Preview Container */}
                <div className="flex items-center justify-center w-full h-full z-10">

                    <div className="relative shadow-2xl transition-all duration-300 origin-center" style={{ transform: 'scale(0.55)' }}>
                        <div
                            ref={stripRef}
                            className={`p-2 shadow-2xl transition-colors duration-300 flex flex-col gap-3 w-[240px] relative ${!bgColor && !bgImage ? selectedDesign.bg : ''}`}
                            style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: bgColor || undefined }}
                        >
                            {/* Customizable Header */}
                            {headerText && (
                                <div className={`text-center leading-tight whitespace-pre-wrap pb-2 ${selectedDesign.text} drop-shadow-sm`}>
                                    <span className={`${headerFont} ${headerSize} ${headerTracking} font-bold opacity-90`}>
                                        {headerText}
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 w-full">
                                {[...Array(maxPhotos)].map((_, i) => (
                                    <div key={i} className={`relative shrink-0 ${selectedDesign.id === 'polaroid-teal' ? 'bg-white shadow-sm text-black' : `overflow-hidden aspect-[3/2] ${selectedDesign.border}`} w-full ${capturedImages[i] ? (selectedDesign.id === 'polaroid-teal' ? '' : 'border-2') : (selectedDesign.id === 'polaroid-teal' ? 'bg-white opacity-50' : 'border-2 border-dashed opacity-30 bg-black/5')}`}>

                                        {/* Polaroid Special Wrapper */}
                                        {selectedDesign.id === 'polaroid-teal' ? (
                                            <div className={`flex flex-col h-full ${i === 0 ? 'pt-2 px-2 pb-8' : 'p-2'}`}>
                                                {/* Initials Tag (Top Gen Only) */}
                                                {i === 0 && (
                                                    <div className="absolute top-2 right-2 bg-transparent text-[#00798c] font-black text-[10px] z-10 tracking-tighter">
                                                        JJ
                                                    </div>
                                                )}

                                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-sky-200">
                                                    {capturedImages[i] ? (
                                                        <img src={capturedImages[i]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center opacity-20">
                                                            {/* Placeholder Hill/Cloud simulation if empty */}
                                                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-emerald-400 rounded-t-[50%]"></div>
                                                            <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-white rounded-full shadow-lg blur-sm"></div>
                                                            <span className="relative z-10 font-bold text-[#00798c]">{i + 1}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            /* Standard Render */
                                            <>
                                                {capturedImages[i] ? (
                                                    <img
                                                        src={capturedImages[i]}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center font-bold text-xl ${selectedDesign.text} opacity-50`}>
                                                        {i + 1}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Customizable Footer */}
                            <div
                                className={`text-center leading-tight whitespace-pre-wrap ${selectedDesign.text} mt-auto pb-4 drop-shadow-sm transition-all`}
                                style={{
                                    transform: `translateY(${footerOffsetY}px)`
                                }}
                            >
                                <span className={`${footerFont} ${footerSize} ${footerTracking} font-bold opacity-90`}>
                                    {footerText}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COL 2: CAMERA & CAPTURE (Span 6) */}
            <div className="flex-shrink-0 lg:col-span-6 relative flex flex-col bg-black border-r border-zinc-900 h-auto lg:h-full lg:overflow-hidden">

                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-30">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-all hover:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full font-medium text-sm"
                    >
                        <ChevronLeft size={16} /> Reset
                    </button>
                </div>

                {/* Camera Viewport */}
                <div className="relative w-full aspect-[4/3] bg-black overflow-hidden flex items-center justify-center lg:flex-1 lg:aspect-auto lg:p-6">
                    <div className="relative w-full h-full lg:aspect-[4/3] lg:rounded-3xl overflow-hidden shadow-2xl border-b lg:border border-zinc-800 group bg-zinc-900">
                        {/* Viewfinder Overlay */}
                        <div className="absolute inset-0 border border-white/10 pointer-events-none z-10 hidden lg:block rounded-3xl"></div>

                        {/* Rec Indicator */}
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                            {capturedImages.length < maxPhotos ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                    <span className="text-[10px] font-mono text-white tracking-widest uppercase font-bold">LIVE</span>
                                </>
                            ) : (
                                <span className="text-[10px] font-mono text-green-400 tracking-widest uppercase font-bold">READY</span>
                            )}
                        </div>

                        {/* Flash Animation */}
                        <AnimatePresence>
                            {isFlashing && (
                                <motion.div
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 bg-white z-[60] pointer-events-none"
                                />
                            )}
                        </AnimatePresence>

                        {/* Countdown Overlay */}
                        <AnimatePresence>
                            {countdown !== null && (
                                <motion.div
                                    key={countdown}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: 1 }}
                                    exit={{ scale: 2, opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                                >
                                    <span className="text-white text-[8rem] font-bold drop-shadow-2xl font-mono">{countdown === 0 ? 'Smile!' : countdown}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                    </div>
                </div>

                {/* Capture Controls Area */}
                <div className="bg-zinc-950 p-6 lg:h-[35%] lg:p-8 flex flex-col items-center justify-center border-t border-zinc-900 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    {capturedImages.length >= maxPhotos ? (
                        <div className="w-full max-w-sm flex flex-col gap-4">
                            <div className="text-center mb-2">
                                <h3 className="text-xl font-bold text-white">Session Complete!</h3>
                                <p className="text-zinc-500 text-sm">Print, Save or Retake.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={printStrip}
                                    className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-base hover:scale-[1.02]"
                                >
                                    <Printer size={18} /> Print
                                </button>
                                <button
                                    onClick={downloadStrip}
                                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2 text-base hover:scale-[1.02]"
                                >
                                    <Download size={18} /> Save
                                </button>
                            </div>

                            <button onClick={retake} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 py-3">
                                <Trash2 size={14} /> Discard & New Session
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            <button
                                onClick={isCapturingLoop ? stopCaptureSeries : startCaptureSeries}
                                className={`w-full py-8 font-bold rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-4 text-xl hover:scale-[1.02] active:scale-[0.98] ${isCapturingLoop
                                    ? 'bg-red-500/10 text-red-500 border-2 border-red-500/50 hover:bg-red-500 hover:text-white hover:border-red-500'
                                    : 'bg-white text-black hover:bg-zinc-200 ring-4 ring-white/10'
                                    }`}
                            >
                                {isCapturingLoop ? (
                                    <> <div className="w-4 h-4 bg-current rounded-sm animate-pulse" /> Stop ({capturedImages.length}/{maxPhotos}) </>
                                ) : (
                                    <> <div className="w-6 h-6 rounded-full border-[4px] border-current" /> Capture Photo </>
                                )}
                            </button>

                            <div className="flex items-center gap-8">
                                {!isCapturingLoop && capturedImages.length < maxPhotos && (
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/5"
                                    >
                                        <Upload size={14} /> Upload
                                    </button>
                                )}

                                {capturedImages.length > 0 && !isCapturingLoop && (
                                    <button onClick={retake} className="text-zinc-500 hover:text-rose-500 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-rose-500/10">
                                        <Trash2 size={14} /> Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* COL 3: CONFIGURATION (Span 3) */}
            <div className="flex-1 lg:col-span-3 flex w-full flex-col bg-zinc-950 h-full shadow-2xl z-20 overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-30">
                    <h2 className="text-xl lg:text-2xl font-bold mb-1 tracking-tight">Studio Config</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Customize your session</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 lg:space-y-10 custom-scrollbar pb-24 lg:pb-8">

                    {/* Strip Header Configuration */}
                    {/* Strip Header Configuration */}
                    <details className="group" open>
                        <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">
                            <span className="flex items-center gap-2">Top Text</span>
                            <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="mt-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Enter top header text..."
                                value={headerText}
                                onChange={(e) => setHeaderText(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-zinc-600"
                            />
                            {/* Header Font Selection */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Modern', class: 'font-sans' },
                                    { label: 'Classic', class: 'font-serif' },
                                    { label: 'Mono', class: 'font-mono' },
                                    { label: 'Bold', class: 'font-black uppercase tracking-tighter' },
                                    { label: 'Hand', class: 'font-serif italic' }, // Renamed Elegant->Hand for variety if same class
                                    { label: 'Retro', class: 'font-mono uppercase tracking-widest' }
                                ].map(f => (
                                    <button
                                        key={f.label}
                                        onClick={() => setHeaderFont(f.class)}
                                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${headerFont === f.class
                                            ? 'bg-zinc-800 text-white border-zinc-600'
                                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                            {/* Header Size */}
                            <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                                {[{ label: 'S', class: 'text-xs' }, { label: 'M', class: 'text-base' }, { label: 'L', class: 'text-xl' }, { label: 'XL', class: 'text-2xl' }, { label: 'XXL', class: 'text-4xl' }].map(s => (
                                    <button
                                        key={s.label}
                                        onClick={() => setHeaderSize(s.class)}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${headerSize === s.class
                                            ? 'bg-zinc-700 text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                            {/* Header Letter Spacing */}
                            <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                                {[{ label: 'Tight', class: 'tracking-tighter' }, { label: 'Normal', class: 'tracking-normal' }, { label: 'Wide', class: 'tracking-wide' }, { label: 'Widest', class: 'tracking-widest' }].map(t => (
                                    <button
                                        key={t.label}
                                        onClick={() => setHeaderTracking(t.class)}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${headerTracking === t.class
                                            ? 'bg-zinc-700 text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </details>

                    <div className="h-px bg-zinc-900"></div>

                    {/* Strip Footer Text Configuration */}
                    {/* Strip Footer Text Configuration */}
                    <details className="group" open>
                        <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">
                            <span className="flex items-center gap-2">Bottom Text</span>
                            <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="mt-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Enter footer text..."
                                value={footerText}
                                onChange={(e) => setFooterText(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-zinc-600"
                            />

                            {/* Font Selection */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Modern', class: 'font-sans' },
                                    { label: 'Classic', class: 'font-serif' },
                                    { label: 'Mono', class: 'font-mono' },
                                    { label: 'Bold', class: 'font-black uppercase tracking-tighter' },
                                    { label: 'Elegant', class: 'font-serif italic' },
                                    { label: 'Retro', class: 'font-mono uppercase tracking-widest' }
                                ].map(f => (
                                    <button
                                        key={f.label}
                                        onClick={() => setFooterFont(f.class)}
                                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${footerFont === f.class
                                            ? 'bg-zinc-800 text-white border-zinc-600'
                                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Size Selection */}
                            <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                                {[
                                    { label: 'S', class: 'text-xs' },
                                    { label: 'M', class: 'text-sm' },
                                    { label: 'L', class: 'text-base' },
                                    { label: 'XL', class: 'text-xl' },
                                    { label: 'XXL', class: 'text-2xl' }
                                ].map(s => (
                                    <button
                                        key={s.label}
                                        onClick={() => setFooterSize(s.class)}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${footerSize === s.class
                                            ? 'bg-zinc-700 text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            {/* Footer Letter Spacing */}
                            <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                                {[{ label: 'Tight', class: 'tracking-tighter' }, { label: 'Normal', class: 'tracking-normal' }, { label: 'Wide', class: 'tracking-wide' }, { label: 'Widest', class: 'tracking-widest' }].map(t => (
                                    <button
                                        key={t.label}
                                        onClick={() => setFooterTracking(t.class)}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${footerTracking === t.class
                                            ? 'bg-zinc-700 text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Position Slider */}
                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Vertical Offset</span>
                                    <span className="text-[10px] font-mono text-zinc-400">{footerOffsetY}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={footerOffsetY}
                                    onChange={(e) => setFooterOffsetY(Number(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                            </div>
                        </div>
                    </details>

                    <div className="h-px bg-zinc-900"></div>

                    {/* Grid Layout Selector */}
                    {/* Grid Layout Selector */}
                    <details className="group" open>
                        <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">
                            <span className="flex items-center gap-2">Grid Layout</span>
                            <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {TEMPLATES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            if (capturedImages.length > 0) {
                                                if (window.confirm("Changing layout will reset your current photos. Continue?")) {
                                                    setCapturedImages([]);
                                                    setSelectedTemplate(t);
                                                }
                                            } else {
                                                setSelectedTemplate(t);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all group ${selectedTemplate?.id === t.id
                                            ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg'
                                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                            }`}
                                    >
                                        <div className="text-2xl group-hover:scale-110 transition-transform">{t.icon}</div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </details>

                    <div className="h-px bg-zinc-900"></div>

                    {/* Timer & Shutter */}
                    {/* Timer & Shutter */}
                    <details className="group" open>
                        <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">
                            <span className="flex items-center gap-2"><Timer size={14} /> Shutter Mode</span>
                            <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="mt-4 space-y-4">
                            <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-2">
                                <button
                                    onClick={() => setIsContinuous(false)}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${!isContinuous ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Manual
                                </button>
                                <button
                                    onClick={() => setIsContinuous(true)}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${isContinuous ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Continuous
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {[0, 1, 3, 5].map(sec => (
                                    <button
                                        key={sec}
                                        onClick={() => setTimerDuration(sec)}
                                        className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${timerDuration === sec
                                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-500'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                            }`}
                                    >
                                        <span className="text-xs font-bold">{sec === 0 ? 'NO TIMER' : `${sec}s`}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </details>



                    <div className="h-px bg-zinc-900"></div>

                    {/* Design Picker */}
                    {/* Design Picker */}
                    <details className="group" open>
                        <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">
                            <span className="flex items-center gap-2"><ImageIcon size={14} /> Strip Style</span>
                            <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="mt-4 space-y-4">
                            {/* Custom Color Picker */}
                            <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                                <div className="relative overflow-hidden w-8 h-8 rounded-full border border-zinc-600 shadow-inner">
                                    <input
                                        type="color"
                                        value={bgColor || '#ffffff'}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Custom Base Color</span>
                                    <span className="text-[10px] font-mono text-zinc-500">{bgColor || 'Using Preset'}</span>
                                </div>
                                {bgColor && (
                                    <button
                                        onClick={() => setBgColor('')}
                                        className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors"
                                        title="Reset to Preset"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Custom Background Image */}
                            <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                                <input
                                    type="file"
                                    ref={bgFileInputRef}
                                    accept="image/*"
                                    onChange={handleBgUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => bgFileInputRef.current.click()}
                                    className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                                >
                                    <Upload size={14} className="text-zinc-400" />
                                </button>

                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Background Image</span>
                                    <span className="text-[10px] font-mono text-zinc-500">{bgImage ? 'Custom Image Set' : 'None Selected'}</span>
                                </div>

                                {bgImage && (
                                    <button
                                        onClick={() => setBgImage(null)}
                                        className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors"
                                        title="Remove Image"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-5 gap-3">
                                {STRIP_DESIGNS.map(design => (
                                    <button
                                        key={design.id}
                                        onClick={() => {
                                            setSelectedDesign(design);
                                            setBgColor(''); // Reset custom color when picking a preset
                                            setBgImage(null); // Reset custom image
                                        }}
                                        className={`aspect-square rounded-full border-2 transition-all relative group overflow-hidden ${selectedDesign.id === design.id && !bgColor && !bgImage
                                            ? 'border-rose-500 ring-4 ring-rose-500/20 scale-110'
                                            : 'border-transparent ring-2 ring-zinc-800 opacity-60 hover:opacity-100 hover:scale-105'
                                            }`}
                                        title={design.label}
                                    >
                                        <div className={`w-full h-full ${design.buttonBg.split(' ')[0]}`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </details>
                </div>
            </div>

            {/* Mobile Footer/Spacer if needed */}
            <div className="lg:hidden h-0 w-full"></div>

        </div>
    )
}
