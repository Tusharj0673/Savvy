import arcjet, { tokenBucket } from "@arcjet/node";

const ARCJET_KEY = process.env.ARCJET_KEY;

if (!ARCJET_KEY) {
  throw new Error("ARCJET_KEY is missing");
}

export const aj = arcjet({
  key: ARCJET_KEY,
  characteristics: ["userId"],

  rules: [
    tokenBucket({
      mode: "LIVE",
      capacity: 4,     // max 2 transactions
      refillRate: 4,   // refill 2 tokens
      interval: 3600,  // per 1 hour
    }),
  ],
});

export default aj;


