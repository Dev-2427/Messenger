import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import useAuthStore from "../../stores/authStore";
import { useThemeStore } from "../../stores/useThemeStore";
import useChatAndMessageStore from "../../stores/chatAndMessageStore";
import { useMemo } from "react";

export default function Welcome() {

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const user = useAuthStore((state) => state.user);
    const mode = useThemeStore((s) => s.mode)

    const chats = useChatAndMessageStore((s) => s.chats);

    const badgeNumber = useMemo(() => {
        return chats?.filter(chat =>
            chat.lastMessage.senderId !== user.id &&
            chat.lastMessage.status !== 'read'
        ).length;
    }, [chats, user.id]);

    if (isLoading) return null;


    if (!isAuthenticated) {
        return <Redirect href="/auth" />;
    }

    const isLight = mode === 'light'

    return <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isLight ? '#000000' : '#ffffff',
        tabBarInactiveTintColor: isLight ? '#A4AAB2' : '#676E75',
        tabBarStyle: {
            backgroundColor: isLight ? '#ffffff' : '#000000',
            borderWidth: 0,
            elevation: 8,
            shadowColor: isLight ? '#000' : '#fff',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 78,
        },
        tabBarLabelStyle: {
            fontSize: 15,
            fontWeight: '700'
        }
    }}>
        <Tabs.Screen name="chats"
            options={{
                title: 'Chats',
                // tabBarBadge: 3,
                tabBarBadge: badgeNumber > 0 ? badgeNumber : undefined,
                tabBarBadgeStyle: {
                    backgroundColor: isLight ? '#DCF0D7' : '#14532d',
                    color: '#54D439'
                },
                tabBarIcon: ({ focused }) => (
                    isLight ? (<Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={27} color={focused ? 'black' : '#A4AAB2'} />)
                        :
                        (<Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={27} color={focused ? 'white' : '#676E75'} />)

                )
            }}
        />
        <Tabs.Screen name="community"
            options={{
                title: 'Community',
                tabBarIcon: ({ focused }) => (
                    isLight ? (
                        <Ionicons name={focused ? 'people' : 'people-outline'} size={27} color={focused ? 'black' : '#A4AAB2'} />
                    ) :
                        (
                            <Ionicons name={focused ? 'people' : 'people-outline'} size={27} color={focused ? 'white' : '#676e75'} />
                        )
                )
            }}
        />

    </Tabs>
}