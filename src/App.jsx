import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import { HelpCircle, X, Heart, Link as LinkIcon, Users, Crown, Mail, Edit2, Check } from 'lucide-react';
import Tracking from './pages/Tracking';
import HeartTalk from './pages/HeartTalk';
import AIConsultation from './pages/AIConsultation';
import Partner from './pages/Partner';
import Subscription from './pages/Subscription';

function App() {
    const { user, reloadUser, logout, initializeProfile, updateNickname } = useAuth();
    const [activePage, setActivePage] = useState('home');
    const [selectedRecordDate, setSelectedRecordDate] = useState(null);
    const [isReloading, setIsReloading] = useState(false);
    const [showUserManual, setShowUserManual] = useState(false);

    // Nickname Edit State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    const handleNavigate = (page) => {
        if (page !== 'record') {
            setSelectedRecordDate(null);
        }
        setActivePage(page);
    };

    if (!user) {
        return <AuthPage />;
    }

    // Email Verification Check
    if (!user.emailVerified) {
        const handleCheckVerification = async () => {
            setIsReloading(true);
            try {
                await reloadUser();
            } finally {
                setIsReloading(false);
            }
        };

        const handleResendEmail = async () => {
            const { sendEmailVerification } = await import('firebase/auth');
            const { auth } = await import('./services/firebase');
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                alert('驗證郵件已重新發送，請檢查您的信箱。');
            }
        };

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#FFFBFA] via-[#FFF9E6] to-[#E6F3FF]">
                <div className="w-full max-w-md glass-card text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                        <Mail size={48} />
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-xl">⚠️</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-gray-800">尚未完成郵件驗證</h2>
                        <p className="text-gray-500 text-sm leading-relaxed px-4">
                            為了保護您的帳戶安全，請先前往您的信箱驗證：<br />
                            <span className="font-bold text-rose-400 break-all">{user.email}</span>
                        </p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <button
                            onClick={handleCheckVerification}
                            disabled={isReloading}
                            className={`btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 ${isReloading ? 'opacity-70 scale-95' : ''}`}
                        >
                            {isReloading ? '檢查中...' : '我已經驗證過了'}
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={handleResendEmail}
                                className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-rose-400 transition-colors"
                            >
                                點此重新發送郵件
                            </button>
                            <div className="w-[1px] bg-gray-100 h-8 self-center"></div>
                            <button
                                onClick={logout}
                                className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                切換帳號 / 登出
                            </button>
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-300 font-medium">
                        * 如果沒看到郵件，請檢查垃圾信箱或稍候再試。
                    </p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activePage) {
            case 'home':
                return (
                    <div className="space-y-6 text-text-main">
                        <section className="glass-card overflow-hidden relative border-none bg-gradient-to-br from-rose-50/50 to-orange-50/50">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-400/10 blur-3xl rounded-full"></div>
                            <div className="relative z-10">
                                <h2 className={`text-2xl font-bold mb-2 ${user.gender === 'male' ? 'text-[#5B7083]' : 'bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-pink-500'}`}>
                                    {user.nickname ? `${user.gender === 'male' ? '你好' : '妳好'}，${user.nickname}` : (user.gender === 'male' ? '你好，守護者' : '妳好，親愛的')}
                                </h2>
                                <p className="text-gray-500 text-sm font-medium">您的私人雲端健康伴侶，今天感覺如何？</p>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => setActivePage('tracking-calendar')}
                                className="glass-card flex flex-col items-center justify-center gap-4 p-8 border-rose-100 hover:border-rose-300 hover:bg-rose-50/50 transition-all group aspect-square shadow-sm"
                            >
                                <div className="text-9xl group-hover:scale-110 transition-transform">📅</div>
                                <div className="text-center">
                                    <span className="font-bold text-gray-700 block text-lg">健康月曆</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cycle View</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActivePage('tracking-record')}
                                className="glass-card flex flex-col items-center justify-center gap-4 p-8 border-amber-100 hover:border-amber-300 hover:bg-amber-50/50 transition-all group aspect-square shadow-sm"
                            >
                                <div className="text-9xl group-hover:scale-110 transition-transform">📝</div>
                                <div className="text-center">
                                    <span className="font-bold text-gray-700 block text-lg">身心紀錄</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Daily Note</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActivePage('heartTalk')}
                                className="glass-card flex flex-col items-center justify-center gap-4 p-8 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all group aspect-square shadow-sm"
                            >
                                <div className="group-hover:scale-110 transition-transform flex items-center justify-center w-32 h-32">
                                    <img src="/heart_icon.png" alt="Heart Talk" className="w-full h-full object-contain drop-shadow-sm" />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-gray-700 block text-lg">傾心吐意</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connect</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActivePage('settings')}
                                className="glass-card flex flex-col items-center justify-center gap-4 p-8 border-sky-100 hover:border-sky-300 hover:bg-sky-50/50 transition-all group aspect-square shadow-sm"
                            >
                                <div className="group-hover:scale-110 transition-transform w-32 h-32 rounded-full overflow-hidden border-4 border-sky-200 shadow-md">
                                    <img src="/judy_original.jpg" alt="Account" className="w-full h-full object-cover object-top" />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-gray-700 block text-lg">帳戶資訊</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Account</span>
                                </div>
                            </button>
                        </div>

                        <section className="glass-card bg-white/40 border-pink-50">
                            <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[0.3em] text-center">Encryption & Cloud Sync</h3>
                            <p className="text-xs text-gray-400 text-center py-2 italic font-medium">“喜樂的心乃是良藥，憂傷的靈使骨枯乾”～箴言17:22</p>
                        </section>
                    </div>
                );
            case 'tracking-calendar':
            case 'tracking-record':
            case 'tracking':
                return <Tracking
                    mode={activePage === 'tracking-record' ? 'record' : 'calendar'}
                    selectedDate={selectedRecordDate}
                    onNavigate={setActivePage}
                    onDateSelect={(date) => {
                        setSelectedRecordDate(date);
                        setActivePage('record');
                    }}
                />;
            case 'record':
                return <Tracking
                    mode="all"
                    selectedDate={selectedRecordDate}
                    onNavigate={setActivePage}
                    scrollToForm={true}
                />;
            case 'ai-consultation':
                return <AIConsultation />;
            case 'heartTalk':
                return <HeartTalk />;
            case 'partner':
                return <Partner onUpgrade={() => setActivePage('subscription')} />;
            case 'subscription':
                return <Subscription onBack={() => setActivePage('home')} />;
            case 'settings':
                const isProfileMissing = !user.nickname;
                return (
                    <div className="space-y-4">
                        {isProfileMissing && (
                            <div className="glass-card bg-amber-50 border-amber-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-amber-100 text-amber-500 rounded-lg">
                                        <Mail size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-amber-800 uppercase tracking-wider">偵測到帳戶尚未完成初始化</h3>
                                </div>
                                <p className="text-xs text-amber-700 font-medium mb-4 px-1 leading-relaxed">
                                    我們在資料庫中找不到您的個人檔案（可能是 Google 首次登入或網路報錯導致）。請點擊下方按鈕進行手動修復：
                                </p>
                                <button
                                    onClick={async (e) => {
                                        const btn = e.currentTarget;
                                        btn.disabled = true;
                                        const originalText = btn.innerText;
                                        btn.innerText = '修復中...';
                                        try {
                                            await initializeProfile(user.displayName);
                                            alert('個人資料已成功初始化！');
                                        } catch (err) {
                                            console.error(err);
                                            alert(`初始化失敗: ${err.message}`);
                                        } finally {
                                            btn.disabled = false;
                                            btn.innerText = originalText;
                                        }
                                    }}
                                    className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-200/50 hover:bg-amber-600 active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    立即修復並初始化資料表
                                </button>
                            </div>
                        )}
                        <div className="glass-card">
                            <h2 className="text-xl font-bold mb-6 text-gray-700">帳戶資訊</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-pink-50">
                                    <span className="text-gray-400 text-xs font-bold uppercase">電子郵件 / Email</span>
                                    <span className="text-rose-400 font-medium text-xs font-mono">{user.email}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-pink-50">
                                    <span className="text-gray-400 text-xs font-bold uppercase">暱稱 / Nickname</span>
                                    {isEditingName ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editNameValue}
                                                onChange={(e) => setEditNameValue(e.target.value)}
                                                className="w-32 px-2 py-1 text-xs border border-rose-200 rounded-lg outline-none focus:border-rose-400 bg-white"
                                                autoFocus
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (!editNameValue.trim()) return;
                                                    try {
                                                        await updateNickname(editNameValue);
                                                        setIsEditingName(false);
                                                    } catch (error) {
                                                        alert('更新失敗: ' + error.message);
                                                    }
                                                }}
                                                className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={() => setIsEditingName(false)}
                                                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600 text-xs font-medium">{user.nickname || '未設定 / Not set'}</span>
                                            <button
                                                onClick={() => {
                                                    setEditNameValue(user.nickname || '');
                                                    setIsEditingName(true);
                                                }}
                                                className="text-gray-400 hover:text-rose-400 transition-colors"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-pink-50">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-400 text-xs font-bold uppercase">訂閱狀態 / Subscription</span>
                                        {!user.is_subscribed && (
                                            <button
                                                onClick={() => setActivePage('subscription')}
                                                className="text-[10px] text-rose-400 font-bold underline text-left"
                                            >
                                                立即升級為 Premium
                                            </button>
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.is_subscribed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {user.is_subscribed ? '已訂閱 Premium' : '免費試用版'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-pink-50">
                                    <span className="text-gray-400 text-xs font-bold uppercase">試用次數 / Usage</span>
                                    <span className="text-gray-600 text-xs font-medium">{user.usage_count || 0} / 100</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-pink-50">
                                    <span className="text-gray-400 text-xs font-bold uppercase">性別角色 / Role</span>
                                    <span className="text-gray-600 text-xs font-medium uppercase">{user.gender === 'male' ? '守護者 (男) / Male' : (user.gender === 'female' ? '親愛的 (女) / Female' : '未設定 / Unknown')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Status */}
                        {!user.is_subscribed && (
                            <section
                                onClick={() => setActivePage('subscription')}
                                className="glass-card p-4 flex items-center justify-between cursor-pointer border-rose-100 bg-rose-50/30 hover:bg-rose-50/50 transition-all active:scale-95 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 text-rose-500 rounded-xl">
                                        <Crown size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-rose-500">
                                            解鎖完整守護次數
                                        </p>
                                        <p className="text-[10px] text-rose-300 font-medium">
                                            {100 - (user.usage_count || 0)} 次剩餘 | 點擊升級為永久 Premium
                                        </p>
                                    </div>
                                </div>
                                <div className="text-rose-200 text-xs font-black">Upgrade →</div>
                            </section>
                        )}

                        {/* Partner Status */}
                        <section
                            onClick={() => setActivePage('partner')}
                            className={`glass-card p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-95 border-none shadow-sm ${user.partner_id
                                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                                : 'bg-white border-dashed border-2 border-rose-200 text-rose-400'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${user.partner_id ? 'bg-white/20' : 'bg-rose-50'}`}>
                                    {user.partner_id ? <Heart size={20} fill="currentColor" /> : <LinkIcon size={20} />}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${user.partner_id ? 'text-white' : 'text-rose-500'}`}>
                                        {user.partner_id ? '已建立愛之連結' : '尚未連結伴侣'}
                                    </p>
                                    <p className={`text-[10px] ${user.partner_id ? 'text-rose-50' : 'text-rose-300'} font-medium`}>
                                        {user.partner_id ? '您的健康數據已即時同步' : '點擊此處生成專屬邀約代碼'}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-xs font-black ${user.partner_id ? 'text-white/50' : 'text-rose-200'}`}>
                                {user.partner_id ? <Users size={16} /> : 'GO →'}
                            </div>
                        </section>

                        <div className="glass-card">
                            <h2 className="text-xl font-bold mb-4 text-gray-700">版本</h2>
                            <p className="text-xs text-gray-500">Lover Cloud V2.0.2 (Happy Edition)</p>
                        </div>
                    </div>
                );
            default:
                return <div>Page coming soon...</div>;
        }
    };

    return (
        <Layout activePage={activePage} onNavigate={setActivePage} onShowManual={() => setShowUserManual(true)}>
            {renderContent()}

            {/* User Manual Toggle Button */}
            <button
                onClick={() => setShowUserManual(true)}
                className="fixed bottom-24 right-6 w-12 h-12 bg-white/90 backdrop-blur-md border border-rose-100 rounded-full shadow-lg flex items-center justify-center text-rose-400 hover:scale-110 active:scale-95 transition-all z-[90]"
                title="使用手冊"
            >
                <HelpCircle size={24} />
            </button>

            {/* User Manual Modal */}
            {showUserManual && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card max-w-lg w-full max-h-[80vh] overflow-y-auto relative animate-in zoom-in duration-300">
                        <button
                            onClick={() => setShowUserManual(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="space-y-6">
                            <div className="text-center pb-4 border-b border-rose-50">
                                <h2 className="text-2xl font-bold text-gray-800">🌸 「來了嗎」使用手冊</h2>
                                <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-black">User Manual & Features</p>
                            </div>

                            <div className="space-y-4">
                                <section className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/30 space-y-3">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm">👩</div>
                                        <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">我大姨媽來了。</div>
                                    </div>
                                    <div className="flex gap-3 flex-row-reverse">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs shadow-sm">👦</div>
                                        <div className="bg-blue-50/50 px-3 py-2 rounded-2xl rounded-tr-none border border-blue-100/30 text-sm text-gray-700">是嗎，找個時間請她吃飯。</div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm">👩</div>
                                        <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">XXX。</div>
                                    </div>
                                    <div className="h-[1px] bg-rose-100/30 my-2"></div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm">👩</div>
                                        <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">我MC來了肚子好疼啊！</div>
                                    </div>
                                    <div className="flex gap-3 flex-row-reverse">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs shadow-sm">👦</div>
                                        <div className="bg-blue-50/50 px-3 py-2 rounded-2xl rounded-tr-none border border-blue-100/30 text-sm text-gray-700">那多喝溫水可能就不會那麼疼了。</div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm">👩</div>
                                        <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">喝喝喝，喝死你...。</div>
                                    </div>
                                    <div className="flex gap-3 flex-row-reverse">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs shadow-sm">👦</div>
                                        <div className="bg-blue-50/50 px-3 py-2 rounded-2xl rounded-tr-none border border-blue-100/30 text-sm text-gray-700">？？？</div>
                                    </div>
                                </section>

                                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/30">
                                    <p className="text-sm text-amber-900 leading-relaxed font-medium">
                                        💡 <span className="font-bold">為什麼需要這個 APP？</span><br />
                                        男生常常因為不知道而踩坑，怎麼死的都不知道。女生把自己的狀態讓對方知道，可以得到期待的關心。
                                    </p>
                                </div>
                            </div>

                            <section className="space-y-4">
                                <h3 className="font-bold text-rose-500 flex items-center gap-2">✨ 四大特色功能</h3>
                                <div className="space-y-3">
                                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                                        <p className="font-bold text-sm text-gray-700">1. 精準週期追蹤 (Cycle Tracking)</p>
                                        <p className="text-xs text-gray-500">自動預測生理期與排卵期，提供貼心的健康提醒。</p>
                                    </div>
                                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
                                        <p className="font-bold text-sm text-gray-700">2. 細膩情緒紀錄 (Emotion Log)</p>
                                        <p className="text-xs text-gray-500">每日一鍵記錄心情與生理症狀，圖像化您的心路歷程。</p>
                                    </div>
                                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100/50">
                                        <p className="font-bold text-sm text-gray-700">3. 伴侶分權共享 (Partner Sharing)</p>
                                        <p className="text-xs text-gray-500">女生管理數據，男生接收提醒，學習如何在特殊日子給予照顧。</p>
                                    </div>
                                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                        <p className="font-bold text-sm text-gray-700">4. AI 雲端諮詢員 (AI Consultation)</p>
                                        <p className="text-xs text-gray-500">專業狐狸助理 24 小時在線，為健康或感情提供溫和建議。</p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="font-bold text-rose-500 flex items-center gap-2">🚀 快速上手指南</h3>
                                <ul className="text-sm text-gray-600 space-y-3 px-2">
                                    <li className="flex gap-2">
                                        <span className="text-rose-400">●</span>
                                        <span><span className="font-bold">開始記錄</span>：點擊首頁「身心紀錄」即可填寫每日狀態。</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-rose-400">●</span>
                                        <span><span className="font-bold">查看預測</span>：在月曆中可看到標註為小圓點的預測日期。</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-rose-400">●</span>
                                        <span><span className="font-bold">尋求建議</span>：進入「AI 雲端諮詢」與狐狸助理互動。</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-rose-400">●</span>
                                        <span><span className="font-bold">設定週期</span>：在月曆下方可隨時調整平均天數與最近經期。</span>
                                    </li>
                                </ul>
                            </section>

                            <button
                                onClick={() => setShowUserManual(false)}
                                className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-lg"
                            >
                                開始使用
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default App;
