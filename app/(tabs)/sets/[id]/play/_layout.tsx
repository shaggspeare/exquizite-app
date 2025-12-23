import { Stack } from 'expo-router';

export default function PlayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="template" />
      <Stack.Screen name="flashcard" />
      <Stack.Screen name="match" />
      <Stack.Screen name="quiz" />
    </Stack>
  );
}
