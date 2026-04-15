import { create } from "zustand";

type NotificationStore = {
  pendingChatId: string | null;
  pendingType: string | null;
  checked: boolean;
  setNotification: (chatId: string, type: string) => void;
  setChecked: () => void;
};

const useNotificationStore = create<NotificationStore>((set) => ({
  pendingChatId: null,
  pendingType: null,
  checked: false,
  setNotification: (chatId, type) =>
    set({ pendingChatId: chatId, pendingType: type, checked: true }),
  setChecked: () => set({ checked: true }),
}));

export default useNotificationStore;