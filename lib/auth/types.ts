import { UserRole } from "../db/types"

export type AuthTokenPayload = {
    userId: number
    email: string
    name: string
    role: UserRole
    iat?: number
    exp?: number
}

export type UserSummary = {
    id: number
    email: string
    name: string
    role: UserRole
    isActive: boolean
}