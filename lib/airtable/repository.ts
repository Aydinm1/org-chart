import {
  andFormula,
  fetchAirtableRecords,
  linkedRecordContainsFormula,
  orFormula,
  quoteFormulaValue,
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
  'Full Name'?: unknown
  Email?: unknown
  Phone?: unknown
  Photo?: unknown
}

interface DisplaySectionFields {
  'Display Section Label'?: unknown
  'Display Section'?: unknown
  'Section Name'?: unknown
  Name?: unknown
  Group?: unknown
  SectionOrder?: unknown
}

interface MembershipFields {
  'Membership Name'?: unknown
  Person?: unknown
  Group?: unknown
  Role?: unknown
  'Display Section'?: unknown
  Order?: unknown
  'Is Chair'?: unknown
}

interface UnitPlacementFields {
  'Parent Group'?: unknown
  'Child Group'?: unknown
  'Display Section'?: unknown
  Order?: unknown
  'Use Representative Card'?: unknown
}

const compareByOrderThenText = (leftOrder: number | null, rightOrder: number | null, leftText: string, rightText: string) => {
  const normalizedLeftOrder = leftOrder ?? Number.MAX_SAFE_INTEGER
  const normalizedRightOrder = rightOrder ?? Number.MAX_SAFE_INTEGER

  if (normalizedLeftOrder !== normalizedRightOrder) {
    return normalizedLeftOrder - normalizedRightOrder
  }

  return leftText.localeCompare(rightText)
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
  fullName: toText(record.fields['Full Name']),
  email: toText(record.fields.Email),
  phone: toText(record.fields.Phone),
  photo: getPhotoUrl(record.fields.Photo),
})

const mapDisplaySection = (record: { id: string; fields: DisplaySectionFields }): DisplaySection => {
  const groupIds = toLinkedRecordIds(record.fields.Group)
  const label =
    toText(record.fields['Display Section Label']) ||
    toText(record.fields['Display Section']) ||
    toText(record.fields.Name)
  const sectionName = toText(record.fields['Section Name'])

  return {
    id: record.id,
    label: label || sectionName,
    sectionName: sectionName || label,
    groupId: groupIds[0] ?? null,
    sectionOrder: toNullableNumber(record.fields.SectionOrder),
  }
}

const mapMembership = (record: { id: string; fields: MembershipFields }): Membership => {
  const personIds = toLinkedRecordIds(record.fields.Person)
  const groupIds = toLinkedRecordIds(record.fields.Group)
  const displaySectionIds = toLinkedRecordIds(record.fields['Display Section'])

  return {
    id: record.id,
    membershipName: toText(record.fields['Membership Name']),
    personId: personIds[0] ?? null,
    groupId: groupIds[0] ?? null,
    role: toText(record.fields.Role),
    displaySectionId: displaySectionIds[0] ?? null,
    order: toNullableNumber(record.fields.Order),
    isChair: toBoolean(record.fields['Is Chair']),
  }
}

const mapUnitPlacement = (record: { id: string; fields: UnitPlacementFields }): Omit<UnitPlacement, 'childGroup'> => {
  const parentGroupIds = toLinkedRecordIds(record.fields['Parent Group'])
  const childGroupIds = toLinkedRecordIds(record.fields['Child Group'])
  const displaySectionIds = toLinkedRecordIds(record.fields['Display Section'])

  return {
    id: record.id,
    parentGroupId: parentGroupIds[0] ?? null,
    childGroupId: childGroupIds[0] ?? null,
    displaySectionId: displaySectionIds[0] ?? null,
    order: toNullableNumber(record.fields.Order),
    useRepresentativeCard: toBoolean(record.fields['Use Representative Card']),
  }
}

const buildRecordIdFilter = (recordIds: string[]) => {
  const uniqueIds = [...new Set(recordIds)].filter(Boolean)

  if (uniqueIds.length === 0) {
    return ''
  }

  return orFormula(...uniqueIds.map((recordId) => recordIdFormula(recordId)))
}

