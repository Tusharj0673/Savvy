import arcjet, { tokenBucket } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
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

