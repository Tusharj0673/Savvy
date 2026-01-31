import { seedTransactions } from "../../../../actions/seed";
import aj from "@/lib/arcjet";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET(req) {
  // Get user from Clerk
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Arcjet protection
  const decision = await aj.protect(req, { userId });

  if (decision.isDenied()) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  const result = await seedTransactions();
  return Response.json(result);
}
