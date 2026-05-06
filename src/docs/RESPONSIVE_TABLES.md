# Responsive Tables Documentation

## Overview

This document explains how to use the responsive table system implemented across the application. The system provides a seamless experience across all screen sizes, automatically switching between desktop table view and mobile card view.

## Components

### Core Components

#### `ResponsiveTableWrapper`
The main wrapper component that handles the responsive behavior.

```tsx
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table";

<ResponsiveTableWrapper>
  {/* Your table content */}
</ResponsiveTableWrapper>
```

#### `ResponsiveTable`
Replaces the standard `Table` component for desktop view.

```tsx
<ResponsiveTable>
  <ResponsiveTableHeader>
    {/* Header content */}
  </ResponsiveTableHeader>
  <ResponsiveTableBody>
    {/* Body content */}
  </ResponsiveTableBody>
</ResponsiveTable>
```

#### `MobileCard`
Used for mobile card view representation of table rows.

```tsx
<MobileCard>
  <MobileCardHeader>
    {/* Card header with title and actions */}
  </MobileCardHeader>
  <MobileCardContent>
    {/* Card content with fields */}
  </MobileCardContent>
</MobileCard>
```

#### `MobileCardField`
Displays individual field data in mobile cards.

```tsx
<MobileCardField
  label="Field Label"
  value="Field Value"
/>
```

#### `ResponsivePagination`
Handles pagination across different screen sizes.

```tsx
<ResponsivePagination
  currentPage={1}
  totalPages={10}
  onPrevious={() => {}}
  onNext={() => {}}
  canPrevious={true}
  canNext={true}
/>
```

## Implementation Pattern

### 1. Import Required Components

```tsx
import {
  ResponsiveTableWrapper,
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableHead,
  MobileCard,
  MobileCardHeader,
  MobileCardContent,
  MobileCardField,
  ResponsivePagination,
  ResponsiveActions,
} from "@/components/ui/responsive-table";
```

### 2. Wrap Your Table

```tsx
<ResponsiveTableWrapper>
  {/* Desktop Table View */}
  <div className="hidden md:block border rounded-md">
    <ResponsiveTable>
      <ResponsiveTableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <ResponsiveTableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </ResponsiveTableHead>
            ))}
          </TableRow>
        ))}
      </ResponsiveTableHeader>
      <ResponsiveTableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <ResponsiveTableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </ResponsiveTableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <ResponsiveTableCell
              colSpan={columns.length}
              className="h-24 text-center"
            >
              No results.
            </ResponsiveTableCell>
          </TableRow>
        )}
      </ResponsiveTableBody>
    </ResponsiveTable>
  </div>

  {/* Mobile Card View */}
  <div className="md:hidden space-y-4">
    {table.getRowModel().rows?.length ? (
      table.getRowModel().rows.map((row) => (
        <MobileCard key={row.id}>
          <MobileCardHeader>
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.original.name}</span>
            </div>
            <ResponsiveActions>
              {/* Action buttons */}
            </ResponsiveActions>
          </MobileCardHeader>
          <MobileCardContent>
            <MobileCardField
              label="ID"
              value={row.original.id}
            />
            <MobileCardField
              label="Status"
              value={row.original.status}
            />
            {/* Add more fields as needed */}
          </MobileCardContent>
        </MobileCard>
      ))
    ) : (
      <div className="text-center py-8 text-muted-foreground">
        No results.
      </div>
    )}
  </div>
</ResponsiveTableWrapper>
```

### 3. Update Pagination

Replace your existing pagination with:

```tsx
<ResponsivePagination
  currentPage={table.getState().pagination.pageIndex + 1}
  totalPages={table.getPageCount()}
  onPrevious={() => table.previousPage()}
  onNext={() => table.nextPage()}
  canPrevious={table.getCanPreviousPage()}
  canNext={table.getCanNextPage()}
/>
```

## Responsive Behavior

### Desktop (md and above)
- Shows traditional table layout
- Full pagination controls
- Column visibility options
- Row selection checkboxes
- All table features available

### Mobile (below md)
- Shows card-based layout
- Simplified pagination (Previous/Next only)
- Essential information displayed
- Touch-friendly interface
- Condensed action buttons

## Breakpoints

- `md` (768px): Switch between mobile and desktop views
- `lg` (1024px): Show additional desktop features like row selection info
- `sm` (640px): Show/hide text in action buttons

## Customization

### Custom Mobile Card Fields

You can customize the mobile card fields based on your data structure:

```tsx
<MobileCardField
  label="Custom Label"
  value={
    <Badge variant="outline">
      {row.original.customField}
    </Badge>
  }
/>
```

### Custom Actions

Use `ResponsiveActions` to handle action buttons:

```tsx
<ResponsiveActions>
  <Button size="sm" onClick={() => handleEdit(row.original)}>
    Edit
  </Button>
  <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original)}>
    Delete
  </Button>
</ResponsiveActions>
```

## Migration Guide

To migrate existing tables to responsive tables:

1. **Add imports**: Import all responsive table components
2. **Wrap table**: Replace `<div className="border rounded-md">` with `<ResponsiveTableWrapper>`
3. **Update table components**: Replace `Table`, `TableHeader`, `TableBody`, etc. with responsive versions
4. **Add mobile view**: Add the mobile card view section
5. **Update pagination**: Replace pagination with `ResponsivePagination`

## Examples

### Basic Table
See `src/app/advertiser/app-lists/data-table.tsx` for a basic implementation.

### Complex Table with Actions
See `src/app/advertiser/campaign/data-table.tsx` for a more complex implementation with actions and status indicators.

### Main Data Table
See `src/components/data-table.tsx` for the main data table implementation with drag-and-drop functionality.

## Best Practices

1. **Keep mobile cards simple**: Only show essential information in mobile view
2. **Use appropriate field types**: Use badges, status indicators, and other visual elements appropriately
3. **Test on different screen sizes**: Always test your responsive tables on various devices
4. **Consistent styling**: Use the same styling patterns across all tables
5. **Accessibility**: Ensure all interactive elements are accessible on mobile devices

## Troubleshooting

### Common Issues

1. **Table not switching views**: Ensure you're using the correct breakpoint classes (`hidden md:block` and `md:hidden`)
2. **Mobile cards not showing**: Check that you have the mobile view section with proper conditional rendering
3. **Pagination not working**: Ensure you're passing the correct props to `ResponsivePagination`
4. **Styling issues**: Make sure you're using the responsive table components instead of standard table components

### Debug Tips

1. Use browser dev tools to test different screen sizes
2. Check console for any missing imports or component errors
3. Verify that all required props are passed to responsive components
4. Test both desktop and mobile views thoroughly