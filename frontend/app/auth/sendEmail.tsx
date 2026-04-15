import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import BackButton from '../../components/auth/backButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendEmail } from '../../helpers/schemaValidations/schemaValidation';
import z from 'zod';
import useAuthStore from '../../stores/authStore';

const SendEmail = () => {

    const verifyEmailSubmit = useAuthStore((state) => state.verifyEmailSubmit)
    const isVerifyingEmail = useAuthStore((state) => state.isVerifyingEmail)

    const emailForm = useForm<z.infer<typeof sendEmail>>({
        resolver: zodResolver(sendEmail),
        defaultValues: {
            email: '',
        },
    });



    return (
        <SafeAreaView className='flex-1 items-start px-[26px]'>
            <BackButton path='/auth/authentication' />

            <View className="w-full mt-[36px]">
                <Text className="text-[#2A2A2A] mb-[8px] text-[16px] font-semibold">
                    Email
                </Text>

                <Controller
                    key="email-verify"
                    control={emailForm.control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className={`border-2  rounded-[12px] text-[#545454] h-[56px] px-[21px] py-[18px] ${emailForm.formState.errors.email ? "border-[#EC6767]" : "border-[#e1e1e1] w-full"
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

                {emailForm.formState.errors.email && (
                    <Text className="text-xs text-[#ec6767] mt-1">
                        {emailForm.formState.errors.email?.message as string}
                    </Text>
                )}

                <Pressable
                    className={` rounded-[12px] bg-[#648DDB] mt-[26px] ${isVerifyingEmail && 'opacity-40'} h-[56px] border-neutral-700 justify-center items-center`}
                    onPress={emailForm.handleSubmit(verifyEmailSubmit)}
                    disabled={isVerifyingEmail}
                >
                    {isVerifyingEmail ? (
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

export default SendEmail