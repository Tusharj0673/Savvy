"use server";
import {db} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { subBusinessDays } from "date-fns";
import { revalidatePath } from "next/cache";  

// const serializeTransaction = (obj) =>{
//    const serialzied ={...obj};
//    if(obj.balance){
//       serialzied.balance = obj.balance.toNumber();
//    }
// };
const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance?.toNumber) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.balance = obj.amount.toNumber();
  }
  
  return serialized;
};

export async function createAccount(data){
    try{
     const {userId}= await auth();
     if(!userId) throw new Error("Unauthorised");

     const user = await db.user.findUnique({
        where:{clerkUserId: userId},
     });

     if(!user){
        throw new Error("User not found");
     }

     // Conver balance to float
     const balanceFloat  = parseFloat(data.balance);
     if(isNaN(balanceFloat)){
      throw new Error("Invalid balance amount");
     }
  // to check if user's first account
    const existingAccounts = await db.account.findMany({
where:{userId:user.id},
    });
   
    const shouldBeDefault = existingAccounts.length===0 ? true : data.isDefault;

    if(shouldBeDefault){
      await db.account.updateMany({
// where: {userId :userId, isDefault: true},
where: { userId: user.id, isDefault: true },

data: {isDefault : false},
      });
    }

    const account = await db.account.create({
      data:{
         ...data,
         balance: balanceFloat,
         userId: user.id,
         isDefault : shouldBeDefault,
      },
    });
    const serialzedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return {success: true , data :serialzedAccount};
    }
    catch(error){
      throw new Error(error.message);
    }
}


export async function getUserAccounts(){
const {userId}= await auth();
     if(!userId) throw new Error("Unauthorised");

     const user = await db.user.findUnique({
        where:{clerkUserId: userId},
     });

     if(!user){
        throw new Error("User not found");
     }

     const accounts = await db.account.findMany({
      where :{userId: user.id},
      orderBy:{createdAt :"desc"},
   include:{
      _count:{
         select:{
         transactions:true,
         },
      },
   },
     });
     const serialzedAccount = accounts.map(serializeTransaction);  
     return serialzedAccount;

}


export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}