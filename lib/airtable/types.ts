export interface Group {
  id: string
  name: string
  parentGroupId: string | null
  groupOrder: number | null
}

export interface Person {
  id: string
  fullName: string
  email: string
  phone: string
  photo: string | null
}

export interface DisplaySection {
  id: string
  label: string
  sectionName: string
  groupId: string | null
  sectionOrder: number | null
  showTitle: boolean
}

export interface Membership {
  id: string
  membershipName: string
  personId: string | null
  groupId: string | null
  role: string
  displaySectionId: string | null
  order: number | null
  isChair: boolean
}

export interface MembershipWithPerson extends Membership {
  person: Person | null
}

export interface UnitPlacement {
  id: string
  parentGroupId: string | null
  childGroupId: string | null
  displaySectionId: string | null
  order: number | null
  useRepresentativeCard: boolean
  childGroup: Group | null
}
