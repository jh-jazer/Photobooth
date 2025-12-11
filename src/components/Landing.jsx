import React from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing({ onStart }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-full"></div>
                    <div className="relative bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
                        <Camera size={64} className="text-blue-400" />
                    </div>
                </div>
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 tracking-tight"
            >
                PhotoBooth Pro
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-slate-400 mb-12 max-w-md font-light leading-relaxed"
            >
                Capture your moments in style. Premium effects, instant layouts, and more.
            </motion.p>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="group relative px-10 py-5 bg-blue-600 rounded-full text-xl font-bold shadow-lg overflow-hidden transition-all hover:shadow-blue-500/50"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-100 group-hover:opacity-110 transition-opacity"></div>
                <span className="relative flex items-center gap-3">
                    Start Experience <Sparkles size={24} />
                </span>
            </motion.button>
        </div>
    );
}
