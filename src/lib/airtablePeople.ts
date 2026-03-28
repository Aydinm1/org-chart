import type { CardProps } from '../components/Card'

interface AirtableRecord {
  id: string
  fields?: {
    [key: string]: unknown
    Name?: unknown
    Role?: unknown
    Title?: unknown
    Email?: unknown
    Phone?: unknown
    Photo?: unknown
    PersonOrder?: unknown
    Groups?: unknown
    Subgroups?: unknown
    GroupName?: unknown
    ['Group Name']?: unknown
    Description?: unknown
    ['Parent Group']?: unknown
    People?: unknown
    GroupOrder?: unknown
    GroupSubGroup?: unknown
    GroupSubGroups?: unknown
  }
}

interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

export interface PersonRecord extends CardProps {
  id: string
  personOrder: number | null
  groupIds: string[]
  subgroupIds: string[]
}

export interface GroupRecord {
  id: string
  groupName: string
  description: string
  parentGroupId: string | null
  peopleIds: string[]
  groupOrder: number | null
  groupSubgroupIds: string[]
}

export interface OrgGraph {
  peopleById: Map<string, PersonRecord>
  groupsById: Map<string, GroupRecord>
  childrenByParentId: Map<string, GroupRecord[]>
  peopleIdsByGroupId: Map<string, string[]>
}

export interface OrgData {
  graph: OrgGraph
  rootGroupId: string
}

export interface OrgSection {
  key: string
  title: string
  description?: string
  cards: CardProps[]
}

const ROOT_PARENT_KEY = '__root__'

const legacyEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env

const AIRTABLE_PAT = legacyEnv?.AIRTABLE_PAC
const AIRTABLE_BASE_ID = legacyEnv?.AIRTABLE_BASE_ID
const AIRTABLE_PEOPLE_TABLE = legacyEnv?.AIRTABLE_PEOPLE_TABLE
const AIRTABLE_GROUPS_TABLE = legacyEnv?.AIRTABLE_GROUPS_TABLE

const getTextValue = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const getPhotoUrl = (value: unknown): string | undefined => {
  if (!Array.isArray(value)) {
    return undefined
  }

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const maybeUrl = Reflect.get(item, 'url')
    if (typeof maybeUrl === 'string' && maybeUrl.trim()) {
      return maybeUrl.trim()
    }
  }

  return undefined
}

const getOrderValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const getLinkedRecordIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

const compareStrings = (left: string, right: string) => left.localeCompare(right)

const comparePeople = (left: PersonRecord, right: PersonRecord) => {
  if (left.personOrder === null && right.personOrder === null) {
    return compareStrings(left.name, right.name)
  }

  if (left.personOrder === null) {
    return 1
  }

  if (right.personOrder === null) {
    return -1
  }

  if (left.personOrder !== right.personOrder) {
    return left.personOrder - right.personOrder
  }

  return compareStrings(left.name, right.name)
}

const compareGroups = (left: GroupRecord, right: GroupRecord) => {
  if (left.groupOrder === null && right.groupOrder === null) {
    return compareStrings(left.groupName, right.groupName)
  }

  if (left.groupOrder === null) {
    return 1
  }

  if (right.groupOrder === null) {
    return -1
  }

  if (left.groupOrder !== right.groupOrder) {
    return left.groupOrder - right.groupOrder
  }

  return compareStrings(left.groupName, right.groupName)
}

const mapPeopleRecord = (record: AirtableRecord): PersonRecord => {
  const fields = record.fields ?? {}

  return {
    id: record.id,
    role: getTextValue(fields.Role),
    photo: getPhotoUrl(fields.Photo),
    title: getTextValue(fields.Title),
    name: getTextValue(fields.Name),
    phone: getTextValue(fields.Phone),
    email: getTextValue(fields.Email),
    personOrder: getOrderValue(fields.PersonOrder),
    groupIds: getLinkedRecordIds(fields.Groups),
    subgroupIds: getLinkedRecordIds(fields.Subgroups),
  }
}

const mapGroupRecord = (record: AirtableRecord): GroupRecord => {
  const fields = record.fields ?? {}
  const parentGroupIds = getLinkedRecordIds(fields['Parent Group'])
  const groupName = getTextValue(fields.GroupName) || getTextValue(fields['Group Name']) || getTextValue(fields.Name)
  const groupSubgroupIds = getLinkedRecordIds(fields.GroupSubGroup).length > 0
    ? getLinkedRecordIds(fields.GroupSubGroup)
    : getLinkedRecordIds(fields.GroupSubGroups)

  return {
    id: record.id,
    groupName,
    description: getTextValue(fields.Description),
    parentGroupId: parentGroupIds[0] ?? null,
    peopleIds: getLinkedRecordIds(fields.People),
    groupOrder: getOrderValue(fields.GroupOrder),
    groupSubgroupIds,
  }
}

const fetchAirtableTableRecords = async (tableName: string): Promise<AirtableRecord[]> => {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable env vars. Set AIRTABLE_PAC and AIRTABLE_BASE_ID.')
  }

  const collected: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const params = new URLSearchParams({ pageSize: '100' })
    if (offset) {
      params.set('offset', offset)
    }

    const endpoint = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?${params.toString()}`
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Airtable request for "${tableName}" failed with status ${response.status}.`)
    }

    const payload = (await response.json()) as AirtableResponse
    payload.records.forEach((record) => {
      collected.push(record)
    })
    offset = payload.offset
  } while (offset)

  return collected
}

