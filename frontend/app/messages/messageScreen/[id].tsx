import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import MessageScreenHeader from "../../../components/messages/messageHeader";
import { router, useLocalSearchParams } from 'expo-router';
import useGetUsers, { User } from '../../../stores/getUsersStore';
import { StatusBar } from 'expo-status-bar';
import Textbar from '../../../components/messages/textbar';
import useChatAndMessageStore, { FileMeta } from '../../../stores/chatAndMessageStore';
import { Chats } from '../../../types';
import Messages from '../../../components/messages/messages';
import { useThemeStore } from '../../../stores/useThemeStore';

export default function MessageScreen() {

  const { id, type, chatIdForRead, sharedText, sharedFileUri, sharedFileMime } = useLocalSearchParams()
  const allUsers = useGetUsers((state) => state.users)
  const setReceiverId = useChatAndMessageStore((state) => state.setReceiverId)
  const chats = useChatAndMessageStore((state) => state.chats)
  const setChatId = useChatAndMessageStore((state) => state.setChatId)
  const resetFileAndText = useChatAndMessageStore((state) => state.resetFileAndText)
  const markMessageAsRead = useChatAndMessageStore((state) => state.markMessageAsRead)
  const setMessage = useChatAndMessageStore((state) => state.setMessage)
  const addFileToArray = useChatAndMessageStore((state) => state.addFileToArray)

  const mode = useThemeStore((s) => s.mode)


  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  useEffect(() => {
    if (chatIdForRead) {
      markMessageAsRead(String(chatIdForRead))
    }
    return () => {
      setChatId(null)
      setReceiverId(null)
      resetFileAndText()
    }
  }, [])


  useEffect(() => {
    if (!id || !type) {
      router.replace('/home')
      return
    }

    if (type !== 'direct' && type !== 'group') {
      router.replace('/home')
    }
  }, [id, type, router])

  let user: User | undefined;
  let chat: Chats | undefined;

  if (type === 'direct') {
    user = type === 'direct' ? allUsers.find((user) => String(user._id) === String(id))
      : undefined

    if (!user) {
      chat = chats.find((chat) => String(chat._id) === String(id))
    }
  } else {
    chat = type === 'group' ? chats.find((chat) => String(chat._id) === String(id)) : undefined
  }

  useEffect(() => {
    if (type === 'direct' && !user && !chat) {
      router.replace('/home')
    }

    if (type === 'group' && !chat) {
      router.replace('/home')
    }
  }, [type, user, chat, setReceiverId, setChatId])


  useEffect(() => {
    if (type === 'direct' && user) {
      setReceiverId(String(id))
    } else if (type === 'direct' && chat) {
      setChatId(String(id))
    }

    if (type === 'group' && chat) {
      setChatId(String(id))
    }
  }, [type, user, chat, setChatId, setReceiverId])

  useEffect(() => {
    if (sharedText) {
      setMessage(sharedText.toString())
    }

    if (sharedFileUri) {
      const sharedFile: FileMeta = {
        uri: sharedFileUri as string,
        name: sharedFileUri.toString().split('/').pop() || `shared_${Date.now()}.jpg`,
        type: sharedFileMime as string,
        size: undefined,
        id: Date.now().toString(),
        kind: (sharedFileMime as string)?.startsWith('video') ? 'video' : 'image'
      }

      addFileToArray(sharedFile)
    }
  }, [])

  if (!id || !type) {
    return null
  }

  if ((type === 'direct' && !user && !chat) || (type === 'group' && !chat)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }
  const avatar: string | null | undefined = type === 'direct' ? (user?.avatar ?? chat?.chatAvatar) : undefined
  const name: string = type === 'direct' ? (user?.fullName ?? chat?.chatName ?? 'Unknown') : (chat?.chatAvatar ?? 'Group')
  const email: string | undefined = type === 'direct' ? (user?.email ?? chat?.otherUser?.email) : undefined
  // const ID: string = type === 'direct' ? (String(user?._id) ?? String(chat?._id)) : String(chat!._id)
  const ID: string = type === 'direct' ? (String(user?._id ?? chat?._id ?? id)) : String(chat?._id ?? id)
  const otherParticipantId: string | null = type === 'direct' ? (user?._id ?? chat?.otherUser?._id ?? null) : null
  const lastSeen: Date | null = type === 'direct' ? (user?.lastSeen ?? chat?.otherUser?.lastSeen ?? null) : null

  if (!id) {
    router.replace('/home')
    return null
  }

  return (
    <View style={{ flex: 1 }} className={`${mode === 'light' ? 'bg-[#ffffff]' : 'bg-[#000000]/90'} `}>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} backgroundColor={mode === 'light' ? '#e6e6e6' : '#ffffff'} />

      <MessageScreenHeader avatar={avatar as string} name={name as string} id={ID as string} type={String(type)} email={email} otherParticipantId={otherParticipantId} lastSeen={lastSeen} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={keyboardVisible}
      >

        <View style={{ flex: 1 }}>
          <Messages type={type as string} name={name} avatar={avatar as string} />
        </View>


        <Textbar />
      </KeyboardAvoidingView>
    </View>
  )
}





