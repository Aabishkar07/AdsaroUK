#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to update all data-table components with responsive design
 * This script adds responsive table imports and updates table rendering
 */

const fs = require('fs');
const path = require('path');

// Import statements to add
const RESPONSIVE_IMPORTS = `import {
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
} from "@/components/ui/responsive-table";`;

// Function to update a single data-table file
function updateDataTableFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already updated
    if (content.includes('ResponsiveTableWrapper')) {
      console.log(`✅ ${filePath} - Already updated`);
      return;
    }

    // Add responsive imports after existing table imports
    const tableImportRegex = /import\s*{\s*Table[^}]*}\s*from\s*"@\/components\/ui\/table";/;
    if (tableImportRegex.test(content)) {
      content = content.replace(
        tableImportRegex,
        `$&\n${RESPONSIVE_IMPORTS}`
      );
    } else {
      console.log(`⚠️  ${filePath} - No table imports found, skipping`);
      return;
    }

    // Update table rendering - find the table wrapper div
    const tableWrapperRegex = /<div[^>]*className="[^"]*border[^"]*rounded[^"]*"[^>]*>\s*<Table>/;
    if (tableWrapperRegex.test(content)) {
      content = content.replace(
        tableWrapperRegex,
        `<ResponsiveTableWrapper>
        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-md">
          <ResponsiveTable>`
      );

      // Close the responsive wrapper
      content = content.replace(
        /<\/Table>\s*<\/div>/,
        `</ResponsiveTable>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {table.getRowModel().rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data
            </div>
          ) : (
            table.getRowModel().rows.map((row) => (
              <MobileCard key={row.id}>
                <MobileCardHeader>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.name || row.original.id || 'Item'}</span>
                  </div>
                  <ResponsiveActions>
                    {/* Add action buttons here */}
                  </ResponsiveActions>
                </MobileCardHeader>
                <MobileCardContent>
                  {/* Add mobile card fields here based on your data structure */}
                </MobileCardContent>
              </MobileCard>
            ))
          )}
        </div>
      </ResponsiveTableWrapper>`
      );
    }

    // Update pagination
    const paginationRegex = /<div[^>]*className="[^"]*flex[^"]*items-center[^"]*space-x-2[^"]*px-4[^"]*py-3[^"]*"[^>]*>[\s\S]*?<\/div>/;
    if (paginationRegex.test(content)) {
      content = content.replace(
        paginationRegex,
        `<ResponsivePagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        onPrevious={() => table.previousPage()}
        onNext={() => table.nextPage()}
        canPrevious={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
      />`
      );
    }

    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} - Updated successfully`);
    
  } catch (error) {
    console.error(`❌ ${filePath} - Error:`, error.message);
  }
}

// Function to find all data-table files
function findDataTableFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item === 'data-table.tsx') {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, '..');
  const dataTableFiles = findDataTableFiles(srcDir);
  
  console.log(`Found ${dataTableFiles.length} data-table files:`);
  dataTableFiles.forEach(file => console.log(`  - ${file}`));
  console.log('\nUpdating files...\n');
  
  dataTableFiles.forEach(updateDataTableFile);
  
  console.log('\n✅ All data-table files updated!');
}

if (require.main === module) {
  main();
}

module.exports = { updateDataTableFile, findDataTableFiles };