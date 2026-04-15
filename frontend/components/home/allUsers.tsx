import { View, Text, ActivityIndicator, FlatList, Image, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import useGetUsers from '../../stores/getUsersStore'
import { safePush } from '../../helpers/safeNavigation'
import AllUsersSkeleton from '../loadingSkeletons/allUser'
import useChatAndMessageStore from '../../stores/chatAndMessageStore'
import useSocketStore from '../../stores/useSocketStore'
import useUpdateProfile from '../../stores/updateProfileStore'

export default function AllUsers() {

    const isGettingUsers = useGetUsers((state) => state.isGettingUser)
    const getUsers = useGetUsers((state) => state.getUsers)
    const users = useGetUsers((state) => state.users)

    const onlineUsers = useSocketStore((state) => state.onlineUsers)

    const showActiveStatus = useUpdateProfile((state) => state.showActiveStatus)

    useEffect(() => {
        getUsers()
    }, [])

    if (isGettingUsers) {
        return <AllUsersSkeleton />
    }
    return (
        <FlatList
            data={users}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(user) => user._id
            }
            renderItem={({ item }) => (
                <Pressable className=' justify-start items-center gap-[7px] m-[15px]'
                    onPress={() => {
                        safePush({
                            pathname: `/messages/messageScreen/${item._id}`,
                            params: { type: 'direct' }
                        })
                    }
                    }
                >

                    <View className='relative'>

                        {item.avatar ?
                            <Image source={{ uri: item.avatar }}
                                className='w-[52px] h-[52px] rounded-full '
                            />
                            :
                            <View className='w-[52px] h-[52px] rounded-full bg-gray-200 justify-center items-center overflow-hidden'>

                                <Text className='text-[26px] text-center'>{item.fullName.charAt(0)}</Text>

                            </View>
                        }
                        {showActiveStatus &&
                            onlineUsers.includes(item._id) &&
                            (
                                <View className='absolute bottom-0 right-0 border-2 border-[#ffffff] rounded-full bg-[#5ad439] w-[15px] h-[15px]'></View>
                            )
                        }
                    </View>

                    <Text className='text-[13px] text-[#7F7F7F]'>{item.fullName}</Text>
                </Pressable >
            )
            }
        />
    )
}