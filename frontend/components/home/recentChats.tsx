import React, { useCallback, useEffect } from 'react'
import { FlatList, Image, Pressable, Text, View } from 'react-native'
import useChatAndMessageStore from '../../stores/chatAndMessageStore'
import useAuthStore from '../../stores/authStore'
import Ionicons from '@expo/vector-icons/Ionicons';
import AllUsers from './allUsers'
import { ChatItemSkeleton } from '../loadingSkeletons/recentChats'
import { useFocusEffect } from 'expo-router';
import { safePush } from '../../helpers/safeNavigation';
import { Chats } from '../../types';
import { useThemeStore } from '../../stores/useThemeStore';
import * as Haptics from "expo-haptics";

export const formatMessageTime = (dateString: string): string => {
  const messageDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

  const diffTime = today.getTime() - msgDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

export default function RecentChats() {

  const getRecentChats = useChatAndMessageStore((state) => state.getRecentChats)
  const gettingChats = useChatAndMessageStore((state) => state.gettingChats)
  const chats = useChatAndMessageStore((state) => state.chats)
  const putChatIdToDeleteArray = useChatAndMessageStore((state) => state.putChatIdToDeleteArray)
  const chatIdsToDelete = useChatAndMessageStore((state) => state.chatIdsToDelete)
  const removeChatIdToDeleteArray = useChatAndMessageStore((state) => state.removeChatIdToDeleteArray)
  const clearChatIdToDeleteArray = useChatAndMessageStore((state) => state.clearChatIdToDeleteArray)

  const user = useAuthStore((state) => state.user)
  const mode = useThemeStore((s) => s.mode)

  const [refreshing, setRefreshing] = React.useState(false)

  useEffect(() => {
    getRecentChats()
  }, [])

  useFocusEffect(
    useCallback(() => {

      return () => {
        clearChatIdToDeleteArray()
      }
    }, [])
  )


  const onRefresh = async () => {
    setRefreshing(true)
    await getRecentChats()
    setRefreshing(false)
  }

  const skeletonData = [1, 2, 3, 4, 5];

  const isLight = mode === 'light'

  return (
    <FlatList<Chats | number>
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={(gettingChats ? skeletonData : chats) as (Chats | number)[]}
      keyExtractor={(item, index) => gettingChats ? `skeleton-${index}` : (item as Chats)._id}
      ListHeaderComponent={<AllUsers />}
      contentContainerStyle={{ paddingTop: 16 }}
      renderItem={({ item }) =>
        gettingChats ? (
          <ChatItemSkeleton />
        ) : (
          (() => {
            const chatItem = item as Chats;
            let style;
            if (chatItem.lastMessage.senderId === user.id) {
              style = isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(225, 225, 225, 0.55)'
            } else if (chatItem.lastMessage.senderId !== user.id && chatItem.lastMessage.status === 'read') {
              style = isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(225, 225, 225, 0.55)'
            } else if (chatItem.lastMessage.senderId !== user.id && chatItem.lastMessage.status !== 'read') {
              style = isLight ? '#0584FE' : '#19A3FE'
            } else {
              style = isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(225, 225, 225, 0.55)'
            }

            const chatId = chatItem.lastMessage.senderId !== user.id && chatItem.lastMessage.status !== 'read' ? chatItem._id : null
            return (
              <Pressable
                className={`mb-2 px-4 py-3 ${!chatIdsToDelete && 'active:opacity-70'}`}
                style={{
                  backgroundColor: chatIdsToDelete?.includes(chatItem._id)
                    ? (isLight ? 'rgba(5, 132, 254, 0.15)' : 'rgba(5, 132, 254, 0.25)')
                    : 'transparent',
                }}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                  chatIdsToDelete?.includes(chatItem._id) ? removeChatIdToDeleteArray(chatItem._id)
                    : putChatIdToDeleteArray(chatItem._id)
                }}
                onPress={() => {
                  if (chatIdsToDelete?.length && chatIdsToDelete.includes(chatItem._id)) {
                    return removeChatIdToDeleteArray(chatItem._id)
                  } else if (chatIdsToDelete?.length && !chatIdsToDelete.includes(chatItem._id)) {
                    return putChatIdToDeleteArray(chatItem._id)
                  } else {
                    safePush({
                      pathname: `/messages/messageScreen/${chatItem._id}`,
                      params: { chatIdForRead: chatId }
                    })
                  }
                }}
              >
                <View
                  style={{
                    height: 60,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={{ width: 60, height: 60 }}>
                      {chatItem.chatAvatar ?
                        <Image
                          className='w-[60px] h-[60px] rounded-full'
                          source={{ uri: chatItem.chatAvatar }}
                          resizeMode="cover" />
                        :
                        <View className='w-[60px] h-[60px] rounded-full bg-gray-200 justify-center items-center overflow-hidden'>
                          <Text className='text-[32px] text-center leading-[32px]'>{chatItem.chatName.charAt(0)}</Text>
                        </View>
                      }
                    </View>

                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        height: 60,
                      }}
                    >
                      <Text className={`font-medium text-[17px] ${isLight ? 'text-[#000000]' : 'text-[#eae9e9]'}`}>{chatItem.chatName}</Text>

                      <View className='flex-row justify-center items-center gap-2'>
                        <Text className='text-[14px]'
                          style={{ color: style! }}
                        >{chatItem.lastMessage.senderId === user.id && 'You:'} {chatItem.lastMessage.text || 'Media'}</Text>
                        <Text
                          className='text-[14px]'
                          style={{ color: style! }}>
                          •{formatMessageTime(chatItem.lastMessage.time)}</Text>
                      </View>
                    </View>
                  </View>

                  <Ionicons
                    style={{ paddingRight: 0 }}
                    name={chatItem.lastMessage.status === 'sent' ? 'checkmark-circle-outline' : chatItem.lastMessage.status === 'read' ? 'checkmark-done-circle' : 'checkmark-done-circle'}
                    color={style}
                    size={22}
                  />
                </View>
              </Pressable>
            );
          })()
        )
      }
    />
  )
}