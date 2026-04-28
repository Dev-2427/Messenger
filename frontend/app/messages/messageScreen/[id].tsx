import { View, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import MessageScreenHeader from "../../../components/messages/messageHeader";
import { router, useLocalSearchParams } from 'expo-router';
import useGetUsers, { User } from '../../../stores/getUsersStore';
import { StatusBar } from 'expo-status-bar';
import Textbar from '../../../components/messages/textbar';
import useChatAndMessageStore, { FileMeta } from '../../../stores/chatAndMessageStore';
import { Chats } from '../../../types';
import Messages from '../../../components/messages/messages';
import { useThemeStore } from '../../../stores/useThemeStore';

export default function MessageScreen() {

  const { id, chatIdForRead, sharedText, sharedFileUri, sharedFileMime } = useLocalSearchParams()
  const allUsers = useGetUsers((state) => state.users)
  const setReceiverId = useChatAndMessageStore((state) => state.setReceiverId)
  const chats = useChatAndMessageStore((state) => state.chats)
  const setChatId = useChatAndMessageStore((state) => state.setChatId)
  const resetFileAndText = useChatAndMessageStore((state) => state.resetFileAndText)
  const markMessageAsRead = useChatAndMessageStore((state) => state.markMessageAsRead)
  const setMessage = useChatAndMessageStore((state) => state.setMessage)
  const addFileToArray = useChatAndMessageStore((state) => state.addFileToArray)

  const mode = useThemeStore((s) => s.mode)


  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  useEffect(() => {
    if (chatIdForRead) {
      markMessageAsRead(String(chatIdForRead))
    }
    return () => {
      setChatId(null)
      setReceiverId(null)
      resetFileAndText()
    }
  }, [])


  useEffect(() => {
    if (!id) {
      router.replace('/home')
      return
    }
  }, [id, router])


  const user = allUsers.find((user) => String(user._id) === String(id))
  const chat = chats.find((chat) => String(chat._id) === String(id))


  useEffect(() => {
    if (!user && !chat) {
      router.replace('/home')
    }
  }, [user, chat, setReceiverId, setChatId])


  useEffect(() => {
    if (user) {
      setReceiverId(String(id))
    } else if (chat) {
      setChatId(String(id))
    }

  }, [user, chat, setChatId, setReceiverId])

  useEffect(() => {
    if (sharedText) {
      setMessage(sharedText.toString())
    }

    if (sharedFileUri) {
      const sharedFile: FileMeta = {
        uri: sharedFileUri as string,
        name: sharedFileUri.toString().split('/').pop() || `shared_${Date.now()}.jpg`,
        type: sharedFileMime as string,
        size: undefined,
        id: Date.now().toString(),
        kind: (sharedFileMime as string)?.startsWith('video') ? 'video' : 'image'
      }

      addFileToArray(sharedFile)
    }
  }, [])

  if (!id) {
    return null
  }

  if (!user || !chat) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }
  const avatar: string | null = user?.avatar ?? chat?.chatAvatar ?? null
  const name: string = user?.fullName ?? chat?.chatName ?? 'Unknown'
  const email: string | undefined = user?.email ?? chat?.otherUser?.email ?? undefined
  const ID: string = String(user?._id ?? chat?._id ?? id)
  const otherParticipantId: string | null = user?._id ?? chat?.otherUser?._id ?? null

  const lastSeen: Date | null = user?.lastSeen ?? chat?.otherUser?.lastSeen ?? null

  if (!id) {
    router.replace('/home')
    return null
  }

  return (
    <View style={{ flex: 1 }} className={`${mode === 'light' ? 'bg-[#ffffff]' : 'bg-[#000000]/90'} `}>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} backgroundColor={mode === 'light' ? '#e6e6e6' : '#ffffff'} />

      <MessageScreenHeader avatar={avatar as string} name={name as string} id={ID as string} email={email} otherParticipantId={otherParticipantId} lastSeen={lastSeen} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={keyboardVisible}
      >

        <View style={{ flex: 1 }}>
          <Messages  name={name} avatar={avatar as string} />
        </View>


        <Textbar />
      </KeyboardAvoidingView>
    </View>
  )
}