// 🔄 Refreshing tokens...
// LOG  ❌ Token refresh failed: [AxiosError: Request failed with status code 401]
// ERROR  Api request failed: [AxiosError: Request failed with status code 401]

// Call Stack
//  settle (node_modules\axios\dist\esm\axios.js)
//  onloadend (node_modules\axios\dist\esm\axios.js)
//  invoke (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
//  dispatch (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
//  INTERNAL_DISPATCH_METHOD_KEY (node_modules\react-native\src\private\webapis\dom\events\EventTarget.js)
//  dispatchTrustedEvent (node_modules\react-native\src\private\webapis\dom\events\internals\EventTargetInternals.js)
//  setReadyState (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
//  __didCompleteResponse (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
//  apply (<native>)
//  RCTNetworking.addListener$argument_1 (node_modules\react-native\Libraries\Network\XMLHttpRequest.js)
//  apply (<native>)
//  emit (node_modules\react-native\Libraries\vendor\emitter\EventEmitter.js)
//  apply (<native>)
//  <anonymous> (node_modules\@babel\runtime\helpers\superPropGet.js)
//  RCTDeviceEventEmitterImpl#emit (node_modules\react-native\Libraries\EventEmitter\RCTDeviceEventEmitter.js)
//  Axios$1#request (node_modules\axios\dist\esm\axios.js)
//  throw (<native>)
//  asyncGeneratorStep (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
//  _throw (node_modules\@babel\runtime\helpers\asyncToGenerator.js)
//  tryCallOne (address at (InternalBytecode.js:1:1180)
//  anonymous (address at (InternalBytecode.js:1:1874)
// LOG  token null




// Microsoft Windows [Version 10.0.26200.7623]
// (c) Microsoft Corporation. All rights reserved.

// D:\Messanger>cd backend

// D:\Messanger\backend>npm run dev

// > backend@1.0.0 dev
// > nodemon --watch src --ext ts,js --exec "tsc && node dist/server.js"

