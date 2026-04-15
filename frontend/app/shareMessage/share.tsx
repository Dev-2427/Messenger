import { View, Text, Image, FlatList, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useShareIntent } from 'expo-share-intent'
import useGetUsers from '../../stores/getUsersStore'
import { useThemeStore } from '../../stores/useThemeStore'
import useSocketStore from '../../stores/useSocketStore'
import useUpdateProfile from '../../stores/updateProfileStore'
import HandEmoji from '../../components/icons/handEmoji'
import Ionicons from '@expo/vector-icons/Ionicons'
import { safeReplace } from '../../helpers/safeNavigation'
import { useEffect } from 'react'

export default function ShareScreen() {
    const router = useRouter()
    const { shareIntent, resetShareIntent } = useShareIntent()

    const users = useGetUsers((state) => state.users)
    const getUsers = useGetUsers((state) => state.getUsers)
    const isGettingUser = useGetUsers((state) => state.isGettingUser)

    const mode = useThemeStore((state) => state.mode)
    const onlineUsers = useSocketStore((state) => state.onlineUsers)
    const showActiveStatus = useUpdateProfile((state) => state.showActiveStatus)

    const isLight = mode === 'light'

    const { sharedText, sharedFileUri, sharedFileMime } = useLocalSearchParams()

    useEffect(() => {
        if (!users || users.length === 0) {
            getUsers()
        }
    }, [])

    function handleSelectUser(userId: string) {
        router.replace({
            pathname: `/messages/messageScreen/${userId}`,
            params: {
                type: 'direct',
                sharedText,
                sharedFileUri,
                sharedFileMime,
            }
        })
    }

    return (
        <SafeAreaView className={`flex-1 ${isLight ? 'bg-white' : 'bg-black'}`}>

            <View className='px-4 py-3 border-b-[0.5px] border-gray-200 flex-row items-center gap-3'>
                <Pressable
                    onPress={() => {
                        resetShareIntent()
                        safeReplace('/')
                    }}
                    className='active:opacity-70'
                >
                    <Ionicons name='close' size={24} color={isLight ? 'black' : 'white'} />
                </Pressable>

                <View className='flex-1'>
                    <Text className={`text-[20px] font-bold ${isLight ? 'text-black' : 'text-white'}`}>
                        Share with...
                    </Text>
                    {shareIntent?.text || sharedText ? (
                        <Text className='text-gray-400 text-[13px] mt-1' numberOfLines={1}>
                            "{sharedText || shareIntent?.text}"
                        </Text>
                    ) : sharedFileUri ? (
                        <Text className='text-gray-400 text-[13px] mt-1'>
                            📎 Image
                        </Text>
                    ) : null}
                </View>
            </View>

            <FlatList
                data={users}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    isGettingUser ? (
                        <ActivityIndicator size='large' color={isLight ? 'blue' : 'white'} className='mt-10' />
                    ) : (
                        <Text className={`text-center mt-10 ${isLight ? 'text-black' : 'text-white'}`}>
                            No users found
                        </Text>
                    )
                }
                keyExtractor={(user) => user._id}
                contentContainerStyle={{ paddingHorizontal: 16, marginTop: 20 }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => handleSelectUser(item._id)}
                        className='flex-row items-center border-b-[0.5px] py-2'
                        style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
                    >
                        <View className='relative mr-[16px]'>
                            {item.avatar ? (
                                <Image
                                    source={{ uri: item.avatar }}
                                    className='w-[52px] h-[52px] rounded-full'
                                />
                            ) : (
                                <View className='w-[52px] h-[52px] rounded-full bg-gray-200 justify-center items-center'>
                                    <Text className='text-[25.5px] text-center leading-[25.5px]'>
                                        {item.fullName.charAt(0)}
                                    </Text>
                                </View>
                            )}
                            {showActiveStatus && onlineUsers.includes(item._id) && (
                                <View className='absolute bottom-0 right-0 border-2 border-white rounded-full bg-[#5ad439] w-[15px] h-[15px]' />
                            )}
                        </View>
                        <Text className={`flex-1 font-medium text-[17px] ${isLight ? 'text-black' : 'text-[#eae9e9]'}`}>
                            {item.fullName}
                        </Text>
                        <View className='w-[20px] h-[20px] p-4 justify-center items-center rounded-full'
                            style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(225,225,225,0.25)' }}>
                            <HandEmoji />
                        </View>
                    </Pressable>
                )}
            />
        </SafeAreaView>
    )
}