import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '../../../../lib/db'
import { requireAuthenticatedUser } from '../../../../lib/auth/server'
import type { UserRow } from '../../../../lib/db/types'

export async function POST(request: Request) {
  try {
    const authUser = await requireAuthenticatedUser()
    const body = await request.json()

    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : ''
    const confirmPassword =
      typeof body.confirmPassword === 'string' ? body.confirmPassword : ''

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All password fields are required' },
        { status: 400 },
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters' },
        { status: 400 },
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New passwords do not match' },
        { status: 400 },
      )
    }

    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, email, passwordHash, name, role, isActive FROM users WHERE id = ? LIMIT 1',
      [authUser.userId],
    )

    const user = rows[0]

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 },
      )
    }

    const nextPasswordMatchesCurrent = await bcrypt.compare(newPassword, user.passwordHash)

    if (nextPasswordMatchesCurrent) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from the current password' },
        { status: 400 },
      )
    }

    const nextPasswordHash = await bcrypt.hash(newPassword, 10)

    await pool.query('UPDATE users SET passwordHash = ? WHERE id = ?', [
      nextPasswordHash,
      authUser.userId,
    ])

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    console.error('Change password error:', error)
    return NextResponse.json(
      { success: false, message: 'Error updating password' },
      { status: 500 },
    )
  }
}
