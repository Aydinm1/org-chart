import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireEditorOrAdmin } from '../../../../../../lib/auth/server'
import { uploadEditablePersonPhoto } from '../../../../../../lib/airtable/editor'

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> },
) {
  try {
    await requireEditorOrAdmin()

    const { personId } = await params
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'An image file is required' },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const person = await uploadEditablePersonPhoto(personId, {
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      base64,
    })

    revalidatePath('/edit')
    revalidatePath('/')

    return NextResponse.json({ success: true, person })
  } catch (error) {
    const authResponse = mapAuthError(error)
    if (authResponse) {
      return authResponse
    }

    console.error('Error uploading person photo:', error)
    return NextResponse.json(
      { success: false, message: 'Error uploading person photo' },
      { status: 500 },
    )
  }
}
