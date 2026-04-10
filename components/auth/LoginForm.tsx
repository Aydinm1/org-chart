'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            const data = await response.json()

            if(!response.ok){
                setError(data.message || 'Login failed')
                return
            }
            router.replace('/admin')
            router.refresh()
        }
        catch (error) {
            console.error('Login error:', error)
            setError('An unexpected error occurred. Please try again.')
        }
        finally {
            setIsSubmitting(false)
        }

    }
    return (
        <form onSubmit={handleLogin} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <p className="text-center text-gray-600 mb-4">Login to access the admin dashboard</p>
            <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} className= "w-full mb-4 px-3 py-2 border rounded" required />
            <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className= "w-full mb-4 px-3 py-2 border rounded" required />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-blue-500 py-2 text-white hover:bg-blue-600 transition-colors">
                {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
        </form>

    )
}
