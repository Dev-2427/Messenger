import { Stack } from 'expo-router';

export default function MessagesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="messageScreen/[id]"
            />
            <Stack.Screen
                name="userDetails/[id]"
            />
        </Stack>
    );
}