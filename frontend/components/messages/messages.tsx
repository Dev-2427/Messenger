import { View, Text, ActivityIndicator, Image, FlatList, Pressable, Modal, Alert, TextInput, Platform, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import useChatAndMessageStore from '../../stores/chatAndMessageStore'
import useAuthStore from '../../stores/authStore'
import { Media } from '../../types'
import { VideoView, useVideoPlayer } from "expo-video"
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system/legacy'
import Toast from 'react-native-toast-message'
import * as Clipboard from 'expo-clipboard'
import { Image as ExpoImage } from 'expo-image'
import { useThemeStore } from '../../stores/useThemeStore'
import { Linking } from 'react-native'

export interface contextMenuType {
    chatId: string | null
    messageId: string
    mediaId?: string
    isMine: boolean
    type: 'text' | 'media'
}

async function getMediaLibraryPermission() {
    try {
        const { status: currentStatus } = await MediaLibrary.getPermissionsAsync()

        if (currentStatus === 'granted') return true

        const { status } = await MediaLibrary.requestPermissionsAsync(true)
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please enable media library permission to save media.')
            return false
        }

        return true
    } catch (error) {
        console.error("Media permission failed:", error)
        Toast.show({
            type: 'error',
            text1: 'Failed to save media'
        })
        return false
    }
}


function MessageText({ text, isMine, isLight }: { text: string, isMine: boolean, isLight: boolean }) {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    const textColor = isLight ? (isMine ? '#ffffff' : '#000000') : '#ffffff'

    return (
        <Text style={{ fontSize: 17, paddingVertical: 7.5, paddingHorizontal: 12, color: textColor }}>
            {parts.map((part, index) => {
                if (urlRegex.test(part)) {
                    return (
                        <Text
                            key={index}
                            style={{ textDecorationLine: 'underline', color: textColor }}
                            onPress={() => Linking.openURL(part)}
                        >
                            {part}
                        </Text>
                    )
                }
                return part
            })}
        </Text>
    )
}

function ChatVideo({ uri, onLongPress }: { uri: string; onLongPress?: () => void }) {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = false
    })

    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            onLongPress?.()
            longPressTimer.current = null
        }, 300)
    }

    const clearLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }
    }

    return (
        <VideoView
            style={{ width: '100%', height: '100%' }}
            player={player}
            // Detect long press without blocking normal taps/controls
            onTouchStart={handleTouchStart}
            onTouchEnd={clearLongPress}
            onTouchCancel={clearLongPress}
        />
    )
}

