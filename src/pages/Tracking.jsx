import React, { useState, useEffect, useMemo } from 'react';
import Calendar from '../components/Calendar';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../context/AuthContext';
import { Plus, ChevronLeft, ChevronRight, Save, ShieldCheck, Search, HelpCircle, Settings, ChevronDown } from 'lucide-react';
import { supabase } from '../services/supabase';

const Tracking = ({ mode = 'calendar', onNavigate, selectedDate: propSelectedDate, onDateSelect, scrollToForm = false }) => {
    const { user } = useAuth();
    const { fetchData, upsertData, loading } = useSupabase();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [records, setRecords] = useState([]);
    const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date().toISOString().split('T')[0]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // Local state for recording
    const [selectedFlow, setSelectedFlow] = useState(null);
    const [selectedEmotions, setSelectedEmotions] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [note, setNote] = useState('');
    const { updateProfile } = useAuth(); // Access updateProfile
    const [cycleSettings, setCycleSettings] = useState({
        cycle_length: user?.cycle_length || 28,
        period_length: user?.period_length || 5,
        last_period_date: user?.last_period_date || ''
    });

    const isMale = user?.gender === 'male';

    useEffect(() => {
        loadRecords();
    }, [user]);

    useEffect(() => {
        if (propSelectedDate) {
            setSelectedDate(propSelectedDate);
        }
    }, [propSelectedDate]);

    useEffect(() => {
        if (scrollToForm && mode === 'all') {
            setTimeout(() => {
                const formElement = document.getElementById('record-form');
                if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
        }
    }, [scrollToForm, mode]);

    useEffect(() => {
        // Load existing record when date changes
        const existing = records.find(r => r.date === selectedDate && r.user_id === user?.uid);
        if (existing) {
            setEditingRecord(existing);
            setSelectedFlow(existing.flow);
            setSelectedEmotions(existing.emotions || []);
            setSelectedSymptoms(existing.symptoms || []);
            setNote(existing.notes || '');
        } else {
            setEditingRecord(null);
            setSelectedFlow(null);
            setSelectedEmotions([]);
            setSelectedSymptoms([]);
            setNote('');
        }
    }, [selectedDate, records, user]);

    useEffect(() => {
        const handleClickOutside = () => setShowViewDropdown(false);
        if (showViewDropdown) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showViewDropdown]);

    const loadRecords = async () => {
        if (!user) return;

        // If partner exists, fetch both own and partner records
        // For male, mostly interested in partner's records
        let query = `*`;
        if (user.partner_id) {
            // Fetch records where user_id is either current user or partner
            const { data, error } = await supabase
                .from('records')
                .select('*')
                .or(`user_id.eq.${user.uid},user_id.eq.${user.partner_id}`);

            if (data) setRecords(data);
        } else {
            // If no partner, strictly fetch ONLY own records
            const { data, error } = await supabase
                .from('records')
                .select('*')
                .eq('user_id', user.uid);

            if (data) setRecords(data);
        }
    };

    const handleSave = async () => {
        if (isMale) {
            alert('男生端僅供查看，無法修改數據唷！');
            return;
        }

        if (!selectedFlow && selectedEmotions.length === 0 && !note) {
            alert('請至少紀錄一項內容唷！');
            return;
        }

        const record = {
            user_id: user.uid,
            date: selectedDate,
            flow: selectedFlow,
            emotions: selectedEmotions,
            symptoms: selectedSymptoms,
            notes: note,
            updated_at: new Date().toISOString()
        };

        if (editingRecord) {
            record.id = editingRecord.id;
        }

        await upsertData('records', record);
        await loadRecords(); // Wait for records to reload before showing alert
        alert(editingRecord ? '紀錄已更新！' : '紀錄已儲存！');
    };

    const handleDelete = async () => {
        if (!editingRecord) return;

        if (!confirm('確定要刪除這筆紀錄嗎？此操作無法復原。')) {
            return;
        }

        const { error } = await supabase
            .from('records')
            .delete()
            .eq('id', editingRecord.id);

        if (error) {
            alert('刪除失敗：' + error.message);
        } else {
            setEditingRecord(null);
            setSelectedFlow(null);
            setSelectedEmotions([]);
            setSelectedSymptoms([]);
            setNote('');
            await loadRecords(); // Wait for records to reload before showing alert
            alert('紀錄已刪除！');
        }
    };

    const changeMonth = (delta) => {
        const next = new Date(currentDate);
        if (viewMode === 'year') {
            next.setFullYear(next.getFullYear() + delta);
        } else {
            next.setMonth(next.getMonth() + delta);
        }
        setCurrentDate(next);
    };

    const handleUpdateCycleSettings = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(cycleSettings);
            alert('週期設定已更新！');
        } catch (err) {
            alert('更新失敗：' + err.message);
        }
    };

    const predictions = useMemo(() => {
        if (!user?.last_period_date || isMale) return null;

        const lastDate = new Date(user.last_period_date);
        const cycleLen = user.cycle_length || 28;

        // Next period
        const nextPeriod = new Date(lastDate);
        nextPeriod.setDate(lastDate.getDate() + cycleLen);

        // Ovulation (usually 14 days before next period)
        const ovulation = new Date(nextPeriod);
        ovulation.setDate(nextPeriod.getDate() - 14);

        return {
            nextPeriod: nextPeriod.toISOString().split('T')[0],
            ovulation: ovulation.toISOString().split('T')[0]
        };
    }, [user, isMale]);

    const toggleItem = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const filteredRecords = useMemo(() => {
        if (!searchQuery) return records;
        const q = searchQuery.toLowerCase();
        return records.filter(r =>
            (r.notes && r.notes.toLowerCase().includes(q)) ||
            (r.emotions && r.emotions.some(e => e.toLowerCase().includes(q))) ||
            (r.symptoms && r.symptoms.some(s => s.toLowerCase().includes(q))) ||
            (r.flow && r.flow.toLowerCase().includes(q))
        );
    }, [records, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Calendar Section */}
            {(mode === 'calendar' || mode === 'all') && (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-2">
                            {/* Left Side: Today & Navigation */}
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-all border border-gray-100"
                            >
                                今天
                            </button>
                            <div className="flex items-center">
                                <button
                                    onClick={() => changeMonth(-1)}
                                    className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-600"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => changeMonth(1)}
                                    className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-600"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Month/Year Title */}
                            <div className="ml-4">
                                <h2 className="text-xl font-medium text-gray-800">
                                    {viewMode === 'year' ? `${currentDate.getFullYear()}年` : `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-medium">农历十一月 ~ 十二月</p>
                            </div>
                        </div>

                        {/* Right Side: Icons & View Selector */}
                        <div className="flex items-center gap-1 relative">
                            {showSearch && (
                                <input
                                    type="text"
                                    placeholder="搜尋紀錄..."
                                    value={searchQuery}
                                    autoFocus
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-3 py-1.5 text-sm border-b border-rose-300 outline-none w-32 animate-in slide-in-from-right duration-300 mr-2"
                                />
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSearch(!showSearch);
                                    if (showSearch) setSearchQuery('');
                                }}
                                className={`p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-all ${showSearch ? 'text-rose-400 bg-rose-50' : ''}`}
                            >
                                <Search size={22} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    alert('提示：點擊日期即可查看或新增當天的身心紀錄唷！');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-all"
                            >
                                <HelpCircle size={22} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate('settings');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-all"
                            >
                                <Settings size={22} />
                            </button>
                            <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

                            {/* View Selector Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowViewDropdown(!showViewDropdown);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-700 text-sm font-medium border border-gray-100 transition-all active:scale-95"
                                >
                                    {viewMode === 'year' ? '年' : '月'} <ChevronDown size={14} className={`transition-transform duration-200 ${showViewDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showViewDropdown && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-[100] py-2 animate-in fade-in zoom-in duration-200">
                                        <button
                                            onClick={() => { setViewMode('month'); setShowViewDropdown(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between items-center ${viewMode === 'month' ? 'text-rose-500 font-bold' : 'text-gray-600'}`}
                                        >
                                            月 <span>M</span>
                                        </button>
                                        <button
                                            onClick={() => { setViewMode('year'); setShowViewDropdown(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between items-center ${viewMode === 'year' ? 'text-rose-500 font-bold' : 'text-gray-600'}`}
                                        >
                                            年 <span>Y</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isMale && (
                                <span className="ml-2 text-[10px] bg-sky-50 text-sky-600 px-3 py-1 rounded-full uppercase tracking-widest font-black flex items-center gap-1.5 border border-sky-100">
                                    <ShieldCheck size={12} /> View Only
                                </span>
                            )}
                        </div>
                    </div>

                    <Calendar
                        currentDate={currentDate}
                        records={filteredRecords}
                        viewMode={viewMode}
                        predictions={predictions}
                        onViewMonth={(date) => {
                            setCurrentDate(date);
                            setViewMode('month');
                        }}
                        onDateClick={(date) => {
                            if (onDateSelect) {
                                onDateSelect(date);
                            } else {
                                setSelectedDate(date);
                            }
                        }}
                    />
                </div>
            )}

            {/* Cycle Settings - Only for Female */}
            {!isMale && (mode === 'calendar' || mode === 'all') && (
                <div className="glass-card bg-rose-50/30 border-rose-100 p-6">
                    <h3 className="text-lg font-bold text-rose-500 mb-4 flex items-center gap-2">
                        <Settings size={20} /> 週期預測設定
                    </h3>
                    <form onSubmit={handleUpdateCycleSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">平均週期 (天)</label>
                            <input
                                type="number"
                                value={cycleSettings.cycle_length}
                                onChange={(e) => setCycleSettings({ ...cycleSettings, cycle_length: parseInt(e.target.value) })}
                                className="w-full bg-white border border-rose-100 rounded-xl px-4 py-2 outline-none focus:border-rose-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">最近月經首日</label>
                            <input
                                type="date"
                                value={cycleSettings.last_period_date}
                                onChange={(e) => setCycleSettings({ ...cycleSettings, last_period_date: e.target.value })}
                                className="w-full bg-white border border-rose-100 rounded-xl px-4 py-2 outline-none focus:border-rose-300"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-rose-400 text-white font-bold py-2 rounded-xl shadow-sm hover:bg-rose-500 transition-all active:scale-95">
                                更新預測
                            </button>
                        </div>
                    </form>
                    {predictions && (
                        <div className="mt-4 p-3 bg-white/50 rounded-xl border border-rose-100 flex justify-around text-sm">
                            <div className="text-center">
                                <p className="text-gray-400 text-xs mb-1">預計下次月經</p>
                                <p className="font-bold text-rose-500">{predictions.nextPeriod}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 text-xs mb-1">預計排卵日</p>
                                <p className="font-bold text-purple-500">{predictions.ovulation}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AI Consultation Button */}
            {(mode === 'record' || mode === 'all') && (
                <button
                    onClick={() => onNavigate('ai-consultation')}
                    className="glass-card flex items-center gap-4 p-6 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group shadow-sm"
                >
                    <div className="group-hover:scale-110 transition-transform w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-indigo-200">
                        <img src="/fox_icon.png" alt="AI Fox" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left flex-1">
                        <span className="font-bold text-gray-700 block text-lg">AI 健康諮詢</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Get AI Advice</span>
                    </div>
                    <div className="text-gray-300 text-xl font-black">→</div>
                </button>
            )}

            {/* Recording Form Section (Female Only or for Selected Date) */}
            {(mode === 'record' || mode === 'all') && (
                <section id="record-form" className="glass-card animate-in slide-in-from-bottom duration-500 border-none bg-gradient-to-br from-white to-orange-50/30">
                    <h3 className="text-rose-400 font-bold mb-6 flex items-center gap-2 text-2xl">
                        <Plus size={24} className="bg-rose-100 p-1 rounded-full" /> 身心紀錄 <span className="text-gray-400 text-base font-normal">({selectedDate})</span>
                    </h3>

                    <div className="space-y-8">
                        {/* Flow - Only for Female */}
                        {!isMale && (
                            <div>
                                <label className="text-sm text-gray-400 block mb-4 uppercase tracking-[0.2em] font-black">經期流量 • Cycle Flow</label>
                                <div className="flex gap-3">
                                    {['少', '中', '多', '無'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setSelectedFlow(f === '無' ? null : f)}
                                            className={`flex-1 py-4 rounded-2xl text-base transition-all border shadow-sm ${selectedFlow === f || (f === '無' && !selectedFlow) ? 'bg-gradient-to-br from-rose-400 to-pink-500 border-rose-400 text-white font-bold' : 'bg-white border-rose-50 text-gray-400 hover:border-rose-200'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Emotions */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-4 uppercase tracking-[0.2em] font-black">心情狀態 • Emotions</label>
                            <div className="flex flex-wrap gap-2">
                                {['快樂', '平靜', '憂鬱', '易怒', '焦慮', '倦怠', '低潮', '敏感', '煩躁', '興奮', '期盼', '悲傷', '恐懼', '厭惡', '孤獨', '虛無感'].map(e => (
                                    <button
                                        key={e}
                                        onClick={() => toggleItem(selectedEmotions, setSelectedEmotions, e)}
                                        className={`px-5 py-3 rounded-xl text-sm transition-all border shadow-sm ${selectedEmotions.includes(e) ? 'bg-gradient-to-br from-purple-400 to-indigo-500 border-purple-400 text-white font-bold' : 'bg-white border-purple-50 text-gray-500 hover:border-purple-100'
                                            }`}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Symptoms */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-4 uppercase tracking-[0.2em] font-black">身體狀態 • Physical</label>
                            <div className="flex flex-wrap gap-2">
                                {['肚子疼', '疲倦', '四肢無力', '容易抽筋', '頭痛', '過敏', '感冒症狀', '噁心', '腰痠背痛', '腦霧', '拉肚子', '便秘', '痠痛', '體重降低', '精力旺盛'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleItem(selectedSymptoms, setSelectedSymptoms, s)}
                                        className={`px-5 py-3 rounded-xl text-sm transition-all border shadow-sm ${selectedSymptoms.includes(s) ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-400 text-white font-bold' : 'bg-white border-amber-50 text-gray-500 hover:border-amber-100'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-4 uppercase tracking-[0.2em] font-black">今日備註 • Notes</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full bg-white border border-rose-50 rounded-2xl p-5 text-base outline-none focus:border-rose-200 focus:bg-white min-h-[120px] resize-none text-gray-700 placeholder:text-gray-200 shadow-sm"
                                placeholder="寫下妳的感受或特別的小提醒..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="btn-primary flex-1 flex items-center justify-center gap-3 py-5 text-lg"
                            >
                                <Save size={22} />
                                {loading ? '同步雲端中...' : (editingRecord ? '更新紀錄' : '儲存紀錄')}
                            </button>
                            {editingRecord && (
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-6 py-5 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 active:scale-95 transition-all border border-red-100"
                                >
                                    刪除
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {isMale && mode === 'record' && (
                <div className="glass-card text-center py-20 bg-gradient-to-br from-white to-sky-50/50 border-none shadow-sm overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-400/5 blur-3xl rounded-full"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-sky-50 text-sky-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-sky-100/50">
                            <ShieldCheck size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">雲端守護模式</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                            您可以在月曆中查看對方的健康動態。<br />
                            身心紀錄功能專屬於女方維護，<br />
                            您的陪伴就是最暖的紀錄。
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tracking;
