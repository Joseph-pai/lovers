import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ currentDate, onDateClick, records, viewMode = 'month', onViewMonth }) => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const renderMonthView = () => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const arr = [];
        for (let i = 0; i < firstDayOfMonth; i++) arr.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayRecords = records.filter(r => r.date === dateStr);
            arr.push({
                day: i,
                dateStr,
                records: dayRecords,
                isToday: dateStr === new Date().toISOString().split('T')[0]
            });
        }

        return (
            <div className="w-full border-l border-t border-gray-100 bg-white fade-in">
                <div className="grid grid-cols-7">
                    {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(d => (
                        <div key={d} className="text-center text-sm text-gray-400 font-bold py-3 border-r border-b border-gray-100 uppercase tracking-wider bg-white">{d}</div>
                    ))}
                    {arr.map((d, i) => (
                        <div
                            key={i}
                            onClick={() => d && onDateClick(d.dateStr)}
                            className={`min-h-[140px] flex flex-col items-center justify-start border-r border-b border-gray-100 transition-colors relative cursor-pointer group ${!d ? 'bg-[#F9F9F9]' : 'hover:bg-gray-50/50'}`}
                        >
                            {d && (
                                <div className="w-full flex flex-col h-full">
                                    <div className="p-1 flex flex-col items-center mt-1">
                                        <span className={`flex items-center justify-center w-9 h-9 text-lg font-medium rounded-full transition-colors ${d.isToday ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                                            {d.day}
                                        </span>
                                        <span className={`text-[9px] mt-0.5 ${d.isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                            {d.isToday ? '初一' : (d.day % 2 === 0 ? '初二' : '初三')}
                                        </span>
                                    </div>
                                    <div className="w-full flex flex-col gap-[2px] mt-1 px-1 overflow-hidden">
                                        {d.records.map((r, idx) => (
                                            <React.Fragment key={idx}>
                                                {r.flow && <div className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-[2px] font-medium truncate leading-normal">🩸 流量: {r.flow}</div>}
                                                {r.emotions?.map((e, eIdx) => <div key={`e-${eIdx}`} className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-[2px] font-medium truncate leading-normal">😊 {e}</div>)}
                                                {r.symptoms?.map((s, sIdx) => <div key={`s-${sIdx}`} className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded-[2px] font-medium truncate leading-normal">💊 {s}</div>)}
                                                {r.notes && <div className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-[2px] font-medium truncate leading-normal">📝 {r.notes}</div>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderYearView = () => {
        const months = Array.from({ length: 12 }, (_, i) => i);
        return (
            <div className="p-6 grid grid-cols-3 md:grid-cols-4 gap-8 bg-white overflow-y-auto max-h-[800px] fade-in">
                {months.map(m => {
                    const daysInM = new Date(year, m + 1, 0).getDate();
                    const firstDayInM = new Date(year, m, 1).getDay();
                    const monthDays = [];
                    for (let i = 0; i < firstDayInM; i++) monthDays.push(null);
                    for (let i = 1; i <= daysInM; i++) {
                        const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                        const hasRecord = records.some(r => r.date === dateStr);
                        monthDays.push({ day: i, hasRecord });
                    }

                    return (
                        <div key={m} onClick={() => onViewMonth(new Date(year, m, 1))} className="flex flex-col cursor-pointer group">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-rose-500 transition-colors">{m + 1}月</h3>
                            <div className="grid grid-cols-7 gap-1">
                                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                                    <div key={d} className="text-[8px] text-gray-300 font-bold text-center">{d}</div>
                                ))}
                                {monthDays.map((d, di) => (
                                    <div key={di} className="aspect-square flex items-center justify-center relative">
                                        {d && (
                                            <span className={`text-[9px] ${d.hasRecord ? 'w-4 h-4 rounded-full bg-rose-50 text-rose-500 font-bold flex items-center justify-center border border-rose-100' : 'text-gray-400'}`}>
                                                {d.day}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return viewMode === 'year' ? renderYearView() : renderMonthView();
};

export default Calendar;
