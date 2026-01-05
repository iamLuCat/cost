export type Member = 'Vũ' | 'Duyên' | 'Phi' | 'Trổi';

export const MEMBERS: Member[] = ['Vũ', 'Duyên', 'Phi', 'Trổi'];

export interface Expense {
    id: string; // Row index or generated ID
    date: string; // ISO string YYYY-MM-DD
    description: string;
    payer: Member;
    amount: number;
    // Splitting boolean map
    splitBy: Record<Member, boolean>;
    // Calculated fields (optional for input, required for display)
    count?: number;
    splitAmount?: number;
}

export interface SettlementRow {
    sender: Member;
    receivers: Record<Member, number>;
}

export interface ApiResponse {
    expenses: Expense[];
    settlement: SettlementRow[];
}
