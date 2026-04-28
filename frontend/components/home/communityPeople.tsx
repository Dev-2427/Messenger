import { View, Text, Image, FlatList, Pressable } from 'react-native'
import React from 'react'
import useGetUsers from '../../stores/getUsersStore'
import HandEmoji from '../icons/handEmoji'
import { safePush } from '../../helpers/safeNavigation'
import { useThemeStore } from '../../stores/useThemeStore'
import useSocketStore from '../../stores/useSocketStore'
import useUpdateProfile from '../../stores/updateProfileStore'
import useChatAndMessageStore from '../../stores/chatAndMessageStore'
import { router } from 'expo-router'

export default function CommunityPeople() {

    const setMessage = useChatAndMessageStore((s) => s.setMessage)

    const users = useGetUsers((state) => state.users)
    const mode = useThemeStore((state) => state.mode)

    const onlineUsers = useSocketStore((state) => state.onlineUsers)

    const showActiveStatus = useUpdateProfile((state) => state.showActiveStatus)

    return (
        <FlatList
            data={users}
            showsVerticalScrollIndicator={false}
            keyExtractor={(user) => user._id
            }
            contentContainerStyle={{ paddingHorizontal: 16, marginTop: 20 }}
            renderItem={({ item }) => (
                <Pressable
                    onPress={() => safePush({
                        pathname: `/messages/messageScreen/${item._id}`,
                    })}
                    className='flex-row items-center  border-b-[0.5px] py-2'
                    style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
                >

                    <View className='relative mr-[16px]'>
                        {item.avatar ?
                            <Image
                                source={{ uri: item.avatar }}
                                className='w-[52px] h-[52px] rounded-full'
                            />
                            :
                            <View className='w-[52px] h-[52px] rounded-full bg-gray-200 justify-center items-center'>
                                <Text className='text-[25.5px] text-center leading-[25.5px]'>{item.fullName.charAt(0)}</Text>
                            </View>
                        }

                        {showActiveStatus &&

                            onlineUsers.includes(item._id) &&
                            <View className='absolute bottom-0 right-0 border-2 border-white rounded-full bg-[#5ad439] w-[15px] h-[15px]' />
                        }

                    </View>

                    <Text className={`flex-1 ${mode === 'light' ? 'text - [#000000]' : 'text-[#eae9e9]'} font-medium text-[17px]`}>{item.fullName}</Text>

                    <Pressable
                        onPress={() => {
                            setMessage('👋')
                            router.push({
                                pathname: `/messages/messageScreen/${item._id}`,
                            })
                        }}
                        className='w-[20px] h-[20px] p-4 justify-center items-center rounded-full' style={{ backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(225, 225, 225, 0.25)' }}>
                        <HandEmoji />
                    </Pressable>

                </Pressable>

            )}
        />
    )
}