
import React from 'react';
import {
    ChevronDown, Trash2, Timer, Image as ImageIcon, Maximize2,
    Upload, Save, FolderOpen
} from 'lucide-react';
import { usePhotoBooth } from './PhotoBoothContext';
import { STRIP_DESIGNS } from '../../constants';

const ConfigurationPanel = ({ className = '' }) => {
    const {
        maxPhotos, setMaxPhotos,
        capturedImages,
        timerDuration, setTimerDuration,
        textLayers, setTextLayers, // eslint-disable-line no-unused-vars
        selectedTextId, setSelectedTextId,
        addTextLayer, updateTextLayer, deleteTextLayer,
        layoutGap, setLayoutGap,
        layoutPaddingTop, setLayoutPaddingTop,
        layoutPaddingSide, setLayoutPaddingSide,
        layoutPaddingBottom, setLayoutPaddingBottom,
        photoRoundness, setPhotoRoundness,
        selectedDesign, setSelectedDesign,
        bgColor, setBgColor,
        bgImage, setBgImage,
        bgFileInputRef, handleBgUpload,
        templateImage, setTemplateImage,
        templateFileInputRef, handleTemplateUpload,
        stripHeight, setStripHeight,
        customSlots, setCustomSlots,
        selectedSlotIndex, setSelectedSlotIndex,
        totalSlots,
        savedTemplates, saveTemplate, loadTemplate, deleteTemplate,
        recentColors, recentBgImages, recentTemplateImages
    } = usePhotoBooth();

    const [newTemplateName, setNewTemplateName] = React.useState('');

    const fonts = [
        { label: 'Sans', value: 'font-sans' },
        { label: 'Serif', value: 'font-serif' },
        { label: 'Mono', value: 'font-mono' }
    ];

    const sizes = [
        { label: 'S', value: 'text-sm' },
        { label: 'M', value: 'text-xl' },
        { label: 'L', value: 'text-3xl' },
        { label: 'XL', value: 'text-5xl' },
        { label: '2XL', value: 'text-6xl' }
    ];

    const trackings = [
        { label: 'Tight', value: 'tracking-tighter' },
        { label: 'Normal', value: 'tracking-normal' },
        { label: 'Wide', value: 'tracking-widest' }
    ];

    return (
        <div className={`flex flex-col h-full bg-zinc-950 border-l border-zinc-900 overflow-hidden ${className}`}>
            {/* Studio Config Header */}
            <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <h1 className="text-lg font-bold tracking-widest uppercase text-zinc-400">Studio Configuration</h1>
                </div>
                <h2 className="text-sm ml-6 font-bold tracking-widest uppercase text-zinc-400">Customize Your Experience</h2>
            </div>

            {/* Scrollable Settings Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {templateImage && (
                    <>
                        {/* Template Editor */}
                        <details className="group" open>
                            <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors">
                                <span className="flex items-center gap-2"><Maximize2 size={14} /> Template Editor</span>
                                <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            <div className="mt-4 space-y-4">
                                {/* Strip Height */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                        <span>Strip Height</span>
                                        <span className="font-mono text-zinc-400">{stripHeight}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="400"
                                        max="1200"
                                        value={stripHeight}
                                        onChange={(e) => setStripHeight(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {/* Slot Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCustomSlots([...customSlots, { id: Date.now(), x: 10, y: 10, w: 220, h: 144 }])}
                                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Maximize2 size={14} /> Add Slot
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedSlotIndex !== null) {
                                                setCustomSlots(customSlots.filter((_, i) => i !== selectedSlotIndex));
                                                setSelectedSlotIndex(null);
                                            }
                                        }}
                                        disabled={selectedSlotIndex === null}
                                        className="flex-1 py-3 bg-zinc-800 hover:bg-rose-900/40 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-rose-500"
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>

                                {/* Selected Slot Controls */}
                                {selectedSlotIndex !== null && customSlots[selectedSlotIndex] && (
                                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                                        <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                                            Editing Slot {selectedSlotIndex + 1}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500">X Position</label>
                                                <input type="number"
                                                    value={customSlots[selectedSlotIndex].x}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setCustomSlots(customSlots.map((s, i) => i === selectedSlotIndex ? { ...s, x: val } : s));
                                                    }}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-center font-mono focus:border-rose-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500">Y Position</label>
                                                <input type="number"
                                                    value={customSlots[selectedSlotIndex].y}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setCustomSlots(customSlots.map((s, i) => i === selectedSlotIndex ? { ...s, y: val } : s));
                                                    }}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-center font-mono focus:border-rose-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500">Width</label>
                                                <input type="number"
                                                    value={customSlots[selectedSlotIndex].w}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setCustomSlots(customSlots.map((s, i) => i === selectedSlotIndex ? { ...s, w: val } : s));
                                                    }}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-center font-mono focus:border-rose-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500">Height</label>
                                                <input type="number"
                                                    value={customSlots[selectedSlotIndex].h}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setCustomSlots(customSlots.map((s, i) => i === selectedSlotIndex ? { ...s, h: val } : s));
                                                    }}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-center font-mono focus:border-rose-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    const { x } = customSlots[selectedSlotIndex];
                                                    setCustomSlots(prev => prev.map(s => ({ ...s, x })));
                                                }}
                                                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors text-zinc-400 hover:text-white flex items-center justify-center gap-2"
                                            >
                                                <Maximize2 size={12} className="rotate-90" /> Apply X Pos to All Slots
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const { w, h } = customSlots[selectedSlotIndex];
                                                    setCustomSlots(prev => prev.map(s => ({ ...s, w, h })));
                                                }}
                                                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors text-zinc-400 hover:text-white flex items-center justify-center gap-2"
                                            >
                                                <Maximize2 size={12} /> Apply Size to All Slots
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </details>

                        <div className="h-px bg-zinc-900"></div>
                    </>
                )}

                {!templateImage && (
                    <>
                        {/* Layout Adjustments */}
                        <details className="group">
                            <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">
                                <span className="flex items-center gap-2"><Maximize2 size={14} /> Layout Adjustments</span>
                                <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            <div className="mt-4 space-y-4">
                                {/* Photo Spacing */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                        <span>Photo Spacing</span>
                                        <span className="font-mono text-zinc-400">{layoutGap}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={layoutGap}
                                        onChange={(e) => setLayoutGap(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {/* Strip Padding */}
                                {/* Top Padding */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                        <span>Top Padding</span>
                                        <span className="font-mono text-zinc-400">{layoutPaddingTop}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={layoutPaddingTop}
                                        onChange={(e) => setLayoutPaddingTop(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {/* Side Padding */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                        <span>Side Padding</span>
                                        <span className="font-mono text-zinc-400">{layoutPaddingSide}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={layoutPaddingSide}
                                        onChange={(e) => setLayoutPaddingSide(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {/* Bottom Padding */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                        <span>Bottom Padding</span>
                                        <span className="font-mono text-zinc-400">{layoutPaddingBottom}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={layoutPaddingBottom}
                                        onChange={(e) => setLayoutPaddingBottom(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {/* Photo Roundness */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                        <span>Corner Radius</span>
                                        <span className="font-mono text-zinc-400">{photoRoundness}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={photoRoundness}
                                        onChange={(e) => setPhotoRoundness(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>
                            </div>
                        </details>

                        <div className="h-px bg-zinc-900"></div>
                    </>
                )}

                {/* Text Layers */}
                <details className="group">
                    <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">
                        <span className="flex items-center gap-2">Text Layers</span>
                        <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 space-y-4">
                        {/* Actions */}
                        <button
                            onClick={addTextLayer}
                            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Maximize2 size={14} className="rotate-45" /> Add New Text
                        </button>

                        {/* Layer List */}
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {textLayers.length === 0 && (
                                <div className="text-[10px] text-zinc-600 text-center italic py-2">No text layers added</div>
                            )}
                            {textLayers.map(layer => (
                                <div key={layer.id}
                                    onClick={() => setSelectedTextId(layer.id)}
                                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${selectedTextId === layer.id ? 'bg-zinc-800 border-rose-500/50' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    <span className="text-xs text-zinc-300 truncate max-w-[120px] font-mono">{layer.text}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteTextLayer(layer.id); }}
                                        className="p-1 hover:bg-red-900/30 rounded text-zinc-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Selected Layer Controls */}
                        {selectedTextId && textLayers.find(l => l.id === selectedTextId) && (
                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                                    Editing Layer
                                </div>
                                <input
                                    type="text"
                                    value={textLayers.find(l => l.id === selectedTextId).text}
                                    onChange={(e) => updateTextLayer(selectedTextId, { text: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs focus:border-rose-500 focus:outline-none"
                                    placeholder="Text content..."
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-600 uppercase">Font</label>
                                        <div className="flex bg-black rounded-lg p-1 border border-zinc-800">
                                            {fonts.map(f => (
                                                <button
                                                    key={f.value}
                                                    onClick={() => updateTextLayer(selectedTextId, { fontFamily: f.value })}
                                                    className={`flex-1 py-1.5 text-[10px] rounded-md transition-all ${textLayers.find(l => l.id === selectedTextId).fontFamily === f.value ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-1/3 space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-600 uppercase">Size</label>
                                        <input
                                            type="number"
                                            value={textLayers.find(l => l.id === selectedTextId).fontSize}
                                            onChange={(e) => updateTextLayer(selectedTextId, { fontSize: Number(e.target.value) })}
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-1.5 text-xs text-center font-mono focus:border-rose-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-600 uppercase">Spacing</label>
                                    <div className="flex bg-black rounded-lg p-1 border border-zinc-800">
                                        {trackings.map(t => (
                                            <button
                                                key={t.value}
                                                onClick={() => updateTextLayer(selectedTextId, { tracking: t.value })}
                                                className={`flex-1 py-1.5 text-[10px] rounded-md transition-all ${textLayers.find(l => l.id === selectedTextId).tracking === t.value ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                        <span>Rotation</span>
                                        <span className="font-mono text-zinc-400">{textLayers.find(l => l.id === selectedTextId).rotation || 0}°</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-180"
                                        max="180"
                                        value={textLayers.find(l => l.id === selectedTextId).rotation || 0}
                                        onChange={(e) => updateTextLayer(selectedTextId, { rotation: Number(e.target.value) })}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase">Color</div>
                                    <input
                                        type="color"
                                        value={textLayers.find(l => l.id === selectedTextId).color || '#000000'}
                                        onChange={(e) => updateTextLayer(selectedTextId, { color: e.target.value })}
                                        className="w-full h-8 bg-zinc-800 rounded-lg cursor-pointer border border-zinc-700"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </details>

                <div className="h-px bg-zinc-900"></div>

                {!templateImage && (
                    <>
                        {/* Grid Layout (Standard Mode Only?) - Actually "Grid Layout" section controls Max Photos */}
                        <details className="group">
                            <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">
                                <span className="flex items-center gap-2">Grid Layout</span>
                                <ChevronDown size={14} className="transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {[1, 2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setMaxPhotos(num)}
                                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${maxPhotos === num
                                            ? 'bg-zinc-100 text-black border-zinc-100 shadow-lg scale-105'
                                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                                            }`}
                                    >
                                        {num} Frames
                                    </button>
                                ))}
                            </div>
                        </details>

                        <div className="h-px bg-zinc-900"></div>
                    </>
                )}



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

                        {/* Recent Colors */}
                        {recentColors.length > 0 && (
                            <div className="flex gap-2 flex-wrap px-1">
                                {recentColors.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setBgColor(color)}
                                        className="w-6 h-6 rounded-full border border-zinc-800 shadow-sm hover:scale-110 hover:border-white transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        )}

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

                        {/* Recent BG Images */}
                        {recentBgImages.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar px-1">
                                {recentBgImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setBgImage(img)}
                                        className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 hover:border-rose-500 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                                    >
                                        <img src={img} alt="Recent" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Custom Template Upload */}
                        <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                            <input
                                type="file"
                                ref={templateFileInputRef}
                                accept="image/*"
                                onChange={handleTemplateUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => templateFileInputRef.current.click()}
                                className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                            >
                                <Upload size={14} className="text-zinc-400" />
                            </button>

                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Custom Template</span>
                                <span className="text-[10px] font-mono text-zinc-500">{templateImage ? 'Template Active' : 'None Selected'}</span>
                            </div>

                            {templateImage && (
                                <button
                                    onClick={() => setTemplateImage(null)}
                                    className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors"
                                    title="Remove Template"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>

                        {/* Recent Templates */}
                        {recentTemplateImages.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar px-1">
                                {recentTemplateImages.map((img, i) => img && (
                                    <button
                                        key={i}
                                        onClick={() => setTemplateImage(img)}
                                        className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-zinc-800 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <img src={img} alt="Recent" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-5 gap-3">
                            {STRIP_DESIGNS.map(design => {
                                const bgClass = design.buttonBg.split(' ')[0];
                                const isArbitrary = bgClass.startsWith('bg-[#');
                                const style = isArbitrary ? { backgroundColor: bgClass.slice(4, -1) } : {};

                                return (
                                    <button
                                        key={design.id}
                                        onClick={() => {
                                            setSelectedDesign(design);
                                            setBgColor(''); // Reset custom color when picking a preset
                                            setBgImage(null); // Reset custom image
                                            setTemplateImage(null); // Reset custom template
                                        }}
                                        className={`aspect-square rounded-full border-2 transition-all relative group overflow-hidden ${selectedDesign.id === design.id && !bgColor && !bgImage && !templateImage
                                            ? 'border-rose-500 ring-4 ring-rose-500/20 scale-110'
                                            : 'border-transparent ring-2 ring-zinc-800 opacity-60 hover:opacity-100 hover:scale-105'
                                            }`}
                                        title={design.label}
                                    >
                                        <div className={`w-full h-full ${bgClass}`} style={style}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </details>







            </div>


        </div>
    );
};

export default ConfigurationPanel;
