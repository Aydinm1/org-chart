import {
  fetchChildGroups,
  fetchDisplaySectionsForGroup,
  fetchGroupById,
  fetchGroupByName,
  fetchRepresentativeChairMemberships,
  fetchUnitPlacementsForParentGroup,
  fetchMembershipsForGroup,
} from '../airtable/repository'
import type { MembershipWithPerson, UnitPlacement } from '../airtable/types'
import type { DirectoryCardViewModel, DirectorySectionViewModel, GroupPageViewModel, RootNavigationViewModel } from './types'

const ROOT_GROUP_NAME = 'Midwest Institutions'

const compareCards = (left: DirectoryCardViewModel, right: DirectoryCardViewModel) => {
  const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER
  const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  return left.title.localeCompare(right.title)
}

const createPersonCard = (membership: MembershipWithPerson, sectionName: string): DirectoryCardViewModel | null => {
  if (!membership.person) {
    return null
  }

  return {
    id: `membership:${membership.id}`,
    type: 'person',
    title: membership.person.fullName || membership.membershipName || 'Unnamed Person',
    subtitle: membership.role || undefined,
    image: membership.person.photo,
    personId: membership.person.id,
    email: membership.person.email || undefined,
    phone: membership.person.phone || undefined,
    sectionName,
    order: membership.order,
  }
}

const createGroupCard = (placement: UnitPlacement, sectionName: string): DirectoryCardViewModel | null => {
  if (!placement.childGroup) {
    return null
  }

  return {
    id: `placement:${placement.id}`,
    type: 'group',
    title: placement.childGroup.name,
    destinationGroupId: placement.childGroup.id,
    destinationGroupLabel: placement.childGroup.name,
    groupId: placement.childGroup.id,
    sectionName,
    order: placement.order,
  }
}

const createRepresentativeGroupCard = (
  placement: UnitPlacement,
  sectionName: string,
  representativeMembership?: MembershipWithPerson | null,
): DirectoryCardViewModel | null => {
  if (!placement.childGroup) {
    return null
  }

  if (!placement.useRepresentativeCard) {
    return createGroupCard(placement, sectionName)
  }

  const chairMembership = representativeMembership ?? null

  if (!chairMembership?.person) {
    return createGroupCard(placement, sectionName)
  }

  return {
    id: `placement:${placement.id}:representative`,
    type: 'representative-group',
    title: chairMembership.person.fullName || placement.childGroup.name,
    subtitle: chairMembership.role || undefined,
    badge: placement.childGroup.name,
    image: chairMembership.person.photo,
    destinationGroupId: placement.childGroup.id,
    destinationGroupLabel: placement.childGroup.name,
    groupId: placement.childGroup.id,
    personId: chairMembership.person.id,
    email: chairMembership.person.email || undefined,
    phone: chairMembership.person.phone || undefined,
    sectionName,
    order: placement.order,
  }
}

const resolveGroup = async (groupIdOrName: string) => {
  if (groupIdOrName.startsWith('rec')) {
    const byId = await fetchGroupById(groupIdOrName)
    if (byId) {
      return byId
    }
  }

  const byName = await fetchGroupByName(groupIdOrName)
  if (byName) {
    return byName
  }

  return groupIdOrName.startsWith('rec') ? null : fetchGroupById(groupIdOrName)
}

const buildBackHref = (parentGroupId: string | null, grandparentGroupId: string | null) => {
  if (!parentGroupId || grandparentGroupId === null) {
    return '/'
  }

  return `/groups/${parentGroupId}`
}

export const loadRootNavigation = async (rootGroupName = ROOT_GROUP_NAME): Promise<RootNavigationViewModel> => {
  const rootGroup = await fetchGroupByName(rootGroupName)

  if (!rootGroup) {
    throw new Error(`Root group "${rootGroupName}" was not found in Airtable.`)
  }

  const childGroups = await fetchChildGroups(rootGroup.id)

  return {
    rootGroup,
    cards: childGroups.slice(0, 4).map((group) => ({
      id: `root:${group.id}`,
      type: 'group',
      title: group.name,
      destinationGroupId: group.id,
      destinationGroupLabel: group.name,
      groupId: group.id,
      sectionName: rootGroup.name,
      order: group.groupOrder,
    })),
  }
}

export const loadGroupPage = async (groupIdOrName: string): Promise<GroupPageViewModel | null> => {
  const group = await resolveGroup(groupIdOrName)

  if (!group) {
    return null
  }

  const [parentGroup, displaySections, memberships, unitPlacements] = await Promise.all([
    group.parentGroupId ? fetchGroupById(group.parentGroupId) : Promise.resolve(null),
    fetchDisplaySectionsForGroup(group.id),
    fetchMembershipsForGroup(group.id),
    fetchUnitPlacementsForParentGroup(group.id),
  ])

  const membershipsBySectionId = new Map<string, MembershipWithPerson[]>()
  for (const membership of memberships) {
    if (!membership.displaySectionId) {
      continue
    }

    const sectionMemberships = membershipsBySectionId.get(membership.displaySectionId) ?? []
    sectionMemberships.push(membership)
    membershipsBySectionId.set(membership.displaySectionId, sectionMemberships)
  }

  const placementsBySectionId = new Map<string, UnitPlacement[]>()
  for (const placement of unitPlacements) {
    if (!placement.displaySectionId) {
      continue
    }

    const sectionPlacements = placementsBySectionId.get(placement.displaySectionId) ?? []
    sectionPlacements.push(placement)
    placementsBySectionId.set(placement.displaySectionId, sectionPlacements)
  }

  const representativeMembershipsByGroupId = await fetchRepresentativeChairMemberships(
    unitPlacements
      .filter((placement) => placement.useRepresentativeCard && placement.childGroupId)
      .map((placement) => placement.childGroupId as string),
  )

  const sections: DirectorySectionViewModel[] = []

  for (const section of displaySections) {
    // A section can contain both people cards and child-group cards. They share
    // one normalized card model so the UI can render them in a single ordered grid.
    const personCards = (membershipsBySectionId.get(section.id) ?? [])
      .map((membership) => createPersonCard(membership, section.label))
      .filter((card): card is DirectoryCardViewModel => Boolean(card))

    const placementCards = (placementsBySectionId.get(section.id) ?? []).map((placement) =>
      createRepresentativeGroupCard(
        placement,
        section.label,
        placement.childGroupId ? representativeMembershipsByGroupId.get(placement.childGroupId) ?? null : null,
      ),
    )

    sections.push({
      id: section.id,
      title: section.label,
      showTitle: section.showTitle,
      order: section.sectionOrder,
      cards: [...personCards, ...placementCards.filter((card): card is DirectoryCardViewModel => Boolean(card))].sort(compareCards),
    })
  }

  return {
    group,
    parentGroup,
    backHref: buildBackHref(parentGroup?.id ?? null, parentGroup?.parentGroupId ?? null),
    backLabel: 'Back',
    sections,
  }
}

export const loadMidwestCouncilExamplePage = async () => loadGroupPage('Midwest Council')

export const loadAkebExamplePage = async () => loadGroupPage('Aga Khan Education Board (AKEB)')
