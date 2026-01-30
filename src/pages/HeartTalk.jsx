import React, { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../context/AuthContext';
import { Send, Heart, Trash2, Archive, X, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const HeartTalk = () => {
    const { user } = useAuth();
    const { fetchData, upsertData, loading } = useSupabase();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        loadMessages();

        // Subscribe to real-time message updates
        if (!user) return;

        // Listen to all message changes in the table
        // We filter client-side because Supabase realtime filters don't support OR conditions
        const channel = supabase
            .channel('messages-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // Only listen for new messages for sound notification
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    console.log('New message received:', payload);
                    const message = payload.new;

                    if (message) {
                        // If it's a message for me (or from me), reload
                        if (message.sender_id === user.uid || message.receiver_id === user.uid) {
                            loadMessages();
                        }

                        // Play sound ONLY if it's a new message from the partner (not looking at my own messages)
                        if (message.receiver_id === user.uid && message.sender_id !== user.uid) {
                            const audio = new Audio('/notification.mp3');
                            audio.play().catch(e => console.error("Error playing sound:", e));
                        }
                    }
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    useEffect(() => {
        if (scrollRef.current && !showHistory) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, showHistory]);

    const loadMessages = async () => {
        if (!user) return;

        // Fetch messages where I am sender or receiver
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.uid},receiver_id.eq.${user.uid}`);

        if (data) {
            // Sort by Date ascending (oldest first)
            setMessages(data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (!user.partner_id) {
            alert('尚未連結伴侶，訊息將暫存在您的雲端空間唷！');
        }

        const newMessage = {
            sender_id: user.uid,
            receiver_id: user.partner_id || null,
            content: input,
            created_at: new Date().toISOString()
        };

        // Optimistic UI
        setMessages([...messages, newMessage]);
        setInput('');

        await upsertData('messages', newMessage);
        loadMessages();
    };

    const handleDelete = async (ids) => {
        if (!ids || ids.length === 0) return;

        if (!confirm(ids.length > 1 ? '確定要刪除所有歷史訊息嗎？此動作無法復原。' : '確定要刪除這條訊息嗎？')) return;

        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .in('id', ids);

            if (error) throw error;

            // Update local state
            setMessages(prev => prev.filter(m => !ids.includes(m.id)));
        } catch (err) {
            console.error('Error deleting messages:', err);
            alert('刪除失敗，請稍後再試');
        }
    };

    // Logic to separate messages
    // recentMessages: Last 5 messages
    // historyMessages: All messages before the last 5
    const recentMessages = messages.slice(-5);
    const historyMessages = messages.slice(0, -5);

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] relative">
            <div className="glass-card mb-4 flex items-center justify-between z-10 shrink-0">
                <div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">傾心吐意</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">End-to-End Encrypted Cloud Sync</p>
                </div>
                <div className="flex items-center gap-2">
                    {historyMessages.length > 0 && (
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-2 rounded-full transition-all ${showHistory ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                            <Archive size={18} />
                            {showHistory && <span className="sr-only">Close History</span>}
                        </button>
                    )}
                    <Heart className="text-pink-500/50" size={24} />
                </div>
            </div>

            {/* History Overlay Panel */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-0 right-0 bottom-24 bg-white/95 backdrop-blur-md z-20 rounded-3xl border border-gray-100 shadow-xl flex flex-col overflow-hidden"
                    >
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                歷史訊息 ({historyMessages.length})
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(historyMessages.map(m => m.id))}
                                    className="p-2 bg-rose-50 text-rose-500 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-rose-100"
                                >
                                    <Trash2 size={12} /> 全部刪除
                                </button>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {historyMessages.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm mt-10">這裡沒有更多歷史訊息了</div>
                            ) : (
                                historyMessages.map(m => (
                                    <div key={m.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm gap-3">
                                        <div className="text-sm text-gray-600 truncate flex-1">
                                            {m.content}
                                            <div className="text-[9px] text-gray-300 mt-1">
                                                {new Date(m.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete([m.id])}
                                            className="text-gray-300 hover:text-rose-400 p-2"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar relative"
            >
                {historyMessages.length > 0 && !showHistory && (
                    <div className="text-center py-2">
                        <button
                            onClick={() => setShowHistory(true)}
                            className="bg-gray-50 text-gray-400 text-[10px] px-4 py-2 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            查看 {historyMessages.length} 則更早的訊息...
                        </button>
                    </div>
                )}

                {recentMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                        <div className="text-5xl mb-4">✨</div>
                        <p className="text-sm">尚未有任何訊息</p>
                        <p className="text-[10px]">開始與伴侶分享妳的真心話</p>
                    </div>
                ) : (
                    recentMessages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex ${m.sender_id === user.uid ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${m.sender_id === user.uid
                                    ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-tr-none'
                                    : 'bg-white text-gray-600 rounded-tl-none border border-pink-50'
                                    }`}
                            >
                                {m.content}
                                <div className={`text-[9px] mt-1 opacity-50 ${m.sender_id === user.uid ? 'text-right' : 'text-left'}`}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="glass-card p-2 mt-4 shrink-0 z-10">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={user?.gender === 'male' ? "想對妳說..." : "想對你說..."}
                        className="flex-1 bg-white border border-pink-50 rounded-xl px-4 py-3 outline-none focus:border-rose-300 text-gray-700 text-sm transition-all placeholder:text-gray-300"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-gradient-to-r from-rose-400 to-pink-500 w-12 h-12 flex items-center justify-center rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-pink-100 disabled:opacity-50 disabled:grayscale"
                    >
                        <Send size={18} className="text-white" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HeartTalk;
