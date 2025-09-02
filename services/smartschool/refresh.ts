import { SmartSchool } from "smartschooljs";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";

export async function refreshSkolengoAccount(
  accountId: string,
  session: SmartSchool
): Promise<{auth: Auth, session: SmartSchool}> {
  log("Session object" + JSON.stringify(session, null, 2));
  await session.refreshAccessToken();
  const authData: Auth = {
    session
  }

  log("Refreshed Smartschool account")
  log("Auth Data" + JSON.stringify(authData, null, 2))
  log ("Session Data" + JSON.stringify(session, null, 2))
  useAccountStore.getState().updateServiceAuthData(accountId, authData)

  return { auth: authData, session }
}