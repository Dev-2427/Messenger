import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_ID,

    scopes: ['profile', 'email']
})

const isExpoGo = Constants.appOwnership === 'expo'

export async function googleSignIn() {
    try {
        if (isExpoGo) {
            Toast.show({ type: 'error', text1: 'Google Sign-In not available in Expo Go' })
            return null
        }
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

        } catch (error) {
            Toast.show({ type: 'error', text1: 'Google Play Services not available' })
            return null
        }
        const userInfo = await GoogleSignin.signIn()
        if (userInfo.type === 'cancelled') return null
        console.log('userInfo', userInfo)
        const tokens = await GoogleSignin.getTokens()
        console.log('tokens', tokens)

        return tokens.idToken
    } catch (error: any) {
        Toast.show({ type: 'error', text1: 'Google login failed' })
        throw error
    }
}