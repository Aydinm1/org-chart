import { RowDataPacket } from "mysql2";


export const USER_ROLES = ["admin", "viewer", "editor"] as const;
export type UserRole = typeof USER_ROLES[number];

export type UserRow = RowDataPacket & {
  id: number
  email: string
  passwordHash: string
  name: string
  role: UserRole
  isActive: boolean
}

export type UserSummaryRow = RowDataPacket & {
    id: number
    email: string
    name: string
    role: UserRole
    isActive: boolean
}

export type UserIdRow = RowDataPacket & {
    id: number
  }