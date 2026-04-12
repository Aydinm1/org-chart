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
        <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleLogout}
          disabled={isSubmitting}
          className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-white/80 px-5 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isSubmitting ? 'Logging out...' : 'Logout'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    )
}
