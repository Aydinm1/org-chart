import {cookies} from 'next/headers'
import { AuthTokenPayload } from './types';
import jwt from 'jsonwebtoken'
import { UserRole, UserSummaryRow } from '../db/types';
import pool from '../db';


export async function getCurrentUser():Promise<{ userId: number, email: string, name: string, role: UserRole } | null> {
    const cookiestore = await cookies();
    const token = cookiestore.get('auth_token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;
       
        const [rows] = await pool.query<UserSummaryRow[]>("SELECT id, email, name, role, isActive FROM users WHERE id = ? LIMIT 1", [decoded.userId]);
        const user = rows[0];

        if (!user) {
            return null;
        }
        if (!user.isActive) {
            return null;
        }

        return {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }

    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }


}

export async function requireAdmin() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    if (user.role !== 'admin') {
        throw new Error('Forbidden');
    }

    return user;
}

export async function requireAuthenticatedUser() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

export async function requireEditorOrAdmin() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }
    if(user.role !== 'admin' && user.role !== 'editor') {
        throw new Error('Forbidden');
    }

    return user;
}
