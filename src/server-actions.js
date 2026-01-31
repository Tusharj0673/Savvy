"use server";

import { updateDefaultAccount } from "../actions/accounts";

export async function updateDefaultAccountAction(accountId) {
  return await updateDefaultAccount(accountId);
}


