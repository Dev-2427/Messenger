import { Expo } from "expo-server-sdk";
import type { ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo()

type pushNotificationData = {
    chatId: string,
    senderId: string,
    senderAvatar: string | null,
    messageId: string | null,
}

export default async function sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data: pushNotificationData
) {

    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`)
        return
    }

    const message: ExpoPushMessage = {
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: { ...data, url: `/messages/messageScreen/${data.chatId}`},
        channelId: 'messages',
        priority: 'high',
    }

    if (data.senderAvatar) {
        (message as any).largeIcon = data.senderAvatar
    }

    try {
        const ticketChunk = await expo.sendPushNotificationsAsync([message])
        console.log('Notification payload:', JSON.stringify(message, null, 2));
        return ticketChunk
    } catch (error) {
        console.error('Error sending notification:', error)
        throw error
    }
}