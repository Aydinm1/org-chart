const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY ?? process.env.AIRTABLE_PAC
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_API_URL = 'https://api.airtable.com/v0'
const AIRTABLE_REVALIDATE_SECONDS = 300

interface AirtableListResponse<TFields> {
  records: Array<{
    id: string
    fields: TFields
  }>
  offset?: string
}

interface FetchTableOptions {
  filterByFormula?: string
}

const assertEnv = () => {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable credentials. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.')
  }
}

export const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

export const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim())
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export const toBoolean = (value: unknown): boolean => {
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

export const toLinkedRecordIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
}

export const quoteFormulaValue = (value: string): string => `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`

export const recordIdFormula = (recordId: string) => `RECORD_ID()=${quoteFormulaValue(recordId)}`

export const andFormula = (...parts: Array<string | null | undefined>) => {
  const filtered = parts.filter(Boolean)
  if (filtered.length === 0) {
    return ''
  }

  if (filtered.length === 1) {
    return filtered[0] ?? ''
  }

  return `AND(${filtered.join(',')})`
}

export const orFormula = (...parts: Array<string | null | undefined>) => {
  const filtered = parts.filter(Boolean)
  if (filtered.length === 0) {
    return ''
  }

  if (filtered.length === 1) {
    return filtered[0] ?? ''
  }

  return `OR(${filtered.join(',')})`
}

export const linkedRecordContainsFormula = (fieldName: string, recordId: string) => {
  const safeFieldName = `{${fieldName}}`
  const delimiter = '","'
  // Airtable returns linked fields as arrays. Wrapping the joined value in quotes
  // lets us match one exact record id without partial-id collisions.
  const joinedValues = `ARRAYJOIN(${safeFieldName}, ${quoteFormulaValue(delimiter)})`
  return `FIND(${quoteFormulaValue(`"${recordId}"`)}, '"' & ${joinedValues} & '"')`
}

export const fetchAirtableRecords = async <TFields>(
  tableName: string,
  options: FetchTableOptions = {},
): Promise<Array<{ id: string; fields: TFields }>> => {
  assertEnv()

  const collected: Array<{ id: string; fields: TFields }> = []
  let offset: string | undefined

  do {
    const params = new URLSearchParams({
      pageSize: '100',
    })

    if (options.filterByFormula) {
      params.set('filterByFormula', options.filterByFormula)
    }

    if (offset) {
      params.set('offset', offset)
    }

    const endpoint = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?${params.toString()}`
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
      next: {
        revalidate: AIRTABLE_REVALIDATE_SECONDS,
      },
    })

    if (!response.ok) {
      throw new Error(`Airtable request for "${tableName}" failed with status ${response.status}.`)
    }

    const payload = (await response.json()) as AirtableListResponse<TFields>
    collected.push(...payload.records)
    offset = payload.offset
  } while (offset)

  return collected
}
