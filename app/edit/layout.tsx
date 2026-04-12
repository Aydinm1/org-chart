import {redirect} from 'next/navigation'
import { requireAuthenticatedUser } from '../../lib/auth/server'

export default async function EditLayout({
    children,
}: {
    children: React.ReactNode
}) {
    try {
        await requireAuthenticatedUser()
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
