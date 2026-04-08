'use client'
import { useState } from 'react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (event: React.SubmitEvent) => {
        event.preventDefault()
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            
            const data = await response.json()
            if(response.ok) {
                console.log('Login successful:', data)
                window.location.href = '/admin'
            } else {
                console.error('Login failed:', data)
                alert(data.error || 'Login failed')
            }

        }catch (error) {
                console.error('Login error:', error)
        }

    }

     return (
        <form className="flex h-full flex-col items-center justify-center gap-4" onSubmit={handleLogin}>
            <h1 className="text-2xl font-bold">Login Page</h1>
            <p className="text-gray-600">This is the login page. Please log in to access the admin page.</p>
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
            <button className="w-full rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600" type="submit">Login</button>
        </form>
    )
}
