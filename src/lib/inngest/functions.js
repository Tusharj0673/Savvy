import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "../../emails/template";
import { Resend } from "resend";
import { GoogleGenerativeAI } from "@google/generative-ai";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alert" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    console.log("Fetching budgets...");
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true },
              },
            },
          },
        },
      });
    });
    console.log(`Fetched ${budgets.length} budgets`);

    // Process all budgets in parallel
    await Promise.all(
      budgets.map(async (budget) => {
        const defaultAccount = budget.user.accounts[0];
        if (!defaultAccount) return;

        await step.run(`check-budget-${budget.id}`, async () => {
          console.log("Checking budget:", budget.id);

          const currentDate = new Date();
          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          );

          const expenses = await db.transaction.aggregate({
            where: {
              userId: budget.userId,
              accountId: defaultAccount.id,
              type: "EXPENSE",
              date: { gte: startOfMonth, lte: endOfMonth },
            },
            _sum: { amount: true },
          });

          const totalExpenses = expenses._sum.amount?.toNumber() || 0;
          const budgetAmount = budget.amount;
          const percentageUsed = (totalExpenses / budgetAmount) * 100;

          console.log(
            `Budget ${budget.id} - Total: ${totalExpenses}, Budget: ${budgetAmount}, Used: ${percentageUsed.toFixed(
              1
            )}%`
          );

          if (
            percentageUsed >= 80 &&
            (!budget.lastAlertSent ||
              isNewMonth(new Date(budget.lastAlertSent), new Date()))
          ) {
            console.log("Sending email to:", budget.user.email);

            // Wrap in timeout to prevent hanging
            try {
              await Promise.race([
                resend.emails.send({
                  from: "Finance App <onboarding@resend.dev>",
                  to: budget.user.email,
                  subject: `Budget Alert for ${defaultAccount.name}`,
                  react: EmailTemplate({
                    userName: budget.user.name,
                    type: "budget-alert",
                    data: {
                      percentageUsed,
                      budgetAmount: Number(budgetAmount).toFixed(1),
                      totalExpenses: Number(totalExpenses).toFixed(1),
                      accountName: defaultAccount.name,
                    },
                  }),
                }),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Email send timeout")), 10000)
                ),
              ]);
              console.log("Email sent successfully!");
            } catch (error) {
              console.error("Failed to send email:", error);
            }

            // Update last alert sent
            await db.budget.update({
              where: { id: budget.id },
              data: { lastAlertSent: new Date() },
            });
          }
        });
      })
    );

    console.log("All budgets processed");
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", 
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({step})=>{
const recurringTransactions = await step.run(
  "fetch-recurring-transactions",
  async ()=>{
    return await db.transaction.findMany({
      where:{
        isRecurring:true,
        status:"COMPLETED",
        OR:[
{lastProcessed: null},
{nextRecurringDate:{lte:new Date()}},//due date passed
        ],
      }
    })
  }
);

if (recurringTransactions.length>0){
  const events  = recurringTransactions.map((transaction)=>({
name:"transaction.recurring.process",
data:{transactionId: transaction.id,userId: transaction.userId},
  }));
  await inngest.send(events);
}

return {triggered: recurringTransactions.length};
  }
);


export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle:{
      limit:10,
      period:"1m",
      key:"event.data.userId",
    },
  },
  {event:"transaction.recurring.process"},
    async ({ event, step, stop }) => {

    if(!event?.data?.transactionId || !event?.data?.userId){
      console.error("Invalid event data:", event);
      return {error: "Missing required event data"};
    }
    await step.run("process-transaction",async()=>{
           const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
    });
const isManualRun = event.data?.manual === true;

if (!transaction) {
  await stop("Transaction not found");
  return;
}

if (!isManualRun && !isTransactionDue(transaction)) {
  await stop("Transaction not due yet");
  return;
}


await db.$transaction(async (tx)=>{
  await tx.transaction.create({
     data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
  });
         // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });


        //update last processed date
        await tx.transaction.update({
          where:{id:transaction.id},
          data:{
            lastProcessed:new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
});
  });
  }
);

function isTransactionDue(transaction){
  if(!transaction.lastProcessed) return true;
  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  return nextDue<=today;
}

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, 
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return db.user.findMany();
    });

    for (const user of users) {
      await step.run(`monthly-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });
        const insights = await generateFinancialInsights(stats, monthName);

        try {
          await Promise.race([
            resend.emails.send({
              from: "Finance App <onboarding@resend.dev>",
              to: user.email,
              subject: `Your Monthly Financial Report - ${monthName}`,
              react: EmailTemplate({
                userName: user.name ?? "",
                type: "monthly-report",
                data: {
                  stats,
                  month: monthName,
                  insights,
                },
              }),
            }),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Monthly report email timeout")),
                10000
              )
            ),
          ]);

          console.log(`Monthly report sent to ${user.email}`);
        } catch (error) {
          console.error(
            `Failed to send monthly report to ${user.email}`,
            error
          );
        }
      });
    }

    return { processed: users.length };
  }
);

async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: ₹${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}
async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const stats = transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();

      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }

      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
  stats.totalIncome = Number(stats.totalIncome.toFixed(2));
  stats.totalExpenses = Number(stats.totalExpenses.toFixed(2));

  for (const category in stats.byCategory) {
    stats.byCategory[category] = Number(
      stats.byCategory[category].toFixed(2)
    );
  }

  return stats;
}
