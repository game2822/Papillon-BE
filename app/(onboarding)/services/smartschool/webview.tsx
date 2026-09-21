import { useRoute, useTheme } from "expo-router/react-navigation";

import * as Linking from "expo-linking";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView } from "react-native";
import { getSmartschoolLoginUrl, finalizeLogin } from "smartschooljs";

import * as Device from 'expo-device';
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";
import uuid from "@/utils/uuid/uuid";

import OnboardingWebView from "../../components/OnboardingWebView";
import { URLToBase64 } from "@/utils/attachments/helper";

export default function WebViewScreen() {
  const navigation = useNavigation();
  const [loginURL, setLoginURL] = useState<string | undefined>(undefined);
  const { params } = useRoute();
  const { baseURL } = params
  const [deviceUUID] = useState(uuid());

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const scheme = url.split(":")[0];
      if (scheme === "smsc") {
        log("[SmartSchool] Activation link received:", url);
        handleRequest(url);
      } else {
        log("[SmartSchool] Ignoring link:", url);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    Linking.addEventListener("url", handleDeepLink);
  }, []);


  const initLogin = useCallback(async () => {
  const loginUrl = await getSmartschoolLoginUrl(baseURL);
  setLoginURL(loginUrl);
  }, []);

  useEffect(() => {
    initLogin();
  }, [initLogin]);

  const handleRequest = async (url: string) => {
    if (url.includes("OAuth/mobile/success")) {
      const code = url.match(/code=([^&]*)/)

      if (!code) { return false; }

      const auth = await finalizeLogin(baseURL, code[1], Device.osName ?? "", `Papillon sur ${Device.deviceName ?? ""}`, deviceUUID)
      const store = useAccountStore.getState();
      const id = auth?.SMSCMobileID;

      const account: Account = {
        id,
        firstName: auth?.firstName,
        lastName: auth?.lastName,
        schoolName: auth?.SchoolName,
        className: auth?.className,
        customisation: {
          profilePicture: await URLToBase64(auth.pp ?? ""),
          subjects: {}
        },
        services: [
          {
            id: id,
            auth: {
              accessToken: auth.refreshToken,
              refreshToken: auth.refreshToken,
              additionals: {
                refreshUrl: auth.refreshURL,
                SmscMobileId: id
              }
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

      const parent = navigation.getParent();
              if (parent) {
                parent.goBack();

                const parentsParent = parent.getParent();
                if (parentsParent) {
                  parentsParent.goBack();
                }
              }

              router.back();
              router.dismissAll();
              return router.push("/");
    }
    return true;
  };

  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <OnboardingWebView
        source={loginURL ? { uri: loginURL } : { html: `<h1>${t("ONBOARDING_LOADING")}</h1>` }}
        onShouldStartLoadWithRequest={(request) => {
          handleRequest(request.url)
          return true;
        }}
      />
    </KeyboardAvoidingView>
  );
}
