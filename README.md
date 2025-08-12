# LiteTable

A lightweight, flexible JavaScript table manager with sorting, filtering, and pagination capabilities.

## Why LiteTable?

I created this library to meet a specific need in my own projects: a simple way to add table functionality to existing HTML structures. LiteTable was born from a practical situation where I needed to enhance standard HTML tables (`<tr>`, `<td>`) without changing their basic structure.

The focus is on simplicity and ease of implementation - initialize with a function call, add a few classes to the columns you want to enhance, and you're set. It's designed to work alongside your existing code with minimal changes required.

## Features

- 🔍 Dynamic filtering
- ↕️ Column sorting
- 📄 Pagination
- 📊 Display limit selection
- 📅 Date range filtering
- 🎯 Value filtering
- 🚀 No dependencies

## Installation

```bash
npm install lite-table
```

## Basic Usage

```html
<div class="lite-table">
    <div class="lite-table-filters"></div>
    <div class="lite-table-container">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th class="filtered">Date</th>
                    <th class="filtered">Status</th>
                    <th class="date-range">Creation Date</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <!-- Your table content -->
            </tbody>
        </table>
    </div>
    <div class="lite-table-footer">
        <div class="tableInfo"></div>
    </div>
</div>

<script>
    import { initTables, LiteTableManager } from 'lite-table';

    // Initialize all tables
    initTables();

    // Or initialize a specific table
    const container = document.querySelector('#myTable');
    new LiteTableManager(container);
</script>
```

## Configuration

### HTML Structure

- Add `lite-table` class to your table container
- Add `filtered` class to columns that need filter dropdowns
- Add `date-range` class for columns that need date range pickers (from/to)
- Include `lite-table-filters` div for filter controls
- Include `lite-table-container` div for better table scrolling
- Include `lite-table-footer` div with `tableInfo` div for pagination

### Supported Column Types

LiteTable automatically detects and handles different data types:

- **Dates**: Format DD/MM/YYYY (European format, e.g., 31/12/2023)
- **Numbers**: Integer or decimal (using dot or comma)
- **Text**: Any other content

## API Reference

### LiteTableManager

```javascript
const table = new LiteTableManager(container);
```

#### Parameters:

- `container` (HTMLElement): The table container element with 'lite-table' class

### Methods

- `updateTable()`: Refreshes the table display
- `destroy()`: Cleans up and removes all event listeners

## Styling

### Default Style

LiteTable comes with a default CSS template that you can import:

```css
@import 'lite-table/dist/style.css';
```

### Custom Styling

If you prefer to create your own styles, here are the main CSS classes to target:

```css
/* Main container */
.lite-table { }
.lite-table-container { }

/* Filter section */
.lite-table-filters { }
.lite-table-filter { }
.lite-filter { }

/* Table controls */
.lite-table-display-limit { }
.lite-table-pagination { }
.page-number { }
.page-number.active { }

/* Sorting */
.sort-button { }
.sort-button.asc { }
.sort-button.desc { }

/* Footer */
.lite-table-footer { }
.tableInfo { }
```

## Filter Types

### Value Filters

Add the `filtered` class to columns that should have a dropdown with unique values.

### Date Filters

Date columns with the `filtered` class will show filter options like "Today", "This week", etc.

### Date Range Filters

Add the `date-range` class to date columns that need "from" and "to" date inputs.

## Technical Documentation

For detailed information about the implementation, internal architecture, and API details, please refer to the [Technical Documentation](./TECHNICAL_DOCS.md).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Made with ❤️ by Mathis Emaille

*If you find this library useful, consider giving it a star on GitHub!* ⭐
