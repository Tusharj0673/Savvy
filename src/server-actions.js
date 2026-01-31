"use server";

// Import your actual server function (allowed)
import { updateDefaultAccount } from "../actions/accounts";

export async function updateDefaultAccountAction(accountId) {
  return await updateDefaultAccount(accountId);
}


