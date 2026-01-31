"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {Table,TableHeader,TableRow,TableCell,TableHead,TableBody,} from "@/components/ui/table";
import React , {useEffect, useMemo, useState} from "react";
import { format } from "date-fns";


import { categoryColors } from "../../../../../data/categories";
import { Badge } from "@/components/ui/badge";
import {Tooltip,TooltipContent, TooltipTrigger,} from "@/components/ui/tooltip"
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select"
import useFetch from "../../../../../hooks/use-fetch";
import { bulkDeleteTransactions } from "../../../../../actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY : "Weekly",
  MONTHLY : "Monthly",
  YEARLY : "Yearly",
};
const TransactionTable = ({ transactions }) => {

const router = useRouter();
const [selectedIds , setSelectedIds] = useState([]);
// const[sortConfid , setSortConfig] = useState({
//   field:"date",
//   direction: "desc",
// });
//   const handleSort = (field) => {
//     sortConfig(current=>({
//     field,
//     direction:current.field==field && current.direction === "asc" ?"desc":"asc",
//     }));  
//   };
const [sortConfig, setSortConfig] = useState({
  field: "date",
  direction: "desc",
});


const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 8; 


const [searchTerm , setSearchTerm] = useState("");
  const [typeFilter , setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const {
 loading:deleteLoading,
 fn: deleteFn,
 data: deleted,
  } = useFetch(bulkDeleteTransactions);

const handleSort = (field) => {
  setSortConfig((current) => ({
    field,
    direction:
      current.field === field && current.direction === "asc"
        ? "desc"
        : "asc",
  }));
};

const handleSelect = (id) => {
 setSelectedIds(current=>current.includes(id)?current.filter(item=>item!=id):[...current,id]
);
};
const handleSelectAll = () => {setSelectedIds((current) =>
  current.length === filteredAndSortedTransaction.length ? 
  [] : filteredAndSortedTransaction.map((t)=>t.id)
);
};
const filteredAndSortedTransaction = useMemo(()=>{ 
  let result = [...transactions];

// Apply Search Filter
  if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transactions) =>
        transactions.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((transactions) => transactions.type === typeFilter);
    }

    // Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transactions) => {
        if (recurringFilter === "recurring") return transactions.isRecurring;
        return !transactions.isRecurring;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });


// return paginatedResult;

  return result;
    },[
      transactions,
      searchTerm,
      typeFilter,
      recurringFilter,
      sortConfig,
    ]);


    
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedTransactions = filteredAndSortedTransaction.slice(
  startIndex,
  startIndex + itemsPerPage
);

const handleBulkDelete  = async() => {
  if (
    !window.confirm(
      `Are you syre you want to delete ${selectedIds.length} transaction`
    )
    ) {
      return;
    }
    deleteFn(selectedIds);
};

useEffect(()=> {
  if(deleted && !deleteLoading){
    toast.error("Transaction deleted succesfully");
  }
}, [deleted, deleteLoading]);
const handleClearFilters = () => {
  setSearchTerm("");
  setTypeFilter("");
  setRecurringFilter("");
  setSelectedIds([]);
};
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, typeFilter, recurringFilter, sortConfig]);

  return (
    <div className="space-y-4">
    {
      deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea"/>
      )
    }
    {/* Filters */}
<div className="flex flex-col sm:flex-row gap-4">
  <div className="relative flex-1">
    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
    <Input className="pl-8"  value={searchTerm}
    placeholder="Search transactions..." onChange={(e)=>setSearchTerm(e.target.value)}/>
  </div>

  <div className="flex gap-2">
    <Select value={typeFilter} onValueChange={setTypeFilter}>
  <SelectTrigger >
    <SelectValue placeholder="All types" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="INCOME">Income</SelectItem>
    <SelectItem value="EXPENSE">Expense</SelectItem>
  </SelectContent>
</Select>

    <Select value={recurringFilter} onValueChange={(value)=> setRecurringFilter(value)}>
  <SelectTrigger className="w-[150px]" >
    <SelectValue placeholder="All Transactions" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="recurring">Recurring Only</SelectItem>
    <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
  </SelectContent>
</Select>

{selectedIds.length>0 && ( <div className="flex items-center gap-2">
<Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash className="h-4 w-4 mr-2"/>Delete Selected({selectedIds.length})</Button>
</div>)}

{(searchTerm || typeFilter || recurringFilter) && (
  <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear Filters ">
    <X className="h-4 w-5"/>
  </Button>
)}
  </div>
</div>
      {/* TABLE */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length === filteredAndSortedTransaction.length && filteredAndSortedTransaction.length > 0 
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">Date{""}
                {sortConfig.field==="date"&& (sortConfig.direction === "asc" ?(
                  <ChevronUp className="ml-1 h-4 w-4"/>
                ):(<ChevronDown className="ml-1 h-4 w-4"/>
                ))}
                </div>
              </TableHead>

              <TableHead>Description</TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">Category
                   {sortConfig.field==="category"&& (sortConfig.direction === "asc" ?(
                  <ChevronUp className="ml-1 h-4 w-4"/>
                ):(<ChevronDown className="ml-1 h-4 w-4"/>
                ))}
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">Amount
                   {sortConfig.field==="amount"&& (sortConfig.direction === "asc" ?(
                  <ChevronUp className="ml-1 h-4 w-4"/>
                ):(<ChevronDown className="ml-1 h-4 w-4"/>
                ))}</div>
              </TableHead>

              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndSortedTransaction.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No Transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox onCheckedChange={()=>handleSelect(transaction.id)}
                    checked={selectedIds.includes(transaction.id)}
                     />
                  </TableCell>

                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>

                  <TableCell>{transaction.description}</TableCell>

                  <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="px-2 py-1 rounded text-white text-sm mr-2"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-medium" style={{
                    color: transaction.type === "EXPENSE" ? "red" : "green",
                  }}>
                  {transaction.type==="EXPENSE" ? "-" : "+"}
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.isRecurring?( 
<Tooltip>
  <TooltipTrigger>   <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"><RefreshCw className="h-3 w-3"/>{RECURRING_INTERVALS[transaction.recurringInterval]}</Badge></TooltipTrigger>
  <TooltipContent>
    <div className="text-sm">
        <div className="font-medium">Next Date:</div>
        <div>{format(new Date(transaction.nextRecurringDate),"PP")}</div>
    </div>
  </TooltipContent>
</Tooltip> ):(
    <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3"/>One-time</Badge>
                  )}</TableCell>
                  <TableCell>
                    <DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={()=> router.push(`/transaction/create?edit=${transaction.id}`)}>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive" 
    onClick={()=>deleteFn([transaction.id])}
    >Delete</DropdownMenuItem>
    
  </DropdownMenuContent>
</DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Pagination */}
<div className="flex items-center justify-between p-4">
  <Button
    variant="outline"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => p - 1)}
  >
    Previous
  </Button>

  <div className="font-medium">
    Page {currentPage} of {Math.ceil(filteredAndSortedTransaction.length / itemsPerPage)}
  </div>

  <Button
    variant="outline"
    disabled={currentPage >= Math.ceil(filteredAndSortedTransaction.length / itemsPerPage)}
    onClick={() => setCurrentPage((p) => p + 1)}
  >
    Next
  </Button>
</div>


      </div>
    </div>
  );
};

export default TransactionTable;
