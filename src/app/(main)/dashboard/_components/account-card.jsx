// "use client";

// import React, { useEffect } from "react";
// import {Card,CardHeader,CardContent,CardFooter,CardTitle,CardAction} from "@/components/ui/card";
// import {Switch} from "@/components/ui/switch";
// import { ArrowDownRight, ArrowUpRight } from "lucide-react";
// import Link from "next/link";
// import useFetch from "../../../../../hooks/use-fetch";
// import { updateDefaultAccountAction } from "@/server-actions";
// import { toast } from "sonner";




// export async function POST(req) {
//   const body = await req.json();
//   const result = await updateDefaultAccount(body);
//   return Response.json(result);
// }

// const handleDefaultChange = async () => {
//   await fetch("/api/account/update-default", {
//     method: "POST",
//     body: JSON.stringify({ accountId: id }),
//   });
// };


// const AccountCard = ({account}) => {

//     const{name,type,balance,id,isDefault} = account;

//     // const {
//     //   loading = updateDefaultLoading,
//     //   fn :updatedefaultFn,
//     //   data: updateAccount,
//     //   error,
//     // } = useFetch(updateDefaultAccount);
//     const {
//   loading :updateDefaultLoading,
//   fn: updatedefaultFn,
//   data: updateAccount,
//   error,
// } = useFetch(updateDefaultAccountAction);


//     const handleDefaultChange = async(event)=>{
// event.preventDefault();
// if(isDefault){
//   toast.warning("you need atleast 1 default account");
//   return;
// }
// await updatedefaultFn(id);
//     };

// useEffect(()=>{
// if(error){
//   toast.error(error.message|| "Failed to update default account");
// }
// },[error]);

// useEffect(()=>{
// if(updateAccount?.success){
//   toast.success("Default account updated successfully");
// }
// },[updateAccount , updateDefaultLoading]);


//     const formattedBalance = new Intl.NumberFormat("en-IN", {
//   style: "currency",
//   currency: "INR"
// }).format(parseFloat(balance));

//     return (
//         <Card className="hover:shadow-md transition-shadow group relative">
//         <Link href={`/account/${id}`}>
//   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//     <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
//     <CardAction></CardAction>
//     <Switch checked={isDefault} onClick={handleDefaultChange} disabled={updateDefaultLoading}/>
//   </CardHeader>
//   <CardContent>
//     <div className="text-2xl font-bold">{formattedBalance}</div>
//     <p className="text-xs text-muted-foreground">{type.charAt(0)+type.slice(1).toLowerCase()}Account</p>
//   </CardContent>
//   <CardFooter className="flex justify-between text-sm text-muted-foreground">
//     <div className="flex items-center">
//       <ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>Income
//     </div>
//     <div className="flex itemss-center">
//       <ArrowDownRight className="mr-1 h-4 w-4 text-red-500"/>
//       Expense
//     </div>
//   </CardFooter>
//   </Link>
// </Card>
//     );
// };

// export default AccountCard;


"use client";

import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

// useFetch inside src
import useFetch from "../../../../../hooks/use-fetch";

// actions folder OUTSIDE src
import { updateDefaultAccount } from "../../../../../actions/accounts";

const AccountCard = ({ account, onDefaultChange }) => {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading,
    fn: updateDefaultFn,
    data: updateData,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (e) => {
    e.preventDefault();

    if (isDefault) {
      toast.warning("You already have this as the default account");
      return;
    }

    onDefaultChange(id);

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  useEffect(() => {
    if (updateData?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updateData]);

  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(balance));

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`} className="block">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>

          <Switch
            checked={isDefault}
            disabled={loading}
            onClick={handleDefaultChange}
          />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">{formattedBalance}</div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" /> Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" /> Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
