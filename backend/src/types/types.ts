export interface SignUpBody {
    fullName: string,
    email: string,
    password: string
}

export interface VerifyCodeBody {
    code: string,
    userId: string,
    justSendEmail: string
}

export interface SignInBody {
    email: string,
    password: string
}

export interface sendEmailBody {
    email: string,
}

export interface resetPasswordBody {
    password: string,
    confirmPassword: string,
    userId: string
}


export interface deleteMessageBody {
    chatId: string,
    messageId: string,
    mediaId: string,
    type: 'text' | 'media'
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string
            }
        }
    }
}