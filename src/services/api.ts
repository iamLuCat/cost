import type { ApiResponse, Expense, SettlementRow } from '../types';

const MOCK_DATA: ApiResponse = {
    expenses: [
        {
            id: '1',
            date: '2024-01-01',
            description: 'Ăn sáng (Mock)',
            payer: 'Vũ',
            amount: 50000,
            splitBy: { Vũ: true, Duyên: true, Phi: false, Trổi: false },
            count: 2,
            splitAmount: 25000,
        },
    ],
    settlement: [
        {
            sender: 'Vũ',
            receivers: { Vũ: 0, Duyên: 10000, Phi: 50000, Trổi: 0 },
        },
        {
            sender: 'Phi',
            receivers: { Vũ: 20000, Duyên: 0, Phi: 0, Trổi: 0 },
        }
    ],
};

const IS_DEV = import.meta.env.DEV;
const API_URL = import.meta.env.VITE_API_URL || '';



export const api = {
    async getData(month: string): Promise<ApiResponse> {
        let url = API_URL;
        // ... (lines 34-52 omitted for brevity, ensure they align)
        if (IS_DEV && API_URL.includes('script.google.com')) {
            const parts = API_URL.split('script.google.com');
            if (parts.length > 1) {
                url = `/api${parts[1]}`;
            }
        }

        if (!API_URL && IS_DEV) {
            console.log('Using Mock Data');
            return new Promise((resolve) => setTimeout(() => resolve(MOCK_DATA), 500));
        }

        console.log('Fetching from:', url);
        const targetUrl = url;

        const res = await fetch(`${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=readAll&month=${month}`);
        const json = await res.json();

        // Cleanup Settlement Data (Filter out rows where sender is "Column 1" or empty)
        if (json.settlement) {
            json.settlement = json.settlement.filter((row: SettlementRow) =>
                row.sender && (row.sender as string) !== 'Column 1' && !(row.sender as string).startsWith('Unknown')
            );
        }

        // Cleanup Expenses (Filter out empty rows)
        if (json.expenses) {
            json.expenses = json.expenses.filter((row: Expense) =>
                row.date && row.payer && row.amount && row.description
            );
        }
        return json;
    },

    async addExpense(expense: Omit<Expense, 'id' | 'count' | 'splitAmount'>): Promise<void> {
        console.log('Adding expense:', expense);
        if (!API_URL && IS_DEV) {
            return new Promise((resolve) => setTimeout(resolve, 500));
        }

        let url = API_URL;
        if (IS_DEV && API_URL.includes('script.google.com')) {
            const parts = API_URL.split('script.google.com');
            if (parts.length > 1) {
                url = `/api${parts[1]}`;
            }
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create',
                payload: expense
            })
        });

        const json = await res.json();
        if (json.error) {
            throw new Error(json.error);
        }
    }
};