const buildPeopleIdsByGroupId = (
  groups: GroupRecord[],
  peopleById: Map<string, PersonRecord>,
): Map<string, string[]> => {
  const groupToPeopleIds = new Map<string, string[]>()

  groups.forEach((group) => {
    groupToPeopleIds.set(group.id, [...group.peopleIds])
  })

  peopleById.forEach((person) => {
    person.groupIds.forEach((groupId) => {
      const ids = groupToPeopleIds.get(groupId) ?? []
      if (!ids.includes(person.id)) {
        ids.push(person.id)
      }
      groupToPeopleIds.set(groupId, ids)
    })
  })

  groupToPeopleIds.forEach((personIds, groupId) => {
    const sortedIds = personIds
      .map((personId) => peopleById.get(personId))
      .filter((person): person is PersonRecord => Boolean(person))
      .sort(comparePeople)
      .map((person) => person.id)
    groupToPeopleIds.set(groupId, sortedIds)
  })

  return groupToPeopleIds
}

const buildOrgGraph = (people: PersonRecord[], groups: GroupRecord[]): OrgGraph => {
  const peopleById = new Map(people.map((person) => [person.id, person]))
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const childrenByParentId = new Map<string, GroupRecord[]>()

  groups.forEach((group) => {
    const parentKey = group.parentGroupId ?? ROOT_PARENT_KEY
    const siblings = childrenByParentId.get(parentKey) ?? []
    siblings.push(group)
    childrenByParentId.set(parentKey, siblings)
  })

  childrenByParentId.forEach((siblings, parentId) => {
    childrenByParentId.set(parentId, [...siblings].sort(compareGroups))
  })

  const peopleIdsByGroupId = buildPeopleIdsByGroupId(groups, peopleById)

  return {
    peopleById,
    groupsById,
    childrenByParentId,
    peopleIdsByGroupId,
  }
}

const getRootGroup = (graph: OrgGraph): GroupRecord | null => {
  const rootCandidates = graph.childrenByParentId.get(ROOT_PARENT_KEY) ?? []
  if (rootCandidates.length === 0) {
    return null
  }

  return [...rootCandidates].sort(compareGroups)[0] ?? null
}

const peopleToCards = (people: PersonRecord[]): CardProps[] => {
  const cardsWithPhotosCount = people.filter((person) => Boolean(person.photo)).length
  const showPhotosForGroup = cardsWithPhotosCount > people.length / 2

  return people.map((person) => ({
    id: person.id,
    role: person.role,
    photo: person.photo,
    title: person.title,
    name: person.name,
    phone: person.phone,
    email: person.email,
    showPhoto: showPhotosForGroup,
    showTeamButton: person.subgroupIds.length > 0,
  }))
}

const getPeopleForGroup = (graph: OrgGraph, groupId: string): PersonRecord[] => {
  const peopleIds = graph.peopleIdsByGroupId.get(groupId) ?? []
  return peopleIds
    .map((personId) => graph.peopleById.get(personId))
    .filter((person): person is PersonRecord => Boolean(person))
    .sort(comparePeople)
}

export const fetchOrgData = async (): Promise<OrgData> => {
  if (!AIRTABLE_PEOPLE_TABLE || !AIRTABLE_GROUPS_TABLE) {
    throw new Error('Missing Airtable env vars. Set AIRTABLE_PEOPLE_TABLE and AIRTABLE_GROUPS_TABLE.')
  }

  const [peopleRecords, groupRecords] = await Promise.all([
    fetchAirtableTableRecords(AIRTABLE_PEOPLE_TABLE),
    fetchAirtableTableRecords(AIRTABLE_GROUPS_TABLE),
  ])

  const people = peopleRecords.map(mapPeopleRecord)
  const groups = groupRecords.map(mapGroupRecord)
  const graph = buildOrgGraph(people, groups)
  const rootGroup = getRootGroup(graph)

  if (!rootGroup) {
    throw new Error('No root group found. Ensure at least one group has an empty Parent Group.')
  }

  return {
    graph,
    rootGroupId: rootGroup.id,
  }
}

export const buildHomeSections = (graph: OrgGraph, rootGroupId: string): OrgSection[] => {
  const childGroups = graph.childrenByParentId.get(rootGroupId) ?? []

  return childGroups.map((group) => ({
    key: group.id,
    title: group.groupName || 'Untitled Group',
    description: group.description || undefined,
    cards: peopleToCards(getPeopleForGroup(graph, group.id)),
  }))
}

export const buildSectionsFromGroupIds = (graph: OrgGraph, groupIds: string[]): OrgSection[] => {
  const uniqueIds = [...new Set(groupIds)]
  const resolvedGroups = uniqueIds
    .map((groupId) => graph.groupsById.get(groupId))
    .filter((group): group is GroupRecord => Boolean(group))
    .sort(compareGroups)

  return resolvedGroups.map((group) => ({
    key: group.id,
    title: group.groupName || 'Untitled Group',
    description: group.description || undefined,
    cards: peopleToCards(getPeopleForGroup(graph, group.id)),
  }))
}
