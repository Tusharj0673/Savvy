// import { Inngest } from "inngest";

// // Create a client to send and receive events
// export const inngest = new Inngest({ id: "savvy", name: "savvy" , retryFunction: async(attempt)=>({
//     delay: Math.pow(2,attempt)*1000 ,
//     maxAttempts:2,
// }),
// });

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "savvy",
  name: "Savvy",
  // keep retry function exactly how you want
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 2,
  }),
});


