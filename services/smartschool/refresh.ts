import { LoginWithToken, SmartSchool } from "smartschooljs";

import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";
import * as device from "expo-device";

export async function refreshSkolengoAccount(
  accountId: string,
  credentials: Auth
): Promise<{auth: Auth, session: SmartSchool}> {
  if (!credentials.refreshToken) {
    error("Unable to find refreshToken")
  }
  const refreshUrl: string = String(credentials.additionals?.["refreshUrl"] || "");
  const session = await LoginWithToken(refreshUrl, credentials.refreshToken, device.osName ?? "", device.deviceName ?? "", device.modelId ?? "");

  const authData: Auth = {
    accessToken: session.refreshToken,
    refreshToken: session.refreshToken,
  }

  useAccountStore.getState().updateServiceAuthData(accountId, authData)
  
  return { auth: authData, session }
}