export const fetchGroupById = async (groupId: string): Promise<Group | null> => {
  const records = await fetchAirtableRecords<GroupFields>(TABLES.groups, {
    filterByFormula: recordIdFormula(groupId),
  })

  return records[0] ? mapGroup(records[0]) : null
}

export const fetchGroupByName = async (groupName: string): Promise<Group | null> => {
  const records = await fetchAirtableRecords<GroupFields>(TABLES.groups, {
    filterByFormula: `{Group Name}=${quoteFormulaValue(groupName)}`,
  })

  return records[0] ? mapGroup(records[0]) : null
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

export const fetchChildGroups = async (parentGroupId: string): Promise<Group[]> => {
  const records = await fetchAirtableRecords<GroupFields>(TABLES.groups, {
    filterByFormula: linkedRecordContainsFormula('Parent Group', parentGroupId),
  })

  return records
    .map(mapGroup)
    .sort((left, right) => compareByOrderThenText(left.groupOrder, right.groupOrder, left.name, right.name))
}

export const fetchDisplaySectionsForGroup = async (groupId: string): Promise<DisplaySection[]> => {
  const records = await fetchAirtableRecords<DisplaySectionFields>(TABLES.displaySections, {
    filterByFormula: linkedRecordContainsFormula('Group', groupId),
  })

  return records
    .map(mapDisplaySection)
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

export const fetchMembershipsForGroup = async (groupId: string): Promise<MembershipWithPerson[]> => {
  const records = await fetchAirtableRecords<MembershipFields>(TABLES.memberships, {
    filterByFormula: linkedRecordContainsFormula('Group', groupId),
  })

  const memberships = records.map(mapMembership)
  const people = await fetchPeopleByIds(memberships.map((membership) => membership.personId).filter((personId): personId is string => Boolean(personId)))
  const peopleById = new Map(people.map((person) => [person.id, person]))

  return records
    .map(mapMembership)
    .map((membership) => ({
      ...membership,
      person: membership.personId ? peopleById.get(membership.personId) ?? null : null,
    }))
    .sort((left, right) =>
      compareByOrderThenText(
        left.order,
        right.order,
        left.person?.fullName || left.membershipName || left.role,
        right.person?.fullName || right.membershipName || right.role,
      ),
    )
}

export const fetchUnitPlacementsForParentGroup = async (parentGroupId: string): Promise<UnitPlacement[]> => {
  const records = await fetchAirtableRecords<UnitPlacementFields>(TABLES.unitPlacements, {
    filterByFormula: linkedRecordContainsFormula('Parent Group', parentGroupId),
  })

  const placements = records.map(mapUnitPlacement)
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
  const records = await fetchAirtableRecords<MembershipFields>(TABLES.memberships, {
    filterByFormula: andFormula(linkedRecordContainsFormula('Group', groupId), '{Is Chair}'),
  })

  const memberships = records
    .map(mapMembership)
    .sort((left, right) => compareByOrderThenText(left.order, right.order, left.membershipName || left.role, right.membershipName || right.role))
  const chairMembership = memberships[0]

  if (!chairMembership || !chairMembership.personId) {
    return chairMembership ? { ...chairMembership, person: null } : null
  }

  const people = await fetchPeopleByIds([chairMembership.personId])

  return {
    ...chairMembership,
    person: people[0] ?? null,
  }
}

export const fetchRepresentativeChairMemberships = async (groupIds: string[]): Promise<Map<string, MembershipWithPerson>> => {
  const uniqueGroupIds = [...new Set(groupIds)].filter(Boolean)
  const representativeEntries = await Promise.all(
    uniqueGroupIds.map(async (groupId) => {
      const representative = await fetchRepresentativeChairMembership(groupId)
      return representative ? ([groupId, representative] as const) : null
    }),
  )

  return new Map(representativeEntries.filter((entry): entry is readonly [string, MembershipWithPerson] => Boolean(entry)))
}
