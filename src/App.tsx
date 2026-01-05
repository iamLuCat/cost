import React, { useEffect, useState } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { Dashboard } from './components/Dashboard';
import { Wallet } from 'lucide-react';
import { api } from './services/api';
import type { ApiResponse } from './types';
import './index.css';

function App() {
  // Default to current month "01", "02"...
  const currentMonth = new Date().toISOString().split('-')[1]; // "01"
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.getData(selectedMonth);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Quản Lý Chi Tiêu Nhóm
          </h1>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none appearance-none pr-8 font-bold cursor-pointer hover:bg-slate-700 transition"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const m = (i + 1).toString().padStart(2, '0');
                return <option key={m} value={m}>Tháng {m}</option>
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="text-sm text-muted hover:text-white transition-colors underline whitespace-nowrap"
          >
            Làm mới
          </button>
        </div>
      </header>

      <main className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-6">
          <ExpenseForm onRefresh={fetchData} />
        </div>

        {/* Right Column: Dashboard */}
        <div className="lg:col-span-7">
          <Dashboard data={data!} loading={loading} />
        </div>
      </main>
    </div>
  );
}

export default App;
