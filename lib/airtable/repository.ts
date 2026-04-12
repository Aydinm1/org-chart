import { cache } from 'react'
import {
  fetchAirtableRecords,
  orFormula,
  recordIdFormula,
  toBoolean,
  toLinkedRecordIds,
  toNullableNumber,
  toText,
} from './client'
import type { DisplaySection, Group, Membership, MembershipWithPerson, Person, UnitPlacement } from './types'

const TABLES = {
  groups: 'Groups',
  people: 'People',
  displaySections: 'Display Sections',
  memberships: 'Memberships',
  unitPlacements: 'Unit Placements',
} as const

interface GroupFields {
  'Group Name'?: unknown
  'Parent Group'?: unknown
  GroupOrder?: unknown
}

interface PersonFields {
  Name?: unknown
  'Full Name'?: unknown
  Email?: unknown
  Phone?: unknown
  Photo?: unknown
}

interface DisplaySectionFields {
  'Display Section Label'?: unknown
  'Display Section'?: unknown
  Name?: unknown
  Group?: unknown
  Groups?: unknown
  SectionOrder?: unknown
  Order?: unknown
  'Show Title?'?: unknown
}

interface MembershipFields {
  ID?: unknown
  'Membership Name'?: unknown
  Person?: unknown
  Group?: unknown
  Role?: unknown
  'Display Section'?: unknown
  'Display Sections'?: unknown
  Order?: unknown
  'Is Chair'?: unknown
}

interface UnitPlacementFields {
  'Parent Group'?: unknown
  'Child Group'?: unknown
  'Display Section'?: unknown
  'Display Sections'?: unknown
  Order?: unknown
  'Use Representative Card'?: unknown
}

interface FetchRepositoryOptions {
  revalidateSeconds?: number | false
}

type UnitPlacementRecord = Omit<UnitPlacement, 'childGroup'>

const compareByOrderThenText = (leftOrder: number | null, rightOrder: number | null, leftText: string, rightText: string) => {
  const normalizedLeftOrder = leftOrder ?? Number.MAX_SAFE_INTEGER
  const normalizedRightOrder = rightOrder ?? Number.MAX_SAFE_INTEGER

  if (normalizedLeftOrder !== normalizedRightOrder) {
    return normalizedLeftOrder - normalizedRightOrder
  }

  return leftText.localeCompare(rightText)
}

const firstLinkedId = (...values: unknown[]) => {
  for (const value of values) {
    const ids = toLinkedRecordIds(value)
    if (ids.length > 0) {
      return ids[0]
    }
  }

  return null
}

const getPhotoUrl = (value: unknown): string | null => {
  if (!Array.isArray(value)) {
    return null
  }

  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') {
      continue
    }

    const url = Reflect.get(candidate, 'url')
    if (typeof url === 'string' && url.trim()) {
      return url.trim()
    }
  }

  return null
}

const mapGroup = (record: { id: string; fields: GroupFields }): Group => {
  const parentIds = toLinkedRecordIds(record.fields['Parent Group'])

  return {
    id: record.id,
    name: toText(record.fields['Group Name']),
    parentGroupId: parentIds[0] ?? null,
    groupOrder: toNullableNumber(record.fields.GroupOrder),
  }
}

const mapPerson = (record: { id: string; fields: PersonFields }): Person => ({
  id: record.id,
  fullName: toText(record.fields.Name) || toText(record.fields['Full Name']),
  email: toText(record.fields.Email),
  phone: toText(record.fields.Phone),
  photo: getPhotoUrl(record.fields.Photo),
})

const mapDisplaySection = (record: { id: string; fields: DisplaySectionFields }): DisplaySection => {
  const label =
    toText(record.fields['Display Section Label']) ||
    toText(record.fields['Display Section']) ||
    toText(record.fields.Name)

  return {
    id: record.id,
    label,
    sectionName: label,
    groupId: firstLinkedId(record.fields.Group, record.fields.Groups),
    sectionOrder: toNullableNumber(record.fields.SectionOrder) ?? toNullableNumber(record.fields.Order),
    showTitle: toBoolean(record.fields['Show Title?']),
  }
}

const mapMembership = (record: { id: string; fields: MembershipFields }): Membership => {
  return {
    id: record.id,
    membershipName: toText(record.fields['Membership Name']) || toText(record.fields.ID),
    personId: firstLinkedId(record.fields.Person),
    groupId: firstLinkedId(record.fields.Group),
    role: toText(record.fields.Role),
    displaySectionId: firstLinkedId(record.fields['Display Section'], record.fields['Display Sections']),
    order: toNullableNumber(record.fields.Order),
    isChair: toBoolean(record.fields['Is Chair']),
  }
}

