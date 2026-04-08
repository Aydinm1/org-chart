import {NextResponse} from 'next/server'
import pool from '../../../lib/db'

export async function GET(){
    try {
        const[rows] = await pool.query("SELECT ID, name, email, role, isActive FROM users LIMIT 5")
        return NextResponse.json({
            success:true,
            rows,
        });
        
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}