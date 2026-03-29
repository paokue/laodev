"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  mobileRender?: (item: T) => React.ReactNode
  className?: string
}

export interface FilterOption {
  key: string
  label: string
  type?: "select" | "dateRange"
  options: { value: string; label: string }[]
}

export interface ServerParams {
  search: string
  filters: Record<string, string>
  page: number
  sort: { key: string; direction: "asc" | "desc" } | null
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKey?: string
  searchPlaceholder?: string
  filters?: FilterOption[]
  pageSize?: number
  onRowClick?: (item: T) => void
  renderMobileCard?: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
  actions?: (item: T) => React.ReactNode
  // Server-side mode
  serverSide?: boolean
  totalItems?: number
  onParamsChange?: (params: ServerParams) => void
  initialSearch?: string
  initialFilters?: Record<string, string>
  initialPage?: number
  initialSort?: { key: string; direction: "asc" | "desc" } | null
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  filters = [],
  pageSize = 10,
  onRowClick,
  renderMobileCard,
  emptyMessage = "No data found",
  actions,
  serverSide = false,
  totalItems,
  onParamsChange,
  initialSearch = "",
  initialFilters = {},
  initialPage = 1,
  initialSort = null,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialFilters)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(initialSort)
  const [showFilters, setShowFilters] = useState(false)

  // Sync state from URL when loader re-runs in server-side mode
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (serverSide) {
      setSearchQuery(initialSearch)
      setFilterValues(initialFilters)
      setCurrentPage(initialPage)
      setSortConfig(initialSort)
    }
  }, [serverSide, initialSearch, initialPage, JSON.stringify(initialFilters), JSON.stringify(initialSort)])

  // Notify parent of param changes in server-side mode
  const notifyChange = (overrides: Partial<ServerParams>) => {
    if (serverSide && onParamsChange) {
      onParamsChange({
        search: overrides.search ?? searchQuery,
        filters: overrides.filters ?? filterValues,
        page: overrides.page ?? currentPage,
        sort: overrides.sort !== undefined ? overrides.sort : sortConfig,
      })
    }
  }

  // Filter and search data (client-side only)
  const filteredData = useMemo(() => {
    if (serverSide) return data

    let result = [...data]

    if (searchQuery && searchKey) {
      const query = searchQuery.toLowerCase()
      result = result.filter((item) => {
        const value = (item as Record<string, unknown>)[searchKey]
        if (typeof value === "string") {
          return value.toLowerCase().includes(query)
        }
        return false
      })
    }

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const itemValue = (item as Record<string, unknown>)[key]
          return itemValue === value
        })
      }
    })

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortConfig.key]
        const bValue = (b as Record<string, unknown>)[sortConfig.key]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }
        return 0
      })
    }

    return result
  }, [data, searchQuery, searchKey, filterValues, sortConfig, serverSide])

  // Pagination
  const itemCount = serverSide ? (totalItems ?? data.length) : filteredData.length
  const totalPages = Math.ceil(itemCount / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = serverSide ? data : filteredData.slice(startIndex, startIndex + pageSize)

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      let next: { key: string; direction: "asc" | "desc" } | null
      if (prev?.key === key) {
        next = prev.direction === "asc" ? { key, direction: "desc" } : null
      } else {
        next = { key, direction: "asc" }
      }
      notifyChange({ sort: next, page: 1 })
      setCurrentPage(1)
      return next
    })
  }

  const clearFilters = () => {
    setFilterValues({})
    setSearchQuery("")
    setCurrentPage(1)
    notifyChange({ search: "", filters: {}, page: 1, sort: sortConfig })
  }

  const hasActiveFilters = searchQuery || Object.values(filterValues).some((v) => v && v !== "all")

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 mt-1 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
              notifyChange({ search: e.target.value, page: 1 })
            }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-secondary border border-primary")}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {Object.values(filterValues).filter((v) => v && v !== "all").length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </Button>
          )}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="border border-rose-500 hover:bg-rose-500 hover:text-white">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && filters.length > 0 && (
        <Card className="rounded-sm">
          <CardContent className="px-4 py-0">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {filters.map((filter) => (
                filter.type === "dateRange" ? (
                  <div key={filter.key} className="col-span-2 lg:col-span-2">
                    <label className="mb-2 block text-sm font-medium">{filter.label}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        className="h-9 text-sm flex-1"
                        value={filterValues[`${filter.key}From`] || ""}
                        onChange={(e) => {
                          const newFilters = { ...filterValues, [`${filter.key}From`]: e.target.value }
                          setFilterValues(newFilters)
                          setCurrentPage(1)
                          notifyChange({ filters: newFilters, page: 1 })
                        }}
                      />
                      <span className="text-sm text-white">to</span>
                      <Input
                        type="date"
                        className="h-9 text-sm flex-1"
                        value={filterValues[`${filter.key}To`] || ""}
                        onChange={(e) => {
                          const newFilters = { ...filterValues, [`${filter.key}To`]: e.target.value }
                          setFilterValues(newFilters)
                          setCurrentPage(1)
                          notifyChange({ filters: newFilters, page: 1 })
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div key={filter.key}>
                    <label className="mb-2 block text-sm font-medium">{filter.label}</label>
                    <Select
                      value={filterValues[filter.key] || "all"}
                      onValueChange={(value) => {
                        const newFilters = { ...filterValues, [filter.key]: value }
                        setFilterValues(newFilters)
                        setCurrentPage(1)
                        notifyChange({ filters: newFilters, page: 1 })
                      }}
                    >
                      <SelectTrigger className="w-full border border-white/50">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="text-sm text-white">
        Showing {itemCount === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, itemCount)} of {itemCount} results
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.sortable && "cursor-pointer select-none hover:bg-muted/50",
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-primary">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="h-32 text-center text-white"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render
                          ? column.render(item)
                          : String((item as Record<string, unknown>)[column.key] ?? "")}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {actions(item)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {paginatedData.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-white">
              {emptyMessage}
            </CardContent>
          </Card>
        ) : (
          paginatedData.map((item, index) =>
            renderMobileCard ? (
              renderMobileCard(item, index)
            ) : (
              <Card
                key={item.id}
                className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                onClick={() => onRowClick?.(item)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {columns.map((column) => (
                      <div key={column.key} className="flex items-start justify-between gap-4">
                        <span className="text-sm text-white">{column.label}</span>
                        <span className="text-sm font-medium text-right">
                          {column.mobileRender
                            ? column.mobileRender(item)
                            : column.render
                              ? column.render(item)
                              : String((item as Record<string, unknown>)[column.key] ?? "")}
                        </span>
                      </div>
                    ))}
                    {actions && (
                      <div className="flex justify-end pt-2" onClick={(e) => e.stopPropagation()}>
                        {actions(item)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={() => setCurrentPage(1)}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setCurrentPage(1); notifyChange({ page: 1 }) }}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { const p = Math.max(1, currentPage - 1); setCurrentPage(p); notifyChange({ page: p }) }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => { setCurrentPage(pageNum); notifyChange({ page: pageNum }) }}
                    className="h-9 w-9"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => { const p = Math.min(totalPages, currentPage + 1); setCurrentPage(p); notifyChange({ page: p }) }}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setCurrentPage(totalPages); notifyChange({ page: totalPages }) }}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
