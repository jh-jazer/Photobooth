import React from 'react';
import {
    LayoutDashboard,
    Image as ImageIcon,
    HardDrive,
    Clock,
    TrendingUp,
    Users,
    Calendar,
    ArrowLeft,
    Activity
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, trendUp }) => (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-rose-500/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>

        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-zinc-800/80 rounded-xl text-rose-500 group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                    {trend}
                </div>
            )}
        </div>

        <div className="space-y-1 relative z-10">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{label}</h3>
            <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        </div>
    </div>
);

const SessionCard = ({ id, time, photos, status }) => (
    <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/50 transition-colors group">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 font-bold text-xs group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                #{id}
            </div>
            <div>
                <div className="text-sm font-bold text-zinc-200">Session {id}</div>
                <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <Clock size={10} /> {time}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
                {[...Array(photos)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800"></div>
                ))}
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                {status}
            </div>
        </div>
    </div>
);

const Dashboard = ({ onBack }) => {
    return (
        <div className="min-h-screen w-full bg-transparent text-white p-6 lg:p-12 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/20 text-rose-500 rounded-lg">
                                <LayoutDashboard size={24} />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter text-white">DASHBOARD</h1>
                        </div>
                        <p className="text-zinc-400 font-medium">Overview of your Potobooth performance</p>
                    </div>

                    <button
                        onClick={onBack}
                        className="group flex items-center gap-3 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)]"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Booth</span>
                    </button>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={ImageIcon}
                        label="Total Captures"
                        value="1,284"
                        trend="+12%"
                        trendUp={true}
                    />
                    <StatCard
                        icon={Users}
                        label="Total Sessions"
                        value="342"
                        trend="+5%"
                        trendUp={true}
                    />
                    <StatCard
                        icon={HardDrive}
                        label="Storage Used"
                        value="45%"
                        trend="2.4GB Free"
                        trendUp={true}
                    />
                    <StatCard
                        icon={Activity}
                        label="Uptime"
                        value="99.9%"
                        trend="Stable"
                        trendUp={true}
                    />
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
                            <button className="text-xs font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors">View All</button>
                        </div>

                        <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-900 rounded-3xl p-6 space-y-4">
                            <SessionCard id="4092" time="2 mins ago" photos={3} status="Completed" />
                            <SessionCard id="4091" time="15 mins ago" photos={4} status="Completed" />
                            <SessionCard id="4090" time="42 mins ago" photos={2} status="Printing" />
                            <SessionCard id="4089" time="1 hour ago" photos={4} status="Completed" />
                        </div>
                    </div>

                    {/* Right: Quick Actions / Status */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold tracking-tight">System Status</h2>
                        <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-900 rounded-3xl p-6 space-y-6">

                            {/* Health Checks */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-zinc-400">Camera</span>
                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        ONLINE
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-zinc-400">Printer</span>
                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        READY
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-zinc-400">Network</span>
                                    <span className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                        SLOW
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-900"></div>

                            {/* Storage Viz */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="text-zinc-500">Local Storage</span>
                                    <span className="text-white">45%</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-rose-500 to-purple-500 w-[45%] rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Promo / Upgrade */}
                        <div className="bg-gradient-to-br from-rose-600 to-purple-700 rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-white mb-2">PRO FEATURES</h3>
                                <p className="text-sm text-white/80 mb-4 font-medium">Upgrade to export 4K video boomerangs and cloud sync.</p>
                                <button className="bg-white text-rose-600 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors">
                                    Upgrade Now
                                </button>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
