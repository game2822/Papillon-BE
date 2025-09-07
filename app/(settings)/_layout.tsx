import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { screenOptions } from "@/utils/theme/ScreenOptions";
import { Platform } from "react-native";

/**
 * Settings stack layout component that configures and returns the navigator for all settings-related screens.
 *
 * Renders an Expo Router Stack with memoized base screen options (shows headers, uses `runsIOS26()` for large-title behavior,
 * and enables back visibility) and declares each settings screen with localized header titles and screen-specific options.
 *
 * @returns The configured Stack navigator for the settings section.
 */
export default function Layout() {
  const { t } = useTranslation();

  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    headerLargeTitle: runsIOS26(),
    headerBackVisible: true,
  }), []);

  return (
    <Stack screenOptions={newScreenOptions}>
      <Stack.Screen
        name="settings"
        options={{
          headerTitle: t("Tab_Settings"),
        }}
      />

      <Stack.Screen
        name="services"
        options={{
          headerTitle: t("Settings_Services_Title"),
          headerShown: true,
          headerLargeTitle: false,
          headerTransparent: false,
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="personalization"
        options={{
          headerTitle: t("Settings_Personalization_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerLargeTitle: false,
        }}
      />

      <Stack.Screen
        name="cards"
        options={{
          headerShown: true,
          headerTitle: t("Settings_Cards_Title"),
          headerLargeTitle: false,
          headerTransparent: false,
          headerBackButtonDisplayMode: "minimal",
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          headerTitle: t("Settings_About_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: Platform.OS === "ios",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="magic"
        options={{
          headerTitle: t("Settings_MagicPlus_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: Platform.OS === "ios",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="subject_personalization"
        options={{
          headerTitle: t("Settings_SubjectPersonalization_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="edit_subject"
        options={{
          headerTitle: t("Settings_SubjectEdit_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerShown: false,
          presentation: "modal",
          contentStyle: {
            borderRadius: Platform.OS === 'ios' ? 30 : 0,
          }
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          headerTitle: t("Settings_Language_Title"),
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
