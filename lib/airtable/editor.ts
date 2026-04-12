import {
  createAirtableRecord,
  fetchAirtableRecords,
  recordIdFormula,
  toText,
  updateAirtableRecord,
  uploadAirtableAttachment,
} from './client'
import { fetchGroupsByIds, fetchPeopleByIds } from './repository'
import type {
  CreateEditableMembershipInput,
  CreatePersonInput,
  EditableGroupOption,
  EditableMembership,
  Membership,
  Person,
  UpdateEditableMembershipInput,
  UpdatePersonInput,
} from './types'

const TABLES = {
  people: 'People',
  memberships: 'Memberships',
  displaySections: 'Display Sections',
  groups: 'Groups',
} as const

interface PersonFields {
  Name?: unknown
  'Full Name'?: unknown
  Email?: unknown
  Phone?: unknown
  Photo?: unknown
}

interface WritablePersonFields {
  Name?: string
  Email?: string
  Phone?: string
  Photo?: Array<{ url: string }>
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

interface WritableMembershipFields {
  'Membership Name'?: string
  Person?: string[]
  Group?: string[]
  'Display Section'?: string[]
  Role?: string
  Order?: number | null
  'Is Chair'?: boolean
}

interface GroupFields {
  'Group Name'?: unknown
}

interface DisplaySectionFields {
  'Display Section Label'?: unknown
  'Display Section'?: unknown
  Name?: unknown
  Group?: unknown
  Groups?: unknown
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

const mapPerson = (record: { id: string; fields: PersonFields }): Person => ({
  id: record.id,
  fullName: toText(record.fields.Name) || toText(record.fields['Full Name']),
  email: toText(record.fields.Email),
  phone: toText(record.fields.Phone),
  photo: getPhotoUrl(record.fields.Photo),
})

const sortPeople = (people: Person[]) =>
  [...people].sort((left, right) =>
    (left.fullName || left.email || left.id).localeCompare(right.fullName || right.email || right.id),
  )

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    return ['1', 'true', 'yes'].includes(value.trim().toLowerCase())
  }

  return false
}

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim())
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const toLinkedRecordIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
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

const mapMembership = (record: { id: string; fields: MembershipFields }): Membership => ({
  id: record.id,
  membershipName: toText(record.fields['Membership Name']) || toText(record.fields.ID),
  personId: firstLinkedId(record.fields.Person),
  groupId: firstLinkedId(record.fields.Group),
  role: toText(record.fields.Role),
  displaySectionId: firstLinkedId(record.fields['Display Section'], record.fields['Display Sections']),
  order: toNullableNumber(record.fields.Order),
  isChair: toBoolean(record.fields['Is Chair']),
})

const mapGroup = (record: { id: string; fields: GroupFields }) => ({
  id: record.id,
  name: toText(record.fields['Group Name']),
})

const mapDisplaySection = (record: { id: string; fields: DisplaySectionFields }) => ({
  id: record.id,
  name:
    toText(record.fields['Display Section Label']) ||
    toText(record.fields['Display Section']) ||
    toText(record.fields.Name),
  groupId: firstLinkedId(record.fields.Group, record.fields.Groups),
})

const sortMemberships = (memberships: EditableMembership[]) =>
  [...memberships].sort((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }

    return (left.personFullName || left.membershipName || left.role).localeCompare(
      right.personFullName || right.membershipName || right.role,
    )
  })

const normalizePhoto = (photo?: string | null) => {
  if (photo === undefined) {
    return undefined
  }

  const trimmedPhoto = photo?.trim() ?? ''
  return trimmedPhoto ? [{ url: trimmedPhoto }] : []
}

export const listEditablePeople = async (): Promise<Person[]> => {
  const records = await fetchAirtableRecords<PersonFields>(TABLES.people, {
    revalidateSeconds: false,
  })

  return sortPeople(records.map(mapPerson))
}

export const fetchEditablePersonById = async (personId: string): Promise<Person | null> => {
  const records = await fetchAirtableRecords<PersonFields>(TABLES.people, {
    filterByFormula: recordIdFormula(personId),
    revalidateSeconds: false,
  })

  return records[0] ? mapPerson(records[0]) : null
}

export const createEditablePerson = async (input: CreatePersonInput): Promise<Person> => {
  const fields: WritablePersonFields = {
    Name: input.fullName.trim(),
    Email: input.email.trim(),
    Phone: input.phone.trim(),
  }

  const normalizedPhoto = normalizePhoto(input.photo)
  if (normalizedPhoto !== undefined) {
    fields.Photo = normalizedPhoto
  }

  const record = await createAirtableRecord<WritablePersonFields>(TABLES.people, fields)

  return mapPerson(record)
}

export const updateEditablePerson = async (personId: string, input: UpdatePersonInput): Promise<Person> => {
  const fields: WritablePersonFields = {}

  if (input.fullName !== undefined) {
    fields.Name = input.fullName.trim()
  }

  if (input.email !== undefined) {
    fields.Email = input.email.trim()
  }

  if (input.phone !== undefined) {
    fields.Phone = input.phone.trim()
  }

  const normalizedPhoto = normalizePhoto(input.photo)
  if (normalizedPhoto !== undefined) {
    fields.Photo = normalizedPhoto
  }

  const record = await updateAirtableRecord<WritablePersonFields>(TABLES.people, personId, fields)

  return mapPerson(record)
}

