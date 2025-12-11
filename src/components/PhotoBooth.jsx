import React from 'react';
import { PhotoBoothProvider } from './photobooth/PhotoBoothContext';
import LivePreview from './photobooth/LivePreview';
import CaptureStation from './photobooth/CaptureStation';
import ConfigurationPanel from './photobooth/ConfigurationPanel';

const PhotoBooth = () => {
    return (
        <PhotoBoothProvider>
            <div className="h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-zinc-950 text-white overflow-hidden font-sans selection:bg-rose-500/30 overflow-y-auto lg:overflow-y-hidden">
                <LivePreview />
                <CaptureStation />
                <ConfigurationPanel />
            </div>
        </PhotoBoothProvider>
    );
};

export default PhotoBooth;
