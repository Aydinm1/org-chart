import {redirect} from 'next/navigation'
import { requireAdmin } from '../../lib/auth/server'
import { withBasePath } from '../../lib/base-path'

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
                redirect(withBasePath('/login'))
            }
            if (error.message === 'Forbidden') {
                redirect(withBasePath('/'))
            }
        }
        throw error
    }
}
