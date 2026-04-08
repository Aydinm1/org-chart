import {NextResponse} from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { AuthTokenPayload } from '../../../../lib/auth/types';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 401 });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;

        return NextResponse.json({ user: decoded });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ user: null }, { status: 401 });
    }
}