// "use client";

// import React, { useState } from "react";
// import CreateAccountDrawer from "@/components/create-account-drawer";
// import { Card, CardContent } from "@/components/ui/card";
// import { Plus } from "lucide-react";
// import AccountCard from "./_components/account-card";

// // actions folder is OUTSIDE src
// import { getCurrentBudget } from "@/../actions/budget";
// import { getUserAccounts } from "@/../actions/dashboard";
// import { BudgetProgress } from "./_components/budget-progress";


// // export default function DashboardPage() {
// //   const [accounts, setAccounts] = useState([]);
// //  const defaultAccount = accounts?.find((account)=>account.isDefault);
// //  let budgetData = null;
// //  if(defaultAccount){
// //   budgetData = await getCurrentBudget(defaultAccount.id);
// //  }
// //   // load accounts on the client
// //   React.useEffect(() => {
// //     async function load() {
// //       const data = await getUserAccounts();
// //       setAccounts(data);
// //     }
// //     load();
// //   }, []);

// //   // 🔥 update default account instantly (UI only)
// //   const updateDefaultLocally = (selectedId) => {
// //     setAccounts((prev) =>
// //       prev.map((acc) => ({
// //         ...acc,
// //         isDefault: acc.id === selectedId, // only this one becomes default
// //       }))
// //     );
// //   };
// async function DashboardPage() {
//   const accounts = await getUserAccounts();

//   // Derived value (doesn't cause errors)
//   const defaultAccount = accounts?.find((a) => a.isDefault);
//   let budgetData = null;
//   if (defaultAccount){
//     budgetData = await getCurrentBudget(defaultAccount.id);
//   }

//   // Instant UI update for default account
//   // const updateDefaultLocally = (selectedId) => {
//   //   setAccounts((prev) =>
//   //     prev.map((acc) => ({
//   //       ...acc,
//   //       isDefault: acc.id === selectedId,
//   //     }))
//   //   );
//   // };

//   return (
//     <div className="px-5">
//     {/* Budget Progress  */}
//     {defaultAccount && <BudgetProgress 
//     initialBudget={budgetData?.budget}
//     currentExpenses={budgetData?.currentExpenses || 0}
    
//     />}
//       {/* Accounts Grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <CreateAccountDrawer>
//           <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashboard">
//             <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
//               <Plus className="h-10 w-10 mb-2" />
//               <p className="text-sm font-medium">Add New Account</p>
//             </CardContent>
//           </Card>
//         </CreateAccountDrawer>

//         {accounts.length > 0 &&
//           accounts.map((acc) => (
//             <AccountCard
//               key={acc.id}
//               account={acc}
//               onDefaultChange={updateDefaultLocally}
//             />
//           ))}
//       </div>
//     </div>
//   );
// }

import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AccountCard from "./_components/account-card";
import { getCurrentBudget } from "@/../actions/budget";
import { getDashboardData, getUserAccounts } from "@/../actions/dashboard";
import { BudgetProgress } from "./_components/budget-progress";
import { Suspense } from "react";
import DashboardOverview from "./_components/transaction-overview";

// export default async function DashboardPage({children}) {
//   const accounts = await getUserAccounts();
//   const defaultAccount = accounts?.find((a) => a.isDefault);

//   let budgetData = null;
//   if (defaultAccount) {
//     budgetData = await getCurrentBudget(defaultAccount.id);
//   }
// // const transactions = await getDashboardData();
// //   return (
// //     <div className="px-5">
// //       {defaultAccount && (
// //         <BudgetProgress
// //           initialBudget={budgetData?.budget}
// //           currentExpenses={budgetData?.currentExpenses || 0}
// //         />
// //       )}
// // const transactions = await getDashboardData();

// // const safeTransactions = transactions.map((t) => ({
// //   ...t,
// //   amount: t.amount.toNumber(),     // ✅ Decimal → number
// //   date: t.date.toISOString(),      // ✅ Date → string
// //   createdAt: t.createdAt.toISOString(),
// //   updatedAt: t.updatedAt.toISOString(),
// //   nextRecurringDate: t.nextRecurringDate
// //     ? t.nextRecurringDate.toISOString()
// //     : null,
// //   lastProcessed: t.lastProcessed
// //     ? t.lastProcessed.toISOString()
// //     : null,
// // }));
// // <Suspense fallback={"Loading overview..."}>
// //   <DashboardOverview
// //     accounts={accounts}
// //     transactions={safeTransactions}
// //   />
// // </Suspense>
// // {/* <Suspense fallback={"Loading overview..."}>
// // <DashboardOverview accounts={accounts} transaction = {transactions || []}/>

// // </Suspense> */}

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <CreateAccountDrawer>
//           <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashboard">
//             <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
//               <Plus className="h-10 w-10 mb-2" />
//               <p className="text-sm font-medium">Add New Account</p>
//             </CardContent>
//           </Card>
//         </CreateAccountDrawer>

//         {accounts.map((acc) => (
//           <AccountCard key={acc.id} account={acc} />
//         ))}
//       </div>
// }


export default async function DashboardPage({ children }) {
  const accounts = await getUserAccounts();
  const defaultAccount = accounts?.find((a) => a.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const transactions = await getDashboardData();

  const safeTransactions = transactions.map((t) => ({
    ...t,
    amount: t.amount.toNumber(),
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    nextRecurringDate: t.nextRecurringDate
      ? t.nextRecurringDate.toISOString()
      : null,
    lastProcessed: t.lastProcessed
      ? t.lastProcessed.toISOString()
      : null,
  }));

  return (
    <div className="px-5">
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      <Suspense fallback={"Loading overview..."}>
        <DashboardOverview
          accounts={accounts}
          transactions={safeTransactions}
        />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashboard">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.map((acc) => (
          <AccountCard key={acc.id} account={acc} />
        ))}
      </div>
    </div>
  );
}
