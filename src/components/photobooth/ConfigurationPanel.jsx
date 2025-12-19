
import React from 'react';
import {
    ChevronDown, Trash2, Timer, Image as ImageIcon, Maximize2,
    Upload, Save, FolderOpen, Plus, X, RotateCcw, Lock, Unlock, Type
} from 'lucide-react';
import { usePhotoBooth } from './PhotoBoothContext';
import { STRIP_DESIGNS } from '../../constants';
// eslint-disable-next-line no-unused-vars
import FontPicker from '../common/FontPicker';

const ConfigurationPanel = ({ className = '' }) => {
    const [activeSection, setActiveSection] = React.useState('design'); // Default open section
    const [showAllDesigns, setShowAllDesigns] = React.useState(false);

    const toggleSection = (section) => {
        setActiveSection(prev => prev === section ? null : section);
    };

    const {
        maxPhotos, setMaxPhotos,
        capturedImages,
        timerDuration, setTimerDuration,
        elements, setElements,
        selectedElementId, setSelectedElementId,
        addTextElement, addImageElement, updateElement, deleteElement,
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
        recentColors, recentBgImages, recentTemplateImages, addToRecents, removeFromRecents, clearRecents,
        showLayoutPrompt, setShowLayoutPrompt, confirmLayout,
        isTemplateLocked, setIsTemplateLocked,
    } = usePhotoBooth();

    const [newTemplateName, setNewTemplateName] = React.useState('');
    const stickerInputRef = React.useRef(null);

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
        <div className={`flex flex-col h-full bg-slate-950/80 backdrop-blur-xl border-l border-white/5 overflow-hidden ${className}`}>
            {/* Studio Config Header */}
            <div className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm z-10">

                <h2 className="text-sm ml-6 font-black tracking-tighter uppercase text-rose-500 drop-shadow-sm">Customize Your Experience</h2>
            </div>

            {/* Scrollable Settings Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {templateImage && (
                    <>
                        {/* Template Editor */}
                        <div className="group">
                            <div className="w-full flex items-center justify-between text-xs font-bold text-rose-500 uppercase tracking-widest transition-colors mb-2">
                                <button
                                    onClick={() => toggleSection('template')}
                                    className="flex items-center gap-2 hover:text-rose-400"
                                >
                                    <Maximize2 size={14} /> Template Editor
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${activeSection === 'template' ? 'rotate-180' : ''}`} />
                                </button>
                                <button
                                    onClick={() => setIsTemplateLocked(!isTemplateLocked)}
                                    className={`p-1.5 rounded-lg transition-colors ${isTemplateLocked ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                                    title={isTemplateLocked ? "Unlock Editor" : "Lock Editor"}
                                >
                                    {isTemplateLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                </button>
                            </div>
                            {activeSection === 'template' && (
                                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {/* Top Padding Editor */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                            <span>Top Padding</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={layoutPaddingTop}
                                                    onChange={(e) => setLayoutPaddingTop(Number(e.target.value))}
                                                    disabled={isTemplateLocked}
                                                    className="w-12 bg-zinc-900 border border-zinc-700 rounded p-0.5 text-center text-xs font-mono text-zinc-300 focus:border-rose-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                                <span className="text-[10px] text-zinc-600">px</span>
                                                <button
                                                    onClick={() => setLayoutPaddingTop(15)}
                                                    disabled={isTemplateLocked}
                                                    className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Reset to 15px"
                                                >
                                                    <RotateCcw size={10} />
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="200"
                                            value={layoutPaddingTop}
                                            onChange={(e) => setLayoutPaddingTop(Number(e.target.value))}
                                            disabled={isTemplateLocked}
                                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Background Color */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                            <span>Background Color</span>
                                            <span className="font-mono text-zinc-400">{bgColor || 'None'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={bgColor || '#000000'}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="h-10 w-10 bg-zinc-800 rounded-lg cursor-pointer border border-zinc-700 p-1"
                                                title="Choose Background Color"
                                            />
                                            <button
                                                onClick={() => setBgColor('')}
                                                className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-zinc-600"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Spacer Editor */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                            <span>Image Spaces</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={layoutGap}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setLayoutGap(val);
                                                        setCustomSlots(prev => prev.map((slot, i) => ({
                                                            ...slot,
                                                            y: i * (slot.h + (val - 2))
                                                        })));
                                                    }}
                                                    disabled={isTemplateLocked}
                                                    className="w-12 bg-zinc-900 border border-zinc-700 rounded p-0.5 text-center text-xs font-mono text-zinc-300 focus:border-rose-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                                <span className="text-[10px] text-zinc-600">px</span>
                                                <button
                                                    onClick={() => {
                                                        setLayoutGap(13);
                                                        setCustomSlots(prev => prev.map((slot, i) => ({
                                                            ...slot,
                                                            y: i * (slot.h + (13 - 2))
                                                        })));
                                                    }}
                                                    className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Reset to 13px"
                                                    disabled={isTemplateLocked}>
                                                    <RotateCcw size={10} />
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={layoutGap}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setLayoutGap(val);
                                                setCustomSlots(prev => prev.map((slot, i) => ({
                                                    ...slot,
                                                    y: i * (slot.h + (val - 2))
                                                })));
                                            }}
                                            disabled={isTemplateLocked}
                                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Slot Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const w = 210;
                                                const x = Math.round((240 - w) / 2 - layoutPaddingSide);
                                                setCustomSlots([...customSlots, { id: Date.now(), x, y: 0, w, h: 120 }]);
                                            }}
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
                                                <button
                                                    onClick={() => {
                                                        setCustomSlots(prev => prev.map(s => ({
                                                            ...s,
                                                            x: Math.round((240 - s.w) / 2 - layoutPaddingSide)
                                                        })));
                                                    }}
                                                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors text-zinc-400 hover:text-white flex items-center justify-center gap-2"
                                                >
                                                    <Maximize2 size={12} /> Auto-Center All Slots
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-zinc-900"></div>
                    </>
                )}



                {/* Elements (Text & Stickers) */}
                <div className="group">
                    <button
                        onClick={() => toggleSection('elements')}
                        className="w-full flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
                    >
                        <span className="flex items-center gap-2">Elements</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${activeSection === 'elements' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSection === 'elements' && (
                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={addTextElement}
                                    disabled={!!templateImage}
                                    className={`flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${!!templateImage ? 'opacity-30 cursor-not-allowed hover:bg-zinc-800' : ''}`}
                                    title={!!templateImage ? "Adding elements is disabled for custom templates" : "Add Text"}
                                >
                                    <Type size={14} /> Add Text
                                </button>
                                <button
                                    onClick={() => stickerInputRef.current.click()}
                                    disabled={!!templateImage}
                                    className={`flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${!!templateImage ? 'opacity-30 cursor-not-allowed hover:bg-zinc-800' : ''}`}
                                    title={!!templateImage ? "Adding elements is disabled for custom templates" : "Add Sticker"}
                                >
                                    <ImageIcon size={14} /> Add Sticker
                                </button>
                                <input
                                    type="file"
                                    ref={stickerInputRef}
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            addImageElement(e.target.files[0]);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>

                            {/* Layer List */}
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {elements.length === 0 && (
                                    <div className="text-[10px] text-zinc-600 text-center italic py-2">No elements added</div>
                                )}
                                {elements.map(el => (
                                    <div key={el.id}
                                        onClick={() => setSelectedElementId(el.id)}
                                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${selectedElementId === el.id ? 'bg-zinc-800 border-rose-500/50' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            {el.type === 'text' ? <Maximize2 size={12} className="text-zinc-500" /> : <ImageIcon size={12} className="text-zinc-500" />}
                                            <span className="text-xs text-zinc-300 truncate max-w-[100px] font-mono">
                                                {el.type === 'text' ? el.text : 'Sticker Image'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                            className="p-1 hover:bg-red-900/30 rounded text-zinc-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Selected Layer Controls */}
                            {selectedElementId && elements.find(el => el.id === selectedElementId) && (
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                                    <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                                        Editing {elements.find(el => el.id === selectedElementId).type === 'text' ? 'Text' : 'Sticker'}
                                    </div>

                                    {elements.find(el => el.id === selectedElementId).type === 'text' ? (
                                        <>
                                            <input
                                                type="text"
                                                value={elements.find(el => el.id === selectedElementId).text}
                                                onChange={(e) => updateElement(selectedElementId, { text: e.target.value })}
                                                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs focus:border-rose-500 focus:outline-none"
                                                placeholder="Text content..."
                                            />
                                            <div className="flex gap-2">
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-[10px] font-bold text-zinc-600 uppercase">Font</label>
                                                    <FontPicker
                                                        selectedFont={elements.find(el => el.id === selectedElementId).fontFamily}
                                                        onFontChange={(newFont) => updateElement(selectedElementId, { fontFamily: newFont })}
                                                    />
                                                </div>
                                                <div className="w-1/3 space-y-2">
                                                    <label className="text-[10px] font-bold text-zinc-600 uppercase">Size</label>
                                                    <input
                                                        type="number"
                                                        value={elements.find(el => el.id === selectedElementId).fontSize}
                                                        onChange={(e) => updateElement(selectedElementId, { fontSize: Number(e.target.value) })}
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
                                                            onClick={() => updateElement(selectedElementId, { tracking: t.value })}
                                                            className={`flex-1 py-1.5 text-[10px] rounded-md transition-all ${elements.find(el => el.id === selectedElementId).tracking === t.value ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                        >
                                                            {t.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold text-zinc-500 uppercase">Color</div>
                                                <input
                                                    type="color"
                                                    value={elements.find(el => el.id === selectedElementId).color || '#000000'}
                                                    onChange={(e) => updateElement(selectedElementId, { color: e.target.value })}
                                                    className="w-full h-8 bg-zinc-800 rounded-lg cursor-pointer border border-zinc-700"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        /* Sticker Controls */
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                                    <span>Size (Width)</span>
                                                    <span className="font-mono text-zinc-400">{elements.find(el => el.id === selectedElementId).width}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="300"
                                                    value={elements.find(el => el.id === selectedElementId).width || 100}
                                                    onChange={(e) => updateElement(selectedElementId, { width: Number(e.target.value) })}
                                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                            <span>Rotation</span>
                                            <span className="font-mono text-zinc-400">{elements.find(el => el.id === selectedElementId).rotation || 0}°</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-180"
                                            max="180"
                                            value={elements.find(el => el.id === selectedElementId).rotation || 0}
                                            onChange={(e) => updateElement(selectedElementId, { rotation: Number(e.target.value) })}
                                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-px bg-zinc-900"></div>





                {/* Design Picker */}
                <div className="group">
                    <button
                        onClick={() => toggleSection('design')}
                        className="w-full flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
                    >
                        <span className="flex items-center gap-2">Strip Style</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${activeSection === 'design' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSection === 'design' && (
                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Background Design</span>
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



                            {/* Presets Grid */}
                            <div className="grid grid-cols-5 gap-3">
                                {/* Recent Colors (Max 2) */}
                                {recentColors.slice(0, 2).map((color, i) => (
                                    <button
                                        key={`color-${i}`}
                                        onClick={() => setBgColor(color)}
                                        className={`aspect-square rounded-full border-2 transition-all relative group overflow-hidden ${bgColor === color
                                            ? 'border-rose-500 ring-4 ring-rose-500/20 scale-110'
                                            : 'border-zinc-800 hover:border-white'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}

                                {/* Recent Designs (First 2) */}
                                {STRIP_DESIGNS.slice(0, 2).map(design => (
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
                                        <div className={`w-full h-full ${design.bg}`}></div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowAllDesigns(true)}
                                    className="aspect-square rounded-full border-2 border-dashed border-zinc-700 hover:border-zinc-500 flex items-center justify-center transition-all bg-zinc-900/50 hover:bg-zinc-800"
                                >
                                    <Plus size={20} className="text-zinc-500" />
                                </button>
                            </div>



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
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Recents</span>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Clear recent templates history?')) {
                                                    clearRecents('templateImage');
                                                }
                                            }}
                                            className="text-[10px] text-zinc-600 hover:text-red-500 transition-colors uppercase font-bold tracking-wider"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar px-1">
                                        {recentTemplateImages.map((img, i) => img && (
                                            <div key={i} className="relative group/recent flex-shrink-0 w-14 h-14">
                                                <button
                                                    onClick={() => {
                                                        setTemplateImage(img);
                                                        setElements([]);
                                                    }}
                                                    className={`w-full h-full rounded-full overflow-hidden border-2 transition-all relative ${templateImage === img
                                                        ? 'border-rose-500 ring-2 ring-rose-500/20 scale-110'
                                                        : 'border-zinc-800 hover:border-white'
                                                        }`}
                                                >
                                                    <img src={img} alt="Recent" className="w-full h-full object-cover" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFromRecents('templateImage', img);
                                                        if (templateImage === img) setTemplateImage(null);
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/recent:opacity-100 transition-opacity shadow-sm"
                                                >
                                                    <Trash2 size={8} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                        </div>
                    )}
                </div>









            </div>

            {/* All Designs Modal */}
            {showAllDesigns && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-in fade-in duration-200">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={20} className="text-rose-500" /> All Frames
                            </h3>
                            <button
                                onClick={() => setShowAllDesigns(false)}
                                className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar p-2 space-y-8">

                            {/* Recent Colors Section */}
                            {recentColors.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Recent Frames</h4>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                                        {recentColors.map((color, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setBgColor(color);
                                                        setSelectedDesign({}); // Clear design selection
                                                        setBgImage(null);
                                                        setTemplateImage(null);
                                                        setShowAllDesigns(false);
                                                    }}
                                                    className={`w-full aspect-square rounded-full border-2 transition-all relative group overflow-hidden ${bgColor === color
                                                        ? 'border-rose-500 ring-4 ring-rose-500/20 scale-110 shadow-lg shadow-rose-500/20'
                                                        : 'border-transparent ring-2 ring-zinc-800 opacity-60 hover:opacity-100 hover:scale-105'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                >
                                                </button>
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider truncate w-full text-center">{color}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preset Designs Section */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Preset Gradient</h4>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                                    {STRIP_DESIGNS.map(design => (
                                        <div key={design.id} className="flex flex-col items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedDesign(design);
                                                    setBgColor('');
                                                    setBgImage(null);
                                                    setTemplateImage(null);
                                                    setShowAllDesigns(false);
                                                }}
                                                className={`w-full aspect-square rounded-full border-2 transition-all relative group overflow-hidden ${selectedDesign.id === design.id && !bgColor && !bgImage && !templateImage
                                                    ? 'border-rose-500 ring-4 ring-rose-500/20 scale-110 shadow-lg shadow-rose-500/20'
                                                    : 'border-transparent ring-2 ring-zinc-800 opacity-60 hover:opacity-100 hover:scale-105'
                                                    }`}
                                            >
                                                <div className={`w-full h-full ${design.bg}`}></div>
                                            </button>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{design.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Layout Prompt Modal */}
            {showLayoutPrompt && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-8 animate-in fade-in duration-200">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-md flex flex-col shadow-2xl items-center text-center space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Select Grid Layout</h3>
                            <p className="text-zinc-400 text-sm">How many photo frames does this template have?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            {[1, 2, 3, 4].map(num => (
                                <button
                                    key={num}
                                    onClick={() => num === 4 && confirmLayout(num)}
                                    disabled={num !== 4}
                                    className={`aspect-[3/2] rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${num !== 4
                                        ? 'border-zinc-900 bg-zinc-950 opacity-50 cursor-not-allowed'
                                        : 'border-zinc-800 hover:border-rose-500 bg-zinc-900 hover:bg-zinc-800 cursor-pointer'
                                        }`}
                                >
                                    <span className={`text-2xl font-bold ${num !== 4 ? 'text-zinc-700' : 'text-white group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-purple-500'} transition-all`}>
                                        {num}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                        {num !== 4 ? 'Coming Soon' : 'Frames'}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowLayoutPrompt(false)}
                            className="text-xs text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-widest mt-4"
                        >
                            Cancel Upload
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ConfigurationPanel;
