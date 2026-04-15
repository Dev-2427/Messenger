import { Stack } from "expo-router";

export default function Welcome() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcomeScreen" />
        </Stack>
    )
}