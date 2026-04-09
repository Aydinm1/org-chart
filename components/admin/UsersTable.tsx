'use client'
import { useEffect, useState } from "react"
import { UserSummary } from "../../lib/auth/types"

export default function UsersTable() {
    const [users, setUsers] = useState<UserSummary[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const getUsers = async () => {
        try {
            setLoading(true)

        const response = await fetch('/api/admin/users',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await response.json()
        setUsers(data.users)

        if (!response.ok) {
            setError(data.message || 'Failed to fetch users')
            return
        }
    } catch(error) {
        console.error('Error fetching users:', error)
        setError('An unexpected error occurred while fetching users. Please try again.')    
    }
    finally {
        setLoading(false)
    }
    }
    useEffect(() => {
        getUsers()
    }, [])

    return (
        <div>
            <h2>Users Table</h2>
            <p>This is where the users table will be displayed.</p>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2">ID</th>
                        <th className="py-2">Name</th>
                        <th className="py-2">Email</th>
                        <th className="py-2">Role</th>
                        <th className="py-2">Active</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>}
                    {error && <tr><td colSpan={5} className="text-center py-4 text-red-500">{error}</td></tr>}
                    {!loading && !error && users.length === 0 && <tr><td colSpan={5} className="text-center py-4">No users found.</td></tr>}
                    {!loading && !error && users.map((user) => (
                        <tr key={user.id}>
                            <td className="py-2">{user.id}</td>
                            <td className="py-2">{user.name}</td>
                            <td className="py-2">{user.email}</td>
                            <td className="py-2">{user.role}</td>
                            <td className="py-2">{user.isActive ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}