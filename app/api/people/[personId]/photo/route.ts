import { NextResponse } from 'next/server'
import { fetchPersonById } from '../../../../../lib/airtable/repository'

export const revalidate = 300

interface PhotoRouteContext {
  params: Promise<{ personId: string }>
}

export async function GET(_request: Request, context: PhotoRouteContext) {
  const { personId } = await context.params
  const person = await fetchPersonById(personId)

  if (!person?.photo) {
    return new NextResponse('Photo not found.', {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=300',
      },
    })
  }

  return NextResponse.redirect(person.photo, {
    status: 307,
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=300',
    },
  })
}
