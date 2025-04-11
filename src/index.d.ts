/**
 * Main class to manage table functionalities
 */
export class LiteTableManager {
    /**
     * Creates an instance of LiteTableManager
     * @param tableContainer - Table container with the class 'lite-datatable'
     */
    constructor(tableContainer: HTMLElement);

    /**
     * Refreshes the table display based on current filters, sorting, and pagination
     */
    updateTable(): void;

    /**
     * Cleans up the LiteTableManager instance and releases resources
     */
    destroy(): void;
}

/**
 * Initializes all Table instances on the page
 */
export function initTables(): void;