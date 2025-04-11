const { LiteTableManager } = require('../src/LiteTable');

describe('LiteTable Sorting and Filtering', () => {
    const createTableContainer = () => {
        const container = document.createElement('div');
        container.className = 'lite-datatable';
        container.innerHTML = `
      <div class="lite-datatable-filters"></div>
      <div class="lite-datatable-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th class="filtered">Status</th>
              <th class="filtered">Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Active</td>
              <td>15/04/2025</td>
              <td>100</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Inactive</td>
              <td>20/03/2025</td>
              <td>250</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Pending</td>
              <td>05/05/2025</td>
              <td>75,5</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Active</td>
              <td>10/02/2025</td>
              <td>300</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Inactive</td>
              <td>30/04/2025</td>
              <td>125</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="lite-datatable-footer">
        <div class="tableInfo"></div>
      </div>
    `;
        document.body.appendChild(container);
        return container;
    };

    let container;
    let tableManager;

    beforeEach(() => {
        container = createTableContainer();
        tableManager = new LiteTableManager(container);
    });

    afterEach(() => {
        if (tableManager) {
            tableManager.destroy();
        }
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
        container = null;
        tableManager = null;
    });

    describe('Sorting functionality', () => {
        test('should sort rows by date column', () => {
            tableManager.sortRows(2, 'asc');
            tableManager.currentSort = { column: 2, direction: 'asc' };

            expect(tableManager.currentSort.column).toBe(2);
            expect(tableManager.currentSort.direction).toBe('asc');

            const dateOrder = tableManager.rowsCache.map(row =>
                row.cells[2].textContent
            );

            expect(dateOrder).toEqual([
                '10/02/2025',
                '20/03/2025',
                '15/04/2025',
                '30/04/2025',
                '05/05/2025'
            ]);

            tableManager.sortRows(2, 'desc');
            tableManager.currentSort = { column: 2, direction: 'desc' };

            expect(tableManager.currentSort.direction).toBe('desc');

            const reverseDateOrder = tableManager.rowsCache.map(row =>
                row.cells[2].textContent
            );

            expect(reverseDateOrder).toEqual([
                '05/05/2025',
                '30/04/2025',
                '15/04/2025',
                '20/03/2025',
                '10/02/2025'
            ]);
        });

        test('should sort rows by numeric column', () => {
            tableManager.sortRows(3, 'asc');
            tableManager.currentSort = { column: 3, direction: 'asc' };

            const amountOrder = tableManager.rowsCache.map(row =>
                row.cells[3].textContent
            );

            expect(amountOrder).toEqual([
                '75,5',
                '100',
                '125',
                '250',
                '300'
            ]);
        });

        test('should return to original order after third click', () => {
            const originalIdValues = ['1', '2', '3', '4', '5'];

            tableManager.sortRows(1, 'asc');
            tableManager.sortRows(1, 'desc');

            tableManager.rowsCache.sort((a, b) => a.originalIndex - b.originalIndex);

            const currentValues = tableManager.rowsCache.map(row =>
                row.cells[0].textContent
            );

            expect(currentValues).toHaveLength(originalIdValues.length);
            originalIdValues.forEach(id => {
                expect(currentValues).toContain(id);
            });
        });
    });

    describe('Filtering functionality', () => {
        test('should filter rows by value', () => {
            tableManager.currentValueFilters[1] = 'Active';
            tableManager.applyFilters();

            expect(tableManager.filteredRows.length).toBe(2);
            expect(tableManager.filteredRows.every(row =>
                row.cells[1].textContent === 'Active'
            )).toBe(true);
        });

        test('should filter rows by date range', () => {
            tableManager.currentDateRangeFilters[2] = {
                from: '2025-04-01',
                to: '2025-04-30'
            };

            tableManager.applyFilters();

            expect(tableManager.filteredRows.length).toBe(2);

            const filteredDates = tableManager.filteredRows.map(row =>
                row.cells[2].textContent
            );

            expect(filteredDates).toContain('15/04/2025');
            expect(filteredDates).toContain('30/04/2025');
            expect(filteredDates).not.toContain('05/05/2025');
            expect(filteredDates).not.toContain('20/03/2025');
        });

        test('should combine multiple filters', () => {
            tableManager.currentValueFilters[1] = 'Active';
            tableManager.currentDateRangeFilters[2] = {
                from: '2025-04-01',
                to: '2025-05-31'
            };

            tableManager.applyFilters();

            expect(tableManager.filteredRows.length).toBe(1);

            const filteredRow = tableManager.filteredRows[0];
            expect(filteredRow.cells[1].textContent).toBe('Active');
            expect(filteredRow.cells[2].textContent).toBe('15/04/2025');
        });

        test('should reset filters when values are empty', () => {
            tableManager.currentValueFilters[1] = 'Active';
            tableManager.applyFilters();
            expect(tableManager.filteredRows.length).toBe(2);

            tableManager.currentValueFilters[1] = '';
            tableManager.applyFilters();

            expect(tableManager.filteredRows.length).toBe(5);
        });
    });
});