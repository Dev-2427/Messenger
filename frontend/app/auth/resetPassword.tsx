import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native'
import React from 'react'
import BackButton from '../../components/auth/backButton'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller, useForm } from 'react-hook-form'
import { useLocalSearchParams } from 'expo-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendPassword } from '../../helpers/schemaValidations/schemaValidation'
import useAuthStore from '../../stores/authStore'

const resetPassword = () => {

    const { userId } = useLocalSearchParams()

    const resetPasswordSubmit = useAuthStore((state) => state.resetPasswordSubmit)
    const isVerifyingPassword = useAuthStore((state) => state.isVerifyingPassword)

    const passwordForm = useForm({
        resolver: zodResolver(sendPassword),
        defaultValues: {
            password: '',
            confirmPassword: '',
            userId : userId as string
        }
    })

    return (
        <SafeAreaView className='flex-1 items-start px-[24px]'>
            <BackButton path='/auth/authentication' />

            <View className="w-full mt-[36px]">
                <Text className="text-[#2A2A2A] mb-[8px] text-[16px] font-semibold">
                    Password
                </Text>

                <Controller
                    key="email-signup"
                    control={passwordForm.control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className={`border-2  rounded-[12px] text-[#545454] h-[56px] px-[21px] py-[18px] ${passwordForm.formState.errors.password ? "border-[#EC6767]" : "border-[#e1e1e1] w-full"
                                }`}
                            placeholder="********"
                            placeholderTextColor="#B3B3B3"
                            autoCapitalize="none"
                            keyboardType="visible-password"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />

                {passwordForm.formState.errors.password && (
                    <Text className="text-xs text-[#ec6767] mt-1">
                        {passwordForm.formState.errors.password?.message as string}
                    </Text>
                )}


                <Text className="text-[#2A2A2A] mb-[8px] text-[16px] font-semibold">
                    Confirm password
                </Text>

                <Controller
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className={`border-2  rounded-[12px] text-[#545454] h-[56px] px-[21px] py-[18px] ${passwordForm.formState.errors.confirmPassword ? "border-[#EC6767]" : "border-[#e1e1e1] w-full"
                                }`}
                            placeholder="********"
                            placeholderTextColor="#B3B3B3"
                            autoCapitalize="none"
                            keyboardType="visible-password"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />

                {passwordForm.formState.errors.confirmPassword && (
                    <Text className="text-xs text-[#ec6767] mt-1">
                        {passwordForm.formState.errors.confirmPassword?.message as string}
                    </Text>
                )}

                <Pressable
                    className={` rounded-[12px] bg-[#648DDB] mt-[26px] ${isVerifyingPassword && 'opacity-40'} h-[56px] border-neutral-700 justify-center items-center`}
                    onPress={passwordForm.handleSubmit(resetPasswordSubmit)}
                    disabled={isVerifyingPassword}
                >
                    {isVerifyingPassword ? (
                        <ActivityIndicator color='white' size={'large'} />
                    ) : (
                        <Text className="font-bold text-[16px] text-[#ffffff]">
                            Verify email
                        </Text>
                    )}
                </Pressable>

            </View>

        </SafeAreaView>
    )
}

export default resetPassword