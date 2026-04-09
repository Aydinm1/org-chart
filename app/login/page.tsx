import {redirect} from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/server'
import LoginForm from '../../components/auth/LoginForm'

export default async function LoginPage() {
    const user = await getCurrentUser()

    if(user){
        redirect('/admin')
    }
    return <LoginForm />
}