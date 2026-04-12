import { NextResponse } from 'next/server'
import { requireEditorOrAdmin } from '../../../../lib/auth/server'
import { listEditableMemberships } from '../../../../lib/airtable/editor'

const mapAuthError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
  }

  return null
}

export async function GET() {
  try {
    await requireEditorOrAdmin()

    const memberships = await listEditableMemberships()

    return NextResponse.json({ success: true, memberships })
  } catch (error) {
    const authResponse = mapAuthError(error)
    if (authResponse) {
      return authResponse
    }

    console.error('Error listing memberships:', error)
    return NextResponse.json(
      { success: false, message: 'Error listing memberships' },
      { status: 500 },
    )
  }
}
