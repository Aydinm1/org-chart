import {redirect} from 'next/navigation'
import { requireAdmin } from '../../lib/auth/server'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    try {
        await requireAdmin()
        return <>{children}</>
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                redirect('/login')
            }
            if (error.message === 'Forbidden') {
                redirect('/')
            }
        }
        throw error
    }
}
