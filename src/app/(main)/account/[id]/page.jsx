
import React, { Suspense } from "react";
import { getAccountWithTransaction } from "../../../../../actions/accounts";
import { notFound } from "next/navigation";
import TransactionTable from "../_components/transactions-table";
import AccountChart from "../_components/account-chart";
import { BarLoader } from "react-spinners";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));
};

const AccountsPage = async ({ params }) => {
  const { id } = await params;   

  const accountData = await getAccountWithTransaction(id);


  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space y-8 px-5">
    <div className="flex gap-4 items-end justify-between">
    
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize color:black">{account.name}</h1>

        <p className="text-muted-foreground">{account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account</p>
      </div>

      <div className="text-right pb-2">
        <div className="text-xl sm:text-2xl font-bold">{formatCurrency(account.balance)}</div>
        <p className="text-sm text-muted-foreground">{account._count.transactions} Transactions</p>
      </div>
      </div>

      {/* Chart Section  */}
<Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
<AccountChart transactions={transactions}/>
      </Suspense>
      
{/* { Transactions Table} */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
      <TransactionTable transactions={transactions}/></Suspense>
    </div>
  );
};

export default AccountsPage;