const mapUnitPlacement = (record: { id: string; fields: UnitPlacementFields }): Omit<UnitPlacement, 'childGroup'> => {
  return {
    id: record.id,
    parentGroupId: firstLinkedId(record.fields['Parent Group']),
    childGroupId: firstLinkedId(record.fields['Child Group']),
    displaySectionId: firstLinkedId(record.fields['Display Section'], record.fields['Display Sections']),
    order: toNullableNumber(record.fields.Order),
    useRepresentativeCard: toBoolean(record.fields['Use Representative Card']),
  }
}

const fetchMappedGroups = cache(async (): Promise<Group[]> => {
  const records = await fetchAirtableRecords<GroupFields>(TABLES.groups)
  return records.map(mapGroup)
})

const fetchMappedDisplaySections = cache(async (): Promise<DisplaySection[]> => {
  const records = await fetchAirtableRecords<DisplaySectionFields>(TABLES.displaySections)
  return records.map(mapDisplaySection)
})

const fetchMappedMemberships = cache(async (): Promise<Membership[]> => {
  const records = await fetchAirtableRecords<MembershipFields>(TABLES.memberships)
  return records.map(mapMembership)
})

const fetchMappedUnitPlacements = cache(async (): Promise<UnitPlacementRecord[]> => {
  const records = await fetchAirtableRecords<UnitPlacementFields>(TABLES.unitPlacements)
  return records.map(mapUnitPlacement)
})

const buildRecordIdFilter = (recordIds: string[]) => {
  const uniqueIds = [...new Set(recordIds)].filter(Boolean)

  if (uniqueIds.length === 0) {
    return ''
  }

  return orFormula(...uniqueIds.map((recordId) => recordIdFormula(recordId)))
}

const hydrateMembershipPeople = async (memberships: Membership[]): Promise<MembershipWithPerson[]> => {
  const people = await fetchPeopleByIds(memberships.map((membership) => membership.personId).filter((personId): personId is string => Boolean(personId)))
  const peopleById = new Map(people.map((person) => [person.id, person]))

  return memberships.map((membership) => ({
    ...membership,
    person: membership.personId ? peopleById.get(membership.personId) ?? null : null,
  }))
}

export const fetchGroupById = async (groupId: string): Promise<Group | null> => {
  const groups = await fetchMappedGroups()
  return groups.find((group) => group.id === groupId) ?? null
}

export const fetchGroupByName = async (groupName: string): Promise<Group | null> => {
  const groups = await fetchMappedGroups()
  return groups.find((group) => group.name === groupName) ?? null
}

export const fetchGroupsByIds = async (groupIds: string[]): Promise<Group[]> => {
  const filterByFormula = buildRecordIdFilter(groupIds)
  if (!filterByFormula) {
    return []
  }

  const records = await fetchAirtableRecords<GroupFields>(TABLES.groups, { filterByFormula })
  return records
    .map(mapGroup)
    .sort((left, right) => compareByOrderThenText(left.groupOrder, right.groupOrder, left.name, right.name))
}

export const fetchAllGroups = async (): Promise<Group[]> => {
  const groups = await fetchMappedGroups()

  return groups
    .slice()
    .sort((left, right) => compareByOrderThenText(left.groupOrder, right.groupOrder, left.name, right.name))
}

export const fetchChildGroups = async (parentGroupId: string): Promise<Group[]> => {
  const groups = await fetchMappedGroups()

  return groups
    .filter((group) => group.parentGroupId === parentGroupId)
    .sort((left, right) => compareByOrderThenText(left.groupOrder, right.groupOrder, left.name, right.name))
}

export const fetchDisplaySectionsForGroup = async (groupId: string): Promise<DisplaySection[]> => {
  const sections = await fetchMappedDisplaySections()

  return sections
    .filter((section) => section.groupId === groupId)
    .sort((left, right) => compareByOrderThenText(left.sectionOrder, right.sectionOrder, left.label, right.label))
}

export const fetchPeopleByIds = async (personIds: string[]): Promise<Person[]> => {
  const filterByFormula = buildRecordIdFilter(personIds)
  if (!filterByFormula) {
    return []
  }

  const records = await fetchAirtableRecords<PersonFields>(TABLES.people, { filterByFormula })
  return records.map(mapPerson)
}

