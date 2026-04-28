import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { safePush } from '../../helpers/safeNavigation'
import { useThemeStore } from '../../stores/useThemeStore'
import useSocketStore from '../../stores/useSocketStore'
import useUpdateProfile from '../../stores/updateProfileStore'
import { formatMessageTime } from '../home/recentChats'

interface HeaderProps {
  avatar: string,
  name: string,
  id: string,
  email?: string
  otherParticipantId: string | null
  lastSeen: Date | null
}

export default function MessageScreenHeader({ avatar, name, id, email, otherParticipantId, lastSeen }: HeaderProps) {

  const mode = useThemeStore((state) => state.mode)
  const onlineUsers = useSocketStore((state) => state.onlineUsers)
  const showActiveStatus = useUpdateProfile((state) => state.showActiveStatus)

  const isLight = mode === 'light'
  return (
    <Pressable onPress={() => safePush({
      pathname: `/messages/userDetails/${id}`,
      params: { avatar, name, email }
    }
    )}
      className='flex-row gap-[12px] px-[19px] py-5 items-center active:opacity-70 pt-16'
      style={{ backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.9)' }}
    >

      <Pressable className='w-fit' onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={25} color={isLight ? "#0584FE" : '#19A3FE'} />
      </Pressable>

      {avatar ?
        <View className=''>
          <Image source={{ uri: avatar }} className='w-[36px] h-[36px] rounded-full' />
        </View>
        :
        <View className='w-[36px] h-[36px] rounded-full bg-gray-200 justify-center items-center'>
          <Text className='text-[25px] leading-[25px] text-center'>{name.charAt(0)}</Text>
        </View>
      }

      <View>
        <Text className={`text-[17px] font-bold ${!isLight && 'text-[#ffffff]'} `}>{name}</Text>
        {showActiveStatus && (

          onlineUsers.includes(id) || otherParticipantId && onlineUsers.includes(otherParticipantId) ?
            <Text className='text-[#9c9c9c] texxt-[13px]'>Online</Text>
            :
            (
              lastSeen &&
              <Text className='text-[#9c9c9c] text-[13px]'>Last seen: {formatMessageTime(lastSeen.toString())}</Text>
            )
        )
        }
      </View>

    </Pressable>
  )
}