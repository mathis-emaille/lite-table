const { LiteTableManager } = require('../src/LiteTable');

describe('LiteTableManager', () => {
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
              <th class="filtered">Name</th>
              <th class="filtered">Date</th>
              <th class="date-range">Created At</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>John Doe</td>
              <td>15/04/2025</td>
              <td>01/01/2025</td>
              <td>100</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Jane Smith</td>
              <td>20/03/2025</td>
              <td>15/02/2025</td>
              <td>250</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Bob Johnson</td>
              <td>05/05/2025</td>
              <td>10/03/2025</td>
              <td>75,5</td>
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
    });

    afterEach(() => {
        if (tableManager) {
            tableManager.destroy();
        }
        document.body.removeChild(container);
        container = null;
        tableManager = null;
    });

    test('should initialize correctly with valid container', () => {
        expect(() => {
            tableManager = new LiteTableManager(container);
        }).not.toThrow();

        expect(tableManager).toBeInstanceOf(LiteTableManager);
        expect(tableManager.container).toBe(container);
        expect(tableManager.table).toBe(container.querySelector('table'));
    });

    test('should throw error when container is missing', () => {
        expect(() => {
            new LiteTableManager(null);
        }).toThrow('Table container is required');
    });

    test('should throw error when table is missing', () => {
        const emptyContainer = document.createElement('div');
        emptyContainer.className = 'lite-datatable';

        expect(() => {
            new LiteTableManager(emptyContainer);
        }).toThrow('No table found in container');
    });

    test('should initialize with correct number of rows', () => {
        tableManager = new LiteTableManager(container);
        expect(tableManager.rowsCache.length).toBe(3);
    });

    test('should destroy correctly and clean up resources', () => {
        tableManager = new LiteTableManager(container);
        tableManager.destroy();

        expect(container.querySelector('.lite-datatable-pagination')).toBeNull();
        expect(container.querySelector('.sort-button')).toBeNull();
        expect(container._tableManager).toBeUndefined();
    });

    test('should handle multiple initializations on same container', () => {
        const firstManager = new LiteTableManager(container);
        const secondManager = new LiteTableManager(container);

        expect(container._tableManager).toBe(secondManager);
        expect(container._tableManager).not.toBe(firstManager);
    });
});