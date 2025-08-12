const LiteTable = require('../src/LiteTable');
const { isDateInRange, parseDate } = LiteTable;

describe('Date Utility Functions', () => {
    describe('parseDate', () => {
        it('should parse DD/MM/YYYY format correctly', () => {
            const date = parseDate('15/04/2025');
            expect(date.getFullYear()).toBe(2025);
            expect(date.getMonth()).toBe(3);
            expect(date.getDate()).toBe(15);
        });
    });

    describe('isDateInRange', () => {
        const today = new Date();
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        it('should throw error for invalid date format', () => {
            expect(() => isDateInRange('2025-04-15', 'today')).toThrow('Invalid date format');
            expect(() => isDateInRange('15-04-2025', 'today')).toThrow('Invalid date format');
        });

        it('should correctly identify dates from today', () => {
            expect(isDateInRange(formatDate(today), 'today')).toBe(true);

            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            expect(isDateInRange(formatDate(yesterday), 'today')).toBe(false);

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            expect(isDateInRange(formatDate(tomorrow), 'today')).toBe(false);
        });

        it('should correctly identify dates from this week', () => {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());

            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

            expect(isDateInRange(formatDate(startOfWeek), 'week')).toBe(true);
            expect(isDateInRange(formatDate(endOfWeek), 'week')).toBe(true);

            const beforeWeek = new Date(startOfWeek);
            beforeWeek.setDate(startOfWeek.getDate() - 1);
            expect(isDateInRange(formatDate(beforeWeek), 'week')).toBe(false);

            const afterWeek = new Date(endOfWeek);
            afterWeek.setDate(endOfWeek.getDate() + 1);
            expect(isDateInRange(formatDate(afterWeek), 'week')).toBe(false);
        });

        it('should correctly identify dates from this month', () => {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            expect(isDateInRange(formatDate(startOfMonth), 'month')).toBe(true);
            expect(isDateInRange(formatDate(endOfMonth), 'month')).toBe(true);

            const beforeMonth = new Date(startOfMonth);
            beforeMonth.setDate(startOfMonth.getDate() - 1);
            expect(isDateInRange(formatDate(beforeMonth), 'month')).toBe(false);

            const afterMonth = new Date(endOfMonth);
            afterMonth.setDate(endOfMonth.getDate() + 1);
            expect(isDateInRange(formatDate(afterMonth), 'month')).toBe(false);
        });

        it('should correctly identify dates from this quarter', () => {
            const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
            const startOfQuarter = new Date(today.getFullYear(), quarterStartMonth, 1);
            const endOfQuarter = new Date(today.getFullYear(), quarterStartMonth + 3, 0);

            expect(isDateInRange(formatDate(startOfQuarter), 'quarter')).toBe(true);
            expect(isDateInRange(formatDate(endOfQuarter), 'quarter')).toBe(true);

            const beforeQuarter = new Date(startOfQuarter);
            beforeQuarter.setDate(startOfQuarter.getDate() - 1);
            expect(isDateInRange(formatDate(beforeQuarter), 'quarter')).toBe(false);

            const afterQuarter = new Date(endOfQuarter);
            afterQuarter.setDate(endOfQuarter.getDate() + 1);
            expect(isDateInRange(formatDate(afterQuarter), 'quarter')).toBe(false);
        });

        it('should correctly identify dates from this year', () => {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const endOfYear = new Date(today.getFullYear(), 11, 31);

            expect(isDateInRange(formatDate(startOfYear), 'year')).toBe(true);
            expect(isDateInRange(formatDate(endOfYear), 'year')).toBe(true);

            const beforeYear = new Date(startOfYear);
            beforeYear.setDate(startOfYear.getDate() - 1);
            expect(isDateInRange(formatDate(beforeYear), 'year')).toBe(false);

            const afterYear = new Date(endOfYear);
            afterYear.setDate(endOfYear.getDate() + 1);
            expect(isDateInRange(formatDate(afterYear), 'year')).toBe(false);
        });

        it('should return true for invalid range parameter', () => {
            expect(isDateInRange(formatDate(today), 'invalid-range')).toBe(true);
        });
    });
});