"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";

import { BarLoader } from "react-spinners";
import { toast } from "sonner";

import useFetch from "../../../../../hooks/use-fetch";
import { bulkDeleteTransactions } from "../../../../../actions/accounts";
import { categoryColors } from "../../../../../data/categories";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const ITEMS_PER_PAGE = 8;

const TransactionTable = ({ transactions = [] }) => {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleRecurringChange = (value) => {
    setRecurringFilter(value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    setSortConfig((c) => ({
      field,
      direction:
        c.field === field && c.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const filteredAndSorted = (() => {
    let result = [...transactions];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((t) =>
        t.description?.toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (recurringFilter) {
      result = result.filter((t) =>
        recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
      );
    }

    result.sort((a, b) => {
      let value = 0;
      if (sortConfig.field === "date")
        value = new Date(a.date) - new Date(b.date);
      if (sortConfig.field === "amount")
        value = a.amount - b.amount;
      if (sortConfig.field === "category")
        value = a.category.localeCompare(b.category);

      return sortConfig.direction === "asc" ? value : -value;
    });

    return result;
  })();

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredAndSorted.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );


  const handleSelect = (id) => {
    setSelectedIds((c) =>
      c.includes(id) ? c.filter((i) => i !== id) : [...c, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((c) =>
      c.length === filteredAndSorted.length
        ? []
        : filteredAndSorted.map((t) => t.id)
    );
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selectedIds.length} transaction(s)?`)) return;
    deleteFn(selectedIds);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success("Transaction deleted successfully");
    }
  }, [deleted, deleteLoading]);


  return (
    <div className="space-y-4">
      {deleteLoading && <BarLoader width="100%" color="#9333ea" />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
     <Input
  className="pl-8"
  placeholder="Search transactions..."
  value={searchTerm}
  onChange={handleSearchChange}
 />

        </div>

        <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
<Select value={recurringFilter} onValueChange={handleRecurringChange}>

            <SelectTrigger>
              <SelectValue placeholder="All transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button variant="outline" size="icon" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={
                    selectedIds.length === filteredAndSorted.length &&
                    filteredAndSorted.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead onClick={() => handleSort("date")}>
                Date
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead onClick={() => handleSort("category")}>
                Category
              </TableHead>
              <TableHead onClick={() => handleSort("amount")} className="text-right">
                Amount
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(t.id)}
                      onCheckedChange={() => handleSelect(t.id)}
                    />
                  </TableCell>

                  <TableCell>{format(new Date(t.date), "PP")}</TableCell>
                  <TableCell>{t.description}</TableCell>

                  <TableCell>
                    <span
                      className="px-2 py-1 rounded text-white text-sm"
                      style={{ background: categoryColors[t.category] }}
                    >
                      {t.category}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    {t.type === "EXPENSE" ? "-" : "+"}₹{t.amount}
                  </TableCell>

                  <TableCell>
                    {t.isRecurring ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {RECURRING_INTERVALS[t.recurringInterval]}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Next: {format(new Date(t.nextRecurringDate), "PP")}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        One-time
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/transaction/create?edit=${t.id}`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteFn([t.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