export const fetchContentfulGroupIds = async (groupIds: string[]): Promise<Set<string>> => {
  const uniqueGroupIds = [...new Set(groupIds)].filter(Boolean)
  if (uniqueGroupIds.length === 0) {
    return new Set()
  }

  const requestedGroupIds = new Set(uniqueGroupIds)
  const contentfulGroupIds = new Set<string>()

  const [memberships, placements] = await Promise.all([
    fetchMappedMemberships(),
    fetchMappedUnitPlacements(),
  ])

  for (const membership of memberships) {
    if (
      membership.groupId &&
      requestedGroupIds.has(membership.groupId) &&
      membership.displaySectionId &&
      membership.personId
    ) {
      contentfulGroupIds.add(membership.groupId)
    }
  }

  for (const placement of placements) {
    if (
      placement.parentGroupId &&
      requestedGroupIds.has(placement.parentGroupId) &&
      placement.displaySectionId &&
      placement.childGroupId
    ) {
      contentfulGroupIds.add(placement.parentGroupId)
    }
  }

  return contentfulGroupIds
}

export const fetchPersonById = async (
  personId: string,
  options: FetchRepositoryOptions = {},
): Promise<Person | null> => {
  const records = await fetchAirtableRecords<PersonFields>(TABLES.people, {
    filterByFormula: recordIdFormula(personId),
    revalidateSeconds: options.revalidateSeconds,
  })

  return records[0] ? mapPerson(records[0]) : null
}

export const fetchMembershipsForGroup = async (groupId: string): Promise<MembershipWithPerson[]> => {
  const allMemberships = await fetchMappedMemberships()
  const memberships = allMemberships
    .filter((membership) => membership.groupId === groupId)
    .sort((left, right) => compareByOrderThenText(left.order, right.order, left.membershipName || left.role, right.membershipName || right.role))
  const membershipsWithPeople = await hydrateMembershipPeople(memberships)

  return membershipsWithPeople.sort((left, right) =>
    compareByOrderThenText(
      left.order,
      right.order,
      left.person?.fullName || left.membershipName || left.role,
      right.person?.fullName || right.membershipName || right.role,
    ),
  )
}

export const fetchUnitPlacementsForParentGroup = async (parentGroupId: string): Promise<UnitPlacement[]> => {
  const allPlacements = await fetchMappedUnitPlacements()
  const placements = allPlacements
    .filter((placement) => placement.parentGroupId === parentGroupId)
    .sort((left, right) => compareByOrderThenText(left.order, right.order, left.childGroupId || '', right.childGroupId || ''))
  const childGroups = await fetchGroupsByIds(
    placements.map((placement) => placement.childGroupId).filter((groupId): groupId is string => Boolean(groupId)),
  )
  const groupsById = new Map(childGroups.map((group) => [group.id, group]))

  return placements
    .map((placement) => ({
      ...placement,
      childGroup: placement.childGroupId ? groupsById.get(placement.childGroupId) ?? null : null,
    }))
    .sort((left, right) =>
      compareByOrderThenText(
        left.order,
        right.order,
        left.childGroup?.name || '',
        right.childGroup?.name || '',
      ),
    )
}

export const fetchRepresentativeChairMembership = async (groupId: string): Promise<MembershipWithPerson | null> => {
  const representatives = await fetchRepresentativeChairMemberships([groupId])
  return representatives.get(groupId) ?? null
}

export const fetchRepresentativeChairMemberships = async (groupIds: string[]): Promise<Map<string, MembershipWithPerson>> => {
  const uniqueGroupIds = [...new Set(groupIds)].filter(Boolean)
  if (uniqueGroupIds.length === 0) {
    return new Map()
  }

  const groupIdSet = new Set(uniqueGroupIds)
  const allMemberships = await fetchMappedMemberships()
  const chairMemberships = allMemberships
    .filter((membership) => {
      const { groupId } = membership
      return membership.isChair && typeof groupId === 'string' && groupIdSet.has(groupId)
    })
    .sort((left, right) => compareByOrderThenText(left.order, right.order, left.membershipName || left.role, right.membershipName || right.role))

  const firstChairByGroupId = new Map<string, Membership>()
  for (const membership of chairMemberships) {
    if (membership.groupId && !firstChairByGroupId.has(membership.groupId)) {
      firstChairByGroupId.set(membership.groupId, membership)
    }
  }

  const hydratedMemberships = await hydrateMembershipPeople([...firstChairByGroupId.values()])

  return new Map(
    hydratedMemberships
      .filter((membership): membership is MembershipWithPerson & { groupId: string } => Boolean(membership.groupId))
      .map((membership) => [membership.groupId, membership] as const),
  )
}
