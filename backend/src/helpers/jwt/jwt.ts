import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d'
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error("JWT secrets are not defined in environment variables")
}

export function generateAccessToken(userId: string) {
    return jwt.sign(
        { userId }, ACCESS_SECRET as string,
        { expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
    )
}
export function generateRefreshToken(userId: string) {
    return jwt.sign(
        { userId }, REFRESH_SECRET as string,
        { expiresIn: REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
    )
}