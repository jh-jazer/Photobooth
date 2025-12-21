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
    const [maxPhotos, setMaxPhotos] = useState(4);
    const [timerDuration, setTimerDuration] = useState(3);
    const [countdown, setCountdown] = useState(null);
    const [retakeIndex, setRetakeIndex] = useState(null);

    // Design State
    const [selectedDesign, setSelectedDesign] = useState(STRIP_DESIGNS[5]); // Purple Haze - matches website theme
    const [bgColor, setBgColor] = useState('');
    const [bgImage, setBgImage] = useState(null);
    const [templateImage, setTemplateImage] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('none');

    // UI State
    const [showPreview, setShowPreview] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [isCameraMirrored, setIsCameraMirrored] = useState(true); // Default to mirrored for selfie mode

    // Layout State (Custom)
    const [layoutGap, setLayoutGap] = useState(13);
    const [layoutPaddingTop, setLayoutPaddingTop] = useState(14);
    const [layoutPaddingSide, setLayoutPaddingSide] = useState(15);
    const [layoutPaddingBottom, setLayoutPaddingBottom] = useState(90);
    const [photoRoundness, setPhotoRoundness] = useState(0);
    const [isTemplateLocked, setIsTemplateLocked] = useState(true);

    // Elements State (Text & Stickers)
    const [elements, setElements] = useState([]);
    const [selectedElementId, setSelectedElementId] = useState(null);

    // History State for Undo/Redo
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Custom Template Slots
    const [customSlots, setCustomSlots] = useState([
        { id: 1, x: 0, y: 0, w: 210, h: 125 },
        { id: 2, x: 0, y: 136, w: 210, h: 125 }, // 125 + (13-2) gap
        { id: 3, x: 0, y: 272, w: 210, h: 125 },
        { id: 4, x: 0, y: 408, w: 210, h: 125 }
    ]);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    const [stripHeight, setStripHeight] = useState(640);

    // Preview & Interaction State
    const [previewScale, setPreviewScale] = useState(0.85);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    // Donation Popup State
    const [isDonationPopupOpen, setIsDonationPopupOpen] = useState(false);
    const [donationStep, setDonationStep] = useState('prompt'); // 'prompt' | 'qr'

    // Layout Prompt State
    const [showLayoutPrompt, setShowLayoutPrompt] = useState(false);
    const [pendingTemplateImage, setPendingTemplateImage] = useState(null);
    const [pendingStripHeight, setPendingStripHeight] = useState(0);

    // --- REFS ---
    const webcamRef = useRef(null);
    const stripRef = useRef(null);
    const fileInputRef = useRef(null);
    const bgFileInputRef = useRef(null);
    const templateFileInputRef = useRef(null);
    const dragRef = useRef(null);
    const colorTimeoutRef = useRef(null);

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
    useEffect(() => { try { localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates)); } catch (e) { console.warn('Storage full'); } }, [savedTemplates]);
    useEffect(() => { try { localStorage.setItem('recentColors', JSON.stringify(recentColors)); } catch (e) { console.warn('Storage full'); } }, [recentColors]);
    useEffect(() => { try { localStorage.setItem('recentBgImages', JSON.stringify(recentBgImages)); } catch (e) { console.warn('Storage full'); } }, [recentBgImages]);
    useEffect(() => { try { localStorage.setItem('recentTemplateImages', JSON.stringify(recentTemplateImages)); } catch (e) { console.warn('Storage full'); } }, [recentTemplateImages]);

    // Gallery Persistence with Enhanced Error Handling
    const [galleryImages, setGalleryImages] = useState(() => {
        try {
            const stored = localStorage.getItem('photobooth_gallery');
            if (!stored) {
                console.log('[Gallery] No stored gallery found, starting fresh');
                return [];
            }
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) {
                console.error('[Gallery] Invalid gallery data format, resetting');
                localStorage.removeItem('photobooth_gallery');
                return [];
            }
            console.log(`[Gallery] Loaded ${parsed.length} images from storage`);
            return parsed;
        } catch (e) {
            console.error('[Gallery] Failed to load gallery from localStorage:', e);
            // Try to clear corrupted data
            try {
                localStorage.removeItem('photobooth_gallery');
            } catch (clearError) {
                console.error('[Gallery] Could not clear corrupted data:', clearError);
            }
            return [];
        }
    });

    useEffect(() => {
        try {
            const data = JSON.stringify(galleryImages);
            const sizeInMB = (data.length / (1024 * 1024)).toFixed(2);

            // Check storage quota (localStorage typically has 5-10MB limit)
            if (data.length > 4 * 1024 * 1024) { // 4MB warning threshold
                console.warn(`[Gallery] Storage size: ${sizeInMB}MB - approaching limit. Consider clearing old images.`);
            }

            localStorage.setItem('photobooth_gallery', data);
            console.log(`[Gallery] Saved ${galleryImages.length} images (${sizeInMB}MB) to storage`);
        } catch (e) {
            console.error('[Gallery] Failed to save gallery to localStorage:', e);

            // Check if it's a quota exceeded error
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.error('[Gallery] Storage quota exceeded! Gallery will only persist for this session.');
                alert('Storage limit reached! Your gallery is full. Please clear some images to save new ones permanently.');
            } else {
                console.error('[Gallery] Unknown storage error:', e.message);
            }
        }
    }, [galleryImages]);

    const addToGallery = useCallback((dataUrl) => {
        setGalleryImages(prev => [dataUrl, ...prev]);
    }, []);

    const clearGallery = () => {
        if (window.confirm('Are you sure you want to clear your gallery?')) {
            setGalleryImages([]);
        }
    };

    const saveTemplate = (name) => {
        const newTemplate = {
            id: Date.now(),
            name,
            config: {
                selectedDesign, bgColor, bgImage, templateImage,
                layoutGap, layoutPaddingTop, layoutPaddingSide, layoutPaddingBottom, photoRoundness,

                elements,
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

        if (c.elements !== undefined) setElements(c.elements);
        // Fallback for older saves
        if (c.textLayers !== undefined && !c.elements) setElements(c.textLayers.map(l => ({ ...l, type: 'text' })));

        if (c.customSlots !== undefined) setCustomSlots(c.customSlots);
        if (c.stripHeight !== undefined) setStripHeight(c.stripHeight);
    };

    const deleteTemplate = (id) => {
        setSavedTemplates(prev => prev.filter(t => t.id !== id));
    };

    const addTextElement = () => {
        const id1 = Date.now();
        const id2 = id1 + 1;

        const date = new Date();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        const dateStr = `${mm}.${dd}.${yyyy}`;

        // Position below last image holder
        let lastY = 0;
        if (templateImage) {
            lastY = customSlots.length > 0 ? Math.max(...customSlots.map(s => s.y + s.h)) : 50;
        } else {
            const contentWidth = 240 - (layoutPaddingSide * 2);
            const slotHeight = 125; // Fixed height for non-custom templates
            lastY = layoutPaddingTop + (maxPhotos * slotHeight) + ((maxPhotos - 1) * layoutGap);
        }

        const startY = lastY + 20;

        setElements(prev => [
            ...prev,
            {
                id: id1,
                type: 'text',
                text: 'POTOBOOTH',
                x: 40, y: startY,
                fontFamily: 'font-sans',
                fontSize: 24,
                fontWeight: 'bold',
                color: '#000000',
                tracking: 'tracking-widest',
                rotation: 0
            },
            {
                id: id2,
                type: 'text',
                text: dateStr,
                x: 45, y: startY + 30,
                fontFamily: 'font-sans',
                fontSize: 10,
                fontWeight: 'bold',
                color: '#000000',
                tracking: 'tracking-widest',
                rotation: 0
            }
        ]);
        setSelectedElementId(id1);
        saveHistory();
    };

    const addImageElement = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const id = Date.now();
            setElements(prev => [...prev, {
                id,
                type: 'image',
                src: e.target.result,
                x: 50, y: 50,
                width: 100, // Default width
                rotation: 0
            }]);
            setSelectedElementId(id);
        };
        reader.readAsDataURL(file);
    };

    const updateElement = (id, updates) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
        saveHistory();
    };

    const deleteElement = (id) => {
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
        saveHistory();
    };

    // History Management
    const saveHistory = useCallback(() => {
        const snapshot = {
            elements: JSON.parse(JSON.stringify(elements)),
            customSlots: JSON.parse(JSON.stringify(customSlots))
        };
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            return [...newHistory, snapshot].slice(-50); // Keep last 50 states
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, [elements, customSlots, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        const snapshot = history[newIndex];
        if (snapshot) {
            setElements(snapshot.elements);
            setCustomSlots(snapshot.customSlots);
            setHistoryIndex(newIndex);
        }
    }, [history, historyIndex]);

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

    const removeFromRecents = (type, value) => {
        if (type === 'color') {
            setRecentColors(prev => prev.filter(c => c !== value));
        } else if (type === 'bgImage') {
            setRecentBgImages(prev => prev.filter(i => i !== value));
        } else if (type === 'templateImage') {
            setRecentTemplateImages(prev => prev.filter(i => i !== value));
        }
    };

    const clearRecents = (type) => {
        if (type === 'templateImage') {
            setRecentTemplateImages([]);
        } else if (type === 'bgImage') {
            setRecentBgImages([]);
        } else if (type === 'color') {
            setRecentColors([]);
        }
    };

    // --- LOGIC ---

    const totalSlots = templateImage ? customSlots.length : maxPhotos;

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setCapturedImages(prev => {
                if (retakeIndex !== null) {
                    const newImages = [...prev];
                    newImages[retakeIndex] = imageSrc;
                    setIsCapturingLoop(false); // Stop immediately after retake
                    setRetakeIndex(null); // Reset retake index
                    return newImages;
                }
                const newImages = [...prev, imageSrc];
                if (newImages.length >= totalSlots) {
                    setIsCapturingLoop(false);
                }
                return newImages;
            });
        }
    }, [totalSlots, retakeIndex]);

    const startRetake = (index) => {
        setRetakeIndex(index);
        setShowPreview(false); // Optionally hide preview to show capture station
        setIsCapturingLoop(false); // Ensure we are not looping
        setCountdown(null);
    };

    // Capture Loop
    useEffect(() => {
        if (!isCapturingLoop) return;

        // Safety: Manual mode shouldn't loop
        if (timerDuration === 0) {
            setIsCapturingLoop(false);
            return;
        }

        if (capturedImages.length >= totalSlots && retakeIndex === null) {
            setIsCapturingLoop(false);
            return;
        }
        if (countdown === null) {
            setCountdown(timerDuration);
        }
    }, [isCapturingLoop, capturedImages.length, totalSlots, countdown, timerDuration, retakeIndex]);

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
    // Keyboard Movement (Slots & Elements)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            const hasSelection = (templateImage && selectedSlotIndex !== null) || selectedElementId !== null;
            if (!hasSelection) return;

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

            // Move Slot
            if (templateImage && selectedSlotIndex !== null) {
                setCustomSlots(prev => prev.map((slot, i) => {
                    if (i !== selectedSlotIndex) return slot;
                    return { ...slot, x: slot.x + deltaX, y: slot.y + deltaY };
                }));
            }

            // Move Element
            if (selectedElementId !== null) {
                setElements(prev => prev.map(el => {
                    if (el.id !== selectedElementId) return el;
                    return { ...el, x: el.x + deltaX, y: el.y + deltaY };
                }));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [templateImage, selectedSlotIndex, selectedElementId]);

    // Ctrl+Z Undo Handler
    useEffect(() => {
        const handleUndo = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            }
        };
        window.addEventListener('keydown', handleUndo);
        return () => window.removeEventListener('keydown', handleUndo);
    }, [undo]);

    // Delete/Backspace Handler for Elements
    useEffect(() => {
        const handleDelete = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
            if (!selectedElementId) return;

            if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                deleteElement(selectedElementId);
            }
        };
        window.addEventListener('keydown', handleDelete);
        return () => window.removeEventListener('keydown', handleDelete);
    }, [selectedElementId]);

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

            // Create image to get dimensions and update layout
            const img = new Image();
            img.onload = () => {
                // Calculate height based on fixed 240px width to maintain aspect ratio
                const aspect = img.height / img.width;
                const newHeight = Math.round(240 * aspect);

                setPendingStripHeight(newHeight);
                setPendingTemplateImage(result);
                setShowLayoutPrompt(true);
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const confirmLayout = (numFrames) => {
        setMaxPhotos(numFrames);
        setStripHeight(pendingStripHeight);
        setTemplateImage(pendingTemplateImage);
        addToRecents('templateImage', pendingTemplateImage);
        setLayoutPaddingTop(14);

        // Generate N slots centered
        const newSlots = Array.from({ length: numFrames }, (_, i) => ({
            id: Date.now() + i,
            x: 0, // Centered (considering padding logic)
            y: 0 + (i * 136), // Start at 0, 125h + (13-2) gap
            w: 210,
            h: 125
        }));
        setCustomSlots(newSlots);

        // Remove default text elements (POTOBOOTH and date) when using custom template
        setElements(prev => prev.filter(el => {
            // Remove POTOBOOTH text
            if (el.type === 'text' && el.text === 'POTOBOOTH') {
                return false;
            }
            // Remove date text (check if it looks like a date pattern)
            if (el.type === 'text' && /^\d{2}\.\d{2}\.\d{4}$/.test(el.text)) {
                return false;
            }
            // Keep other elements (user-added stickers, custom text, etc.)
            return true;
        }));

        // Reset Pending
        setPendingTemplateImage(null);
        setPendingStripHeight(0);
        setShowLayoutPrompt(false);
    };
    const retake = () => {
        setCapturedImages([]);
        setIsCapturingLoop(false);
        setRetakeIndex(null);
        setCountdown(null);
    };

    const downloadStrip = useCallback(async (format = 'png') => {
        if (stripRef.current === null) return;
        const originalTransform = stripRef.current.style.transform;
        stripRef.current.style.transform = 'scale(1)';

        try {
            if (format === 'pdf') {
                const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
                // Calculate dimensions
                const imgWidthPx = stripRef.current.offsetWidth;
                const imgHeightPx = stripRef.current.offsetHeight;

                // Create PDF (A4 Landscape to fit 3 side by side)
                const pdf = new jsPDF({
                    orientation: 'l',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                // Target: 3 strips side by side
                // A4 Landscape: 297mm x 210mm
                // Gap between strips
                const gap = 10;
                const totalGaps = 2 * gap; // 2 gaps for 3 items

                // Max width per strip to fit 3
                const maxStripWidth = (pageWidth - 40) / 3; // 20mm margin each side

                // Calculate scale to fit height if needed, usually width is the constraint for 3 side-by-side
                const ratio = imgWidthPx / imgHeightPx;
                let finalWidth = maxStripWidth;
                let finalHeight = finalWidth / ratio;

                // Check if height fits
                if (finalHeight > (pageHeight - 20)) {
                    finalHeight = pageHeight - 20;
                    finalWidth = finalHeight * ratio;
                }

                // Center vertically
                const y = (pageHeight - finalHeight) / 2;

                // Calculate starting X to center the group of 3
                const totalGroupWidth = (finalWidth * 3) + (gap * 2);
                const startX = (pageWidth - totalGroupWidth) / 2;

                pdf.addImage(dataUrl, 'PNG', startX, y, finalWidth, finalHeight);
                pdf.addImage(dataUrl, 'PNG', startX + finalWidth + gap, y, finalWidth, finalHeight);
                pdf.addImage(dataUrl, 'PNG', startX + (finalWidth * 2) + (gap * 2), y, finalWidth, finalHeight);

                pdf.save('photobooth-strips.pdf');
            } else {
                let dataUrl;
                let filename = `photobooth-strip.${format}`;

                if (format === 'jpg' || format === 'jpeg') {
                    dataUrl = await toJpeg(stripRef.current, { cacheBust: true, pixelRatio: 3, quality: 0.95 });
                } else {
                    dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
                }

                // Auto-save to gallery
                addToGallery(dataUrl);

                // Mobile-compatible download
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                if (isMobile) {
                    // For mobile: open in new window so user can long-press to save
                    const newWindow = window.open();
                    if (newWindow) {
                        newWindow.document.write(`
                            <html>
                                <head>
                                    <title>Save Image</title>
                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                    <style>
                                        body { margin: 0; padding: 20px; background: #000; text-align: center; }
                                        img { max-width: 100%; height: auto; }
                                        p { color: #fff; font-family: sans-serif; margin-top: 20px; }
                                    </style>
                                </head>
                                <body>
                                    <img src="${dataUrl}" alt="Photo Strip">
                                    <p>Long press the image above and select "Save Image" or "Download Image"</p>
                                </body>
                            </html>
                        `);
                        newWindow.document.close();
                    }
                } else {
                    // For desktop: use standard download
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
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
    }, [addToGallery, setIsDonationPopupOpen, setDonationStep]);

    const printStrip = useCallback(async () => {
        if (stripRef.current === null) return;
        const originalTransform = stripRef.current.style.transform;
        stripRef.current.style.transform = 'scale(1)';
        try {
            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 3 });
            stripRef.current.style.transform = originalTransform;

            // Auto-save to gallery
            addToGallery(dataUrl);

            // Create a hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);

            const content = `
                <html>
                    <head>
                        <title>Print Photo Strip</title>
                        <style>
                            @page { size: landscape; margin: 10mm; }
                            body { 
                                margin: 0; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                height: 100vh; 
                                gap: 20px;
                            }
                            img { 
                                height: 90vh; 
                                width: auto; 
                                object-fit: contain;
                                max-width: 30%; /* Ensure 3 fit */
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${dataUrl}" />
                        <img src="${dataUrl}" />
                        <img src="${dataUrl}" />
                    </body>
                </html>
            `;

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(content);
            doc.close();

            // Wait for image to load before printing
            iframe.onload = () => {
                // Small delay to ensure render
                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    // Cleanup after print dialog usage (approximate) or leave it
                    // Ideally we remove it, but user might cancel. 
                    // Let's remove it after a delay
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 1000);
                }, 500);
            };

            // Fallback if onload doesn't fire immediately (sometimes with dataURL)
            const img = doc.querySelector('img');
            if (img.complete) {
                iframe.onload();
            }

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

        if (type === 'element') {
            setElements(prev => prev.map(el => {
                if (el.id !== id) return el;
                return {
                    ...el,
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

    const handleElementMouseDown = (e, id) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        setSelectedElementId(id);
        const element = elements.find(el => el.id === id);
        if (!element) return;

        dragRef.current = {
            type: 'element',
            id,
            startX: e.clientX,
            startY: e.clientY,
            startLayer: { ...element }
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
        maxPhotos, setMaxPhotos: (num) => {
            setMaxPhotos(num);
            setTemplateImage(null); // Explicitly exit custom template mode
        },
        timerDuration, setTimerDuration,
        countdown, setCountdown,
        retakeIndex, setRetakeIndex,
        startRetake,
        selectedDesign, setSelectedDesign,
        bgColor, setBgColor: (color) => {
            setBgColor(color);
            if (dragRef.current) return; // Don't save if dragging (pan/resize) - though color picker doesn't use dragRef
            // Debounce recents
            if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current);
            colorTimeoutRef.current = setTimeout(() => {
                addToRecents('color', color);
            }, 1000);
        },
        bgImage, setBgImage,
        templateImage, setTemplateImage,
        showPreview, setShowPreview,
        showConfig, setShowConfig,
        isCameraMirrored, setIsCameraMirrored,
        layoutGap, setLayoutGap,
        layoutPaddingTop, setLayoutPaddingTop,
        layoutPaddingSide, setLayoutPaddingSide,
        layoutPaddingBottom, setLayoutPaddingBottom,
        photoRoundness, setPhotoRoundness,
        isTemplateLocked, setIsTemplateLocked,
        selectedFilter, setSelectedFilter,
        textLayers: elements, setTextLayers: setElements, // Backward compat alias if needed, but better to use new names
        elements, setElements,
        selectedElementId, setSelectedElementId,
        addTextElement, addImageElement, updateElement, deleteElement,
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
        handleMouseDown, handleElementMouseDown, handleContainerMouseDown,
        showLayoutPrompt, setShowLayoutPrompt, confirmLayout, pendingTemplateImage,
        totalSlots, // Expose derived value

        // Saved & Recents
        savedTemplates, saveTemplate, loadTemplate, deleteTemplate,
        recentColors, recentBgImages, recentTemplateImages, addToRecents, removeFromRecents, clearRecents,

        // Donation Popup
        isDonationPopupOpen, setIsDonationPopupOpen,
        donationStep, setDonationStep,

        // Gallery
        galleryImages, addToGallery, clearGallery,

        // Undo/Redo
        undo,
        historyIndex,
        canUndo: historyIndex > 0
    };

    return (
        <PhotoBoothContext.Provider value={value}>
            {children}
        </PhotoBoothContext.Provider>
    );
};