export default function Messages({ type, avatar, name }: { type: string, avatar: string, name: string }) {

    const getMessages = useChatAndMessageStore((state) => state.getMessages)
    const gettingMessages = useChatAndMessageStore((state) => state.gettingMessages)
    const messages = useChatAndMessageStore((state) => state.messages)
    const chatId = useChatAndMessageStore((state) => state.chatId)
    const receiverId = useChatAndMessageStore((state) => state.receiverId)
    const clearMessageState = useChatAndMessageStore((state) => state.clearMessageState)
    const setText = useChatAndMessageStore((state) => state.setMessage)
    const sendMessage = useChatAndMessageStore((state) => state.sendMessage)
    const deleteMessage = useChatAndMessageStore((state) => state.deleteMessage)
    const editMessage = useChatAndMessageStore((state) => state.editMessage)
    const sendingMessage = useChatAndMessageStore((state) => state.sendingMessage)
    const user = useAuthStore((state) => state.user)

    const mode = useThemeStore((s) => s.mode)
    const isLight = mode === 'light'

    const [preview, setPreview] = React.useState<{
        uri: string
        type: 'image' | 'video'
    } | null>(null)


    const [contextMenu, setContextMenu] = React.useState<contextMenuType | null>(null)

    const [contextItem, setContextItem] = useState<{
        uri?: string,
        text?: string,
        type: 'image' | 'video' | 'text',
        messageId?: string,
        isMine?: boolean
    } | null>(null)

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [isEditable, setIsEditable] = useState<boolean>(false);

    const [copied, setCopied] = useState<boolean>(false)

    const downloadResumableRef = React.useRef<FileSystem.DownloadResumable | null>(null);

    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        return () => {
            clearMessageState()
        }
    }, [])

    useEffect(() => {
        if ((receiverId || chatId) && messages.length === 0) {
            getMessages()
        }
    }, [receiverId, chatId])

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
        const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleCancelDownload = async () => {
        if (downloadResumableRef.current) {
            try {
                await downloadResumableRef.current.cancelAsync();
                setIsSaving(false);
                setDownloadProgress(0);
                Toast.show({ type: 'info', text1: 'Download cancelled' });
            } catch (e) {
                console.error("Cancel failed", e);
            }
        }
    };


    async function handleCopy(text: string) {
        await Clipboard.setStringAsync(text)

        setCopied(true)

        setTimeout(() => {
            setCopied(false)
        }, 2000);
    }

    const textClass = isLight
        ? `font-semibold text-[17px] ${contextItem?.isMine ? 'text-white' : 'text-black'}`
        : `font-semibold text-[17px] text-white`;


    if (gettingMessages) {
        return <ActivityIndicator className='justify-center items-center flex-1' size={'large'} color={isLight ? 'blue' : 'white'} />
    }

    return (
        <>
            <FlatList
                data={messages}
                inverted
                contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingTop: 8,
                    paddingBottom: 0,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={
                    messages.length === 0 && type === 'direct' ? (
                        <View className="mt-60 items-center">
                            {avatar ? (
                                <Image
                                    className="w-[100px] h-[100px] rounded-full"
                                    source={{ uri: avatar }}
                                />
                            ) : (
                                <View className="w-[100px] h-[100px] rounded-full bg-gray-200 justify-center items-center">
                                    <Text className="text-[50px]">
                                        {name?.charAt(0)}
                                    </Text>
                                </View>
                            )}
                            <Text className={`mt-2 ${isLight ? 'text-[#000000]' : 'text-[#ffffff]'} text-[24px] font-bold`}>{name}</Text>

                            <Text className={` ${isLight ? 'text-[#000000]' : 'text-[#ffffff]'} text-[15px]`}
                            >Say hi to {name}</Text>

                            <Pressable className='m-5 active:opacity-70'
                                onPress={() => {
                                    setText('👋')
                                    sendMessage()
                                }}
                            >
                                <Text className='text-[45px]'>👋</Text>
                            </Pressable>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => {
                    const isMine = item.sender._id === user.id

                    return (
                        <View
                            className={`mt-[12px] flex-row  ${isMine ? 'justify-end' : 'justify-start'}`}>

                            {type === 'group' && !isMine && (
                                <View className="self-end mx-2">
                                    {item.sender.avatar ? (
                                        <Image
                                            className="w-[28px] h-[28px] rounded-full"
                                            source={{ uri: item.sender.avatar }}
                                        />
                                    ) : (
                                        <View className="w-[28px] h-[28px] rounded-full bg-gray-200 justify-center items-center overflow-hidden">
                                            <Text className="text-[14px] leading-[32px]">
                                                {item.sender.fullName.charAt(0)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            <View className={`max-w-[70%] gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>

                                {item.media.length > 0 && (
                                    <View
                                        className={`flex-row flex-wrap `}
                                    >
                                        {item.media.map((mediaItem: Media) => {
                                            return (

                                                < View
                                                    key={mediaItem._id}
                                                    className={`p-[2px] ${item.media.length === 1
                                                        ? 'w-[150px] h-[150px]'
                                                        : 'w-1/2'
                                                        }`
                                                    }
                                                >
                                                    <View>
                                                        {mediaItem.type === 'image' ?
                                                            <Pressable
                                                                onLongPress={() => {
                                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                                                    setContextItem({ uri: mediaItem.url, type: 'image' })
                                                                    setContextMenu({
                                                                        chatId,
                                                                        messageId: item._id,
                                                                        mediaId: mediaItem.fileId,
                                                                        isMine,
                                                                        type: 'media',
                                                                    })
                                                                }}
                                                                delayLongPress={300}
                                                                onPress={() => {
                                                                    mediaItem.type === 'image' &&
                                                                        setPreview({ uri: mediaItem.url, type: mediaItem.type === 'image' ? 'image' : 'video' })
                                                                }
                                                                }
                                                                className="w-full aspect-square rounded-xl overflow-hidden" >

                                                                <ExpoImage
                                                                    source={mediaItem.url}
                                                                    className="w-full h-full"
                                                                    contentFit="cover"
                                                                />
                                                            </Pressable>
                                                            :
                                                            <View className="w-full aspect-square rounded-xl overflow-hidden relative">
                                                                <ChatVideo
                                                                    uri={mediaItem.url}
                                                                    onLongPress={() => {
                                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                                                        setContextItem({ uri: mediaItem.url, type: 'video' })
                                                                        setContextMenu({
                                                                            chatId,
                                                                            messageId: item._id,
                                                                            mediaId: mediaItem.fileId,
                                                                            isMine,
                                                                            type: 'media',
                                                                        })
                                                                    }}
                                                                />
                                                            </View>

                                                        }
                                                    </View>
                                                </View>

                                            )
                                        })}
                                    </View>
                                )
                                }

                                {item.text && (
                                    <Pressable
                                        onLongPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                            setContextItem({ text: item.text?.toString(), type: 'text', isMine, messageId: item._id })
                                            setContextMenu({
                                                chatId,
                                                messageId: item._id,
                                                isMine,
                                                type: 'text',
                                            })
                                        }}
                                        delayLongPress={300}
                                        style={isLight ? {
                                            backgroundColor: isMine ? '#0584FE' : 'rgba(0,0,0,0.16)',
                                            borderBottomRightRadius: isMine ? 0 : 18,
                                            borderBottomLeftRadius: isMine ? 18 : 0,
                                        } :
                                            {
                                                backgroundColor: isMine ? '#19A3FE' : 'rgba(225, 225, 225, 0.2)',
                                                borderBottomRightRadius: isMine ? 0 : 18,
                                                borderBottomLeftRadius: isMine ? 18 : 0,
                                            }
                                        }
                                        className="rounded-[18px]"
                                    >
                                        {/* <Text
                                            className={`text-[17px] py-[7.5px] px-[12px] ${isLight ? (isMine ? 'text-white' : 'text-black') : ('text-white')
                                                }`}
                                        >
                                            {item.text}
                                        </Text> */}
                                        <MessageText text={item.text}
                                            isMine={isMine}
                                            isLight={isLight}
                                        />
                                    </Pressable>
                                )}

                            </View >
                        </View >
                    )
                }}
            />
            < Modal visible={!!preview} transparent animationType="fade" >
                <Pressable
                    className="flex-1 bg-black"
                    onPress={() => setPreview(null)}
                >
                    {preview && (preview.type === 'image' && (
                        <ExpoImage
                            source={preview.uri}
                            className="w-full h-full"
                            contentFit="contain"
                        />
                    )
                    )}
                </Pressable>
            </Modal >


            <Modal visible={!!contextMenu} transparent animationType="fade">

                <Pressable
                    className="flex-1 bg-black/40 justify-end"
                    onPress={() => {
                        if (!isSaving) {
                            Keyboard.dismiss();
                            setContextMenu(null);
                            setIsEditable(false);
                        }
                    }
                    }
                >
                    {/* Stop propagation so clicking the menu doesn't close it */}
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View className={` ${isLight ? 'bg-white' : 'bg-black'} rounded-3xl py-4 mx-4 mb-8 shadow-lg`}>

                            {contextItem?.type === 'image' &&
                                <View className='px-4'>
                                    <Image className='w-[55px] h-[55px] rounded-lg' source={{ uri: contextItem.uri }} />
                                </View>
                            }

                            {contextItem?.type === 'video' &&
                                <View className='w-[150px] h-[150px] rounded-lg px-4'>
                                    <ChatVideo
                                        uri={contextItem.uri!}
                                    />
                                </View>
                            }

                            {contextItem?.type === 'text' &&
                                <View>
                                    <View style={
                                        isLight ?
                                            {
                                                backgroundColor: contextItem.isMine ? '#0584FE' : 'rgba(0,0,0,0.16)',
                                                borderBottomRightRadius: contextItem.isMine ? 0 : 18,
                                                borderBottomLeftRadius: contextItem.isMine ? 18 : 0,
                                            } :
                                            {
                                                backgroundColor: contextItem.isMine ? '#19A3FE' : 'rgba(225, 225, 225, 0.5)',
                                                borderBottomRightRadius: contextItem.isMine ? 0 : 18,
                                                borderBottomLeftRadius: contextItem.isMine ? 18 : 0,
                                            }
                                    }
                                        className="rounded-[18px] px-4 w-[95%] self-center h-[40px] justify-center">

                                        <TextInput className={textClass}
                                            value={contextItem.text}
                                            editable={isEditable}
                                            onChangeText={(text) => {
                                                setContextItem(item => item ? { ...item, text: text } : null)
                                            }
                                            }
                                        />
                                    </View>

                                    {isEditable &&
                                        <View className='flex-row justify-center items-center gap-5 mt-2'>
                                            <Pressable className='active:opacity-70 rounded-lg w-[80px]'
                                                style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(225, 225, 225, 0.5)' }}
                                                onPress={() => setIsEditable(false)}
                                            >
                                                <Text className={`text-[17px] p-2 text-center ${isLight ? 'text-black' : 'text-white'}`}>Cancel</Text>
                                            </Pressable>
                                            <Pressable className={`active:opacity-70 ${sendingMessage && 'opacity-50'} rounded-lg w-[80px]`}
                                                style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(225, 225, 225, 0.5)' }} disabled={!contextItem.text || !contextItem.text.trim() || sendingMessage}
                                                onPress={async () => {
                                                    const message = messages.find((m) => m._id === contextItem.messageId)
                                                    if (message?.text === contextItem.text) {
                                                        setIsEditable(false)
                                                        return
                                                    }
                                                    await editMessage(contextItem.text!, contextItem.messageId!)
                                                    setIsEditable(false)
                                                }
                                                }>
                                                <Text className={`text-[17px] p-2 text-center ${isLight ? 'text-black' : 'text-white'}`}>
                                                    {sendingMessage ?
                                                        <ActivityIndicator size={'small'} color={'#0584FE'} />
                                                        : 'Save'
                                                    }
                                                </Text>
                                            </Pressable>
                                        </View>
                                    }

                                </View>

                            }

                            <View className='border-b-[#0584fe] border-b-[0.5px] py-2 w-[95%] self-center'></View>

                            {contextMenu?.isMine && contextMenu?.type === 'text' && !isEditable && (
                                <Pressable
                                    onPress={() => setIsEditable(true)}
                                    className={`px-4 py-3 ${isLight ? 'active:bg-gray-100' : 'active:bg-gray-700'}`}>
                                    <Text className={`text-[16px] ${isLight ? 'text-black' : 'text-white'}`}>✏️ Edit</Text>
                                </Pressable>
                            )}

                            {contextMenu?.type === 'media' && (
                                <Pressable
                                    onPress={isSaving ? handleCancelDownload :

                                        async () => {
                                            try {
                                                const ok = await getMediaLibraryPermission();
                                                if (!ok) return;
                                                if (!contextItem?.uri) return;

                                                setIsSaving(true);
                                                setDownloadProgress(0);

                                                const fileExtension = contextItem.type === 'image' ? 'jpg' : 'mp4';
                                                const fileName = `MSG_${Date.now()}.${fileExtension}`;
                                                const tempFile = FileSystem.cacheDirectory + fileName;

                                                // 1. Define the callback to update the progress state
                                                const callback = (progressData: FileSystem.DownloadProgressData) => {
                                                    const total = progressData.totalBytesExpectedToWrite;
                                                    const written = progressData.totalBytesWritten;

                                                    if (total > 0) {
                                                        const progress = written / total;
                                                        setDownloadProgress(progress * 100);
                                                    }
                                                };

                                                // 2. Initialize the resumable downloader
                                                const downloadResumable = FileSystem.createDownloadResumable(
                                                    contextItem.uri,
                                                    tempFile,
                                                    {},
                                                    callback
                                                );

                                                // Store it in the ref
                                                downloadResumableRef.current = downloadResumable;

                                                // 3. Start the download
                                                const result = await downloadResumable.downloadAsync();

                                                if (!result) return
                                                // --- NEW CODE ENDS HERE ---

                                                await MediaLibrary.createAssetAsync(tempFile);
                                                await FileSystem.deleteAsync(tempFile, { idempotent: true });

                                                Toast.show({
                                                    type: 'success',
                                                    text1: 'Saved to gallery'
                                                });

                                                setContextMenu(null);
                                                setContextItem(null);
                                            } catch (error) {
                                                console.error('Error saving:', error);
                                                Toast.show({ type: 'error', text1: 'Failed to save' });
                                            } finally {
                                                downloadResumableRef.current = null;
                                                setIsSaving(false);
                                                setDownloadProgress(0);
                                            }
                                        }}
                                    className={isLight ? `px-4 py-3 ${isSaving ? 'opacity-50' : 'active:bg-gray-100'}` : `
                                        px-4 py-3 ${isSaving ? 'opacity-50' : 'active:bg-gray-700'}`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <Text className={`text-[16px] ${isLight ? 'text-black' : 'text-white'}`}>
                                            {isSaving
                                                ? `✖ Cancel Download (${Math.round(downloadProgress)}%)`
                                                : '💾 Save'}
                                        </Text>
                                        {isSaving && <ActivityIndicator size="small" color={isLight ? "#0584FE" : "white"} />}
                                    </View>
                                </Pressable>
                            )}

                            {contextMenu?.type === 'text' &&
                                <Pressable
                                    onPress={() => handleCopy(contextItem?.text!)}
                                    className={`px-4 py-3 ${isLight ? 'active:bg-gray-100' : 'active:bg-gray-700'}`}>
                                    <Text className={`text-[16px] ${isLight ? 'text-black' : 'text-white'}`}> {copied ? "✅ Copied!" : '📋 Copy'}</Text>
                                </Pressable>
                            }


                            {contextMenu?.isMine && (
                                <Pressable
                                    onPress={() => {
                                        deleteMessage(contextMenu)
                                        setContextMenu(null)
                                    }}
                                    className={`px-4 py-3 ${isLight ? 'active:bg-red-50' : 'active:bg-red-950'}`}>
                                    <Text className="text-[16px] text-red-500">🗑 Delete</Text>
                                </Pressable>
                            )}

                        </View>
                        {Platform.OS === 'android' && <View style={{ height: isEditable ? keyboardHeight : 0 }} />}
                    </Pressable>
                </Pressable>
            </Modal>

        </>

    )
}