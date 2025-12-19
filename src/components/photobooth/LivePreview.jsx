
import React from 'react';
import { Maximize2, Plus, Minus } from 'lucide-react';
import { usePhotoBooth } from './PhotoBoothContext';

const LivePreview = ({ className = '' }) => {
    const {
        stripRef,
        capturedImages,
        maxPhotos,
        selectedDesign,
        bgColor,
        bgImage,
        templateImage,
        layoutGap,
        layoutPaddingTop,
        layoutPaddingSide,
        layoutPaddingBottom,
        photoRoundness,
        elements,
        selectedElementId,
        handleElementMouseDown,
        customSlots,
        selectedSlotIndex,
        stripHeight,
        previewScale, setPreviewScale,
        panOffset,
        isPanning,
        handleMouseDown,
        handleContainerMouseDown,
        startRetake
    } = usePhotoBooth();

    return (
        <div className={`flex items-center justify-center p-8 relative overflow-hidden border-r border-zinc-900 bg-transparent ${className}`}>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>




            {/* Live Output Preview Container */}
            <div
                className={`flex items-center justify-center w-full h-full z-10 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
                onMouseDown={handleContainerMouseDown}
                onContextMenu={(e) => e.preventDefault()}
            >

                {/* Live Preview & Zoom Controls */}
                <div className="absolute bottom-6 flex items-center gap-3 bg-zinc-950/90 pl-4 p-1.5 rounded-full border border-zinc-800 backdrop-blur-md z-30 shadow-2xl">
                    <div className="flex items-center gap-2 mr-2">
                        <Maximize2 size={14} className="text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live Preview</span>
                    </div>
                    <div className="h-4 w-px bg-zinc-800"></div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPreviewScale(p => Math.max(0.2, p - 0.1))}
                            className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="text-[10px] font-mono w-[3ch] text-center font-bold text-zinc-300">
                            {Math.round(previewScale * 100)}%
                        </span>
                        <button
                            onClick={() => setPreviewScale(p => Math.min(1.5, p + 0.1))}
                            className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                <div className="relative shadow-2xl transition-transform duration-75 origin-center" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewScale})` }}>
                    <div
                        ref={stripRef}
                        className={`shadow-2xl transition-colors duration-300 flex flex-col w-[240px] relative ${!bgColor && !bgImage ? selectedDesign.bg : ''}`}
                        style={{
                            ...(templateImage ? { backgroundImage: `url(${templateImage})`, backgroundSize: 'cover', backgroundPosition: 'center', height: `${stripHeight}px` } : (bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: bgColor || undefined })),
                            gap: `${layoutGap}px`,
                            paddingTop: `${layoutPaddingTop}px`,
                            paddingLeft: `${layoutPaddingSide}px`,
                            paddingRight: `${layoutPaddingSide}px`,
                            paddingBottom: `${layoutPaddingBottom}px`
                        }}
                    >


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
                                            cursor: 'pointer' // Changed to pointer
                                        }}
                                        onClick={(e) => {
                                            // Actually, since we have handleMouseDown separately, we can rely on a simple click.
                                            // But dragging might trigger click. Let's make it simple: Double click to retake?
                                            // Or just Click. The user expects "click a photo".
                                            // But dragging also starts with mousedown.
                                            // Let's use a small helper or just assume click is fine if no drag occurred.
                                            // For now, let's just use onClick and see if it conflicts.
                                            startRetake(i);
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
                                        onClick={() => capturedImages[i] && startRetake(i)}
                                        className={`relative shrink-0 overflow-hidden aspect-[3/2] ${selectedDesign.border} w-full ${capturedImages[i] ? 'border-2 cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all' : 'border-2 border-dashed opacity-30 bg-black/5'}`}
                                        style={{ borderRadius: `${photoRoundness}px`, overflow: 'hidden' }}
                                    >
                                        {capturedImages[i] && <img src={capturedImages[i]} className="w-full h-full object-cover" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Generic Elements (Text & Images) */}
                        {elements.map(el => (
                            <div
                                key={el.id}
                                onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                                className={`absolute z-40 cursor-move select-none ${selectedElementId === el.id ? 'ring-1 ring-rose-500 bg-black/10' : 'hover:ring-1 hover:ring-white/30'}`}
                                style={{
                                    left: `${el.x}px`,
                                    top: `${el.y}px`,
                                    transform: `rotate(${el.rotation || 0}deg)`,
                                    width: el.type === 'image' ? `${el.width}px` : undefined,
                                }}
                            >
                                {el.type === 'text' ? (
                                    <span
                                        className={`whitespace-nowrap ${el.fontFamily?.startsWith('font-') ? el.fontFamily : ''} ${el.tracking}`}
                                        style={{
                                            fontSize: `${el.fontSize}px`,
                                            color: el.color,
                                            fontWeight: el.fontWeight || 'bold',
                                            fontFamily: el.fontFamily?.startsWith('font-') ? undefined : el.fontFamily,
                                        }}
                                    >
                                        {el.text}
                                    </span>
                                ) : (
                                    <img
                                        src={el.src}
                                        alt="sticker"
                                        className="w-full h-auto pointer-events-none"
                                        draggable={false} // Prevent browser native drag
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default LivePreview;
