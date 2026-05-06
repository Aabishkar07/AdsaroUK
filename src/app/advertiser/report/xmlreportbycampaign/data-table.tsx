"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ArrowUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,

} from "@/components/ui/table"
import axios from "axios"
import { useAuth } from "@/context/context"

interface AdvertiserReportData {
  date?: string;
  campaign_id?: string;
  campaign_name?: string;
  adv_responses: number;
  adv_impressions: number;
  adv_clicks: number;
  adv_cost: number;
  adv_cpc: number;
  adv_cpa: number;
  adv_position_avg: number;
  adv_conv_rate: number;
  adv_newvisits: number;
  adv_ctr: number;
}

export const columns: ColumnDef<AdvertiserReportData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("date")}</div>,
  },

  {
    accessorKey: "adv_responses",
    header: () => <div>Ad Responses</div>,
    cell: ({ row }) => {
      const impressions = row.getValue("adv_responses")
      return <div className="text-left font-medium">{impressions?.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "adv_impressions",
    header: () => <div>Impressions</div>,
    cell: ({ row }) => {
      const impressions = row.getValue("adv_impressions")
      return <div className=" font-medium">{impressions?.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "adv_clicks",
    header: () => <div>Clicks</div>,
    cell: ({ row }) => {
      const clicks = row.getValue("adv_clicks")
      return <div className="font-medium">{clicks?.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "adv_cost",
    header: () => <div>Cost</div>,
    cell: ({ row }) => {
      const costs = parseFloat(row.getValue("adv_cost"))
      return (
        <div className=" font-medium">
          ${costs?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "adv_cpc",
    header: () => <div>Advertiser CPC</div>,
    cell: ({ row }) => {
      const cpc = parseFloat(row.getValue("adv_cpc"))
      return (
        <div className="font-medium">
          ${cpc?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      )
    },
  },



  {
    accessorKey: "adv_cpa",
    header: () => <div>CPA</div>,
    cell: ({ row }) => {
      const cpa = parseFloat(row.getValue("adv_cpa"))
      return (
        <div className="font-medium">
          ${cpa?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      )
    },
  },


  {
    accessorKey: "adv_position_avg",
    header: () => <div>Position</div>,
    cell: ({ row }) => {
      const position = parseFloat(row.getValue("adv_position_avg"))
      return (
        <div className="font-medium">
          {position?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      )
    },
  },








  {
    accessorKey: "adv_conv_rate",
    header: () => <div>CR</div>,
    cell: ({ row }) => {
      const ctr = parseFloat(row.getValue("adv_conv_rate"))
      return (
        <div className="font-medium">
          {ctr?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}%
        </div>
      )
    },
  },

  {
    accessorKey: "adv_newvisits",
    header: () => <div>New Visits</div>,
    cell: ({ row }) => {
      const ctr = parseFloat(row.getValue("adv_newvisits"))
      return (
        <div className="font-medium">
          {ctr?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}%
        </div>
      )
    },
  },


  {
    accessorKey: "adv_ctr",
    header: () => <div>CTR</div>,
    cell: ({ row }) => {
      const ctr = parseFloat(row.getValue("adv_ctr"))
      return (
        <div className="font-medium">
          {ctr?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}%
        </div>
      )
    },
  },



]

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [data, setData] = React.useState<AdvertiserReportData[]>([])
  const [fromDate, setFromDate] = React.useState("")
  const [toDate, setToDate] = React.useState("")
  const [activeRange, setActiveRange] = React.useState('Today')
  const [isLoading, setIsLoading] = React.useState(false)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const router = useRouter()
  const auth = useAuth()
  const mytoken = auth?.token

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleDateRangeChange = (range: string) => {
    setActiveRange(range)
    const today = new Date()
    let startDate = ''
    let endDate = today.toISOString().split('T')[0]

    switch (range) {
      case 'Today':
        startDate = endDate
        break
      case 'Yesterday':
        today.setDate(today.getDate() - 1)
        startDate = today.toISOString().split('T')[0]
        break
      case 'Last 3 days':
        today.setDate(today.getDate() - 3)
        startDate = today.toISOString().split('T')[0]
        break
      case 'Last 30 days':
        today.setDate(today.getDate() - 30)
        startDate = today.toISOString().split('T')[0]
        break
      case 'Last 365 days':
        today.setDate(today.getDate() - 365)
        startDate = today.toISOString().split('T')[0]
        break
      case 'This month':
        today.setDate(1)
        startDate = today.toISOString().split('T')[0]
        break
      case 'Previous month':
        today.setMonth(today.getMonth() - 1)
        today.setDate(1)
        startDate = today.toISOString().split('T')[0]
        today.setMonth(today.getMonth() + 1)
        today.setDate(0)
        endDate = today.toISOString().split('T')[0]
        break
      case 'This quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        startDate = `${today.getFullYear()}-${quarter * 3 + 1}-01`
        break
      case 'This year':
        startDate = `${today.getFullYear()}-01-01`
        break
      case 'Previous year':
        today.setFullYear(today.getFullYear() - 1)
        startDate = `${today.getFullYear()}-01-01`
        break
      default:
        break
    }

    setFromDate(startDate)
    setToDate(endDate)
  }

  const fetchData = async () => {
    if (!fromDate || !toDate || !mytoken) return

    setIsLoading(true)
    try {
      const url = `https://panel.adsaro.com/advertiser/api/AdvertiserReports/date?version=4&token=${mytoken}&filters=date:${fromDate}_${toDate}`
      const response = await axios.get(url)
      
      if (response.data.response?.total) {
        // Create an array with the total object
        const rowsArray = [response.data.response.total] as AdvertiserReportData[]
        setData(rowsArray)
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (mytoken && fromDate && toDate) {
      fetchData()
    }
  }, [mytoken, fromDate, toDate])

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    const routes: Record<string, string> = {
      "By date": "/advertiser/report/xmlreportbydate",
      "By campaign": "/advertiser/report/xmlreportbycampaign",
      "By country": "/advertiser/report/xmlreportbycountry",

    }
    const url = routes[selectedValue]
    if (url) router.push(url)
  }

  // Set initial date range to today
  React.useEffect(() => {
    handleDateRangeChange('Today')
  }, [])

  return (
    <div className="w-full">
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
       
      <div className="flex border-b border-gray-200 mb-6">
    <button 
      className="px-4 py-2 font-medium text-[#4f528e] border-b-2 border-[#4f528e] mr-4 focus:outline-none"
    >
      XML Reports
    </button>
    
          <button 
        onClick={() => router.push("/advertiser/report/displayreportbycampaign")}
        className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
      >
       Display Reports
      </button>
  </div>
        <h2 className="mb-4 text-xl font-bold text-gray-800 flex items-center">
          <svg className="mr-2 text-blue-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
          Filter Report by Campaign
        </h2>

        <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center space-x-2">
  <label className="text-sm font-medium text-gray-700" htmlFor="reportSelect">
    Report
  </label>
  <select
  id="reportSelect"
  onChange={handleSelectChange}
  defaultValue="By campaign"
  className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="By date">By date</option>
              <option value="By campaign">By campaign</option>
              <option value="By country">By country</option>
</select>

</div>


          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium text-gray-700">From:</label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <svg className="absolute left-2 top-2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
            </div>
          </div>

          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium text-gray-700">To:</label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <svg className="absolute left-2 top-2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {['Today', 'Yesterday', 'Last 3 days', 'Last 30 days', 'This month'].map((range) => (
              <button 
                key={range}
                onClick={() => handleDateRangeChange(range)} 
                className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-colors ${
                  activeRange === range 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter responses..."
          value={(table.getColumn("adv_responses")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("adv_responses")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading..." : "No results found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end py-4 space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}