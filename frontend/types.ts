export interface User {
  _id: string;
  fullName: string;
  avatar?: string | null;
  email?: string;
  lastSeen?: Date | null
}

export interface Media {
  _id?: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  size?: number;
  fileName?: string;
  fileId?: string
}


export interface Message {
  _id: string;
  chatId: string;
  sender: User;
  text: string | null;
  media: Media[];
  status: 'sent' | 'read';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chats {
  _id: string,
  chatName: string,
  chatAvatar: string | null,
  chatAvatarId?: string,
  otherUser?: User,
  lastMessage: {
    text?: string,
    senderId: string,
    time: string,
    status: 'sent' | 'read'
  }
}

export type MessagesState = Message[];