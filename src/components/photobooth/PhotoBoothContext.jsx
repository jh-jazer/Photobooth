
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { STRIP_DESIGNS } from '../../constants';

const PhotoBoothContext = createContext();

export const usePhotoBooth = () => useContext(PhotoBoothContext);

export const PhotoBoothProvider = ({ children }) => {
    // --- STATE ---

    // Capture State
    const [isCapturingLoop, setIsCapturingLoop] = useState(false);
    const [capturedImages, setCapturedImages] = useState([]);
    const [maxPhotos, setMaxPhotos] = useState(3);
    const [timerDuration, setTimerDuration] = useState(3);
    const [countdown, setCountdown] = useState(null);

    // Design State
    const [selectedDesign, setSelectedDesign] = useState(STRIP_DESIGNS[0]);
    const [bgColor, setBgColor] = useState('');
    const [bgImage, setBgImage] = useState(null);
    const [templateImage, setTemplateImage] = useState(null);

    // Layout State (Custom)
    const [layoutGap, setLayoutGap] = useState(12);
    const [layoutPaddingTop, setLayoutPaddingTop] = useState(8);
    const [layoutPaddingSide, setLayoutPaddingSide] = useState(8);
    const [layoutPaddingBottom, setLayoutPaddingBottom] = useState(8);
    const [photoRoundness, setPhotoRoundness] = useState(0);

    // Text Layers State
    const [textLayers, setTextLayers] = useState([]);
    const [selectedTextId, setSelectedTextId] = useState(null);

    // Custom Template Slots
    const [customSlots, setCustomSlots] = useState([
        { id: 1, x: 20, y: 80, w: 200, h: 150 },
        { id: 2, x: 20, y: 240, w: 200, h: 150 },
        { id: 3, x: 20, y: 400, w: 200, h: 150 },
    ]);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    const [stripHeight, setStripHeight] = useState(640);

    // Preview & Interaction State
    const [previewScale, setPreviewScale] = useState(0.55);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    // Donation Popup State
    const [isDonationPopupOpen, setIsDonationPopupOpen] = useState(false);
    const [donationStep, setDonationStep] = useState('prompt'); // 'prompt' | 'qr'

    // --- REFS ---
    const webcamRef = useRef(null);
    const stripRef = useRef(null);
    const fileInputRef = useRef(null);
    const bgFileInputRef = useRef(null);
    const templateFileInputRef = useRef(null);
    const dragRef = useRef(null);

    // --- Saved & Recents Logic ---
    const [savedTemplates, setSavedTemplates] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('savedTemplates')) || [];
        } catch { return []; }
    });

    const [recentColors, setRecentColors] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentColors')) || [];
        } catch { return []; }
    });

    const [recentBgImages, setRecentBgImages] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentBgImages')) || [];
        } catch { return []; }
    });

    const [recentTemplateImages, setRecentTemplateImages] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentTemplateImages')) || [];
        } catch { return []; }
    });

    // Persistence Effects
    useEffect(() => localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates)), [savedTemplates]);
    useEffect(() => localStorage.setItem('recentColors', JSON.stringify(recentColors)), [recentColors]);
    useEffect(() => localStorage.setItem('recentBgImages', JSON.stringify(recentBgImages)), [recentBgImages]);
    useEffect(() => localStorage.setItem('recentTemplateImages', JSON.stringify(recentTemplateImages)), [recentTemplateImages]);

    const saveTemplate = (name) => {
        const newTemplate = {
            id: Date.now(),
            name,
            config: {
                selectedDesign, bgColor, bgImage, templateImage,
                layoutGap, layoutPaddingTop, layoutPaddingSide, layoutPaddingBottom, photoRoundness,
                headerText, headerFont, headerSize, headerTracking,
                footerText, footerFont, footerSize, footerOffsetY, footerTracking,
                customSlots, stripHeight
            }
        };
        setSavedTemplates(prev => [newTemplate, ...prev]);
    };

    const loadTemplate = (template) => {
        const c = template.config;
        if (c.selectedDesign) setSelectedDesign(c.selectedDesign);
        if (c.bgColor !== undefined) setBgColor(c.bgColor);
        if (c.bgImage !== undefined) setBgImage(c.bgImage);
        if (c.templateImage !== undefined) setTemplateImage(c.templateImage);

        if (c.layoutGap !== undefined) setLayoutGap(c.layoutGap);
        if (c.layoutPaddingTop !== undefined) setLayoutPaddingTop(c.layoutPaddingTop);
        if (c.layoutPaddingSide !== undefined) setLayoutPaddingSide(c.layoutPaddingSide);
        if (c.layoutPaddingBottom !== undefined) setLayoutPaddingBottom(c.layoutPaddingBottom);
        // Fallback for old templates
        if (c.layoutPadding !== undefined) {
            if (c.layoutPaddingTop === undefined) setLayoutPaddingTop(c.layoutPadding);
            if (c.layoutPaddingSide === undefined) setLayoutPaddingSide(c.layoutPadding);
            if (c.layoutPaddingBottom === undefined) setLayoutPaddingBottom(c.layoutPadding);
        }
        if (c.photoRoundness !== undefined) setPhotoRoundness(c.photoRoundness);

        if (c.textLayers !== undefined) setTextLayers(c.textLayers);

        if (c.customSlots !== undefined) setCustomSlots(c.customSlots);
        if (c.stripHeight !== undefined) setStripHeight(c.stripHeight);
    };

    const deleteTemplate = (id) => {
        setSavedTemplates(prev => prev.filter(t => t.id !== id));
    };

    const addTextLayer = () => {
        const id = Date.now();
        setTextLayers(prev => [...prev, {
            id,
            text: 'Add Text',
            x: 50, y: 50,
            fontFamily: 'font-sans',
            fontSize: 24,
            fontWeight: 'normal',
            color: '#000000',
            tracking: 'tracking-normal',
            rotation: 0
        }]);
        setSelectedTextId(id);
    };

    const updateTextLayer = (id, updates) => {
        setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const deleteTextLayer = (id) => {
        setTextLayers(prev => prev.filter(l => l.id !== id));
        if (selectedTextId === id) setSelectedTextId(null);
    };

    const addToRecents = (type, value) => {
        if (!value) return;
        const limit = 5;
        if (type === 'color') {
            setRecentColors(prev => [value, ...prev.filter(c => c !== value)].slice(0, limit));
        } else if (type === 'bgImage') {
            setRecentBgImages(prev => [value, ...prev.filter(i => i !== value)].slice(0, limit));
        } else if (type === 'templateImage') {
            setRecentTemplateImages(prev => [value, ...prev.filter(i => i !== value)].slice(0, limit));
        }
    };

    // --- LOGIC ---

    const totalSlots = templateImage ? customSlots.length : maxPhotos;

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setCapturedImages(prev => {
                const newImages = [...prev, imageSrc];
                if (newImages.length >= totalSlots) {
                    setIsCapturingLoop(false);
                }
                return newImages;
            });
        }
    }, [totalSlots]);

    // Capture Loop
    useEffect(() => {
        if (!isCapturingLoop) return;

        // Safety: Manual mode shouldn't loop
        if (timerDuration === 0) {
            setIsCapturingLoop(false);
            return;
        }

        if (capturedImages.length >= totalSlots) {
            setIsCapturingLoop(false);
            return;
        }
        if (countdown === null) {
            setCountdown(timerDuration);
        }
    }, [isCapturingLoop, capturedImages.length, totalSlots, countdown, timerDuration]);

    // Countdown Logic
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

    // Keyboard Slot Movement
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!templateImage || selectedSlotIndex === null) return;
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            const step = e.shiftKey ? 10 : 1;
            let deltaX = 0;
            let deltaY = 0;

            switch (e.key) {
                case 'ArrowUp': deltaY = -step; break;
                case 'ArrowDown': deltaY = step; break;
                case 'ArrowLeft': deltaX = -step; break;
                case 'ArrowRight': deltaX = step; break;
                default: return;
            }

            e.preventDefault();
            setCustomSlots(prev => prev.map((slot, i) => {
                if (i !== selectedSlotIndex) return slot;
                return { ...slot, x: slot.x + deltaX, y: slot.y + deltaY };
            }));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [templateImage, selectedSlotIndex]);

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        const remainingSlots = totalSlots - capturedImages.length;
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
        reader.onload = (e) => {
            const result = e.target.result;
            setBgImage(result);
            addToRecents('bgImage', result);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleTemplateUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            setTemplateImage(result);
            addToRecents('templateImage', result);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const retake = () => {
        setCapturedImages([]);
        setIsCapturingLoop(false);
        setCountdown(null);
    };

    const downloadStrip = useCallback(async (format = 'png') => {
        if (stripRef.current === null) return;
        const originalTransform = stripRef.current.style.transform;
        stripRef.current.style.transform = 'scale(1)';

        try {
            if (format === 'pdf') {
                const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
                // Calculate dimensions to match aspect ratio
                const imgWidth = stripRef.current.offsetWidth;
                const imgHeight = stripRef.current.offsetHeight;

                // Use jsPDF
                // We typically want A4 or just fit to image size? The user said "save as pdf".
                // Let's make the PDF size match the image size for best quality/portability.
                // Note: jsPDF uses points by default, we can set unit to px.
                const pdf = new jsPDF({
                    orientation: imgHeight > imgWidth ? 'p' : 'l',
                    unit: 'px',
                    format: [imgWidth, imgHeight]
                });

                pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save('photobooth-strip.pdf');
            } else {
                let dataUrl;
                let filename = `photobooth-strip.${format}`;

                if (format === 'jpg' || format === 'jpeg') {
                    dataUrl = await toJpeg(stripRef.current, { cacheBust: true, pixelRatio: 3, quality: 0.95 });
                } else {
                    dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
                }

                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.click();
            }

            // Show donation popup on success
            stripRef.current.style.transform = originalTransform;
            setIsDonationPopupOpen(true);
            setDonationStep('prompt');
        } catch (err) {
            console.error(err);
            stripRef.current.style.transform = originalTransform;
            alert('Error saving file. Please try again.');
        }
    }, []);

    const printStrip = useCallback(async () => {
        if (stripRef.current === null) return;
        const originalTransform = stripRef.current.style.transform;
        stripRef.current.style.transform = 'scale(1)';
        try {
            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
            stripRef.current.style.transform = originalTransform;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head><title>Print Photo Strip</title>
                    <style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;}img{max-height:100%;max-width:100%;}</style>
                    </head>
                    <body><img src="${dataUrl}" onload="window.print();window.close()" /></body>
                </html>
            `);
            printWindow.document.close();
            // Show donation popup on success
            setIsDonationPopupOpen(true);
            setDonationStep('prompt');
        } catch (err) {
            console.error(err);
            stripRef.current.style.transform = originalTransform;
        }
    }, []);

    // Drag & Pan Logic
    const handleGlobalMouseMove = useCallback((e) => {
        if (!dragRef.current) return;
        const { type, handle, index, id, startX, startY, startSlot, startLayer, startPan } = dragRef.current;

        if (type === 'pan') {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            setPanOffset({ x: startPan.x + deltaX, y: startPan.y + deltaY });
            return;
        }

        const scale = previewScale;
        const deltaX = (e.clientX - startX) / scale;
        const deltaY = (e.clientY - startY) / scale;

        if (type === 'text') {
            setTextLayers(prev => prev.map(l => {
                if (l.id !== id) return l;
                return {
                    ...l,
                    x: Math.round(startLayer.x + deltaX),
                    y: Math.round(startLayer.y + deltaY)
                };
            }));
            return;
        }

        setCustomSlots(prev => prev.map((slot, i) => {
            if (i !== index) return slot;
            if (type === 'move') {
                return {
                    ...slot,
                    x: Math.round(startSlot.x + deltaX),
                    y: Math.round(startSlot.y + deltaY)
                };
            } else {
                let newSlot = { ...slot };
                if (handle.includes('e')) newSlot.w = Math.max(20, Math.round(startSlot.w + deltaX));
                if (handle.includes('s')) newSlot.h = Math.max(20, Math.round(startSlot.h + deltaY));
                if (handle.includes('w')) {
                    const w = Math.max(20, Math.round(startSlot.w - deltaX));
                    newSlot.x = Math.round(startSlot.x + (startSlot.w - w));
                    newSlot.w = w;
                }
                if (handle.includes('n')) {
                    const h = Math.max(20, Math.round(startSlot.h - deltaY));
                    newSlot.y = Math.round(startSlot.y + (startSlot.h - h));
                    newSlot.h = h;
                }
                return newSlot;
            }
        }));
    }, [previewScale]);

    const handleGlobalMouseUp = useCallback(() => {
        dragRef.current = null;
        setIsPanning(false);
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [handleGlobalMouseMove]);

    const handleMouseDown = (e, index, handle = 'move') => {
        if (!templateImage || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        setSelectedSlotIndex(index);
        const startSlot = customSlots[index];
        dragRef.current = {
            type: handle === 'move' ? 'move' : 'resize',
            handle,
            index,
            startX: e.clientX,
            startY: e.clientY,
            startSlot: { ...startSlot }
        };
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleTextMouseDown = (e, id) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        setSelectedTextId(id);
        const layer = textLayers.find(l => l.id === id);
        if (!layer) return;

        dragRef.current = {
            type: 'text',
            id,
            startX: e.clientX,
            startY: e.clientY,
            startLayer: { ...layer }
        };
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleContainerMouseDown = (e) => {
        if (e.button === 2) {
            e.preventDefault();
            e.stopPropagation();
            setIsPanning(true);
            dragRef.current = {
                type: 'pan',
                startX: e.clientX,
                startY: e.clientY,
                startPan: { ...panOffset }
            };
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        };
    };

    const value = {
        // State
        isCapturingLoop, setIsCapturingLoop,
        capturedImages, setCapturedImages,
        maxPhotos, setMaxPhotos,
        timerDuration, setTimerDuration,
        countdown, setCountdown,
        selectedDesign, setSelectedDesign,
        bgColor, setBgColor: (color) => { setBgColor(color); addToRecents('color', color); },
        bgImage, setBgImage,
        templateImage, setTemplateImage,
        layoutGap, setLayoutGap,
        layoutPaddingTop, setLayoutPaddingTop,
        layoutPaddingSide, setLayoutPaddingSide,
        layoutPaddingBottom, setLayoutPaddingBottom,
        photoRoundness, setPhotoRoundness,
        textLayers, setTextLayers,
        selectedTextId, setSelectedTextId,
        addTextLayer, updateTextLayer, deleteTextLayer,
        customSlots, setCustomSlots,
        selectedSlotIndex, setSelectedSlotIndex,
        stripHeight, setStripHeight,
        previewScale, setPreviewScale,
        panOffset, setPanOffset,
        isPanning, setIsPanning,
        // Refs (exposed as current values? OR just ref objects)
        webcamRef, stripRef, fileInputRef, bgFileInputRef, templateFileInputRef,
        // Handlers
        capture, retake, handleFileUpload, handleBgUpload, handleTemplateUpload,
        downloadStrip, printStrip,
        handleMouseDown, handleTextMouseDown, handleContainerMouseDown,
        totalSlots, // Expose derived value

        // Saved & Recents
        savedTemplates, saveTemplate, loadTemplate, deleteTemplate,
        savedTemplates, saveTemplate, loadTemplate, deleteTemplate,
        recentColors, recentBgImages, recentTemplateImages,

        // Donation Popup
        isDonationPopupOpen, setIsDonationPopupOpen,
        donationStep, setDonationStep
    };

    return (
        <PhotoBoothContext.Provider value={value}>
            {children}
        </PhotoBoothContext.Provider>
    );
};
