import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { Platform, ToastAndroid } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        // shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
})

export async function registerPushNotificationAsync(): Promise<string | undefined> {

    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('messages', {
            name: 'Messages',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            showBadge: true
        })
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()

        let finalStatus = existingStatus

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status
        }

        if (finalStatus !== 'granted') {
            ToastAndroid.show(
                'Permission not granted for notifications',
                ToastAndroid.SHORT
            )
            return
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId

            if (!projectId) {
                throw new Error('Project ID not found')
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data

        } catch (error) {
            console.error('Error getting push token:', error)
        }
    } else {
        console.log('Must use physical device for notifications')
    }
    return token
}

export async function sendLocalNotification(
    title: string,
    body: string,
    data: Record<string, any> = {}
) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true
        },
        trigger: null,
        ...(Platform.OS === 'android' && {
            android: {
                channelId: 'messages'
            }
        })
    })
}