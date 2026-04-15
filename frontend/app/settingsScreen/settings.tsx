import { View, Text, Pressable, Image, Switch, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import Modal from "react-native-modal";
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import useAuthStore from '../../stores/authStore'
import { router } from 'expo-router'
import DarkModeIcon from '../../components/icons/darkmodeIcon'
import ActiveStatusIcon from '../../components/icons/activeStatusIcon'
import EmailIcon from '../../components/icons/emailIcon'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeStore } from '../../stores/useThemeStore'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import useUpdateProfile from '../../stores/updateProfileStore'
import { Controller, useForm } from 'react-hook-form';
import { sendName } from '../../helpers/schemaValidations/schemaValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

export default function Settings() {

    const user = useAuthStore((state) => state.user)
    const signOut = useAuthStore((state) => state.signOut)
    const deleteUser = useAuthStore((state) => state.deleteUser)
    const deletingUser = useAuthStore((state) => state.deletingUser)

    const mode = useThemeStore((state) => state.mode)
    const toggleMode = useThemeStore((state) => state.toggleMode)

    const captureFromCamera = useUpdateProfile((state) => state.captureFromCamera)
    const pickFromGallery = useUpdateProfile((state) => state.pickFromGallery)
    const deleteAvatar = useUpdateProfile((state) => state.deleteAvatar)
    const toggleActiveStatus = useUpdateProfile((state) => state.toggleActiveStatus)
    const showActiveStatus = useUpdateProfile((state) => state.showActiveStatus)
    const changeUsername = useUpdateProfile((state) => state.changeUsername)
    const changingUsername = useUpdateProfile((state) => state.changingUsername)
    const isUsernameEditable = useUpdateProfile((state) => state.isUsernameEditable)
    const setUsernameEditableFalse = useUpdateProfile((state) => state.setUsernameEditableFalse)
    const setUsernameEditableTrue = useUpdateProfile((state) => state.setUsernameEditableTrue)

    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [editImage, setEditImage] = useState<boolean>(false)
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    if (!user) {
        router.replace('/auth')
        return
    }

    const isLight = mode === 'light'


    const usernameForm = useForm<z.infer<typeof sendName>>({
        resolver: zodResolver(sendName),
        defaultValues: {
            name: ''
        },
    });

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0); // This forces it back to 0 (the true bottom)
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return (
        <SafeAreaView className={`flex-1 px-[16px] pt-5 ${isLight ? 'bg-[#ffffff]' : 'bg-[#000000]'}`}>
            <ScrollView>


                <Pressable
                    onPress={() => router.back()}
                    className='active:opacity-70'>
                    <Ionicons name='chevron-back' size={25} color={isLight ? '#000000' : '#ffffff'} />
                </Pressable>

                <View className=' justify-center items-center'>

                    {user.avatar ?
                        <Pressable
                            onPress={() => setEditImage(true)}
                            className='active:opacity-70 justify-center items-center mt-10'>
                            <Image className='w-[115px] h-[115px] rounded-full' source={{ uri: user.avatar }} />
                        </Pressable>
                        :
                        <Pressable
                            onPress={() => setEditImage(true)}

                            className='active:opacity-70 w-[115px] h-[115px] rounded-full bg-gray-200 justify-center items-center overflow-hidden'>

                            <Text className='text-[57.5px] text-center'>{user.name.charAt(0)}</Text>

                        </Pressable>
                    }

                    <Text className={`font-bold text-[24px] ${isLight ? 'text-[#000000]' : 'text-[#ffffff]'} mt-1`}>{user.name}</Text>
                </View>

                <View className='mt-8'>

                    <Pressable className={`flex-row justify-between items-center ${isLight ? 'border-b-[#9f9f9f]' : 'border-b-[#696969]'}  border-b-[0.5px] py-3 active:opacity-70`}>

                        <View className='justify-start items-center flex-row'>
                            <DarkModeIcon />
                            <Text className={`text-[17px] ${isLight ? 'text - [#000000]' : 'text-[#ffffff]'}  ml-3`}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={mode === 'dark'}
                            onValueChange={toggleMode}
                            trackColor={{ false: '#c9c9c9', true: '#34c759' }}
                            thumbColor={mode ? '#ffffff' : '#ffffff'}
                            ios_backgroundColor="#3e3e3e"
                            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                        />
                    </Pressable>


                    <Pressable
                        onPress={() => toggleActiveStatus()}
                        className={`flex-row justify-between items-center ${isLight ? 'border-b-[#9f9f9f]' : 'border-b-[#696969]'} border-b-[0.5px] py-3 active:opacity-70`}>

                        <View className='justify-start items-center flex-row'>
                            <ActiveStatusIcon />
                            <Text className={`text-[17px] ${isLight ? 'text - [#000000]' : 'text-[#ffffff]'}  ml-3`}>Active Status</Text>
                        </View>

                        <View className='flex-row justify-center items-center gap-2'>
                            <Text className={` ${isLight ? 'text-black/25' : 'text-white/25'} text-[17px]`}
                            >{showActiveStatus ? 'On' : 'Off'}</Text>
                            <Ionicons name='chevron-forward' size={24} color={isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'} />
                        </View>
                    </Pressable>


                    <Pressable className='flex-row justify-between items-center py-3 active:opacity-70'>

                        <View className='justify-start items-center flex-row'>
                            <EmailIcon />
                            <Text className={`text-[17px] ${isLight ? 'text - [#000000]' : 'text-[#ffffff]'}  ml-3`}>Email</Text>
                        </View>
                        <Text className='text-[17px]'
                            style={{ color: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)' }}
                        >{user.email}</Text>
                    </Pressable>

                </View>



                <View className='mt-8'>

                    <Text className='text-[15px] font-semibold'
                        style={{ color: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)' }}
                    >Account Settings</Text>


                    <Pressable
                        onPress={() => setUsernameEditableTrue()}
                        className={`flex-row justify-between items-center ${isLight ? 'border-b-[#9f9f9f]' : 'border-b-[#696969]'}  border-b-[0.5px] py-3 active:opacity-70`}>

                        <View className='justify-start items-center flex-row'>
                            <Text className={`text-[17px] ${isLight ? 'text-[#000000]' : 'text-[#ffffff]'} ml-3`}>Change Name</Text>
                        </View>

                        <View className='flex-row justify-center items-center gap-2'>
                            <Text className='text-[17px]'
                                style={{ color: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)' }}                        >{user.name}</Text>
                            <Ionicons name='chevron-forward' size={24} color={isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'} />
                        </View>
                    </Pressable>


                    <Pressable
                        onPress={() => setEditImage(true)}
                        className={`flex-row justify-between items-center ${isLight ? 'border-b-[#9f9f9f]' : 'border-b-[#696969]'}  border-b-[0.5px] py-3 active:opacity-70`}>

                        <View className='justify-start items-center flex-row'>
                            <Text className={`text-[17px] ${isLight ? 'text-[#000000]' : 'text-[#ffffff]'} ml-3`}>Change Avatar</Text>
                        </View>

                        <View className='flex-row justify-center items-center gap-2'>
                            <Text className='text-[17px]'
                                style={{ color: isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)' }}
                            >Edit</Text>
                            <Ionicons name='chevron-forward' size={24} color={isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'} />
                        </View>
                    </Pressable>

                    <View className='mt-10'>
                        <Pressable className='flex-row items-center justify-start gap-2 active:opacity-70 self-start px-3 py-2'
                            onPress={signOut}
                        >
                            <MaterialIcons name="logout" size={25} color="#f78181" />
                            <Text className='text-[17px] text-[#f78181] font-bold'>Logout</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setShowDeleteModal(true)}
                            className='flex-row items-center justify-start gap-2 active:opacity-70 mt-3 self-start px-3 py-2'>
                            <MaterialIcons name="delete-outline" size={25} color="#f78181" />
                            <Text className='text-[17px] text-[#f78181] font-bold'>Delete Account</Text>
                        </Pressable>
                    </View>


                </View>

                <Modal style={{ margin: 0 }} isVisible={editImage} animationIn={'slideInUp'} animationOut={'slideOutDown'} animationInTiming={200} animationOutTiming={200} backdropTransitionOutTiming={0} backdropColor='black' backdropOpacity={0.6}>

                    <Pressable
                        className="flex-1 justify-end"
                        onPress={() => setEditImage(false)}
                    >
                        <Pressable
                            className={`w-full rounded-t-3xl pb-10 px-6 ${isLight ? 'bg-white' : 'bg-[#262626]'}`}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View className="items-center w-full py-3">
                                <View className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-gray-300' : 'bg-gray-600'}`} />
                            </View>

                            <View className="flex-row justify-between items-center mb-8">
                                <Pressable onPress={() => setEditImage(false)} className="p-2 active:opacity-70">
                                    <Ionicons name='close' size={24} color={isLight ? 'black' : 'white'} />
                                </Pressable>

                                <Text className={`text-[18px] font-bold ${isLight ? 'text-black' : 'text-white'}`}>
                                    Profile picture
                                </Text>

                                {user.avatar && user.avatarId ?
                                    <Pressable onPress={() => deleteAvatar(user.avatar!, user.avatarId!)} className="p-2 active:opacity-70">
                                        <FontAwesome6 name="trash-can" size={18} color="#f78181" />
                                    </Pressable>

                                    :
                                    <View />
                                }
                            </View>

                            <View className="gap-y-6">
                                <Pressable
                                    onPress={() => captureFromCamera()}
                                    className="flex-row items-center gap-x-4 active:opacity-60">
                                    <View className={`p-3 rounded-full ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                                        <Ionicons name='camera' size={22} color={isLight ? 'black' : 'white'} />
                                    </View>
                                    <Text className={`text-lg ${isLight ? 'text-black' : 'text-white'}`}>Take a photo</Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => pickFromGallery()}
                                    className="flex-row items-center gap-x-4 active:opacity-60">
                                    <View className={`p-3 rounded-full ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                                        <Ionicons name='image' size={22} color={isLight ? 'black' : 'white'} />
                                    </View>
                                    <Text className={`text-lg ${isLight ? 'text-black' : 'text-white'}`}>Choose from gallery</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>

                <Modal
                    style={{ margin: 0 }}
                    isVisible={isUsernameEditable}
                    animationIn={'slideInUp'}
                    animationOut={'slideOutDown'}
                    animationInTiming={200}
                    animationOutTiming={200}
                    backdropColor='black'
                    backdropOpacity={0.6}
                >
                    <Pressable
                        className="flex-1 justify-end"
                        onPress={() => setUsernameEditableFalse()}
                    >
                        <Pressable
                            className={`w-full rounded-t-3xl pb-10 px-6 ${isLight ? 'bg-white' : 'bg-[#262626]'}`}
                            style={{ marginBottom: keyboardHeight }}
                            onPress={(e) => e.stopPropagation()}
                        >

                            <View className="items-center w-full py-3">
                                <View className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-gray-300' : 'bg-gray-600'}`} />
                            </View>


                            <View className="flex-row justify-between items-center mb-6">
                                <Text className={`text-[20px] font-bold ${isLight ? 'text-black' : 'text-white'}`}>
                                    Update Name
                                </Text>
                                <Pressable
                                    onPress={() => setUsernameEditableFalse()}
                                    className="p-1">
                                    <Ionicons name='close' size={26} color={isLight ? '#666' : '#aaa'} />
                                </Pressable>
                            </View>


                            <View className="mb-8">
                                <Text className={`mb-2 ml-1 text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Name
                                </Text>

                                <Controller
                                    key='username-verify'
                                    control={usernameForm.control}
                                    name='name'
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Enter your name"
                                            placeholderTextColor={isLight ? '#9ca3af' : '#6b7280'}
                                            autoFocus={true}
                                            className={`w-full p-4 rounded-2xl text-[16px] ${isLight ? 'bg-gray-100 text-black' : 'bg-white/5 text-white'
                                                } border ${isLight ? 'border-gray-200' : 'border-white/10'}
                                        ${usernameForm.formState.errors.name && 'border-[#EC6767]'} 
                                        `}
                                        />
                                    )} />

                                {usernameForm.formState.errors.name && (
                                    <Text className="text-xs text-[#ec6767] mt-1">{usernameForm.formState.errors.name?.message as string}</Text>
                                )}
                            </View>


                            <View className="flex-row gap-x-4">
                                <Pressable
                                    onPress={() => setUsernameEditableFalse()}
                                    className={`flex-1 h-14 rounded-2xl justify-center items-center ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}
                                >
                                    <Text className={`font-semibold text-base ${isLight ? 'text-black' : 'text-white'}`}>
                                        Cancel
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        usernameForm.handleSubmit(changeUsername)(),
                                            setTimeout(() => {
                                                usernameForm.reset()
                                            }, 300);
                                    }}
                                    disabled={changingUsername}
                                    className={`flex-1 h-14 rounded-2xl justify-center items-center bg-indigo-600 active:bg-indigo-700 ${changingUsername && 'opacity-50'}`}
                                >
                                    {changingUsername ?
                                        <ActivityIndicator color={'white'} size={'small'} />
                                        :
                                        <Text className="text-white font-semibold text-base">
                                            Save Changes
                                        </Text>
                                    }
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>


                <Modal
                    style={{ margin: 0 }}
                    isVisible={showDeleteModal}
                    onBackdropPress={() => setShowDeleteModal(false)}
                    animationIn={'fadeIn'}
                    animationOut={'fadeOut'}
                    backdropOpacity={0.7}
                >
                    <View className="flex-1 justify-center items-center px-6">
                        <View className={`w-full rounded-3xl p-6 ${isLight ? 'bg-white' : 'bg-[#1c1c1c]'}`}>

                            {/* Icon & Title */}
                            <View className="items-center mb-4">
                                <View className="bg-red-100 p-4 rounded-full mb-3">
                                    <MaterialIcons name="report-problem" size={32} color="#ef4444" />
                                </View>
                                <Text className={`text-xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>
                                    Delete Account?
                                </Text>
                            </View>

                            {/* Description */}
                            <Text className={`text-center text-[15px] mb-8 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                This action is permanent and cannot be undone. All your messages, media, and profile data will be permanently removed.
                            </Text>

                            {/* Actions */}
                            <View className="gap-y-3">
                                <Pressable
                                    onPress={() => {
                                        setShowDeleteModal(false);
                                        deleteUser(); // Your deletion function
                                    }}
                                    disabled={deletingUser}
                                    className={`w-full h-14 rounded-2xl justify-center items-center bg-red-500 active:bg-red-600 ${deletingUser ? 'opacity-50' : ''}`}
                                >
                                    {deletingUser ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold text-base">Delete My Account</Text>
                                    )}
                                </Pressable>

                                <Pressable
                                    onPress={() => setShowDeleteModal(false)}
                                    className={`w-full h-14 rounded-2xl justify-center items-center ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}
                                >
                                    <Text className={`font-semibold text-base ${isLight ? 'text-black' : 'text-white'}`}>
                                        Keep Account
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}