/**
 * MIT License
 *
 * Copyright (c) 2025 Mathis Emaille
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 *! For any table style modifications, please consult the table.css file.
 *! This file should only be modified for adding new features or fixing bugs.
*/

function getTextContent(element) {
    if (!element) return '';
    return element.textContent || element.innerText || '';
}

/**
 * Checks if a date is within a given time range
 * @param {string} dateStr - Date in "DD/MM/YYYY" format
 * @param {('today'|'week'|'month'|'quarter'|'year')} range - Time range to check
 * @returns {boolean} True if the date is in the range, false otherwise
 * @throws {Error} If the date format is invalid
 */
function isDateInRange(dateStr, range) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        throw new Error('Invalid date format. Use DD/MM/YYYY');
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
        case 'today':
            return date.getTime() === today.getTime();
        case 'week': {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return date >= startOfWeek && date <= endOfWeek;
        }
        case 'month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return date >= startOfMonth && date <= endOfMonth;
        }
        case 'quarter': {
            const currentQuarter = Math.floor(today.getMonth() / 3);
            const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
            const endOfQuarter = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
            return date >= startOfQuarter && date <= endOfQuarter;
        }
        case 'year': {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const endOfYear = new Date(today.getFullYear(), 11, 31);
            return date >= startOfYear && date <= endOfYear;
        }
        default:
            return true;
    }
}

/**
 * Parses a date string in 'DD/MM/YYYY' format and returns a Date object.
 *
 * @param {string} dateStr - The date string to parse.
 * @returns {Date} - The corresponding Date object.
 */
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Table manager with sorting, filtering, and pagination features
 */
class LiteTableManager {
    /**
     * Creates a LiteTableManager instance
     * @param {HTMLElement} tableContainer - Table container with the 'lite-datatable' class
     * @throws {Error} If the container or table is missing
     */
    constructor(tableContainer) {
        if (!tableContainer)
            throw new Error('Table container is required');

        if (tableContainer._tableManager)
            tableContainer._tableManager.destroy();

        if (!tableContainer.querySelector('table'))
            throw new Error('No table found in container');

        this.container = tableContainer;
        this.table = tableContainer.querySelector('table');
        this.tbody = this.table.querySelector('tbody');
        this.displayLimit = 25;
        this.currentPageIndex = 1;

        const isTestEnvironment = typeof process !== 'undefined' &&
            process.env.NODE_ENV === 'test' ||
            typeof window === 'undefined';

        this.allRows = Array.from(this.tbody.querySelectorAll('tr')).map((row, index) => {
            row.setAttribute('data-original-index', index);
            return row;
        });

        this.currentDateFilters = {};
        this.currentValueFilters = {};
        this.currentDateRangeFilters = {};

        this.currentSort = {
            column: null,
            direction: null
        };

        this.columnCount = this.getActualColumnCount();
        this.rowsCache = this.allRows.map(row => ({
            originalIndex: parseInt(row.getAttribute('data-original-index')),
            element: row.cloneNode(true),
            cells: Array.from(row.cells).map(cell => ({
                innerHTML: cell.innerHTML,
                textContent: getTextContent(cell).trim(),
                title: cell.getAttribute('title') || '',
                attributes: this.getElementAttributes(cell)
            }))
        }));

        this.filteredRows = [...this.rowsCache];
        this.rowPool = [];
        this.tbody.innerHTML = '';

        if (!isTestEnvironment) {
            this.initGlobalFiltersButtons();
            this.initColumnsFilters();
            this.initDisplayLimit();
            this.initPagination();
        }

        if (this.currentSort.column === null) {
            const headerCells = Array.from(this.table.querySelectorAll('thead tr:last-child th'));
            for (let colIndex = 2; colIndex < headerCells.length; colIndex++) {
                for (const rowData of this.rowsCache) {
                    const cellVal = rowData.cells[colIndex]?.textContent.replace(/<[^>]*>/g, '').trim();
                    if (cellVal && /^\d{2}\/\d{2}\/\d{4}$/.test(cellVal)) {
                        this.currentSort = { column: colIndex, direction: 'desc' };
                        const sortButtons = this.table.querySelectorAll('thead tr:last-child th button');
                        if (sortButtons[colIndex - 1]) {
                            sortButtons[colIndex - 1].classList.add('desc');
                        }
                        break;
                    }
                }
                if (this.currentSort.column !== null) break;
            }
        }

        this.updateTable();
        this.container._tableManager = this;
    }

