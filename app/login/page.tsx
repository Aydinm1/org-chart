import {redirect} from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/server'
import { getPostLoginPath } from '../../lib/auth/navigation'
import { withBasePath } from '../../lib/base-path'
import LoginForm from '../../components/auth/LoginForm'

export default async function LoginPage() {
    const user = await getCurrentUser()

    if(user){
        redirect(withBasePath(getPostLoginPath(user.role)))
    }
    return <LoginForm />
}
