import { NextResponse } from 'next/server'
import { requireAuthenticatedUser, requireEditorOrAdmin } from '../../../../lib/auth/server'
import { createEditableMembership, listEditableGroupOptions, listEditableMemberships } from '../../../../lib/airtable/editor'

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
    await requireAuthenticatedUser()

    const [memberships, groups] = await Promise.all([
      listEditableMemberships(),
      listEditableGroupOptions(),
    ])

    return NextResponse.json({ success: true, memberships, groups })
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

export async function POST(request: Request) {
  try {
    await requireEditorOrAdmin()

    const body = await request.json()
    const groupId = typeof body.groupId === 'string' ? body.groupId.trim() : ''
    const displaySectionId =
      typeof body.displaySectionId === 'string' ? body.displaySectionId.trim() : ''
    const role = typeof body.role === 'string' ? body.role.trim() : ''
    const personFullName =
      typeof body.personFullName === 'string' ? body.personFullName.trim() : ''
    const personEmail =
      typeof body.personEmail === 'string' ? body.personEmail.trim() : ''
    const personPhone =
      typeof body.personPhone === 'string' ? body.personPhone.trim() : ''
    const isChair = typeof body.isChair === 'boolean' ? body.isChair : false
    const order =
      body.order === null || body.order === undefined || body.order === ''
        ? null
        : typeof body.order === 'number' && Number.isFinite(body.order)
          ? body.order
          : NaN

    if (!groupId) {
      return NextResponse.json({ success: false, message: 'Group is required' }, { status: 400 })
    }

    if (!displaySectionId) {
      return NextResponse.json(
        { success: false, message: 'Display section is required' },
        { status: 400 },
      )
    }

    if (!role) {
      return NextResponse.json({ success: false, message: 'Role is required' }, { status: 400 })
    }

    if (!personFullName) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 },
      )
    }

    if (Number.isNaN(order)) {
      return NextResponse.json(
        { success: false, message: 'Order must be a number or blank' },
        { status: 400 },
      )
    }

    const membership = await createEditableMembership({
      groupId,
      displaySectionId,
      role,
      isChair,
      order,
      personFullName,
      personEmail,
      personPhone,
    })

    return NextResponse.json({ success: true, membership }, { status: 201 })
  } catch (error) {
    const authResponse = mapAuthError(error)
    if (authResponse) {
      return authResponse
    }

    console.error('Error creating membership:', error)
    return NextResponse.json(
      { success: false, message: 'Error creating membership' },
      { status: 500 },
    )
  }
}
