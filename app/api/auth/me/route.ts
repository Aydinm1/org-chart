import {NextResponse} from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/server';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ user: null }, { status: 401 });
    }
}