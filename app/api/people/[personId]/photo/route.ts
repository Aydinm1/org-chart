import { unstable_noStore as noStore } from 'next/cache'
import { NextResponse } from 'next/server'
import { fetchPersonById } from '../../../../../lib/airtable/repository'

export const dynamic = 'force-dynamic'

interface PhotoRouteContext {
  params: Promise<{ personId: string }>
}

export async function GET(_request: Request, context: PhotoRouteContext) {
  noStore()

  const { personId } = await context.params
  const person = await fetchPersonById(personId, { revalidateSeconds: false })

  if (!person?.photo) {
    return new NextResponse('Photo not found.', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  }

  return NextResponse.redirect(person.photo, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
