import { UserRole } from "../db/types"

export type AuthTokenPayload = {
    userId: number
    email: string
    name: string
    role: UserRole
    iat?: number
    exp?: number
}