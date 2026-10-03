import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { palette } from '@/constants/Theme';
import { StudyProvider } from '@/contexts/StudyContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: palette.background,
      card: palette.background,
      text: palette.ink,
      primary: palette.green,
      border: palette.line,
    },
  };

  return (
    <StudyProvider>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: palette.background } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="topic/[slug]" options={{ title: '知识点' }} />
          <Stack.Screen name="problem/[id]" options={{ title: '例题解析' }} />
          <Stack.Screen name="saved" options={{ title: '我的学习' }} />
          <Stack.Screen name="settings" options={{ title: '设置与关于' }} />
          <Stack.Screen name="privacy" options={{ title: '隐私政策' }} />
        </Stack>
      </ThemeProvider>
    </StudyProvider>
  );
}
