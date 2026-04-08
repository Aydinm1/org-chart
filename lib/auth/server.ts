import {cookies} from 'next/headers'
import { AuthTokenPayload } from './types';
import jwt from 'jsonwebtoken'


export async function getCurrentUser() {
    const cookiestore = await cookies();
    const token = cookiestore.get('auth_token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;
        return decoded;
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