import { View, Text, Image, TextInput, Pressable } from 'react-native'
import React, { useState } from 'react'
import useAuthStore from '../../stores/authStore'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { safePush } from '../../helpers/safeNavigation';
import { useThemeStore } from '../../stores/useThemeStore';
import useChatAndMessageStore from '../../stores/chatAndMessageStore';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type FA6Name = React.ComponentProps<typeof FontAwesome6>['name'];

interface screenProps {
    screen: string,
    btn1: IoniconName,
    btn2: FA6Name
}

const User = ({ screen, btn1, btn2 }: screenProps) => {

    const mode = useThemeStore((s) => s.mode)
    const user = useAuthStore((state) => state.user)

    const chatIdsToDelete = useChatAndMessageStore((state) => state.chatIdsToDelete)
    const clearChatIdToDeleteArray = useChatAndMessageStore((state) => state.clearChatIdToDeleteArray)
    const handleDeleteChats = useChatAndMessageStore((state) => state.handleDeleteChats)

    const [searchText, setSearchText] = useState<string>('')

    const isLight = mode === 'light'

    return (
        <Pressable className='px-[16px]' >

            {chatIdsToDelete?.length && screen === 'Chats' ?
                (
                    <View className='my-[16px] flex-row justify-between items-center h-[58px]'>
                        <View className='flex-row gap-[12px] justify-center items-center'>

                            <Pressable className='active:opacity-70' onPress={() => clearChatIdToDeleteArray()}>
                                <Ionicons name='chevron-back' size={25} color={isLight ? '#000000' : '#ffffff'} />
                            </Pressable>

                            <Text className={`text-[20px] ${isLight ? 'text-[#000000]' : 'text-[#ffffff]'}`}>{chatIdsToDelete?.length}</Text>
                        </View>

                        <Pressable className='active:opacity-70' onPress={() => handleDeleteChats()}>
                            <Ionicons name='trash' size={24} color={isLight ? '#000000' : '#ffffff'} />
                        </Pressable>
                    </View>
                )
                :
                (
                    <View className='my-[16px] flex-row justify-between items-center h-[58px]'>
                        <View className='flex-row gap-[12px] justify-center items-center'>
                            <Pressable className='active:opacity-70'
                                onPress={() => safePush('/settingsScreen/settings')}
                            >
                                {user.avatar ?
                                    <Image
                                        className='w-[40px] h-[40px] rounded-full'
                                        source={{ uri: user.avatar }}
                                    />
                                    :
                                    <View className='w-[40px] h-[40px] rounded-full bg-gray-200 justify-center items-center overflow-hidden'>

                                        <Text className='text-[20px] text-center'>{user.name.charAt(0)}</Text>

                                    </View>
                                }
                            </Pressable>

                            <Text className={`font-bold text-[30px] ${isLight ? 'text-[#000000]' : 'text-[#ffffff]'} `}>{screen}</Text>
                        </View>

                        <View className='flex-row justify-center items-center gap-[12px]'>

                            <Pressable
                                // onPress={() => safePush('/imgTest')}
                                className='w-[40px] h-[40px] rounded-full justify-center items-center'
                                style={{ backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(225, 225, 225, 0.3)' }}>
                                <Ionicons name={btn1} color={isLight ? "#000000" : '#eae9e9'} size={25} />
                            </Pressable>

                            <View className='w-[40px] h-[40px] rounded-full justify-center items-center'
                                style={{ backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(225, 225, 225, 0.3)' }}>
                                <FontAwesome6 name={btn2} size={25} color={isLight ? "#000000" : '#eae9e9'} />
                            </View>
                        </View>
                    </View>)
            }



            <View className='mt-[2px] relative'>
                <TextInput onPress={() => chatIdsToDelete?.length && clearChatIdToDeleteArray()}
                    className={`w-full rounded-[10px] h-[44px] pl-[40px] text-[17px] ${!isLight && 'text-[#eae9e9]'}`}
                    style={{ backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(225, 225, 225, 0.3)' }}
                    value={searchText}
                    onChangeText={setSearchText}
                />

                {searchText.length === 0 && (
                    <View
                        className='flex-row gap-2 justify-start items-center pl-2 absolute top-2 left-0'
                        pointerEvents='none'
                    >
                        <Ionicons name='search' size={23} color='#8e8e93' />
                        <Text className='text-[#8e8e93] text-[17px]'>
                            Search
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    )
}

export default User