    /** @private */
    getElementAttributes(element) {
        const attributes = {};
        Array.from(element.attributes).forEach(attr => {
            if (attr.name !== 'style') {
                attributes[attr.name] = attr.value;
            }
        });
        return attributes;
    }

    /** @private */
    initPagination() {
        const footer = this.container.querySelector('.lite-datatable-footer');
        if (!footer) return;

        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'lite-datatable-pagination';
        footer.appendChild(paginationDiv);

        this.updatePagination();
    }

    /** @private */
    initDisplayLimit() {
        if (!this.container.querySelector('.displayLimit')) {
            const displayLimitWrapper = document.createElement('div');
            displayLimitWrapper.className = 'lite-datatable-display-limit';
            const displayLimitLabel = document.createElement('label');
            displayLimitLabel.textContent = 'Show';
            const displayLimitSelect = document.createElement('select');
            displayLimitSelect.className = 'displayLimit';
            const filterContainer = this.container.querySelector('.lite-datatable-filters');
            if (!filterContainer) return;

            const displayLimitOptions = [
                { value: '10', text: '10' },
                { value: '25', text: '25', selected: true },
                { value: '50', text: '50' },
                { value: '100', text: '100' }
            ];

            displayLimitOptions.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                if (option.selected) {
                    opt.selected = true;
                }
                displayLimitSelect.appendChild(opt);
            });

