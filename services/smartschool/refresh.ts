import { LoginWithToken, SmartSchool } from "smartschooljs";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { error, log } from "@/utils/logger/logger";
import * as device from "expo-device";

export async function refreshSkolengoAccount(
  accountId: string,
  credentials: Auth
): Promise<{auth: Auth, session: SmartSchool}> {
  if (!credentials.refreshToken) {
    throw new Error("No refresh token available");
  }
  const refreshUrl: string = String(credentials.additionals?.["refreshUrl"] || "");
  const SMSCMobileID: string = String(credentials.additionals?.["SmscMobileId"] || "");
  if (!refreshUrl) {
    error("No refresh URL available", "refreshSkolengoAccount");
  }
  const session = await LoginWithToken(refreshUrl, credentials.refreshToken, SMSCMobileID);

   const authData: Auth = {
    accessToken: session.refreshToken,
    refreshToken: session.refreshToken,
    additionals: {
      refreshUrl: session.refreshURL,
      SmscMobileId: SMSCMobileID,
    }
  }
  useAccountStore.getState().updateServiceAuthData(accountId, authData)
  
  return { auth: authData, session }
}