'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleLogout = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch ('/api/auth/logout',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
              const data = await response.json()

              if(!response.ok){
                setError(data.message || 'Logout failed')
                return
              }

              router.replace('/login')
              router.refresh()

        } catch(error){
            console.error('Logout error:', error)
            setError('An unexpected error occurred. Please try again.')
        }
        finally {
            setIsSubmitting(false)
        }
            
    }

    return (
        <div className="flex flex-col items-center">
        <button onClick={handleLogout} disabled={isSubmitting} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            {isSubmitting ? 'Logging out...' : 'Logout'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    )
}
