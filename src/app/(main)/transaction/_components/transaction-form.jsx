"use client";

import { transactionSchema } from "@/app/lib/schema";
import { createTransaction, updateTransaction } from "@actions/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import useFetch from "hooks/use-fetch";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ReciptScanner from "./recipt-scanner";
import { useCallback } from "react";

const AddTransactionForm = ({ accounts, categories,editMode=false,initialData=null, }) => {
  const router = useRouter();
  const searchParamns = useSearchParams();
  const editId = searchParamns.get("edit");
  console.log("DEBUG AddTransactionForm:", {
  editId,
  editMode,
  initialData,
});

const isEdit = Boolean(editId);
  const {
  register,
  setValue,
  handleSubmit,
  formState: { errors },
  watch,
  reset,
} = useForm({
  resolver: zodResolver(transactionSchema),
  defaultValues: {
    type: "EXPENSE",
    amount: "",
    description: "",
    accountId: accounts.find((ac) => ac.isDefault)?.id,
    date: new Date(),
    isRecurring: false,
  },
});

useEffect(() => {
  if (!editMode) return;
  if (!initialData) return;

  reset({
    type: initialData.type,
    amount: initialData.amount?.toString() ?? "",
    description: initialData.description ?? "",
    accountId: initialData.accountId,
    category: initialData.category,
    date: new Date(initialData.date),
    isRecurring: initialData.isRecurring,
    recurringInterval: initialData.recurringInterval ?? undefined,
  });
}, [editMode, initialData, reset]);


  const { loading: transactionLoading, fn: transactionFn, data: transactionResult } =
    useFetch(isEdit ? updateTransaction : createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if(isEdit){
      transactionFn(editId,formData);
    }
    else{
    transactionFn(formData);
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(isEdit?"Transaction updated successfully":"Transaction created successfully");
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading,isEdit]);

  const filteredCategories = categories.filter((category) => category.type === type);

const handleScanComplete = (scannedData) => {
  if (!scannedData) return;
if(scannedData){
  setValue("amount", scannedData.amount?.toString() ?? "");
  setValue(
    "date",
    scannedData.date ? new Date(scannedData.date) : new Date()
  );

  if (scannedData.description) {
    setValue("description", scannedData.description);
  }
  if (scannedData.category) {
  const match = categories.find(c => c.id === scannedData.category);
  if (match) setValue("category", match.id);
}
}
};


  return (
    <form className="space-y-6 max-w-3xl mx-auto" onSubmit={handleSubmit(onSubmit)}>

  {/* AI Receipt scanner */}
{!isEdit && <ReciptScanner onScanComplete={handleScanComplete}/>}

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
  value={type}
  onValueChange={(value) => setValue("type", value)}
>

          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>

      {/* Amount & Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
          {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
  value={watch("accountId")}
  onValueChange={(value) => setValue("accountId", value)}
>

            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="w-full text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && <p className="text-sm text-red-500">{errors.accountId.message}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
  value={watch("category")}
  onValueChange={(value) => setValue("category", value)}
>

          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal"
            >
              {date ? format(date, "PPP") : "Pick a date"}
              <CalendarIcon className="ml-2 h-5 w-5 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Recurring */}
      <div className="flex items-center justify-between border rounded-lg p-4">
        <div>
          <label className="text-base font-medium">Recurring Transaction</label>
          <p className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </p>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
  value={watch("recurringInterval")}
  onValueChange={(value) => setValue("recurringInterval", value)}
>

            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
          )}
        </div>
      )}
      
      {/* Buttons */}
<div className="flex flex-col md:flex-row gap-4">
  <Button
    type="button"
    variant="outline"
    className="flex-1"
    onClick={() => router.back()}
  >
    Cancel
  </Button>
  <Button
    type="submit"
    className="flex-1"
    disabled={transactionLoading}
  >
  {transactionLoading ? (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {isEdit ? "Updating..." : "Creating..."}
  </>
) : isEdit ? (
  "Update transaction"
) : (
  "Create transaction"
)}
  </Button>
</div>

    </form>
  );
};

export default AddTransactionForm;