export const uploadEditablePersonPhoto = async (personId: string, file: {
  filename: string
  contentType: string
  base64: string
}): Promise<Person> => {
  await uploadAirtableAttachment(personId, 'Photo', {
    filename: file.filename,
    contentType: file.contentType,
    file: file.base64,
  })

  const person = await fetchEditablePersonById(personId)

  if (!person) {
    throw new Error('Updated person could not be loaded after photo upload.')
  }

  return person
}

export const listEditableMemberships = async (): Promise<EditableMembership[]> => {
  const records = await fetchAirtableRecords<MembershipFields>(TABLES.memberships, {
    revalidateSeconds: false,
  })

  const memberships = records.map(mapMembership)
  const personIds = memberships
    .map((membership) => membership.personId)
    .filter((personId): personId is string => Boolean(personId))
  const groupIds = memberships
    .map((membership) => membership.groupId)
    .filter((groupId): groupId is string => Boolean(groupId))

  const [people, groups] = await Promise.all([
    fetchPeopleByIds(personIds),
    fetchGroupsByIds(groupIds),
  ])
  const peopleById = new Map(people.map((person) => [person.id, person]))
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const displaySectionRecords = await fetchAirtableRecords<DisplaySectionFields>(TABLES.displaySections, {
    revalidateSeconds: false,
  })
  const displaySectionsById = new Map(
    displaySectionRecords.map(mapDisplaySection).map((section) => [section.id, section]),
  )

  return sortMemberships(
    memberships.map((membership) => {
      const person = membership.personId ? peopleById.get(membership.personId) ?? null : null

      return {
        id: membership.id,
        membershipName: membership.membershipName,
        role: membership.role,
        isChair: membership.isChair,
        order: membership.order,
        groupId: membership.groupId,
        groupName: membership.groupId ? groupsById.get(membership.groupId)?.name ?? '' : '',
        displaySectionId: membership.displaySectionId,
        displaySectionName: membership.displaySectionId
          ? displaySectionsById.get(membership.displaySectionId)?.name ?? ''
          : '',
        personId: membership.personId,
        personFullName: person?.fullName ?? '',
        personEmail: person?.email ?? '',
        personPhone: person?.phone ?? '',
        personPhoto: person?.photo ?? null,
      }
    }),
  )
}

export const updateEditableMembership = async (
  membershipId: string,
  input: UpdateEditableMembershipInput,
): Promise<EditableMembership> => {
  const currentMemberships = await listEditableMemberships()
  const currentMembership = currentMemberships.find((membership) => membership.id === membershipId)

  if (!currentMembership) {
    throw new Error('Membership not found')
  }

  const membershipFields: WritableMembershipFields = {}
  const personFields: WritablePersonFields = {}

  if (input.role !== undefined) {
    membershipFields.Role = input.role.trim()
  }

  if (input.order !== undefined) {
    membershipFields.Order = input.order
  }

  if (input.isChair !== undefined) {
    membershipFields['Is Chair'] = input.isChair
  }

  if (input.personFullName !== undefined) {
    personFields.Name = input.personFullName.trim()
  }

  if (input.personEmail !== undefined) {
    personFields.Email = input.personEmail.trim()
  }

  if (input.personPhone !== undefined) {
    personFields.Phone = input.personPhone.trim()
  }

  if (Object.keys(membershipFields).length > 0) {
    await updateAirtableRecord<WritableMembershipFields>(TABLES.memberships, membershipId, membershipFields)
  }

  if (currentMembership.personId && Object.keys(personFields).length > 0) {
    await updateAirtableRecord<WritablePersonFields>(TABLES.people, currentMembership.personId, personFields)
  }

  const updatedMemberships = await listEditableMemberships()
  const updatedMembership = updatedMemberships.find((membership) => membership.id === membershipId)

  if (!updatedMembership) {
    throw new Error('Updated membership could not be loaded.')
  }

  return updatedMembership
}

export const listEditableGroupOptions = async (): Promise<EditableGroupOption[]> => {
  const [groupRecords, displaySectionRecords] = await Promise.all([
    fetchAirtableRecords<GroupFields>(TABLES.groups, {
      revalidateSeconds: false,
    }),
    fetchAirtableRecords<DisplaySectionFields>(TABLES.displaySections, {
      revalidateSeconds: false,
    }),
  ])

  const groups = groupRecords.map(mapGroup).sort((left, right) => left.name.localeCompare(right.name))
  const sections = displaySectionRecords.map(mapDisplaySection)

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    sections: sections
      .filter((section) => section.groupId === group.id)
      .map((section) => ({ id: section.id, name: section.name }))
      .sort((left, right) => left.name.localeCompare(right.name)),
  }))
}

export const createEditableMembership = async (
  input: CreateEditableMembershipInput,
): Promise<EditableMembership> => {
  const person = await createEditablePerson({
    fullName: input.personFullName,
    email: input.personEmail ?? '',
    phone: input.personPhone ?? '',
  })

  await createAirtableRecord<WritableMembershipFields>(TABLES.memberships, {
    'Membership Name': input.personFullName.trim(),
    Person: [person.id],
    Group: [input.groupId],
    'Display Section': [input.displaySectionId],
    Role: input.role.trim(),
    Order: input.order ?? null,
    'Is Chair': input.isChair ?? false,
  })

  const memberships = await listEditableMemberships()
  const createdMembership = memberships.find(
    (membership) =>
      membership.personId === person.id &&
      membership.groupId === input.groupId &&
      membership.displaySectionId === input.displaySectionId,
  )

  if (!createdMembership) {
    throw new Error('Created membership could not be loaded.')
  }

  return createdMembership
}
