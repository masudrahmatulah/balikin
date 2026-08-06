"use client";

import React, { createContext, useContext, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search, Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseTableContextType<T> {
  data: T[];
  filteredData: T[];
  setFilteredData: (data: T[]) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  handleSort: (column: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
  totalPages: number;
  paginatedData: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

const BaseTableContext = createContext<BaseTableContextType<any> | null>(null);

/**
 * Base Table Component
 * Provides consistent table functionality: sorting, filtering, pagination, search
 * Reduces code duplication across 25+ table components
 */
export function BaseTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  children,
  className,
}: {
  data: T[];
  columns: Array<{
    key: string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    cell?: (row: T) => React.ReactNode;
  }>;
  pageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  children?: (context: BaseTableContextType<T>) => React.ReactNode;
  className?: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(pageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchable && searchQuery) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply filter
    if (filterable && filterValue !== "all") {
      // You can customize filter logic per table
      result = result.filter((row) => {
        // Default filter implementation - override as needed
        return true;
      });
    }

    // Apply sort
    if (sortable && sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, filterValue, sortColumn, sortDirection, sortable, filterable]);

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / currentPageSize);
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = startIndex + currentPageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Handlers
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) setCurrentPage((p) => p - 1);
  };

  const goToFirstPage = () => setCurrentPage(1);

  const goToLastPage = () => setCurrentPage(totalPages);

  const contextValue: BaseTableContextType<T> = {
    data,
    filteredData,
    setFilteredData: () => {}, // Not exposed, use internal state
    currentPage,
    setCurrentPage,
    pageSize: currentPageSize,
    setPageSize,
    sortColumn,
    sortDirection,
    handleSort,
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    totalPages,
    paginatedData,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
  };

  // If children function is provided, render with context
  if (typeof children === "function") {
    return (
      <BaseTableContext.Provider value={contextValue}>
        {children(contextValue)}
      </BaseTableContext.Provider>
    );
  }

  // Default table UI
  return (
    <BaseTableContext.Provider value={contextValue}>
      <div className={cn("space-y-4", className)}>
        {/* Controls */}
        {(searchable || filterable) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {filterable && (
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {/* Add filter options as needed */}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Results Counter */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {paginatedData.length} of {filteredData.length} results
          {searchQuery || filterValue !== "all" ? (
            <> (filtered from {data.length} total)</>
          ) : (
            <>
              {pagination && (
                <>
                  {" "}
                  • Page {currentPage} of {totalPages}
                </>
              )}
            </>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => {
                  const isSortableColumn = sortable && column.sortable !== false;
                  const ariaSort: "ascending" | "descending" | "none" =
                    isSortableColumn && sortColumn === column.key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none";
                  return (
                    <TableHead
                      key={column.key}
                      aria-sort={isSortableColumn ? ariaSort : undefined}
                    >
                      {isSortableColumn ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white"
                        >
                          {column.title}
                          {sortColumn === column.key ? (
                            sortDirection === "asc" ? (
                              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            )
                          ) : (
                            <SlidersHorizontal className="w-4 h-4 opacity-50" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">{column.title}</div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500 dark:text-gray-400"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.cell ? column.cell(row) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span>Rows per page:</span>
              <Select value={String(currentPageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={!hasPreviousPage}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={!hasNextPage}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={!hasNextPage}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to access Base Table context
 */
export function useBaseTable<T>() {
  const context = useContext(BaseTableContext);
  if (!context) {
    throw new Error("useBaseTable must be used within a BaseTable");
  }
  return context as BaseTableContextType<T>;
}
