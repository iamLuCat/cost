import React from 'react';
import type { ApiResponse } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { ArrowRight, CreditCard, History } from 'lucide-react';
import '../index.css';

interface DashboardProps {
    data: ApiResponse;
    loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, loading }) => {
    if (loading) return <div className="text-center p-10 animate-pulse text-muted">Đang tải dữ liệu...</div>;
    if (!data?.expenses) return <div className="text-center p-10 text-red-400">Không có dữ liệu</div>;

    // Calculate stats
    const totalSpent = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return (
        <div className="grid gap-6 animate-fade-in-up">
            {/* Summary Card */}
            <div className="glass glass-panel bg-gradient-to-r from-primary/20 to-secondary/20 border-l-4 border-l-primary">
                <h3 className="text-muted text-sm uppercase tracking-wider mb-1">Tổng Chi Tiêu</h3>
                <p className="text-4xl font-bold text-white tracking-tight">{formatCurrency(totalSpent)}</p>
            </div>

            {/* Settlement Matrix */}
            <div className="glass glass-panel">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="text-secondary" /> Bảng Thanh Toán
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase bg-slate-800/50 text-gray-400">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Người chuyển</th>
                                <th className="px-4 py-3">Người nhận</th>
                                <th className="px-4 py-3 rounded-tr-lg text-right">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.settlement.flatMap((row, idx) =>
                                Object.entries(row.receivers).map(([receiver, amount], i) => {
                                    if (Number(amount) <= 0) return null; // Only show positive debts
                                    return (
                                        <tr key={`${idx}-${i}`} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-white">{row.sender}</td>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <ArrowRight className="w-3 h-3 text-muted" /> {receiver}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-400">
                                                {formatCurrency(Number(amount))}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense History */}
            <div className="glass glass-panel">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <History className="text-blue-400" /> Lịch Sử Chi Tiêu
                </h3>
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {data.expenses.slice().reverse().map((expense) => (
                        <div key={expense.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 hover:border-slate-500 transition-all flex justify-between items-center group">
                            <div>
                                <div className="font-bold text-white group-hover:text-primary transition-colors">{expense.description}</div>
                                <div className="text-xs text-muted flex gap-2 mt-1">
                                    <span>{formatDate(expense.date)}</span>
                                    <span>•</span>
                                    <span>{expense.payer} trả</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">{formatCurrency(Number(expense.amount))}</div>
                                <div className="text-xs text-muted mt-1">
                                    {expense.count} người chia
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
