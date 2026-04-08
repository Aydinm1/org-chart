import { RowDataPacket } from "mysql2";


export type UserRole = "admin" | "viewer" | "editor";

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