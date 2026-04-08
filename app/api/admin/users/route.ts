import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import bcrypt from 'bcryptjs'
import { UserSummaryRow, UserIdRow } from '../../../../lib/db/types'
import { ResultSetHeader } from 'mysql2'
import { requireAdmin } from '../../../../lib/auth/server'

export async function POST(request: Request) {
    try {
        await requireAdmin();

        const { name, email, role} = await request.json()

        if (!name || !email || !role) {
            return NextResponse.json({ success: false, message: 'Name, email and role are required' }, { status: 400 })
        }

        const [existingUser] = await pool.query<UserIdRow[]>('SELECT id FROM users WHERE email = ?', [email])
        
        if (existingUser.length > 0) {
            return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 })
        }

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword,10);

        const [result] = await pool.query<ResultSetHeader>('INSERT INTO users (name, email, passwordHash, role) VALUES (?,?,?,?)', [name, email, hashedPassword, role])
        return NextResponse.json({ success: true, message: 'User created successfully' }, { status: 201 })
        
    } catch (error) {
                if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
            }
            if (error.message === 'Forbidden') {
                return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
            }
        }
        console.error('Error creating user:', error)
        return NextResponse.json({ success: false, message: 'Error creating user' }, { status: 500 })
    }

}


export async function GET() {
    try {
        await requireAdmin();
        const [rows] = await pool.query<UserSummaryRow[]>('SELECT id, name, email, role, isActive FROM users')
        return NextResponse.json({ success: true, users: rows }, { status: 200 })

    } catch (error) {
                if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
            }
            if (error.message === 'Forbidden') {
                return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
            }
        }
        console.error('Error fetching users:', error)
        return NextResponse.json({ success: false, message: 'Error fetching users' }, { status: 500 })
    }
}