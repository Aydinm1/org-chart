import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { RowDataPacket } from 'mysql2/promise'

type UserRow = RowDataPacket & {
  id: number
  email: string
  passwordHash: string
  name: string
  role: "admin" | "viewer" | "editor";
  isActive: boolean
}

export async function POST(request: Request) {
    try{
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const [rows] = await pool.query<UserRow[]>("SELECT id, email, passwordHash, name, role, isActive FROM users WHERE email = ? LIMIT 1", [email]);

        const user = (rows as UserRow[])[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
        if (!user.isActive) {
            return NextResponse.json({ error: 'User account is inactive' }, { status: 403 });
        }
        
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
    }


}
