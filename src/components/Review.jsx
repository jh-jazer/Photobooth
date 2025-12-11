import React, { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Download, Printer } from 'lucide-react';
import { STRIP_DESIGNS } from '../constants';

export default function Review({ images, onHome, onRetake, template, initialDesign }) {
    const stripRef = useRef(null);
    const [selectedDesign, setSelectedDesign] = React.useState(initialDesign || STRIP_DESIGNS[0]);

    const downloadStrip = useCallback(async () => {
        if (stripRef.current === null) return;
        try {
            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
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
            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
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
        <div className="h-screen w-full flex flex-col md:flex-row bg-zinc-950 text-white overflow-hidden font-sans selection:bg-rose-500/30">
            {/* Left Panel: Preview */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-12 overflow-hidden bg-black/50 relative group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                <div className="h-full w-full flex items-center justify-center max-h-screen py-4 z-10">
                    {/* Scale container to ensure it fits */}
                    <div className="relative shadow-2xl origin-center transform scale-[0.5] md:scale-[0.7] 2xl:scale-100 transition-transform duration-500">
                        <div
                            ref={stripRef}
                            className={`${selectedDesign.bg} p-5 flex flex-col gap-4 mx-auto transition-colors duration-300`}
                            style={{ minWidth: '260px' }}
                        >
                            {selectedDesign.id !== 'wbc-party' && (
                                <h2 className={`text-center font-bold text-2xl tracking-widest border-b-2 pb-2 mb-2 ${selectedDesign.text} ${selectedDesign.border} uppercase`}>
                                    {selectedDesign.id === 'party-teal' ? 'YEAR-END PARTY' : 'PHOTOBOOTH'}
                                </h2>
                            )}

                            <div className={`grid gap-4 ${template?.gridClass || 'grid-cols-1'}`}>
                                {images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        className={`w-full aspect-[4/3] object-cover border-4 ${selectedDesign.border}`}
                                    />
                                ))}
                            </div>

                            {selectedDesign.id === 'wbc-party' ? (
                                <div className={`text-center leading-none whitespace-pre-wrap ${selectedDesign.text} mt-auto pb-4 drop-shadow-sm`}>
                                    {selectedDesign.footerText}
                                </div>
                            ) : (
                                <div className={`text-center text-xs font-mono mt-2 flex justify-between ${selectedDesign.text} opacity-80`}>
                                    <span>{new Date().toLocaleDateString()}</span>
                                    <span>#MMXXV</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Controls */}
            <div className="w-full md:w-[420px] bg-zinc-950 border-l border-zinc-900 p-8 flex flex-col gap-8 z-20 shadow-2xl overflow-y-auto">
                <div className="space-y-1 border-b border-zinc-900 pb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Review</h1>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Customize & Save</p>
                </div>

                {/* Design Selector */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        Strip Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {STRIP_DESIGNS.map(design => (
                            <button
                                key={design.id}
                                onClick={() => setSelectedDesign(design)}
                                className={`
                                    p-4 rounded-xl flex items-center gap-3 transition-all border
                                    ${selectedDesign.id === design.id
                                        ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/50'
                                        : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700'}
                                `}
                            >
                                <div className={`w-8 h-8 rounded-full shadow-sm ring-2 ring-white/10 ${design.buttonBg.split(' ')[0]}`} />
                                <span className={`font-medium text-sm ${selectedDesign.id === design.id ? 'text-white' : 'text-zinc-400'}`}>{design.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1" />

                {/* Primary Actions */}
                <div className="space-y-4 pt-6 border-t border-zinc-900">
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

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onRetake}
                            className="py-4 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold transition-all uppercase tracking-wider text-xs"
                        >
                            Retake
                        </button>
                        <button
                            onClick={onHome}
                            className="py-4 px-4 rounded-xl border border-zinc-800 hover:bg-white hover:text-black hover:border-white text-zinc-400 font-bold transition-all uppercase tracking-wider text-xs"
                        >
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
