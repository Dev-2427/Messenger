import * as ImagePicker from "expo-image-picker";
import { Button, Image, Pressable, Text, View } from "react-native";
import imgAuth from "../../stores/imgAuth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';

export default function Test() {

    const setFiles = imgAuth((s) => s.setFiles)
    const uploadToImagekit = imgAuth((s) => s.handleSave)
    const file = imgAuth((s) => s.file)
    const uploading = imgAuth((s) => s.uploading)
    const uploadProgress = imgAuth((s) => s.uploadProgress)
    const cancelUpload = imgAuth((s) => s.cancelUpload)


    const pickFile = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos"],
            quality: 1,
        });

        if (result.canceled) {
            return;
        }

        const file = result.assets[0];

        const ext = file.uri.split('.').pop() ?? (file.type === 'video' ? 'mp4' : 'jpg')

        const fileUrl = file.uri
        const mimeType = file.mimeType ?? (file.type === 'video' ? 'video/mp4' : 'image/jpg')
        const fileName = `${file.type?.toUpperCase()}_${Date.now()}_${ext}`

        setFiles(fileUrl, mimeType, fileName)

        console.log("fileeeee", file)
    };

    const testLocalNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Test Message",
                body: "This is a local test",
                data: { test: true },
            },
            trigger: null,
        });
    };
    return (
        <SafeAreaProvider className="flex-1 justify-center items-center gap-5">

            {file && file.fileUrl &&
                <Image
                    className="w-[200px] h-[200px] rounded-xl mb-4"
                    source={{ uri: file?.fileUrl }} />
            }
            <View>
                <Button title="Pick File" onPress={pickFile} />
            </View>
            <Pressable
                className={`active:opacity-70 ${uploading && 'opacity-20'} bg-blue-500 p-3 rounded-lg`}
                disabled={uploading}
                onPress={uploadToImagekit}>

                <Text>
                    Upload to imagekit
                </Text>
            </Pressable>

            {uploading &&
                <View>
                    <Text>
                        Uploading: {uploadProgress} %
                    </Text>

                    <View className="h-2 w-64 bg-gray-300 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-blue-500"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </View>


                    <Pressable
                        onPress={() => cancelUpload()}
                        className="active:opacity-70 bg-black">
                        <Text className="text-white">Cancel upload</Text>
                    </Pressable>
                </View>
            }

            <Button title="Test Local Notification" onPress={testLocalNotification} />

        </SafeAreaProvider >
    );
}
