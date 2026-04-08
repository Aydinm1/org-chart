import {NextRequest, NextResponse} from 'next/server'
import pool from '../../../../../lib/db'
import { UserIdRow, UserSummaryRow, USER_ROLES } from '../../../../../lib/db/types'
import { requireAdmin } from '../../../../../lib/auth/server'


export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await requireAdmin();
        
        const { userId } = await params;

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
                if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
            }
            if (error.message === 'Forbidden') {
                return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
            }
        }
        console.error('Error deleting user:', error)
        return NextResponse.json({ success: false, message: 'Error deleting user' }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await requireAdmin();

        const {userId} = await params;

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

        const [userRows] = await pool.query<UserSummaryRow[]>('SELECT id, name, email, role, isActive FROM users WHERE id = ?', [userIdNum])
        const user = (userRows)[0]
        return NextResponse.json({ success: true, user }, { status: 200 })

    } catch (error) {
                if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
            }
            if (error.message === 'Forbidden') {
                return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
            }
        }
        console.error('Error fetching user:', error)
        return NextResponse.json({ success: false, message: 'Error fetching user' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
){
    try {
        await requireAdmin();
        const {userId} = await params;
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

        const { name, email, role, isActive } = await request.json()

        if (name === undefined && email === undefined && role === undefined && isActive === undefined) {
            return NextResponse.json({ success: false, message: 'At least one field (name, email, role, isActive) must be provided for update' }, { status: 400 })
        }

        if(name !== undefined && name.trim() === '') {
            return NextResponse.json({ success: false, message: 'Name cannot be empty' }, { status: 400 })
        }

        if(email !== undefined && email.trim() === '') {
            return NextResponse.json({ success: false, message: 'Email cannot be empty' }, { status: 400 })
        }

        if (role !== undefined && !USER_ROLES.includes(role)) {
            return NextResponse.json({ success: false, message: 'Invalid role. Must be one of admin, viewer, editor' }, { status: 400 })
        }

        if (isActive !== undefined && typeof isActive !== 'boolean') {
            return NextResponse.json({ success: false, message: 'isActive must be a boolean' }, { status: 400 })
        }

        if (email !== undefined) {
            const [existingUser] = await pool.query<UserIdRow[]>('SELECT id FROM users WHERE email = ? AND id != ?', [email, userIdNum])
        
            if (existingUser.length > 0) {
                return NextResponse.json({ success: false, message: 'Email already in use by another user' }, { status: 400 })
            }
        }

        await pool.query('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), isActive = COALESCE(?, isActive) WHERE id = ?', [name, email, role, isActive, userIdNum])
        return NextResponse.json({ success: true, message: 'User updated successfully' }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
            }
            if (error.message === 'Forbidden') {
                return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
            }
        }
        console.error('Error updating user:', error)
        return NextResponse.json({ success: false, message: 'Error updating user' }, { status: 500 })
    }
}