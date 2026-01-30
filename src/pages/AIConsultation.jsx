import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../hooks/useSupabase';
import { Send, Sparkles, History, Bot, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';

const AIConsultation = () => {
    const { user } = useAuth();
    const { loading: supabaseLoading } = useSupabase();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [aiApiKey, setAiApiKey] = useState(localStorage.getItem('lover_ai_api_key') || '');
    const [showSettings, setShowSettings] = useState(!localStorage.getItem('lover_ai_api_key'));
    const scrollRef = useRef();

    useEffect(() => {
        loadHistory();
    }, [user]);

    // Removed auto-scroll useEffect

    const loadHistory = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('ai_consultations')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false }); // Newest first

        if (data) {
            // Keep Q then A order for reading flow, but pairs are ordered by date desc
            const history = data.flatMap(item => [
                { role: 'user', content: item.question, created_at: item.created_at, id: item.id },
                { role: 'assistant', content: item.answer, created_at: item.created_at, id: item.id }
            ]);
            setMessages(history);
        }
    };

    const handleSaveSettings = () => {
        localStorage.setItem('lover_ai_api_key', aiApiKey);
        setShowSettings(false);
        alert('API Key 已儲存');
    };

    const handleDelete = async (id) => {
        if (!id) return;
        if (!confirm('確定要刪除這組對話紀錄嗎？(將同時刪除提問與回答)')) return;

        try {
            const { error } = await supabase
                .from('ai_consultations')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error('Deletion failed:', error);
            alert('刪除失敗，請稍後再試');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (!aiApiKey) {
            setShowSettings(true);
            return;
        }

        // Optimistic update: Prepend temporary message
        const userMsg = { role: 'user', content: input, created_at: new Date().toISOString(), isTemp: true };
        setMessages(prev => [userMsg, ...prev]);
        setInput('');
        setIsTyping(true);

        try {
            // Simple prompt builder
            const prompt = `你是一個貼心、溫暖且富有同理心的情感與月經健康助理。
            用戶性別: ${user.gender === 'male' ? '男生' : '女生'}
            用戶暱稱: ${user.nickname || '親愛的'}
            用戶問題: ${input}
            請給出簡短、溫馨（150字以內）且具備建設性的建議。`;

            // Call DeepSeek API (Standard OpenAI structure)
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aiApiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: '你是一個專業的親密關係與健康助理。' },
                        { role: 'user', content: prompt }
                    ]
                })
            });

            const data = await response.json();
            const aiAnswer = data.choices[0].message.content;

            // Save to Supabase and get ID
            const { data: savedRecord, error } = await supabase.from('ai_consultations').insert({
                user_id: user.uid,
                question: input,
                answer: aiAnswer
            }).select().single();

            if (savedRecord) {
                // Replace temp message and prepend Q & A
                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isTemp);
                    return [
                        { role: 'user', content: input, created_at: savedRecord.created_at, id: savedRecord.id },
                        { role: 'assistant', content: aiAnswer, created_at: savedRecord.created_at, id: savedRecord.id },
                        ...filtered
                    ];
                });
            } else {
                throw new Error(error?.message || 'Save failed');
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => {
                const filtered = prev.filter(m => !m.isTemp);
                // On error, just prepend error msg? Or keep user msg? Use append for error for now to match logic
                // But since we are top-down, let's prepend.
                return [
                    { role: 'assistant', content: '抱歉，我現在有點雲端連線問題，請稍後再試。', created_at: new Date().toISOString() },
                    ...filtered // Note: if we removed temp user msg, we lose it. Let's keep context simple.
                ];
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-160px)]">
            <div className="glass-card mb-4 flex items-center justify-between border-none bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-0.5 rounded-full shadow-md w-10 h-10 overflow-hidden border-2 border-white">
                        <img src="/fox_icon.png" alt="AI Fox" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-700">AI 雲端諮詢</h2>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">AI Love Health Assistant</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                    <Settings size={20} />
                </button>
            </div>

            {showSettings && (
                <div className="glass-card mb-4 bg-indigo-50/30 border-indigo-100 animate-in fade-in zoom-in duration-300">
                    <h3 className="text-xs font-bold text-indigo-400 mb-4 uppercase tracking-[0.2em]">AI 設定 (支援 DeepSeek)</h3>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={aiApiKey}
                            onChange={(e) => setAiApiKey(e.target.value)}
                            placeholder="輸入您的 DeepSeek API Key"
                            className="flex-1 bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-300"
                        />
                        <button onClick={handleSaveSettings} className="bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all">儲存</button>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-3 font-medium text-center">API Key 將儲存於您的瀏覽器本地，不會上傳至其他伺服器</p>
                </div>
            )}

            <form onSubmit={handleSend} className="glass-card p-2 mb-4 bg-white/60">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="想請教 AI 什麼呢？"
                        className="flex-1 bg-white border border-indigo-50 rounded-xl px-4 py-4 outline-none focus:border-indigo-300 text-gray-700 text-sm shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="bg-gradient-to-br from-indigo-400 to-purple-500 w-14 h-14 flex items-center justify-center rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:grayscale"
                    >
                        <Send size={20} className="text-white" />
                    </button>
                </div>
            </form>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-8 p-4 custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-60">
                        <div className="w-24 h-24 bg-indigo-100/50 rounded-full flex items-center justify-center mb-6 animate-bounce duration-[3s] overflow-hidden border-4 border-white shadow-lg">
                            <img src="/fox_icon.png" alt="AI Fox" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-600 mb-2">我是您的雲端守護 AI</h3>
                        <p className="text-sm text-gray-400 px-10">
                            您可以問我關於生理健康、情緒管理或與伴侶相處的建議唷！
                        </p>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300 group`}
                        >
                            <div
                                className={`relative max-w-[85%] px-5 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${m.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-600 rounded-tl-none border border-indigo-50'
                                    }`}
                            >
                                {m.role === 'assistant' && (
                                    <div className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-widest flex items-center gap-1">
                                        <div className="w-4 h-4 rounded-full overflow-hidden border border-indigo-200">
                                            <img src="/fox_icon.png" alt="AI" className="w-full h-full object-cover" />
                                        </div>
                                        AI Response
                                    </div>
                                )}
                                {m.content}

                                {m.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(m.id);
                                        }}
                                        className={`absolute -bottom-7 ${m.role === 'user' ? 'right-0' : 'left-0'} w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-400 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity active:text-rose-500 rounded-full active:bg-rose-50`}
                                        title="刪除此對話"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white px-5 py-3 rounded-2xl border border-indigo-50 shadow-sm flex gap-1">
                            <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIConsultation;
