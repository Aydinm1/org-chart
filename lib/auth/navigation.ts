import type { UserRole } from '../db/types'

export const getPostLoginPath = (role: UserRole) => {
  if (role === 'admin') {
    return '/admin'
  }

  return '/edit'
}
