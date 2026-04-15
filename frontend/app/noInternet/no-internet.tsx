import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { WifiOff, RefreshCw, MessageSquareOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/useThemeStore';
import { router } from 'expo-router';

export default function OfflineScreen() {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === 'dark';

  const handleRetry = () => {
    router.back()
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}
    >
      <View className="flex-1 items-center justify-center px-8">

        <View
          className={`w-32 h-32 items-center justify-center rounded-3xl border mb-8 shadow-sm ${isDark
            ? 'bg-indigo-500/10 border-indigo-500/20'
            : 'bg-blue-50 border-blue-100'
            }`}
        >
          <WifiOff
            size={56}
            color={isDark ? '#818cf8' : '#3b82f6'}
            strokeWidth={1.5}
          />
        </View>

        <View className="items-center mb-10">
          <Text
            className={`text-3xl font-bold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-blue-900'
              }`}
          >
            No Connection
          </Text>
          <Text
            className={`text-lg text-center leading-6 ${isDark ? 'text-zinc-400' : 'text-blue-600/70'
              }`}
          >
            We can't reach the server right now. Please check your internet to continue your conversations.
          </Text>
        </View>

        <Pressable
          onPress={handleRetry}
          className={`flex-row items-center justify-center w-full py-4 rounded-2xl active:opacity-90 shadow-lg ${isDark
            ? 'bg-indigo-500 shadow-none'
            : 'bg-blue-600 shadow-blue-200'
            }`}
        >
          <RefreshCw size={20} color="white" className="mr-2" />
          <Text className="text-white text-lg font-semibold">Try Again</Text>
        </Pressable>

        <View className="absolute bottom-10 flex-row items-center opacity-40">
          <MessageSquareOff
            size={14}
            color={isDark ? '#a1a1aa' : '#3b82f6'}
            className="mr-2"
          />
          <Text
            className={`text-xs uppercase tracking-widest font-medium ${isDark ? 'text-zinc-400' : 'text-blue-400'
              }`}
          >
            Waiting for Signal
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}