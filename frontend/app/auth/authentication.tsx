import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { signinSchema, signupSchema } from '../../helpers/schemaValidations/schemaValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from 'react-native';
import useAuthStore from '../../stores/authStore';
import * as SecureStore from "expo-secure-store";
import { safeReplace } from '../../helpers/safeNavigation';
import { Image } from 'expo-image';
// import { useGoogleLogin } from '../../helpers/googleAuth/useGoogleLogin';

type mode = "signin" | "signup"


export default function Auth() {

    // const { signInWithGoogle } = useGoogleLogin()
    const [screen, setScreen] = useState<mode>('signin')

    const signUp = useAuthStore((state) => state.signUp)
    const signIn = useAuthStore((state) => state.signIn)

    const isLoading = useAuthStore((state) => screen === 'signin' ? state.isSigningIn : state.isSigningUp)

    const signupForm = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: ''
        }
    })

    const signinForm = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    function toggleScreen(screen: mode) {
        setScreen(screen)
    }

    const isSignup = screen === 'signup'

    return (
        <SafeAreaView className="flex-1 items-center bg-[#ffffff]" edges={['top', 'bottom']}>

            <View className="px-20 py-[83px] flex-row gap-16">

                <View className="items-center w-28">
                    <Text
                        className={`font-semibold text-[20px] ${screen === 'signin' ? 'text-[#648ddb]' : 'text-[#d9d9d9]'
                            }`}
                        onPress={() => toggleScreen('signin')}
                    >
                        Log in
                    </Text>

                    {screen === 'signin' && (
                        <View className="w-full border-b-2 border-[#648ddb] mt-1" />
                    )}
                </View>

                <View className="items-center w-28">
                    <Text
                        className={`font-semibold text-[20px] ${screen === 'signup' ? 'text-[#648ddb]' : 'text-[#c6c3c3]'
                            }`}
                        onPress={() => toggleScreen('signup')}
                    >
                        Sign up
                    </Text>

                    {screen === 'signup' && (
                        <View className="w-full border-b-2 border-[#648ddb] mt-1" />
                    )}
                </View>

            </View>


            <View className='w-full px-[25px] gap-[16px]'>

                {isSignup && (
                    <View className="">
                        <Text className="text-[#2A2A2A] mb-[8px] text-[16px] font-semibold">Name</Text>
                        <Controller
                            control={signupForm.control}
                            name="fullName"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`border-2  rounded-[12px] text-[#545454] h-[56px] px-[21px] py-[18px] ${signupForm.formState.errors.fullName ? "border-[#EC6767]" : "border-[#e1e1e1]"
                                        }`}
                                    placeholder="John Doe"
                                    placeholderTextColor="#B3B3B3"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                        {signupForm.formState.errors.fullName && (
                            <Text className="text-xs text-[#ec6767] mt-1">
                                {signupForm.formState.errors.fullName?.message as string}
                            </Text>
                        )}
                    </View>
                )}


                <View className="">
                    <Text className="text-[#2A2A2A] mb-[8px] text-[16px] font-semibold">Email</Text>
                    {isSignup ? (
                        <Controller
                            key="email-signup"
                            control={signupForm.control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`border-2  rounded-[12px] text-[#545454] h-[56px] px-[21px] py-[18px] ${signupForm.formState.errors.email ? "border-[#EC6767]" : "border-[#e1e1e1]"
                                        }`}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#B3B3B3"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    ) : (
                        <Controller
                            key="email-signin"
                            control={signinForm.control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`border-2  rounded-[12px] text-[#545454] h-[56px] px-[21px] py-[18px] ${signinForm.formState.errors.email ? "border-[#EC6767]" : "border-[#e1e1e1]"
                                        }`}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#B3B3B3"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    )}
                    {(isSignup ? signupForm.formState.errors.email : signinForm.formState.errors.email) && (
                        <Text className="text-xs text-[#ec6767] mt-1">
                            {(isSignup ? signupForm.formState.errors.email : signinForm.formState.errors.email)?.message as string}
                        </Text>
                    )}
                </View>


                <View className="">
                    <Text className="text-[#2A2A2A] mb-[8px] text-[16px] font-semibold">Password</Text>
                    {isSignup ? (
                        <Controller
                            key="password-signup"
                            control={signupForm.control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput autoCapitalize='none'
                                    className={`border-2  rounded-[12px] text-[#545454] h-[56px] px-[21px] py-[18px] ${signupForm.formState.errors.password ? "border-[#EC6767]" : "border-[#e1e1e1]"
                                        }`}
                                    placeholder="********"
                                    placeholderTextColor="#B3B3B3"
                                    secureTextEntry
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    ) : (
                        <Controller
                            key="password-signin"
                            control={signinForm.control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput autoCapitalize='none'
                                    className={`border-2  rounded-[12px] text-[#545454] h-[56px] px-[21px] py-[18px] ${signinForm.formState.errors.password ? "border-[#EC6767]" : "border-[#e1e1e1]"
                                        }`}
                                    placeholder="********"
                                    placeholderTextColor="#B3B3B3"
                                    secureTextEntry
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    )}
                    {(isSignup ? signupForm.formState.errors.password : signinForm.formState.errors.password) && (
                        <Text className="text-xs text-[#ec6767] mt-1">
                            {(isSignup ? signupForm.formState.errors.password : signinForm.formState.errors.password)?.message as string}
                        </Text>
                    )}
                </View>

                {screen == 'signin' &&
                    <Pressable onPress={() => safeReplace('/auth/sendEmail')}>
                        <Text className='text-[#648DDB] font-semibold text-right'>Forgot password?</Text>
                    </Pressable>
                }


                <Pressable
                    className={` rounded-[12px] bg-[#648DDB] ${isLoading && 'opacity-40'} h-[56px] border-neutral-700 justify-center items-center`}
                    onPress={
                        isSignup
                            ? signupForm.handleSubmit(signUp)
                            : signinForm.handleSubmit(signIn)
                    }
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color='white' size={'large'} />
                    ) : (
                        <Text className="font-bold text-[16px] text-[#ffffff]">
                            {screen === "signup" ? "Create account" : "Log in"}
                        </Text>
                    )}
                </Pressable>

                {/* --- GOOGLE LOGIN SECTION --- */}
                <View className="flex-row items-center my-4">
                    <View className="flex-1 h-[1px] bg-[#e1e1e1]" />
                    <Text className="mx-4 text-[#B3B3B3] font-medium">Or continue with</Text>
                    <View className="flex-1 h-[1px] bg-[#e1e1e1]" />
                </View>

                <Pressable
                    // onPress={signInWithGoogle}
                    // disabled={disabled}
                    className="flex-row items-center justify-center h-[56px] border-2 border-[#e1e1e1] rounded-[12px] bg-white active:bg-gray-50"
                >
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' }}
                        style={{ width: 20, height: 20 }}
                        contentFit="contain"
                    />
                    <Text className="ml-3 text-[16px] font-semibold text-[#545454]">
                        Google
                    </Text>
                </Pressable>

            </View>

        </SafeAreaView>
    )
}