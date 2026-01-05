import React, { useState } from 'react';
import { MEMBERS, type Member } from '../types';
import { api } from '../services/api';
import { Plus, Calendar, DollarSign, FileText } from 'lucide-react';
import '../index.css';

export const ExpenseForm: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        payer: MEMBERS[0],
        splitBy: MEMBERS.reduce((acc, m) => ({ ...acc, [m]: true }), {} as Record<Member, boolean>),
    });

    const handleToggleMember = (member: Member) => {
        setFormData(prev => ({
            ...prev,
            splitBy: { ...prev.splitBy, [member]: !prev.splitBy[member] }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.addExpense({
                date: formData.date,
                description: formData.description,
                payer: formData.payer,
                amount: Number(formData.amount),
                splitBy: formData.splitBy,
            });
            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                payer: MEMBERS[0],
                splitBy: MEMBERS.reduce((acc, m) => ({ ...acc, [m]: true }), {} as Record<Member, boolean>),
            });
            onRefresh();
            alert('Đã thêm khoản chi thành công!');
        } catch (err) {
            alert('Lỗi: ' + err);
        } finally {
            setLoading(false);
        }
    };

    const selectedCount = Object.values(formData.splitBy).filter(Boolean).length;
    const splitAmount = formData.amount ? Number(formData.amount) / (selectedCount || 1) : 0;

    return (
        <form onSubmit={handleSubmit} className="glass glass-panel animate-fade-in">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-primary" /> Thêm Khoản Chi Mới
            </h2>

            <div className="grid gap-4">
                {/* Date & Amount */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="text-sm text-muted mb-1 block">Ngày chi</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted" />
                            <input
                                type="date"
                                required
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="text-sm text-muted mb-1 block">Số tiền</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted" />
                            <input
                                type="number"
                                required
                                placeholder="0"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="text-sm text-muted mb-1 block">Nội dung</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            required
                            placeholder="Ví dụ: Ăn tối, Cafe..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Payer */}
                <div className="form-group">
                    <label className="text-sm text-muted mb-1 block">Người trả tiền</label>
                    <div className="flex gap-2 bg-slate-800/30 p-1 rounded-lg">
                        {MEMBERS.map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setFormData({ ...formData, payer: m })}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.payer === m
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-muted hover:bg-slate-700/50'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Split Members */}
                <div className="form-group">
                    <label className="text-sm text-muted mb-1 block flex justify-between">
                        <span>Chia cho ai?</span>
                        <span className="text-primary font-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(splitAmount)} / người
                        </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {MEMBERS.map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => handleToggleMember(m)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${formData.splitBy[m]
                                    ? 'border-secondary bg-secondary/10 text-white'
                                    : 'border-slate-700 text-muted hover:border-slate-600'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.splitBy[m] ? 'border-secondary bg-secondary' : 'border-slate-500'
                                    }`}>
                                    {formData.splitBy[m] && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary mt-4 w-full flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    {loading ? 'Đang lưu...' : 'Lưu Chi Tiêu'}
                </button>
            </div>
        </form>
    );
};
