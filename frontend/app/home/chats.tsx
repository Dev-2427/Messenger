import { SafeAreaView } from 'react-native-safe-area-context'
import User from '../../components/home/user'
import RecentChats from '../../components/home/recentChats'
import { useThemeStore } from '../../stores/useThemeStore'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import useChatAndMessageStore from '../../stores/chatAndMessageStore'
import { BackHandler, ToastAndroid } from 'react-native'

export default function Home() {

    const mode = useThemeStore((s) => s.mode)

    const chatIdsToDelete = useChatAndMessageStore((s) => s.chatIdsToDelete)
    const clearChatIdToDeleteArray = useChatAndMessageStore((s) => s.clearChatIdToDeleteArray)

    useFocusEffect(
        useCallback(() => {
            function onBackPress() {
                if (chatIdsToDelete?.length) {
                    clearChatIdToDeleteArray()

                    ToastAndroid.show(
                        'Press back again to exit',
                        ToastAndroid.SHORT
                    )
                    return true
                }
                return false
            }

            const sub = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            )

            return () => sub.remove()
        }, [chatIdsToDelete])
    )

    return (
        <SafeAreaView className={`flex-1 ${mode === 'light' ? 'bg-[#ffffff]' : 'bg-[#000000]'}`}>
            <User screen='Chats' btn1='camera' btn2='edit' />

            <RecentChats />
        </SafeAreaView>
    )
}