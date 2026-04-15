import { View, Text, TextInput, Pressable, Image } from 'react-native'
import React, { useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useChatAndMessageStore from '../../stores/chatAndMessageStore'
import { useThemeStore } from '../../stores/useThemeStore';

export default function Textbar() {

    const [height, setHeight] = useState<number>(40)

    const pickMedia = useChatAndMessageStore((state) => state.pickMedia)
    const text = useChatAndMessageStore((state) => state.text)
    const files = useChatAndMessageStore((state) => state.files)
    const setMessage = useChatAndMessageStore((state) => state.setMessage)
    const removeFile = useChatAndMessageStore((state) => state.removeFile)
    const sendMessage = useChatAndMessageStore((state) => state.sendMessage)
    const sendingMessage = useChatAndMessageStore((state) => state.sendingMessage)
    const deletingMessage = useChatAndMessageStore((state) => state.deletingMessage)
    const captureMedia = useChatAndMessageStore((state) => state.captureMedia)

    const mode = useThemeStore((state) => state.mode)

    const disabled = !text.trim() && files.length === 0

    const isLight = mode === 'light'
    return (
        <View className={`py-2 px-[16px] border-t ${isLight ? 'border-gray-200' : 'border-gray-500'} ${isLight ? 'bg-white' : 'bg-black/90'}`}>

            {files.length > 0 && (
                <View className={`w-full flex-row flex-wrap gap-2 justify-end mb-2 ${isLight && 'bg-white'}`}>
                    {files.map((file) => (
                        <View key={file.id} className='relative'>
                            <Image
                                source={{ uri: file.uri }}
                                className="w-[55px] h-[55px] rounded-lg"
                            />

                            <Pressable
                                onPress={() => removeFile(file.id)}
                                className={`absolute -top-1 -right-1 ${isLight ? 'bg-black/70' : 'bg-white/70'} rounded-full p-[2px]`}
                            >
                                <Ionicons name="close" size={14} color={isLight ? 'white' : 'black'} />
                            </Pressable>
                        </View>
                    ))}
                </View>
            )}
            <View className='flex-row gap-3 py-4 px-[16px] justify-center items-center'>
                <Pressable className='active:opacity-70'
                    onPress={() => captureMedia()}
                >
                    <Ionicons name='camera' color={isLight ? '#0584fe' : '#19A3FE'} size={25} />
                </Pressable>

                <Pressable className='active:opacity-70'
                    onPress={() => pickMedia()}
                >
                    <Ionicons name='image' color={isLight ? '#0584fe' : '#19A3FE'} size={25} />
                </Pressable>

                <TextInput
                    className={`flex-1 rounded-[18px] px-[12px] max-h-[180px] ${isLight ? 'text-black' : 'text-white'} `}
                    style={{
                        backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : '#999999',
                        minHeight: 36,
                        height: Math.max(36, height)
                    }}
                    value={text}
                    onChangeText={setMessage}
                    multiline
                    textAlignVertical='top'
                    onContentSizeChange={(e) => {
                        const contentHeight = e.nativeEvent.contentSize.height
                        setHeight(contentHeight)
                    }}
                    placeholder='Aa'
                    placeholderTextColor={'#000'}
                />

                <Pressable className={`active:opacity-70 ${disabled || sendingMessage || deletingMessage ? 'opacity-50' : ''}`}
                    disabled={disabled || sendingMessage || deletingMessage}
                    onPress={() => sendMessage()}
                >
                    <FontAwesome name="thumbs-up" size={25} color={isLight ? '#0584fe' : '#19A3FE'} />
                </Pressable>
            </View>
        </View>
    )
}