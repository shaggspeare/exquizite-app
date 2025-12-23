import { Stack } from 'expo-router';

export default function SetsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/play" />
    </Stack>
  );
}
