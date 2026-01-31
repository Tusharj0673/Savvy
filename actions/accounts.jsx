"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { success } from "zod";

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

