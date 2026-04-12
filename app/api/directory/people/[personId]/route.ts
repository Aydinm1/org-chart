import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireEditorOrAdmin } from '../../../../../lib/auth/server'
import { updateEditablePerson } from '../../../../../lib/airtable/editor'

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
  { params }: { params: Promise<{ personId: string }> },
) {
  try {
    await requireEditorOrAdmin()

    const { personId } = await params
    const body = await request.json()

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : body.fullName
    const email = typeof body.email === 'string' ? body.email.trim() : body.email
    const phone = typeof body.phone === 'string' ? body.phone.trim() : body.phone
    const photo = body.photo === null || typeof body.photo === 'string' ? body.photo : body.photo

    if (
      fullName === undefined &&
      email === undefined &&
      phone === undefined &&
      photo === undefined
    ) {
      return NextResponse.json(
        { success: false, message: 'At least one field must be provided for update' },
        { status: 400 },
      )
    }

    if (fullName !== undefined && fullName === '') {
      return NextResponse.json(
        { success: false, message: 'Full name cannot be empty' },
        { status: 400 },
      )
    }

    if (email !== undefined && typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email must be a string' },
        { status: 400 },
      )
    }

    if (phone !== undefined && typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Phone must be a string' },
        { status: 400 },
      )
    }

    if (photo !== undefined && photo !== null && typeof photo !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Photo must be a string or null' },
        { status: 400 },
      )
    }

    const person = await updateEditablePerson(personId, {
      fullName,
      email,
      phone,
      photo,
    })

    revalidatePath('/edit')
    revalidatePath('/')

    return NextResponse.json({ success: true, person })
  } catch (error) {
    const authResponse = mapAuthError(error)
    if (authResponse) {
      return authResponse
    }

    console.error('Error updating person:', error)
    return NextResponse.json({ success: false, message: 'Error updating person' }, { status: 500 })
  }
}
