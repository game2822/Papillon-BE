import { useHeaderHeight } from "expo-router/react-navigation";
import { useNavigation } from "expo-router";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Search from "@/ui/components/Search";
import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

const SmartSchoolSearchHeader = memo(({
}: {
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [baseURL, setbaseURL] = React.useState("");

  const submitURL = () => {
    if (baseURL.trim().length === 0) {return;}
    navigation.navigate("webview", { baseURL });
  };

  const urlValid = baseURL.trim().length > 0 && (baseURL.startsWith("http://") || baseURL.startsWith("https://"));

  return (
    <Stack padding={[4, 0]}>
      <Typography variant="h2">{t("ONBOARDING_URL")}</Typography>
      <Typography variant="action" color="textSecondary">{t("ONBOARDING_PRONOTE_LOCATION_HELP")}</Typography>
      <Divider height={6} ghost />
      <Search icon="link" placeholder={t("ONBOARDING_URL")} style={{ width: "100%" }} value={baseURL} setValue={setbaseURL} onTextChange={setbaseURL} autoFocus={baseURL.trim().length === 0} />

      <Divider height={3} ghost />
      <Button label={t("CONFIRM_BTN")} fullWidth height={44} onPress={() => submitURL()} disabled={!urlValid} />

      <Divider height={18} ghost />
    </Stack>
  )
});

export default function SmartSchoolLoginURL() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <List
        ListHeaderComponent={<SmartSchoolSearchHeader />}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          gap: 10,
          paddingTop: headerHeight + 20,
          paddingBottom: insets.bottom + 20,
        }}
        style={{ flex: 1 }}
        animated
      >
      </List>
    </KeyboardAvoidingView>
  )
}
