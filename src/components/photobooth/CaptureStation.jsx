
import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Pause, Timer, Upload, Trash2, Printer, Download, Clock, Camera, ChevronUp, SwitchCamera } from 'lucide-react';
import { usePhotoBooth } from './PhotoBoothContext';

const CaptureStation = ({ className = '' }) => {
    const {
        webcamRef,
        isCapturingLoop, setIsCapturingLoop,
        countdown,
        capturedImages,
        maxPhotos,
        totalSlots,
        timerDuration, setTimerDuration,
        retake,
        fileInputRef,
        handleFileUpload,
        downloadStrip,
        printStrip,
        capture,
        setShowPreview,
        retakeIndex,
        setRetakeIndex,
        setMaxPhotos
    } = usePhotoBooth();

    const [devices, setDevices] = useState([]);
    const [activeDeviceId, setActiveDeviceId] = useState(undefined);

    const handleDevices = React.useCallback(
        (mediaDevices) =>
            setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
        [setDevices]
    );

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }, [handleDevices]);

    const switchCamera = () => {
        if (devices.length < 2) return;
        const currentIndex = devices.findIndex(d => d.deviceId === activeDeviceId);
        // If activeDeviceId is currently undefined (default), start cycling from 0 (or 1)
        // Usually, the default "user" cam is one of them.
        // Let's just pick the next one in the list.
        const nextIndex = (currentIndex + 1) % devices.length;
        setActiveDeviceId(devices[nextIndex].deviceId);
    };

    const videoConstraints = {
        width: 1280,
        height: 960,
        facingMode: activeDeviceId ? undefined : "user",
        deviceId: activeDeviceId ? { exact: activeDeviceId } : undefined
    };

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [saveMenuOpen, setSaveMenuOpen] = useState(false);

    // Close menu when clicking outside (simplistic)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mobileMenuOpen && !e.target.closest('.mobile-menu-trigger') && !e.target.closest('.mobile-menu-content')) {
                setMobileMenuOpen(false);
            }
            if (saveMenuOpen && !e.target.closest('.save-menu-trigger')) {
                setSaveMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [mobileMenuOpen, saveMenuOpen]);

    const handleMobileSelect = (seconds) => {
        setTimerDuration(seconds);
        setMobileMenuOpen(false);
    };

    return (
        <div className={`relative bg-black flex flex-col items-center justify-center p-8 overflow-hidden ${className}`}>
            {/* Webcam Feed */}
            <div className="relative w-full aspect-[4/3] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 group max-h-[80vh]">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints} // Use constraints
                    mirrored={true}
                    className="w-full h-full object-cover"
                    onUserMedia={() => navigator.mediaDevices.enumerateDevices().then(handleDevices)}
                />

                {/* Overlays */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Grid Lines (Subtle) */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-1/3 w-full h-px bg-white/50"></div>
                        <div className="absolute top-2/3 w-full h-px bg-white/50"></div>
                        <div className="absolute left-1/3 h-full w-px bg-white/50"></div>
                        <div className="absolute left-2/3 h-full w-px bg-white/50"></div>
                    </div>

                    {/* Camera Switcher (Top Left) */}
                    {devices.length > 1 && !isCapturingLoop && (
                        <div className="absolute top-6 left-6 z-30 pointer-events-auto">
                            <button
                                onClick={switchCamera}
                                className="bg-black/40 text-white/70 hover:text-white hover:bg-black/60 p-2 rounded-full backdrop-blur-sm transition-all border border-white/10"
                                title="Switch Camera"
                            >
                                <SwitchCamera size={20} />
                            </button>
                        </div>
                    )}

                    {/* Rec / Retake Indicator */}
                    <div className={`absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 backdrop-blur-md px-4 py-1.5 rounded-full ${retakeIndex !== null ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <div className={`w-2 h-2 rounded-full ${retakeIndex !== null ? 'bg-amber-500' : 'bg-red-500'} ${isCapturingLoop ? 'animate-pulse' : ''}`}></div>
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${retakeIndex !== null ? 'text-amber-400' : 'text-red-400'}`}>
                            {retakeIndex !== null ? `RETAKING PHOTO ${retakeIndex + 1}` : (isCapturingLoop ? 'REC' : 'STANDBY')}
                        </span>
                    </div>

                    {/* Progress Indicator */}
                    <div className="absolute top-6 right-6 font-mono text-xs font-bold text-white/50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                        {capturedImages.length} / {totalSlots}
                    </div>
                </div>

                {/* Flash Effect */}
                <AnimatePresence>
                    {countdown === 0 && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-white z-50 pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Countdown Overlay */}
                <AnimatePresence>
                    {countdown !== null && countdown > 0 && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            key={countdown}
                            className="absolute inset-0 flex items-center justify-center z-40"
                        >
                            <span className="text-[180px] font-black text-white drop-shadow-2xl tabular-nums tracking-tighter mix-blend-overlay">
                                {countdown}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-8 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 items-center px-4 lg:px-12 z-20 gap-8 lg:gap-0">
                {/* Left: Duplicate Timer Settings (Desktop Only) */}
                <div className="hidden lg:flex justify-self-start relative">
                    {!isCapturingLoop && capturedImages.length < totalSlots && (
                        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-full p-1 border border-zinc-800 h-[50px] flex items-center">
                            {[1, 2, 3, 4].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setMaxPhotos(num)}
                                    className={`w-10 h-full rounded-full flex flex-col items-center justify-center transition-all ${maxPhotos === num
                                        ? 'bg-zinc-700 text-white shadow-lg'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                        }`}
                                    title={`Set Layout to ${num} Frames`}
                                >
                                    <span className="text-xs font-bold">{num}</span>
                                    <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">
                                        FRM
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Center: Main Primary Action */}
                <div className="justify-self-center flex flex-col items-center gap-6 relative">

                    {/* Main Capture / Pause / Save Controls */}
                    {!isCapturingLoop && (capturedImages.length < totalSlots || retakeIndex !== null) && (
                        <button
                            onClick={() => {
                                if (timerDuration === 0) {
                                    capture();
                                } else {
                                    setIsCapturingLoop(true);
                                }
                            }}
                            className="group relative w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center hover:border-white transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] active:scale-95"
                            title={timerDuration === 0 ? "Take Photo" : "Start Session"}
                        >
                            <div className="w-16 h-16 rounded-full bg-white group-hover:scale-90 transition-transform duration-300 flex items-center justify-center relative">
                                {timerDuration > 0 && <Play size={24} className="text-zinc-400 ml-1" fill="currentColor" />}
                                {timerDuration === 0 && <Camera size={24} className="text-zinc-400" />}
                            </div>
                        </button>
                    )}

                    {isCapturingLoop && (
                        <div className="flex flex-col items-center gap-4">
                            {timerDuration === 0 && (
                                <button
                                    onClick={capture}
                                    className="w-20 h-20 rounded-full bg-white border-4 border-zinc-200 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-black"
                                    title="Take Photo"
                                >
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-black/30 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-black/10"></div>
                                    </div>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsCapturingLoop(false);
                                }}
                                className={`px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold text-xs tracking-widest uppercase rounded-full hover:bg-zinc-800 transition-all flex items-center gap-2 ${timerDuration === 0 ? 'opacity-50 hover:opacity-100' : ''}`}
                            >
                                <Pause size={14} /> {timerDuration === 0 ? 'End Session' : 'Pause'}
                            </button>
                        </div>
                    )}

                    {!isCapturingLoop && capturedImages.length >= totalSlots && (
                        <div className="flex gap-4 w-full max-w-md justify-center">
                            <button
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        setShowPreview(true);
                                        setTimeout(printStrip, 500);
                                    } else {
                                        printStrip();
                                    }
                                }}
                                className="flex-1 relative group overflow-hidden py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-wider shadow-lg shadow-white/5 transition-all hover:shadow-white/20 hover:scale-[1.05] active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-zinc-100 to-zinc-300 opacity-0 group-hover:opacity-50 transition-opacity" />
                                <div className="flex items-center justify-center gap-2 relative z-10">
                                    <span>Print</span>
                                    <Printer size={18} className="text-black group-hover:scale-110 transition-transform duration-300" />
                                </div>
                            </button>

                            <div className="relative flex-1 save-menu-trigger">
                                <AnimatePresence>
                                    {saveMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 w-full mb-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col p-1.5 z-50 text-center"
                                        >
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-1 border-b border-zinc-800 mb-1">Format</div>
                                            {[
                                                { label: 'JPG', format: 'jpg' },
                                                { label: 'PNG', format: 'png' },
                                                { label: 'PDF', format: 'pdf' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.format}
                                                    onClick={() => {
                                                        setSaveMenuOpen(false);
                                                        // Mobile fix: Show preview first to ensure element is rendered
                                                        if (window.innerWidth < 1024) {
                                                            setShowPreview(true);
                                                            // Small delay to allow render
                                                            setTimeout(() => {
                                                                downloadStrip(opt.format);
                                                            }, 500);
                                                        } else {
                                                            downloadStrip(opt.format);
                                                        }
                                                    }}
                                                    className="w-full text-center px-4 py-2 hover:bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors rounded-lg uppercase tracking-wider"
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={() => setSaveMenuOpen(!saveMenuOpen)}
                                    className="w-full relative group overflow-hidden py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold uppercase tracking-wider shadow-lg shadow-rose-900/40 transition-all hover:shadow-rose-900/60 hover:scale-[1.05] active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                                    <div className="flex items-center justify-center gap-2 relative z-10">
                                        <span>Save</span>
                                        <ChevronUp size={16} className={`transition-transform duration-300 ${saveMenuOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Secondary Actions (Text Links) */}
                    {!isCapturingLoop && (
                        <div className="flex items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            {/* Upload Link */}
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 group"
                            >
                                <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                                <span>Upload</span>
                            </button>

                            {/* Retake Link - Only if we have images */}
                            {capturedImages.length > 0 && (
                                <>
                                    <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                                    <button
                                        onClick={retake}
                                        className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <Trash2 size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                                        <span>Restart</span>
                                    </button>
                                </>
                            )}
                            {/* Cancel Retake */}
                            {retakeIndex !== null && !isCapturingLoop && (
                                <button
                                    onClick={() => setRetakeIndex(null)}
                                    className="absolute -bottom-12 text-xs font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest"
                                >
                                    Cancel Retake
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Timer Settings */}
                <div className="justify-self-end relative">
                    {!isCapturingLoop && capturedImages.length < totalSlots && (
                        <>
                            {/* Desktop: Standard List */}
                            <div className="hidden lg:flex bg-zinc-900/80 backdrop-blur-sm rounded-full p-1 border border-zinc-800 h-[50px] items-center">
                                {[0, 3, 5, 10].map(sec => (
                                    <button
                                        key={sec}
                                        onClick={() => setTimerDuration(sec)}
                                        className={`w-10 h-full rounded-full flex flex-col items-center justify-center transition-all ${timerDuration === sec
                                            ? 'bg-zinc-700 text-white shadow-lg'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                            }`}
                                        title={sec === 0 ? 'Manual Mode (No Timer)' : `Set Timer to ${sec}s`}
                                    >
                                        <span className="text-xs font-bold">{sec === 0 ? 'M' : sec}</span>
                                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">
                                            {sec === 0 ? 'OFF' : 'SEC'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Mobile: Single Toggle Button and Popup */}
                            <div className="lg:hidden relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMobileMenuOpen(!mobileMenuOpen);
                                    }}
                                    className="mobile-menu-trigger w-12 h-12 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
                                >
                                    <div className="flex flex-col items-center leading-none">
                                        {timerDuration === 0 ? <span className="text-xs font-bold">Man</span> : <span className="text-sm font-bold">{timerDuration}</span>}
                                        <span className="text-[8px] uppercase text-zinc-500 font-bold">{timerDuration === 0 ? 'ual' : 'sec'}</span>
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {mobileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8, x: 20, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, x: 20, y: 10 }}
                                            className="mobile-menu-content absolute bottom-16 right-0 flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-2 rounded-2xl shadow-2xl z-50 min-w-[120px] origin-bottom-right"
                                        >
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase text-center mb-1 tracking-widest">Set Timer</div>
                                            {[0, 3, 5, 10].map(sec => (
                                                <button
                                                    key={sec}
                                                    onClick={() => handleMobileSelect(sec)}
                                                    className={`w-full py-2.5 rounded-xl flex items-center gap-3 px-3 transition-colors ${timerDuration === sec ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-400'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${timerDuration === sec ? 'bg-rose-500' : 'bg-transparent'}`}></div>
                                                    <span className="text-xs font-bold">{sec === 0 ? 'Manual' : `${sec}s Timer`}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>

                {/* Hidden File Input for Upload */}
                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default CaptureStation;
