import { View, Text, Pressable, Image, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import useGetUsers from '../../../stores/getUsersStore'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeStore } from '../../../stores/useThemeStore'

export default function UserDetails() {

  const { id, type, avatar, name, email } = useLocalSearchParams()

  const mode = useThemeStore((state) => state.mode)

  const isLight = mode === 'light'

  useEffect(() => {
    if (!id || !type || !name) {
      router.back()
    }
  }, [id, name, type])

  if (!id || !type || !name) {
    return null
  }

  return (
    <SafeAreaView className={`flex-1 px-[16px] py-5 ${isLight ?
      'bg-[#ffffff]' : 'bg-[#000000]'}`}>
      <ScrollView>

        <View className='flex-row justify-between items-start mb-6'>

          <Pressable className='w-fit active:opacity-70' onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={25} color={isLight ? "#000000" : "#ffffff"} />
          </Pressable>

          <View className='justify-center items-center'>
            {avatar ?
              <Image className='w-[100px] h-[100px] rounded-full' source={{ uri: avatar.toString() }} />
              :
              <View className='w-[100px] h-[100px] rounded-full bg-gray-200 justify-center items-center'>
                <Text className='text-[70px] text-center leading-[70px]'>{name.toString().charAt(0)}</Text>
              </View>
            }

            <Text className={`${isLight ? 'text-black' : 'text-white'} text-[24px] font-bold`}>{name}</Text>
            <Text className='text-[15px] text-[#9f9f9f]'>Messenger</Text>

          </View>

          <MaterialCommunityIcons name="dots-vertical" size={24} color={isLight ? "#000000" : '#ffffff'} />
        </View>

        <View className='flex-row justify-center items-center gap-8 mb-6'>

          <View className='justify-center items-center gap-1'>
            <Pressable
              onPress={() => router.back()}
              className='w-[40px] h-[40px] rounded-full justify-center items-center active:opacity-70'
              style={{ backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(225, 225, 225, 0.25)' }}>
              <Ionicons name='chatbubble' size={25} color={isLight ? "black" : '#eae9e9'} />

            </Pressable>
            <Text className='text-[#9f9f9f] text-[12px]'>Message</Text>
          </View>

          <View className='justify-center items-center gap-1'>
            <Pressable className='w-[40px] h-[40px] rounded-full justify-center items-center active:opacity-70'
              style={{ backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(225, 225, 225, 0.25)' }}>
              <FontAwesome name="heart" size={25} color={isLight ? "black" : '#eae9e9'} />
            </Pressable>
            <Text className='text-[#9f9f9f] text-[12px]'>Favorite</Text>
          </View>

          <View className='justify-center items-center gap-1'>
            <Pressable className='w-[40px] h-[40px] rounded-full justify-center items-center active:opacity-70'
              style={{ backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(225, 225, 225, 0.25)' }}>
              <FontAwesome name="bell" size={25} color={isLight ? "black" : '#eae9e9'} />
            </Pressable>
            <Text className='text-[#9f9f9f] text-[12px]'>Mute</Text>
          </View>
        </View>

        {email &&
          <View className='mt-[26px]'>
            <Text className='text-[#9f9f9f] text-[13px] font-semibold'>Email</Text>

            <Pressable className='flex-row justify-between items-center active:opacity-60 h-[52px]'>
              <Text className={`${isLight ? 'text-[#000000]' : 'text-[#eae9e9]'} text-[17px] font-semibold'`}>{email}</Text>
            </Pressable>

          </View>
        }

        <View className='mt-[26px]'>
          <Text className='text-[#9f9f9f] text-[13px] font-semibold'>More Action</Text>

          <Pressable className='flex-row justify-between items-center active:opacity-60 h-[52px]'>
            <Text className={`${isLight ? 'text-[#000000]' : 'text-[#eae9e9]'} text-[17px] font-semibold'`}>Create group</Text>

            <View className='w-[40px] h-[40px] rounded-full justify-center items-center active:opacity-70'
              style={{ backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(225, 225, 225, 0.25)' }}>
              <FontAwesome name='users' size={25} color={isLight ? "black" : '#eae9e9'} />

            </View>
          </Pressable>

        </View>

        <View className='mt-[26px]'>
          <Text className='text-[#9f9f9f] text-[13px] font-semibold'>Privacy</Text>

          <Pressable className='flex-row justify-between items-center active:opacity-60 h-[52px]'>
            <Text className={`${isLight ? 'text-[#000000]' : 'text-[#eae9e9]'} text-[17px] font-semibold'`}>Notifications</Text>

            <Ionicons name='chevron-forward' size={24} color='#9f9f9f' />

          </Pressable>

          <Text className='w-full border-b-[0.5px] border-[#9f9f9f]'></Text>

          <Pressable className='flex-row justify-start items-center active:opacity-60 h-[52px]'>

            <MaterialIcons name="block-flipped" size={24} color="#f78181" />
            <Text className='text-[#f78181] text-[17px] font-semibold ml-2'>Block</Text>


          </Pressable>

        </View>
      </ScrollView>

    </SafeAreaView>
  )
}