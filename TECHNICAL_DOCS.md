# LiteTable - Technical Documentation

This document provides detailed technical information about the LiteTable library implementation, internal architecture, and API.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Main Components](#main-components)
3. [Core Functions](#core-functions)
4. [Data Flow](#data-flow)
5. [Class: LiteTableManager](#class-litetablemanager)
6. [API Reference](#api-reference)
7. [Utility Functions](#utility-functions)
8. [DOM Manipulation](#dom-manipulation)
9. [Performance Considerations](#performance-considerations)
10. [Known Limitations](#known-limitations)

## Architecture Overview

LiteTable is designed as a lightweight manager for HTML tables that adds dynamic sorting, filtering, and pagination without requiring complex dependencies or changes to the existing HTML structure. The library consists of:

- A main `LiteTableManager` class that handles all the table functionality
- Utility functions for date handling and filtering
- DOM manipulations to add controls and manage table content

The library follows these architectural principles:

1. **Non-invasive**: Works with existing HTML table structures
2. **Performance-focused**: Uses row pooling for DOM operations
3. **Self-contained**: No external dependencies
4. **Progressive enhancement**: Adds functionality on top of standard HTML

## Main Components

### 1. Table Container Structure

LiteTable expects the following structure:

```html
<div class="lite-datatable">
    <div class="lite-datatable-filters"></div>
    <div class="lite-datatable-container">
        <table>...</table>
    </div>
    <div class="lite-datatable-footer">
        <div class="tableInfo"></div>
    </div>
</div>
```

### 2. Core Components

- **LiteTableManager**: Main class managing all the functionality
- **Date utilities**: Functions to handle date parsing and comparisons
- **Filter Controls**: Dynamically created filter UI elements
- **Pagination**: Navigation controls for paging through large datasets
- **Row Cache**: System to minimize DOM operations

## Core Functions

### Date Handling

- **isDateInRange**: Checks if a date string (DD/MM/YYYY) falls within a specific time range
- **parseDate**: Converts a DD/MM/YYYY string to a JavaScript Date object

### Data Management

- **Row caching**: The library creates and maintains a cache of all rows to avoid unnecessary DOM operations
- **Row pooling**: DOM elements are reused when possible to improve performance
- **Data filtering**: Filtering is performed on the cached data before updating the DOM

## Data Flow

1. **Initialization**:
   - Read all rows from the table
   - Create a cache of all row data
   - Initialize filtering and sorting controls
   - Set up event listeners

2. **User Interaction**:
   - User applies filters or sorts
   - Data is filtered/sorted in memory
   - Only visible rows are rendered to the DOM
   - Pagination is updated based on filtered data

3. **Cleanup**:
   - The `destroy()` method removes all added elements and listeners

## Class: LiteTableManager

### Constructor

```javascript
constructor(tableContainer)
```

Initializes a new instance of LiteTableManager for the provided table container.

**Parameters**:
- `tableContainer`: HTMLElement - The container with the 'lite-datatable' class

**Creates**:
- Row cache
- Filter controls
- Display limit selector
- Pagination controls

### Properties

- `container`: The table container element
- `table`: The actual HTML table element
- `tbody`: The table body element
- `displayLimit`: Number of rows to display per page (default: 25)
- `currentPageIndex`: Current page number (1-based)
- `allRows`: Array of all original table rows
- `rowsCache`: Cached data from all rows
- `filteredRows`: Rows that match the current filters
- `currentDateFilters`: Current date filters applied
- `currentValueFilters`: Current value filters applied
- `currentDateRangeFilters`: Current date range filters applied
- `currentSort`: Current column index and direction for sorting

### Public Methods

#### updateTable()

Refreshes the table display based on current filters, sorting, and pagination.

#### destroy()

Cleans up by removing all created elements and event listeners.

### Private Methods

#### getElementAttributes(element)

Extracts attributes from a DOM element for caching.

#### initPagination()

Creates pagination controls in the footer.

#### initDisplayLimit()

Creates the "Show X entries" dropdown control.

#### initColumnsFilters()

Creates column header buttons for sorting.

#### initGlobalFiltersButtons()

Generates filter controls for all columns marked with appropriate classes.

#### createDateRangeDropdown(th, filterContainer, colIndex)

Creates a date range filter with from/to inputs.

#### createDateDropdown(th, filterContainer, colIndex)

Creates a dropdown filter for date columns with options like "Today", "This week", etc.

#### createValueDropdown(th, filterContainer, colIndex)

Creates a dropdown filter with unique values from the column.

#### updatePagination()

Updates the pagination controls based on the number of filtered items.

#### applyFilters()

Applies all active filters to the row cache.

#### handleSort(columnIndex)

Handles click events on column headers for sorting.

#### sortRows(columnIndex, direction)

Sorts rows based on column type (text, number, date).

#### getActualColumnCount()

Returns the number of columns in the table.

## API Reference

### Exported Functions

#### initTables()

```javascript
function initTables()
```

Initializes all elements with the `lite-datatable` class on the page.

#### LiteTableManager

```javascript
export class LiteTableManager
```

The main class for managing table functionality. See the Class section above for details.

### Event Handling

The library sets up several event listeners:

- **Column header clicks**: For sorting
- **Filter changes**: For applying filters
- **Display limit changes**: For changing the number of rows per page
- **Pagination clicks**: For changing pages

## Utility Functions

### isDateInRange(dateStr, range)

Checks if a date is within a specific time range.

**Parameters**:
- `dateStr`: String in DD/MM/YYYY format
- `range`: One of 'today', 'week', 'month', 'quarter', 'year'

**Returns**: Boolean - true if the date is in the range

### parseDate(dateStr)

Parses a date string in DD/MM/YYYY format.

**Parameters**:
- `dateStr`: String in DD/MM/YYYY format

**Returns**: Date object

## DOM Manipulation

### Row Pooling

To minimize DOM operations, the library implements a row pooling technique:

1. When rows are removed from view, they are added to a pool
2. When new rows need to be displayed, rows from the pool are reused
3. Only when the pool is empty are new DOM elements created

This approach significantly improves performance, especially for large tables.

### Filter Controls

Filter controls are dynamically created based on column content:

- Text columns get a dropdown with unique values
- Date columns get predefined time ranges
- Date-range columns get from/to date inputs

## Performance Considerations

### Memory Usage

The library maintains a full cache of the table data in memory, which provides better performance but uses more memory. For very large tables (10,000+ rows), this can be a consideration.

### DOM Operations

DOM operations are minimized through:
1. Row pooling
2. Batch updates
3. Limited rendering (only visible rows)

## Known Limitations

1. **Date Format**: Only supports DD/MM/YYYY date format
2. **Locale Support**: Sorting uses 'fr' locale for string comparisons
3. **Column Types**: Automatic detection may not work for all edge cases
4. **Nested Tables**: Not supported within the same container
5. **Memory Usage**: For very large tables, memory usage can be high due to row caching

### Not for Very Large Tables

LiteTable is optimized for small to medium-sized tables. While it employs row pooling and other techniques to minimize DOM operations, it is not designed to handle extremely large datasets (e.g., tables with tens of thousands of rows) efficiently. For such use cases, consider alternative solutions specifically designed for handling large amounts of data.
