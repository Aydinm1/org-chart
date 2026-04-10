'use client'
import { useEffect, useState } from "react"
import { UserSummary } from "../../lib/auth/types"
import { UserRole } from "../../lib/db/types"

export default function UsersTable() {
    const [users, setUsers] = useState<UserSummary[]>([])
    const [editedUsers, setEditedUsers] = useState<Record<number, Partial<UserSummary>>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)
    const getUsers = async () => {
        try {
            setLoading(true)

        const response = await fetch(`/api/admin/users`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await response.json()
        
        if (!response.ok) {
            setError(data.message || 'Failed to fetch users')
            return
        }

        setUsers(data.users)

    } catch(error) {
        console.error('Error fetching users:', error)
        setError('An unexpected error occurred while fetching users. Please try again.')    
    }
    finally {
        setLoading(false)
    }
    }

    const handleDelete = async (userId: number) => {
        setError(null)
        if (!confirm('Are you sure you want to delete this user?')) {
            return
        }
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Failed to delete user')
                return
            }
            setUsers(users.filter(user => user.id !== userId))
        } catch (error) {
            console.error('Error deleting user:', error)
            setError('An unexpected error occurred while deleting the user. Please try again.')
        }
    }

    const handleSaveAll = async () => {
        setError(null)
        setSaveMessage(null)
        const entries = Object.entries(editedUsers)

        if (entries.length === 0) {
            setSaveMessage('No changes to save')
            return
        }
        for (const [userId, changes] of entries) {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changes),
            })
            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Failed to update user')
                return
            }
           setUsers((prevUsers) => prevUsers.map((user) => editedUsers[user.id] ? { ...user, ...editedUsers[user.id]} : user))
           setEditedUsers({})
           setSaveMessage('Changes saved successfully')
        } 
    }

    const updateDraft = (userId: number, changes: Partial<UserSummary>) => {
        setEditedUsers(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                ...changes,
            }
        }))
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
                        <th className="py-2">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>}
                    {error && <tr><td colSpan={5} className="text-center py-4 text-red-500">{error}</td></tr>}
                    {!loading && !error && users.length === 0 && <tr><td colSpan={5} className="text-center py-4">No users found.</td></tr>}
                    {!loading && !error && users.map((user) => (
                        <tr key={user.id}>
                            <td className="py-2">{user.id}</td>
                            <td className="py-2">
                                 <input type="text" value={editedUsers[user.id]?.name ?? user.name} onChange={(e) => updateDraft(user.id, { name: e.target.value })} className="mt-4 p-2 border rounded w-full" />
                            </td>
                            <td className="py-2">
                                <input type="text" value={editedUsers[user.id]?.email ?? user.email} onChange={(e) => updateDraft(user.id, {email: e.target.value })} className="mt-4 p-2 border rounded w-full" />
                            </td>
                            <td className="py-2">
                                    <select value={editedUsers[user.id]?.role ?? user.role} onChange={(e) => updateDraft(user.id, {role: e.target.value as UserRole})} className="mt-4 p-2 border rounded w-full">
                                        <option value="admin">Admin</option>
                                        <option value="editor">Editor</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                            </td>
                            <td className="py-2">
                                    <input type="checkbox" checked={editedUsers[user.id]?.isActive ?? user.isActive} onChange={(e) => updateDraft(user.id, { isActive: e.target.checked})} className="mt-4" />
                            </td>
                            <td className="py-2">
                                <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onClick={() => handleDelete(user.id)}>
                                    Delete
                                </button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" onClick={() => handleSaveAll()}>
                Save Changes
            </button>
             <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">Add User</button>
             {saveMessage && <p className="text-center py-4 text-green-500">{saveMessage}</p>}


            
        </div>
    )
}