// [nodemon] 3.1.11
// [nodemon] to restart at any time, enter `rs`
// [nodemon] watching path(s): src\**\*
// [nodemon] watching extensions: ts,js
// [nodemon] starting `tsc && node dist/server.js`
// [dotenv@17.2.3] injecting env (15) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops
// Running cleanup...
// MongoDB connected!
// Example app listening on port 3000
// ✅ No temp files
// Token verification failed TokenExpiredError: jwt expired
//     at D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:190:21
//     at getSecret (D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:97:14)
//     at module.exports [as verify] (D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:101:10)
//     at authCheck (file:///D:/Messanger/backend/dist/middleware/authMiddleware.js:11:34)
//     at Layer.handleRequest (D:\Messanger\backend\node_modules\router\lib\layer.js:152:17)
//     at next (D:\Messanger\backend\node_modules\router\lib\route.js:157:13)
//     at Route.dispatch (D:\Messanger\backend\node_modules\router\lib\route.js:117:3)
//     at handle (D:\Messanger\backend\node_modules\router\index.js:435:11)
//     at Layer.handleRequest (D:\Messanger\backend\node_modules\router\lib\layer.js:152:17)
//     at D:\Messanger\backend\node_modules\router\index.js:295:15 {
//   expiredAt: 2026-02-03T10:26:29.000Z
// }
// ::ffff:10.180.104.162 - - [03/Feb/2026:15:32:29 +0000] "GET /api/auth/health_check HTTP/1.1" 408 54 "-" "okhttp/4.12.0"
// Token verification failed TokenExpiredError: jwt expired
//     at D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:190:21
//     at getSecret (D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:97:14)
//     at module.exports [as verify] (D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:101:10)
//     at authCheck (file:///D:/Messanger/backend/dist/middleware/authMiddleware.js:11:34)
//     at Layer.handleRequest (D:\Messanger\backend\node_modules\router\lib\layer.js:152:17)
//     at next (D:\Messanger\backend\node_modules\router\lib\route.js:157:13)
//     at Route.dispatch (D:\Messanger\backend\node_modules\router\lib\route.js:117:3)
//     at handle (D:\Messanger\backend\node_modules\router\index.js:435:11)
//     at Layer.handleRequest (D:\Messanger\backend\node_modules\router\lib\layer.js:152:17)
//     at D:\Messanger\backend\node_modules\router\index.js:295:15 {
//   expiredAt: 2026-02-03T10:26:29.000Z
// }
// ::ffff:10.180.104.162 - - [03/Feb/2026:15:32:29 +0000] "GET /api/auth/health_check HTTP/1.1" 408 54 "-" "okhttp/4.12.0"
// ::ffff:10.180.104.162 - - [03/Feb/2026:15:32:31 +0000] "POST /api/auth/refresh HTTP/1.1" 200 461 "-" "okhttp/4.12.0"
// ::ffff:10.180.104.162 - - [03/Feb/2026:15:32:32 +0000] "GET /api/auth/health_check HTTP/1.1" 304 - "-" "okhttp/4.12.0"
// User 692eae15aa731803d7370eee is online with socket BwS_vxAvv54T53l0AAAB
// ::ffff:10.180.104.162 - - [03/Feb/2026:15:32:34 +0000] "GET /api/users/get_users HTTP/1.1" 304 - "-" "okhttp/4.12.0"
// ::ffff:10.180.104.162 - - [03/Feb/2026:15:32:34 +0000] "GET /api/chat/get_chats HTTP/1.1" 304 - "-" "okhttp/4.12.0"
// Token verification failed TokenExpiredError: jwt expired
//     at D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:190:21
//     at getSecret (D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:97:14)
//     at module.exports [as verify] (D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:101:10)
//     at authCheck (file:///D:/Messanger/backend/dist/middleware/authMiddleware.js:11:34)
//     at Layer.handleRequest (D:\Messanger\backend\node_modules\router\lib\layer.js:152:17)
//     at next (D:\Messanger\backend\node_modules\router\lib\route.js:157:13)
//     at Route.dispatch (D:\Messanger\backend\node_modules\router\lib\route.js:117:3)
//     at handle (D:\Messanger\backend\node_modules\router\index.js:435:11)
//     at Layer.handleRequest (D:\Messanger\backend\node_modules\router\lib\layer.js:152:17)
//     at D:\Messanger\backend\node_modules\router\index.js:295:15 {
//   expiredAt: 2026-02-02T15:44:29.000Z
// }
// ::ffff:10.180.104.150 - - [03/Feb/2026:15:33:36 +0000] "GET /api/auth/health_check HTTP/1.1" 408 54 "-" "okhttp/4.12.0"
// Token verification failed TokenExpiredError: jwt expired
//     at D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:190:21
//     at getSecret (D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:97:14)
//     at module.exports [as verify] (D:\Messanger\backend\node_modules\jsonwebtoken\verify.js:101:10)
//     at authCheck (file:///D:/Messanger/backend/dist/middleware/authMiddleware.js:11:34)
//     at Layer.handleRequest (D:\Messanger\backend\node_modules\router\lib\layer.js:152:17)
//     at next (D:\Messanger\backend\node_modules\router\lib\route.js:157:13)
//     at Route.dispatch (D:\Messanger\backend\node_modules\router\lib\route.js:117:3)
//     at handle (D:\Messanger\backend\node_modules\router\index.js:435:11)
//     at Layer.handleRequest (D:\Messanger\backend\node_modules\router\lib\layer.js:152:17)
//     at D:\Messanger\backend\node_modules\router\index.js:295:15 {
//   expiredAt: 2026-02-02T15:44:29.000Z
// }
// ::ffff:10.180.104.150 - - [03/Feb/2026:15:33:36 +0000] "GET /api/auth/health_check HTTP/1.1" 408 54 "-" "okhttp/4.12.0"
// ::ffff:10.180.104.150 - - [03/Feb/2026:15:33:36 +0000] "POST /api/auth/refresh HTTP/1.1" 401 51 "-" "okhttp/4.12.0"
// 692eae15aa731803d7370eee



// "intentFilters": [
//         {
//           "action": "VIEW",
//           "autoVerify": true,
//           "data": [
//             {
//               "scheme": "com.devtanna.messenger"
//             }
//           ],
//           "category": [
//             "BROWSABLE",
//             "DEFAULT"
//           ]
//         }
//       ]