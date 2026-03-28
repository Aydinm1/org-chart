import test from 'node:test'
import assert from 'node:assert/strict'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY ?? process.env.AIRTABLE_PAC
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

const METADATA_URL = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`

const TABLES = {
  groups: 'Groups',
  people: 'People',
  displaySections: 'Display Sections',
  memberships: 'Memberships',
  unitPlacements: 'Unit Placements',
}

const expectedSchema = {
  [TABLES.groups]: {
    fields: [
      { name: 'Group Name', type: 'singleLineText' },
      { name: 'Parent Group', type: 'multipleRecordLinks', linkedTableName: TABLES.groups },
      { name: 'GroupOrder', type: 'number' },
    ],
  },
  [TABLES.people]: {
    fields: [
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Photo', type: 'multipleAttachments' },
    ],
    oneOfFields: [
      { name: 'Full Name', type: 'singleLineText' },
      { name: 'Name', type: 'singleLineText' },
    ],
  },
  [TABLES.displaySections]: {
    oneOfFields: [
      { name: 'Display Section Label', type: 'singleLineText' },
      { name: 'Display Section', type: 'singleLineText' },
      { name: 'Name', type: 'singleLineText' },
    ],
    fields: [
      { name: 'Group', type: 'multipleRecordLinks', linkedTableName: TABLES.groups, aliases: ['Groups'] },
      { name: 'SectionOrder', type: 'number', aliases: ['Order'] },
    ],
  },
  [TABLES.memberships]: {
    fields: [
      { name: 'Membership Name', type: 'singleLineText', aliases: ['ID'], aliasTypes: { ID: ['singleLineText', 'formula'] } },
      { name: 'Person', type: 'multipleRecordLinks', linkedTableName: TABLES.people },
      { name: 'Group', type: 'multipleRecordLinks', linkedTableName: TABLES.groups },
      { name: 'Role', type: 'singleLineText' },
      { name: 'Display Section', type: 'multipleRecordLinks', linkedTableName: TABLES.displaySections, aliases: ['Display Sections'] },
      { name: 'Order', type: 'number' },
      { name: 'Is Chair', type: 'checkbox' },
    ],
  },
  [TABLES.unitPlacements]: {
    fields: [
      { name: 'Parent Group', type: 'multipleRecordLinks', linkedTableName: TABLES.groups },
      { name: 'Child Group', type: 'multipleRecordLinks', linkedTableName: TABLES.groups },
      { name: 'Display Section', type: 'multipleRecordLinks', linkedTableName: TABLES.displaySections, aliases: ['Display Sections'] },
      { name: 'Order', type: 'number' },
      { name: 'Use Representative Card', type: 'checkbox' },
    ],
  },
}

const requireEnv = () => {
  assert.ok(AIRTABLE_API_KEY, 'Missing AIRTABLE_API_KEY (or AIRTABLE_PAC) for Airtable schema tests.')
  assert.ok(AIRTABLE_BASE_ID, 'Missing AIRTABLE_BASE_ID for Airtable schema tests.')
}

const fetchBaseMetadata = async () => {
  requireEnv()

  const response = await fetch(METADATA_URL, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  })

  if (!response.ok) {
    const details = await response.text()
    assert.fail(
      [
        `Failed to load Airtable metadata: ${response.status} ${response.statusText}.`,
        'The token needs access to the Metadata API and the base schema.',
        `Response: ${details}`,
      ].join(' '),
    )
  }

  return response.json()
}

const getTableByName = (tables, tableName) => tables.find((table) => table.name === tableName)

const getFieldByName = (table, fieldName) => table.fields.find((field) => field.name === fieldName)
const getFieldByNames = (table, fieldNames) => fieldNames.map((fieldName) => getFieldByName(table, fieldName)).find(Boolean)

test('Airtable base contains the required tables', async () => {
  const metadata = await fetchBaseMetadata()
  const tableNames = new Set(metadata.tables.map((table) => table.name))

  for (const tableName of Object.values(TABLES)) {
    assert.ok(tableNames.has(tableName), `Missing required table "${tableName}".`)
  }
})

test('Airtable schema matches required field names and types', async () => {
  const metadata = await fetchBaseMetadata()
  const tablesByName = new Map(metadata.tables.map((table) => [table.name, table]))
  const tableIdsByName = new Map(metadata.tables.map((table) => [table.name, table.id]))
  const issues = []

  for (const [tableName, definition] of Object.entries(expectedSchema)) {
    const table = tablesByName.get(tableName)
    if (!table) {
      issues.push(`Missing table "${tableName}".`)
      continue
    }

    for (const expectedField of definition.fields ?? []) {
      const candidateNames = [expectedField.name, ...(expectedField.aliases ?? [])]
      const field = getFieldByNames(table, candidateNames)
      if (!field) {
        issues.push(`Missing field "${expectedField.name}" on table "${tableName}". Accepted names: ${candidateNames.join(', ')}.`)
        continue
      }

      const acceptedTypes = field.name === expectedField.name
        ? [expectedField.type]
        : expectedField.aliasTypes?.[field.name] ?? [expectedField.type]

      if (!acceptedTypes.includes(field.type)) {
        issues.push(
          `Field "${tableName}.${expectedField.name}" should be type "${acceptedTypes.join(' or ')}", received "${field.type}".`,
        )
      }

      if (expectedField.linkedTableName) {
        const expectedLinkedTableId = tableIdsByName.get(expectedField.linkedTableName)
        if (!expectedLinkedTableId) {
          issues.push(`Missing linked target table "${expectedField.linkedTableName}".`)
          continue
        }

        if (field.options?.linkedTableId !== expectedLinkedTableId) {
          issues.push(`Field "${tableName}.${expectedField.name}" should link to "${expectedField.linkedTableName}".`)
        }
      }
    }

    if (definition.oneOfFields?.length) {
      const matchingField = definition.oneOfFields.find((candidate) => {
        const field = getFieldByName(table, candidate.name)
        return field && field.type === candidate.type
      })

      if (!matchingField) {
        issues.push(
          `Table "${tableName}" must include one of these single-line text fields: ${definition.oneOfFields
            .map((candidate) => candidate.name)
            .join(', ')}.`,
        )
      }
    }
  }

  assert.equal(
    issues.length,
    0,
    issues.length > 0 ? `Airtable schema mismatches:\n- ${issues.join('\n- ')}` : 'Airtable schema matches the expected structure.',
  )
})
