
import React from 'react';
import { Maximize2, Plus, Minus } from 'lucide-react';
import { usePhotoBooth } from './PhotoBoothContext';

const LivePreview = () => {
    const {
        stripRef,
        capturedImages,
        maxPhotos,
        selectedDesign,
        bgColor,
        bgImage,
        templateImage,
        layoutGap,
        layoutPadding,
        photoRoundness,
        headerText, headerFont, headerSize, headerTracking,
        footerText, footerFont, footerSize, footerOffsetY, footerTracking,
        customSlots,
        selectedSlotIndex,
        stripHeight,
        previewScale, setPreviewScale,
        panOffset,
        isPanning,
        handleMouseDown,
        handleContainerMouseDown
    } = usePhotoBooth();

    return (
        <div className="hidden lg:flex lg:col-span-3 items-center justify-center p-8 relative overflow-hidden border-r border-zinc-900 bg-transparent">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* Live Preview Label - Fixed Position */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 bg-zinc-950/50 px-3 py-1 rounded-full backdrop-blur-sm border border-zinc-800">
                <Maximize2 size={12} /> Live Preview
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-zinc-950/80 p-2 rounded-full border border-zinc-800 backdrop-blur-sm z-30 shadow-xl">
                <button onClick={() => setPreviewScale(p => Math.max(0.2, p - 0.1))} className="p-1 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors"><Minus size={14} /></button>
                <span className="text-[10px] font-mono min-w-[3ch] text-center font-bold text-zinc-300">{Math.round(previewScale * 100)}%</span>
                <button onClick={() => setPreviewScale(p => Math.min(1.5, p + 0.1))} className="p-1 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors"><Plus size={14} /></button>
            </div>

            {/* Live Output Preview Container */}
            <div
                className={`flex items-center justify-center w-full h-full z-10 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
                onMouseDown={handleContainerMouseDown}
                onContextMenu={(e) => e.preventDefault()}
            >

                <div className="relative shadow-2xl transition-transform duration-75 origin-center" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewScale})` }}>
                    <div
                        ref={stripRef}
                        className={`shadow-2xl transition-colors duration-300 flex flex-col w-[240px] relative ${!bgColor && !bgImage ? selectedDesign.bg : ''}`}
                        style={{
                            ...(templateImage ? { backgroundImage: `url(${templateImage})`, backgroundSize: 'cover', backgroundPosition: 'center', height: `${stripHeight}px` } : (bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: bgColor || undefined })),
                            gap: `${layoutGap}px`,
                            padding: `${layoutPadding}px`
                        }}
                    >
                        {/* Customizable Header */}
                        {headerText && (
                            <div className={`text-center leading-tight whitespace-pre-wrap pb-2 ${selectedDesign.text} drop-shadow-sm`}>
                                <span className={`${headerFont} ${headerSize} ${headerTracking} font-bold opacity-90`}>
                                    {headerText}
                                </span>
                            </div>
                        )}

                        {templateImage ? (
                            // Custom Layout Mode (Absolute Canvas)
                            <div className="relative w-full h-full">
                                {customSlots.map((slot, i) => (
                                    <div
                                        key={slot.id}
                                        onMouseDown={(e) => handleMouseDown(e, i)}
                                        className={`absolute group ${selectedSlotIndex === i ? 'ring-2 ring-rose-500 z-10' : 'hover:ring-1 hover:ring-white/50'}`}
                                        style={{
                                            left: `${slot.x}px`,
                                            top: `${slot.y}px`,
                                            width: `${slot.w}px`,
                                            height: `${slot.h}px`,
                                            cursor: 'move'
                                        }}
                                    >
                                        {/* Inner Content (Clipped) */}
                                        <div className="w-full h-full overflow-hidden pointer-events-none" style={{ borderRadius: `${photoRoundness}px` }}>
                                            {capturedImages[i] ? (
                                                <img src={capturedImages[i]} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-black/20 flex items-center justify-center border-2 border-dashed border-white/20">
                                                    <span className="text-xs font-bold text-white/50">{i + 1}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Resize Handles */}
                                        {selectedSlotIndex === i && (
                                            <>
                                                <div onMouseDown={(e) => handleMouseDown(e, i, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-rose-500 rounded-full cursor-nw-resize z-20 shadow-sm hover:scale-125 transition-transform"></div>
                                                <div onMouseDown={(e) => handleMouseDown(e, i, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-rose-500 rounded-full cursor-ne-resize z-20 shadow-sm hover:scale-125 transition-transform"></div>
                                                <div onMouseDown={(e) => handleMouseDown(e, i, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-rose-500 rounded-full cursor-sw-resize z-20 shadow-sm hover:scale-125 transition-transform"></div>
                                                <div onMouseDown={(e) => handleMouseDown(e, i, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-rose-500 rounded-full cursor-se-resize z-20 shadow-sm hover:scale-125 transition-transform"></div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col w-full" style={{ gap: `${layoutGap}px` }}>
                                {[...Array(maxPhotos)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`relative shrink-0 ${selectedDesign.id === 'polaroid-teal' ? 'bg-white shadow-sm text-black' : `overflow-hidden aspect-[3/2] ${selectedDesign.border}`} w-full ${capturedImages[i] ? (selectedDesign.id === 'polaroid-teal' ? '' : 'border-2') : (selectedDesign.id === 'polaroid-teal' ? 'bg-white opacity-50' : 'border-2 border-dashed opacity-30 bg-black/5')}`}
                                        style={{ borderRadius: `${photoRoundness}px`, overflow: 'hidden' }}
                                    >

                                        {/* Polaroid Special Wrapper */}
                                        {selectedDesign.id === 'polaroid-teal' ? (
                                            <div className={`flex flex-col h-full ${i === 0 ? 'pt-2 px-2 pb-8' : 'p-2'}`}>
                                                {/* Initials Tag (Top Gen Only) */}
                                                {i === 0 && (
                                                    <div className="absolute top-2 right-2 bg-transparent text-[#00798c] font-black text-[10px] z-10 tracking-tighter">
                                                        JJ
                                                    </div>
                                                )}

                                                {/* Image Area */}
                                                <div className="w-full h-full bg-zinc-100 overflow-hidden relative">
                                                    {capturedImages[i] ? (
                                                        <img src={capturedImages[i]} className="w-full h-full object-cover transform rotate-0" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            capturedImages[i] && <img src={capturedImages[i]} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Customizable Footer */}
                        {footerText && (
                            <div className={`text-center leading-tight whitespace-pre-wrap ${selectedDesign.text} drop-shadow-sm absolute bottom-0 left-0 w-full p-2`} style={{ transform: `translateY(${footerOffsetY}px)` }}>
                                <span className={`${footerFont} ${footerSize} ${footerTracking} font-bold opacity-90`}>
                                    {footerText}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePreview;
