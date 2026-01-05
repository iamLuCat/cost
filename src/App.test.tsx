import { render, screen } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import App from './App';

// Mock the API to prevent actual network calls during tests
vi.mock('./services/api', () => ({
    api: {
        getData: vi.fn().mockResolvedValue({
            expenses: [],
            settlement: []
        }),
        addExpense: vi.fn(),
    }
}));

test('renders title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Quản Lý Chi Tiêu Nhóm/i);
    expect(titleElement).toBeInTheDocument();
});
