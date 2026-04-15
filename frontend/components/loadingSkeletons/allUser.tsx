// components/skeletons/AllUsersSkeleton.tsx
import { View, FlatList } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

function UserItemSkeleton() {
    const opacity = useRef(new Animated.Value(0.3)).current

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [])

    return (
        <View className='justify-start items-center gap-[7px] m-[15px]'>
            <View className='relative'>
                <Animated.View 
                    style={{ opacity }}
                    className='w-[52px] h-[52px] rounded-full bg-gray-200'
                />
                <View className='absolute bottom-0 right-0 border-2 border-[#ffffff] rounded-full bg-gray-300 w-[15px] h-[15px]' />
            </View>
            
            <Animated.View 
                style={{ opacity }}
                className='h-[13px] w-[50px] bg-gray-200 rounded'
            />
        </View>
    )
}

export default function AllUsersSkeleton() {
    return (
        <FlatList
            data={[1, 2, 3, 4, 5, 6]} // Show 6 skeleton items
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `skeleton-${item}`}
            renderItem={() => <UserItemSkeleton />}
        />
    )
}