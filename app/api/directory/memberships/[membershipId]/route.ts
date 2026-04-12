import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireEditorOrAdmin } from '../../../../../lib/auth/server'
import { updateEditableMembership } from '../../../../../lib/airtable/editor'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  try {
    await requireEditorOrAdmin()

    const { membershipId } = await params
    const body = await request.json()

    const role = typeof body.role === 'string' ? body.role.trim() : body.role
    const personFullName =
      typeof body.personFullName === 'string' ? body.personFullName.trim() : body.personFullName
    const personEmail =
      typeof body.personEmail === 'string' ? body.personEmail.trim() : body.personEmail
    const personPhone =
      typeof body.personPhone === 'string' ? body.personPhone.trim() : body.personPhone
    const isChair = body.isChair
    const order = body.order

    if (
      role === undefined &&
      isChair === undefined &&
      order === undefined &&
      personFullName === undefined &&
      personEmail === undefined &&
      personPhone === undefined
    ) {
      return NextResponse.json(
        { success: false, message: 'At least one field must be provided for update' },
        { status: 400 },
      )
    }

    if (role !== undefined && role === '') {
      return NextResponse.json(
        { success: false, message: 'Role cannot be empty' },
        { status: 400 },
      )
    }

    if (personFullName !== undefined && personFullName === '') {
      return NextResponse.json(
        { success: false, message: 'Name cannot be empty' },
        { status: 400 },
      )
    }

    if (isChair !== undefined && typeof isChair !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isChair must be a boolean' },
        { status: 400 },
      )
    }

    if (
      order !== undefined &&
      order !== null &&
      (typeof order !== 'number' || !Number.isFinite(order))
    ) {
      return NextResponse.json(
        { success: false, message: 'Order must be a number or null' },
        { status: 400 },
      )
    }

    const membership = await updateEditableMembership(membershipId, {
      role,
      isChair,
      order,
      personFullName,
      personEmail,
      personPhone,
    })

    revalidatePath('/edit')
    revalidatePath('/')

    return NextResponse.json({ success: true, membership })
  } catch (error) {
    const authResponse = mapAuthError(error)
    if (authResponse) {
      return authResponse
    }

    console.error('Error updating membership:', error)
    return NextResponse.json(
      { success: false, message: 'Error updating membership' },
      { status: 500 },
    )
  }
}
