import { NextResponse } from 'next/server'
import { fetchAllGroups, fetchChildGroups, fetchGroupByName } from '../../../../lib/airtable/repository'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rootGroupName = searchParams.get('name')?.trim() || 'Midwest Institutions'

  try {
    const rootGroup = await fetchGroupByName(rootGroupName)
    const allGroups = await fetchAllGroups()

    if (!rootGroup) {
      return NextResponse.json(
        {
          ok: false,
          rootGroupName,
          message: `Root group "${rootGroupName}" was not found.`,
          allGroups: allGroups.map((group) => ({
            id: group.id,
            name: group.name,
            parentGroupId: group.parentGroupId,
            groupOrder: group.groupOrder,
          })),
        },
        { status: 404 },
      )
    }

    const childGroupsViaFilter = await fetchChildGroups(rootGroup.id)
    const childGroupsViaScan = allGroups.filter((group) => group.parentGroupId === rootGroup.id)

    return NextResponse.json({
      ok: true,
      rootGroupName,
      rootGroup,
      childGroupsViaFilter: childGroupsViaFilter.map((group) => ({
        id: group.id,
        name: group.name,
        parentGroupId: group.parentGroupId,
        groupOrder: group.groupOrder,
      })),
      childGroupsViaScan: childGroupsViaScan.map((group) => ({
        id: group.id,
        name: group.name,
        parentGroupId: group.parentGroupId,
        groupOrder: group.groupOrder,
      })),
      allGroups: allGroups.map((group) => ({
        id: group.id,
        name: group.name,
        parentGroupId: group.parentGroupId,
        groupOrder: group.groupOrder,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        rootGroupName,
        message: error instanceof Error ? error.message : 'Unknown error while loading groups debug data.',
      },
      { status: 500 },
    )
  }
}