            displayLimitWrapper.appendChild(displayLimitLabel);
            displayLimitWrapper.appendChild(displayLimitSelect);
            filterContainer.appendChild(displayLimitWrapper);
        }

        const limitSelect = this.container.querySelector('.displayLimit');
        limitSelect?.addEventListener('change', (e) => {
            this.displayLimit = e.target.value === 'all' ? Infinity : parseInt(e.target.value);
            this.updateTable();
        });
    }

    /** @private */
    initColumnsFilters() {
        const headerCells = this.table.querySelectorAll('thead tr:last-child th');
        headerCells.forEach((th, index) => {
            if (index === 0) {
                return;
            }
            const button = document.createElement('button');
            button.className = 'sort-button';
            button.innerHTML = th.innerHTML;
            button.addEventListener('click', () => this.handleSort(index));
            th.innerHTML = '';
            th.appendChild(button);
        });
    }

    /** @private */
    initGlobalFiltersButtons() {
        const filterContainer = this.container.querySelector('.lite-datatable-filters');
        if (!filterContainer) return;

        const headerCells = this.table.querySelectorAll('thead tr:last-child th');
        headerCells.forEach((th, colIndex) => {
            if (th.classList.contains('date-range')) {
                this.createDateRangeDropdown(th, filterContainer, colIndex);
                return;
            }
            if (!th.classList.contains('filtered')) return;

            const firstNonEmptyCell = this.allRows.find(row => {
                const cell = row.cells[colIndex];
                return cell && getTextContent(cell).trim();
            });

            let dataType = 'text';
            if (firstNonEmptyCell) {
                const sampleVal = getTextContent(firstNonEmptyCell.cells[colIndex]).trim();
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(sampleVal)) dataType = 'date';
                else if (!isNaN(sampleVal.replace(',', '.'))) dataType = 'number';
            }

            if (dataType === 'date') {
                this.createDateDropdown(th, filterContainer, colIndex);
            } else {
                this.createValueDropdown(th, filterContainer, colIndex);
            }
        });
    }

    /** @private */
    createDateRangeDropdown(th, filterContainer, colIndex) {
        const wrapper = document.createElement('div');
        wrapper.className = 'lite-datatable-filter';
        const label = document.createElement('label');
        label.innerHTML = `${th.innerText} <span style="font-weight: lighter;">(from / to)</span>`;
        const fromInput = document.createElement('input');
        fromInput.type = 'date';
        fromInput.placeholder = 'From';
        const toInput = document.createElement('input');
        toInput.type = 'date';
        toInput.placeholder = 'To';

        const updateRange = () => {
            this.currentDateRangeFilters[colIndex] = {
                from: fromInput.value || null,
                to: toInput.value || null
            };
            this.updateTable();
        };

        fromInput.addEventListener('change', updateRange);
        toInput.addEventListener('change', updateRange);

        wrapper.appendChild(label);
        wrapper.appendChild(fromInput);
        wrapper.appendChild(toInput);
        filterContainer.appendChild(wrapper);
    }

    /** @private */
    createDateDropdown(th, filterContainer, colIndex) {
        const wrapper = document.createElement('div');
        wrapper.className = 'lite-datatable-filter';
        const label = document.createElement('label');
        label.textContent = th.innerText;
        const select = document.createElement('select');

        const options = [
            { value: '', text: 'All dates' },
            { value: 'today', text: 'Today' },
            { value: 'week', text: 'This week' },
            { value: 'month', text: 'This month' },
            { value: 'quarter', text: 'This quarter' },
            { value: 'year', text: 'This year' }
        ];
        options.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.text;
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            const filterVal = select.value;
            this.currentDateFilters[colIndex] = filterVal;
            this.updateTable();
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        filterContainer.appendChild(wrapper);
    }

    /** @private */
    createValueDropdown(th, filterContainer, colIndex) {
        const uniqueVals = new Set();
        this.allRows.forEach(row => {
            if (row.cells[colIndex]) {
                const cellVal = getTextContent(row.cells[colIndex]).trim();
                if (cellVal) uniqueVals.add(cellVal);
            }
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'lite-datatable-filter';
        const label = document.createElement('label');
        label.textContent = th.innerText;
        const select = document.createElement('select');

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All';
        select.appendChild(defaultOption);

        [...uniqueVals].sort().forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            const filterVal = select.value;
            this.currentValueFilters[colIndex] = filterVal;
            this.updatePagination();
            this.updateTable();
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        filterContainer.appendChild(wrapper);
    }

    /** @private */
    updatePagination() {
        const paginationDiv = this.container.querySelector('.lite-datatable-pagination');
        if (!paginationDiv) return;

        const createButton = (text, pageIndex, isDisabled = false) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.disabled = isDisabled;
            if (!isDisabled) {
                button.addEventListener('click', () => {
                    this.currentPageIndex = pageIndex;
                    this.updateTable();
                });
            }
            return button;
        };

        const totalPages = Math.ceil(this.filteredRows.length / this.displayLimit);
        const prevDisabled = this.currentPageIndex <= 2;
        const nextDisabled = this.currentPageIndex + 2 > totalPages;

        paginationDiv.innerHTML = '';
        paginationDiv.appendChild(createButton('<<', 1, prevDisabled));

        for (let i = -1; i < 2; i++) {
            const pageNum = this.currentPageIndex + i;
            if (pageNum <= 0) continue;
            if (pageNum > totalPages) continue;
            const button = createButton(pageNum.toString(), pageNum, false);
            if (pageNum === this.currentPageIndex) button.classList.add('active');
            paginationDiv.appendChild(button);
        }

        paginationDiv.appendChild(createButton('>>', totalPages, nextDisabled));
    }

    /** @private */
    updateTable() {
        if (this.currentSort.column !== null && this.currentSort.direction) {
            this.sortRows(this.currentSort.column, this.currentSort.direction);
        }

        this.applyFilters();
        const totalPages = Math.ceil(this.filteredRows.length / this.displayLimit);
        if (this.currentPageIndex > totalPages) {
            this.currentPageIndex = 1;
        }

        const minIndex = this.displayLimit * (this.currentPageIndex - 1);
        const maxIndex = Math.min(
            this.displayLimit * this.currentPageIndex,
            this.filteredRows.length
        );

        while (this.tbody.firstChild) {
            this.rowPool.push(this.tbody.firstChild);
            this.tbody.removeChild(this.tbody.firstChild);
        }

        for (let i = minIndex; i < maxIndex; i++) {
            const rowData = this.filteredRows[i];
            let tr;

            if (this.rowPool.length > 0) {
                tr = this.rowPool.pop();
                for (let j = 0; j < rowData.cells.length; j++) {
                    if (tr.cells[j]) {
                        tr.cells[j].innerHTML = rowData.cells[j].innerHTML;

                        if (rowData.cells[j].title) {
                            tr.cells[j].setAttribute('title', rowData.cells[j].title);
                        } else {
                            tr.cells[j].removeAttribute('title');
                        }

                        for (const [attrName, attrValue] of Object.entries(rowData.cells[j].attributes)) {
                            if (attrName !== 'innerHTML') {
                                tr.cells[j].setAttribute(attrName, attrValue);
                            }
                        }
                    }
                }
            } else {
                tr = rowData.element.cloneNode(true);
            }

            tr.setAttribute('data-original-index', rowData.originalIndex);
            this.tbody.appendChild(tr);
        }

        const total = this.rowsCache.length;
        const filteredTotal = this.filteredRows.length;
        const showing = maxIndex - minIndex;
        this.container.querySelector('.tableInfo').textContent = `Showing ${showing} items out of ${filteredTotal} (total: ${total})`;


        this.updatePagination();
    }

    /** @private */
    applyFilters() {
        this.filteredRows = this.rowsCache.filter(rowData => {
            for (const [colIndex, filterVal] of Object.entries(this.currentDateFilters)) {
                if (!filterVal) continue;
                const cellVal = rowData.cells[colIndex]?.textContent || '';
                if (!isDateInRange(cellVal, filterVal)) return false;
            }
            for (const [colIndex, range] of Object.entries(this.currentDateRangeFilters)) {
                if ((!range.from) && (!range.to)) continue;
                const cellVal = rowData.cells[colIndex]?.textContent || '';
                if (!/^\d{2}\/\d{2}\/\d{4}$/.test(cellVal)) return false;
                const cellDate = parseDate(cellVal);
                if (range.from) {
                    const fromDate = new Date(range.from);
                    fromDate.setHours(0, 0, 0, 0);
                    if (cellDate < fromDate) return false;
                }
                if (range.to) {
                    const toDate = new Date(range.to);
                    toDate.setHours(0, 0, 0, 0);
                    if (cellDate > toDate) return false;
                }
            }
            for (const [colIndex, filterVal] of Object.entries(this.currentValueFilters)) {
                if (!filterVal) continue;
                const cellVal = rowData.cells[colIndex]?.textContent || '';
                if (cellVal !== filterVal) return false;
            }
            return true;
        });
    }

    /** @private */
    handleSort(columnIndex) {
        const button = this.table.querySelectorAll('thead tr:last-child th button')[columnIndex - 1];

        if (!button) {
            let direction = 'asc';
            if (this.currentSort.column === columnIndex) {
                if (this.currentSort.direction === 'asc') {
                    direction = 'desc';
                } else if (this.currentSort.direction === 'desc') {
                    direction = null;
                }
            }

            this.currentSort = {
                column: direction ? columnIndex : null,
                direction: direction
            };

            if (!direction) {
                this.rowsCache.sort((a, b) => a.originalIndex - b.originalIndex);
            }

            this.updateTable();
            return;
        }

        this.table.querySelectorAll('.sort-button').forEach(btn => {
            if (btn !== button) {
                btn.classList.remove('asc', 'desc');
            }
        });

        let direction = 'asc';
        if (this.currentSort.column === columnIndex) {
            if (this.currentSort.direction === 'asc') {
                direction = 'desc';
            } else if (this.currentSort.direction === 'desc') {
                direction = null;
            }
        }

        this.currentSort = {
            column: direction ? columnIndex : null,
            direction: direction
        };

        button.classList.remove('asc', 'desc');
        if (direction) {
            button.classList.add(direction);
        }
        if (!direction) {
            this.rowsCache.sort((a, b) => a.originalIndex - b.originalIndex);
        }

        this.updateTable();
    }

    /** @private */
    sortRows(columnIndex, direction) {
        const multiplier = direction === 'asc' ? 1 : -1;

        let columnType = 'text';
        const sampleValue = this.rowsCache.find(r => r.cells[columnIndex])
            ?.cells[columnIndex].textContent;

        if (sampleValue) {
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(sampleValue)) {
                columnType = 'date';
            } else if (!isNaN(sampleValue.replace(',', '.'))) {
                columnType = 'number';
            }
        }

        this.rowsCache.sort((a, b) => {
            const aValue = a.cells[columnIndex]?.textContent || '';
            const bValue = b.cells[columnIndex]?.textContent || '';

            if (!aValue && !bValue) return 0;
            if (!aValue) return 1 * multiplier;
            if (!bValue) return -1 * multiplier;

            switch (columnType) {
                case 'date':
                    const aDate = parseDate(aValue);
                    const bDate = parseDate(bValue);
                    return (aDate - bDate) * multiplier;
                case 'number':
                    const aNum = parseFloat(aValue.replace(',', '.'));
                    const bNum = parseFloat(bValue.replace(',', '.'));
                    return (aNum - bNum) * multiplier;
                default:
                    return aValue.localeCompare(bValue, 'fr', { sensitivity: 'base', numeric: true }) * multiplier;
            }
        });
    }

    /** @private */
    getActualColumnCount() {
        const lastHeaderRow = this.table.querySelector('thead tr:last-child');
        return lastHeaderRow ? lastHeaderRow.cells.length : 0;
    }

    /**
     * Destroys the LiteTableManager instance and cleans up resources
     */
    destroy() {
        if (!this.container) {
            Object.keys(this).forEach(key => {
                delete this[key];
            });
            return;
        }

        const paginationDiv = this.container.querySelector('.lite-datatable-pagination');
        if (paginationDiv) {
            paginationDiv.remove();
        }

        const displayLimitWrapper = this.container.querySelector('.lite-datatable-display-limit');
        if (displayLimitWrapper) {
            displayLimitWrapper.remove();
        }

        const headerCells = this.table.querySelectorAll('thead tr:last-child th');
        headerCells.forEach(th => {
            const button = th.querySelector('button.sort-button');
            if (button) {
                th.innerHTML = button.innerHTML;
            }
        });

        const filters = this.container.querySelectorAll('.lite-datatable-filter');
        filters.forEach(filter => filter.remove());

        this.allRows.sort((a, b) => {
            return parseInt(a.dataset.originalIndex) - parseInt(b.dataset.originalIndex);
        });
        this.allRows.forEach(row => {
            row.style.display = '';
            row.removeAttribute('data-current-id');
        });

        delete this.container._tableManager;

        Object.keys(this).forEach(key => {
            delete this[key];
        });

        this.rowPool = [];
        this.rowsCache = [];
    }
}

/**
 * Initializes all Table instances on the page
 */
function initTables() {
    document.querySelectorAll('.lite-datatable').forEach(container => {
        new LiteTableManager(container);
    });
}

export { LiteTableManager, initTables, isDateInRange, parseDate, getTextContent };
