import {NextRequest, NextResponse} from 'next/server'
import { cookies } from 'next/headers'
import pool from '../../../../../lib/db'
import jwt from 'jsonwebtoken'
import { UserIdRow, UserSummaryRow } from '../../../../../lib/db/types'
import { AuthTokenPayload } from '../../../../../lib/auth/types'


export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload

        if (decoded.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
        }

        const {userId} = await params

        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 })
        }

        const userIdNum = Number(userId)

        if (isNaN(userIdNum)) {
            return NextResponse.json({ success: false, message: 'Invalid User ID' }, { status: 400 })
        }

        const [rows] = await pool.query<UserIdRow[]>('SELECT id FROM users WHERE id = ?', [userIdNum])

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        await pool.query('DELETE FROM users WHERE id = ?', [userIdNum])
        return NextResponse.json({ success: true, message: 'User deleted successfully' }, { status: 200 })

    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ success: false, message: 'Error deleting user' }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload

        if (decoded.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
        }

        const {userId} = await params
        const userIdNum = Number(userId)

        if (isNaN(userIdNum)) {
            return NextResponse.json({ success: false, message: 'Invalid User ID' }, { status: 400 })
        }

        const [rows] = await pool.query<UserIdRow[]>('SELECT id FROM users WHERE id = ?', [userIdNum])

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        const [userRows] = await pool.query<UserSummaryRow[]>('SELECT id, name, email, role, isActive FROM users WHERE id = ?', [userIdNum])
        const user = (userRows)[0]
        return NextResponse.json({ success: true, user }, { status: 200 })

    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ success: false, message: 'Error fetching user' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
){
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload

        if (decoded.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
        }

        const {userId} = await params
        const userIdNum = Number(userId)

        if (isNaN(userIdNum)) {
            return NextResponse.json({ success: false, message: 'Invalid User ID' }, { status: 400 })
        }

        const [rows] = await pool.query<UserIdRow[]>('SELECT id FROM users WHERE id = ?', [userIdNum])

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        const { name, email, role, isActive } = await request.json()

        if (email) {
            const [existingUser] = await pool.query<UserIdRow[]>('SELECT id FROM users WHERE email = ? AND id != ?', [email, userIdNum])
        
            if (existingUser.length > 0) {
                return NextResponse.json({ success: false, message: 'Email already in use by another user' }, { status: 400 })
            }
        }

        await pool.query('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), isActive = COALESCE(?, isActive) WHERE id = ?', [name, email, role, isActive, userIdNum])
        return NextResponse.json({ success: true, message: 'User updated successfully' }, { status: 200 })

    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ success: false, message: 'Error updating user' }, { status: 500 })
    }
}