import { Stack, router, usePathname } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useEffect, useRef } from "react";
import useAuthStore from "../stores/authStore";
import { useThemeStore } from "../stores/useThemeStore";
import useUpdateProfile from "../stores/updateProfileStore";
import * as SplashScreen from 'expo-splash-screen'
import useSocketStore from "../stores/useSocketStore";
import NetInfo from '@react-native-community/netinfo'
import * as Notifications from "expo-notifications";
import { useShareIntent } from "expo-share-intent";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause this to error, which is fine */
});

export default function RootLayout() {

  const pathName = usePathname();
  const pathRef = useRef(pathName)
  const inset = useSafeAreaInsets();

  const lastNotificationResponse = Notifications.getLastNotificationResponse()

  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const mode = useThemeStore((s) => s.mode);
  const hydrated = useThemeStore((s) => s.hydrated);
  const hasHydrated = useUpdateProfile((s) => s.hasHydrated);

  const { disconnectSocket, connectSocket } = useSocketStore()

  const { hasShareIntent, resetShareIntent, shareIntent } = useShareIntent()

  // auth and socket
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user.id) {
      console.log('Connecting socket from layout')
      connectSocket()
    }

    if (!isAuthenticated && !isLoading) {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, user.id, isLoading])


  const ready = !isLoading && hydrated && hasHydrated;

  useEffect(() => {

    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready])


  // network error
  useEffect(() => {
    pathRef.current = pathName
  }, [pathName])

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {

      const currentPath = pathRef.current

      if (!state.isConnected && currentPath !== '/noInternet/no-internet') {
        router.push('/noInternet/no-internet')
      }

      if (state.isConnected && currentPath === '/noInternet/no-internet') {
        if (!isAuthenticated) {
          checkAuth()
        } else {
          router.back()
        }
      }
    })

    return () => unsub()
  }, [pathName])


  // notifications - handle tap when app is killed or backgrounded
  useEffect(() => {

    if (!ready) return

    if (lastNotificationResponse) {
      const data = lastNotificationResponse.notification.request.content.data;
      if (data?.chatId) {
        setTimeout(() => {
          router.push({
            pathname: `/messages/messageScreen/${data.chatId}`,
            params: { type: String(data.type) }
          });
        }, 5000);
      }
    }

    // ✅ BACKGROUND APP: user taps notification while app is in background
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.chatId) {
        router.push({
          pathname: `/messages/messageScreen/${data.chatId}`,
          params: { type: String(data.type) }
        });
      }
    });

    return () => responseSub.remove();
  }, [ready]); // ← empty deps, run once on mount

  // share intent
  useEffect(() => {
    if (hasShareIntent) {
      console.log('share', shareIntent)
      router.push({
        pathname: '/shareMessage/share',
        params: {
          sharedText: shareIntent?.text || '',
          sharedFileUri: shareIntent?.files?.[0]?.path || '',
          sharedFileMime: shareIntent?.files?.[0]?.mimeType || '',
        }
      })
      resetShareIntent()
    }
  }, [hasShareIntent])

  return (
    <SafeAreaProvider style={{ paddingBottom: inset.bottom }}>
      <StatusBar style={mode === "light" ? "dark" : "light"} />
      {ready && (
        <>
          <Stack screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: mode === "dark" ? "#000" : "#fff",
            },
          }} />
          <Toast />
        </>
      )}
    </SafeAreaProvider>
  );
}
