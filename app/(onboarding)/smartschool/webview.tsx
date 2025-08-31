import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import uuid from "@/utils/uuid/uuid";
import { router, useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { finalizeLogin, GetOIDCAccessTokens, getSmartschoolLoginUrl, REDIRECT_URI } from "smartschooljs";
import OnboardingWebview from "@/components/onboarding/OnboardingWebview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { useTranslation } from "react-i18next";
import * as Device from 'expo-device';

export default function WebViewScreen() {
  const { url: InstanceURL } = useGlobalSearchParams<{ url: string }>();
  const [loginURL, setLoginURL] = useState<string | undefined>(undefined);
  const [deviceUUID] = useState(uuid());

  useEffect(() => {
    const getSmscLoginURL = async () => {
      console.log("WebViewScreen initialized with URL:", InstanceURL);
      const loginUrl = await getSmartschoolLoginUrl(InstanceURL);
      setLoginURL(loginUrl);
      console.log("Login URL:", loginUrl);
      console.log("loginurlvalue", loginURL);
    };

    getSmscLoginURL();
  }, []);

  const handleRequest = async (request: { url: string }) => {
    const { url } = request;
    if (url.startsWith("https://dbwsl.smartschool.be/OAuth/mobile/success")) {
      const code = url.match(/code=([^&]*)/)

      if (!code) return false;

      const auth = await finalizeLogin(InstanceURL, code[1], Device.osName ?? "", Device.deviceName ?? "", deviceUUID)
      console.log("Auth Data:", auth.toString());
      const store = useAccountStore.getState();
      const id = uuid()

      const account: Account = {
        id,
        firstName: auth?.firstName ?? "",
        lastName: auth?.lastName ?? "",
        schoolName: "schoolName",
        className: auth?.className,
        services: [
          {
            id: id,
            auth: {
              session: auth
            },
            serviceId: Services.SMARTSCHOOL,
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString()
          }
        ],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      }

      store.addAccount(account)
      store.setLastUsedAccount(id)

      router.push({
        pathname: "../end/color",
        params: {
          accountId: id
        }
      });

      return false;
    }
    return true;
  };

  const { t } = useTranslation();

  return (
    <OnboardingWebview
      key={loginURL} // alors jsp pk ca marche mais si je le met pas la webview load att la login url a l'infini
      title={t("ONBOARDING_WEBVIEW_TITLE")}
      color={"#E50052"}
      step={3}
      totalSteps={3}
      webviewProps={{
        source: loginURL
          ? { uri: loginURL }
          : { html: "<h1>Chargement...</h1>" },
        onShouldStartLoadWithRequest: (request: ShouldStartLoadRequest) => {
          if (request.url.startsWith("https://dbwsl.smartschool.be/OAuth/mobile/success")) {
            handleRequest(request);
            return false;
          }

          return true;
        }
      }}
    />
  );
}