// components/skeletons/ChatSkeleton.tsx
import { View, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'

export function ChatItemSkeleton() {
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
        <View className='flex-row gap-3 items-center mb-4 px-4'>
            {/* Avatar skeleton */}
            <Animated.View 
                style={{ opacity }}
                className='w-[60px] h-[60px] rounded-full bg-gray-200'
            />
            
            <View className='flex-1 gap-2'>
                {/* Name skeleton */}
                <Animated.View 
                    style={{ opacity }}
                    className='h-4 bg-gray-200 rounded w-3/4'
                />
                {/* Message skeleton */}
                <Animated.View 
                    style={{ opacity }}
                    className='h-3 bg-gray-200 rounded w-1/2'
                />
            </View>
        </View>
    )
}