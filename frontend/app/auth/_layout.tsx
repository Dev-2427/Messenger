import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="authentication" options={{
                headerShown: false
            }} />
            <Stack.Screen name="sendEmail" options={{
                headerShown: false
            }} />
            <Stack.Screen name="resetPassword" options={{
                headerShown: false
            }} />
            <Stack.Screen name="verifyCode" options={{
                headerShown: false
            }} />
        </Stack>
    )
}