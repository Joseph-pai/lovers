import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, MessageSquare, Heart, Settings, LogOut, Edit } from 'lucide-react';

const Layout = ({ children, activePage, onNavigate, onShowManual }) => {
    const { logout, user } = useAuth();

    const navItems = [
        { id: 'home', icon: Home, label: '首頁' },
        { id: 'tracking', icon: Calendar, label: '健康' },
        { id: 'tracking-record', icon: Edit, label: '紀錄' },
        { id: 'heartTalk', icon: MessageSquare, label: '傾心' },
        { id: 'partner', icon: Heart, label: '伴侶' },
        { id: 'settings', icon: Settings, label: '設定' },
    ];

    return (
        <div className="min-h-screen bg-[#FFFBF9] text-gray-800 flex flex-col pb-24">
            {/* Top Header */}
            <header className="px-6 py-5 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-rose-50/50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-pink-500 tracking-tight">
                            Lover V2.0
                        </h1>
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] leading-none mt-1">Cloud Personal Assistant</span>
                    </div>
                    <button
                        onClick={onShowManual}
                        className="px-2 py-0.5 bg-rose-50 text-[10px] text-rose-400 font-black rounded-lg border border-rose-100/50 hover:bg-rose-100 transition-all active:scale-95"
                    >
                        使用說明
                    </button>
                </div>
                <button
                    onClick={logout}
                    className="p-3 bg-rose-50 text-rose-400 rounded-2xl hover:bg-rose-100 transition-all active:scale-90 shadow-sm border border-rose-100/50"
                    title="登出"
                >
                    <LogOut size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-2xl border border-rose-100/50 px-8 py-4 flex justify-between items-center z-50 max-w-xl mx-auto rounded-[2rem] shadow-[0_20px_50px_rgba(251,113,133,0.15)] animate-in slide-in-from-bottom duration-1000">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center gap-1.5 transition-all relative ${activePage === item.id || (item.id === 'tracking' && (activePage === 'tracking' || activePage === 'tracking-calendar')) ? 'text-rose-500' : 'text-gray-300 hover:text-rose-300'
                            }`}
                    >
                        {activePage === item.id && (
                            <div className="absolute -top-3 w-1 h-1 bg-rose-500 rounded-full"></div>
                        )}
                        <item.icon size={26} strokeWidth={activePage === item.id ? 2.5 : 2} className={activePage === item.id ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : ''} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${activePage === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
