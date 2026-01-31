// "use server"

// import {auth} from "@clerk/nextjs/server"
// import {db } from "@/lib/prisma"
// const serializeTransaction = (obj) => {
//   const serialized = { ...obj };
//   if (obj.balance?.toNumber) {
//     serialized.balance = obj.balance.toNumber();
//   }
//   if (obj.amount) {
//     serialized.balance = obj.amount.toNumber();
//   }
  
//   return serialized;
// };

// export async function updateDefaultAccount(accountId){
//     try {
//         const {userId}= await auth();
//      if(!userId) throw new Error("Unauthorised");

//      const user = await db.user.findUnique({
//         where:{clerkUserId: userId},
//      });

//      if(!user){
//         throw new Error("User not found");
//      }
//      await db.account.updateMany({
// // where: {userId :userId, isDefault: true},
// where: { userId: user.id, isDefault: true },

// data: {isDefault : false},
//       });
//         const account = await db.account.update({
//             where:{
//                 id: accountId,
//                 userId: user.id,
//             },
//             data: {isDefault: true},
//         });
//         revalidatePath("/dashboard");
//         return {success:true , data:serializeTransaction(account)};
//     } catch (error) {
//         return {succes:false, error:error.message};
//     }
// };

"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { success } from "zod";

// convert Prisma decimal to number
const serializeTransaction = (obj) => {
  if (!obj) return obj;

  const serialized = { ...obj };

  if (obj.balance?.toNumber) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.amount?.toNumber) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // find local user record
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // remove old default
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // set new account as default
    const updatedAccount = await db.account.update({
      where: { id: accountId },
      data: { isDefault: true },
    });

    // refresh dashboard
    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeTransaction(updatedAccount),
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getAccountWithTransaction(accountId){
      const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");}

      const account = await db.account.findUnique({
        where:{id:accountId, userId : user.id},
        include:{
          transactions:{
          orderBy: {date:"desc"},
          },
        _count:{
          select: {transactions: true},
        },
      },
      });
      if(!account) return null;

      return{ 
       ...serializeTransaction(account),
       transactions: account.transactions.map(serializeTransaction),
      };
}

// export async function bulkDeleteTransactions(transactionIds){
//   try {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!user) {
//       throw new Error("User not found");}

//       const transaction = await db.transaction.findMany({
//         where:{
//           id: {in: transactionIds},
//           userId: user.id,
//         },
//       });
//       const accountBalanceChanges = transaction.reduce((acc,transactions)=>{
//         const change = transactions.type==="EXPENSE"?transactions.amount:-transactions.amount;

//         acc[transactions.accountId] = (acc[transactions.accountId] || 0) + change;
//         return acc;
//       } , {});
// // delete transaction and update account balance
//       await db.$transaction(async(tx)=>{
//         await tx.transaction.deleteMany({
// where:{
//   id: {in:transactionIds},
//   userId :user.id,
// },
//         });

//         for(const [accountId, balanceChange] of Object.entries(
//           accountBalanceChanges
//         )) {
//           await tx.account.update({
//             where: {id:accountId},
//             data:{
//               balance:{
//                 increment : balanceChange,
//               },
//             },
//           });
//         }
//       });

//       revalidatePath("/dashboard");
//       revalidatePath("/account/[id]");
//       return{success:true};
//   } catch (error) {
//     return{success:false, error: error.message};
    
//   }
// }

// export async function bulkDeleteTransactions(transactionIds) {
//   try {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!user) throw new Error("User not found");

//     // fetch transactions
//     const transactions = await db.transaction.findMany({
//       where: {
//         id: { in: transactionIds },
//         userId: user.id,
//       },
//     });

//     // calculate balance changes
//     const accountBalanceChanges = transactions.reduce((acc, t) => {
//       const change = t.type === "EXPENSE" ? t.amount : -t.amount;
//       acc[t.accountId] = (acc[t.accountId] || 0) + change;
//       return acc;
//     }, {});

//     // run deletion + update in a transaction
//     await db.$transaction(async (tx) => {
//       // DELETE using correct model name
//       await tx.transaction.deleteMany({
//         where: {
//           id: { in: transactionIds },
//           userId: user.id,
//         },
//       });

//       // UPDATE balance using correct Prisma operator
//       for (const [accountId, balanceChange] of Object.entries(
//         accountBalanceChanges
//       )) {
//         await tx.account.update({
//           where: { id: accountId },
//           data: {
//             balance: {
//               increment: -balanceChange, // subtract expenses, add income
//             },
//           },
//         });
//       }
//     });

//     revalidatePath("/dashboard");
//     revalidatePath("/account/[id]");

//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }
export async function bulkDeleteTransactions(transactionIds){
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // fetch transactions
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    // calculate balance changes
    const accountBalanceChanges = transactions.reduce((acc, t) => {
      const change = t.type === "EXPENSE" ? t.amount : -t.amount;
      acc[t.accountId] = (acc[t.accountId] || 0) + change;
      return acc;
    }, {});

    await db.$transaction(async (tx) => {
      // FIX: correct model name
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // update balances
      for (const [accountId, change] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              // FIX: correct operator
              increment: change,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

