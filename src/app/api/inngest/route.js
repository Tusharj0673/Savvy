// import { serve } from "inngest/next";
// import { inngest } from "@/lib/inngest/client";
// import { helloWorld } from "@/lib/inngest/functions";

// // Create an API that serves zero functions
// export const { GET, POST} = serve({
//   client: inngest,
//   functions: [
//     /* your functions will be passed here later! */
//     helloWorld,
//   ],
// });

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {checkBudgetAlert, generateMonthlyReports, processRecurringTransaction, triggerRecurringTransactions} from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [checkBudgetAlert,triggerRecurringTransactions,processRecurringTransaction,generateMonthlyReports,],
});

