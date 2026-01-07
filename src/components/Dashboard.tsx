import React, { useState, useMemo } from 'react';
import type { ApiResponse } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { ArrowRight, CreditCard, History, Search, ArrowUpAZ, ArrowDownZA, ListFilter, ArrowUpDown } from 'lucide-react';
import '../index.css';

interface DashboardProps {
    data: ApiResponse;
    loading: boolean;
}

type SortOrder = 'asc' | 'desc' | 'none';

type SettlementSortField = 'sender' | 'receiver' | 'amount';
interface SettlementSortConfig {
    field: SettlementSortField | null;
    direction: 'asc' | 'desc';
}

export const Dashboard: React.FC<DashboardProps> = ({ data, loading }) => {
    // Expense List State
    const [filterName, setFilterName] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('none');

    // Settlement Table State
    const [settlementFilter, setSettlementFilter] = useState('');
    const [settlementSort, setSettlementSort] = useState<SettlementSortConfig>({ field: null, direction: 'asc' });

    const processedExpenses = useMemo(() => {
        if (!data?.expenses) return [];

        let result = [...data.expenses];

        // Filter
        if (filterName.trim()) {
            const lowerFilter = filterName.toLowerCase();
            result = result.filter(e =>
                e.description.toLowerCase().includes(lowerFilter)
            );
        }

        // Sort
        if (sortOrder !== 'none') {
            result.sort((a, b) => {
                const nameA = a.description.toLowerCase();
                const nameB = b.description.toLowerCase();
                if (sortOrder === 'asc') return nameA.localeCompare(nameB);
                return nameB.localeCompare(nameA);
            });
        } else {
            // Default sort by ID (usually implies chronological if IDs are sequential/time-based) 
            // or just keep original reverse order for display
            // The original code did .slice().reverse()
            return result.reverse();
        }

        return result;
    }, [data?.expenses, filterName, sortOrder]);

    const toggleSort = () => {
        setSortOrder(current => {
            if (current === 'none') return 'asc';
            if (current === 'asc') return 'desc';
            return 'none';
        });
    };

    // --- Settlement Logic ---
    const processedSettlement = useMemo(() => {
        if (!data?.settlement) return [];

        // 1. Flatten
        let flatList: { sender: string; receiver: string; amount: number }[] = [];
        data.settlement.forEach(row => {
            Object.entries(row.receivers).forEach(([receiver, amount]) => {
                if (Number(amount) > 0) {
                    flatList.push({ sender: row.sender, receiver, amount: Number(amount) });
                }
            });
        });

        // 2. Filter
        if (settlementFilter.trim()) {
            const lowerFilter = settlementFilter.toLowerCase();
            flatList = flatList.filter(item =>
                item.sender.toLowerCase().includes(lowerFilter) ||
                item.receiver.toLowerCase().includes(lowerFilter)
            );
        }

        // 3. Sort
        if (settlementSort.field) {
            flatList.sort((a, b) => {
                const { field, direction } = settlementSort;
                if (!field) return 0;

                let valA = a[field];
                let valB = b[field];

                if (field === 'amount') {
                    return direction === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
                } else {
                    return direction === 'asc'
                        ? (valA as string).localeCompare(valB as string)
                        : (valB as string).localeCompare(valA as string);
                }
            });
        }

        return flatList;
    }, [data?.settlement, settlementFilter, settlementSort]);

    const handleSettlementSort = (field: SettlementSortField) => {
        setSettlementSort(current => {
            if (current.field !== field) {
                return { field, direction: 'asc' };
            }
            if (current.direction === 'asc') {
                return { field, direction: 'desc' };
            }
            return { field: null, direction: 'asc' }; // Toggle off or loop
        });
    };

    const getSortIcon = (field: SettlementSortField) => {
        if (settlementSort.field !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        if (settlementSort.direction === 'asc') return <ArrowUpAZ className="w-3 h-3 text-primary" />;
        return <ArrowDownZA className="w-3 h-3 text-primary" />;
    };

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <CreditCard className="text-secondary" /> Bảng Thanh Toán
                    </h3>

                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm người..."
                            value={settlementFilter}
                            onChange={(e) => setSettlementFilter(e.target.value)}
                            className="w-full sm:w-48 bg-slate-800/50 border border-slate-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase bg-slate-800/50 text-gray-400">
                            <tr>
                                <th
                                    className="px-4 py-3 rounded-tl-lg cursor-pointer hover:bg-slate-700/50 transition select-none"
                                    onClick={() => handleSettlementSort('sender')}
                                >
                                    <div className="flex items-center gap-1">
                                        Người chuyển {getSortIcon('sender')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-slate-700/50 transition select-none"
                                    onClick={() => handleSettlementSort('receiver')}
                                >
                                    <div className="flex items-center gap-1">
                                        Người nhận {getSortIcon('receiver')}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 rounded-tr-lg text-right cursor-pointer hover:bg-slate-700/50 transition select-none"
                                    onClick={() => handleSettlementSort('amount')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Số tiền {getSortIcon('amount')}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedSettlement.length > 0 ? (
                                processedSettlement.map((item, idx) => (
                                    <tr key={`${idx}`} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{item.sender}</td>
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <ArrowRight className="w-3 h-3 text-muted" /> {item.receiver}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-400">
                                            {formatCurrency(item.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-slate-500">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense History */}
            <div className="glass glass-panel">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <History className="text-blue-400" /> Lịch Sử Chi Tiêu
                    </h3>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên..."
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="w-full sm:w-48 bg-slate-800/50 border border-slate-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={toggleSort}
                            className={`p-1.5 rounded-lg border transition-colors ${sortOrder !== 'none'
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            title="Sắp xếp theo tên"
                        >
                            {sortOrder === 'asc' && <ArrowUpAZ className="w-4 h-4" />}
                            {sortOrder === 'desc' && <ArrowDownZA className="w-4 h-4" />}
                            {sortOrder === 'none' && <ListFilter className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {processedExpenses.length > 0 ? (
                        processedExpenses.map((expense) => (
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
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            Không tìm thấy khoản chi nào
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
