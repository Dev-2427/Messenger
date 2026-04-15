import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import User from '../../components/home/user'
import CommunityPeople from '../../components/home/communityPeople'
import { useThemeStore } from '../../stores/useThemeStore'

export default function Peoples() {

  const mode = useThemeStore((s) => s.mode)


  return (
    <SafeAreaView className={`flex-1 ${mode === 'light' ? 'bg-[#ffffff]': 'bg-[#000000]'}`}>
      < User screen = 'Community' btn1 = 'chatbubble-ellipses-sharp' btn2 = 'user-plus' />

        <CommunityPeople />

    </SafeAreaView >
  )
}