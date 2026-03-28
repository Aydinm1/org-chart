import type { Group } from '../airtable/types'

export type DirectoryCardType = 'person' | 'group' | 'representative-group'

export interface DirectoryCardViewModel {
  id: string
  type: DirectoryCardType
  title: string
  subtitle?: string
  badge?: string
  image?: string | null
  destinationGroupId?: string
  destinationGroupLabel?: string
  groupId?: string
  personId?: string
  email?: string
  phone?: string
  sectionName: string
  order: number | null
}

export interface DirectorySectionViewModel {
  id: string
  title: string
  cards: DirectoryCardViewModel[]
  order: number | null
}

export interface GroupPageViewModel {
  group: Group
  parentGroup: Group | null
  sections: DirectorySectionViewModel[]
}

export interface RootNavigationViewModel {
  rootGroup: Group
  cards: DirectoryCardViewModel[]
}
