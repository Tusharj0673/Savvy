// import arcjet, { tokenBucket } from "@arcjet/next";

// const aj = arcjet({
//     key : process.env.ARCJET_KEY,
//     characteristics: ["userId"],
//     rules: [
//         tokenBucket({
//             mode:"LIVE",
//             refillRate: 2,
//             interval:3600,
//             capacity:2,

//         }),
//     ],
// });

// export default aj;

import arcjet, { tokenBucket } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,

  // ✅ Rate limit per user
  characteristics: ["userId"],

  rules: [
    tokenBucket({
    mode:"LIVE",
      capacity: 2,      // max 2 transactions
      refillRate: 2,    // refill 2 tokens
      interval: 3600,   // every 1 hour
    }),
  ],
});

export default aj;

