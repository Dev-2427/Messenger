import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import { safeReplace } from '../../helpers/safeNavigation';
import useUpdateProfile from '../../stores/updateProfileStore';

const Welcome = () => {

    const { localUri, isUploading, pickFromGallery, captureFromCamera, success } = useUpdateProfile()

    return (
        <SafeAreaView className='px-[22px] flex-1 justify-center items-center'>
            <View className='mb-[44px]'>
                <Text className='text-3xl font-semibold text-center'>Let's setup your profile avatar</Text>
            </View>


            <View className='w-44 h-44 rounded-full bg-gray-200 justify-center items-center overflow-hidden'>
                {localUri ?
                    <Image source={{ uri: localUri }} className='w-full h-full rounded-full' />
                    :
                    <FontAwesome6 name="user-large" size={64} color="black" />
                }
            </View>

            <View className='w-full justify-center items-center gap-5 mt-[24px]'>
                <Pressable onPress={captureFromCamera}
                    className='rounded-[12px] w-full bg-[#648DDB] h-[56px] border-neutral-700 justify-center items-center'>
                    <View className='flex-row gap-3 items-center'>
                        <Text className="font-bold text-[19px] text-[#ffffff]">
                            Upload image
                        </Text>
                        <AntDesign name="cloud-upload" size={22} color="white" />
                    </View>
                </Pressable>

                <Pressable
                    className='rounded-[12px] w-full bg-[#648DDB] h-[56px] border-neutral-700 justify-center items-center' disabled={isUploading} onPress={pickFromGallery}>
                    {isUploading ? <ActivityIndicator color='white' size={'large'} /> :
                        <Text className="font-bold text-[19px] text-[#ffffff]" >  Choose from gallery</Text>
                    }

                </Pressable>
            </View>

            <Pressable onPress={() => safeReplace('/home/chats')}>
                <Text className='mt-10 text-lg text-[#648ddb]'>{!isUploading && localUri && success ? 'Continue' : 'Skip for now'}</Text>
            </Pressable>

        </SafeAreaView>
    )
}

export default Welcome