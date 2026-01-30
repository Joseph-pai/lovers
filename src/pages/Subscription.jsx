import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Globe, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Subscription = ({ onBack }) => {
    const [selectedPlan, setSelectedPlan] = useState('yearly');

    const plans = [
        {
            id: 'monthly',
            name: '月度守護方案',
            price: '19',
            period: '月',
            description: '最靈活的選擇，隨時啟動雲端守護',
        },
        {
            id: 'yearly',
            name: '年度愛之方案',
            price: '199',
            period: '年',
            description: '超值選擇，讓愛長久且不間斷',
            highlight: true,
            save: '省下約 13%'
        }
    ];

    const features = [
        { icon: Globe, text: '即時數據同步，伴侶端同步更新' },
        { icon: ShieldCheck, text: '無限次雲端紀錄與 AI 諮詢' },
        { icon: Zap, text: '專屬加密儲存，數據永不遺失' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-3 bg-white text-gray-400 rounded-2xl border border-gray-100/50 hover:text-rose-400 transition-all active:scale-90"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">選擇訂閱方案</h2>
            </div>

            {/* Benefit Intro */}
            <div className="glass-card bg-gradient-to-br from-rose-400 to-pink-500 text-white border-none relative overflow-hidden transform transition-all hover:scale-[1.01]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10 rounded-full"></div>
                <div className="relative z-10 space-y-4">
                    <p className="font-bold text-rose-50 text-xs uppercase tracking-[0.2em]">Unlock Premium Features</p>
                    <h3 className="text-2xl font-black">提升您的守護品質</h3>
                    <div className="space-y-3 pt-2">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <f.icon size={14} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-rose-50">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 gap-4">
                {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className="relative cursor-pointer group"
                        >
                            {/* Moving Selection Border/Glow */}
                            {isSelected && (
                                <motion.div
                                    layoutId="plan-selection"
                                    className="absolute -inset-0.5 bg-gradient-to-r from-rose-400 to-pink-500 rounded-3xl blur-[2px] opacity-75"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            <div className={`glass-card text-left relative overflow-hidden transition-all duration-300 border-2 ${isSelected
                                    ? 'bg-white border-transparent'
                                    : 'bg-white/60 border-white/40 hover:bg-white/80'
                                }`}>
                                {plan.save && (
                                    <div className="absolute -right-12 top-6 bg-rose-500 text-white px-12 py-1 rotate-45 text-[10px] font-black uppercase tracking-widest shadow-sm z-10">
                                        {plan.save}
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h4 className={`font-black text-lg transition-colors ${isSelected ? 'text-rose-500' : 'text-gray-700'
                                            }`}>
                                            {plan.name}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-black transition-colors ${isSelected ? 'text-gray-800' : 'text-gray-600'
                                            }`}>
                                            NT$ {plan.price}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-bold">/ {plan.period}</div>
                                    </div>
                                </div>

                                <div className={`w-full py-4 rounded-xl text-center font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${isSelected
                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                                        : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                                    }`}>
                                    {isSelected && <Check size={16} className="animate-in zoom-in duration-300" />}
                                    {isSelected ? '目前選擇方案' : '點擊選擇'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-center text-[10px] text-gray-400 font-medium px-8 leading-relaxed">
                訂閱將自動續訂，您可以隨時在設定中取消。
                您的支持是我們持續發展的動力！
            </p>
        </div>
    );
};

export default Subscription;
