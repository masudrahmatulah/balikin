"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDetailedStockServer } from "@/app/admin/actions/stock-actions";
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, AlertCircle } from "lucide-react";

type ClaimStatus = 'all' | 'claimed' | 'unclaimed';
type SortBy = 'createdAt' | 'claimedAt';
type SortOrder = 'asc' | 'desc';

interface StockItem {
  id: string;
  slug: string;
  tier: string;
  status: string;
  name: string;
  ownerId: string | null;
  claimedAt: string | null | undefined;
  createdAt: string;
}

interface StockListTableProps {
  className?: string;
}

/**
 * Stock List Table Component
 * Displays detailed list of QR codes with filter, search, and pagination
 */
export function StockListTable({ className = "" }: StockListTableProps) {
  const [data, setData] = useState<StockItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [filterByTier, setFilterByTier] = useState<string>("");
  const [filterByClaimStatus, setFilterByClaimStatus] = useState<ClaimStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Sort and pagination state
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const totalPages = Math.ceil(total / pageSize);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching stock list with params:", {
        filterByTier,
        filterByClaimStatus,
        sortBy,
        sortOrder,
        pageSize,
        currentPage,
        debouncedSearch
      });

      const result = await getDetailedStockServer(
        filterByTier || undefined,
        filterByClaimStatus,
        sortBy,
        sortOrder,
        pageSize,
        currentPage,
        debouncedSearch
      );

      console.log("Stock list data fetched:", { items: result.items.length, total: result.total });
      setData(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to fetch stock list:", error);
      setError(error instanceof Error ? error.message : "Failed to load stock data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterByTier, filterByClaimStatus, searchQuery]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [filterByTier, filterByClaimStatus, sortBy, sortOrder, currentPage, debouncedSearch]);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getClaimBadge = (ownerId: string | null) => {
    if (ownerId) {
      return <Badge className="bg-green-500 hover:bg-green-600">Claimed</Badge>;
    }
    return <Badge variant="secondary">Unclaimed</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const tierConfig: Record<string, { color: string; label: string }> = {
      free: { color: "bg-gray-500 hover:bg-gray-600", label: "Free" },
      premium: { color: "bg-purple-500 hover:bg-purple-600", label: "Premium" },
      student: { color: "bg-blue-500 hover:bg-blue-600", label: "Student" },
    };
    const config = tierConfig[tier] || { color: "bg-gray-500 hover:bg-gray-600", label: tier };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>List QR Codes</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Total: {total}</span>
              <span>|</span>
              <span>Page {currentPage} of {totalPages || 1}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by slug or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={filterByTier} onValueChange={(v) => setFilterByTier(v || "")}>
                  <SelectTrigger className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tiers</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-40">
                <Select value={filterByClaimStatus} onValueChange={(v) => setFilterByClaimStatus((v || "all") as ClaimStatus)}>
                  <SelectTrigger className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="unclaimed">Unclaimed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-40">
                <Select value={sortBy} onValueChange={(v) => setSortBy((v || "createdAt") as SortBy)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created At</SelectItem>
                    <SelectItem value="claimedAt">Claimed At</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Slug</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[200px]">Owner</TableHead>
                  <TableHead className="w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => toggleSort('claimedAt')}>
                    Claimed At {sortBy === 'claimedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="w-[100px]">Tier</TableHead>
                  <TableHead className="w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => toggleSort('createdAt')}>
                    Created At {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        <span className="text-gray-600 dark:text-gray-400">Loading QR codes...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-6 h-6" />
                        <span>{error}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchData()}
                          className="mt-2"
                        >
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No QR codes found matching your criteria.
                      {total > 0 && ` Total: ${total} tags in database.`}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">
                        {item.slug}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        {getClaimBadge(item.ownerId)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {item.ownerId || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(item.claimedAt)}
                      </TableCell>
                      <TableCell>
                        {getTierBadge(item.tier)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/${item.slug}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}