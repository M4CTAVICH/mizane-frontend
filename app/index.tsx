import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuthStore } from "../store/authStore";

// Launch gate: restore any persisted session, then route into the app or
// onboarding. The root canvas stays black behind the splash while we check.
export default function Index() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    bootstrap().then((ok) => {
      setAuthed(ok);
      setReady(true);
    });
  }, [bootstrap]);

  if (!ready) return <View style={{ flex: 1 }} />;
  return <Redirect href={authed ? "/(tabs)" : "/(auth)/welcome"} />;
}
