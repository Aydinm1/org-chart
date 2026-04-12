import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireEditorOrAdmin } from '../../../../lib/auth/server'
import { createEditablePerson, listEditablePeople } from '../../../../lib/airtable/editor'

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

    const people = await listEditablePeople()

    return NextResponse.json({ success: true, people })
  } catch (error) {
    const authResponse = mapAuthError(error)
    if (authResponse) {
      return authResponse
    }

    console.error('Error listing people:', error)
    return NextResponse.json({ success: false, message: 'Error listing people' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireEditorOrAdmin()

    const body = await request.json()
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const photo =
      body.photo === null || typeof body.photo === 'string' ? body.photo : undefined

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: 'Full name is required' },
        { status: 400 },
      )
    }

    const person = await createEditablePerson({
      fullName,
      email,
      phone,
      photo,
    })

    revalidatePath('/edit')
    revalidatePath('/')

    return NextResponse.json({ success: true, person }, { status: 201 })
  } catch (error) {
    const authResponse = mapAuthError(error)
    if (authResponse) {
      return authResponse
    }

    console.error('Error creating person:', error)
    return NextResponse.json({ success: false, message: 'Error creating person' }, { status: 500 })
  }
}
