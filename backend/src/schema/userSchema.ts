import mongoose, { Document } from "mongoose";


interface IUser extends Document {
    fullName: string;
    avatar: string | null;
    avatarId: string | null;
    email: string;
    password: string;
    isVerified: boolean;
    verifyCode: string | null;
    verifyCodeExpiry: Date | null;
    googleId: string | null,
    authProvider: String,
    lastSeen: Date | null;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
    expoPushToken: string | null
}

const UserSchema = new mongoose.Schema<IUser>({
    fullName: {
        type: String,
        required: true,
        maxlength: 30,
        minlength: 3
    },
    avatar: {
        type: String,
        default: null
    },
    avatarId: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
            "Please enter a valid email address"
        ],
        index: 1
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === 'local'
        },
        trim: true,
        minlength: 8
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifyCode: {
        type: String,
        default: null,
    },
    verifyCodeExpiry: {
        type: Date,
        default: null
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        default: null
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'hybrid'],
        required: true,
        default: 'local'
    },
    lastSeen: {
        type: Date,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    expoPushToken: {
        type: String,
        default: null
    }

}, { timestamps: true })

const User = mongoose.model("User", UserSchema)

export default User