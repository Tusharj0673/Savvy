"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "./ui/drawer";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/app/lib/schema";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import useFetch from "../../hooks/use-fetch";

import { createAccount } from "../../actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";


const CreateAccountDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });
  const{
    data :newAccount,
    error,
    fn: createAccountFn,
    loading: createAccountLoading,
  }= useFetch(createAccount);
  useEffect(() => {
  if (newAccount) {
    toast.success("Account created successfully");
    reset();
    setOpen(false);
  }
}, [newAccount]);

  useEffect(()=>{
    if(error) {
      toast.success( error.message || "Failed to create Account");
    }
  }, [error]);
  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent className="px-6 py-4 space-y-4">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">
            Create New Account
          </DrawerTitle>
        </DrawerHeader>

        {/* FORM CONTENT */}
        <form
          className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto px-1 pb-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Account Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Account Name
            </label>
            <Input
              id="name"
              placeholder="e.g., Main Checking"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Account Type
            </label>
            <Select
              defaultValue={watch("type")}
              onValueChange={(value) => setValue("type", value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="CURRENT">Current</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <label htmlFor="balance" className="text-sm font-medium">
              Initial Balance
            </label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("balance")}
            />
            {errors.balance && (
              <p className="text-sm text-red-500">
                {errors.balance.message}
              </p>
            )}
          </div>

          {/* Default Account */}
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="text-sm font-medium">Set as Default</p>
              <p className="text-xs text-muted-foreground">
                This account will be the default for new transactions.
              </p>
            </div>

            <Switch
              id="isDefault"
              checked={watch("isDefault")}
              onCheckedChange={(val) => setValue("isDefault", val)}
            />
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex gap-4 pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>

            <Button type="submit" className="flex-1" disabled={createAccountLoading}>
              {createAccountLoading? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating...</>
              ) :(
                "Create Account"
              ) }
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;

