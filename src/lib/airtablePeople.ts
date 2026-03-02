import type { CardProps } from '../components/Card'

interface AirtableRecord {
  id: string
  fields?: {
    Role?: unknown
    Name?: unknown
    Title?: unknown
    Email?: unknown
    Phone?: unknown
    Group?: unknown
    Order?: unknown
    Photo?: unknown
  }
}

interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

export type GroupName = 'Central Boards' | 'Members & Portfolios' | 'Adjunct Members'
export type GroupedCard = CardProps & { group: GroupName; orderValue: number | null }

export const GROUPS: GroupName[] = ['Central Boards', 'Members & Portfolios', 'Adjunct Members']

const AIRTABLE_PAT = import.meta.env.AIRTABLE_PAC as string | undefined
const AIRTABLE_BASE_ID = import.meta.env.AIRTABLE_BASE_ID as string | undefined
const AIRTABLE_PEOPLE_TABLE = import.meta.env.AIRTABLE_PEOPLE_TABLE as string | undefined

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

const isGroupName = (value: string): value is GroupName => GROUPS.includes(value as GroupName)

const mapRecordToCard = (record: AirtableRecord): GroupedCard | null => {
  const fields = record.fields ?? {}
  const groupValue = getTextValue(fields.Group)

  if (!isGroupName(groupValue)) {
    return null
  }

  return {
    id: record.id,
    role: getTextValue(fields.Role),
    photo: getPhotoUrl(fields.Photo),
    title: getTextValue(fields.Title),
    name: getTextValue(fields.Name),
    phone: getTextValue(fields.Phone),
    email: getTextValue(fields.Email),
    orderValue: getOrderValue(fields.Order),
    group: groupValue,
  }
}

export const fetchAirtablePeopleCards = async (): Promise<GroupedCard[]> => {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID || !AIRTABLE_PEOPLE_TABLE) {
    throw new Error('Missing Airtable env vars. Check .env.example and set AIRTABLE_PAC, AIRTABLE_BASE_ID, AIRTABLE_PEOPLE_TABLE.')
  }

  const collected: GroupedCard[] = []
  let offset: string | undefined

  do {
    const params = new URLSearchParams({ pageSize: '100' })
    if (offset) {
      params.set('offset', offset)
    }

    const endpoint = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_PEOPLE_TABLE)}?${params.toString()}`
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Airtable request failed with status ${response.status}.`)
    }

    const payload = (await response.json()) as AirtableResponse
    payload.records.forEach((record) => {
      const mapped = mapRecordToCard(record)
      if (mapped) {
        collected.push(mapped)
      }
    })

    offset = payload.offset
  } while (offset)

  return collected
}

export const getCardsByGroup = (cards: GroupedCard[]): Record<GroupName, CardProps[]> => {
  return GROUPS.reduce<Record<GroupName, CardProps[]>>((accumulator, group) => {
    accumulator[group] = cards
      .filter((card) => card.group === group)
      .sort((left, right) => {
        if (left.orderValue === null && right.orderValue === null) {
          return left.name.localeCompare(right.name)
        }

        if (left.orderValue === null) {
          return 1
        }

        if (right.orderValue === null) {
          return -1
        }

        if (left.orderValue !== right.orderValue) {
          return left.orderValue - right.orderValue
        }

        return left.name.localeCompare(right.name)
      })
      .map((card) => ({
        id: card.id,
        role: card.role,
        photo: card.photo,
        title: card.title,
        name: card.name,
        phone: card.phone,
        email: card.email,
        showPhoto: Boolean(card.photo),
      }))
    return accumulator
  }, {
    'Central Boards': [],
    'Members & Portfolios': [],
    'Adjunct Members': [],
  })
}
