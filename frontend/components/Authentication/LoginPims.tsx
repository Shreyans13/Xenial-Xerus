import React from "react";
import { SafeAreaView } from "react-native";
import {
  Colors,
  Button,
  TextInput,
  Snackbar,
  ProgressBar,
  Headline,
  Caption,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFullName } from "../../ApiLayer/Api";
import { signOut } from "./utils";
export default function LoginPims({ navigation, route }: any) {
  const [uid, setUid] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [visible, setVisible] = React.useState<boolean>(false);
  const [validating, setValidating] = React.useState<boolean>(false);
  const [credsFound, setCredsFound] = React.useState<boolean>(true);
  const [message, setMessage] = React.useState<string>("");

  const showMessage = (message: string) => {
    setMessage(message);
    setVisible(true);
  };

  // const setUserName = async (uid: string, password: string) => {
  //   try {
  //     const response = await getFullName(uid, password);
  //     // in order to use full name for future
  //     if (response.full_name) {
  //       try {
  //         await AsyncStorage.setItem("full_name", response.full_name);
  //         console.log("Setting full name");
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     }

  //     if (response.exists && response.full_name) {
  //       navigation.replace("Home");
  //     } else {
  //       navigation.replace("Sign Up", { fullName: response.full_name });
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     console.log("Error setting user");
  //   }
  // };

  const recordCreds = async (uid: string, password: string) => {
    try {
      AsyncStorage.setItem("uid", uid);
      AsyncStorage.setItem("password", password);
    } catch (e) {
      console.log("Error setting creds RecordCreds(LoginPims)");
    }
  };

  const validate = async () => {
    setValidating(true);
    try {
      const { exists, full_name, error } = await getFullName(uid, password);
      setValidating(false);
      if (error) {
        showMessage(error);
      } else {
        if (full_name) await recordCreds(uid, password);
        return exists && full_name
          ? navigation.replace("Home")
          : navigation.replace("Sign Up", { fullName: full_name });
      }
    } catch (e) {
      console.log("Something went wrong in checkingUser (LoginPims)");
    }
  };

  const checkCredsInStorage = async () => {
    try {
      const uid = await AsyncStorage.getItem("uid");
      const password = await AsyncStorage.getItem("password");
      if (uid !== null && password !== null) {
        const { full_name } = await getFullName(uid, password);
        if (full_name) return navigation.replace("Home");
        else {
          // API return invalid, remove local creds, show sign in screen
          setCredsFound(false);
          await signOut();
          showMessage(
            "Looks like your password is changed, please SignIn again"
          );
        }
      } else {
        setCredsFound(false);
      }
    } catch (e) {
      setCredsFound(false);
      console.log(e);
    }
  };

  React.useEffect(() => {
    checkCredsInStorage();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        padding: 12,
      }}
    >
      {credsFound ? (
        <>
          <Headline>Validating...</Headline>
          <Caption>Handshaking with CUIMS</Caption>
          <ProgressBar style={{ marginTop: 4 }} indeterminate={true} />
        </>
      ) : (
        <>
          <TextInput
            style={{ marginVertical: 6 }}
            selectionColor={Colors.green200}
            mode={"outlined"}
            label="UID"
            value={uid}
            onChangeText={(uid) => setUid(uid)}
          />
          <TextInput
            style={{ marginVertical: 6 }}
            selectionColor={Colors.green200}
            mode={"outlined"}
            label="Password"
            value={password}
            onChangeText={(password) => setPassword(password)}
            secureTextEntry={true}
            returnKeyType={"done"}
          />
          <Button
            style={{ marginVertical: 12 }}
            icon={"key"}
            loading={validating ? true : false}
            mode="contained"
            disabled={uid.length < 1}
            onPress={validating ? undefined : validate}
          >
            Login
          </Button>
        </>
      )}

      <Snackbar
        visible={visible}
        style={{ width: "100%" }}
        onDismiss={() => setVisible(false)}
        action={{
          label: "Ok",
          onPress: () => {
            setVisible(false);
          },
        }}
      >
        {message}
      </Snackbar>
    </SafeAreaView>
  );
}
