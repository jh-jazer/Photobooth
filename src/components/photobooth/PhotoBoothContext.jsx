
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
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
    const [layoutPadding, setLayoutPadding] = useState(8);
    const [photoRoundness, setPhotoRoundness] = useState(0);

    // Header State
    const [headerText, setHeaderText] = useState('');
    const [headerFont, setHeaderFont] = useState('font-sans');
    const [headerSize, setHeaderSize] = useState('text-xl');
    const [headerTracking, setHeaderTracking] = useState('tracking-normal');

    // Footer State
    const [footerText, setFooterText] = useState('');
    const [footerFont, setFooterFont] = useState('font-sans');
    const [footerSize, setFooterSize] = useState('text-sm');
    const [footerOffsetY, setFooterOffsetY] = useState(0);
    const [footerTracking, setFooterTracking] = useState('tracking-normal');

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

    // Saved Templates State
    const [savedTemplates, setSavedTemplates] = useState([]);

    // Recent History State
    const [recentColors, setRecentColors] = useState([]);
    const [recentBgImages, setRecentBgImages] = useState([]);
    const [recentTemplateImages, setRecentTemplateImages] = useState([]);

    // --- REFS ---
    const webcamRef = useRef(null);
    const stripRef = useRef(null);
    const fileInputRef = useRef(null);
    const bgFileInputRef = useRef(null);
    const templateFileInputRef = useRef(null);
    const dragRef = useRef(null);

    // --- LOGIC ---

    // Load templates & recents on mount
    useEffect(() => {
        const saved = localStorage.getItem('photobooth_templates');
        if (saved) {
            try { setSavedTemplates(JSON.parse(saved)); } catch (e) { console.error(e); }
        }

        const recents = localStorage.getItem('photobooth_recents');
        if (recents) {
            try {
                const data = JSON.parse(recents);
                if (data.colors) setRecentColors(data.colors);
                if (data.bgImages) setRecentBgImages(data.bgImages);
                if (data.templateImages) setRecentTemplateImages(data.templateImages);
            } catch (e) { console.error(e); }
        }
    }, []);

    // Save templates loop
    useEffect(() => {
        localStorage.setItem('photobooth_templates', JSON.stringify(savedTemplates));
    }, [savedTemplates]);

    // Save recents loop
    useEffect(() => {
        const data = {
            colors: recentColors,
            bgImages: recentBgImages,
            templateImages: recentTemplateImages
        };
        try {
            localStorage.setItem('photobooth_recents', JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save recents", e);
        }
    }, [recentColors, recentBgImages, recentTemplateImages]);

    const addToRecents = (item, setList) => {
        if (!item) return;
        setList(prev => {
            const filtered = prev.filter(i => i !== item);
            return [item, ...filtered].slice(0, 5);
        });
    };

    // Debounce adding color to recents
    useEffect(() => {
        if (!bgColor) return;
        const timer = setTimeout(() => {
            addToRecents(bgColor, setRecentColors);
        }, 1000);
        return () => clearTimeout(timer);
    }, [bgColor]);

    const saveTemplate = (name) => {
        const newTemplate = {
            id: Date.now(),
            name: name || `Template ${savedTemplates.length + 1}`,
            templateImage, // Warning: Large strings in LS
            customSlots,
            stripHeight,
            layoutGap,
            layoutPadding,
            photoRoundness,
            // Header/Footer? Maybe optional, but lets save layout stuff primarily
            headerText, headerFont, headerSize, headerTracking,
            footerText, footerFont, footerSize, footerOffsetY, footerTracking,
            bgColor, bgImage
        };
        setSavedTemplates(prev => [...prev, newTemplate]);
    };

    const loadTemplate = (template) => {
        setTemplateImage(template.templateImage || null);
        setCustomSlots(template.customSlots || []);
        setStripHeight(template.stripHeight || 640);

        setLayoutGap(template.layoutGap !== undefined ? template.layoutGap : 12);
        setLayoutPadding(template.layoutPadding !== undefined ? template.layoutPadding : 8);
        setPhotoRoundness(template.photoRoundness !== undefined ? template.photoRoundness : 0);

        setHeaderText(template.headerText || '');
        setHeaderFont(template.headerFont || 'font-sans');
        setHeaderSize(template.headerSize || 'text-xl');
        setHeaderTracking(template.headerTracking || 'tracking-normal');

        setFooterText(template.footerText || '');
        setFooterFont(template.footerFont || 'font-sans');
        setFooterSize(template.footerSize || 'text-sm');
        setFooterOffsetY(template.footerOffsetY || 0);
        setFooterTracking(template.footerTracking || 'tracking-normal');

        setBgColor(template.bgColor || '');
        setBgImage(template.bgImage || null);
    };

    const deleteTemplate = (id) => {
        setSavedTemplates(prev => prev.filter(t => t.id !== id));
    };

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

    // Capture Loop Logic
    useEffect(() => {
        if (!isCapturingLoop) return;

        // Stop if full
        if (capturedImages.length >= totalSlots) {
            setIsCapturingLoop(false);
            return;
        }

        // Automatic Mode: If timer > 0, start countdown automatically for next photo
        if (timerDuration > 0 && countdown === null) {
            setCountdown(timerDuration);
        }

        // Manual Mode (timer === 0): Do nothing here. 
        // The UI will show a "Capture Next" button which calls capture() manually.

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
            const res = e.target.result;
            setBgImage(res);
            addToRecents(res, setRecentBgImages);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleTemplateUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const res = e.target.result;
            setTemplateImage(res);
            addToRecents(res, setRecentTemplateImages);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const retake = () => {
        setCapturedImages([]);
        setIsCapturingLoop(false);
        setCountdown(null);
    };

    const downloadStrip = useCallback(async () => {
        if (stripRef.current === null) return;
        // Scale logic was here.
        const originalTransform = stripRef.current.style.transform;
        // Temporarily reset transform for clean capture
        stripRef.current.style.transform = 'scale(1)';

        try {
            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
            stripRef.current.style.transform = originalTransform;
            const link = document.createElement('a');
            link.download = 'photobooth-strip.png';
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
            stripRef.current.style.transform = originalTransform;
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
        } catch (err) {
            console.error(err);
            stripRef.current.style.transform = originalTransform;
        }
    }, []);

    // Drag & Pan Logic
    const handleGlobalMouseMove = useCallback((e) => {
        if (!dragRef.current) return;
        const { type, handle, index, startX, startY, startSlot, startPan } = dragRef.current;

        if (type === 'pan') {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            setPanOffset({ x: startPan.x + deltaX, y: startPan.y + deltaY });
            return;
        }

        const scale = previewScale;
        const deltaX = (e.clientX - startX) / scale;
        const deltaY = (e.clientY - startY) / scale;

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
        bgColor, setBgColor,
        bgImage, setBgImage,
        templateImage, setTemplateImage,
        layoutGap, setLayoutGap,
        layoutPadding, setLayoutPadding,
        photoRoundness, setPhotoRoundness,
        headerText, setHeaderText, headerFont, setHeaderFont, headerSize, setHeaderSize, headerTracking, setHeaderTracking,
        footerText, setFooterText, footerFont, setFooterFont, footerSize, setFooterSize, footerOffsetY, setFooterOffsetY, footerTracking, setFooterTracking,
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
        handleMouseDown, handleContainerMouseDown,
        totalSlots, // Expose derived value
        savedTemplates, saveTemplate, loadTemplate, deleteTemplate,
        recentColors, recentBgImages, recentTemplateImages
    };

    return (
        <PhotoBoothContext.Provider value={value}>
            {children}
        </PhotoBoothContext.Provider>
    );
};
