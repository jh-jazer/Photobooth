
import React from 'react';
import { Maximize2, Plus, Minus, Undo2 } from 'lucide-react';
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
        startRetake,
        isTemplateLocked,
        undo,
        canUndo
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
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 bg-slate-900/80 py-4 p-1.5 rounded-full border border-white/10 backdrop-blur-md z-30 shadow-2xl ring-1 ring-black/20">
                    <div className="flex flex-col items-center gap-2 mb-1 group relative">
                        <Maximize2 size={16} className="text-zinc-500 group-hover:text-rose-500 transition-colors" />
                        <span className="absolute left-full ml-4 px-2 py-1 bg-black/90 text-[10px] font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            LIVE PREVIEW
                        </span>
                    </div>
                    <div className="w-4 h-px bg-zinc-800"></div>
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => setPreviewScale(p => Math.min(1.5, p + 0.1))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <Plus size={16} />
                        </button>
                        <span className="py-1 text-xs font-mono font-bold text-zinc-300">
                            {Math.round(previewScale * 100)}%
                        </span>
                        <button
                            onClick={() => setPreviewScale(p => Math.max(0.2, p - 0.1))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <Minus size={16} />
                        </button>
                    </div>
                    <div className="w-4 h-px bg-zinc-800"></div>
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors group relative ${canUndo
                                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer'
                                : 'text-zinc-700 cursor-not-allowed opacity-50'
                            }`}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 size={16} />
                        <span className="absolute left-full ml-4 px-2 py-1 bg-black/90 text-[10px] font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            UNDO (Ctrl+Z)
                        </span>
                    </button>
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
                                        onMouseDown={(e) => {
                                            if (!isTemplateLocked) {
                                                handleMouseDown(e, i);
                                            }
                                        }}
                                        className={`absolute group ${selectedSlotIndex === i && !isTemplateLocked ? 'ring-2 ring-rose-500 z-10' : ''} ${!isTemplateLocked ? 'hover:ring-1 hover:ring-white/50' : ''}`}
                                        style={{
                                            left: `${slot.x}px`,
                                            top: `${slot.y}px`,
                                            width: `${slot.w}px`,
                                            height: `${slot.h}px`,
                                            cursor: isTemplateLocked ? 'default' : 'move'
                                        }}
                                        onClick={(e) => {
                                            // Provide retake functionality even if locked?
                                            // User request was "when locked I should not be able to move".
                                            // Retake is a functional action, "Moving" is a layout action.
                                            // Usually "Locked" means "Layout Locked", functionality remains.
                                            // So clicking to retake should arguably still work, OR maybe not if it interferes.
                                            // Let's allow click actions (startRetake) but disable drag.
                                            startRetake(i);
                                        }}
                                    >
                                        {/* Inner Content (Clipped) */}
                                        <div className="w-full h-full overflow-hidden pointer-events-none" style={{ borderRadius: `${photoRoundness}px` }}>
                                            {capturedImages[i] ? (
                                                <img src={capturedImages[i]} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-500/20 flex items-center justify-center border-2 border-dashed border-zinc-500/50">
                                                    <span className="text-xs font-bold text-white drop-shadow-md">{i + 1}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Resize Handles - Only if NOT locked */}
                                        {selectedSlotIndex === i && !isTemplateLocked && (
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
                                        className={`relative shrink-0 overflow-hidden aspect-[3/2] ${selectedDesign.border} w-full ${capturedImages[i] ? 'border-2 cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all' : 'border-2 border-dashed border-zinc-500/50 bg-zinc-500/10'}`}
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
