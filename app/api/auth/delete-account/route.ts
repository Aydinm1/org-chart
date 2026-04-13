import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import { requireAuthenticatedUser } from '../../../../lib/auth/server'

export async function POST() {
  try {
    const authUser = await requireAuthenticatedUser()

    await pool.query('UPDATE users SET isActive = 0 WHERE id = ?', [authUser.userId])

    const response = NextResponse.json({
      success: true,
      message: 'Account deactivated successfully',
    })

    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    })

    return response
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    console.error('Delete account error:', error)
    return NextResponse.json(
      { success: false, message: 'Error deactivating account' },
      { status: 500 },
    )
  }
}
