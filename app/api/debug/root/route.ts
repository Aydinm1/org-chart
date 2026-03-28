import { NextResponse } from 'next/server'
import { fetchChildGroups, fetchGroupByName } from '../../../../lib/airtable/repository'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rootGroupName = searchParams.get('name')?.trim() || 'Midwest Institutions'

  try {
    const rootGroup = await fetchGroupByName(rootGroupName)

    if (!rootGroup) {
      return NextResponse.json(
        {
          ok: false,
          rootGroupName,
          message: `Root group "${rootGroupName}" was not found.`,
        },
        { status: 404 },
      )
    }

    const childGroups = await fetchChildGroups(rootGroup.id)
    const initialCards = childGroups.slice(0, 4)

    return NextResponse.json({
      ok: true,
      rootGroupName,
      rootGroup,
      childGroupCount: childGroups.length,
      childGroups: childGroups.map((group) => ({
        id: group.id,
        name: group.name,
        parentGroupId: group.parentGroupId,
        groupOrder: group.groupOrder,
      })),
      initialCards: initialCards.map((group) => ({
        id: group.id,
        name: group.name,
        groupOrder: group.groupOrder,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        rootGroupName,
        message: error instanceof Error ? error.message : 'Unknown error while loading root debug data.',
      },
      { status: 500 },
    )
  }
}
