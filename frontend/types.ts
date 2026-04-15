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

export interface DeliveredTo {
  userId: string;
  deliveredAt: Date;
}

export interface ReadBy {
  userId: string;
  readAt: Date;
}

export interface DeletedFor {
  userId: string;
}

export interface Message {
  _id: string;
  chatId: string;
  sender: User;
  text: string | null;
  media: Media[];
  status: 'sent' | 'delivered' | 'read';
  deliveredTo: DeliveredTo[];
  readBy: ReadBy[];
  deletedFor: DeletedFor[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chats {
  _id: string,
  type: 'direct' | 'group',
  chatName: string,
  chatAvatar: string | null,
  chatAvatarId?: string,
  otherUser?: User,
  participants?: User[],
  groupAdmin?: User[],
  lastMessage: {
    text?: string,
    senderName?: string,
    senderId: string,
    time: string,
    status: 'sent' | 'delivered' | 'read'
  }
}

export type MessagesState = Message[];