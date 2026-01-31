import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../hooks/useSupabase';
import { supabase } from '../services/supabase';
import { Heart, ShieldCheck, Zap, Copy, Check } from 'lucide-react';

const Partner = ({ onUpgrade }) => {
    const { user, logout } = useAuth(); // Assuming logout might be needed or just for context
    const { upsertData, loading } = useSupabase();
    const [inviteCodeInput, setInviteCodeInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [activeInvite, setActiveInvite] = useState(null);

    // Fetch active invite code on mount
    React.useEffect(() => {
        if (user && user.gender === 'female') {
            fetchActiveInvite();
        }
    }, [user]);

    const fetchActiveInvite = async () => {
        const { data, error } = await supabase
            .from('invites')
            .select('code')
            .eq('creator_id', user.uid)
            .eq('is_used', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (data) {
            setActiveInvite(data.code);
        }
    };

    const partnerId = user?.linked_partners?.[0]?.id; // Legacy support or first partner check

    const handleGenerateCode = async () => {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error } = await supabase
            .from('invites')
            .insert({
                code: newCode,
                creator_id: user.uid,
                is_used: false
            });

        if (!error) {
            setActiveInvite(newCode);
        } else {
            alert('代碼生成失敗: ' + error.message);
        }
    };

    const handleCopy = () => {
        if (!activeInvite) return;
        navigator.clipboard.writeText(activeInvite);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConnect = async () => {
        if (inviteCodeInput.length !== 6) {
            alert('請輸入6位代碼');
            return;
        }

        setStatusMessage('正在連線中...');

        // 1. Find the invite code in 'invites' table
        const { data: inviteData, error: inviteError } = await supabase
            .from('invites')
            .select('*')
            .eq('code', inviteCodeInput)
            .eq('is_used', false)
            .single();

        if (inviteError || !inviteData) {
            alert('代碼無效或已被使用');
            setStatusMessage(null);
            return;
        }

        if (inviteData.creator_id === user.uid) {
            alert('不能連結自己唷！');
            setStatusMessage(null);
            return;
        }

        // 2. Perform two-way link in 'partner_links'
        try {
            const { data: creatorProfile } = await supabase
                .from('profiles')
                .select('gender')
                .eq('id', inviteData.creator_id)
                .single();

            const isFemaleInviting = creatorProfile?.gender === 'female';

            const female_id = isFemaleInviting ? inviteData.creator_id : user.uid;
            const male_id = isFemaleInviting ? user.uid : inviteData.creator_id;

            // Update partner_links
            const { error: linkError } = await supabase
                .from('partner_links')
                .insert({ female_id, male_id });

            if (linkError) throw linkError;

            // Mark invite as used
            await supabase
                .from('invites')
                .update({ is_used: true })
                .eq('code', inviteCodeInput);

            alert('成功建立連結！');
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('連結失敗: ' + err.message);
        } finally {
            setStatusMessage(null);
        }
    };

    const handleDisconnect = async (partnerId) => {
        if (!window.confirm('確定要解除與該伴侶的連結嗎？')) return;

        try {
            const { error } = await supabase
                .from('partner_links')
                .delete()
                .or(`and(female_id.eq.${user.uid},male_id.eq.${partnerId}),and(female_id.eq.${partnerId},male_id.eq.${user.uid})`);

            if (error) throw error;

            alert('已解除連結。');
            window.location.reload();
        } catch (err) {
            alert('操作失敗: ' + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <section className="glass-card overflow-hidden relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Heart className="text-pink-500" fill="currentColor" /> 伴侶共享
                    </h2>
                    <p className="text-gray-400 text-sm">建立專屬的親密數據連結</p>
                </div>
            </section>

            {/* Invitation Section - Only for Female */}
            {user.gender === 'female' && (
                <div className="glass-card">
                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-[0.3em] text-center">您的邀約連結代碼</h3>

                    {activeInvite ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-6 rounded-3xl shadow-sm">
                                <span className="text-3xl font-black tracking-[0.2em] text-rose-500 drop-shadow-sm">{activeInvite}</span>
                                <button
                                    onClick={handleCopy}
                                    className="p-4 bg-white text-rose-500 rounded-2xl border border-rose-100/50 hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
                                >
                                    {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                </button>
                            </div>
                            <button
                                onClick={handleGenerateCode}
                                className="text-xs text-rose-300 font-bold hover:text-rose-400 transition-colors uppercase tracking-widest text-center"
                            >
                                🔄 生成新的邀請碼
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerateCode}
                            className="w-full py-8 border-2 border-dashed border-rose-100 rounded-3xl text-rose-400 font-bold hover:bg-rose-50/50 transition-all group"
                        >
                            <span className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                                ✨ 點擊生成一次性邀請碼
                            </span>
                        </button>
                    )}

                    <p className="text-[10px] text-gray-400 text-center mt-4 font-bold italic">分享代碼給伴侶，單次使用後失效</p>
                </div>
            )}

            {/* Partner Nickname Display - Only for Male */}
            {user.gender === 'male' && (
                <div className="glass-card">
                    <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[0.3em] text-center">您的守護對象</h3>
                    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-8 rounded-3xl shadow-sm">
                        <span className="text-4xl font-black text-blue-500 drop-shadow-sm">
                            {user.partner_nickname || '尚未連結'}
                        </span>
                    </div>
                </div>
            )}

            {/* Connection Status / Input */}
            <div className="glass-card bg-white/40">
                {user.linked_partners && user.linked_partners.length > 0 ? (
                    <div className="text-center py-6 space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Heart fill="#f43f5e" className="text-rose-500 animate-pulse" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">已建立雲端連結</h3>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto p-2">
                            {user.linked_partners.map((partner) => (
                                <div key={partner.id} className="flex flex-col items-center justify-center bg-white/50 border border-pink-50 p-4 rounded-2xl shadow-sm group">
                                    <p className="text-lg text-[#5B8FA8] font-bold">
                                        {user.gender === 'male' ? '守護 ' : '被 '}
                                        <span className="text-[#417690]">{partner.nickname}</span>
                                        {user.gender === 'male' ? ' 中' : ' 守護中'}
                                    </p>
                                    {user.gender === 'female' && (
                                        <button
                                            onClick={() => handleDisconnect(partner.id)}
                                            className="mt-2 text-[10px] font-bold text-gray-300 hover:text-rose-400 transition-colors uppercase tracking-[0.2em]"
                                        >
                                            解除連結
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {user.gender === 'male' && (
                            <p className="text-[10px] text-gray-300 font-bold italic">* 守護者無法主動解除連結，需由伴侶操作</p>
                        )}

                        {user.gender === 'female' && (
                            <div className="pt-4 border-t border-rose-50">
                                <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase tracking-widest">需要連結更多伴侶？</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={inviteCodeInput}
                                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                                        placeholder="輸入新代碼"
                                        className="flex-1 bg-white border border-rose-100 rounded-xl px-4 py-2 text-center text-lg font-black outline-none focus:border-rose-400 text-rose-500 placeholder:text-gray-100"
                                    />
                                    <button
                                        onClick={handleConnect}
                                        className="bg-rose-400 text-white px-4 rounded-xl font-bold active:scale-95 transition-all text-sm"
                                    >
                                        連線
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <h3 className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-[0.3em] text-center">輸入伴侶邀請碼</h3>
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                maxLength={6}
                                value={inviteCodeInput}
                                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                                placeholder="••••••"
                                className="flex-1 bg-white border border-rose-100 rounded-2xl px-4 py-5 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-rose-400 text-rose-500 placeholder:text-gray-100 shadow-sm"
                            />
                        </div>
                        <button
                            onClick={handleConnect}
                            disabled={loading || statusMessage || !inviteCodeInput}
                            className={`w-full py-5 rounded-2xl text-lg font-bold transition-all shadow-md ${inviteCodeInput.length === 6 ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-rose-200' : 'bg-gray-100 text-gray-300'}`}
                        >
                            {statusMessage || '建立連結'}
                        </button>
                    </>
                )}
            </div>

            {/* Unlock Premium */}
            <div className="glass-card border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-600/5">
                <h3 className="font-bold mb-6 text-gray-300">Premium 專業版功能</h3>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="bg-pink-500/10 p-3 rounded-2xl h-fit">
                            <ShieldCheck className="text-pink-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">即時健康同步</h4>
                            <p className="text-xs text-gray-500">伴侶可即時收到經期預測與生理動態，給予最貼心的守護。</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-purple-500/10 p-3 rounded-2xl h-fit">
                            <Zap className="text-purple-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">雲端跨端同步</h4>
                            <p className="text-xs text-gray-500">不限裝置，數據即時備份於加密雲端，永不丟失。</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-white border border-pink-100 rounded-2xl shadow-sm text-center">
                    <p className="text-sm text-pink-400 mb-6 font-semibold tracking-widest uppercase">支持我們持續開發，讓愛更簡單</p>
                    <button
                        onClick={onUpgrade}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        查看訂閱方案
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Partner;
