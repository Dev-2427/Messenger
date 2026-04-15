import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native'
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { codeValidation, signinSchema } from '../../helpers/schemaValidations/schemaValidation'
import { zodResolver } from '@hookform/resolvers/zod'
import { SafeAreaView } from 'react-native-safe-area-context'
import useAuthStore from '../../stores/authStore'
import OtpInput from '../../components/auth/otpInput'
import BackButton from '../../components/auth/backButton'

export default function VerifyCode() {

    const { email, userId, justSendEmail } = useLocalSearchParams()

    const verifyCode = useAuthStore((state) => state.verifyCode)
    const isVerifyingCode = useAuthStore((state) => state.isVerifyingCode)

    const verifyCodeForm = useForm<z.infer<typeof codeValidation>>({
        resolver: zodResolver(codeValidation),
        defaultValues: {
            code: "",
            justSendEmail: justSendEmail as string
        }
    })



    async function sendEmail() {

    }

    return (
        <SafeAreaView className='flex-1 items-start px-[25px]'>

            <BackButton path='/auth/authentication' />

            <Text className='text-[#1E1E1E] font-semibold text-[20px] mt-[26px] mb-[18px]'>
                Check your email
            </Text>

            <Text className='text-[16px] font-semibold text-[#989898] mb-[18px]'>We sent a reset link to <Text className='text-[16px] font-semibold text-[#545454]'>{email} </Text>enter 5 digit code that mentioned in the email</Text>


            <View className="w-full items-center">

                <Controller
                    control={verifyCodeForm.control}
                    name="code"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <OtpInput
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            length={6}
                        />
                    )}
                />
                {verifyCodeForm.formState.errors.code && (
                    <Text className="text-xs text-[#ec6767] mt-1">
                        {verifyCodeForm.formState.errors.code?.message as string}
                    </Text>
                )}


                <Pressable className=" rounded-[12px] bg-[#648DDB] mt-[24px] h-[56px] border-neutral-700 justify-center items-center w-full"
                    onPress={verifyCodeForm.handleSubmit((FormData) =>
                        verifyCode(FormData, String(userId))
                    )}
                    disabled={isVerifyingCode}
                >
                    <Text className="font-bold text-[16px] text-[#ffffff]">
                        {isVerifyingCode ? <ActivityIndicator color='white' size={'large'} /> : 'Verify Code'}
                    </Text>
                </Pressable>

            </View>




            <View className='w-full items-center mt-[36px]'>
                <View className='flex-row items-center'>
                    <Text className='text-[16px] font-semibold text-[#989898]'>Haven't got the email yet? </Text>
                    <Pressable className='border-b-2 border-[#648ddb]'
                        onPress={sendEmail}
                    >
                        <Text className='text-[16px] font-semibold text-[#648ddb]'>Resend email</Text>
                    </Pressable>
                </View>
            </View>

        </SafeAreaView>
    )
}